import { FieldConfig, ColorBin, GradientColors, BooleanColors, CategoricalColors } from '@/types/ConfigTypes';

export interface ColorResult {
  color: string;
  borderColor: string;
  label: string;
}

export const getColor = (value: any, config: FieldConfig, dataRange?: { min: number; max: number }): ColorResult => {
  const defaultColor = { color: '#6B7280', borderColor: '#4B5563', label: 'Unknown' };
  
  if (!config.colorMode) {
    return defaultColor;
  }

  switch (config.colorMode) {
    case 'boolean':
      if (!config.colors) return defaultColor;
      // Explicitly handle boolean values, including false
      if (value === true || value === false || value === 'true' || value === 'false') {
        const boolValue = value === true || value === 'true';
        return getBooleanColor(boolValue, config.colors as BooleanColors);
      }
      return defaultColor;
    
    case 'categorical':
      if (!config.colors) return defaultColor;
      return getCategoricalColor(value, config.colors as CategoricalColors);
    
    case 'gradient':
      if (!config.colors || !dataRange) return defaultColor;
      return getGradientColor(value, config.colors as GradientColors, config, dataRange);
    
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

const getGradientColor = (value: number, colors: GradientColors, config: FieldConfig, dataRange: { min: number; max: number }): ColorResult => {
  // Normalize the value based on the actual data range
  const normalizedValue = dataRange.max === dataRange.min 
    ? 0 
    : Math.max(0, Math.min(1, (value - dataRange.min) / (dataRange.max - dataRange.min)));
  
  const { min, max } = colors;
  
  const r = Math.round(min.r + (max.r - min.r) * normalizedValue);
  const g = Math.round(min.g + (max.g - min.g) * normalizedValue);
  const b = Math.round(min.b + (max.b - min.b) * normalizedValue);
  
  const borderR = Math.max(0, r - 20);
  const borderG = Math.max(0, g - 20);
  const borderB = Math.max(0, b - 20);

  return {
    color: `rgb(${r}, ${g}, ${b})`,
    borderColor: `rgb(${borderR}, ${borderG}, ${borderB})`,
    label: config.type === 'percentage' ? `${(value * 100).toFixed(config.decimals || 1)}%` : value.toFixed(config.decimals || 1)
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