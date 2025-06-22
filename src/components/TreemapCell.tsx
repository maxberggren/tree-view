
import React from 'react';
import { TreemapNode } from '@/types/TreemapData';

interface TreemapCellProps {
  node: TreemapNode;
  onHover?: (node: TreemapNode | null) => void;
}

export const TreemapCell: React.FC<TreemapCellProps> = ({ node, onHover }) => {
  const width = node.x1 - node.x0;
  const height = node.y1 - node.y0;
  
  // Skip rendering if too small
  if (width < 2 || height < 2) return null;

  const isStock = 'symbol' in node.data;
  const change = isStock ? (node.data as any).change : 0;
  
  // Color based on performance
  const getColor = () => {
    if (change > 2) return '#00C851'; // Strong positive
    if (change > 0.5) return '#4CAF50'; // Positive
    if (change > -0.5) return '#FF9800'; // Neutral
    if (change > -1.5) return '#F44336'; // Negative
    return '#C62828'; // Strong negative
  };

  const getBorderColor = () => {
    return change >= 0 ? '#2E7D32' : '#B71C1C';
  };

  const getTextColor = () => {
    return '#FFFFFF';
  };

  const shouldShowText = width > 60 && height > 30;
  const shouldShowSubtext = width > 100 && height > 50;

  return (
    <div
      className="absolute border border-opacity-30 cursor-pointer transition-all duration-200 hover:border-opacity-60 hover:z-10"
      style={{
        left: node.x0,
        top: node.y0,
        width,
        height,
        backgroundColor: getColor(),
        borderColor: getBorderColor(),
      }}
      onMouseEnter={() => onHover?.(node)}
      onMouseLeave={() => onHover?.(null)}
    >
      {shouldShowText && (
        <div className="p-1 h-full flex flex-col justify-between text-xs font-medium overflow-hidden">
          <div>
            <div 
              className="font-bold leading-tight"
              style={{ color: getTextColor(), fontSize: Math.min(width / 8, 14) }}
            >
              {isStock ? (node.data as any).symbol : node.data.name}
            </div>
            {shouldShowSubtext && isStock && (
              <div 
                className="opacity-90 leading-tight mt-1"
                style={{ color: getTextColor(), fontSize: Math.min(width / 12, 10) }}
              >
                {(node.data as any).name}
              </div>
            )}
          </div>
          <div 
            className="font-bold"
            style={{ color: getTextColor(), fontSize: Math.min(width / 10, 12) }}
          >
            {change > 0 ? '+' : ''}{change.toFixed(2)}%
          </div>
        </div>
      )}
    </div>
  );
};
