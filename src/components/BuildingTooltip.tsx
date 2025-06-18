
import React from 'react';
import { TreemapNode } from '@/types/TreemapData';

interface BuildingTooltipProps {
  node: TreemapNode;
  children: React.ReactNode;
}

export const BuildingTooltip: React.FC<BuildingTooltipProps> = ({ node, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  
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

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const features = Object.entries(building.features);
  const halfLength = Math.ceil(features.length / 2);
  const leftColumn = features.slice(0, halfLength);
  const rightColumn = features.slice(halfLength);

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className="fixed bg-black bg-opacity-90 text-white p-3 rounded-lg max-w-md z-50 pointer-events-none transition-all duration-150 ease-out"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translateY(-10px)'
          }}
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-gray-600 pb-2">
              <h3 className="font-semibold text-sm text-white">{building.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${building.isOnline ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                {building.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex">
                <span className="text-gray-400 w-12 flex-shrink-0">ID:</span>
                <span className="font-mono flex-1 text-white">{building.id}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-12 flex-shrink-0">Client:</span>
                <span className="flex-1 truncate text-white" title={building.client}>{building.client}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-12 flex-shrink-0">Area:</span>
                <span className="flex-1 text-white">{building.squareMeters.toLocaleString()} m²</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-12 flex-shrink-0">Temp:</span>
                <span className="flex-1 text-white">{building.temperature}°C</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-12 flex-shrink-0">Country:</span>
                <span className="flex-1 truncate text-white" title={building.country}>{building.country}</span>
              </div>
            </div>

            <div className="border-t border-gray-600 pt-2 mt-2">
              <h4 className="font-medium text-xs mb-2 text-gray-300">Features</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs max-h-32 overflow-y-auto">
                <div className="space-y-1">
                  {leftColumn.map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="text-gray-400 w-32 flex-shrink-0 truncate" title={formatLabel(key)}>
                        {formatLabel(key)}:
                      </span>
                      <span className="w-16 flex-shrink-0 text-right font-mono text-white" title={formatValue(key, value)}>
                        {formatValue(key, value)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {rightColumn.map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="text-gray-400 w-32 flex-shrink-0 truncate" title={formatLabel(key)}>
                        {formatLabel(key)}:
                      </span>
                      <span className="w-16 flex-shrink-0 text-right font-mono text-white" title={formatValue(key, value)}>
                        {formatValue(key, value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
