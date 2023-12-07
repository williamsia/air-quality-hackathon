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

import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { Cradle, diContainer, FastifyAwilixOptions, fastifyAwilixPlugin } from '@fastify/awilix';
import { AthenaClient } from '@aws-sdk/client-athena';
import { STSClient } from '@aws-sdk/client-sts';
import { DynamoDBDocumentClient, TranslateConfig } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GlueClient } from '@aws-sdk/client-glue';
import pkg from 'aws-xray-sdk';
import { S3Client } from '@aws-sdk/client-s3';
import { PricingClient } from '@aws-sdk/client-pricing';
import { OrganizationsClient } from '@aws-sdk/client-organizations';
import { FeedService } from "../feeds/service.js";

const {captureAWSv3Client} = pkg;

declare module '@fastify/awilix' {
	interface Cradle {
		cognitoIdentityProviderClient: CognitoIdentityProviderClient;
		athenaClient: AthenaClient;
		dynamoDBDocumentClient: DynamoDBDocumentClient;
		s3Client: S3Client;
		glueClient: GlueClient;
		stsClient: STSClient;
		organizationClient: OrganizationsClient;
		pricingClient: PricingClient;
		feedService: FeedService;
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

class GlueClientFactory {
	public static create(region: string): GlueClient {
		const glue = captureAWSv3Client(new GlueClient({
			region
		}));
		return glue;
	}

}

class STSClientFactory {
	public static create(region: string): STSClient {
		const sts = captureAWSv3Client(new STSClient({
			region
		}));
		return sts;
	}

}

class PricingClientFactory {
	public static create(): PricingClient {
		return captureAWSv3Client(new PricingClient({region: 'us-east-1'}));
	}
}

class OrganizationsClientFactory {
	public static create(region: string): OrganizationsClient {
		return captureAWSv3Client(new OrganizationsClient({region}));
	}
}

class CognitoIdentityProviderClientFactory {
	public static create(region: string): CognitoIdentityProviderClient {
		return new CognitoIdentityProviderClient({region});
	}
}

class AthenaClientFactory {
	public static create(region: string): AthenaClient {
		return new AthenaClient({region});
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
		cognitoIdentityProviderClient: asFunction(() => CognitoIdentityProviderClientFactory.create(app.config.AWS_REGION), {
			...commonInjectionOptions
		}),
		athenaClient: asFunction(() => AthenaClientFactory.create(awsRegion), {
			...commonInjectionOptions
		}),
		dynamoDBDocumentClient: asFunction(() => DynamoDBDocumentClientFactory.create(awsRegion), {
			...commonInjectionOptions
		}),
		s3Client: asFunction(() => S3ClientFactory.create(app.config.AWS_REGION), {
			...commonInjectionOptions
		}),
		pricingClient: asFunction(() => PricingClientFactory.create(), {
			...commonInjectionOptions
		}),
		organizationClient: asFunction(() => OrganizationsClientFactory.create(app.config.AWS_REGION), {
			...commonInjectionOptions
		}),
		glueClient: asFunction(() => GlueClientFactory.create(app.config.AWS_REGION), {
			...commonInjectionOptions
		}),
		stsClient: asFunction(() => STSClientFactory.create(app.config.AWS_REGION), {
			...commonInjectionOptions
		}),
		feedService: asFunction((container: Cradle) => new FeedService(app.log, container.s3Client, app.config.FEED_BUCKET), {
			...commonInjectionOptions
		})
	});
});
