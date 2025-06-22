import React from 'react';
import { TreemapNode, ColorMode } from '@/types/TreemapData';

interface TreemapCellProps {
  node: TreemapNode;
  colorMode: ColorMode;
  onHover?: (node: TreemapNode | null) => void;
}

export const TreemapCell: React.FC<TreemapCellProps> = ({ node, colorMode, onHover }) => {
  const width = node.x1 - node.x0;
  const height = node.y1 - node.y0;
  
  // Skip rendering if too small
  if (width < 2 || height < 2) return null;

  // If this is a leaf node (building), render the building cell
  if (!node.children || node.children.length === 0) {
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
          const minValue = building.adaptiveMin;
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
          const maxValue = building.adaptiveMax;
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
          return building.hasClimateBaseline 
            ? { bg: '#059669', border: '#047857' } // Green
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'hasReadWriteDiscrepancies':
          return building.hasReadWriteDiscrepancies 
            ? { bg: '#EA580C', border: '#C2410C' } // Orange
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'hasZoneAssets':
          return building.hasZoneAssets 
            ? { bg: '#7C3AED', border: '#6D28D9' } // Purple
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'hasHeatingCircuit':
          return building.hasHeatingCircuit 
            ? { bg: '#DC2626', border: '#991B1B' } // Red
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'hasVentilation':
          return building.hasVentilation 
            ? { bg: '#0EA5E9', border: '#0284C7' } // Sky blue
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'missingVSGTOVConnections':
          return building.missingVSGTOVConnections 
            ? { bg: '#F59E0B', border: '#D97706' } // Amber
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'missingLBGPOVConnections':
          return building.missingLBGPOVConnections 
            ? { bg: '#EF4444', border: '#DC2626' } // Red
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'missingLBGTOVConnections':
          return building.missingLBGTOVConnections 
            ? { bg: '#F97316', border: '#EA580C' } // Orange
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'savingEnergy':
          const savingValue = building.savingEnergy;
          if (savingValue <= -0.1) return { bg: '#DC2626', border: '#991B1B' }; // Red for -10% or more
          if (savingValue <= -0.05) return { bg: '#EF4444', border: '#DC2626' }; // Light red for -5% to -10%
          if (savingValue <= 0.05) return { bg: '#6B7280', border: '#4B5563' }; // Gray for neutral
          if (savingValue <= 0.1) return { bg: '#FBBF24', border: '#F59E0B' }; // Yellow for 5% to 10%
          if (savingValue <= 0.2) return { bg: '#10B981', border: '#059669' }; // Green for 10% to 20%
          return { bg: '#059669', border: '#047857' }; // Dark green for 20+

        case 'automaticComfortScheduleActive':
          return building.automaticComfortScheduleActive 
            ? { bg: '#16A34A', border: '#15803D' } // Green
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'manualComfortScheduleActive':
          return building.manualComfortScheduleActive 
            ? { bg: '#CA8A04', border: '#A16207' } // Yellow
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'componentsErrors':
          return building.componentsErrors 
            ? { bg: '#DC2626', border: '#991B1B' } // Red
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'modelTrainingTestR2Score':
          const r2Score = building.modelTrainingTestR2Score;
          if (r2Score < 0.3) return { bg: '#DC2626', border: '#991B1B' }; // Red for poor
          if (r2Score < 0.6) return { bg: '#F59E0B', border: '#D97706' }; // Amber for fair
          if (r2Score < 0.8) return { bg: '#FBBF24', border: '#F59E0B' }; // Yellow for good
          return { bg: '#10B981', border: '#059669' }; // Green for excellent

        case 'hasDistrictHeatingMeter':
          return building.hasDistrictHeatingMeter 
            ? { bg: '#BE123C', border: '#9F1239' } // Rose
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'hasDistrictCoolingMeter':
          return building.hasDistrictCoolingMeter 
            ? { bg: '#0891B2', border: '#0E7490' } // Cyan
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'hasElectricityMeter':
          return building.hasElectricityMeter 
            ? { bg: '#7C2D12', border: '#92400E' } // Brown
            : { bg: '#6B7280', border: '#4B5563' }; // Gray

        case 'lastWeekUptime':
          const uptime = building.lastWeekUptime;
          if (uptime >= 0.95) return { bg: '#059669', border: '#047857' }; // Excellent - Dark green
          if (uptime >= 0.90) return { bg: '#10B981', border: '#059669' }; // Good - Green
          if (uptime >= 0.80) return { bg: '#FBBF24', border: '#F59E0B' }; // Fair - Yellow
          return { bg: '#EF4444', border: '#DC2626' }; // Poor - Red

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

    const shouldShowText = width > 60 && height > 40;
    const displayId = building.id.replace(/^BLD-/, '');

    return (
      <g>
        <rect
          x={node.x0}
          y={node.y0}
          width={width}
          height={height}
          fill={getColor()}
          stroke={getBorderColor()}
          strokeWidth={1}
          className="cursor-pointer"
        />
        {shouldShowText && (
          <>
            <text
              x={node.x0 + 4}
              y={node.y0 + 12}
              fill={building.isOnline ? '#FFFFFF' : '#9CA3AF'}
              fontSize={Math.min(width / 8, 12)}
              fontWeight="bold"
            >
              {displayId}
            </text>
            <text
              x={node.x0 + 4}
              y={node.y0 + 24}
              fill={building.isOnline ? '#FFFFFF' : '#9CA3AF'}
              fontSize={Math.min(width / 12, 9)}
              opacity={0.9}
            >
              {building.name}
            </text>
          </>
        )}
      </g>
    );
  }

  // For group nodes, render a container with label
  const getNodeKey = (node: TreemapNode, index: number): string => {
    if ('id' in node.data) {
      return node.data.id;
    } else if ('name' in node.data) {
      return `group-${node.data.name}`;
    }
    return `node-${index}`;
  };

  return (
    <g>
      <rect
        x={node.x0}
        y={node.y0}
        width={width}
        height={height}
        fill="rgba(75, 85, 99, 0.5)"
        stroke="#6B7280"
        strokeWidth={1}
      />
      {width > 100 && height > 30 && (
        <text
          x={node.x0 + 8}
          y={node.y0 + 16}
          fill="#FFFFFF"
          fontSize="14"
          fontWeight="medium"
        >
          {node.data.name}
        </text>
      )}
      
      {/* Render children */}
      {node.children?.map((child, index) => (
        <TreemapCell
          key={getNodeKey(child, index)}
          node={child}
          colorMode={colorMode}
          onHover={onHover}
        />
      ))}
    </g>
  );
};
