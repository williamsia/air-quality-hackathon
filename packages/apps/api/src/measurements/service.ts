import { FastifyBaseLogger } from "fastify";
// @ts-ignore
import ow from 'ow';
import { MeasurementsList } from "./schemas.js";
import { MeasurementsRepository } from "./repository.js";

import { GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { parseRow } from "./util.js";

export class MeasurementsService {

	constructor(private readonly logger: FastifyBaseLogger,
				private readonly s3Client: S3Client,
				private readonly feedBucket: string,
				private readonly repository: MeasurementsRepository) {
				}

	public async list(feedId: string, sensorId: string, dateFrom: string, dateTo: string): Promise<MeasurementsList> {
		this.logger.debug(`MeasurementsService > list > feedId: ${feedId}, sensorId: ${sensorId}, dateFrom: ${dateFrom}, dateTo: ${dateTo}`);

		const measurements = await this.repository.list(feedId, sensorId, dateFrom, dateTo);
		
		this.logger.debug(`MeasurementsService > list > exit > measurements: ${JSON.stringify(measurements)}`);
		return measurements;
	}

	public async download(feedId: string): Promise<string> {
		this.logger.debug(`MeasurementsService > download > feedId: ${feedId}`);
		ow(feedId, ow.string.not.empty);
		// get measurements for feed
		const measurements = await this.repository.getFeedMeasurements(feedId);

		this.logger.debug(`MeasurementsService > download > measurements: ${JSON.stringify(measurements)}`);

		
		const headers = measurements.columnInfo.map((ci) => ci.Name);

		const csvHeader = headers.join(',');
		this.logger.debug(`MeasurementsService > download > csvHeader: ${csvHeader}`);

		const csv = [];
		csv.push(csvHeader);
		
		measurements.rows.forEach((r) => {
			const parsedRow = parseRow(measurements.columnInfo, r);
			this.logger.debug(`row: ${parsedRow}`);
			const parsedRowJson = JSON.parse(parsedRow);
			const rowValues = [];
			headers.forEach((h) => {
				this.logger.debug(`${h}:${parsedRowJson[h]}`);
				rowValues.push(parsedRowJson[h]);
			});
			csv.push(rowValues.join(','));
		});

		const csvText = csv.join('\r\n');
		this.logger.debug(`csvText: ${csvText}`);


		const itemKey = `feeds/output/${feedId}`

		// write to S3
		const putParams: PutObjectCommandInput = { Bucket: this.feedBucket, Key: itemKey, Body: csvText };
		const s3PutCommand = new PutObjectCommand(putParams);
		await this.s3Client.send(s3PutCommand);

		// generate presigned url for measurements
		const getParams = { Bucket: this.feedBucket, Key: itemKey };
		const s3GetCommand = new GetObjectCommand(getParams);
		const signedUrl = await getSignedUrl(this.s3Client, s3GetCommand, { expiresIn: 300 });

		this.logger.debug(`MeasurementsService > download > exit > url: ${signedUrl}`);
		return signedUrl;
	}

}
