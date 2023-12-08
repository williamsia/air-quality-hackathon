export interface Evaluation {
	id: string;
	name: string;
	description?: string;
	accounts?: string[];
	tags?: { [key: string]: string };
	startDate: string,
	endDate: string,
}

export interface Scenario {
	id: string;
	evaluationId: string;
	name: string;
	description?: string;
	services: string[];
}

export interface Account {
	name: string;
	id: string;
	status: string;
}

export interface LineItem {
	id: string;
	start_date: string;
	account_id: string;
	resource_id: string;
	instance_id?: string;
	region: string;
	instance_type: string;
	usage_amount_hours: number;
	usage_duration: number;
	scope_1: number;
	scope_2_lbm: number;
	scope_2_mbm: number;
	scope_3: number;
	updated_region?: string;
	updated_instance_type?: string;
	updated_usage_duration?: number;
}

export type LineItemList = LineItem[];

export interface EvaluationList {
	evaluations: Evaluation[];
}

export interface AccountList {
	accounts: Account[];
}

export interface ScenarioList {
	scenarios: Scenario[];
}

export interface User {
	email: string;
}

export interface Session {
	user?: User;
}

export interface Region {
	id: string;
	name: string;
	co2e: number,
	pricing: {
		value: number;
		currency: string;
	};
}

export type RegionList = {
	regions: Region[]
}

export interface Country {
	value: string;
	latitude: number | null;
	longitude: number | null;
	label: string;
}

export interface InstanceType {
	id: string;
	memoryInMiB: number;
	vCpu: number;
	processor: string;
	storage: string;
	network: string;
	co2e: number;
}

export type InstanceTypeList = {
	instanceTypes: InstanceType[]
}

export interface Ratecard {
	region: string;
	startDate: string;
	endDate: string;
	usageType: string;
	scope2_lbm_co2e: number;
	scope2_mbm_co2e: number;
	scope1_co2e: number;
}

export type RatecardList = {
	ratecards: Ratecard[];
}

export type LineItemWithoutMonth = Omit<LineItem, 'start_date'>;

export type LineItemWithoutMonthList = LineItemWithoutMonth[];

export type LineItemDelta = {
	account_id: string;
	resource_id: string;
	instance_id?: string;
	baseline_usage_duration: number,
	baseline_region: string,
	baseline_instance_type: string,
	baseline_scope_1: number;
	baseline_scope_2_lbm: number;
	baseline_scope_2_mbm: number;
	optimized_usage_duration: number,
	optimized_region: string,
	optimized_instance_type: string,
	optimized_scope_1: number;
	optimized_scope_2_lbm: number;
	optimized_scope_2_mbm: number;
}

export type LineItemDeltaList = LineItemDelta[];

export type EmissionData = Pick<LineItem, 'scope_1' | 'scope_2_mbm' | 'scope_2_lbm'>

export type LineItemSummary = {
	baselineTotalEmission?: EmissionData,
	optimizedTotalEmissionDelta?: EmissionData,
}
