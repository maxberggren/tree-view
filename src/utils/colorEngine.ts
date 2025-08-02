import { FieldConfig, ColorBin, GradientColors, BooleanColors, CategoricalColors } from '@/types/ConfigTypes';

export interface ColorResult {
  color: string;
  borderColor: string;
  label: string;
}

export const getColor = (value: any, config: FieldConfig): ColorResult => {
  const defaultColor = { color: '#6B7280', borderColor: '#4B5563', label: 'Unknown' };
  
  if (!config.colorMode) {
    return defaultColor;
  }

  switch (config.colorMode) {
    case 'boolean':
      if (!config.colors) return defaultColor;
      return getBooleanColor(value, config.colors as BooleanColors);
    
    case 'categorical':
      if (!config.colors) return defaultColor;
      return getCategoricalColor(value, config.colors as CategoricalColors);
    
    case 'gradient':
      if (!config.colors) return defaultColor;
      return getGradientColor(value, config.colors as GradientColors, config);
    
    case 'bins':
      if (!config.bins || config.bins.length === 0) return defaultColor;
      return getBinColor(value, config.bins, config);
    
    default:
      return defaultColor;
  }
};

const getBooleanColor = (value: boolean, colors: BooleanColors): ColorResult => {
  const colorConfig = value ? colors.true : colors.false;
  return {
    color: colorConfig.bg,
    borderColor: colorConfig.border,
    label: colorConfig.label
  };
};

const getCategoricalColor = (value: string, colors: CategoricalColors): ColorResult => {
  const colorConfig = colors[value] || colors.default;
  return {
    color: colorConfig.bg,
    borderColor: colorConfig.border,
    label: String(value)
  };
};

const getGradientColor = (value: number, colors: GradientColors, config: FieldConfig): ColorResult => {
  const t = Math.max(0, Math.min(1, value)); // Clamp between 0 and 1
  const { min, max } = colors;
  
  const r = Math.round(min.r + (max.r - min.r) * t);
  const g = Math.round(min.g + (max.g - min.g) * t);
  const b = Math.round(min.b + (max.b - min.b) * t);
  
  const borderR = Math.max(0, r - 20);
  const borderG = Math.max(0, g - 20);
  const borderB = Math.max(0, b - 20);

  return {
    color: `rgb(${r}, ${g}, ${b})`,
    borderColor: `rgb(${borderR}, ${borderG}, ${borderB})`,
    label: config.type === 'percentage' ? `${(value * 100).toFixed(1)}%` : value.toString()
  };
};

const getBinColor = (value: number, bins: ColorBin[], config: FieldConfig): ColorResult => {
  for (const bin of bins) {
    if (value >= bin.min && value < bin.max) {
      return {
        color: bin.color,
        borderColor: bin.borderColor,
        label: bin.label
      };
    }
  }
  
  // Fallback to default
  return { color: '#6B7280', borderColor: '#4B5563', label: 'Out of range' };
};