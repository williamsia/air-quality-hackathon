import { Type } from '@sinclair/typebox';
import { apiVersion100, FastifyTypebox } from "../common/types.js";
import { commonHeaders, forbiddenResponse, notFoundResponse, countPaginationQS, fromTokenPaginationQS } from "../common/schemas.js";
import { MeasurementsList, feedIdQS, sensorIdQS, dateFromQS, dateToQS, downloadQS, measurementsResponse } from "./schemas.js";
import { measurementListExample } from "./examples.js";
import { atLeastUser } from "../common/scopes.js";

export default function listMeasurementsRoute(fastify: FastifyTypebox, _options: unknown, done: () => void): void {
	fastify.route({
		method: 'GET',
		url: '/measurements',

		schema: {
			description: `Lists sensor measurements.`,
			tags: ['Measurements'],
			operationId: 'list',
			headers: commonHeaders,
			querystring: Type.Object({
				feedId: feedIdQS,
				sensorId: sensorIdQS,
				dateFrom: dateFromQS,
				dateTo: dateToQS,
				download: downloadQS,
				count: countPaginationQS,
				fromToken: fromTokenPaginationQS,
			}),
			response: {
				200: {
					description: 'Success.',
					...Type.Ref(measurementsResponse),
					'x-examples': {
						'List of measurements': {
							summary: 'Paginated list of sensor measurements',
							value: measurementListExample(),
						},
					},
				},
				403: forbiddenResponse,
				404: notFoundResponse,
			},
			'x-security-scopes': atLeastUser,
		},
		constraints: {
			version: apiVersion100,
		},


		handler: async (request, reply) => {
			const svc = fastify.diContainer.resolve('measurementsService');
			const { feedId, sensorId, dateFrom, dateTo, download } = request.query;

			if (download) {
				const url = await svc.download(feedId);
				const response = { url };
				await reply.status(200).send(response);	
			} else {
				const measurements = await svc.list(feedId, sensorId, dateFrom, dateTo);
				this.log.debug(measurements);
				const response: MeasurementsList = { measurements: [] };
	
				// if (count || lastEvaluatedToken) {
				// 	response.pagination = {};
				// 	if (lastEvaluatedToken) {
				// 		response.pagination.lastEvaluatedToken = lastEvaluatedToken.paginationToken;
				// 	}
				// }
				await reply.status(200).send(response);
			}
		}
	});

	done();
}
