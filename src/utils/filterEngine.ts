import { DataItem } from '@/types/DataTypes';
import { FieldConfig, ConfigSchema } from '@/types/ConfigTypes';

export interface FilterState {
  [fieldName: string]: any;
}

export interface FilterOption {
  field: string;
  label: string;
  type: FieldConfig['type'];
  options?: string[]; // For categorical fields
}

export const getFilterableFields = (config: ConfigSchema, data: DataItem[]): FilterOption[] => {
  return Object.entries(config)
    .filter(([_, fieldConfig]) => fieldConfig.visible)
    .map(([field, fieldConfig]) => {
      const filterOption: FilterOption = {
        field,
        label: fieldConfig.label,
        type: fieldConfig.type
      };

      // For categorical fields, extract unique values
      if (fieldConfig.type === 'categorical') {
        const uniqueValues = [...new Set(data.map(item => item[field]).filter(Boolean))];
        filterOption.options = uniqueValues.map(String).sort();
      }

      return filterOption;
    });
};

export const applyFilters = (data: DataItem[], filters: FilterState, config: ConfigSchema): DataItem[] => {
  return data.filter(item => {
    return Object.entries(filters).every(([field, filterValue]) => {
      if (filterValue == null || filterValue === '' || filterValue === 'all') {
        return true; // No filter applied
      }

      // Handle special group filters
      if (field.startsWith('_group_')) {
        const groupField = field.replace('_group_', '');
        const selectedGroups = Array.isArray(filterValue) ? filterValue : [filterValue];
        return selectedGroups.includes(item[groupField]);
      }

      const fieldConfig = config[field];
      if (!fieldConfig) return true;

      const itemValue = item[field];

      switch (fieldConfig.type) {
        case 'boolean':
          return Boolean(itemValue) === Boolean(filterValue);
        
        case 'categorical':
          return String(itemValue) === String(filterValue);
        
        case 'numeric':
        case 'percentage':
          // For numeric filters, we can implement range filtering later
          // For now, just exact match
          return itemValue === filterValue;
        
        default:
          return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
      }
    });
  });
};

export const searchData = (data: DataItem[], searchTerm: string, config: ConfigSchema): DataItem[] => {
  if (!searchTerm.trim()) return data;

  const searchLower = searchTerm.toLowerCase();
  const searchableFields = Object.entries(config)
    .filter(([_, fieldConfig]) => fieldConfig.searchable)
    .map(([field]) => field);

  return data.filter(item => {
    return searchableFields.some(field => {
      const value = item[field];
      return String(value).toLowerCase().includes(searchLower);
    });
  });
};