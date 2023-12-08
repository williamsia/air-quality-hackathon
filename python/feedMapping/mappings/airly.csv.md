Given a sample of CSV data as follows:

```
fromDateTime,tillDateTime,values_0_name,values_0_value,values_1_name,values_1_value,values_2_name,values_2_value,values_3_name,values_3_value,values_4_name,values_4_value,values_5_name,values_5_value,indexes_0_name,indexes_0_value,indexes_0_level,indexes_0_description,indexes_0_advice,indexes_0_color,standards_0_name,standards_0_pollutant,standards_0_limit,standards_0_percent,standards_0_averaging,standards_1_name,standards_1_pollutant,standards_1_limit,standards_1_percent,standards_1_averaging
2023-11-25T23:00:00.284Z,2023-11-26T00:00:00.284Z,PM1,13.41,PM25,21.79,PM10,25.58,PRESSURE,1004.47,HUMIDITY,89.84,TEMPERATURE,25.97,AIRLY_CAQI,36.32,LOW,Well... It's been better.,Do you smell it? That's the smell of clean air. :),#D1CF1E,WHO,PM10,45,56.84,24h,WHO,PM25,15,145.28,24h
```

This maps to the following AFRI_SET_COMMON json message format:

```json
[{
    "sensor_id": "unknown",
    "timestamp": "2023-11-25T23:00:00.284Z",
    "pm1": 13.41,
    "pm25": 21.79,
    "pm10": 25.58,
    "temperature": 25.97,
    "humidity": 89.84
}]
```