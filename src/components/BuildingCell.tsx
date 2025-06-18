import React from 'react';
import { TreemapNode, ColorMode } from '@/types/TreemapData';
import { Thermometer, Activity, AlertTriangle, Wifi, WifiOff, Building, Settings, Wind, Plug, Battery, BarChart, Gauge } from 'lucide-react';

interface BuildingCellProps {
  node: TreemapNode;
  colorMode: ColorMode;
  onHover?: (node: TreemapNode | null) => void;
}

export const BuildingCell: React.FC<BuildingCellProps> = ({ node, colorMode, onHover }) => {
  const width = node.x1 - node.x0;
  const height = node.y1 - node.y0;
  
  // Skip rendering if too small
  if (width < 3 || height < 3) return null;

  const isBuilding = 'id' in node.data;
  if (!isBuilding) return null;

  const building = node.data as any;
  const temp = building.temperature;
  
  // Color based on selected mode
  const getColor = () => {
    const baseColors = getBaseColors();
    const opacity = building.isOnline ? 1 : 0.3;
    
    // Handle RGB colors differently from hex colors
    if (baseColors.bg.startsWith('rgb')) {
      return baseColors.bg.replace('rgb(', `rgba(`).replace(')', `, ${opacity})`);
    } else {
      return `${baseColors.bg}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
    }
  };

  const getHoverColor = () => {
    const baseColors = getBaseColors();
    const opacity = building.isOnline ? 1 : 0.3;
    
    // Handle RGB colors for hover effect
    if (baseColors.bg.startsWith('rgb')) {
      const rgbMatch = baseColors.bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const r = Math.min(255, parseInt(rgbMatch[1]) + 40);
        const g = Math.min(255, parseInt(rgbMatch[2]) + 40);
        const b = Math.min(255, parseInt(rgbMatch[3]) + 40);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return getColor();
    }
    
    // Add white overlay for hover effect on hex colors
    const rgbColor = hexToRgb(baseColors.bg);
    if (rgbColor) {
      const lighterR = Math.min(255, rgbColor.r + 40);
      const lighterG = Math.min(255, rgbColor.g + 40);
      const lighterB = Math.min(255, rgbColor.b + 40);
      const lighterHex = `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
      return `${lighterHex}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
    }
    
    return getColor();
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getBaseColors = () => {
    switch (colorMode) {
      case 'temperature':
        if (temp < 10) return { bg: '#3B82F6', border: '#1D4ED8' }; // Blue
        if (temp < 18) return { bg: '#06B6D4', border: '#0891B2' }; // Cyan
        if (temp < 25) return { bg: '#10B981', border: '#059669' }; // Green
        if (temp < 30) return { bg: '#F59E0B', border: '#D97706' }; // Yellow
        return { bg: '#EF4444', border: '#DC2626' }; // Red

      case 'comfort':
        const isComfortable = temp >= 20 && temp <= 25;
        const isTooHot = temp > 28;
        const isTooCold = temp < 18;
        
        if (isComfortable) return { bg: '#22C55E', border: '#16A34A' }; // Bright green
        if (isTooHot) return { bg: '#F97316', border: '#EA580C' }; // Orange
        if (isTooCold) return { bg: '#3B82F6', border: '#2563EB' }; // Blue
        return { bg: '#A3A3A3', border: '#737373' }; // Gray (mild)

      case 'adaptiveMin':
        // Yellow (0) to Grey (1) gradient
        const minValue = building.features.adaptiveMin;
        const yellowR = Math.round(251 + (107 - 251) * minValue);
        const yellowG = Math.round(191 + (116 - 191) * minValue);
        const yellowB = Math.round(36 + (128 - 36) * minValue);
        
        const borderR = Math.max(0, yellowR - 20);
        const borderG = Math.max(0, yellowG - 20);
        const borderB = Math.max(0, yellowB - 20);
        
        return { 
          bg: `rgb(${yellowR}, ${yellowG}, ${yellowB})`,
          border: `rgb(${borderR}, ${borderG}, ${borderB})`
        };

      case 'adaptiveMax':
        // Purple (0) to Grey (1) gradient
        const maxValue = building.features.adaptiveMax;
        const purpleR = Math.round(139 + (107 - 139) * maxValue);
        const purpleG = Math.round(92 + (116 - 92) * maxValue);
        const purpleB = Math.round(246 + (128 - 246) * maxValue);
        
        const borderRMax = Math.max(0, purpleR - 20);
        const borderGMax = Math.max(0, purpleG - 20);
        const borderBMax = Math.max(0, purpleB - 20);
        
        return { 
          bg: `rgb(${purpleR}, ${purpleG}, ${purpleB})`,
          border: `rgb(${borderRMax}, ${borderGMax}, ${borderBMax})`
        };

      case 'hasClimateBaseline':
        return building.features.hasClimateBaseline 
          ? { bg: '#059669', border: '#047857' } // Green
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'hasReadWriteDiscrepancies':
        return building.features.hasReadWriteDiscrepancies 
          ? { bg: '#EA580C', border: '#C2410C' } // Orange
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'hasZoneAssets':
        return building.features.hasZoneAssets 
          ? { bg: '#7C3AED', border: '#6D28D9' } // Purple
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'hasHeatingCircuit':
        return building.features.hasHeatingCircuit 
          ? { bg: '#DC2626', border: '#991B1B' } // Red
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'hasVentilation':
        return building.features.hasVentilation 
          ? { bg: '#0EA5E9', border: '#0284C7' } // Sky blue
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'missingVSGTOVConnections':
        return building.features.missingVSGTOVConnections 
          ? { bg: '#F59E0B', border: '#D97706' } // Amber
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'missingLBGPOVConnections':
        return building.features.missingLBGPOVConnections 
          ? { bg: '#EF4444', border: '#DC2626' } // Red
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'missingLBGTOVConnections':
        return building.features.missingLBGTOVConnections 
          ? { bg: '#F97316', border: '#EA580C' } // Orange
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'savingEnergy':
        const savingValue = building.features.savingEnergy;
        if (savingValue <= -0.1) return { bg: '#DC2626', border: '#991B1B' }; // Red for -10% or more
        if (savingValue <= -0.05) return { bg: '#EF4444', border: '#DC2626' }; // Light red for -5% to -10%
        if (savingValue <= 0.05) return { bg: '#6B7280', border: '#4B5563' }; // Gray for neutral
        if (savingValue <= 0.1) return { bg: '#FBBF24', border: '#F59E0B' }; // Yellow for 5% to 10%
        if (savingValue <= 0.2) return { bg: '#10B981', border: '#059669' }; // Green for 10% to 20%
        return { bg: '#059669', border: '#047857' }; // Dark green for 20%+

      case 'automaticComfortScheduleActive':
        return building.features.automaticComfortScheduleActive 
          ? { bg: '#16A34A', border: '#15803D' } // Green
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'manualComfortScheduleActive':
        return building.features.manualComfortScheduleActive 
          ? { bg: '#CA8A04', border: '#A16207' } // Yellow
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'componentsErrors':
        return building.features.componentsErrors 
          ? { bg: '#DC2626', border: '#991B1B' } // Red
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'modelTrainingTestR2Score':
        const r2Score = building.features.modelTrainingTestR2Score;
        if (r2Score < 0.3) return { bg: '#DC2626', border: '#991B1B' }; // Red for poor
        if (r2Score < 0.6) return { bg: '#F59E0B', border: '#D97706' }; // Amber for fair
        if (r2Score < 0.8) return { bg: '#FBBF24', border: '#F59E0B' }; // Yellow for good
        return { bg: '#10B981', border: '#059669' }; // Green for excellent

      case 'hasDistrictHeatingMeter':
        return building.features.hasDistrictHeatingMeter 
          ? { bg: '#BE123C', border: '#9F1239' } // Rose
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'hasDistrictCoolingMeter':
        return building.features.hasDistrictCoolingMeter 
          ? { bg: '#0891B2', border: '#0E7490' } // Cyan
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'hasElectricityMeter':
        return building.features.hasElectricityMeter 
          ? { bg: '#7C2D12', border: '#92400E' } // Brown
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      default:
        return { bg: '#6B7280', border: '#4B5563' };
    }
  };

  const getBorderColor = () => {
    if (!building.isOnline) return '#6B7280';
    const baseColors = getBaseColors();
    
    // Handle RGB border colors
    if (baseColors.border.startsWith('rgb')) {
      return baseColors.border;
    }
    
    return baseColors.border;
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
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = getHoverColor();
        onHover?.(node);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = getColor();
        onHover?.(null);
      }}
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
                {temp}°C
              </div>
              
              {shouldShowIcons && (
                <div className="flex flex-wrap gap-1 ml-1">
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
