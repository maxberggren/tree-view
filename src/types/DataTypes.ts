// Generic data item that can contain any fields
export type DataItem = Record<string, any>;

// For treemap hierarchical structure
export interface GroupedData {
  name: string;
  children: DataItem[];
}

// For treemap nodes
export interface TreemapNode {
  data: DataItem | GroupedData;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  children?: TreemapNode[];
  parent?: TreemapNode;
  value?: number;
}