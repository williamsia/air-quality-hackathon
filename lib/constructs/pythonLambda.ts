import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { Function, Runtime, Tracing, Code } from 'aws-cdk-lib/aws-lambda';

import * as path from 'path';
// import { fileURLToPath } from 'url';
import { execSync } from 'child_process';



// Placeholder construct to test python function deployment should be merged into main branch code
export class PythonLambda extends Construct {

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const namePrefix = 'afri-set'

    const functionDir = path.join(__dirname, "../../stepfunctions");


    const createTemplateLambda = new Function(this, 'CreateTemplateLambda', {
        description: `Create a template based on the input csv file`,
        functionName: `${namePrefix}-createTemplate`,
        handler: 'createTemplateHandler.handler',
        runtime: Runtime.PYTHON_3_11,
        tracing: Tracing.ACTIVE,
        memorySize: 1024,
        timeout: cdk.Duration.minutes(15),
        environment: {

        },
        code: Code.fromAsset(functionDir, {
            bundling: {
              image: Runtime.PYTHON_3_8.bundlingImage,
              local: {
                tryBundle(outputDir: string) {
                  try {
                    execSync('pip3 --version')
                  } catch {
                    return false
                  }
        
                  execSync(`pip install -r $(grep -v '^ *#\|^boto3\|^awscli|^botocore' ${path.join(functionDir, "requirements.txt")} | grep .) -t ${path.join(outputDir)}`)
                  execSync(`cp -a ${functionDir}/* ${path.join(outputDir)}`)
                  return true
                }
              }
            }
        })
    });
  }
}