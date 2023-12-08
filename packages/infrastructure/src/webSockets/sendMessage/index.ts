import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const {CONNECTION_ID_PARAMETER_NAME, AWS_REGION, STAGE_NAME: stageName, API_ENDPOINT: apiEndpoint} = process.env

const ssmClient = new SSMClient({region: AWS_REGION!});
export const handler = async (event: { message: string }) => {
	const domainName = apiEndpoint!.replace('wss://', 'https://')
	const parameter = await ssmClient.send(new GetParameterCommand({Name: CONNECTION_ID_PARAMETER_NAME}));

	const apigwManagementApi = new ApiGatewayManagementApiClient({
		apiVersion: '2018-11-29',
		endpoint:
			domainName + '/' + stageName
	});

	const connectionId = parameter.Parameter?.Value!;
	const message = event.message;

	try {
		await apigwManagementApi.send(new PostToConnectionCommand({ConnectionId: connectionId, Data: message}))
	} catch (error) {
		console.error('Error sending message:', error);
	}
	return {statusCode: 200, body: 'Message sent'};
};
