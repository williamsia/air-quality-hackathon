import { Construct } from 'constructs';
import { CloudFrontAllowedMethods, CloudFrontWebDistribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import { CanonicalUserPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { ClientAttributes, OAuthScope, StandardAttributesMask, UserPool, UserPoolClient, UserPoolClientIdentityProvider } from 'aws-cdk-lib/aws-cognito';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export interface FrontEndProperties {
	redirectUrls: string[];
	cognitoUserPoolId: string;
	environment: string;
}

export const frontEndUserPoolClientIdParameter = (environment: string) => `/afriset/${environment}/frontEnd/userPoolClientId`;
export const frontEndWebsiteBucketParameter = (environment: string) => `/afriset/${environment}/frontEnd/websiteBucket`;
export const frontEndDomainParameter = (environment: string) => `/afriset/${environment}/frontEnd/domain`;

export class FrontEnd extends Construct {

	constructor(scope: Construct, id: string, props: FrontEndProperties) {
		super(scope, id);
		const accountId = cdk.Stack.of(this).account;
		const region = cdk.Stack.of(this).region;

		const namePrefix = `afriset-${props.environment}`;

		/*
		* CloudFront distribution setup section
		*/

		const cloudfrontOAI = new OriginAccessIdentity(this, 'afrisetOriginAccessIdentity', {
			comment: `OAI for ${id}`
		});

		const websiteBucket = new Bucket(this, 'afrisetScenarioWebsiteBucket', {
			bucketName: `${namePrefix}-${accountId}-${region}-afriset-ui`,
			publicReadAccess: false,
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true
		});

		websiteBucket.addToResourcePolicy(new PolicyStatement({
			actions: ['s3:GetObject'],
			resources: [websiteBucket.arnForObjects('*')],
			principals: [new CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
		}));

		websiteBucket.addToResourcePolicy(new PolicyStatement({
			actions: ['s3:ListBucket'],
			resources: [websiteBucket.bucketArn],
			principals: [new CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
		}));


		const distribution = new CloudFrontWebDistribution(this, 'AfriSETWebsiteDistribution', {
			defaultRootObject: 'index.html',
			errorConfigurations: [
				{
					errorCode: 404,
					responsePagePath: '/index.html',
					responseCode: 200
				}
			],
			originConfigs: [
				{
					s3OriginSource: {
						s3BucketSource: websiteBucket,
						originAccessIdentity: cloudfrontOAI
					},
					behaviors: [{
						isDefaultBehavior: true,
						compress: true,
						allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS
					}]
				}
			]
		});

		const standardCognitoAttributes: StandardAttributesMask = {
			email: true,
			emailVerified: true
		};

		const clientReadAttributes = new ClientAttributes().withStandardAttributes(standardCognitoAttributes);

		const clientWriteAttributes = new ClientAttributes().withStandardAttributes({
			...standardCognitoAttributes,
			emailVerified: false
		});

		const userPool = UserPool.fromUserPoolId(this, 'UserPool', props.cognitoUserPoolId);

		const userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
			userPool,
			authFlows: {
				userSrp: true
			},
			oAuth: {
				callbackUrls: [...props.redirectUrls, `https://${distribution.distributionDomainName}/api/auth/callback/cognito`],
				scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.PROFILE]
			},
			supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
			readAttributes: clientReadAttributes,
			writeAttributes: clientWriteAttributes
		});

		new StringParameter(this, 'frontEndClientIdParameter', {
			parameterName: frontEndUserPoolClientIdParameter(props.environment),
			stringValue: userPoolClient.userPoolClientId
		});

		new StringParameter(this, 'frontEndWebsiteBucketParameter', {
			parameterName: frontEndWebsiteBucketParameter(props.environment),
			stringValue: websiteBucket.bucketName
		});
		new StringParameter(this, 'frontEndDomainParameter', {
			parameterName: frontEndDomainParameter(props.environment),
			stringValue: distribution.distributionDomainName
		});


	}


}
