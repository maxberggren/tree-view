
import React from 'react';
import { TreemapNode } from '@/types/TreemapData';
import { Thermometer, Zap, Activity, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface BuildingCellProps {
  node: TreemapNode;
  onHover?: (node: TreemapNode | null) => void;
}

export const BuildingCell: React.FC<BuildingCellProps> = ({ node, onHover }) => {
  const width = node.x1 - node.x0;
  const height = node.y1 - node.y0;
  
  // Skip rendering if too small
  if (width < 3 || height < 3) return null;

  const isBuilding = 'id' in node.data;
  if (!isBuilding) return null;

  const building = node.data as any;
  const temp = building.temperature;
  
  // Color based on temperature and online status
  const getColor = () => {
    if (!building.isOnline) return '#374151'; // Gray for offline
    if (temp < 20) return '#3B82F6'; // Cold - blue
    if (temp < 25) return '#06B6D4'; // Cool - cyan
    if (temp < 30) return '#10B981'; // Comfortable - green
    if (temp < 35) return '#F59E0B'; // Warm - yellow
    return '#EF4444'; // Hot - red
  };

  const getBorderColor = () => {
    return building.isOnline ? '#1F2937' : '#6B7280';
  };

  const getTextColor = () => {
    return building.isOnline ? '#FFFFFF' : '#9CA3AF';
  };

  const shouldShowText = width > 60 && height > 40;
  const shouldShowIcons = width > 80 && height > 60;
  const shouldShowDetails = width > 120 && height > 80;

  return (
    <div
      className="absolute border border-opacity-40 cursor-pointer transition-all duration-200 hover:border-opacity-80 hover:z-10 hover:shadow-lg"
      style={{
        left: node.x0,
        top: node.y0,
        width,
        height,
        backgroundColor: getColor(),
        borderColor: getBorderColor(),
        opacity: building.isOnline ? 1 : 0.6,
      }}
      onMouseEnter={() => onHover?.(node)}
      onMouseLeave={() => onHover?.(null)}
    >
      {shouldShowText && (
        <div className="p-2 h-full flex flex-col justify-between text-xs overflow-hidden">
          <div>
            <div 
              className="font-bold leading-tight mb-1"
              style={{ color: getTextColor(), fontSize: Math.min(width / 8, 12) }}
            >
              {building.id}
            </div>
            {shouldShowDetails && (
              <div 
                className="opacity-90 leading-tight"
                style={{ color: getTextColor(), fontSize: Math.min(width / 12, 9) }}
              >
                {building.name}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-center gap-1">
              <div 
                className="font-bold"
                style={{ color: getTextColor(), fontSize: Math.min(width / 10, 11) }}
              >
                {temp}°F
              </div>
              
              {shouldShowIcons && (
                <div className="flex flex-wrap gap-1 ml-2">
                  {building.features.canHeat && (
                    <Thermometer size={Math.min(width / 15, 12)} color={getTextColor()} />
                  )}
                  {building.features.hasAMM && (
                    <Zap size={Math.min(width / 15, 12)} color={getTextColor()} />
                  )}
                  {building.features.hasClimateBaseline && (
                    <Activity size={Math.min(width / 15, 12)} color={getTextColor()} />
                  )}
                  {building.features.hasReadWriteDiscrepancies && (
                    <AlertTriangle size={Math.min(width / 15, 12)} color="#FCD34D" />
                  )}
                  {building.isOnline ? (
                    <Wifi size={Math.min(width / 15, 12)} color={getTextColor()} />
                  ) : (
                    <WifiOff size={Math.min(width / 15, 12)} color="#9CA3AF" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
