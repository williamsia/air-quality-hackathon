# stepfunctions/handlers/startDataConversion.py

# Standard library imports
import json

# Local imports
from steps import templateCreation


def handler(event, context):  
    print('request: {}'.format(json.dumps(event)))
    
    templateCreation
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/plain'
        },
        'body': 'Hello, CDK! You have hit {}\n'.format(event['path'])
    }

