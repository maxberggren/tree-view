
export interface StockData {
  symbol: string;
  name: string;
  value: number; // Market cap or size
  change: number; // Percentage change
  sector: string;
}

export interface SectorData {
  name: string;
  children: StockData[];
}

export interface TreemapNode {
  data: StockData | SectorData;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  children?: TreemapNode[];
  parent?: TreemapNode;
  value?: number;
}
