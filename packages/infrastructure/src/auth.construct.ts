import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as cdk from "aws-cdk-lib";
import { CfnUserPoolGroup, CfnUserPoolUser, CfnUserPoolUserToGroupAttachment, ClientAttributes, StandardAttributesMask, StringAttribute, UserPoolClient, UserPoolClientIdentityProvider, UserPoolDomain } from "aws-cdk-lib/aws-cognito";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export interface AuthProperties {
	environment: string;
	administratorEmail: string;
	redirectUrls: string;
}

export const userPoolIdParameter = (environment: string) => `/afriSET/${environment}/shared/userPoolId`;
export const userPoolArnParameter = (environment: string) => `/afriSET/${environment}/shared/userPoolArn`;
export const userPoolClientIdParameter = (environment: string) => `/afriSET/${environment}/shared/userPoolClientId`;
export const adminUserParameter = (environment: string) => `/afriSET/${environment}/shared/adminUser`;

export class Auth extends Construct {
	readonly userPool: cognito.IUserPool;
	readonly userPoolClient: cognito.IUserPoolClient;

	constructor(scope: Construct, id: string, props: AuthProperties) {
		super(scope, id);

		const namePrefix = `afriSET-${props.environment}`;

		const userPool = new cognito.UserPool(this, "UserPool", {
			userPoolName: namePrefix,
			selfSignUpEnabled: true,
			autoVerify: {
				email: true,
			},
			customAttributes: {
				role: new StringAttribute({mutable: true})
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


		new StringParameter(this, 'cognitoUserPoolIdParameter', {
			parameterName: userPoolIdParameter(props.environment),
			stringValue: userPool.userPoolId
		});

		new StringParameter(this, 'cognitoUserPoolArnParameter', {
			parameterName: userPoolArnParameter(props.environment),
			stringValue: userPool.userPoolArn
		});

		new UserPoolDomain(this, 'UserPoolDomain', {
			userPool: userPool,
			cognitoDomain: {
				domainPrefix: `afriset-${cdk.Stack.of(this).account}-${props.environment}`
			}
		});

		// 👇 User Pool Client attributes for end users
		const standardCognitoAttributes: StandardAttributesMask = {
			email: true,
			emailVerified: true
		};

		const clientReadAttributes = new ClientAttributes().withStandardAttributes(standardCognitoAttributes);

		const clientWriteAttributes = new ClientAttributes().withStandardAttributes({
			...standardCognitoAttributes,
			emailVerified: false
		});

		// 👇 User Pool Client for end users
		const userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
			userPool,
			authFlows: {
				adminUserPassword: true,
				userSrp: true
			},
			supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
			readAttributes: clientReadAttributes,
			writeAttributes: clientWriteAttributes
		});
		userPoolClient.node.addDependency(userPool);

		this.userPool = userPool;
		this.userPoolClient = userPoolClient;

		new StringParameter(this, 'cognitoClientIdParameter', {
			parameterName: userPoolClientIdParameter(props.environment),
			stringValue: userPoolClient.userPoolClientId
		});


		/**
		 * Seed the default roles/groups for the built in global (/) group
		 */

		const adminGroup = new CfnUserPoolGroup(this, 'GlobalAdminGroup', {
			groupName: '/|||admin',
			userPoolId: userPool.userPoolId
		});
		adminGroup.node.addDependency(userPool);

		const contributorGroup = new CfnUserPoolGroup(this, 'GlobalContributorGroup', {
			groupName: '/|||contributor',
			userPoolId: userPool.userPoolId
		});
		contributorGroup.node.addDependency(userPool);

		const readerGroup = new CfnUserPoolGroup(this, 'GlobalReaderGroup', {
			groupName: '/|||reader',
			userPoolId: userPool.userPoolId
		});
		readerGroup.node.addDependency(userPool);

		/**
		 * Seed the initial admin user
		 */
		const adminUser = new CfnUserPoolUser(this, 'GlobalAdminUser', {
			userPoolId: userPool.userPoolId,
			username: props.administratorEmail,
			userAttributes: [
				{
					name: 'email',
					value: props.administratorEmail
				}
			]
		});
		adminUser.node.addDependency(userPool);

		const membership = new CfnUserPoolUserToGroupAttachment(this, 'AdminUserGroupMembership', {
			groupName: adminGroup.groupName as string,
			username: adminUser.username as string,
			userPoolId: userPool.userPoolId
		});

		membership.node.addDependency(adminGroup);
		membership.node.addDependency(adminUser);
		membership.node.addDependency(userPool);

		new StringParameter(this, 'adminUserParameter', {
			parameterName: adminUserParameter(props.environment),
			stringValue: props.administratorEmail
		});
	}
}
