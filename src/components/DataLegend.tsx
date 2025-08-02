import React from 'react';
import { ConfigSchema } from '@/types/ConfigTypes';
import { getColor } from '@/utils/colorEngine';

interface DataLegendProps {
  config: ConfigSchema;
  colorField: string;
  dataRange?: { min: number; max: number };
}

export const DataLegend: React.FC<DataLegendProps> = ({ config, colorField, dataRange }) => {
  const fieldConfig = config[colorField];
  
  if (!fieldConfig || !fieldConfig.colorMode) {
    return null;
  }

  const getLegendItems = () => {
    switch (fieldConfig.colorMode) {
      case 'boolean':
        if (!fieldConfig.colors) return [];
        const booleanColors = fieldConfig.colors as any;
        return [
          { 
            color: booleanColors.true.bg, 
            label: booleanColors.true.label || 'Yes' 
          },
          { 
            color: booleanColors.false.bg, 
            label: booleanColors.false.label || 'No' 
          }
        ];
      
      case 'categorical':
        if (!fieldConfig.colors) return [];
        const categoricalColors = fieldConfig.colors as any;
        return Object.entries(categoricalColors)
          .filter(([key]) => key !== 'default')
          .map(([key, colorConfig]: [string, any]) => ({
            color: colorConfig.bg,
            label: key
          }));
      
      case 'bins':
        if (!fieldConfig.bins) return [];
        return fieldConfig.bins.map(bin => ({
          color: bin.color,
          label: bin.label
        }));
      
      case 'gradient':
        // For gradients, show multiple points across the scale
        if (!fieldConfig.colors || !dataRange) return [];
        const gradientColors = fieldConfig.colors as any;
        
        // Create 5 points across the gradient (0%, 25%, 50%, 75%, 100%)
        const steps = [0, 0.25, 0.5, 0.75, 1];
        
        return steps.map(step => {
          // Calculate the color at this step
          const r = Math.round(gradientColors.min.r + (gradientColors.max.r - gradientColors.min.r) * step);
          const g = Math.round(gradientColors.min.g + (gradientColors.max.g - gradientColors.min.g) * step);
          const b = Math.round(gradientColors.min.b + (gradientColors.max.b - gradientColors.min.b) * step);
          const color = `rgb(${r}, ${g}, ${b})`;
          
          // Calculate the actual value at this step
          const value = dataRange.min + (dataRange.max - dataRange.min) * step;
          
          // Format the label based on field type
          let label: string;
          if (fieldConfig.type === 'percentage') {
            label = `${(step * 100).toFixed(0)}%`;
          } else {
            const decimals = fieldConfig.decimals || 1;
            label = value.toFixed(decimals);
            if (fieldConfig.unit) {
              label += fieldConfig.unit;
            }
          }
          
          return { color, label };
        });
      
      default:
        return [];
    }
  };

  const legendItems = getLegendItems();
  
  if (legendItems.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-4 right-4 bg-black bg-opacity-90 text-white p-3 rounded-lg max-w-xs z-20 border border-gray-700">
      <div className="text-xs font-bold mb-2">
        {fieldConfig.label || colorField}
      </div>
      <div className="flex flex-col gap-1 text-xs">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm flex-shrink-0" 
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
      {fieldConfig.colorMode === 'gradient' && (
        <div className="text-xs opacity-75 mt-1">
          {fieldConfig.type === 'percentage' ? 'Percentage scale' : 'Continuous scale'}
        </div>
      )}
    </div>
  );
};