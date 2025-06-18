
import React from 'react';
import { ChevronUp, ChevronDown, Thermometer, Zap, Activity, AlertTriangle, Wifi } from 'lucide-react';
import { ColorMode } from '@/types/TreemapData';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FilterState {
  clients: string[];
  onlineOnly: boolean;
  features: {
    canHeat: boolean;
    canCool: boolean;
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

  const colorModeOptions = [
    { value: 'temperature', label: 'Temperature', icon: Thermometer },
    { value: 'comfort', label: 'Comfort Zone', icon: Activity },
    { value: 'canHeat', label: 'Can Heat', icon: Thermometer },
    { value: 'canCool', label: 'Can Cool', icon: Thermometer },
    { value: 'adaptiveMin', label: 'Adaptive Min', icon: Zap },
    { value: 'adaptiveMax', label: 'Adaptive Max', icon: Zap },
    { value: 'hasClimateBaseline', label: 'Climate Baseline', icon: Activity },
    { value: 'hasReadWriteDiscrepancies', label: 'R/W Issues', icon: AlertTriangle },
  ];

  const featureOptions = [
    { key: 'canHeat', label: 'Can Heat', icon: Thermometer },
    { key: 'canCool', label: 'Can Cool', icon: Thermometer },
    { key: 'hasClimateBaseline', label: 'Climate Baseline', icon: Activity },
    { key: 'hasReadWriteDiscrepancies', label: 'R/W Issues', icon: AlertTriangle },
  ];

  return (
    <div className="absolute top-0 left-0 right-0 z-50">
      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Color Mode */}
              <Card className="border-0 shadow-sm bg-white/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <Label className="text-sm font-semibold text-gray-900">Color Mode</Label>
                  </div>
                  <RadioGroup value={filters.colorMode} onValueChange={handleColorModeChange}>
                    <div className="space-y-3">
                      {colorModeOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.value} id={option.value} className="border-gray-300" />
                            <Label htmlFor={option.value} className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                              <IconComponent size={14} className="text-gray-500" />
                              {option.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Status Filters */}
              <Card className="border-0 shadow-sm bg-white/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <Label className="text-sm font-semibold text-gray-900">Status</Label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi size={16} className="text-gray-500" />
                      <Label htmlFor="online-only" className="text-sm font-medium text-gray-700">
                        Online Only
                      </Label>
                    </div>
                    <Switch
                      id="online-only"
                      checked={filters.onlineOnly}
                      onCheckedChange={(checked) => onFiltersChange({ ...filters, onlineOnly: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Feature Filters */}
              <Card className="border-0 shadow-sm bg-white/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <Label className="text-sm font-semibold text-gray-900">Features</Label>
                  </div>
                  <div className="space-y-3">
                    {featureOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <div key={option.key} className="flex items-center space-x-3">
                          <Checkbox
                            id={option.key}
                            checked={filters.features[option.key as keyof FilterState['features']]}
                            onCheckedChange={() => toggleFeature(option.key as keyof FilterState['features'])}
                          />
                          <Label htmlFor={option.key} className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                            <IconComponent size={14} className="text-gray-500" />
                            {option.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Client Filters */}
              <Card className="border-0 shadow-sm bg-white/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <Label className="text-sm font-semibold text-gray-900">Clients</Label>
                    {filters.clients.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {filters.clients.length}
                      </Badge>
                    )}
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {availableClients.map(client => (
                      <div key={client} className="flex items-center space-x-3">
                        <Checkbox
                          id={`client-${client}`}
                          checked={filters.clients.includes(client)}
                          onCheckedChange={() => toggleClient(client)}
                        />
                        <Label 
                          htmlFor={`client-${client}`} 
                          className="text-sm font-medium text-gray-700 cursor-pointer truncate flex-1"
                          title={client}
                        >
                          {client}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Modern Toggle Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 rounded-none hover:bg-gray-100/50 transition-all duration-200"
            onClick={onToggle}
          >
            <div className="flex items-center gap-2 text-gray-600">
              {isExpanded ? (
                <>
                  <ChevronUp size={16} />
                  <span className="text-xs font-medium">Hide Filters</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  <span className="text-xs font-medium">Show Filters</span>
                  {(filters.clients.length > 0 || filters.onlineOnly || Object.values(filters.features).some(Boolean)) && (
                    <Badge variant="secondary" className="ml-2 text-xs h-5">
                      Active
                    </Badge>
                  )}
                </>
              )}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};
