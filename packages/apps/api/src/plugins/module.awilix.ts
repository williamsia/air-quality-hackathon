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

import { asFunction, Lifetime } from 'awilix';
import fp from 'fastify-plugin';

import { Cradle, diContainer, FastifyAwilixOptions, fastifyAwilixPlugin } from '@fastify/awilix';
import { DynamoDBDocumentClient, TranslateConfig } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import pkg from 'aws-xray-sdk';
import { S3Client } from '@aws-sdk/client-s3';
import { FeedService } from "../feeds/service.js";
import { TimestreamWriteClient } from '@aws-sdk/client-timestream-write';
import { LambdaClient } from '@aws-sdk/client-lambda';

const {captureAWSv3Client} = pkg;

declare module '@fastify/awilix' {
	interface Cradle {
		dynamoDBDocumentClient: DynamoDBDocumentClient;
		s3Client: S3Client;
		feedService: FeedService;
		timestreamWriteClient: TimestreamWriteClient;
		lambdaClient: LambdaClient;
	}
}

class S3ClientFactory {
	public static create(region: string): S3Client {
		const s3 = captureAWSv3Client(new S3Client({
			region
		}));
		return s3;
	}

}

class LambdaClientFactory {
	public static create(region: string): LambdaClient {
		const lambda = captureAWSv3Client(new LambdaClient({
			region
		}));
		return lambda;
	}
}


class TimestreamWriteClientFactory {
	public static create(region: string): TimestreamWriteClient {
		const timestreamWriteClient = captureAWSv3Client(new TimestreamWriteClient({
			region
		}));
		return timestreamWriteClient;
	}
}

// factories for instantiation of 3rd party objects
class DynamoDBDocumentClientFactory {
	public static create(region: string): DynamoDBDocumentClient {
		const ddb = captureAWSv3Client(new DynamoDBClient({region}));
		const marshallOptions = {
			convertEmptyValues: false,
			removeUndefinedValues: true,
			convertClassInstanceToMap: false
		};
		const unmarshallOptions = {
			wrapNumbers: false
		};
		const translateConfig: TranslateConfig = {marshallOptions, unmarshallOptions};
		const dbc = DynamoDBDocumentClient.from(ddb, translateConfig);
		return dbc;
	}
}

export default fp<FastifyAwilixOptions>(async (app): Promise<void> => {
	// first register the DI plugin
	await app.register(fastifyAwilixPlugin, {
		disposeOnClose: true,
		disposeOnResponse: false
	});

	const commonInjectionOptions = {
		lifetime: Lifetime.SINGLETON
	};

	const awsRegion = process.env['AWS_REGION'];
	// then we can register our classes with the DI container
	diContainer.register({
		dynamoDBDocumentClient: asFunction(() => DynamoDBDocumentClientFactory.create(awsRegion), {
			...commonInjectionOptions
		}),
		s3Client: asFunction(() => S3ClientFactory.create(awsRegion), {
			...commonInjectionOptions
		}),

		lambdaClient: asFunction(() => LambdaClientFactory.create(awsRegion), {
			...commonInjectionOptions
		}),

		timestreamWriteClient: asFunction(() => TimestreamWriteClientFactory.create(awsRegion), {
			...commonInjectionOptions
		}),

		feedService: asFunction((container: Cradle) => new FeedService(app.log, container.s3Client, app.config.FEED_BUCKET), {
			...commonInjectionOptions
		})
	});
});
