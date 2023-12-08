import { Type } from '@sinclair/typebox';
import { apiVersion100, FastifyTypebox } from "../common/types.js";
import { commonHeaders, forbiddenResponse, notFoundResponse } from "../common/schemas.js";
import { feedUploadResource, newFeedResource } from "./schemas.js";
import { atLeastUser } from "../common/scopes.js";

export default function postSensorFeedRoute(fastify: FastifyTypebox, _options: unknown, done: () => void): void {
	fastify.route({
		method: 'POST',
		url: '/feeds',

		schema: {
			description: `Obtains a pre-signed S3 url to upload feed data.`,
			tags: ['Feeds'],
			operationId: 'create',
			headers: commonHeaders,
			body: {
				...Type.Ref(newFeedResource),
				'x-examples': {
					Upload: {
						summary: 'Obtains a pre-signed url for download.',
						value: {
							dataRow: 1,
							expiration: 300,
						},
					},
				},
			},
			response: {
				201: {
					description: 'Success.',
					...Type.Ref(feedUploadResource),
					'x-examples': {
						Download: {
							summary: 'A pre-signed url to download items for a service of a scenario.',
							value: {
								url: 'https://s3.us-east-1.amazonaws.com/abc/xyz/baseline.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256...',
							},
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
			const svc = fastify.diContainer.resolve('feedService');
			const feed = await svc.create(request.body);
			return reply.status(200).send({feedId: feed.feedId, url: feed.url});
		}
	});

	done();
}
