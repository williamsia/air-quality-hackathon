import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

export class FrontEnd extends Construct {
	constructor(scope: Construct, id: string) {
		super(scope, id);

		const hostingBucket = new s3.Bucket(this, "StaticSiteBucket", {
			versioned: true,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			encryption: s3.BucketEncryption.S3_MANAGED,
			enforceSSL: true,
		});

		const originAccessIdentity = new cloudfront.OriginAccessIdentity(
			this,
			"OriginAccessIdentity"
		);
		hostingBucket.grantRead(originAccessIdentity);

		const distribution = new cloudfront.CloudFrontWebDistribution(
			this,
			"WebsiteDistribution",
			{
				originConfigs: [
					{
						s3OriginSource: {
							s3BucketSource: hostingBucket,
							originAccessIdentity: originAccessIdentity,
						},
						behaviors: [
							{
								isDefaultBehavior: true,
								viewerProtocolPolicy:
								cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
							},
						],
					},
				],
				viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				errorConfigurations: [
					{
						errorCode: 404,
						errorCachingMinTtl: 0,
						responseCode: 200,
						responsePagePath: '/index.html'
					},
					{
						errorCode: 403,
						errorCachingMinTtl: 0,
						responseCode: 200,
						responsePagePath: '/index.html'
					}
				]
			}
		);

		new cdk.CfnOutput(this, "WebsiteDomain", {
			value: distribution.distributionDomainName,
			description: "Domain for the CloudFront distribution",
		});

	}
}
