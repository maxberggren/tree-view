import React from 'react';
import { TreemapNode, ColorMode } from '@/types/TreemapData';
import { Thermometer, Zap, Activity, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

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

      case 'canHeat':
        return building.features.canHeat 
          ? { bg: '#DC2626', border: '#991B1B' } // Red
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'canCool':
        return building.features.canCool 
          ? { bg: '#2563EB', border: '#1D4ED8' } // Blue
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'hasAMM':
        return building.features.hasAMM 
          ? { bg: '#FBBF24', border: '#F59E0B' } // Yellow
          : { bg: '#6B7280', border: '#4B5563' }; // Gray

      case 'adaptiveMin':
        // Yellow (0) to Grey (1) gradient
        const minValue = building.features.adaptiveMin;
        const yellowR = Math.round(251 + (107 - 251) * minValue); // 251 (yellow) to 107 (grey)
        const yellowG = Math.round(191 + (116 - 191) * minValue); // 191 (yellow) to 116 (grey)
        const yellowB = Math.round(36 + (128 - 36) * minValue);   // 36 (yellow) to 128 (grey)
        
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
        const purpleR = Math.round(139 + (107 - 139) * maxValue); // 139 (purple) to 107 (grey)
        const purpleG = Math.round(92 + (116 - 92) * maxValue);   // 92 (purple) to 116 (grey)
        const purpleB = Math.round(246 + (128 - 246) * maxValue); // 246 (purple) to 128 (grey)
        
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
