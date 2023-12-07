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

import * as fs from 'fs';
import {GetParameterCommand, SSMClient} from '@aws-sdk/client-ssm';
import {AssumeRoleCommand, STSClient} from '@aws-sdk/client-sts';

const {ENVIRONMENT, AWS_REGION} = process.env;

if (!ENVIRONMENT || !AWS_REGION) {
	throw new Error(`Environment Variable ENVIRONMENT or AWS_REGION is not being specified`);
}

console.log(`ENVIRONMENT: ${ENVIRONMENT}\r\nREGION: ${AWS_REGION}`);

const stsClient = new STSClient({region: AWS_REGION});

let credentials;

if (process.env['AWS_CREDS_TARGET_ROLE']) {
	const results = await stsClient.send(new AssumeRoleCommand({
		RoleArn: process.env['AWS_CREDS_TARGET_ROLE'],
		RoleSessionName: 'generateConfigSession',
		DurationSeconds: 900
	}));
	credentials = {
		accessKeyId: results.Credentials.AccessKeyId,
		secretAccessKey: results.Credentials.SecretAccessKey,
		sessionToken: results.Credentials.SessionToken
	};
}

const ssmClient = new SSMClient({region: AWS_REGION, credentials});

const soseConfiguration = {
	'NODE_ENV': 'local'
};

const getValues = async (module, mapping) => {
	for (const key in mapping) {
		const prefix = `/afriset/${ENVIRONMENT}/${module}/`;
		const name = `${prefix}${mapping[key]}`;
		try {
			const response = await ssmClient.send(new GetParameterCommand({
				Name: name, WithDecryption: false
			}));
			soseConfiguration[key] = response.Parameter?.Value;
		} catch (e) {
			throw new Error(`Parameter ${name} NOT Found !!!`);
		}
	}
};

await Promise.all([
	getValues('shared', {
		VITE_USER_POOL_ID: 'userPoolId'
	}),
	getValues('frontend', {
		VITE_USER_POOL_CLIENT_ID: 'userPoolClientId'
	}),
	getValues('shared', {
		VITE_SCENARIO_API_BASE_URL: 'apiUrl'
	})
]);

soseConfiguration[`VITE_REGION`] = AWS_REGION;

fs.writeFileSync('.env.local', Object.entries(soseConfiguration).map(([key, value]) => `${key}=${value}`).join('\r\n'));
