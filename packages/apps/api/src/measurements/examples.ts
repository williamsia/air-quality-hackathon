import type { MeasurementsList, Measurement } from './schemas.js';

const manufacturerName = 'Example Sensor Manufacturer';
const sensorId = 'ajcuhek13ks';
const timestamp = '2022-08-10T23:55:20.322Z';
const pm1 = 1;
const pm2p5 = 2.5;
const pm10 = 10;
const temperature = 25.5;
const humidity = 69.45;

export const exampleMeasurement: Measurement = {
    manufacturerName,
    sensorId,
    timestamp,
    pm1,
    pm2p5,
    pm10,
    temperature,
    humidity
};


export const measurementListExample = () => {
	let list: MeasurementsList = {
		measurements: [
            exampleMeasurement
        ]
	};

	return list;
};
