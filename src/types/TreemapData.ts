
export interface BuildingData {
  id: string; // Building ID (current shorthand)
  name: string;
  squareMeters: number; // Size for treemap
  temperature: number; // Current percentage as temperature
  client: string;
  country: string; // Added country field
  isOnline: boolean;
  features: {
    adaptiveMin: number; // 0-1 value for Adaptive Min
    adaptiveMax: number; // 0-1 value for Adaptive Max
    hasClimateBaseline: boolean;
    hasReadWriteDiscrepancies: boolean;
    hasZoneAssets: boolean;
    hasHeatingCircuit: boolean;
    hasVentilation: boolean;
    missingVSGTOVConnections: boolean;
    missingLBGPOVConnections: boolean;
    missingLBGTOVConnections: boolean;
    savingEnergy: number; // -1 to 1 value representing energy saving percentage
    automaticComfortScheduleActive: boolean;
    manualComfortScheduleActive: boolean;
    componentsErrors: boolean;
    modelTrainingTestR2Score: number; // 0-1 value
    hasDistrictHeatingMeter: boolean;
    hasDistrictCoolingMeter: boolean;
    hasElectricityMeter: boolean;
  };
}

export interface ClientData {
  name: string;
  children: BuildingData[];
}

export interface TreemapNode {
  data: BuildingData | ClientData;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  children?: TreemapNode[];
  parent?: TreemapNode;
  value?: number;
}

export type ColorMode = 'temperature' | 'comfort' | 'adaptiveMin' | 'adaptiveMax' | 'hasClimateBaseline' | 'hasReadWriteDiscrepancies' | 'hasZoneAssets' | 'hasHeatingCircuit' | 'hasVentilation' | 'missingVSGTOVConnections' | 'missingLBGPOVConnections' | 'missingLBGTOVConnections' | 'savingEnergy' | 'automaticComfortScheduleActive' | 'manualComfortScheduleActive' | 'componentsErrors' | 'modelTrainingTestR2Score' | 'hasDistrictHeatingMeter' | 'hasDistrictCoolingMeter' | 'hasElectricityMeter';

export type GroupMode = 'client' | 'country' | 'isOnline' | 'hasClimateBaseline' | 'hasReadWriteDiscrepancies' | 'hasZoneAssets' | 'hasHeatingCircuit' | 'hasVentilation' | 'missingVSGTOVConnections' | 'missingLBGPOVConnections' | 'missingLBGTOVConnections' | 'automaticComfortScheduleActive' | 'manualComfortScheduleActive' | 'componentsErrors' | 'hasDistrictHeatingMeter' | 'hasDistrictCoolingMeter' | 'hasElectricityMeter';
