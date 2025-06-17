
import React, { useMemo, useState } from 'react';
import { treemap, hierarchy } from 'd3-hierarchy';
import { TreemapCell } from './TreemapCell';
import { TreemapNode } from '@/types/TreemapData';
import { mockStockData } from '@/data/mockStockData';

interface TreemapProps {
  width: number;
  height: number;
}

export const Treemap: React.FC<TreemapProps> = ({ width, height }) => {
  const [hoveredNode, setHoveredNode] = useState<TreemapNode | null>(null);

  const treemapData = useMemo(() => {
    // Transform data for d3-hierarchy
    const rootData = {
      name: 'Market',
      children: mockStockData.map(sector => ({
        name: sector.name,
        children: sector.children
      }))
    };

    const root = hierarchy(rootData)
      .sum((d: any) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = treemap<any>()
      .size([width, height])
      .padding(2)
      .round(true);

    return treemapLayout(root);
  }, [width, height]);

  const renderNodes = (node: any): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    
    if (node.children) {
      // Render children recursively
      node.children.forEach((child: any, index: number) => {
        nodes.push(...renderNodes(child));
      });
    } else {
      // Render leaf node (stock)
      nodes.push(
        <TreemapCell
          key={`${node.data.symbol}-${node.x0}-${node.y0}`}
          node={node}
          onHover={setHoveredNode}
        />
      );
    }
    
    return nodes;
  };

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Main treemap */}
      <div className="relative w-full h-full">
        {renderNodes(treemapData)}
      </div>
      
      {/* Hover tooltip */}
      {hoveredNode && 'symbol' in hoveredNode.data && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded-lg pointer-events-none z-20">
          <div className="font-bold text-lg">{(hoveredNode.data as any).symbol}</div>
          <div className="text-sm opacity-90">{(hoveredNode.data as any).name}</div>
          <div className="text-sm mt-1">
            <span className="opacity-75">Sector: </span>
            {(hoveredNode.data as any).sector}
          </div>
          <div className="text-sm">
            <span className="opacity-75">Change: </span>
            <span className={(hoveredNode.data as any).change >= 0 ? 'text-green-400' : 'text-red-400'}>
              {(hoveredNode.data as any).change > 0 ? '+' : ''}{(hoveredNode.data as any).change.toFixed(2)}%
            </span>
          </div>
          <div className="text-sm">
            <span className="opacity-75">Market Cap: </span>
            ${((hoveredNode.data as any).value).toLocaleString()}B
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg">
        <div className="text-xs font-bold mb-2">Performance</div>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600"></div>
            <span>+2% to +5%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500"></div>
            <span>+0.5% to +2%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500"></div>
            <span>-0.5% to +0.5%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500"></div>
            <span>-1.5% to -0.5%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-800"></div>
            <span>Below -1.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
