import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as s3Deploy from "aws-cdk-lib/aws-s3-deployment";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as waf from "aws-cdk-lib/aws-wafv2";
import * as path from "path";

export class StaticSite extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const hostingBucket = new s3.Bucket(this, "StaticSiteBucket", {
            versioned: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
          });
          // const webAcl = new waf.CfnWebACL(this, "WebAcl", {
          //   defaultAction: {
          //     allow: {},
          //   },
          //   scope: "CLOUDFRONT",
          //   visibilityConfig: {
          //     cloudWatchMetricsEnabled: true,
          //     metricName: "CloudfrontWebACL",
          //     sampledRequestsEnabled: false,
          //   },
          //   rules: [
          //     {
          //       name: "AWS-AWSManagedRulesCommonRuleSet",
          //       priority: 1,
          //       overrideAction: {
          //         none: {},
          //       },
          //       statement: {
          //         managedRuleGroupStatement: {
          //           name: "AWSManagedRulesCommonRuleSet",
          //           vendorName: "AWS",
          //         },
          //       },
          //       visibilityConfig: {
          //         cloudWatchMetricsEnabled: true,
          //         metricName: "CloudfrontWebAclCrs",
          //         sampledRequestsEnabled: false,
          //       },
          //     },
          //     {
          //       name: "AWS-AWSManagedRulesKnownBadInputsRuleSet",
          //       priority: 2,
          //       overrideAction: {
          //         none: {},
          //       },
          //       statement: {
          //         managedRuleGroupStatement: {
          //           name: "AWSManagedRulesKnownBadInputsRuleSet",
          //           vendorName: "AWS",
          //         },
          //       },
          //       visibilityConfig: {
          //         cloudWatchMetricsEnabled: true,
          //         metricName: "CloudfrontWebAclKbirs",
          //         sampledRequestsEnabled: false,
          //       },
          //     },
          //   ],
          // });
      
          const originAccessIdentity = new cloudfront.OriginAccessIdentity(
            this,
            "OriginAccessIdentity"
          );
          hostingBucket.grantRead(originAccessIdentity);
      
          //CloudFrontWebDistribution access log bucket
        //   const cloudFrontWebDistaccessLogsBucket = new s3.Bucket(
        //     this,
        //     "CloudFrontDistAccessLogsBucket",
        //     {
        //       blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        //       encryption: s3.BucketEncryption.S3_MANAGED,
        //       enforceSSL: true,
        //     }
        //   );
      
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
              // webACLId: webAcl.attrArn,
            //   loggingConfig: { bucket: cloudFrontWebDistaccessLogsBucket },
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

          new s3Deploy.BucketDeployment(this, "BucketDeployment", {
            sources: [
              s3Deploy.Source.asset(path.join(__dirname, '../../frontend/air-quality-hackathon/dist'), {

                // bundling: {
                //   image: cdk.DockerImage.fromRegistry('node:lts'),
                //   command: [
                //     'bash', '-c', [
                //         'npm install',
                //         'npm run build',
                //         'cp -r /asset-input/dist/* /asset-output/',
                //       ].join(' && '),
                //   ],
                // //   environment: {
                // //     "VITE_BASE_API_URL": ssm.StringParameter.valueFromLookup(this, parameterNames.VITE_BASE_API_URL),
                // //     "VITE_REGION": ssm.StringParameter.valueFromLookup(this, parameterNames.VITE_REGION),
                // //     "VITE_USER_POOL_ID": ssm.StringParameter.valueFromLookup(this, parameterNames.VITE_USER_POOL_ID),
                // //     "VITE_USER_POOL_APP_CLIENT_ID": ssm.StringParameter.valueFromLookup(this, parameterNames.VITE_USER_POOL_APP_CLIENT_ID)
                // //   }
                // }
              })
            ],
            destinationBucket: hostingBucket
          })

      
          new cdk.CfnOutput(this, "WebsiteDomain", {
            value: distribution.distributionDomainName,
            description: "Domain for the CloudFront distribution",
          });

    }
}
