import { Stack, StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";
import { ApiConstruct } from "./api.construct.js";
import { Auth } from "./auth.construct.js";

export interface AfriSetProperties {
	environment: string;
	administratorEmail: string;
	redirectUrls: string;
}

export class AfriSetStack extends Stack {
	constructor(scope: Construct, id: string, props: AfriSetProperties & StackProps) {
		super(scope, id, props);

		const auth = new Auth(this, 'Auth', {
			environment: props.environment, administratorEmail: props.administratorEmail,
			redirectUrls: props.redirectUrls
		})

		new ApiConstruct(this, 'API', {
			environment: props.environment, userPool: auth.userPool
		})
	}
}
