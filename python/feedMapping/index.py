def lambda_handler(event, context):
    message = 'Hello {} {}!'
    print(event)
    return {
        'message' : message
    }
