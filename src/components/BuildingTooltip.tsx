
import React from 'react';
import { TreemapNode } from '@/types/TreemapData';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface BuildingTooltipProps {
  node: TreemapNode;
  children: React.ReactNode;
}

export const BuildingTooltip: React.FC<BuildingTooltipProps> = ({ node, children }) => {
  const building = node.data as any;
  
  const formatValue = (key: string, value: any) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      if (key === 'savingEnergy') return `${(value * 100).toFixed(1)}%`;
      if (key === 'modelTrainingTestR2Score') return value.toFixed(3);
      if (key === 'adaptiveMin' || key === 'adaptiveMax') return value.toFixed(3);
      return value.toString();
    }
    return value?.toString() || 'N/A';
  };

  const formatLabel = (key: string) => {
    const labelMap: { [key: string]: string } = {
      hasClimateBaseline: 'Climate Baseline',
      hasReadWriteDiscrepancies: 'Read/Write Discrepancies',
      hasZoneAssets: 'Zone Assets',
      hasHeatingCircuit: 'Heating Circuit',
      hasVentilation: 'Ventilation',
      missingVSGTOVConnections: 'Missing VSGT OV',
      missingLBGPOVConnections: 'Missing LBGP OV',
      missingLBGTOVConnections: 'Missing LBGT OV',
      savingEnergy: 'Energy Saving',
      automaticComfortScheduleActive: 'Auto Comfort Schedule',
      manualComfortScheduleActive: 'Manual Comfort Schedule',
      componentsErrors: 'Component Errors',
      modelTrainingTestR2Score: 'Model R² Score',
      hasDistrictHeatingMeter: 'District Heating Meter',
      hasDistrictCoolingMeter: 'District Cooling Meter',
      hasElectricityMeter: 'Electricity Meter',
      adaptiveMin: 'Adaptive Min',
      adaptiveMax: 'Adaptive Max'
    };
    return labelMap[key] || key;
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-96 p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-semibold text-sm">{building.name}</h3>
            <span className={`px-2 py-1 rounded text-xs ${building.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {building.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex">
              <span className="text-gray-600 w-12 flex-shrink-0">ID:</span>
              <span className="font-mono flex-1">{building.id}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-12 flex-shrink-0">Client:</span>
              <span className="flex-1 truncate" title={building.client}>{building.client}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-12 flex-shrink-0">Area:</span>
              <span className="flex-1">{building.squareMeters.toLocaleString()} m²</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-12 flex-shrink-0">Temp:</span>
              <span className="flex-1">{building.temperature}°C</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-12 flex-shrink-0">Country:</span>
              <span className="flex-1 truncate" title={building.country}>{building.country}</span>
            </div>
          </div>

          <div className="border-t pt-2 mt-2">
            <h4 className="font-medium text-xs mb-2 text-gray-700">Features</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {Object.entries(building.features).map(([key, value]) => (
                <div key={key} className="flex text-xs">
                  <span className="text-gray-600 w-40 flex-shrink-0 truncate" title={formatLabel(key)}>
                    {formatLabel(key)}:
                  </span>
                  <span className="w-20 flex-shrink-0 text-right font-mono" title={formatValue(key, value)}>
                    {formatValue(key, value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
