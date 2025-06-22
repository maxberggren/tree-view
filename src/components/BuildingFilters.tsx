
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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

  // Get available options based on group mode
  const getAvailableOptions = () => {
    if (!filteredData || filteredData.length === 0) return [];
    
    switch (filters.groupMode) {
      case 'client':
        return [...new Set(filteredData.map(building => building.client))];
      case 'country':
        return [...new Set(filteredData.map(building => building.country))];
      case 'isOnline':
        return ['Online', 'Offline'];
      case 'lastWeekUptime':
        return ['Excellent (95%+)', 'Good (90-95%)', 'Fair (80-90%)', 'Poor (<80%)'];
      default:
        // For feature-based grouping
        return ['Yes', 'No'];
    }
  };

  // Check if an option is selected
  const isOptionSelected = (option: string) => {
    switch (filters.groupMode) {
      case 'client':
        return filters.clients.includes(option);
      case 'country':
        // Check if any client from this country is selected
        const clientsFromCountry = filteredData
          .filter(building => building.country === option)
          .map(building => building.client);
        return clientsFromCountry.some(client => filters.clients.includes(client));
      case 'isOnline':
        return (option === 'Online' && filters.onlineOnly) || (option === 'Offline' && !filters.onlineOnly);
      case 'lastWeekUptime':
        // For uptime ranges, check if the lastWeekUptime filter is enabled
        return filters.features.lastWeekUptime;
      default:
        // For feature-based grouping
        if (filters.groupMode in filters.features) {
          const featureKey = filters.groupMode as keyof typeof filters.features;
          const featureValue = filters.features[featureKey];
          return (option === 'Yes' && featureValue) || (option === 'No' && !featureValue);
        }
        return false;
    }
  };

  const handleOptionToggle = (option: string) => {
    switch (filters.groupMode) {
      case 'client':
        // Toggle client selection
        const newClients = filters.clients.includes(option)
          ? filters.clients.filter(client => client !== option)
          : [...filters.clients, option];
        onFiltersChange({ ...filters, clients: newClients });
        break;
        
      case 'country':
        // Find all clients from the selected country
        const clientsFromCountry = filteredData
          .filter(building => building.country === option)
          .map(building => building.client);
        
        // Check if any client from this country is already selected
        const hasSelectedClients = clientsFromCountry.some(client => filters.clients.includes(client));
        
        if (hasSelectedClients) {
          // Remove all clients from this country
          const remainingClients = filters.clients.filter(client => !clientsFromCountry.includes(client));
          onFiltersChange({ ...filters, clients: remainingClients });
        } else {
          // Add all clients from this country
          const uniqueClients = [...new Set([...filters.clients, ...clientsFromCountry])];
          onFiltersChange({ ...filters, clients: uniqueClients });
        }
        break;
        
      case 'isOnline':
        // Toggle online filter
        if (option === 'Online') {
          onFiltersChange({ ...filters, onlineOnly: !filters.onlineOnly });
        } else if (option === 'Offline') {
          onFiltersChange({ ...filters, onlineOnly: !filters.onlineOnly });
        }
        break;

      case 'lastWeekUptime':
        // For uptime grouping, toggle the uptime filter
        onFiltersChange({
          ...filters,
          features: {
            ...filters.features,
            lastWeekUptime: !filters.features.lastWeekUptime
          }
        });
        break;
        
      default:
        // For feature-based grouping
        if (filters.groupMode in filters.features) {
          const featureKey = filters.groupMode as keyof typeof filters.features;
          const currentValue = filters.features[featureKey];
          
          // Toggle the feature based on the option clicked
          let newValue = currentValue;
          if (option === 'Yes') {
            newValue = !currentValue; // Toggle when clicking Yes
          } else if (option === 'No') {
            newValue = !currentValue; // Toggle when clicking No
          }
          
          onFiltersChange({
            ...filters,
            features: {
              ...filters.features,
              [featureKey]: newValue
            }
          });
        }
        break;
    }
  };

  const getGroupModeLabel = () => {
    const option = groupModeOptions.find(opt => opt.value === filters.groupMode);
    return option ? option.label : filters.groupMode;
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group Mode & Color Mode Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-200">Group Mode</Label>
              <Select 
                value={filters.groupMode} 
                onValueChange={(value) => onFiltersChange({ ...filters, groupMode: value as GroupMode })}
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

            {/* Dynamic Group Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-200">{getGroupModeLabel()}</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {getAvailableOptions().map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`option-${option}`}
                      checked={isOptionSelected(option)}
                      onCheckedChange={() => handleOptionToggle(option)}
                      className="border-gray-500"
                    />
                    <Label 
                      htmlFor={`option-${option}`} 
                      className="text-sm text-gray-300 cursor-pointer"
                      onClick={() => handleOptionToggle(option)}
                    >
                      {option}
                    </Label>
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
