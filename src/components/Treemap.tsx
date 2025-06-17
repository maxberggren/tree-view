

import React, { useMemo, useState } from 'react';
import { treemap, hierarchy } from 'd3-hierarchy';
import { BuildingCell } from './BuildingCell';
import { BuildingFilters } from './BuildingFilters';
import { TreemapNode, ColorMode } from '@/types/TreemapData';
import { mockBuildingData } from '@/data/mockBuildingData';

interface TreemapProps {
  width: number;
  height: number;
}

interface FilterState {
  clients: string[];
  onlineOnly: boolean;
  features: {
    canHeat: boolean;
    canCool: boolean;
    hasAMM: boolean;
    hasClimateBaseline: boolean;
    hasReadWriteDiscrepancies: boolean;
  };
  temperatureRange: [number, number];
  colorMode: ColorMode;
}

const initialFilters: FilterState = {
  clients: [],
  onlineOnly: false,
  features: {
    canHeat: false,
    canCool: false,
    hasAMM: false,
    hasClimateBaseline: false,
    hasReadWriteDiscrepancies: false,
  },
  temperatureRange: [15, 75],
  colorMode: 'temperature',
};

export const Treemap: React.FC<TreemapProps> = ({ width, height }) => {
  const [hoveredNode, setHoveredNode] = useState<TreemapNode | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const availableClients = useMemo(() => {
    return mockBuildingData.map(client => client.name);
  }, []);

  const filteredData = useMemo(() => {
    return mockBuildingData
      .map(client => ({
        ...client,
        children: client.children.filter(building => {
          // Client filter
          if (filters.clients.length > 0 && !filters.clients.includes(building.client)) {
            return false;
          }

          // Online filter
          if (filters.onlineOnly && !building.isOnline) {
            return false;
          }

          // Feature filters
          if (filters.features.canHeat && !building.features.canHeat) return false;
          if (filters.features.canCool && !building.features.canCool) return false;
          if (filters.features.hasAMM && !building.features.hasAMM) return false;
          if (filters.features.hasClimateBaseline && !building.features.hasClimateBaseline) return false;
          if (filters.features.hasReadWriteDiscrepancies && !building.features.hasReadWriteDiscrepancies) return false;

          return true;
        })
      }))
      .filter(client => client.children.length > 0);
  }, [filters]);

  // Use full height for treemap, no space reserved for filters
  const treemapHeight = height;

  const treemapData = useMemo(() => {
    if (filteredData.length === 0) return null;

    const rootData = {
      name: 'Buildings',
      children: filteredData.map(client => ({
        name: client.name,
        children: client.children
      }))
    };

    const root = hierarchy(rootData)
      .sum((d: any) => d.squareMeters || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = treemap<any>()
      .size([width, treemapHeight])
      .padding(3)
      .round(true);

    return treemapLayout(root);
  }, [width, treemapHeight, filteredData]);

  const handleClientClick = (clientName: string) => {
    setFilters({
      ...filters,
      clients: [clientName]
    });
  };

  const handleGridClick = () => {
    if (filtersExpanded) {
      setFiltersExpanded(false);
    }
  };

  const renderNodes = (node: any): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    
    if (node.children) {
      // Render client border for grouping
      if (node.depth === 1) {
        const clientWidth = node.x1 - node.x0;
        const clientHeight = node.y1 - node.y0;
        
        nodes.push(
          <div
            key={`client-${node.data.name}`}
            className="absolute border-2 border-blue-400 border-opacity-30 rounded-lg"
            style={{
              left: node.x0,
              top: node.y0,
              width: clientWidth,
              height: clientHeight,
            }}
          >
            <div 
              className="absolute -top-6 left-2 text-gray-300 text-sm font-medium bg-gray-900 px-2 rounded cursor-pointer hover:bg-gray-700 hover:text-gray-200 transition-colors z-10"
              onClick={() => handleClientClick(node.data.name)}
              title={`Filter by ${node.data.name}`}
            >
              {node.data.name}
            </div>
          </div>
        );
      }

      // Render children recursively
      node.children.forEach((child: any, index: number) => {  
        nodes.push(...renderNodes(child));
      });
    } else {
      // Render leaf node (building) without any offset
      nodes.push(
        <BuildingCell
          key={`${node.data.id}-${node.x0}-${node.y0}`}
          node={node}
          colorMode={filters.colorMode}
          onHover={setHoveredNode}
        />
      );
    }
    
    return nodes;
  };

  const getLegendItems = () => {
    switch (filters.colorMode) {
      case 'temperature':
        return [
          { color: '#3B82F6', label: 'Cold (<20°F)' },
          { color: '#06B6D4', label: 'Cool (20-25°F)' },
          { color: '#10B981', label: 'Comfort (25-30°F)' },
          { color: '#F59E0B', label: 'Warm (30-35°F)' },
          { color: '#EF4444', label: 'Hot (>35°F)' },
        ];
      case 'comfort':
        return [
          { color: '#22C55E', label: 'Comfortable (20-25°F)' },
          { color: '#F97316', label: 'Too Hot (>30°F)' },
          { color: '#3B82F6', label: 'Too Cold (<18°F)' },
          { color: '#A3A3A3', label: 'Mild' },
        ];
      case 'canHeat':
        return [
          { color: '#DC2626', label: 'Can Heat' },
          { color: '#6B7280', label: 'Cannot Heat' },
        ];
      case 'canCool':
        return [
          { color: '#2563EB', label: 'Can Cool' },
          { color: '#6B7280', label: 'Cannot Cool' },
        ];
      case 'hasAMM':
        return [
          { color: '#FBBF24', label: 'Has AMM' },
          { color: '#6B7280', label: 'No AMM' },
        ];
      case 'hasClimateBaseline':
        return [
          { color: '#059669', label: 'Has Climate Baseline' },
          { color: '#6B7280', label: 'No Climate Baseline' },
        ];
      case 'hasReadWriteDiscrepancies':
        return [
          { color: '#EA580C', label: 'Has R/W Issues' },
          { color: '#6B7280', label: 'No R/W Issues' },
        ];
      default:
        return [];
    }
  };

  const getLegendTitle = () => {
    switch (filters.colorMode) {
      case 'temperature': return 'Temperature Scale';
      case 'comfort': return 'Comfort Zones';
      case 'canHeat': return 'Heating Capability';
      case 'canCool': return 'Cooling Capability';
      case 'hasAMM': return 'AMM Status';
      case 'hasClimateBaseline': return 'Climate Baseline';
      case 'hasReadWriteDiscrepancies': return 'Read/Write Issues';
      default: return 'Legend';
    }
  };

  if (!treemapData) {
    return (
      <div className="relative w-full h-full bg-gray-900 overflow-hidden">
        <BuildingFilters
          isExpanded={filtersExpanded}
          onToggle={() => setFiltersExpanded(!filtersExpanded)}
          filters={filters}
          onFiltersChange={setFilters}
          availableClients={availableClients}
        />
        <div className="flex items-center justify-center h-full text-white">
          <p>No buildings match the current filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Filter Panel - positioned absolutely */}
      <BuildingFilters
        isExpanded={filtersExpanded}
        onToggle={() => setFiltersExpanded(!filtersExpanded)}
        filters={filters}
        onFiltersChange={setFilters}
        availableClients={availableClients}
      />

      {/* Main treemap - uses full height */}
      <div 
        className="relative w-full h-full cursor-pointer"
        onClick={handleGridClick}
      >
        {renderNodes(treemapData)}
      </div>
      
      {/* Hover tooltip */}
      {hoveredNode && 'id' in hoveredNode.data && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg pointer-events-none z-30 max-w-xs">
          <div className="font-bold text-lg">{(hoveredNode.data as any).id}</div>
          <div className="text-sm opacity-90 mb-2">{(hoveredNode.data as any).name}</div>
          <div className="text-sm mb-2">
            <span className="opacity-75">Client: </span>
            {(hoveredNode.data as any).client}
          </div>
          <div className="text-sm mb-2">
            <span className="opacity-75">Status: </span>
            <span className={(hoveredNode.data as any).isOnline ? 'text-green-400' : 'text-red-400'}>
              {(hoveredNode.data as any).isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="text-sm mb-2">
            <span className="opacity-75">Temperature: </span>
            <span className="text-blue-400">{(hoveredNode.data as any).temperature}°F</span>
          </div>
          <div className="text-sm mb-2">
            <span className="opacity-75">Size: </span>
            {(hoveredNode.data as any).squareMeters.toLocaleString()} m²
          </div>
          <div className="text-xs mt-3">
            <div className="opacity-75 mb-1">Features:</div>
            <div className="flex flex-wrap gap-1">
              {(hoveredNode.data as any).features.canHeat && <span className="bg-blue-600 px-1 rounded">Heat</span>}
              {(hoveredNode.data as any).features.canCool && <span className="bg-cyan-600 px-1 rounded">Cool</span>}
              {(hoveredNode.data as any).features.hasAMM && <span className="bg-yellow-600 px-1 rounded">AMM</span>}
              {(hoveredNode.data as any).features.hasClimateBaseline && <span className="bg-green-600 px-1 rounded">Baseline</span>}
              {(hoveredNode.data as any).features.hasReadWriteDiscrepancies && <span className="bg-red-600 px-1 rounded">R/W Issues</span>}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Legend */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-90 text-white p-3 rounded-lg max-w-xs z-20">
        <div className="text-xs font-bold mb-2">
          {getLegendTitle()}
        </div>
        <div className="flex flex-col gap-1 text-xs mb-3">
          {getLegendItems().map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3" style={{ backgroundColor: item.color }}></div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="text-xs opacity-75">
          Offline buildings are dimmed
        </div>
      </div>
    </div>
  );
};

