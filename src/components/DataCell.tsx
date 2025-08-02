import React from 'react';
import { TreemapNode } from '@/types/DataTypes';
import { ConfigSchema } from '@/types/ConfigTypes';
import { getColor } from '@/utils/colorEngine';

interface DataCellProps {
  node: TreemapNode;
  config: ConfigSchema;
  colorField: string;
  onHover?: (node: TreemapNode | null) => void;
}

export const DataCell: React.FC<DataCellProps> = ({ node, config, colorField, onHover }) => {
  const data = node.data as any;
  const fieldConfig = config[colorField];
  
  if (!fieldConfig) {
    return null;
  }

  const colorResult = getColor(data[colorField], fieldConfig);
  const width = node.x1 - node.x0;
  const height = node.y1 - node.y0;

  // Don't render if too small
  if (width < 3 || height < 3) {
    return null;
  }

  // Get ID and name fields (look for common field names)
  const idFields = ['id', 'key', 'identifier'];
  const nameFields = ['name', 'title', 'label'];
  
  const idField = idFields.find(field => data[field]);
  const nameField = nameFields.find(field => data[field]);
  
  // Remove "BLD-" prefix from ID like original
  const displayId = idField ? String(data[idField]).replace(/^BLD-/, '') : 'N/A';
  const displayName = nameField ? String(data[nameField]) : 'Unknown';

  // Check if item is "offline" or inactive
  const statusFields = ['isOnline', 'active', 'enabled', 'online'];
  const isActive = statusFields.some(field => data[field] === true) || 
                  !statusFields.some(field => field in data) || // If no status field, assume active
                  statusFields.every(field => data[field] !== false);

  const shouldShowText = width > 40 && height > 25; // Allow smaller font visibility

  // Get text color (ensure good contrast)
  const getTextColor = () => {
    // For light backgrounds, use dark text
    if (colorResult.color.includes('rgb')) {
      const rgb = colorResult.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgb) {
        const brightness = (parseInt(rgb[1]) * 299 + parseInt(rgb[2]) * 587 + parseInt(rgb[3]) * 114) / 1000;
        return brightness > 128 ? '#1F2937' : '#FFFFFF';
      }
    }
    return '#FFFFFF'; // Default to white
  };

  return (
    <div
      className={`absolute border border-opacity-40 cursor-pointer transition-all duration-200 hover:border-opacity-80 hover:z-10 hover:shadow-lg ${
        !isActive ? 'opacity-30' : ''
      }`}
      style={{
        left: node.x0,
        top: node.y0,
        width,
        height,
        backgroundColor: colorResult.color,
        borderColor: colorResult.borderColor,
      }}
      onMouseEnter={() => onHover?.(node)}
      onMouseLeave={() => onHover?.(null)}
    >
      {shouldShowText && (
        <div className="p-1 h-full flex flex-col justify-start text-left overflow-hidden">
          <div 
            className="font-bold leading-tight mb-0.5 truncate"
            style={{ 
              color: getTextColor(), 
              fontSize: Math.max(Math.min(width / 8, 12), 8) 
            }}
          >
            {displayId}
          </div>
          <div 
            className="opacity-90 leading-tight truncate"
            style={{ 
              color: getTextColor(), 
              fontSize: Math.max(Math.min(width / 12, 9), 6) 
            }}
          >
            {displayName}
          </div>
        </div>
      )}
    </div>
  );
};