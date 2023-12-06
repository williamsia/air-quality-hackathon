import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StaticSite } from './constructs/staticSite';

interface FrontendStackProps extends cdk.StackProps {
}
export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const staticSite = new StaticSite(this, 'StaticSite');
  }
}
