#!/usr/bin/env node

import { Auth } from '@aws-amplify/auth';

if (require.main === module) {
	const [username, password, newPassword] = process.argv.slice(2);

	if (process.argv.length < 4) {
		throw new Error('Missing arguments\r\nHow to run the command: \r\n> npm run generate:token -- <environment> <username> <password> ');
	}
	(async () => {
		process.env.COGNITO_CLIENT_ID = '3b64nic510gt297a3j3p3uo3g2';
		process.env.COGNITO_USER_POOL_ID = 'us-west-2_1dI0trEcP';
		const token = await authorizeUser(username, password, newPassword);
		console.log(`token: ${token}`);
	})().catch((e) => console.log(e));
}


export async function authorizeUser(username: string, password: string, newPassword?: string, sharedTenantId?: string): Promise<string> {
	let userPoolId = process.env.COGNITO_USER_POOL_ID;
	let clientId = process.env.COGNITO_CLIENT_ID;

	Auth.configure({
		aws_user_pools_id: userPoolId,
		aws_user_pools_web_client_id: clientId,
		authenticationFlowType: 'USER_SRP_AUTH',
	});

	if (!process.env.COGNITO_CLIENT_ID) {
		console.error('COGNITO_CLIENT_ID not defined');
        process.exit(-1);
	}
	if (!process.env.COGNITO_USER_POOL_ID) {
        console.error('COGNITO_USER_POOL_ID not defined');
        process.exit(-1);
	}

	try {
		let loginFlowFinished = false;
		while (!loginFlowFinished) {
			const user = await Auth.signIn(username, password);
			if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
				if (newPassword) {
					password = newPassword;
				}
				await Auth.completeNewPassword(user, password ?? (process.env.ADMIN_USER_PASSWORD as string));
			}
			if (user?.authenticationFlowType === 'USER_SRP_AUTH') {
				const idToken = user.signInUserSession.idToken.jwtToken;
				loginFlowFinished = true;
				return idToken;
			}
		}
	} catch (err: any) {
		// swallow errors but log incase of false positive
		console.log(`authorizeUser: err: ${err}`);
		return err.name;
	}

	return '';
}
