# Standard library imports
import json

# Local imports
from steps import templateCreation


def lambda_handler(event, context):
    message = 'Hello {} {}!'
    print(event)
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/plain'
        },
        'body': 'Hello, CDK! You have hit {}\n'.format(event['path'])
    }

