Input data, formatted as following:

```csv
device,device_id,site_id,time,pm2_5_value,pm2_5_calibratedValue,pm10_value,pm10_calibratedValue,frequency,no2_value,no2_calibratedValue,deviceDetails__id,deviceDetails_mobility,deviceDetails_device_codes_0,deviceDetails_device_codes_1,deviceDetails_device_codes_2,deviceDetails_status,deviceDetails_isPrimaryInLocation,deviceDetails_category,deviceDetails_network,deviceDetails_name,deviceDetails___v,deviceDetails_alias,deviceDetails_approximate_distance_in_km,deviceDetails_bearing_in_radians,deviceDetails_latitude,deviceDetails_longitude
airqo-g5171,6425370f88d7e4001d3596f4,64ceb622c01e770013b27f01,2023-11-25T19:00:00.000Z,11.616900000000047,11.616900000000047,7.955399691116977,7.955399691116977,hourly,,,6425370f88d7e4001d3596f4,false,6425370f88d7e4001d3596f4,airqo-g5171,2087721,deployed,false,lowcost,airqo,airqo-g5171,0,airqo-g5171,0.5,3.033,5.647,-0.18515
airqo-g5171,6425370f88d7e4001d3596f4,64ceb622c01e770013b27f01,2023-11-25T18:00:00.000Z,11.32610000000006,11.32610000000006,4.922872157809599,4.922872157809599,hourly,,,6425370f88d7e4001d3596f4,false,6425370f88d7e4001d3596f4,airqo-g5171,2087721,deployed,false,lowcost,airqo,airqo-g5171,0,airqo-g5171,0.5,3.033,5.647,-0.18515
airqo-g5171,6425370f88d7e4001d3596f4,64ceb622c01e770013b27f01,2023-11-25T17:00:00.000Z,9.182300000000026,9.182300000000026,2.6396201260560685,2.6396201260560685,hourly,,,6425370f88d7e4001d3596f4,false,6425370f88d7e4001d3596f4,airqo-g5171,2087721,deployed,false,lowcost,airqo,airqo-g5171,0,airqo-g5171,0.5,3.033,5.647,-0.18515

```

Maps to the AFRI_SET_COMMON json message format as follows:
```json
[{
    "sensor_id": "6425370f88d7e4001d3596f4",
    "timestamp": "2023-11-25T19:00:00.000Z",
    "pm2_5": 11.616900000000047,
    "pm10": 7.955399691116977
}, {
    "sensor_id": "6425370f88d7e4001d3596f4",
    "timestamp": "2023-11-25T18:00:00.000Z",
    "pm2_5": 11.32610000000006,
    "pm10": 7.955399691116977
}, {
    "sensor_id": "6425370f88d7e4001d3596f4",
    "timestamp": "2023-11-25T17:00:00.000Z",
    "pm2_5": 4.922872157809599,
    "pm10": 2.6396201260560685
}]
```
