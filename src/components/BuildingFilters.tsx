
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Settings, Play, Pause } from 'lucide-react';
import { ColorMode, GroupMode } from '@/types/TreemapData';

interface FilterState {
  clients: string[];
  onlineOnly: boolean;
  features: {
    hasClimateBaseline: boolean;
    hasReadWriteDiscrepancies: boolean;
    hasZoneAssets: boolean;
    hasHeatingCircuit: boolean;
    hasVentilation: boolean;
    missingVSGTOVConnections: boolean;
    missingLBGPOVConnections: boolean;
    missingLBGTOVConnections: boolean;
    automaticComfortScheduleActive: boolean;
    manualComfortScheduleActive: boolean;
    componentsErrors: boolean;
    hasDistrictHeatingMeter: boolean;
    hasDistrictCoolingMeter: boolean;
    hasElectricityMeter: boolean;
    lastWeekUptime: boolean;
  };
  temperatureRange: [number, number];
  colorMode: ColorMode;
  groupMode: GroupMode;
  cycleEnabled: boolean;
  cycleInterval: number;
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

  // Get all available values for any group mode from the original data, not filtered data
  const getAllAvailableValues = (groupMode: GroupMode, data: any[]) => {
    const uniqueValues = new Set<string>();
    
    data.forEach(building => {
      switch (groupMode) {
        case 'client':
          uniqueValues.add(building.client);
          break;
        case 'country':
          uniqueValues.add(building.country);
          break;
        case 'isOnline':
          uniqueValues.add(building.isOnline ? 'Online' : 'Offline');
          break;
        case 'lastWeekUptime':
          const uptime = building.features.lastWeekUptime;
          if (uptime >= 0.95) uniqueValues.add('Excellent (95%+)');
          else if (uptime >= 0.90) uniqueValues.add('Good (90-95%)');
          else if (uptime >= 0.80) uniqueValues.add('Fair (80-90%)');
          else uniqueValues.add('Poor (<80%)');
          break;
        default:
          // For feature-based grouping
          if (groupMode in building.features) {
            const featureValue = building.features[groupMode as keyof typeof building.features];
            uniqueValues.add(typeof featureValue === 'boolean' ? (featureValue ? 'Yes' : 'No') : featureValue.toString());
          }
          break;
      }
    });
    
    return Array.from(uniqueValues).sort();
  };

  // Get currently selected values for the active group mode
  const getSelectedValues = () => {
    switch (filters.groupMode) {
      case 'client':
        return filters.clients;
      case 'isOnline':
        return filters.onlineOnly ? ['Online'] : [];
      default:
        // For feature-based filters
        if (filters.groupMode in filters.features) {
          const featureEnabled = filters.features[filters.groupMode as keyof typeof filters.features];
          return featureEnabled ? ['Yes'] : [];
        }
        return [];
    }
  };

  const handleFilterChange = (value: string, checked: boolean) => {
    console.log('Filter change:', { value, checked, groupMode: filters.groupMode });
    
    switch (filters.groupMode) {
      case 'client':
        const newClients = checked 
          ? [...filters.clients, value]
          : filters.clients.filter(c => c !== value);
        onFiltersChange({ ...filters, clients: newClients });
        break;
      case 'isOnline':
        onFiltersChange({ ...filters, onlineOnly: value === 'Online' && checked });
        break;
      default:
        // For feature-based filters
        if (filters.groupMode in filters.features) {
          const featureKey = filters.groupMode as keyof typeof filters.features;
          const newFeatures = {
            ...filters.features,
            [featureKey]: value === 'Yes' && checked
          };
          onFiltersChange({ ...filters, features: newFeatures });
        }
        break;
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.clients.length > 0) count++;
    if (filters.onlineOnly) count++;
    if (Object.values(filters.features).some(feature => feature)) count++;
    return count;
  };

  const clearAllFilters = () => {
    onFiltersChange({
      ...filters,
      clients: [],
      onlineOnly: false,
      features: {
        hasClimateBaseline: false,
        hasReadWriteDiscrepancies: false,
        hasZoneAssets: false,
        hasHeatingCircuit: false,
        hasVentilation: false,
        missingVSGTOVConnections: false,
        missingLBGPOVConnections: false,
        missingLBGTOVConnections: false,
        automaticComfortScheduleActive: false,
        manualComfortScheduleActive: false,
        componentsErrors: false,
        hasDistrictHeatingMeter: false,
        hasDistrictCoolingMeter: false,
        hasElectricityMeter: false,
        lastWeekUptime: false,
      }
    });
  };

  // Use the original data from props, not filtered data, to get all available options
  const allAvailableOptions = getAllAvailableValues(filters.groupMode, filteredData);
  const selectedValues = getSelectedValues();

  const getFilterLabel = () => {
    const groupModeLabel = groupModeOptions.find(option => option.value === filters.groupMode)?.label || filters.groupMode;
    return `Filter by ${groupModeLabel}`;
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Group Mode Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-200">Group Mode</Label>
              <Select 
                value={filters.groupMode} 
                onValueChange={(value) => {
                  console.log('Group mode changing to:', value);
                  onFiltersChange({ ...filters, groupMode: value as GroupMode });
                }}
              >
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 z-50">
                  {groupModeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-600">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Mode Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-200">Color Mode</Label>
              <Select 
                value={filters.colorMode} 
                onValueChange={(value) => onFiltersChange({ ...filters, colorMode: value as ColorMode })}
              >
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 z-50">
                  {colorModeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-600">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cycle Controls */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {filters.cycleEnabled ? (
                  <Play className="w-4 h-4 text-green-400" />
                ) : (
                  <Pause className="w-4 h-4 text-gray-400" />
                )}
                <Label className="text-sm text-gray-200">Cycle Colors</Label>
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
                  <SelectContent className="bg-gray-700 border-gray-600 z-50">
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

          {/* Dynamic Filters based on Group Mode */}
          <div className="mt-6 space-y-4">
            <Label className="text-sm font-medium text-gray-200">{getFilterLabel()}</Label>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {allAvailableOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-${option}`}
                      checked={selectedValues.includes(option)}
                      onCheckedChange={(checked) => handleFilterChange(option, !!checked)}
                      className="border-gray-500"
                    />
                    <Label htmlFor={`filter-${option}`} className="text-xs text-gray-300 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
              {allAvailableOptions.length === 0 && (
                <p className="text-xs text-gray-400">No options available for current selection</p>
              )}
            </div>
          </div>

          {/* Basic Filters Section */}
          <div className="mt-6 space-y-4">
            <Label className="text-sm font-medium text-gray-200">Basic Filters</Label>
            
            {/* Client Filter - always available */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-300">Clients</Label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {availableClients.map(client => (
                  <div key={client} className="flex items-center space-x-2">
                    <Checkbox
                      id={`client-${client}`}
                      checked={filters.clients.includes(client)}
                      onCheckedChange={(checked) => {
                        const newClients = checked 
                          ? [...filters.clients, client]
                          : filters.clients.filter(c => c !== client);
                        onFiltersChange({ ...filters, clients: newClients });
                      }}
                      className="border-gray-500"
                    />
                    <Label htmlFor={`client-${client}`} className="text-xs text-gray-300 cursor-pointer">
                      {client}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Online Only Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="online-only"
                checked={filters.onlineOnly}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, onlineOnly: !!checked })}
                className="border-gray-500"
              />
              <Label htmlFor="online-only" className="text-xs text-gray-300 cursor-pointer">
                Show only online buildings
              </Label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
