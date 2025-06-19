
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
  filteredData: any[]; // Add this to get available options for current group mode
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

  // Get available options for current group mode
  const getAvailableGroupOptions = () => {
    if (!filteredData || filteredData.length === 0) return [];

    const uniqueOptions = new Set<string>();

    filteredData.forEach(building => {
      let groupKey: string;
      
      switch (filters.groupMode) {
        case 'client':
          groupKey = building.client;
          break;
        case 'country':
          groupKey = building.country;
          break;
        case 'isOnline':
          groupKey = building.isOnline ? 'Online' : 'Offline';
          break;
        case 'lastWeekUptime':
          const uptime = building.features.lastWeekUptime;
          if (uptime >= 0.95) groupKey = 'Excellent (95%+)';
          else if (uptime >= 0.90) groupKey = 'Good (90-95%)';
          else if (uptime >= 0.80) groupKey = 'Fair (80-90%)';
          else groupKey = 'Poor (<80%)';
          break;
        default:
          // For feature-based grouping
          if (filters.groupMode in building.features) {
            const featureValue = building.features[filters.groupMode as keyof typeof building.features];
            groupKey = typeof featureValue === 'boolean' 
              ? (featureValue ? 'Yes' : 'No')
              : featureValue.toString();
          } else {
            groupKey = 'Unknown';
          }
          break;
      }
      
      uniqueOptions.add(groupKey);
    });

    return Array.from(uniqueOptions).sort();
  };

  const getCurrentGroupModeLabel = () => {
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

  const handleClientToggle = (clientName: string) => {
    const newClients = filters.clients.includes(clientName)
      ? filters.clients.filter(c => c !== clientName)
      : [...filters.clients, clientName];
    
    onFiltersChange({ ...filters, clients: newClients });
  };

  const handleFeatureToggle = (feature: keyof FilterState['features']) => {
    onFiltersChange({
      ...filters,
      features: {
        ...filters.features,
        [feature]: !filters.features[feature]
      }
    });
  };

  // Handle group option selection based on current group mode
  const handleGroupOptionToggle = (optionName: string) => {
    switch (filters.groupMode) {
      case 'client':
        handleClientToggle(optionName);
        break;
      case 'country':
        // Filter to show only buildings from the selected country
        const buildingsFromCountry = filteredData.filter(building => building.country === optionName);
        const uniqueClients = [...new Set(buildingsFromCountry.map(building => building.client))];
        onFiltersChange({
          ...filters,
          clients: uniqueClients
        });
        break;
      case 'isOnline':
        const shouldShowOnlineOnly = optionName === 'Online';
        onFiltersChange({
          ...filters,
          onlineOnly: shouldShowOnlineOnly,
          clients: []
        });
        break;
      case 'lastWeekUptime':
        onFiltersChange({
          ...filters,
          features: {
            ...filters.features,
            lastWeekUptime: true
          },
          clients: []
        });
        break;
      default:
        // For feature-based grouping
        if (filters.groupMode in filters.features) {
          const featureKey = filters.groupMode as keyof typeof filters.features;
          const shouldEnable = optionName === 'Yes';
          
          onFiltersChange({
            ...filters,
            features: {
              ...filters.features,
              [featureKey]: shouldEnable
            },
            clients: []
          });
        }
        break;
    }
  };

  // Check if a group option is currently selected
  const isGroupOptionSelected = (optionName: string) => {
    switch (filters.groupMode) {
      case 'client':
        return filters.clients.includes(optionName);
      case 'country':
        // Check if any buildings from this country are in the client filter
        const buildingsFromCountry = filteredData.filter(building => building.country === optionName);
        const clientsFromCountry = [...new Set(buildingsFromCountry.map(building => building.client))];
        return clientsFromCountry.some(client => filters.clients.includes(client));
      case 'isOnline':
        return (optionName === 'Online' && filters.onlineOnly) || (optionName === 'Offline' && !filters.onlineOnly && filters.clients.length === 0);
      case 'lastWeekUptime':
        return filters.features.lastWeekUptime;
      default:
        // For feature-based grouping
        if (filters.groupMode in filters.features) {
          const featureKey = filters.groupMode as keyof typeof filters.features;
          return (optionName === 'Yes' && filters.features[featureKey]) || (optionName === 'No' && !filters.features[featureKey]);
        }
        return false;
    }
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
              <Label className="text-sm font-medium text-gray-200">{getCurrentGroupModeLabel()}</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {getAvailableGroupOptions().map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`group-${option}`}
                      checked={isGroupOptionSelected(option)}
                      onCheckedChange={() => handleGroupOptionToggle(option)}
                      className="border-gray-500"
                    />
                    <Label htmlFor={`group-${option}`} className="text-sm text-gray-300 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2 pt-2 border-t border-gray-600">
                <Checkbox
                  id="online-only"
                  checked={filters.onlineOnly}
                  onCheckedChange={(checked) => onFiltersChange({ ...filters, onlineOnly: !!checked })}
                  className="border-gray-500"
                />
                <Label htmlFor="online-only" className="text-sm text-gray-300 cursor-pointer">
                  Online only
                </Label>
              </div>
            </div>

            {/* Feature Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-200">Features</Label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasClimateBaseline"
                    checked={filters.features.hasClimateBaseline}
                    onCheckedChange={() => handleFeatureToggle('hasClimateBaseline')}
                    className="border-gray-500"
                  />
                  <Label htmlFor="hasClimateBaseline" className="text-xs text-gray-300 cursor-pointer">
                    Climate Baseline
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasReadWriteDiscrepancies"
                    checked={filters.features.hasReadWriteDiscrepancies}
                    onCheckedChange={() => handleFeatureToggle('hasReadWriteDiscrepancies')}
                    className="border-gray-500"
                  />
                  <Label htmlFor="hasReadWriteDiscrepancies" className="text-xs text-gray-300 cursor-pointer">
                    R/W Issues
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasZoneAssets"
                    checked={filters.features.hasZoneAssets}
                    onCheckedChange={() => handleFeatureToggle('hasZoneAssets')}
                    className="border-gray-500"
                  />
                  <Label htmlFor="hasZoneAssets" className="text-xs text-gray-300 cursor-pointer">
                    Zone Assets
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasHeatingCircuit"
                    checked={filters.features.hasHeatingCircuit}
                    onCheckedChange={() => handleFeatureToggle('hasHeatingCircuit')}
                    className="border-gray-500"
                  />
                  <Label htmlFor="hasHeatingCircuit" className="text-xs text-gray-300 cursor-pointer">
                    Heating Circuit
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasVentilation"
                    checked={filters.features.hasVentilation}
                    onCheckedChange={() => handleFeatureToggle('hasVentilation')}
                    className="border-gray-500"
                  />
                  <Label htmlFor="hasVentilation" className="text-xs text-gray-300 cursor-pointer">
                    Ventilation
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="componentsErrors"
                    checked={filters.features.componentsErrors}
                    onCheckedChange={() => handleFeatureToggle('componentsErrors')}
                    className="border-gray-500"
                  />
                  <Label htmlFor="componentsErrors" className="text-xs text-gray-300 cursor-pointer">
                    Component Errors
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDistrictHeatingMeter"
                    checked={filters.features.hasDistrictHeatingMeter}
                    onCheckedChange={() => handleFeatureToggle('hasDistrictHeatingMeter')}
                    className="border-gray-500"
                  />
                  <Label htmlFor="hasDistrictHeatingMeter" className="text-xs text-gray-300 cursor-pointer">
                    Heating Meter
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDistrictCoolingMeter"
                    checked={filters.features.hasDistrictCoolingMeter}
                    onCheckedChange={() => handleFeatureToggle('hasDistrictCoolingMeter')}
                    className="border-gray-500"
                  />
                  <Label htmlFor="hasDistrictCoolingMeter" className="text-xs text-gray-300 cursor-pointer">
                    Cooling Meter
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasElectricityMeter"
                    checked={filters.features.hasElectricityMeter}
                    onCheckedChange={() => handleFeatureToggle('hasElectricityMeter')}
                    className="border-gray-500"
                  />
                  <Label htmlFor="hasElectricityMeter" className="text-xs text-gray-300 cursor-pointer">
                    Electricity Meter
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lastWeekUptime"
                    checked={filters.features.lastWeekUptime}
                    onCheckedChange={() => handleFeatureToggle('lastWeekUptime')}
                    className="border-gray-500"
                  />
                  <Label htmlFor="lastWeekUptime" className="text-xs text-gray-300 cursor-pointer">
                    Last Week Uptime
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
