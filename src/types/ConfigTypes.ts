export type FieldType = 'identifier' | 'text' | 'numeric' | 'percentage' | 'boolean' | 'categorical';

export type ColorMode = 'gradient' | 'bins' | 'boolean' | 'categorical';

export interface ColorBin {
  min: number;
  max: number;
  label: string;
  color: string;
  borderColor: string;
}

export interface GradientColors {
  min: { r: number; g: number; b: number };
  max: { r: number; g: number; b: number };
}

export interface BooleanColors {
  true: { bg: string; border: string; label: string };
  false: { bg: string; border: string; label: string };
}

export interface CategoricalColors {
  [key: string]: { bg: string; border: string };
  default: { bg: string; border: string };
}

export interface FieldConfig {
  label: string;
  type: FieldType;
  unit?: string;
  decimals?: number;
  visible: boolean;
  searchable?: boolean;
  colorMode?: ColorMode;
  bins?: ColorBin[];
  colors?: GradientColors | BooleanColors | CategoricalColors;
}

export type ConfigSchema = Record<string, FieldConfig>;