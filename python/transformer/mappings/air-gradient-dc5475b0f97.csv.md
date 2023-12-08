Input data, formatted as CSV as the following:

```csv
locationId,locationName,pm01,pm02,pm10,pm003Count,atmp,rhum,rco2,tvoc,wifi,timestamp,serialno,firmwareVersion,tvocIndex,noxIndex,datapoints
59513,dc5475b0f97c,17.7,29.3,30.5,3365,25.5,69.45,,,-69,2023-11-12T00:00:00.000Z,dc5475b0f97c,,,,2
```

Maps to the AFRI_SET_COMMON json message format as follows:

```json
[{
    "sensor_id": "dc5475b0f97c",
    "timestamp": "2023-11-12T00:00:00.000Z",
    "pm1": 17.7,
    "pm2_5": 29.3,
    "pm10": 30.5,
    "temperature": 25.5,
    "humidity": 69.45
}]
```
