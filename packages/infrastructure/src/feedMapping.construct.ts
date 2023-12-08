
import { Duration, RemovalPolicy, Size, Stack } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Effect, Policy, PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
    Architecture, DockerImageCode, DockerImageFunction, Runtime, Tracing
} from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { DefinitionBody, LogLevel } from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { CfnDatabase, CfnTable } from 'aws-cdk-lib/aws-timestream';
import { Construct } from 'constructs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
    EventbridgeToStepfunctions, EventbridgeToStepfunctionsProps
} from '@aws-solutions-constructs/aws-eventbridge-stepfunctions';

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

		const accountId = Stack.of(this).account;
		const region = Stack.of(this).region;
		const namePrefix = `afriset-${props.environment}`;

		const holdingBucket = new Bucket(this, 'afrisetScenarioHoldingBucket', {
			bucketName: `${namePrefix}-${accountId}-${region}-afriset-holding`,
			publicReadAccess: false,
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			removalPolicy: RemovalPolicy.DESTROY,
			autoDeleteObjects: true
		});

		const feedMappingStateMachineLogGroup = new LogGroup(this, 'FeedMappingStateMachineLogGroup', {logGroupName: `/aws/vendedlogs/states/${namePrefix}-dataPipeline`, removalPolicy: RemovalPolicy.DESTROY});

		const transformerGeneratorPolicy = new Policy(this, 'TransformerGeneratorPolicy', {
			statements: [
				new PolicyStatement({
					sid: 'bedrock',
					actions: ['bedrock:InvokeModel'],
					resources: [
						`arn:aws:bedrock:${region}::foundation-model/amazon.titan-embed-text-v1`,
						`arn:aws:bedrock:${region}::foundation-model/anthropic.claude-v2:1`
					],
				})
			]
		})

		const transformerGeneratorRepo = Repository.fromRepositoryName(this, 'TransformerGeneratorRepo', 'afri-set-transformer');

		const transformerGeneratorFunction = new DockerImageFunction(this, 'TransformerGeneratorFunction', {
			functionName: `${namePrefix}-transformer-generator`,
			description: `Afriset Transformer Generator (${props.environment})`,
			code: DockerImageCode.fromEcr(transformerGeneratorRepo, {
			  tagOrDigest: "latest",
			}),
			environment: {
				'NLTK_DATA': '/tmp'
			},
			ephemeralStorageSize: Size.gibibytes(5),
			memorySize: 1024,
			tracing: Tracing.ACTIVE,
			timeout: Duration.minutes(2),
			logRetention: RetentionDays.ONE_WEEK,
		});
		transformerGeneratorFunction.role?.attachInlinePolicy(transformerGeneratorPolicy);

		holdingBucket.grantReadWrite(transformerGeneratorFunction);

		const transformerGeneratorTask = new LambdaInvoke(this, 'TransformerGeneratorInvoke', {
			lambdaFunction: transformerGeneratorFunction,
			outputPath: '$.Payload'
		});

		const feedDatabase = new CfnDatabase(this, 'SensorDatabase', {
			databaseName: namePrefix
		})

		const feedTable = new CfnTable(this, 'SensorFeeds', {
			databaseName: feedDatabase.databaseName!,
			tableName: `${namePrefix}-sensor-feeds`
		})

		feedTable.node.addDependency(feedDatabase);

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

		const timeseriesTask = new LambdaInvoke(this, 'TimeSeriesTask', {
			lambdaFunction: timeseriesLambda,
			outputPath: '$.Payload'
		});

		const constructProps: EventbridgeToStepfunctionsProps = {
			stateMachineProps: {
				definitionBody: DefinitionBody.fromChainable(
					transformerGeneratorTask.next(timeseriesTask)),
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
