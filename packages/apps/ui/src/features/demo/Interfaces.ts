export interface Supplier {
  id: string
  displayName: string
  country: string
}

export interface SupplierPartInfo {
  id: string
  supplierId: string
  footprint: number
  cost: number
  lastUpdated: string
  distributionStageFossilGhgEmissions: number
  productMassPerDeclaredUnit: number
  declaredUnit: string
  geographyCountry: string
  fossilGhgEmissions: number
  carbonContentTotal: number
  partialFullPcf: string
}

export interface SupplierPartUsage {
  supplierPartInfoId: string
  quantity: number
}

export interface SupplierMaterialInfo {
  id: string
  displayName: string
  supplierId: string
  technology?: string
  region?: string
  footprint?: number
  cost?: number
  lastUpdated?: string
}

export interface SupplierMaterialUsage {
  supplierMaterialInfoId: string
  quantity: number
}

export enum ComponentType {
  PURCHASED = "PURCHASED",
  MATERIAL = "MATERIAL",
  MANUFACTURED = "MANUFACTURED",
}

export interface BaseComponent {
  id: string
  displayName: string
  type: ComponentType
}

export interface ManufacturedComponent extends BaseComponent {
  type: ComponentType.MANUFACTURED
  subComponents: string[]
  processingSteps: Processing[]
}

export interface PurchasedComponent extends BaseComponent {
  type: ComponentType.PURCHASED
  supplierPartOptions: SupplierPartUsage[]
}

export interface MaterialComponent extends BaseComponent {
  type: ComponentType.MATERIAL
  supplierMaterialOptions: SupplierMaterialUsage[]
  material: Material
}

export type Component =
  | ManufacturedComponent
  | PurchasedComponent
  | MaterialComponent

export enum ProcessingType {
  HOT_ROLLING = "Hot Rolling",
  COLD_ROLLING = "Cold Rolling",
  GALVANIZING = "Galvanizing",
  FORMING = "Forming",
  STAMPING = "Stamping",
  ASSEMBLY = "Assembly",
}

export interface Processing {
  type: ProcessingType
  consumption: Consumption[]
}

export enum MaterialType {
  STEEL = "Steel",
  ALUMINUM = "Aluminum",
}

export interface Material {
  type: MaterialType
  emissionFactorId: string
}

export interface EmissionFactor {
  id: string
  displayName: string
  region: string
  value: number
}

export enum ConsumableResourceType {
  WATER = "Water",
  ELECTRICITY = "Electricity",
  GAS = "Gas",
  COMPRESSED_AIR = "Compressed Air",
}

interface RawPlusFootprint {
  raw?: number
  footprint?: number
}

export type MaterialConsumption = Partial<
  Record<MaterialType, RawPlusFootprint>
>
export type ResourceConsumption = Partial<
  Record<ConsumableResourceType, RawPlusFootprint>
>
export type ProcessFootprint = Partial<Record<ProcessingType, number>>

export interface Impact {
  footprint?: number
  purchasedComponentFootprint?: number
  resourceConsumption?: ResourceConsumption
  processFootprint?: ProcessFootprint
  materialConsumption?: MaterialConsumption
}

export interface ConsumableResource {
  type: ConsumableResourceType
  emissionFactorId: string
}

export interface Consumption {
  resource: ConsumableResource
  quantity: number
}

export type SupplierSelections = Record<string, string>
export type EfOverrides = Record<string, string>
export type ProcessOverrides = Partial<Record<ProcessingType, string>>

export interface Simulation {
  name: string
  description?: string
  supplierSelections: SupplierSelections
  efOverrides: EfOverrides
  processOverrides: ProcessOverrides
  supplierPartOverrides: SupplierPartInfo[]
}
