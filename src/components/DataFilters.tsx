import React from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { ConfigSchema } from '@/types/ConfigTypes';
import { DataItem } from '@/types/DataTypes';
import { getGroupableFields } from '@/utils/groupingEngine';
import { getFilterableFields } from '@/utils/filterEngine';

interface TreemapFilterState {
  groupBy: string;
  colorBy: string;
  filters: Record<string, any>;
}

interface DataFiltersProps {
  config: ConfigSchema;
  data: DataItem[];
  state: TreemapFilterState;
  onStateChange: (state: TreemapFilterState) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export const DataFilters: React.FC<DataFiltersProps> = ({
  config,
  data,
  state,
  onStateChange,
  isExpanded,
  onToggle
}) => {
  const groupableFields = getGroupableFields(config);
  const colorableFields = Object.entries(config)
    .filter(([_, fieldConfig]) => fieldConfig.colorMode)
    .map(([field, fieldConfig]) => ({ field, label: fieldConfig.label }));
  
  const filterableFields = getFilterableFields(config, data);

  const handleGroupByChange = (groupBy: string) => {
    onStateChange({ ...state, groupBy });
  };

  const handleColorByChange = (colorBy: string) => {
    onStateChange({ ...state, colorBy });
  };

  const handleFilterChange = (field: string, value: any) => {
    onStateChange({
      ...state,
      filters: {
        ...state.filters,
        [field]: value
      }
    });
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 bg-gray-800 border-b border-gray-700">
      {/* Toggle Bar */}
      <div 
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <span className="text-white text-sm font-medium">
            Filters & Controls
          </span>
          <span className="text-gray-400 text-xs">
            {data.length} items
          </span>
        </div>
        <div className="text-white">
          {isExpanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {/* Group By */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Group By
              </label>
              <select
                value={state.groupBy}
                onChange={(e) => handleGroupByChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">No Grouping</option>
                {groupableFields.map(({ field, label }) => (
                  <option key={field} value={field}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Color By */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Color By
              </label>
              <select
                value={state.colorBy}
                onChange={(e) => handleColorByChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                {colorableFields.map(({ field, label }) => (
                  <option key={field} value={field}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filters */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Filters
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filterableFields.slice(0, 3).map((filterField) => (
                  <div key={filterField.field}>
                    {filterField.type === 'categorical' && filterField.options && (
                      <select
                        value={state.filters[filterField.field] || 'all'}
                        onChange={(e) => handleFilterChange(filterField.field, e.target.value === 'all' ? '' : e.target.value)}
                        className="w-full px-2 py-1.5 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      >
                        <option value="all">All {filterField.label}</option>
                        {filterField.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {filterField.type === 'boolean' && (
                      <select
                        value={state.filters[filterField.field] || 'all'}
                        onChange={(e) => handleFilterChange(filterField.field, e.target.value === 'all' ? '' : e.target.value === 'true')}
                        className="w-full px-2 py-1.5 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      >
                        <option value="all">All {filterField.label}</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};