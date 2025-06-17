
import React from 'react';
import { ChevronUp, ChevronDown, Thermometer, Zap, Activity, AlertTriangle, Wifi } from 'lucide-react';
import { ColorMode } from '@/types/TreemapData';

interface FilterState {
  clients: string[];
  onlineOnly: boolean;
  features: {
    canHeat: boolean;
    canCool: boolean;
    hasAMM: boolean;
    hasClimateBaseline: boolean;
    hasReadWriteDiscrepancies: boolean;
  };
  temperatureRange: [number, number];
  colorMode: ColorMode;
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
  const toggleFeature = (feature: keyof FilterState['features']) => {
    onFiltersChange({
      ...filters,
      features: {
        ...filters.features,
        [feature]: !filters.features[feature]
      }
    });
  };

  const toggleClient = (client: string) => {
    const newClients = filters.clients.includes(client)
      ? filters.clients.filter(c => c !== client)
      : [...filters.clients, client];
    
    onFiltersChange({
      ...filters,
      clients: newClients
    });
  };

  const handleColorModeChange = (colorMode: ColorMode) => {
    onFiltersChange({
      ...filters,
      colorMode
    });
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-50">
      {/* Expanded Filter Panel - positioned above toggle bar */}
      {isExpanded && (
        <div className="bg-gray-800 border-b border-gray-700 shadow-lg p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Color Mode */}
            <div>
              <h3 className="text-white font-medium mb-3">Color By</h3>
              <div className="space-y-2">
                <label className="flex items-center text-white text-sm">
                  <input
                    type="radio"
                    name="colorMode"
                    checked={filters.colorMode === 'temperature'}
                    onChange={() => handleColorModeChange('temperature')}
                    className="mr-2"
                  />
                  Temperature
                </label>
                <label className="flex items-center text-white text-sm">
                  <input
                    type="radio"
                    name="colorMode"
                    checked={filters.colorMode === 'comfort'}
                    onChange={() => handleColorModeChange('comfort')}
                    className="mr-2"
                  />
                  Comfort Zone
                </label>
                <label className="flex items-center text-white text-sm">
                  <input
                    type="radio"
                    name="colorMode"
                    checked={filters.colorMode === 'canHeat'}
                    onChange={() => handleColorModeChange('canHeat')}
                    className="mr-2"
                  />
                  <Thermometer size={14} className="mr-1" />
                  Can Heat
                </label>
                <label className="flex items-center text-white text-sm">
                  <input
                    type="radio"
                    name="colorMode"
                    checked={filters.colorMode === 'canCool'}
                    onChange={() => handleColorModeChange('canCool')}
                    className="mr-2"
                  />
                  <Thermometer size={14} className="mr-1" />
                  Can Cool
                </label>
                <label className="flex items-center text-white text-sm">
                  <input
                    type="radio"
                    name="colorMode"
                    checked={filters.colorMode === 'hasAMM'}
                    onChange={() => handleColorModeChange('hasAMM')}
                    className="mr-2"
                  />
                  <Zap size={14} className="mr-1" />
                  Has AMM
                </label>
                <label className="flex items-center text-white text-sm">
                  <input
                    type="radio"
                    name="colorMode"
                    checked={filters.colorMode === 'hasClimateBaseline'}
                    onChange={() => handleColorModeChange('hasClimateBaseline')}
                    className="mr-2"
                  />
                  <Activity size={14} className="mr-1" />
                  Climate Baseline
                </label>
                <label className="flex items-center text-white text-sm">
                  <input
                    type="radio"
                    name="colorMode"
                    checked={filters.colorMode === 'hasReadWriteDiscrepancies'}
                    onChange={() => handleColorModeChange('hasReadWriteDiscrepancies')}
                    className="mr-2"
                  />
                  <AlertTriangle size={14} className="mr-1" />
                  R/W Issues
                </label>
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <h3 className="text-white font-medium mb-3">Status</h3>
              <label className="flex items-center text-white text-sm mb-2">
                <input
                  type="checkbox"
                  checked={filters.onlineOnly}
                  onChange={(e) => onFiltersChange({ ...filters, onlineOnly: e.target.checked })}
                  className="mr-2"
                />
                <Wifi size={14} className="mr-1" />
                Online Only
              </label>
            </div>

            {/* Feature Filters */}
            <div>
              <h3 className="text-white font-medium mb-3">Features</h3>
              <div className="space-y-2">
                <label className="flex items-center text-white text-sm">
                  <input
                    type="checkbox"
                    checked={filters.features.canHeat}
                    onChange={() => toggleFeature('canHeat')}
                    className="mr-2"
                  />
                  <Thermometer size={14} className="mr-1" />
                  Can Heat
                </label>
                <label className="flex items-center text-white text-sm">
                  <input
                    type="checkbox"
                    checked={filters.features.canCool}
                    onChange={() => toggleFeature('canCool')}
                    className="mr-2"
                  />
                  <Thermometer size={14} className="mr-1" />
                  Can Cool
                </label>
                <label className="flex items-center text-white text-sm">
                  <input
                    type="checkbox"
                    checked={filters.features.hasAMM}
                    onChange={() => toggleFeature('hasAMM')}
                    className="mr-2"
                  />
                  <Zap size={14} className="mr-1" />
                  Has AMM
                </label>
                <label className="flex items-center text-white text-sm">
                  <input
                    type="checkbox"
                    checked={filters.features.hasClimateBaseline}
                    onChange={() => toggleFeature('hasClimateBaseline')}
                    className="mr-2"
                  />
                  <Activity size={14} className="mr-1" />
                  Climate Baseline
                </label>
                <label className="flex items-center text-white text-sm">
                  <input
                    type="checkbox"
                    checked={filters.features.hasReadWriteDiscrepancies}
                    onChange={() => toggleFeature('hasReadWriteDiscrepancies')}
                    className="mr-2"
                  />
                  <AlertTriangle size={14} className="mr-1" />
                  R/W Issues
                </label>
              </div>
            </div>

            {/* Client Filters */}
            <div>
              <h3 className="text-white font-medium mb-3">Clients</h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {availableClients.map(client => (
                  <label key={client} className="flex items-center text-white text-sm">
                    <input
                      type="checkbox"
                      checked={filters.clients.includes(client)}
                      onChange={() => toggleClient(client)}
                      className="mr-2"
                    />
                    {client}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Bar - always at the bottom */}
      <div className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div 
          className="flex items-center justify-center py-1 cursor-pointer hover:bg-gray-700 transition-colors"
          onClick={onToggle}
        >
          {isExpanded ? (
            <ChevronUp size={16} className="text-white" />
          ) : (
            <ChevronDown size={16} className="text-white" />
          )}
        </div>
      </div>
    </div>
  );
};
