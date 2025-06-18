import React, { useMemo, useState, useRef } from 'react';
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
    hasClimateBaseline: boolean;
    hasReadWriteDiscrepancies: boolean;
    hasZoneAssets: boolean;
    hasHeatingCircuit: boolean;
    hasVentilation: boolean;
    missingVSGTOVConnections: boolean;
    missingLBGPOVConnections: boolean;
    missingLBGTOVConnections: boolean;
    automaticComfortScheduleActive: boolean;
    manualComfortScheduleActive: boolean;
    componentsErrors: boolean;
    hasDistrictHeatingMeter: boolean;
    hasDistrictCoolingMeter: boolean;
    hasElectricityMeter: boolean;
  };
  temperatureRange: [number, number];
  colorMode: ColorMode;
}

const initialFilters: FilterState = {
  clients: [],
  onlineOnly: false,
  features: {
    hasClimateBaseline: false,
    hasReadWriteDiscrepancies: false,
    hasZoneAssets: false,
    hasHeatingCircuit: false,
    hasVentilation: false,
    missingVSGTOVConnections: false,
    missingLBGPOVConnections: false,
    missingLBGTOVConnections: false,
    automaticComfortScheduleActive: false,
    manualComfortScheduleActive: false,
    componentsErrors: false,
    hasDistrictHeatingMeter: false,
    hasDistrictCoolingMeter: false,
    hasElectricityMeter: false,
  },
  temperatureRange: [5, 35],
  colorMode: 'temperature',
};

export const Treemap: React.FC<TreemapProps> = ({ width, height }) => {
  const [hoveredNode, setHoveredNode] = useState<TreemapNode | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
          if (filters.features.hasClimateBaseline && !building.features.hasClimateBaseline) return false;
          if (filters.features.hasReadWriteDiscrepancies && !building.features.hasReadWriteDiscrepancies) return false;
          if (filters.features.hasZoneAssets && !building.features.hasZoneAssets) return false;
          if (filters.features.hasHeatingCircuit && !building.features.hasHeatingCircuit) return false;
          if (filters.features.hasVentilation && !building.features.hasVentilation) return false;
          if (filters.features.missingVSGTOVConnections && !building.features.missingVSGTOVConnections) return false;
          if (filters.features.missingLBGPOVConnections && !building.features.missingLBGPOVConnections) return false;
          if (filters.features.missingLBGTOVConnections && !building.features.missingLBGTOVConnections) return false;
          if (filters.features.automaticComfortScheduleActive && !building.features.automaticComfortScheduleActive) return false;
          if (filters.features.manualComfortScheduleActive && !building.features.manualComfortScheduleActive) return false;
          if (filters.features.componentsErrors && !building.features.componentsErrors) return false;
          if (filters.features.hasDistrictHeatingMeter && !building.features.hasDistrictHeatingMeter) return false;
          if (filters.features.hasDistrictCoolingMeter && !building.features.hasDistrictCoolingMeter) return false;
          if (filters.features.hasElectricityMeter && !building.features.hasElectricityMeter) return false;

          return true;
        })
      }))
      .filter(client => client.children.length > 0);
  }, [filters]);

  // Use fixed height for filter bar and add space for client tags
  const filterBarHeight = 25; // Fixed height for the toggle bar
  const clientTagSpacing = 20; // Space for client tags above the grid
  const treemapHeight = height - filterBarHeight - clientTagSpacing;
  const treemapTop = filterBarHeight + clientTagSpacing;

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

  const handleNodeHover = (node: TreemapNode | null) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (node) {
      // Immediately show the tooltip when hovering
      setHoveredNode(node);
    } else {
      // Add a small delay before hiding the tooltip
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredNode(null);
      }, 150); // 150ms delay
    }
  };

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
              className="absolute left-2 text-gray-300 text-sm font-medium bg-gray-900 px-2 rounded cursor-pointer hover:bg-gray-700 hover:text-gray-200 transition-colors z-10"
              style={{
                top: '-20px'
              }}
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
          onHover={handleNodeHover}
        />
      );
    }
    
    return nodes;
  };

  const getLegendItems = () => {
    switch (filters.colorMode) {
      case 'temperature':
        return [
          { color: '#3B82F6', label: 'Cold (<10°C)' },
          { color: '#06B6D4', label: 'Cool (10-18°C)' },
          { color: '#10B981', label: 'Comfort (18-25°C)' },
          { color: '#F59E0B', label: 'Warm (25-30°C)' },
          { color: '#EF4444', label: 'Hot (>30°C)' },
        ];
      case 'comfort':
        return [
          { color: '#22C55E', label: 'Comfortable (20-25°C)' },
          { color: '#F97316', label: 'Too Hot (>28°C)' },
          { color: '#3B82F6', label: 'Too Cold (<18°C)' },
          { color: '#A3A3A3', label: 'Mild' },
        ];
      case 'adaptiveMin':
        return [
          { color: '#FBBF24', label: 'Low (0.0)' },
          { color: '#D4D4AA', label: 'Medium (0.5)' },
          { color: '#A3A3A3', label: 'High (1.0)' },
        ];
      case 'adaptiveMax':
        return [
          { color: '#8B5CF6', label: 'Low (0.0)' },
          { color: '#A78BFA', label: 'Medium (0.5)' },
          { color: '#A3A3A3', label: 'High (1.0)' },
        ];
      case 'hasClimateBaseline':
        return [
          { color: '#059669', label: 'Climate Baseline Active' },
          { color: '#6B7280', label: 'No Climate Baseline' },
        ];
      case 'hasReadWriteDiscrepancies':
        return [
          { color: '#EA580C', label: 'Has R/W Issues' },
          { color: '#6B7280', label: 'No R/W Issues' },
        ];
      case 'hasZoneAssets':
        return [
          { color: '#7C3AED', label: 'Has Zone Assets' },
          { color: '#6B7280', label: 'No Zone Assets' },
        ];
      case 'hasHeatingCircuit':
        return [
          { color: '#DC2626', label: 'Has Heating Circuit' },
          { color: '#6B7280', label: 'No Heating Circuit' },
        ];
      case 'hasVentilation':
        return [
          { color: '#0EA5E9', label: 'Has Ventilation' },
          { color: '#6B7280', label: 'No Ventilation' },
        ];
      case 'missingVSGTOVConnections':
        return [
          { color: '#F59E0B', label: 'Missing VSGT OV' },
          { color: '#6B7280', label: 'VSGT OV Connected' },
        ];
      case 'missingLBGPOVConnections':
        return [
          { color: '#EF4444', label: 'Missing LBGP OV' },
          { color: '#6B7280', label: 'LBGP OV Connected' },
        ];
      case 'missingLBGTOVConnections':
        return [
          { color: '#F97316', label: 'Missing LBGT OV' },
          { color: '#6B7280', label: 'LBGT OV Connected' },
        ];
      case 'savingEnergy':
        return [
          { color: '#DC2626', label: 'Wasting (-10% or more)' },
          { color: '#F59E0B', label: 'Slight waste (-5% to -10%)' },
          { color: '#6B7280', label: 'Neutral (-5% to +5%)' },
          { color: '#FBBF24', label: 'Saving (5% to 10%)' },
          { color: '#10B981', label: 'Good saving (10% to 20%)' },
          { color: '#059669', label: 'Excellent saving (20%+)' },
        ];
      case 'automaticComfortScheduleActive':
        return [
          { color: '#16A34A', label: 'Auto Schedule Active' },
          { color: '#6B7280', label: 'Auto Schedule Inactive' },
        ];
      case 'manualComfortScheduleActive':
        return [
          { color: '#CA8A04', label: 'Manual Schedule Active' },
          { color: '#6B7280', label: 'Manual Schedule Inactive' },
        ];
      case 'componentsErrors':
        return [
          { color: '#DC2626', label: 'Component Errors' },
          { color: '#6B7280', label: 'No Component Errors' },
        ];
      case 'modelTrainingTestR2Score':
        return [
          { color: '#DC2626', label: 'Poor (0.0-0.3)' },
          { color: '#F59E0B', label: 'Fair (0.3-0.6)' },
          { color: '#FBBF24', label: 'Good (0.6-0.8)' },
          { color: '#10B981', label: 'Excellent (0.8-1.0)' },
        ];
      case 'hasDistrictHeatingMeter':
        return [
          { color: '#BE123C', label: 'Has District Heating Meter' },
          { color: '#6B7280', label: 'No District Heating Meter' },
        ];
      case 'hasDistrictCoolingMeter':
        return [
          { color: '#0891B2', label: 'Has District Cooling Meter' },
          { color: '#6B7280', label: 'No District Cooling Meter' },
        ];
      case 'hasElectricityMeter':
        return [
          { color: '#7C2D12', label: 'Has Electricity Meter' },
          { color: '#6B7280', label: 'No Electricity Meter' },
        ];
      default:
        return [];
    }
  };

  const getLegendTitle = () => {
    switch (filters.colorMode) {
      case 'temperature': return 'Temperature Scale';
      case 'comfort': return 'Comfort Zones';
      case 'adaptiveMin': return 'Adaptive Min (0-1)';
      case 'adaptiveMax': return 'Adaptive Max (0-1)';
      case 'hasClimateBaseline': return 'Climate Baseline Active';
      case 'hasReadWriteDiscrepancies': return 'Read/Write Issues';
      case 'hasZoneAssets': return 'Zone Assets';
      case 'hasHeatingCircuit': return 'Heating Circuit';
      case 'hasVentilation': return 'Ventilation';
      case 'missingVSGTOVConnections': return 'VSGT OV Connections';
      case 'missingLBGPOVConnections': return 'LBGP OV Connections';
      case 'missingLBGTOVConnections': return 'LBGT OV Connections';
      case 'savingEnergy': return 'Energy Saving';
      case 'automaticComfortScheduleActive': return 'Automatic Comfort Schedule';
      case 'manualComfortScheduleActive': return 'Manual Comfort Schedule';
      case 'componentsErrors': return 'Component Errors';
      case 'modelTrainingTestR2Score': return 'Model R2 Score';
      case 'hasDistrictHeatingMeter': return 'District Heating Meter';
      case 'hasDistrictCoolingMeter': return 'District Cooling Meter';
      case 'hasElectricityMeter': return 'Electricity Meter';
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
      {/* Filter Panel - positioned absolutely at top */}
      <BuildingFilters
        isExpanded={filtersExpanded}
        onToggle={() => setFiltersExpanded(!filtersExpanded)}
        filters={filters}
        onFiltersChange={setFilters}
        availableClients={availableClients}
      />

      {/* Main treemap - positioned below filter bar with spacing */}
      <div 
        className="absolute w-full cursor-pointer"
        style={{
          top: treemapTop,
          height: treemapHeight
        }}
        onClick={handleGridClick}
      >
        {renderNodes(treemapData)}
      </div>
      
      {/* Hover tooltip - positioned above filter bar with transition */}
      {hoveredNode && 'id' in hoveredNode.data && (
        <div 
          className="absolute bg-black bg-opacity-90 text-white p-4 rounded-lg pointer-events-none z-50 max-w-xs transition-opacity duration-150"
          style={{
            top: '40px',
            left: '16px'
          }}
        >
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
            <span className="text-blue-400">{(hoveredNode.data as any).temperature}°C</span>
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
