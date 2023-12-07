import { RemovalPolicy } from "aws-cdk-lib";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { DefinitionBody, LogLevel, StateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import { DockerImageFunction, DockerImageCode  } from "aws-cdk-lib/aws-lambda";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { fileURLToPath } from "url";
import path from "path";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import * as cdk from 'aws-cdk-lib';

export interface StateMachineProperties {
	environment: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FeedMapping extends Construct {
	constructor(scope: Construct, id: string, props: StateMachineProperties) {
		super(scope, id);

		const accountId = cdk.Stack.of(this).account;
		const region = cdk.Stack.of(this).region;
		const namePrefix = `afriset-${props.environment}`;

		const holdingBucket = new Bucket(this, 'afrisetScenarioHoldingBucket', {
			bucketName: `${namePrefix}-${accountId}-${region}-afriset-holding`,
			publicReadAccess: false,
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true
		});

		const feedMappingStateMachineLogGroup = new LogGroup(this, 'FeedMappingStateMachineLogGroup', {logGroupName: `/aws/vendedlogs/states/${namePrefix}-dataPipeline`, removalPolicy: RemovalPolicy.DESTROY});

		// const feedMapping = new PythonFunction(this, 'FeedMappingFunction', {
		// 	entry: path.join(__dirname, '../../../python/feedMapping'),
		// 	runtime: Runtime.PYTHON_3_10,
		// 	handler: 'app.lambda_handler',
		// });

		const feedMapping = new DockerImageFunction(this, 'AssetFunction', {
			code: DockerImageCode.fromImageAsset(path.join(__dirname, '../../../python/transformer')),
		  });

		holdingBucket.grantReadWrite(feedMapping);

		const feedMappingTask = new LambdaInvoke(this, 'FeedMapping', {
			lambdaFunction: feedMapping,
			outputPath: '$.Payload'
		});

		new StateMachine(this, 'FeedMappingStateMachine', {
			definitionBody: DefinitionBody.fromChainable(
				feedMappingTask),
			logs: {destination: feedMappingStateMachineLogGroup, level: LogLevel.ERROR, includeExecutionData: true},
			stateMachineName: `${namePrefix}-feed-mapping`,
			tracingEnabled: true
		});
	}


}
