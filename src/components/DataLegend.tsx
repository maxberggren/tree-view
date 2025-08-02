import React from 'react';
import { ConfigSchema } from '@/types/ConfigTypes';
import { getColor } from '@/utils/colorEngine';

interface DataLegendProps {
  config: ConfigSchema;
  colorField: string;
}

export const DataLegend: React.FC<DataLegendProps> = ({ config, colorField }) => {
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
        // For gradients, show min/max examples
        if (!fieldConfig.colors) return [];
        const gradientColors = fieldConfig.colors as any;
        const minColor = `rgb(${gradientColors.min.r}, ${gradientColors.min.g}, ${gradientColors.min.b})`;
        const maxColor = `rgb(${gradientColors.max.r}, ${gradientColors.max.g}, ${gradientColors.max.b})`;
        
        return [
          { color: minColor, label: fieldConfig.type === 'percentage' ? '0%' : 'Min' },
          { color: maxColor, label: fieldConfig.type === 'percentage' ? '100%' : 'Max' }
        ];
      
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
      {fieldConfig.type === 'percentage' && fieldConfig.colorMode === 'gradient' && (
        <div className="text-xs opacity-75 mt-2">
          Gradient scale
        </div>
      )}
    </div>
  );
};