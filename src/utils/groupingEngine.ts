import { DataItem, GroupedData } from '@/types/DataTypes';
import { FieldConfig, ConfigSchema } from '@/types/ConfigTypes';

export const getGroupableFields = (config: ConfigSchema): Array<{ field: string; label: string }> => {
  return Object.entries(config)
    .filter(([_, fieldConfig]) => 
      fieldConfig.type === 'categorical' || 
      fieldConfig.type === 'boolean'
    )
    .map(([field, fieldConfig]) => ({
      field,
      label: fieldConfig.label
    }));
};

export const groupData = (data: DataItem[], groupField: string): GroupedData[] => {
  if (!groupField) {
    return [{ name: 'All Items', children: data }];
  }

  const groups = new Map<string, DataItem[]>();
  
  data.forEach(item => {
    const groupValue = String(item[groupField] || 'Unknown');
    if (!groups.has(groupValue)) {
      groups.set(groupValue, []);
    }
    groups.get(groupValue)!.push(item);
  });

  return Array.from(groups.entries()).map(([name, children]) => ({
    name,
    children
  }));
};

export const getSizeField = (config: ConfigSchema): string => {
  // Find the first numeric field that could represent size
  const numericFields = Object.entries(config)
    .filter(([_, fieldConfig]) => fieldConfig.type === 'numeric')
    .map(([field]) => field);

  // Look for common size-related field names
  const sizeFieldNames = ['squareMeters', 'area', 'size', 'value', 'amount'];
  
  for (const sizeField of sizeFieldNames) {
    if (numericFields.includes(sizeField)) {
      return sizeField;
    }
  }
  
  // Fallback to first numeric field
  return numericFields[0] || 'id';
};