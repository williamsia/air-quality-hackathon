import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Auth } from './constructs/auth';
import { CognitoRestApi } from './constructs/cognitoRestApi';

export class AirQualityHackathonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const auth = new Auth(this, `Auth`);
    const api = new CognitoRestApi(this, `CognitoRestApi`, {
      cognitoUserPool: auth.userPool,
    });

  }
}
