
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Settings, Play, Pause } from 'lucide-react';
import { ColorMode, GroupMode } from '@/types/TreemapData';

interface FilterState {
  colorMode: ColorMode;
  groupMode: GroupMode;
  cycleEnabled: boolean;
  cycleInterval: number;
  selectedValues: string[]; // Dynamic filter values based on group mode
}

interface BuildingFiltersProps {
  isExpanded: boolean;
  onToggle: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableClients: string[];
  filteredData: any[];
}

export const BuildingFilters: React.FC<BuildingFiltersProps> = ({
  isExpanded,
  onToggle,
  filters,
  onFiltersChange,
  availableClients,
  filteredData
}) => {
  const groupModeOptions = [
    { value: 'client', label: 'Client' },
    { value: 'country', label: 'Country' },
    { value: 'isOnline', label: 'Online Status' },
    { value: 'hasClimateBaseline', label: 'Climate Baseline' },
    { value: 'hasReadWriteDiscrepancies', label: 'Read/Write Issues' },
    { value: 'hasZoneAssets', label: 'Zone Assets' },
    { value: 'hasHeatingCircuit', label: 'Heating Circuit' },
    { value: 'hasVentilation', label: 'Ventilation' },
    { value: 'missingVSGTOVConnections', label: 'Missing VSGT OV' },
    { value: 'missingLBGPOVConnections', label: 'Missing LBGP OV' },
    { value: 'missingLBGTOVConnections', label: 'Missing LBGT OV' },
    { value: 'automaticComfortScheduleActive', label: 'Auto Comfort Schedule' },
    { value: 'manualComfortScheduleActive', label: 'Manual Comfort Schedule' },
    { value: 'componentsErrors', label: 'Component Errors' },
    { value: 'hasDistrictHeatingMeter', label: 'Heating Meter' },
    { value: 'hasDistrictCoolingMeter', label: 'Cooling Meter' },
    { value: 'hasElectricityMeter', label: 'Electricity Meter' },
    { value: 'lastWeekUptime', label: 'Last Week Uptime' },
  ];

  const colorModeOptions = [
    { value: 'temperature', label: 'Temperature' },
    { value: 'comfort', label: 'Comfort' },
    { value: 'adaptiveMin', label: 'Adaptive Min' },
    { value: 'adaptiveMax', label: 'Adaptive Max' },
    { value: 'hasClimateBaseline', label: 'Climate Baseline' },
    { value: 'hasReadWriteDiscrepancies', label: 'Read/Write Issues' },
    { value: 'hasZoneAssets', label: 'Zone Assets' },
    { value: 'hasHeatingCircuit', label: 'Heating Circuit' },
    { value: 'hasVentilation', label: 'Ventilation' },
    { value: 'missingVSGTOVConnections', label: 'Missing VSGT OV' },
    { value: 'missingLBGPOVConnections', label: 'Missing LBGP OV' },
    { value: 'missingLBGTOVConnections', label: 'Missing LBGT OV' },
    { value: 'savingEnergy', label: 'Energy Saving' },
    { value: 'automaticComfortScheduleActive', label: 'Auto Comfort Schedule' },
    { value: 'manualComfortScheduleActive', label: 'Manual Comfort Schedule' },
    { value: 'componentsErrors', label: 'Component Errors' },
    { value: 'modelTrainingTestR2Score', label: 'Model R2 Score' },
    { value: 'hasDistrictHeatingMeter', label: 'Heating Meter' },
    { value: 'hasDistrictCoolingMeter', label: 'Cooling Meter' },
    { value: 'hasElectricityMeter', label: 'Electricity Meter' },
    { value: 'lastWeekUptime', label: 'Last Week Uptime' },
  ];

  const cycleIntervalOptions = [
    { value: '2', label: '2 seconds' },
    { value: '3', label: '3 seconds' },
    { value: '5', label: '5 seconds' },
    { value: '10', label: '10 seconds' },
    { value: '15', label: '15 seconds' },
    { value: '30', label: '30 seconds' },
  ];

  // Get available filter options based on the current group mode
  const getFilterOptions = () => {
    if (!filteredData || filteredData.length === 0) return [];
    
    switch (filters.groupMode) {
      case 'client':
        return [...new Set(filteredData.map(building => building.client))].sort();
      case 'country':
        return [...new Set(filteredData.map(building => building.country))].sort();
      case 'isOnline':
        return ['Online', 'Offline'];
      case 'lastWeekUptime':
        return ['Excellent (95%+)', 'Good (90-95%)', 'Fair (80-90%)', 'Poor (<80%)'];
      default:
        // For boolean feature-based grouping
        return ['Yes', 'No'];
    }
  };

  // Get the display value for a building based on the current group mode
  const getDisplayValue = (building: any, groupMode: GroupMode): string => {
    switch (groupMode) {
      case 'client':
        return building.client;
      case 'country':
        return building.country;
      case 'isOnline':
        return building.isOnline ? 'Online' : 'Offline';
      case 'lastWeekUptime':
        const uptime = building.lastWeekUptime;
        if (uptime >= 0.95) return 'Excellent (95%+)';
        if (uptime >= 0.90) return 'Good (90-95%)';
        if (uptime >= 0.80) return 'Fair (80-90%)';
        return 'Poor (<80%)';
      default:
        // For boolean features
        return building[groupMode] ? 'Yes' : 'No';
    }
  };

  const handleFilterToggle = (value: string) => {
    const newSelected = filters.selectedValues.includes(value)
      ? filters.selectedValues.filter(v => v !== value)
      : [...filters.selectedValues, value];
    
    onFiltersChange({ ...filters, selectedValues: newSelected });
  };

  const handleGroupModeChange = (newGroupMode: GroupMode) => {
    // Clear selected values when changing group mode
    onFiltersChange({ 
      ...filters, 
      groupMode: newGroupMode,
      selectedValues: []
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      ...filters,
      selectedValues: []
    });
  };

  const getGroupModeLabel = () => {
    const option = groupModeOptions.find(opt => opt.value === filters.groupMode);
    return option ? option.label : filters.groupMode;
  };

  const getActiveFiltersCount = () => {
    return filters.selectedValues.length;
  };

  return (
    <div className="absolute top-0 left-0 w-full z-30 bg-gray-800 border-b border-gray-700">
      {/* Toggle Bar */}
      <div className="flex items-center justify-between px-3 py-1 cursor-pointer hover:bg-gray-700" onClick={onToggle}>
        <div className="flex items-center gap-2">
          <Settings className="w-3 h-3 text-gray-300" />
          <span className="text-xs text-gray-300">Filters & Settings</span>
          {getActiveFiltersCount() > 0 && (
            <>
              <span className="text-xs text-blue-400 font-medium">
                ({getActiveFiltersCount()} filters)
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllFilters();
                }}
                className="text-xs text-red-400 hover:text-red-300 underline"
              >
                clear
              </button>
            </>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 text-gray-300" />
        ) : (
          <ChevronDown className="w-3 h-3 text-gray-300" />
        )}
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="p-4 bg-gray-800 border-t border-gray-700 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Group Mode & Color Mode Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-200">Group Mode</Label>
              <Select 
                value={filters.groupMode} 
                onValueChange={handleGroupModeChange}
              >
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {groupModeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-600">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label className="text-sm font-medium text-gray-200">Color Mode</Label>
              <Select 
                value={filters.colorMode} 
                onValueChange={(value) => onFiltersChange({ ...filters, colorMode: value as ColorMode })}
              >
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {colorModeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-600">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Cycle Controls */}
              <div className="space-y-2 pt-2 border-t border-gray-600">
                <div className="flex items-center gap-2">
                  {filters.cycleEnabled ? (
                    <Play className="w-4 h-4 text-green-400" />
                  ) : (
                    <Pause className="w-4 h-4 text-gray-400" />
                  )}
                  <Label className="text-sm text-gray-200">Cycle every X</Label>
                  <Switch
                    checked={filters.cycleEnabled}
                    onCheckedChange={(checked) => onFiltersChange({ ...filters, cycleEnabled: checked })}
                  />
                </div>
                
                {filters.cycleEnabled && (
                  <Select 
                    value={filters.cycleInterval.toString()} 
                    onValueChange={(value) => onFiltersChange({ ...filters, cycleInterval: parseInt(value) })}
                  >
                    <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {cycleIntervalOptions.map(option => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-600">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Dynamic Filter Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-200">Filter by {getGroupModeLabel()}</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {getFilterOptions().map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-${option}`}
                      checked={filters.selectedValues.includes(option)}
                      onCheckedChange={() => handleFilterToggle(option)}
                      className="border-gray-500"
                    />
                    <Label htmlFor={`filter-${option}`} className="text-sm text-gray-300 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-200">Statistics</Label>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Total Buildings: {filteredData?.length || 0}</div>
                <div>Active Filters: {getActiveFiltersCount()}</div>
                <div>Group Mode: {getGroupModeLabel()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
