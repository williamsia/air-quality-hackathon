import { Static, Type } from '@sinclair/typebox';
import { count } from '../common/schemas.js';

/**
 * Measurement path parameters
 */

/**
 * Measurement query string parameters
 */
export const feedIdQS = Type.Optional(
	Type.String({
		description: 'Filters measurements based on a upload feed ID.',
	})
);
export const sensorIdQS = Type.Optional(
	Type.String({
		description: 'Filters measurements based on a sensor ID.',
	})
);
export const dateFromQS = Type.Optional(
	Type.String({
		description: 'Filters processed measurements that have a ISO8601 timestamp to be greater than or equal to this date. i.e. 2023-01-26T17:38:05.205Z',
	})
);
export const dateToQS = Type.Optional(
	Type.String({
		description: 'Filters processed measurements that have a ISO8601 timestamp to be lesser than or equal to this date.  i.e. 2023-01-26T17:38:05.205Z',
	})
);
export const downloadQS = Type.Optional(
	Type.Boolean({
		description: 'Generate URL to download measurements',
	})
);

/**
 * Measurement resources
 */

export const sensorId = Type.String({ description: 'Sensor ID' });
export const manufacturerName = Type.String({ description: 'Manufacturer Name' });
export const timestamp = Type.String({ description: 'Timestamp' });
export const pm1 = Type.Number({ description: 'PM1' });
export const pm2p5 = Type.Number({ description: 'PM2.5' });
export const pm10 = Type.Number({ description: 'PM10' });
export const temperature = Type.Number({ description: 'Temperature' });
export const humidity = Type.Number({ description: 'Humidity' });

export const measurementResource = Type.Object({sensorId, manufacturerName, timestamp, pm1, pm2p5, pm10, temperature, humidity}, {description: 'Measurements.', $id: 'measurementResource',});
export type Measurement = Static<typeof measurementResource>;

// const url = Type.String({ description: 'Pre-signed S3 url to download measurements.', $id: 'url'});

export const measurementsList = Type.Object(
	{
		measurements: Type.Array(Type.Ref(measurementResource)),
		pagination: Type.Optional(
			Type.Object({
				lastEvaluatedToken: Type.Optional(Type.Number({ description: 'Token used to paginate to the next page of search result.' })),
				count: Type.Optional(count),
			})
		),
	},
	{ $id: 'measurementsList' }
);

export type MeasurementsList = Static<typeof measurementsList>;

export const measurementsResponse = Type.Object(
	{
		measurements: Type.Optional(Type.Array(Type.Ref(measurementResource))),
		pagination: Type.Optional(
			Type.Object({
				lastEvaluatedToken: Type.Optional(Type.Number({ description: 'Token used to paginate to the next page of search result.' })),
				count: Type.Optional(count),
			})
		),
		url: Type.Optional(Type.String({ description: 'Pre-signed S3 url to download measurements.', $id: 'url'}))
	},
	{ $id: 'measurementsResponse' }
);
