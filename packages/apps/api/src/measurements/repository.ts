import { FastifyBaseLogger } from "fastify";

import { TimestreamQueryClient, QueryCommand } from "@aws-sdk/client-timestream-query";
import { MeasurementsList } from "./schemas";

export class MeasurementsRepository {
	private readonly log: FastifyBaseLogger;
    private readonly timestreamQueryClient: TimestreamQueryClient;
	private readonly timestreamDatabase: string;
	private readonly timestreamTable: string;

	constructor(
		log: FastifyBaseLogger,
		queryClient: TimestreamQueryClient,
		timestreamDatabase: string,
		timestreamTable: string
	) {
		this.log = log;
		this.timestreamQueryClient = queryClient;
		this.timestreamDatabase = timestreamDatabase;
		this.timestreamTable = timestreamTable;
	}

	public async list(feedId:string, sensorId: string, dateFrom: string, dateTo: string): Promise<MeasurementsList> {
        this.log.debug(`MeasurementsRepository > list > feedId: ${feedId}, sensorId: ${sensorId}, dateFrom: ${dateFrom}, dateTo: ${dateTo}`);

        const measurements = [];

        this.log.debug(`MeasurementsRepository > list > exit > measurements: ${JSON.stringify(measurements)}`);
        return {measurements: measurements};
	}

	public async getFeedMeasurements(feedId: string): Promise<any> {
		this.log.debug(`MeasurementsRepository > getFeedMeasurements > feedId: ${feedId}`);

		const downloadQuery = `SELECT * FROM "${this.timestreamDatabase}"."${this.timestreamTable}" WHERE feed_id = '${feedId}'`;
		this.log.debug(`downloadQuery: ${downloadQuery}`);
		let queryParams = new QueryCommand({
			QueryString: downloadQuery,
		});

		let rows = [];

		let result = await this.timestreamQueryClient.send(queryParams);
		this.log.debug(`MeasurementsRepository > getFeedMeasurements > results: ${JSON.stringify(result)}`);

		const columnInfo = result.ColumnInfo;

		result.Rows.forEach((r) => { rows.push(r); });

		while (result.NextToken) {
			queryParams = new QueryCommand({
				QueryString: downloadQuery,
				NextToken: result.NextToken
			});

			result = await this.timestreamQueryClient.send(queryParams);
			result.Rows.forEach((r) => { rows.push(r); });
			this.log.debug(`MeasurementsRepository > getFeedMeasurements > results: ${JSON.stringify(result)}`);
		}

		this.log.debug(`MeasurementsRepository > getFeedMeasurements > exit >`);
		return  {columnInfo, rows };
	}
}
