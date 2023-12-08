import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { fileURLToPath } from "url";
import path, { join } from "path";
import * as apigw2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Stack } from "aws-cdk-lib";
import { WebSocketApi } from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

interface NotificationProps {
	environment: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const afrisetWebSocketApiUrlParameter = (environment: string) => `/afriset/${environment}/shared/webSocketApiUrl`;
export const connectionIdParameterName = (environment: string) => `/afriset/${environment}/shared/connectionId`;

export class Notification extends Construct {
	public sendMessageLambda: NodejsFunction;

	constructor(scope: Construct, id: string, props: NotificationProps) {
		super(scope, id);

		const namePrefix = `afriset-${props.environment}-ws`;

		const connectionIdParameter = new StringParameter(this, 'ConnectionIdParameter', {
			stringValue: 'NONE',
			parameterName: connectionIdParameterName(props.environment)
		})

		const wsConnectLambda = new NodejsFunction(this, 'WSConnectLambda', {
			entry: join(__dirname, './webSockets/connect/index.ts'),
			handler: 'handler',
			functionName: `${namePrefix}-connect-lambda`,
			runtime: Runtime.NODEJS_18_X,
			depsLockFilePath: path.join(__dirname, '../../../common/config/rush/pnpm-lock.yaml'),
			environment: {
				CONNECTION_ID_PARAMETER_NAME: connectionIdParameter.parameterName
			}
		});

		connectionIdParameter.grantRead(wsConnectLambda);
		connectionIdParameter.grantWrite(wsConnectLambda);

		const wsDisconnectLambda = new NodejsFunction(this, 'WSDisconnectLambda', {
			entry: join(__dirname, './webSockets/disconnect/index.ts'),
			handler: 'handler',
			functionName: `${namePrefix}-disconnect-lambda`,
			runtime: Runtime.NODEJS_18_X,
			depsLockFilePath: path.join(__dirname, '../../../common/config/rush/pnpm-lock.yaml'),
		});

		const webSocketApi = new WebSocketApi(this, 'WebSocketApi',
			{
				apiName: `${namePrefix}-api`,
				description: `AfriSet WebSocket API (${props.environment})`,
				connectRouteOptions: {
					integration: new WebSocketLambdaIntegration(
						'WSConnectIntegration',
						wsConnectLambda
					),
				},
				disconnectRouteOptions: {
					integration: new WebSocketLambdaIntegration(
						'WSDisconnectIntegration',
						wsDisconnectLambda
					),
				},
			}
		);

		const apiStage = new apigw2.WebSocketStage(this, 'dev', {
			webSocketApi,
			stageName: 'dev',
			autoDeploy: true,
		});

		new StringParameter(this, 'WebSocketApiParameter', {
			parameterName: afrisetWebSocketApiUrlParameter(props.environment),
			stringValue: apiStage.url
		})

		this.sendMessageLambda = new NodejsFunction(this, 'SendMessageLambda', {
			entry: join(__dirname, './webSockets/sendMessage/index.ts'),
			runtime: Runtime.NODEJS_18_X,
			functionName: `${namePrefix}-send-message`,
			handler: 'handler',
			depsLockFilePath: path.join(__dirname, '../../../common/config/rush/pnpm-lock.yaml'),
			environment: {
				STAGE_NAME: apiStage.stageName,
				API_ENDPOINT: webSocketApi.apiEndpoint,
				CONNECTION_ID_PARAMETER_NAME: connectionIdParameter.parameterName
			}
		});

		connectionIdParameter.grantRead(this.sendMessageLambda);

		const stack = Stack.of(scope);

		const connectionsArns = stack.formatArn({
			service: 'execute-api',
			resourceName: `${apiStage.stageName}/POST/*`,
			resource: webSocketApi.apiId,
		});

		this.sendMessageLambda.addToRolePolicy(
			new PolicyStatement({
				actions: ['execute-api:ManageConnections'],
				resources: [connectionsArns],
			})
		);
	}

}

