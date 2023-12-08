Given a sample of CSV input data as follows defined within the <data></data> XML tags:

<data>
,,,,,Sensor_Package_Name,Sensor_Package_Name,Sensor_Package_Name,Sensor_Package_Name,Sensor_Package_Name
,,,,,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc,AirBeam3-943cc67daabc
,,,,,Sensor_Name,Sensor_Name,Sensor_Name,Sensor_Name,Sensor_Name
,,,,,AirBeam3-F,AirBeam3-PM1,AirBeam3-PM10,AirBeam3-PM2.5,AirBeam3-RH
,,,,,Measurement_Type,Measurement_Type,Measurement_Type,Measurement_Type,Measurement_Type
,,,,,Temperature,Particulate Matter,Particulate Matter,Particulate Matter,Humidity
,,,,,Measurement_Units,Measurement_Units,Measurement_Units,Measurement_Units,Measurement_Units
,,,,,fahrenheit,microgram per cubic meter,microgram per cubic meter,microgram per cubic meter,percent
ObjectID,Session_Name,Timestamp,Latitude,Longitude,1:Measurement_Value,2:Measurement_Value,3:Measurement_Value,4:Measurement_Value,5:Measurement_Value
360,AfriSET (1),2023-10-06T20:54:17.000,5.65151,-0.185649,90.0,2.0,3.0,4.0,68.0
20,AfriSET (1),2023-10-06T15:13:20.000,5.65151,-0.185649,100.0,5.0,6.0,7.0,37.0
274,AfriSET (1),2023-10-06T19:28:16.000,5.65151,-0.185649,91.0,8.0,9.0,10.0,66.0
</data>

This input file contains multiple csv files concatenated together:
- Rows 0 and 1 is one section
- Rows 2 and 3 is one section
- Rows 4 and 5 is one section
- Rows 6 and 7 is one section
- Rows 8 and beyond is another section

This input data would be mapped to the AFRI_SET_COMMON json message format as follows:

```json
[{
    "sensor_id": "AirBeam3-943cc67daabc",
    "timestamp": "2023-10-06T20:54:17.000",
    "pm1": 2.0,
    "pm25": 4.0,
    "pm10": 3.0,
    "temperature": 90.0,
    "humidity": 68.0
}, {
    "sensor_id": "AirBeam3-943cc67daabc",
    "timestamp": "2023-10-06T15:13:20.000",
    "pm1": 5.0,
    "pm25": 7.0,
    "pm10": 6.0,
    "temperature": 100.0,
    "humidity": 38.0
}, {
    "sensor_id": "AirBeam3-943cc67daabc",
    "timestamp": "2023-10-06T19:28:16.000",
    "pm1": 8.0,
    "pm25": 10.0,
    "pm10": 9.0,
    "temperature": 91.0,
    "humidity": 66.0
}]
```
