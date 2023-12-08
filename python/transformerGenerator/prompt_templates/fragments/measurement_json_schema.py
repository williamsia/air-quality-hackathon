measurement_json_schema = """
{{
"$schema": "https://json-schema.org/draft/2020-12",
"type": "object",
"properties": {{
	"sensor_id": {{
		"type": "string",
        "description": "Unique ID of the sensor device"
	}},
	"timestamp": {{
		"type": "string",
		"format": "datetime",
        "description": "The timestamp of the measurement"
	}},
	"pm0_3": {{
		"type": "number",
        "description": "The PM 0.3 concentration in µg/m³"
	}},
	"pm0_5": {{
	"	type": "number",
        "description": "The PM 0.5 concentration in µg/m³"
	}},
	"pm1": {{
		"type": "number",
        "description": "The PM 1 concentration in µg/m³"
	}},
	"pm2_5": {{
		"type": "number",
        "description": "The PM 2.5 concentration in µg/m³"
	}},
	"pm4": {{
		"type": "number",
        "description": "The PM 4 concentration in µg/m³"
	}},
	"pm5": {{
		"type": "number",
        "description": "The PM 5 concentration in µg/m³"
	}},
	"pm10": {{
		"type": "number",
        "description": "The PM 10 concentration in µg/m³"
	}},
	"temperature": {{
		"type": "number",
        "description": "The local temperature when the measurement was taken"
	}},
	"humidity": {{
		"type": "number",
        "description": "The local relative humidity when the measurement was taken"
	}}
}},
"required": [
	"sensor_id",
	"timestamp"
]
}}"""
