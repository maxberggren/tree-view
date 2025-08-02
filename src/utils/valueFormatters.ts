import { FieldConfig } from '@/types/ConfigTypes';

export const formatValue = (value: any, config: FieldConfig): string => {
  if (value == null) return 'N/A';

  switch (config.type) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    
    case 'percentage':
      const percentage = (value * 100).toFixed(config.decimals || 1);
      return `${percentage}%`;
    
    case 'numeric':
      const formatted = Number(value).toFixed(config.decimals || 0);
      return config.unit ? `${formatted}${config.unit}` : formatted;
    
    case 'categorical':
    case 'text':
    case 'identifier':
    default:
      return String(value);
  }
};

export const formatTooltipValue = (value: any, config: FieldConfig): string => {
  const baseFormat = formatValue(value, config);
  
  // For boolean fields, use custom labels if available
  if (config.type === 'boolean' && config.colors && 'true' in config.colors && 'false' in config.colors) {
    const booleanColors = config.colors as { true: { label: string }; false: { label: string } };
    return value ? booleanColors.true.label : booleanColors.false.label;
  }
  
  return baseFormat;
};