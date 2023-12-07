Given a sample of CSV data as follows:

```
City,State,Country,Latitude,Longitude,pollution_ts,aqius,mainus,aqicn,maincn,wether_ts,pr,hu,ws,wd,ic
Accra,Greater Accra,Ghana,-0.186964,5.603717,2023-11-25T23:00:00.000Z,74,p2,33,p2,26,1011,82,4.12,272,04n
```

This maps to the following AFRI_SET_COMMON json message format:

```json
[{
    "sensor_id": "dc5475b0f97c",
    "timestamp": "2023-11-12T00:00:00.000Z",
    "pm1": 17.7,
    "pm25": 29.3,
    "pm10": 30.5,
    "temperature": 25.5,
    "humidity": 69.45
}]
```