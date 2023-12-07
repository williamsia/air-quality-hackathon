import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Auth} from './constructs/auth';
import {CognitoRestApi} from './constructs/cognitoRestApi';

export class AirQualityHackathonStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const auth = new Auth(this, `Auth`);
		const api = new CognitoRestApi(this, `CognitoRestApi`, {
			cognitoUserPool: auth.userPool,
		});

		new cdk.CfnOutput(this, `UserPoolId`, {
			value: auth.userPool.userPoolId,
		});

		new cdk.CfnOutput(this, `UserPoolWebClientId`, {
			value: auth.userPoolClient.userPoolClientId,
		});
	}
}
