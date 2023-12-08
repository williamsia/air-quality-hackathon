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

import type { FastifyInstance } from 'fastify';
import { buildLightApp } from '../app.light';
import { TimestreamWriteClient, WriteRecordsCommand, } from '@aws-sdk/client-timestream-write';
import type { AwilixContainer } from 'awilix';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fromUtf8 } from '@aws-sdk/util-utf8-node';

const app: FastifyInstance = await buildLightApp();
const di: AwilixContainer = app.diContainer;

const {DATABASE_NAME, TABLE_NAME, NOTIFICATION_LAMBDA} = process.env;

const writeClient = di.resolve<TimestreamWriteClient>('timestreamWriteClient');
const lambdaClient = di.resolve<LambdaClient>('lambdaClient');
export const handler = async (event: any, _context, _callback): Promise<void> => {
	app.log.info(`timeseries > handler > event:${JSON.stringify(event)}`);

	// TODO: add the processed records here
	const records = [];
	if (records.length > 0) {
		const params = new WriteRecordsCommand({
			DatabaseName: DATABASE_NAME,
			TableName: TABLE_NAME,
			Records: records
		});
		writeClient.send(params);
	}

	await lambdaClient.send(new InvokeCommand({InvocationType: 'RequestResponse', FunctionName: NOTIFICATION_LAMBDA, Payload: fromUtf8(JSON.stringify({message: 'Data stored to timestream'}))}))
	app.log.info(`timeseries > handler > exit >`);
};
