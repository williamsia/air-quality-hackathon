import { Duration, RemovalPolicy, Size, Stack } from 'aws-cdk-lib';
import { DockerImageCode, DockerImageFunction, Tracing } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { DefinitionBody, LogLevel, StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import path from 'path';
import { fileURLToPath } from 'url';

import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import { Policy, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam/index.js';

export interface StateMachineProperties {
	environment: string;
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
		});

		const transformerGeneratorFunction = new DockerImageFunction(this, 'TransformerGeneratorFunction', {
			code: DockerImageCode.fromImageAsset(path.join(__dirname, '../../../python/transformerGenerator')),
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

		new StateMachine(this, 'FeedMappingStateMachine', {
			definitionBody: DefinitionBody.fromChainable(
				transformerGeneratorTask),
			logs: {destination: feedMappingStateMachineLogGroup, level: LogLevel.ERROR, includeExecutionData: true},
			stateMachineName: `${namePrefix}-feed-mapping`,
			tracingEnabled: true
		});
	}


}
