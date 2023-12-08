import { Duration, RemovalPolicy, Size, Stack } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Effect, Policy, PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
    DockerImageCode, DockerImageFunction, Runtime, Tracing
} from 'aws-cdk-lib/aws-lambda';
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
import type { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';

export interface StateMachineProperties {
	environment: string;
	sendMessageLambda: NodejsFunction;
	bucketName: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FeedMapping extends Construct {
	readonly timestreamDatabaseName: string;
	readonly timestreamTableName: string;

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
				NLTK_DATA: '/tmp',
				NOTIFICATION_LAMBDA: props.sendMessageLambda.functionName,
			},
			ephemeralStorageSize: Size.gibibytes(5),
			memorySize: 1024,
			tracing: Tracing.ACTIVE,
			timeout: Duration.minutes(5),
			logRetention: RetentionDays.ONE_WEEK,
		});
		transformerGeneratorFunction.role?.attachInlinePolicy(transformerGeneratorPolicy);
		props.sendMessageLambda.grantInvoke(transformerGeneratorFunction);

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
			tableName: `${namePrefix}-sensor-feeds`,
			schema: {
				compositePartitionKey: [
					{
						enforcementInRecord: 'REQUIRED',
						name: 'id',
						type: 'DIMENSION'
					}
				],
			},
			magneticStoreWriteProperties: {
				EnableMagneticStoreWrites: true,
				MagneticStoreRejectedDataLocation: {
					S3Configuration: {
						BucketName: props.bucketName,
						EncryptionOption: 'SSE_S3',
						ObjectKeyPrefix: 'timestream/rejections'
					}
				}
			},
			retentionProperties: {
				MemoryStoreRetentionPeriodInHours: 8766,
				MagneticStoreRetentionPeriodInDays: 1
			}

		})

		feedTable.node.addDependency(feedDatabase);

		this.timestreamDatabaseName = namePrefix;
		this.timestreamTableName = `${namePrefix}-sensor-feeds`;

		const dynamicTransformerLambda = new PythonFunction(this, 'DynamicTransformerFunction', {
			entry: path.join(__dirname, '../../../python/dynamicTransformer'), // required
			runtime: Runtime.PYTHON_3_8, // required
			functionName: `${namePrefix}-dynamic-transformer-task`,
			index: 'app.py',
			handler: 'lambda_handler', // optional, defaults to 'handler',
			environment: {
				NODE_ENV: props.environment,
				NOTIFICATION_FUNCTION_NAME: props.sendMessageLambda.functionName,
				TABLE_NAME: feedTable.tableName!,
				DATABASE_NAME: feedDatabase.databaseName!
			}
		})

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
		dynamicTransformerLambda.role?.attachInlinePolicy(new Policy(this, 'TimestreamLambdaWritePolicy', {
			document: timestreamWritePolicy
		}));

		props.sendMessageLambda.grantInvoke(dynamicTransformerLambda);


		const dynamicTransformerTask = new LambdaInvoke(this, 'DynamicTransformerTask', {
			lambdaFunction: dynamicTransformerLambda,
			outputPath: '$.Payload'
		});

		const constructProps: EventbridgeToStepfunctionsProps = {
			stateMachineProps: {
				definitionBody: DefinitionBody.fromChainable(
					transformerGeneratorTask.next(dynamicTransformerTask)),

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
