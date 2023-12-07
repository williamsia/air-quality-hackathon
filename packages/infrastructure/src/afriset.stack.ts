import { Stack, StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";
import { ApiConstruct } from "./api.construct.js";
import { Auth } from "./auth.construct.js";
import { FrontEnd } from "./frontend.construct.js";
import { FeedMapping } from "./feedMapping.construct.js";

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

		new FeedMapping(this, 'FeedMapping', {
				environment: props.environment
			}
		)

		new FrontEnd(this, 'FrontEnd', {
			environment: props.environment,
			redirectUrls: props.redirectUrls,
			cognitoUserPoolId: auth.userPool.userPoolId
		})

		new ApiConstruct(this, 'API', {
			environment: props.environment, userPool: auth.userPool
		})
	}
}
