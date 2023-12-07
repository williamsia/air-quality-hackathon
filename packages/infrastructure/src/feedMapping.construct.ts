// @ts-nocheck
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { DefinitionBody, LogLevel } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import { Architecture, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { CfnDatabase, CfnTable } from "aws-cdk-lib/aws-timestream";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { fileURLToPath } from "url";
import path from "path";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import { Effect, Policy, PolicyDocument, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { EventbridgeToStepfunctions, EventbridgeToStepfunctionsProps } from '@aws-solutions-constructs/aws-eventbridge-stepfunctions';

export interface StateMachineProperties {
	environment: string;
	sendMessageLambda: NodejsFunction;
	bucketName: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FeedMapping extends Construct {
	constructor(scope: Construct, id: string, props: StateMachineProperties) {
		super(scope, id);

		const namePrefix = `afriset-${props.environment}`;

		const feedDatabase = new CfnDatabase(this, 'SensorDatabase', {
			databaseName: namePrefix
		})

		const feedTable = new CfnTable(this, 'SensorFeeds', {
			databaseName: feedDatabase.databaseName!,
			tableName: `${namePrefix}-sensor-feeds`
		})

		feedTable.node.addDependency(feedDatabase);

		const feedMappingStateMachineLogGroup = new LogGroup(this, 'FeedMappingStateMachineLogGroup', {logGroupName: `/aws/vendedlogs/states/${namePrefix}-dataPipeline`, removalPolicy: RemovalPolicy.DESTROY});

		const feedMapping = new PythonFunction(this, 'FeedMappingFunction', {
			entry: path.join(__dirname, '../../../python/feedMapping'), // required
			runtime: Runtime.PYTHON_3_8, // required
			functionName: `${namePrefix}-feed-mapping-task`,
			handler: 'lambda_handler', // optional, defaults to 'handler',
		});

		const timeseriesLambda = new NodejsFunction(this, 'TimeseriesFunction', {
			functionName: `${namePrefix}-timeseries-task`,
			description: `Afriset API (${props.environment})`,
			entry: path.join(__dirname, '../../apps/api/src/stepFunction/timeseries.handler.ts'),
			runtime: Runtime.NODEJS_18_X,
			tracing: Tracing.ACTIVE,
			memorySize: 256,
			timeout: Duration.seconds(29),
			logRetention: RetentionDays.ONE_WEEK,
			environment: {
				NODE_ENV: props.environment,
				NOTIFICATION_LAMBDA: props.sendMessageLambda.functionName,
				TABLE_NAME: feedTable.tableName!,
				DATABASE_NAME: feedDatabase.databaseName!
			},
			bundling: {
				minify: true,
				format: OutputFormat.ESM,
				target: 'node18.16',
				sourceMap: false,
				sourcesContent: false,
				banner: 'import { createRequire } from \'module\';const require = createRequire(import.meta.url);import { fileURLToPath } from \'url\';import { dirname } from \'path\';const __filename = fileURLToPath(import.meta.url);const __dirname = dirname(__filename);',
				externalModules: ['aws-sdk']
			},
			depsLockFilePath: path.join(__dirname, '../../../common/config/rush/pnpm-lock.yaml'),
			architecture: Architecture.ARM_64
		});

		const timestreamWritePolicy = new PolicyDocument({
			statements: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						'timestream:WriteRecords'
					],
					resources: [feedTable.attrArn],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: [
						'timestream:DescribeEndpoints'
					],
					resources: ["*"],
				}),
			],
		});

		// Attach the policy to the Lambda function's execution role
		timeseriesLambda.role?.attachInlinePolicy(new Policy(this, 'TimestreamLambdaWritePolicy', {
			document: timestreamWritePolicy
		}));

		props.sendMessageLambda.grantInvoke(timeseriesLambda);

		const feedMappingTask = new LambdaInvoke(this, 'FeedMappingTask', {
			lambdaFunction: feedMapping,
			outputPath: '$.Payload'
		});

		const timeseriesTask = new LambdaInvoke(this, 'TimeSeriesTask', {
			lambdaFunction: timeseriesLambda,
			outputPath: '$.Payload'
		});

		const constructProps: EventbridgeToStepfunctionsProps = {
			stateMachineProps: {
				definitionBody: DefinitionBody.fromChainable(
					feedMappingTask.next(timeseriesTask)),
				logs: {destination: feedMappingStateMachineLogGroup, level: LogLevel.ERROR, includeExecutionData: true},
				stateMachineName: `${namePrefix}-feed-mapping`,
				tracingEnabled: true
			},
			eventRuleProps: {
				eventPattern: {
					source: ['aws.s3'],
					detailType: ['Object Created'],
					detail: {
						bucket: {
							name: [props.bucketName]
						},
						object: {
							key: [{prefix: 'feeds/input/'}]
						}
					}
				}
			}
		};

		new EventbridgeToStepfunctions(this, 'TriggerFeedMappingOnUpload', constructProps);
	}

}
