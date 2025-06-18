import React from 'react';
import { TreemapNode } from '@/types/TreemapData';

interface BuildingTooltipProps {
  node: TreemapNode;
  children: React.ReactNode;
}

// Global state to track tooltips
let currentTooltip: {
  setVisible: (visible: boolean) => void;
  id: string;
} | null = null;

export const BuildingTooltip: React.FC<BuildingTooltipProps> = ({ node, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const tooltipId = React.useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);
  
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

  const calculatePosition = (mouseX: number, mouseY: number) => {
    const tooltipWidth = 400; // Approximate tooltip width
    const tooltipHeight = 300; // Approximate tooltip height
    const padding = 20;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x = mouseX + 10;
    let y = mouseY - 10;
    
    // Adjust horizontal position if tooltip would go off right edge
    if (x + tooltipWidth > viewportWidth - padding) {
      x = mouseX - tooltipWidth - 10;
    }
    
    // Adjust vertical position if tooltip would go off bottom edge
    if (y + tooltipHeight > viewportHeight - padding) {
      y = mouseY - tooltipHeight - 10;
    }
    
    // Ensure tooltip doesn't go off top edge
    if (y < padding) {
      y = padding;
    }
    
    // Ensure tooltip doesn't go off left edge
    if (x < padding) {
      x = padding;
    }
    
    return { x, y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const newPosition = calculatePosition(e.clientX, e.clientY);
    setPosition(newPosition);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    // Hide any existing tooltip immediately
    if (currentTooltip && currentTooltip.id !== tooltipId.current) {
      currentTooltip.setVisible(false);
    }
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    const newPosition = calculatePosition(e.clientX, e.clientY);
    setPosition(newPosition);
    setIsVisible(true);
    
    // Register this tooltip as the current one
    currentTooltip = {
      setVisible: setIsVisible,
      id: tooltipId.current
    };
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      if (currentTooltip?.id === tooltipId.current) {
        currentTooltip = null;
      }
    }, 150);
  };

  React.useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (currentTooltip?.id === tooltipId.current) {
        currentTooltip = null;
      }
    };
  }, []);

  const features = Object.entries(building.features);
  const halfLength = Math.ceil(features.length / 2);
  const leftColumn = features.slice(0, halfLength);
  const rightColumn = features.slice(halfLength);

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className="fixed bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4 rounded-xl shadow-2xl max-w-lg z-50 pointer-events-none transition-all duration-100 ease-out border border-blue-500/30 backdrop-blur-sm"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translateY(-10px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(59, 130, 246, 0.3)'
          }}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-blue-400/30 pb-3">
              <h3 className="font-bold text-lg text-blue-200">{building.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${building.isOnline ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                {building.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex">
                <span className="text-slate-300 w-12 flex-shrink-0">ID:</span>
                <span className="font-mono flex-1 text-cyan-300 pr-3">{building.id}</span>
              </div>
              <div className="flex">
                <span className="text-slate-300 w-12 flex-shrink-0">Client:</span>
                <span className="flex-1 truncate text-purple-300 pr-3" title={building.client}>{building.client}</span>
              </div>
              <div className="flex">
                <span className="text-slate-300 w-12 flex-shrink-0">Area:</span>
                <span className="flex-1 text-yellow-300 pr-3">{building.squareMeters.toLocaleString()} m²</span>
              </div>
              <div className="flex">
                <span className="text-slate-300 w-12 flex-shrink-0">Temp:</span>
                <span className="flex-1 text-orange-300 pr-3">{building.temperature}°C</span>
              </div>
              <div className="flex col-span-2">
                <span className="text-slate-300 w-12 flex-shrink-0">Country:</span>
                <span className="flex-1 text-green-300 pr-6" title={building.country}>{building.country}</span>
              </div>
            </div>

            <div className="border-t border-blue-400/30 pt-3 mt-3">
              <h4 className="font-semibold text-sm mb-3 text-blue-200 flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Features
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div className="space-y-2">
                  {leftColumn.map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="text-slate-400 w-32 flex-shrink-0 truncate" title={formatLabel(key)}>
                        {formatLabel(key)}:
                      </span>
                      <span className={`w-16 flex-shrink-0 text-right font-mono pr-2 ${
                        typeof value === 'boolean' 
                          ? value ? 'text-emerald-400' : 'text-red-400'
                          : 'text-blue-300'
                      }`} title={formatValue(key, value)}>
                        {formatValue(key, value)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {rightColumn.map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="text-slate-400 w-32 flex-shrink-0 truncate" title={formatLabel(key)}>
                        {formatLabel(key)}:
                      </span>
                      <span className={`w-16 flex-shrink-0 text-right font-mono pr-2 ${
                        typeof value === 'boolean' 
                          ? value ? 'text-emerald-400' : 'text-red-400'
                          : 'text-blue-300'
                      }`} title={formatValue(key, value)}>
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
