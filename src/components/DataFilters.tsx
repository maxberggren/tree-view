import React from 'react';
import { ChevronDownIcon, ChevronUpIcon, SettingsIcon } from 'lucide-react';
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
    // Clear any existing group filters when changing groupBy
    const filteredFilters = Object.fromEntries(
      Object.entries(state.filters).filter(([key]) => !key.startsWith('_group_'))
    );
    
    onStateChange({ 
      ...state, 
      groupBy,
      filters: filteredFilters
    });
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

  const hasActiveFilters = () => {
    return Object.keys(state.filters).some(key => 
      state.filters[key] !== undefined && 
      state.filters[key] !== null && 
      state.filters[key] !== '' &&
      !(Array.isArray(state.filters[key]) && state.filters[key].length === 0)
    );
  };

  const clearAllFilters = () => {
    onStateChange({
      ...state,
      filters: {}
    });
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 bg-gray-800 border-b border-gray-700">
      {/* Toggle Bar */}
      <div 
        className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-750 transition-colors"
      >
        <div 
          className="flex items-center gap-1.5 cursor-pointer flex-1"
          onClick={onToggle}
        >
          <SettingsIcon size={14} className="text-gray-400" />
          <span className="text-white text-xs font-medium">
            Filters & Settings
          </span>
          {hasActiveFilters() && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAllFilters();
              }}
              className="text-blue-400 hover:text-white transition-colors text-xs ml-2"
              title="Clear all filters"
            >
              clear filters
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <div 
            className="text-white cursor-pointer p-1"
            onClick={onToggle}
          >
            {isExpanded ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3">
            {/* Group Mode */}
            <div>
              <label className="block text-xs font-medium text-white mb-1">
                Group Mode
              </label>
              <div className="relative">
                <select
                  value={state.groupBy}
                  onChange={(e) => handleGroupByChange(e.target.value)}
                  className="w-full px-2 py-1.5 pr-7 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="">No Grouping</option>
                  {groupableFields.map(({ field, label }) => (
                    <option key={field} value={field}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon 
                  size={14} 
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Color Mode */}
            <div>
              <label className="block text-xs font-medium text-white mb-1">
                Color Mode
              </label>
              <div className="relative">
                <select
                  value={state.colorBy}
                  onChange={(e) => handleColorByChange(e.target.value)}
                  className="w-full px-2 py-1.5 pr-7 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  {colorableFields.map(({ field, label }) => (
                    <option key={field} value={field}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon 
                  size={14} 
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Group Filters */}
            <div>
              <label className="block text-xs font-medium text-white mb-1">
                {state.groupBy ? config[state.groupBy]?.label || state.groupBy : 'Groups'}
              </label>
              {state.groupBy && (
                <div className="space-y-0.5 max-h-24 overflow-y-auto custom-scrollbar">
                  {(() => {
                    // Get unique values for the current group field
                    const uniqueValues = [...new Set(data.map(item => item[state.groupBy]).filter(Boolean))];
                    const selectedGroups = state.filters[`_group_${state.groupBy}`] || [];
                    
                    return uniqueValues.map((value) => (
                      <label key={value} className="flex items-center space-x-1.5 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(value)}
                          onChange={(e) => {
                            const currentSelected = state.filters[`_group_${state.groupBy}`] || [];
                            let newSelected;
                            if (e.target.checked) {
                              newSelected = [...currentSelected, value];
                            } else {
                              newSelected = currentSelected.filter(item => item !== value);
                            }
                            handleFilterChange(`_group_${state.groupBy}`, newSelected.length === 0 ? undefined : newSelected);
                          }}
                          className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 scale-75"
                        />
                        <span className="text-white truncate flex-1 text-xs">{String(value)}</span>
                        <span className="text-gray-400 pr-2" style={{ fontSize: '10px' }}>
                          ({data.filter(item => item[state.groupBy] === value).length})
                        </span>
                      </label>
                    ));
                  })()}
                </div>
              )}
              {!state.groupBy && (
                <div className="text-xs text-gray-400">
                  Select a group mode to enable filtering
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};