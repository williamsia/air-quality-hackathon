import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Auth } from './constructs/auth';

export class AirQualityHackathonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const auth = new Auth(this, `Auth`);

  }
}
