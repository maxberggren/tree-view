import React, { useMemo, useState, useRef, useEffect } from 'react';
import { treemap, hierarchy } from 'd3-hierarchy';
import { BuildingCell } from './BuildingCell';
import { BuildingFilters } from './BuildingFilters';
import { StatsCard } from './StatsCard';
import { TreemapNode, ColorMode, GroupMode } from '@/types/TreemapData';
import { mockBuildingData } from '@/data/mockBuildingData';
import { useSearchParams } from 'react-router-dom';

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
  groupMode: GroupMode;
  cycleEnabled: boolean;
  cycleInterval: number;
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
  groupMode: 'client',
  cycleEnabled: false,
  cycleInterval: 5,
};

// All available color modes for cycling
const colorModes: ColorMode[] = [
  'temperature',
  'comfort',
  'adaptiveMin',
  'adaptiveMax',
  'hasClimateBaseline',
  'hasReadWriteDiscrepancies',
  'hasZoneAssets',
  'hasHeatingCircuit',
  'hasVentilation',
  'missingVSGTOVConnections',
  'missingLBGPOVConnections',
  'missingLBGTOVConnections',
  'savingEnergy',
  'automaticComfortScheduleActive',
  'manualComfortScheduleActive',
  'componentsErrors',
  'modelTrainingTestR2Score',
  'hasDistrictHeatingMeter',
  'hasDistrictCoolingMeter',
  'hasElectricityMeter',
];

export const Treemap: React.FC<TreemapProps> = ({ width, height }) => {
  const [hoveredNode, setHoveredNode] = useState<TreemapNode | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cycleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>(() => {
    const urlColorMode = searchParams.get('colorMode') as ColorMode;
    const urlGroupMode = searchParams.get('groupMode') as GroupMode;
    const urlClients = searchParams.get('clients')?.split(',').filter(Boolean) || [];
    const urlOnlineOnly = searchParams.get('onlineOnly') === 'true';
    const urlCycleEnabled = searchParams.get('cycleEnabled') === 'true';
    const urlCycleInterval = parseInt(searchParams.get('cycleInterval') || '5');
    
    // Parse feature filters from URL
    const urlFeatures = { ...initialFilters.features };
    Object.keys(initialFilters.features).forEach(key => {
      const urlValue = searchParams.get(key);
      if (urlValue === 'true') {
        urlFeatures[key as keyof FilterState['features']] = true;
      }
    });

    return {
      ...initialFilters,
      colorMode: urlColorMode && Object.keys(initialFilters).includes('colorMode') ? urlColorMode : initialFilters.colorMode,
      groupMode: urlGroupMode || initialFilters.groupMode,
      clients: urlClients,
      onlineOnly: urlOnlineOnly,
      features: urlFeatures,
      cycleEnabled: urlCycleEnabled,
      cycleInterval: isNaN(urlCycleInterval) ? 5 : urlCycleInterval,
    };
  });

  // Cycle through color modes
  useEffect(() => {
    if (filters.cycleEnabled) {
      cycleIntervalRef.current = setInterval(() => {
        setFilters(prevFilters => {
          const currentIndex = colorModes.indexOf(prevFilters.colorMode);
          const nextIndex = (currentIndex + 1) % colorModes.length;
          return {
            ...prevFilters,
            colorMode: colorModes[nextIndex]
          };
        });
      }, filters.cycleInterval * 1000);

      return () => {
        if (cycleIntervalRef.current) {
          clearInterval(cycleIntervalRef.current);
        }
      };
    } else {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
    }
  }, [filters.cycleEnabled, filters.cycleInterval]);

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    // Add color mode
    if (filters.colorMode !== initialFilters.colorMode) {
      newParams.set('colorMode', filters.colorMode);
    }

    // Add group mode
    if (filters.groupMode !== initialFilters.groupMode) {
      newParams.set('groupMode', filters.groupMode);
    }
    
    // Add clients
    if (filters.clients.length > 0) {
      newParams.set('clients', filters.clients.join(','));
    }
    
    // Add online only
    if (filters.onlineOnly !== initialFilters.onlineOnly) {
      newParams.set('onlineOnly', filters.onlineOnly.toString());
    }

    // Add cycle settings
    if (filters.cycleEnabled !== initialFilters.cycleEnabled) {
      newParams.set('cycleEnabled', filters.cycleEnabled.toString());
    }

    if (filters.cycleInterval !== initialFilters.cycleInterval) {
      newParams.set('cycleInterval', filters.cycleInterval.toString());
    }
    
    // Add feature filters
    Object.entries(filters.features).forEach(([key, value]) => {
      if (value !== initialFilters.features[key as keyof FilterState['features']]) {
        newParams.set(key, value.toString());
      }
    });

    setSearchParams(newParams, { replace: true });
  }, [filters, setSearchParams]);

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

  // Get all filtered buildings for stats calculation
  const allFilteredBuildings = useMemo(() => {
    return filteredData.flatMap(client => client.children);
  }, [filteredData]);

  // Group buildings based on the selected group mode
  const groupedData = useMemo(() => {
    const buildings = allFilteredBuildings;
    
    if (filters.groupMode === 'client') {
      return filteredData;
    }

    // Group by other attributes
    const groups = new Map<string, any[]>();
    
    buildings.forEach(building => {
      let groupKey: string;
      
      switch (filters.groupMode) {
        case 'country':
          groupKey = building.country;
          break;
        case 'isOnline':
          groupKey = building.isOnline ? 'Online' : 'Offline';
          break;
        default:
          // For feature-based grouping
          if (filters.groupMode in building.features) {
            const featureValue = building.features[filters.groupMode as keyof typeof building.features];
            groupKey = typeof featureValue === 'boolean' 
              ? (featureValue ? 'Yes' : 'No')
              : featureValue.toString();
          } else {
            groupKey = 'Unknown';
          }
          break;
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(building);
    });

    return Array.from(groups.entries()).map(([groupName, children]) => ({
      name: groupName,
      children
    }));
  }, [allFilteredBuildings, filters.groupMode, filteredData]);

  // Use fixed height for filter bar and add space for client tags
  const filterBarHeight = 25; // Fixed height for the toggle bar
  const clientTagSpacing = 20; // Space for client tags above the grid
  const treemapHeight = height - filterBarHeight - clientTagSpacing;
  const treemapTop = filterBarHeight + clientTagSpacing;

  const treemapData = useMemo(() => {
    if (groupedData.length === 0) return null;

    const rootData = {
      name: 'Buildings',
      children: groupedData.map(group => ({
        name: group.name,
        children: group.children
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
  }, [width, treemapHeight, groupedData]);

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
      // Render group border for grouping
      if (node.depth === 1) {
        const groupWidth = node.x1 - node.x0;
        const groupHeight = node.y1 - node.y0;
        
        nodes.push(
          <div
            key={`group-${node.data.name}`}
            className="absolute border-2 border-blue-600 border-opacity-50"
            style={{
              left: node.x0,
              top: node.y0,
              width: groupWidth,
              height: groupHeight,
            }}
          >
            <div 
              className="absolute text-white text-sm font-medium px-2 rounded cursor-pointer hover:text-gray-200 transition-colors z-10"
              style={{
                left: '6px',
                top: '-22px',
                backgroundColor: '#06112d',
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
        />
      );
    }
    
    return nodes;
  };

  const getFeatureValue = (building: any, feature: string) => {
    switch (feature) {
      case 'adaptiveMin':
        return `${(building.features.adaptiveMin * 100).toFixed(1)}%`;
      case 'adaptiveMax':
        return `${(building.features.adaptiveMax * 100).toFixed(1)}%`;
      case 'savingEnergy':
        return `${(building.features.savingEnergy * 100).toFixed(1)}%`;
      case 'modelTrainingTestR2Score':
        return `${(building.features.modelTrainingTestR2Score * 100).toFixed(1)}%`;
      default:
        return building.features[feature] ? 'Yes' : 'No';
    }
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
          { color: '#EF4444', label: 'Slight waste (-5% to -10%)' },
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
          { color: '#BE123C', label: 'Has Heating Meter' },
          { color: '#6B7280', label: 'No Heating Meter' },
        ];
      case 'hasDistrictCoolingMeter':
        return [
          { color: '#0891B2', label: 'Has Cooling Meter' },
          { color: '#6B7280', label: 'No Cooling Meter' },
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
      case 'hasDistrictHeatingMeter': return 'Heating Meter';
      case 'hasDistrictCoolingMeter': return 'Cooling Meter';
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
        <StatsCard filteredBuildings={allFilteredBuildings} />
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
          className="absolute bg-black bg-opacity-95 text-white p-4 rounded-lg pointer-events-none z-50 max-w-md transition-opacity duration-150"
          style={{
            top: '40px',
            left: '16px'
          }}
        >
          <div className="font-bold text-lg">{(hoveredNode.data as any).name}</div>
          <div className="text-sm opacity-90 mb-2">Building id: {(hoveredNode.data as any).id.replace(/^BLD-/, '')}</div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
            <div>
              <span className="opacity-75">Client: </span>
              <span className="text-blue-400">{(hoveredNode.data as any).client}</span>
            </div>
            <div>
              <span className="opacity-75">Country: </span>
              <span className="text-yellow-400">{(hoveredNode.data as any).country}</span>
            </div>
            <div>
              <span className="opacity-75">Status: </span>
              <span className={(hoveredNode.data as any).isOnline ? 'text-green-400' : 'text-red-400'}>
                {(hoveredNode.data as any).isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div>
              <span className="opacity-75">Temperature: </span>
              <span className="text-blue-400">{(hoveredNode.data as any).temperature}°C</span>
            </div>
            <div>
              <span className="opacity-75">Size: </span>
              <span>{(hoveredNode.data as any).squareMeters.toLocaleString()} m²</span>
            </div>
          </div>

          {/* All Features */}
          <div className="text-xs">
            <div className="opacity-75 mb-2 font-semibold">All Features:</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div>
                <span className="opacity-75">Adaptive Min: </span>
                <span className="text-yellow-400">{getFeatureValue(hoveredNode.data, 'adaptiveMin')}</span>
              </div>
              <div>
                <span className="opacity-75">Adaptive Max: </span>
                <span className="text-purple-400">{getFeatureValue(hoveredNode.data, 'adaptiveMax')}</span>
              </div>
              <div>
                <span className="opacity-75">Climate Baseline: </span>
                <span className={(hoveredNode.data as any).features.hasClimateBaseline ? 'text-green-400' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'hasClimateBaseline')}
                </span>
              </div>
              <div>
                <span className="opacity-75">R/W Issues: </span>
                <span className={(hoveredNode.data as any).features.hasReadWriteDiscrepancies ? 'text-red-400' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'hasReadWriteDiscrepancies')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Zone Assets: </span>
                <span className={(hoveredNode.data as any).features.hasZoneAssets ? 'text-purple-400' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'hasZoneAssets')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Heating Circuit: </span>
                <span className={(hoveredNode.data as any).features.hasHeatingCircuit ? 'text-red-400' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'hasHeatingCircuit')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Ventilation: </span>
                <span className={(hoveredNode.data as any).features.hasVentilation ? 'text-cyan-400' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'hasVentilation')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Missing VSGT OV: </span>
                <span className={(hoveredNode.data as any).features.missingVSGTOVConnections ? 'text-amber-400' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'missingVSGTOVConnections')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Missing LBGP OV: </span>
                <span className={(hoveredNode.data as any).features.missingLBGPOVConnections ? 'text-red-400' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'missingLBGPOVConnections')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Missing LBGT OV: </span>
                <span className={(hoveredNode.data as any).features.missingLBGTOVConnections ? 'text-orange-400' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'missingLBGTOVConnections')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Energy Saving: </span>
                <span className={
                  (hoveredNode.data as any).features.savingEnergy <= -0.1 ? 'text-red-400' :
                  (hoveredNode.data as any).features.savingEnergy <= -0.05 ? 'text-red-300' :
                  (hoveredNode.data as any).features.savingEnergy <= 0.05 ? 'text-gray-400' :
                  (hoveredNode.data as any).features.savingEnergy <= 0.1 ? 'text-yellow-400' :
                  (hoveredNode.data as any).features.savingEnergy <= 0.2 ? 'text-green-400' : 'text-green-500'
                }>
                  {getFeatureValue(hoveredNode.data, 'savingEnergy')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Auto Schedule: </span>
                <span className={(hoveredNode.data as any).features.automaticComfortScheduleActive ? 'text-green-400' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'automaticComfortScheduleActive')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Manual Schedule: </span>
                <span className={(hoveredNode.data as any).features.manualComfortScheduleActive ? 'text-yellow-400' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'manualComfortScheduleActive')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Component Errors: </span>
                <span className={(hoveredNode.data as any).features.componentsErrors ? 'text-red-400' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'componentsErrors')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Model R2 Score: </span>
                <span className={
                  (hoveredNode.data as any).features.modelTrainingTestR2Score < 0.3 ? 'text-red-400' :
                  (hoveredNode.data as any).features.modelTrainingTestR2Score < 0.6 ? 'text-amber-400' :
                  (hoveredNode.data as any).features.modelTrainingTestR2Score < 0.8 ? 'text-yellow-400' : 'text-green-400'
                }>
                  {getFeatureValue(hoveredNode.data, 'modelTrainingTestR2Score')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Heating Meter: </span>
                <span className={(hoveredNode.data as any).features.hasDistrictHeatingMeter ? 'text-rose-400' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'hasDistrictHeatingMeter')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Cooling Meter: </span>
                <span className={(hoveredNode.data as any).features.hasDistrictCoolingMeter ? 'text-cyan-400' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'hasDistrictCoolingMeter')}
                </span>
              </div>
              <div>
                <span className="opacity-75">Electricity Meter: </span>
                <span className={(hoveredNode.data as any).features.hasElectricityMeter ? 'text-amber-600' : 'text-gray-400'}>
                  {getFeatureValue(hoveredNode.data, 'hasElectricityMeter')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Card - positioned at bottom left */}
      <StatsCard filteredBuildings={allFilteredBuildings} />

      {/* Dynamic Legend */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-90 text-white p-3 rounded-lg max-w-xs z-20">
        <div className="text-xs font-bold mb-2">
          {getLegendTitle()}
          {filters.cycleEnabled && (
            <span className="text-blue-400 ml-2">(Auto-cycling)</span>
          )}
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
