Input data, formatted as following:

```csv
pm4cnc,pm4cnt,dt_time,pm25raw,pm2.5cnc,temp,rh,o3op1,o3op2,no2op1,no2op2,pm10cnc,PM10,pres,altd,pm1cnc,pm0.3cnt,pm0.5cnt,pm1cnt,pm2.5cnt,pm5cnt,pm10cnt,lat,lon,no,nox,nh3,co,co2,benzene,deviceid
0,0,2023-11-29 00:00:00,2,2,29.7,76.3,0,0,0,0,2,0,1000,352,2,0,15,18,18,0,18,0,0,0,0,0,0,0,0,3083988F1432
0,0,2023-11-29 00:01:00,2,2,29.6,76.8,0,0,0,0,2,0,1000,354,2,0,15,17,17,0,17,0,0,0,0,0,0,0,0,3083988F1432
0,0,2023-11-29 00:02:00,2,2,29.7,76.7,0,0,0,0,2,0,1000,351,2,0,14,16,16,0,16,0,0,0,0,0,0,0,0,3083988F1432
```

Maps to the AFRI_SET_COMMON json message format as follows:
```json
[{
    "sensor_id": "3083988F1432",
    "timestamp": "2023-11-29T00:00:00.000Z",
    "pm0_3": 0,
    "pm0_5": 15,
    "pm1": 18,
    "pm2_5": 18,
    "pm4": 0,
    "pm5": 0,
    "pm10": 18,
    "temperature": 29.7,
    "humidity": 76.3
}, {
    "sensor_id": "3083988F1432",
    "timestamp": "2023-11-29T00:01:00.000Z",
    "pm0_3": 0,
    "pm0_5": 15,
    "pm1": 17,
    "pm2_5": 17,
    "pm4": 0,
    "pm5": 0,
    "pm10": 17,
    "temperature": 29.6,
    "humidity": 76.8
}, {
    "sensor_id": "3083988F1432",
    "timestamp": "2023-11-29T00:02:00.000Z",
    "pm0_3": 0,
    "pm0_5": 14,
    "pm1": 16,
    "pm2_5": 16,
    "pm4": 0,
    "pm5": 0,
    "pm10": 16,
    "temperature": 29.7,
    "humidity": 76.7
}]
```
