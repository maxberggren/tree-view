
import React, { useState, useEffect, useMemo } from 'react';
import * as d3 from 'd3-hierarchy';
import { TreemapCell } from './TreemapCell';
import { BuildingFilters } from './BuildingFilters';
import { StatsCard } from './StatsCard';
import { TreemapNode, BuildingData, ColorMode, GroupMode } from '@/types/TreemapData';
import { mockBuildingData } from '@/data/mockBuildingData';

interface TreemapProps {
  width: number;
  height: number;
}

interface FilterState {
  colorMode: ColorMode;
  groupMode: GroupMode;
  cycleEnabled: boolean;
  cycleInterval: number;
  selectedValues: string[];
}

export const Treemap: React.FC<TreemapProps> = ({ width, height }) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    colorMode: 'temperature',
    groupMode: 'client',
    cycleEnabled: false,
    cycleInterval: 5,
    selectedValues: []
  });

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const colorMode = urlParams.get('colorMode') as ColorMode;
    const groupMode = urlParams.get('groupMode') as GroupMode;
    
    if (colorMode || groupMode) {
      setFilters(prev => ({
        ...prev,
        ...(colorMode && { colorMode }),
        ...(groupMode && { groupMode })
      }));
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('colorMode', filters.colorMode);
    url.searchParams.set('groupMode', filters.groupMode);
    window.history.replaceState({}, '', url.toString());
  }, [filters.colorMode, filters.groupMode]);

  // Cycle through color modes
  useEffect(() => {
    if (!filters.cycleEnabled) return;

    const colorModes: ColorMode[] = [
      'temperature', 'comfort', 'hasClimateBaseline', 'hasReadWriteDiscrepancies',
      'hasZoneAssets', 'hasHeatingCircuit', 'hasVentilation', 'componentsErrors',
      'lastWeekUptime', 'savingEnergy', 'modelTrainingTestR2Score'
    ];

    const interval = setInterval(() => {
      setFilters(prev => {
        const currentIndex = colorModes.indexOf(prev.colorMode);
        const nextIndex = (currentIndex + 1) % colorModes.length;
        return { ...prev, colorMode: colorModes[nextIndex] };
      });
    }, filters.cycleInterval * 1000);

    return () => clearInterval(interval);
  }, [filters.cycleEnabled, filters.cycleInterval]);

  // Helper function to get display value for a building
  const getDisplayValue = (building: BuildingData, groupMode: GroupMode): string => {
    switch (groupMode) {
      case 'client':
        return building.client;
      case 'country':
        return building.country;
      case 'isOnline':
        return building.isOnline ? 'Online' : 'Offline';
      case 'lastWeekUptime':
        const uptime = building.lastWeekUptime;
        if (uptime >= 0.95) return 'Excellent (95%+)';
        if (uptime >= 0.90) return 'Good (90-95%)';
        if (uptime >= 0.80) return 'Fair (80-90%)';
        return 'Poor (<80%)';
      default:
        // For boolean features
        return building[groupMode] ? 'Yes' : 'No';
    }
  };

  // Get available filter values based on group mode
  const availableValues = useMemo(() => {
    const values = new Set<string>();
    mockBuildingData.forEach(building => {
      const value = getDisplayValue(building, filters.groupMode);
      values.add(value);
    });
    return Array.from(values).sort();
  }, [filters.groupMode]);

  // Filter data based on selected values and group mode
  const filteredData = useMemo(() => {
    if (filters.selectedValues.length === 0) {
      return mockBuildingData;
    }

    return mockBuildingData.filter(building => {
      const displayValue = getDisplayValue(building, filters.groupMode);
      return filters.selectedValues.includes(displayValue);
    });
  }, [filters.selectedValues, filters.groupMode]);

  // Group data based on group mode
  const groupedData = useMemo(() => {
    const groups = new Map<string, BuildingData[]>();
    
    filteredData.forEach(building => {
      const key = getDisplayValue(building, filters.groupMode);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(building);
    });

    return Array.from(groups.entries()).map(([name, children]) => ({
      name,
      children,
      value: children.reduce((sum, building) => sum + building.squareMeters, 0)
    }));
  }, [filteredData, filters.groupMode]);

  // Create treemap layout
  const treemapData = useMemo(() => {
    if (groupedData.length === 0) return null;

    const root = d3.hierarchy({ children: groupedData } as any)
      .sum((d: any) => d.squareMeters || d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemap = d3.treemap<any>()
      .size([width, height - (isFiltersExpanded ? 120 : 40)])
      .padding(2)
      .round(true);

    return treemap(root);
  }, [groupedData, width, height, isFiltersExpanded]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalBuildings = filteredData.length;
    const onlineBuildings = filteredData.filter(b => b.isOnline).length;
    const avgTemp = filteredData.reduce((sum, b) => sum + b.temperature, 0) / totalBuildings;
    const totalArea = filteredData.reduce((sum, b) => sum + b.squareMeters, 0);

    return {
      totalBuildings,
      onlineBuildings,
      avgTemp: isNaN(avgTemp) ? 0 : avgTemp,
      totalArea
    };
  }, [filteredData]);

  if (!treemapData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-xl mb-2">No Data Available</h2>
          <p className="text-gray-400">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900">
      <BuildingFilters
        isExpanded={isFiltersExpanded}
        onToggle={() => setIsFiltersExpanded(!isFiltersExpanded)}
        filters={filters}
        onFiltersChange={setFilters}
        availableValues={availableValues}
        filteredData={filteredData}
      />

      <div 
        className="relative"
        style={{ 
          marginTop: isFiltersExpanded ? 120 : 40,
          height: height - (isFiltersExpanded ? 120 : 40)
        }}
      >
        <svg width={width} height={height - (isFiltersExpanded ? 120 : 40)}>
          {treemapData.descendants().map((node, index) => (
            <TreemapCell
              key={getNodeKey(node, index)}
              node={node as TreemapNode}
              colorMode={filters.colorMode}
              onHover={undefined}
            />
          ))}
        </svg>

        <StatsCard
          filteredBuildings={filteredData}
        />
      </div>
    </div>
  );
};

// Helper function to generate unique keys
const getNodeKey = (node: any, index: number): string => {
  if (node.data && 'id' in node.data) {
    return node.data.id;
  } else if (node.data && 'name' in node.data) {
    return node.data.name;
  }
  return `node-${index}`;
};
