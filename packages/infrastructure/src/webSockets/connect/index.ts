import type { APIGatewayProxyEvent } from 'aws-lambda';
import { PutParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const {CONNECTION_ID_PARAMETER_NAME, AWS_REGION} = process.env
const ssmClient = new SSMClient({region: AWS_REGION!});
export const handler = async (event: APIGatewayProxyEvent) => {
	const connectionId = event.requestContext.connectionId;
	await ssmClient.send(new PutParameterCommand({Name: CONNECTION_ID_PARAMETER_NAME!, Value: connectionId, Overwrite: true}))
	return {statusCode: 200, body: 'Connected.'};
};
