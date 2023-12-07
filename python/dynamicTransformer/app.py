import os
import uuid

import logging
logger = logging.getLogger()

# clients
# s3_client = boto3.client('s3')

def lambda_handler(event, context):

    try:
        data : str = event['data']
        logger.debug("data:\n", data)
    except (KeyError, IndexError):
        logger.error("Missing `data` parameter(s) in event.")
        exit

    try:
        transformer_code : str = event['transformer']
        logger.debug("transformer_code:\n", transformer_code)
    except (KeyError, IndexError):
        logger.error("Missing `transformer` parameter(s) in event.")
        exit

    # save the transformer class to local temp storage so we can later load it as a class
    local_class_name = os.path.join("/tmp", uuid.uuid4())
    with open(local_class_name, "w") as f:
        f.write(transformer_code)

    # dynamically execute it to convert the data
    with open(local_class_name, mode="r", encoding="utf-8") as transformer_file:
        transformer_class = transformer_file.read()

    transformed = exec(transformer_class, {"data":data})

    # TODO: store original in S3
    # TODO: store transformed in timeseries

    print(transformed)


