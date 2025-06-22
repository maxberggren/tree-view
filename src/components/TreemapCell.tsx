
import React from 'react';
import { TreemapNode, ColorMode } from '@/types/TreemapData';
import { BuildingCell } from './BuildingCell';

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

  // If this is a leaf node (building), render the BuildingCell
  if (!node.children || node.children.length === 0) {
    return <BuildingCell node={node} colorMode={colorMode} />;
  }

  // For group nodes, render a container with label
  // Generate a unique key based on the node's data
  const getNodeKey = (node: TreemapNode, index: number): string => {
    if ('id' in node.data) {
      return node.data.id;
    } else if ('name' in node.data) {
      return node.data.name;
    }
    return `node-${index}`;
  };

  return (
    <div
      className="absolute border border-gray-600 bg-gray-800 bg-opacity-50"
      style={{
        left: node.x0,
        top: node.y0,
        width,
        height,
      }}
    >
      {width > 100 && height > 30 && (
        <div className="p-2 text-white text-sm font-medium truncate">
          {node.data.name}
        </div>
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
    </div>
  );
};
