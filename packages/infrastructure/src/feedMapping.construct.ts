import { RemovalPolicy } from "aws-cdk-lib";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { DefinitionBody, LogLevel, StateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { CfnDatabase, CfnTable } from "aws-cdk-lib/aws-timestream";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { fileURLToPath } from "url";
import path from "path";

export interface StateMachineProperties {
	environment: string;
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
			handler: 'lambda_handler', // optional, defaults to 'handler',
		});

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
