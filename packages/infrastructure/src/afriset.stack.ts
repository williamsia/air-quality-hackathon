import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";
import { ApiConstruct } from "./api.construct.js";
import { Auth } from "./auth.construct.js";
import { FrontEnd } from "./frontend.construct.js";
import { FeedMapping } from "./feedMapping.construct.js";
import { Notification } from "./notification.js";
import { BlockPublicAccess, Bucket, BucketEncryption, HttpMethods } from "aws-cdk-lib/aws-s3";

export interface AfrisetProperties {
	environment: string;
	administratorEmail: string;
	redirectUrls: string[];
}

export class AfrisetStack extends Stack {
	constructor(scope: Construct, id: string, props: AfrisetProperties & StackProps) {
		super(scope, id, props);

		const auth = new Auth(this, 'Auth', {
			environment: props.environment,
			administratorEmail: props.administratorEmail,
			redirectUrls: props.redirectUrls
		})

		const notification = new Notification(this, 'Notification', {environment: props.environment});

		const accountId = Stack.of(this).account;
		const region = Stack.of(this).region;
		const bucketName = `afriset-${props.environment}-${accountId}-${region}`;

		const feedBucket = new Bucket(this, 'Bucket', {
			bucketName: bucketName,
			encryption: BucketEncryption.S3_MANAGED,
			eventBridgeEnabled: true,
			removalPolicy: RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			enforceSSL: true,
		});

		feedBucket.addCorsRule({
			allowedHeaders: ['*'],
			allowedMethods: [HttpMethods.PUT, HttpMethods.GET, HttpMethods.HEAD],
			allowedOrigins: ['*'],
			exposedHeaders: ['ETag'],
			maxAge: 3000
		});

		const feedMapping = new FeedMapping(this, 'FeedMapping',
			{
				environment: props.environment,
				sendMessageLambda: notification.sendMessageLambda,
				bucketName: bucketName
			})

		new FrontEnd(this, 'FrontEnd', {
			environment: props.environment,
			redirectUrls: props.redirectUrls,
			cognitoUserPoolId: auth.userPool.userPoolId,
		})

		new ApiConstruct(this, 'API', {
			environment: props.environment,
			userPool: auth.userPool,
			bucket: feedBucket,
			timestreamDatabaseName: feedMapping.timestreamDatabaseName,
			timestreamTableName: feedMapping.timestreamTableName
		})
	}
}
