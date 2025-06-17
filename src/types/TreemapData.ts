
export interface BuildingData {
  id: string; // Building ID (current shorthand)
  name: string;
  squareMeters: number; // Size for treemap
  temperature: number; // Current percentage as temperature
  client: string;
  isOnline: boolean;
  features: {
    canHeat: boolean;
    canCool: boolean;
    hasAMM: boolean;
    hasClimateBaseline: boolean;
    hasReadWriteDiscrepancies: boolean;
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

export type ColorMode = 'temperature' | 'comfort' | 'features';
