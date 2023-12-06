import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito"
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import { addApiResource } from "./helpers/addApiResource";


interface CognitoRestApiProps {
    cognitoUserPool: cognito.IUserPool
    apiHandler: lambda.IFunction
}

export class CognitoRestApi extends Construct {
    readonly api: apigateway.IRestApi;
    readonly cognitoAuthorizer: apigateway.CognitoUserPoolsAuthorizer;
  constructor(scope: Construct, id: string, props: CognitoRestApiProps) {
    super(scope, id);

    const api = new apigateway.RestApi(this, "CognitoApi", {
      deployOptions: {
        tracingEnabled: true,
      },
    });

    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      "UserPoolAuthorizer",
      {
        cognitoUserPools: [props.cognitoUserPool],
      }
    );
    
    addApiResource({
      parentResource: api.root,
      resourceName: "{proxy+}",
      methods: ["ANY"],
      handler: props.apiHandler,
      cognitoAuthorizer: cognitoAuthorizer,
    });

    this.api = api;
    this.cognitoAuthorizer = cognitoAuthorizer;
  }
}
