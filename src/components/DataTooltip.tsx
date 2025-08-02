import React, { useState, useEffect } from 'react';
import { TreemapNode } from '@/types/DataTypes';
import { ConfigSchema } from '@/types/ConfigTypes';
import { formatValue, formatTooltipValue } from '@/utils/valueFormatters';
import { getColor } from '@/utils/colorEngine';

interface DataTooltipProps {
  node: TreemapNode;
  config: ConfigSchema;
  colorField: string;
}

export const DataTooltip: React.FC<DataTooltipProps> = ({ node, config, colorField }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = calculatePosition(e.clientX, e.clientY);
      setPosition(newPosition);
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleInitialPosition = (e: React.MouseEvent) => {
    const newPosition = calculatePosition(e.clientX, e.clientY);
    setPosition(newPosition);
  };
  const data = node.data as any;
  
  // Get primary display fields
  const nameFields = ['name', 'title', 'label'];
  const idFields = ['id', 'key', 'identifier'];
  const primaryName = nameFields.find(field => data[field]) ? data[nameFields.find(field => data[field])!] : 'Unknown';
  const primaryId = idFields.find(field => data[field]) ? data[idFields.find(field => data[field])!] : '';

  // Get visible fields to display
  const visibleFields = Object.entries(config)
    .filter(([field, fieldConfig]) => 
      fieldConfig.visible && 
      data[field] !== undefined && 
      !nameFields.includes(field) && 
      !idFields.includes(field)
    )
    .slice(0, 12); // Limit to prevent tooltip from being too large

  // Get color information for current field
  const colorFieldConfig = config[colorField];
  const colorResult = colorFieldConfig ? getColor(data[colorField], colorFieldConfig) : null;

  return (
    <div 
      className="fixed bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-xl max-w-lg z-50 pointer-events-none transition-all duration-100 ease-out border border-gray-700"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateY(-10px)'
      }}
    >
      {/* Header */}
      <div className="font-bold text-lg">{primaryName}</div>
      {primaryId && (
        <div className="text-sm opacity-90 mb-2">ID: {primaryId}</div>
      )}
      
      {/* Current color field value */}
      {colorResult && (
        <div className="mb-3 p-2 rounded" style={{ backgroundColor: colorResult.color, color: 'white' }}>
          <div className="text-sm font-medium">{colorFieldConfig?.label || colorField}</div>
          <div className="text-xs">{colorResult.label}</div>
        </div>
      )}
      
      {/* All visible fields */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {visibleFields.map(([field, fieldConfig]) => {
          const value = data[field];
          const formattedValue = formatTooltipValue(value, fieldConfig);
          
          // Get color for visual indication
          const fieldColor = fieldConfig.colorMode ? getColor(value, fieldConfig) : null;
          
          return (
            <div key={field} className="flex items-start gap-2">
              {fieldColor && (
                <div 
                  className="w-3 h-3 rounded-sm mt-0.5 flex-shrink-0" 
                  style={{ backgroundColor: fieldColor.color }}
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="opacity-75">{fieldConfig.label}: </span>
                <span className="font-medium">{formattedValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};