Input data, formatted as CSV as the following:

```csv
City,State,Country,Latitude,Longitude,pollution_ts,aqius,mainus,aqicn,maincn,wether_ts,pr,hu,ws,wd,ic
Accra,Greater Accra,Ghana,-0.186964,5.603717,2023-11-25T23:00:00.000Z,74,p2,33,p2,26,1011,82,4.12,272,04n
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
