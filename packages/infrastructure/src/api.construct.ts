import { Construct } from "constructs";
import { AccessLogFormat, AuthorizationType, CfnMethod, CognitoUserPoolsAuthorizer, Cors, EndpointType, IRestApi, LambdaRestApi, LogGroupLogDestination, MethodLoggingLevel } from "aws-cdk-lib/aws-apigateway";
import path from "path";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import { Architecture, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { Aspects, Duration } from "aws-cdk-lib";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { fileURLToPath } from "url";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import type { IUserPool } from "aws-cdk-lib/aws-cognito";
import type { Bucket } from "aws-cdk-lib/aws-s3";

interface CognitoRestApiProps {
	userPool: IUserPool
	environment: string;
	bucket: Bucket;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const afrisetApiUrlParameter = (environment: string) => `/afriset/${environment}/shared/apiUrl`;
export const afrisetApiNameParameter = (environment: string) => `/afriset/${environment}/shared/apiName`;

export class ApiConstruct extends Construct {
	readonly api: IRestApi;

	constructor(scope: Construct, id: string, props: CognitoRestApiProps) {
		super(scope, id);

		const namePrefix = `afriset-${props.environment}`;

		const apiLambda = new NodejsFunction(this, 'ApiLambda', {
			functionName: `${namePrefix}-api`,
			description: `Afriset API (${props.environment})`,
			entry: path.join(__dirname, '../../apps/api/src/lambda_apiGateway.ts'),
			runtime: Runtime.NODEJS_18_X,
			tracing: Tracing.ACTIVE,
			memorySize: 256,
			timeout: Duration.seconds(29),
			logRetention: RetentionDays.ONE_WEEK,
			environment: {
				NODE_ENV: props.environment,
				FEED_BUCKET: props.bucket.bucketName
			},
			bundling: {
				minify: true,
				format: OutputFormat.ESM,
				target: 'node18.16',
				sourceMap: false,
				sourcesContent: false,
				banner: 'import { createRequire } from \'module\';const require = createRequire(import.meta.url);import { fileURLToPath } from \'url\';import { dirname } from \'path\';const __filename = fileURLToPath(import.meta.url);const __dirname = dirname(__filename);',
				externalModules: ['aws-sdk']
			},
			depsLockFilePath: path.join(__dirname, '../../../common/config/rush/pnpm-lock.yaml'),
			architecture: Architecture.ARM_64
		});

		props.bucket.grantReadWrite(apiLambda)

		const authorizer = new CognitoUserPoolsAuthorizer(this, 'Authorizer', {
			cognitoUserPools: [props.userPool]
		});

		const logGroup = new LogGroup(this, 'AfriSetApiLogs');
		const apigw = new LambdaRestApi(this, 'ApiGateway', {
			restApiName: `${namePrefix}-api`,
			description: `AfriSet API`,
			handler: apiLambda,
			proxy: true,
			cloudWatchRole: true,
			deployOptions: {
				stageName: 'prod',
				accessLogDestination: new LogGroupLogDestination(logGroup),
				accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
				loggingLevel: MethodLoggingLevel.INFO
			},
			defaultCorsPreflightOptions: {
				allowOrigins: Cors.ALL_ORIGINS,
				allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent', 'Accept-Version']
			},
			endpointTypes: [EndpointType.REGIONAL],
			defaultMethodOptions: {
				authorizationType: AuthorizationType.COGNITO,
				authorizer
			}
		});

		Aspects.of(apigw).add({
			visit(node) {
				if (node instanceof CfnMethod && node.httpMethod === 'OPTIONS') {
					node.addPropertyOverride('AuthorizationType', 'NONE');
				}
			}
		});

		apigw.node.addDependency(apiLambda);

		new StringParameter(this, 'afrisetApiUrlParameter', {
			parameterName: afrisetApiUrlParameter(props.environment),
			stringValue: apigw.url
		});

		new StringParameter(this, 'afrisetApiNameParameter', {
			parameterName: afrisetApiNameParameter(props.environment),
			stringValue: apigw.restApiName
		});
	}
}
