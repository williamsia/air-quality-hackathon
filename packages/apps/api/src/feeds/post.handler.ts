/*
 *  Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

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
			const url = await svc.create(request.body);
			return reply.status(200).send({url});
		}
	});

	done();
}
