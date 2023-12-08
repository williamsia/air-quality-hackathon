export type QueryRequest = {
	sensorId?: string;
	dateFrom?: Date;
	dateTo?: Date;
	count?: number;
	nextToken?: number;
};

export type QueryResponse = {
	nextToken?: number;
	data: Record<string, string>[];
};
