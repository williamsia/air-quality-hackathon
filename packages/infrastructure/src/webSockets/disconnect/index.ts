import type { APIGatewayProxyEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent) => {
	const connectionId = event.requestContext.connectionId;
	console.log('Disconnected:', connectionId);
	return {statusCode: 200, body: 'Disconnected.'};
};
