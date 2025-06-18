
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Settings, Play, Pause } from 'lucide-react';
import { ColorMode } from '@/types/TreemapData';

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
  };
  temperatureRange: [number, number];
  colorMode: ColorMode;
  cycleEnabled: boolean;
  cycleInterval: number;
}

interface BuildingFiltersProps {
  isExpanded: boolean;
  onToggle: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableClients: string[];
}

export const BuildingFilters: React.FC<BuildingFiltersProps> = ({
  isExpanded,
  onToggle,
  filters,
  onFiltersChange,
  availableClients
}) => {
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
  ];

  const cycleIntervalOptions = [
    { value: '2', label: '2 seconds' },
    { value: '3', label: '3 seconds' },
    { value: '5', label: '5 seconds' },
    { value: '10', label: '10 seconds' },
    { value: '15', label: '15 seconds' },
    { value: '30', label: '30 seconds' },
  ];

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

  return (
    <div className="absolute top-0 left-0 w-full z-30 bg-gray-800 border-b border-gray-700">
      {/* Toggle Bar */}
      <div className="flex items-center justify-between px-3 py-1 cursor-pointer hover:bg-gray-700" onClick={onToggle}>
        <div className="flex items-center gap-2">
          <Settings className="w-3 h-3 text-gray-300" />
          <span className="text-xs text-gray-300">Filters & Settings</span>
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

            {/* Client Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-200">Clients</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableClients.map(client => (
                  <div key={client} className="flex items-center space-x-2">
                    <Checkbox
                      id={`client-${client}`}
                      checked={filters.clients.includes(client)}
                      onCheckedChange={() => handleClientToggle(client)}
                      className="border-gray-500"
                    />
                    <Label htmlFor={`client-${client}`} className="text-sm text-gray-300 cursor-pointer">
                      {client}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
