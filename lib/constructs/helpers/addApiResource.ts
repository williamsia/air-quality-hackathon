import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

export interface AddApiResourceProps {
  parentResource: apigateway.IResource;
  resourceName: string;
  methods: string[];
  handler: lambda.IFunction;
  cognitoAuthorizer?: apigateway.IAuthorizer;
  iamRole?: iam.Role;
}

export function addApiResource(props: AddApiResourceProps) {
  const newResource = props.parentResource.addResource(props.resourceName);

  newResource.addCorsPreflight({
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
  });
  for (const method of props.methods) {
    const newMethod = newResource.addMethod(
      method,
      new apigateway.LambdaIntegration(props.handler),
      {
        authorizer: props.cognitoAuthorizer,
        authorizationType: props.cognitoAuthorizer
          ? apigateway.AuthorizationType.COGNITO
          : apigateway.AuthorizationType.IAM,
      }
    );
    if (props.iamRole) {
      newMethod.grantExecute(props.iamRole);
    }
  }
  return newResource;
}
