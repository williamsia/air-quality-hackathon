import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as cdk from "aws-cdk-lib";

const ADMIN_USER_EMAIL = 'rotach+airquality@amazon.com';

export class Auth extends Construct {
  readonly userPool: cognito.IUserPool;
  readonly userPoolClient: cognito.IUserPoolClient;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true,
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
				minLength: 6,
				requireLowercase: true,
				requireDigits: true,
				requireUppercase: false,
				requireSymbols: false
			},
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });


    const client = userPool.addClient("Client", {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });

		/**
		 * Seed the initial admin user
		 */
		const adminUser = new cognito.CfnUserPoolUser(this, 'GlobalAdminUser', {
			userPoolId: userPool.userPoolId,
			username: ADMIN_USER_EMAIL,
			userAttributes: [
				{
					name: 'email',
					value: ADMIN_USER_EMAIL
				}
			]
		});
		adminUser.node.addDependency(userPool);

    this.userPool = userPool;
    this.userPoolClient = client;
  }
}