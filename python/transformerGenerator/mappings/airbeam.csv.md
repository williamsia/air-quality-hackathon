Input data, formatted as following:

```csv
+++ section_1 - Begin +++
,,,,,Sensor_Package_Name,Sensor_Package_Name,Sensor_Package_Name,Sensor_Package_Name,Sensor_Package_Name
,,,,,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc
+++ section_1 - End +++
+++ section_2 - Begin +++
,,,,,Sensor_Name,Sensor_Name,Sensor_Name,Sensor_Name,Sensor_Name
,,,,,AirBeam3-F,AirBeam3-PM1,AirBeam3-PM10,AirBeam3-PM2.5,AirBeam3-RH
+++ section_2 - End +++
+++ section_3 - Begin +++
,,,,,Measurement_Type,Measurement_Type,Measurement_Type,Measurement_Type,Measurement_Type
,,,,,Temperature,Particulate Matter,Particulate Matter,Particulate Matter,Humidity
+++ section_3 - End +++
+++ section_4 - Begin +++
,,,,,Measurement_Units,Measurement_Units,Measurement_Units,Measurement_Units,Measurement_Units
,,,,,fahrenheit,microgram per cubic meter,microgram per cubic meter,microgram per cubic meter,percent
+++ section_4 - End +++
+++ section_5 - Begin +++
ObjectID,Session_Name,Timestamp,Latitude,Longitude,1:Measurement_Value,2:Measurement_Value,3:Measurement_Value,4:Measurement_Value,5:Measurement_Value
360,AfriSET (1),2023-10-06T20:54:17.000,5.65151,-0.185649,90.0,2.0,3.0,4.0,68.0
20,AfriSET (1),2023-10-06T15:13:20.000,5.65151,-0.185649,100.0,5.0,6.0,7.0,37.0
274,AfriSET (1),2023-10-06T19:28:16.000,5.65151,-0.185649,91.0,8.0,9.0,10.0,66.0
+++ section_5 - End +++
```

Maps to the AFRI_SET_COMMON json message format as follows:
```json
[{
    "sensor_id": "AirBeam3-943cc67daabc",
    "timestamp": "2023-10-06T20:54:17.000",
    "pm1": 2.0,
    "pm2_5": 4.0,
    "pm10": 3.0,
    "temperature": 90.0,
    "humidity": 68.0
}, {
    "sensor_id": "AirBeam3-943cc67daabc",
    "timestamp": "2023-10-06T15:13:20.000",
    "pm1": 5.0,
    "pm2_5": 7.0,
    "pm10": 6.0,
    "temperature": 100.0,
    "humidity": 38.0
}, {
    "sensor_id": "AirBeam3-943cc67daabc",
    "timestamp": "2023-10-06T19:28:16.000",
    "pm1": 8.0,
    "pm2_5": 10.0,
    "pm10": 9.0,
    "temperature": 91.0,
    "humidity": 66.0
}]
```
