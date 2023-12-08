import os
import uuid
import time
import hashlib
import base64


import logging
logger = logging.getLogger()

from utils import timeStream
# from utils import lambda

# Get the Environment variables

DATABASE_NAME = os.getenv('DATABASE_NAME')
TABLE_NAME = os.getenv('TABLE_NAME')
BUCKET_NAME = os.getenv('BUCKET_NAME')
NOTIFICATION_FUNCTION_NAME = os.getenv('NOTIFICATION_FUNCTION_NAME')


def lambda_handler(event, context):

    try:
        data : str = event['data']
        logger.debug("data:\n", data)
    except (KeyError, IndexError):
        logger.error("Missing `data` parameter(s) in event.")
        exit

    try:
        print('before transformer_code')
        transformer_code : str = base64.b64decode(event['transformer']).decode()
        transformer_code += "\nconvert(data)"
        logger.debug("transformer_code:\n", transformer_code)
        print("transformer_code:\n", transformer_code)
    except (KeyError, IndexError):
        logger.error("Missing `transformer` parameter(s) in event.")
        exit

    # save the transformer class to local temp storage so we can later load it as a class
    local_class_name = os.path.join("/tmp", str(uuid.uuid4()))
    # local_class_name = os.path.join("/tmp/debugging")
    with open(local_class_name, "w") as f:
        f.write(transformer_code)

    # dynamically execute it to convert the data
    with open(local_class_name, mode="r", encoding="utf-8") as transformer_file:
        transformer_class = transformer_file.read()
        print("read transformer class:\n")

    # print({"data":data})
    transformed = exec(transformer_class, {"data":data})


    # Store transformed in timeseries step 2
    timeStreamClient = timeStream.get_timeStream_client()
    timeStreamClient.write_records(
        DatabaseName=DATABASE_NAME,
        TableName=TABLE_NAME,
        Records=event["data"],
        CommonAttributes={
        'MeasureValueType': 'DOUBLE',
        'TimeUnit': 'SECONDS',
    }
    )

    # Send notification to websocket
    # lambdaClient = lambda.get_lambda_client()
    # lambdaClient.invoke(
    #     FunctioName=NOTIFICATION_FUNCTION_NAME,
    #     InvocationType='RequestResponse'
    #     Payload=b'{"status": "success","stepNumber": 2}'
	# )

    print(transformed)


def lambda_handler2(event, context):


	print(event["data"])
	timeStreamClient = timeStream.get_timeStream_client()
	timeStreamClient.write_records(
		DatabaseName=DATABASE_NAME,
		TableName=TABLE_NAME,
		Records=event["data"],
		CommonAttributes={
        'MeasureValueType': 'DOUBLE',
        'TimeUnit': 'SECONDS',
    }
	)

def _current_micro_time():
    return str(int(round(time.time())))

key="feed1"+"sensor1"+"test1"
# lambda_handler2({
# 	"data":[
# 		{
# 			"Dimensions":[
# 				{"Name": "id","Value":hashlib.sha256(b"{key}").hexdigest()},
# 				{"Name": "sensor_id","Value":"sensor1"},
# 				{"Name":"feed_id","Value":"feed1"},
# 				{"Name":"username","Value":"test1"},
# 			],
# 			"MeasureName": "temperature",
# 			"MeasureValue": "26.7",
# 			"Time": _current_micro_time()

# 		}
# 	],
# 	"transformer":{

# 	}
# },'')

csv=''',,,,,Sensor_Package_Name,Sensor_Package_Name,Sensor_Package_Name,Sensor_Package_Name,Sensor_Package_Name
,,,,,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc
,,,,,Sensor_Name,Sensor_Name,Sensor_Name,Sensor_Name,Sensor_Name
,,,,,AirBeam3-F,AirBeam3-PM1,AirBeam3-PM10,AirBeam3-PM2.5,AirBeam3-RH
,,,,,Measurement_Type,Measurement_Type,Measurement_Type,Measurement_Type,Measurement_Type
,,,,,Temperature,Particulate Matter,Particulate Matter,Particulate Matter,Humidity
,,,,,Measurement_Units,Measurement_Units,Measurement_Units,Measurement_Units,Measurement_Units
,,,,,fahrenheit,microgram per cubic meter,microgram per cubic meter,microgram per cubic meter,percent
ObjectID,Session_Name,Timestamp,Latitude,Longitude,1:Measurement_Value,2:Measurement_Value,3:Measurement_Value,4:Measurement_Value,5:Measurement_Value
1,AfriSET (1),2023-10-06T14:54:19.000,5.65151,-0.185649,105.0,6.0,6.0,6.0,33.0
2,AfriSET (1),2023-10-06T14:55:19.000,5.65151,-0.185649,104.0,5.0,6.0,5.0,33.0
3,AfriSET (1),2023-10-06T14:56:19.000,5.65151,-0.185649,103.0,5.0,5.0,5.0,33.0
4,AfriSET (1),2023-10-06T14:57:19.000,5.65151,-0.185649,103.0,5.0,6.0,5.0,34.0
5,AfriSET (1),2023-10-06T14:58:19.000,5.65151,-0.185649,102.0,6.0,6.0,6.0,34.0
6,AfriSET (1),2023-10-06T14:59:19.000,5.65151,-0.185649,102.0,5.0,6.0,6.0,34.0
7,AfriSET (1),2023-10-06T15:00:19.000,5.65151,-0.185649,102.0,5.0,6.0,5.0,34.0
8,AfriSET (1),2023-10-06T15:01:19.000,5.65151,-0.185649,102.0,5.0,6.0,6.0,35.0
9,AfriSET (1),2023-10-06T15:02:19.000,5.65151,-0.185649,102.0,5.0,6.0,5.0,35.0
10,AfriSET (1),2023-10-06T15:03:19.000,5.65151,-0.185649,101.0,5.0,6.0,5.0,35.0
11,AfriSET (1),2023-10-06T15:04:19.000,5.65151,-0.185649,101.0,5.0,5.0,5.0,35.0
12,AfriSET (1),2023-10-06T15:05:19.000,5.65151,-0.185649,101.0,5.0,6.0,6.0,36.0'''

lambda_handler({
	"data":csv,
	"transformer":'''ZnJvbSBkYXRhY2xhc3NlcyBpbXBvcnQgZGF0YWNsYXNzCmZyb20gZGF0ZXRpbWUgaW1wb3J0IGRhdGV0aW1lCmZyb20gdHlwaW5nIGltcG9ydCBMaXN0CmltcG9ydCBjc3YKCkBkYXRhY2xhc3MKY2xhc3MgTWVhc3VyZW1lbnQ6CiAgICBzZW5zb3JfaWQ6IHN0cgogICAgdGltZXN0YW1wOiBkYXRldGltZQogICAgcG0xOiBmbG9hdAogICAgcG0yXzU6IGZsb2F0IAogICAgcG0xMDogZmxvYXQKICAgIHRlbXBlcmF0dXJlOiBmbG9hdAogICAgaHVtaWRpdHk6IGZsb2F0CgpkZWYgY29udmVydChpbnB1dDogc3RyKSAtPiBMaXN0W01lYXN1cmVtZW50XToKICAgIG1lYXN1cmVtZW50cyA9IFtdCiAgICByZWFkZXIgPSBjc3YucmVhZGVyKGlucHV0LnNwbGl0bGluZXMoKSkKICAgIHNlbnNvcl9pZCA9IG5leHQocmVhZGVyKVs1XQogICAgCiAgICBmb3Igcm93IGluIHJlYWRlcjoKICAgICAgICBpZiByb3dbMF0gPT0gIk9iamVjdElEIjoKICAgICAgICAgICAgY29udGludWUKICAgICAgICAKICAgICAgICB0aW1lc3RhbXAgPSBkYXRldGltZS5mcm9taXNvZm9ybWF0KHJvd1syXSkKICAgICAgICBwbTEgPSBmbG9hdChyb3dbNl0pIAogICAgICAgIHBtMl81ID0gZmxvYXQocm93WzhdKQogICAgICAgIHBtMTAgPSBmbG9hdChyb3dbN10pCiAgICAgICAgdGVtcGVyYXR1cmUgPSBmbG9hdChyb3dbNV0pCiAgICAgICAgaHVtaWRpdHkgPSBmbG9hdChyb3dbOV0pCiAgICAgICAgCiAgICAgICAgbWVhc3VyZW1lbnQgPSBNZWFzdXJlbWVudCgKICAgICAgICAgICAgc2Vuc29yX2lkPXNlbnNvcl9pZCwKICAgICAgICAgICAgdGltZXN0YW1wPXRpbWVzdGFtcCwKICAgICAgICAgICAgcG0xPXBtMSwKICAgICAgICAgICAgcG0yXzU9cG0yXzUsCiAgICAgICAgICAgIHBtMTA9cG0xMCwKICAgICAgICAgICAgdGVtcGVyYXR1cmU9dGVtcGVyYXR1cmUsCiAgICAgICAgICAgIGh1bWlkaXR5PWh1bWlkaXR5CiAgICAgICAgKQogICAgICAgIAogICAgICAgIG1lYXN1cmVtZW50cy5hcHBlbmQobWVhc3VyZW1lbnQpCiAgICAgICAgCiAgICByZXR1cm4gbWVhc3VyZW1lbnRzCgk='''
},'')


