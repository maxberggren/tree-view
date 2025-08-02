import React, { useMemo, useState, useRef, useEffect } from 'react';
import { treemap, hierarchy } from 'd3-hierarchy';
import { DataCell } from './DataCell';
import { DataFilters } from './DataFilters';
import { DataTooltip } from './DataTooltip';
import { DataLegend } from './DataLegend';
import { TreemapNode, DataItem, GroupedData } from '@/types/DataTypes';
import { ConfigSchema } from '@/types/ConfigTypes';
import { useConfig } from '@/hooks/useConfig';
import { useData } from '@/hooks/useData';
import { groupData, getGroupableFields, getSizeField } from '@/utils/groupingEngine';
import { applyFilters, searchData, getFilterableFields, FilterState } from '@/utils/filterEngine';
import { useSearchParams } from 'react-router-dom';

interface TreemapProps {
  width: number;
  height: number;
}

interface TreemapFilterState {
  groupBy: string;
  colorBy: string;
  filters: FilterState;
  cycleColors?: boolean;
  cycleInterval?: number;
}

export const Treemap: React.FC<TreemapProps> = ({ width, height }) => {
  const { config, loading: configLoading, error: configError } = useConfig();
  const { data, loading: dataLoading, error: dataError } = useData();
  
  const [hoveredNode, setHoveredNode] = useState<TreemapNode | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get dynamic options from config
  const groupableFields = useMemo(() => 
    config ? getGroupableFields(config) : [], [config]
  );
  
  const colorableFields = useMemo(() => 
    config ? Object.entries(config)
      .filter(([_, fieldConfig]) => fieldConfig.colorMode)
      .map(([field, fieldConfig]) => ({ field, label: fieldConfig.label })) : [], 
    [config]
  );

  const sizeField = useMemo(() => 
    config ? getSizeField(config) : 'id', [config]
  );

    // Initialize state from URL params
  const [treeState, setTreeState] = useState<TreemapFilterState>(() => {
    const groupBy = searchParams.get('groupBy') || '';
    const colorBy = searchParams.get('colorBy') || '';
    
    return {
      groupBy,
      colorBy,
      filters: {}
    };
  });

  // Set defaults after config loads
  useEffect(() => {
    if (config && groupableFields.length > 0 && colorableFields.length > 0) {
      setTreeState(prev => ({
        ...prev,
        groupBy: prev.groupBy || groupableFields[0]?.field || '',
        colorBy: prev.colorBy || colorableFields[0]?.field || ''
      }));
    }
  }, [config, groupableFields, colorableFields]);

  // Update URL when state changes
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    if (treeState.groupBy) newParams.set('groupBy', treeState.groupBy);
    if (treeState.colorBy) newParams.set('colorBy', treeState.colorBy);
    
    setSearchParams(newParams, { replace: true });
  }, [treeState, setSearchParams]);

  // Color cycling logic
  useEffect(() => {
    if (!treeState.cycleColors || !colorableFields.length || colorableFields.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setTreeState(prev => {
        const currentIndex = colorableFields.findIndex(field => field.field === prev.colorBy);
        const nextIndex = (currentIndex + 1) % colorableFields.length;
        
        return {
          ...prev,
          colorBy: colorableFields[nextIndex].field
        };
      });
    }, (treeState.cycleInterval || 3) * 1000);

    return () => clearInterval(interval);
  }, [treeState.cycleColors, treeState.cycleInterval, colorableFields]);

  // Process data with filters
  const processedData = useMemo(() => {
    if (!data || !config) return [];
    
    let filtered = data;
    
    // Apply filters
    filtered = applyFilters(filtered, treeState.filters, config);
    
    return filtered;
  }, [data, config, treeState.filters]);

  // Group data
  const groupedData = useMemo(() => {
    if (!processedData.length) return [];
    return groupData(processedData, treeState.groupBy);
  }, [processedData, treeState.groupBy]);

  // Calculate data range for gradient fields
  const dataRange = useMemo(() => {
    if (!processedData.length || !config || !treeState.colorBy) return null;
    
    const fieldConfig = config[treeState.colorBy];
    if (!fieldConfig || fieldConfig.colorMode !== 'gradient') return null;
    
    const values = processedData
      .map(item => Number(item[treeState.colorBy]))
      .filter(val => !isNaN(val));
    
    if (values.length === 0) return null;
    
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }, [processedData, config, treeState.colorBy]);

  // Calculate filter bar dimensions
  const filterBarDimensions = useMemo(() => {    
    // Simple height calculation since active filters summary is removed
    const filterBarHeight = filtersExpanded ? 100 : 32; // Expanded vs collapsed
      
    return {
      height: filterBarHeight,
      availableHeight: height - filterBarHeight
    };
  }, [height, filtersExpanded]);

  const availableHeight = filterBarDimensions.availableHeight;

  // Create treemap data
  const treemapData = useMemo(() => {
    if (!groupedData.length || !config) return null;

    const rootData = {
      name: 'Data',
      children: groupedData
    };

    const root = hierarchy(rootData)
      .sum((d: any) => d[sizeField] || 1)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Reserve space at the top for group labels (25px for label height)
    const labelSpacing = 25;
    const treemapLayout = treemap<any>()
      .size([width, availableHeight - labelSpacing])
      .padding(3)
      .round(true);

    const layout = treemapLayout(root);
    
    // Offset all nodes down by the label spacing
    const offsetNodes = (node: any) => {
      node.x0 = node.x0;
      node.y0 = node.y0 + labelSpacing;
      node.x1 = node.x1;
      node.y1 = node.y1 + labelSpacing;
      
      if (node.children) {
        node.children.forEach(offsetNodes);
      }
    };
    
    offsetNodes(layout);
    return layout;
  }, [width, availableHeight, groupedData, sizeField, config]);

  const handleNodeHover = (node: TreemapNode | null) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (node) {
      setHoveredNode(node);
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredNode(null);
      }, 150);
    }
  };

  const handleGroupClick = (groupValue: string) => {
    if (!treeState.groupBy) return;
    
    const filterKey = `_group_${treeState.groupBy}`;
    const currentFilter = treeState.filters[filterKey];
    const isCurrentlyFiltered = Array.isArray(currentFilter) && currentFilter.includes(groupValue);
    
    if (isCurrentlyFiltered) {
      // Clear the filter if this group is already filtered
      const newFilters = { ...treeState.filters };
      delete newFilters[filterKey];
      setTreeState(prev => ({
        ...prev,
        filters: newFilters
      }));
    } else {
      // Set filter to show only this group
      setTreeState(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          [filterKey]: [groupValue]
        }
      }));
    }
  };

  const renderNodes = (node: any): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    
    if (node.children) {
      // Render group border
      if (node.depth === 1) {
        const groupWidth = node.x1 - node.x0;
        const groupHeight = node.y1 - node.y0;
        
        nodes.push(
          <div
            key={`group-${node.data.name}`}
            className="absolute border-2 border-blue-600 border-opacity-50 transition-all duration-75"
            style={{
              left: node.x0,
              top: node.y0,
              width: groupWidth,
              height: groupHeight,
            }}
          >
            <div 
              className="absolute text-white text-xs font-medium px-2 py-1 rounded cursor-pointer hover:text-gray-200 transition-colors z-10"
              style={{
                left: '0px',
                top: '-26px',
                backgroundColor: '#06112d',
              }}
              onClick={() => handleGroupClick(node.data.name)}
              title={(() => {
                const filterKey = `_group_${treeState.groupBy}`;
                const currentFilter = treeState.filters[filterKey];
                const isFiltered = Array.isArray(currentFilter) && currentFilter.includes(node.data.name);
                return isFiltered 
                  ? `Currently filtered to ${node.data.name} - click to clear filter`
                  : `Click to filter to only ${node.data.name}`;
              })()}
            >
              {config && treeState.groupBy && config[treeState.groupBy] 
                ? `${config[treeState.groupBy].label}: ${node.data.name}`
                : node.data.name}
            </div>
          </div>
        );
      }

      // Render children recursively
      node.children.forEach((child: any) => {  
        nodes.push(...renderNodes(child));
      });
    } else {
      // Render leaf node
      nodes.push(
        <DataCell
          key={`${node.data[sizeField]}-${node.x0}-${node.y0}`}
          node={node}
          config={config!}
          colorField={treeState.colorBy}
          dataRange={dataRange || undefined}
          onHover={handleNodeHover}
        />
      );
    }
    
    return nodes;
  };

  // Loading and error states
  if (configLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (configError || dataError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <p>Error: {configError || dataError}</p>
      </div>
    );
  }

  if (!config || !data) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <p>No configuration or data available</p>
      </div>
    );
  }

  if (!treemapData) {
    return (
      <div className="relative w-full h-full bg-gray-900 overflow-hidden">
        <DataFilters
          config={config}
          data={data}
          state={treeState}
          onStateChange={setTreeState}
          isExpanded={filtersExpanded}
          onToggle={() => setFiltersExpanded(!filtersExpanded)}
        />
        <div 
          className="absolute w-full flex items-center justify-center text-white transition-all duration-300 ease-out"
          style={{
            top: filterBarDimensions.height,
            height: availableHeight
          }}
        >
          <p>No data matches the current filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Filter Panel */}
      <DataFilters
        config={config}
        data={data}
        state={treeState}
        onStateChange={setTreeState}
        isExpanded={filtersExpanded}
        onToggle={() => setFiltersExpanded(!filtersExpanded)}
      />

      {/* Main treemap with smooth transitions */}
      <div 
        className="absolute w-full transition-all duration-300 ease-out"
        style={{
          top: filterBarDimensions.height,
          height: availableHeight
        }}
        onClick={() => setFiltersExpanded(false)}
      >
        {renderNodes(treemapData)}
      </div>
      
      {/* Dynamic tooltip */}
      {hoveredNode && config && treeState.colorBy && (
        <DataTooltip
          node={hoveredNode}
          config={config}
          colorField={treeState.colorBy}
          dataRange={dataRange || undefined}
        />
      )}

      {/* Dynamic Legend */}
      {config && treeState.colorBy && (
        <DataLegend
          config={config}
          colorField={treeState.colorBy}
          dataRange={dataRange || undefined}
        />
      )}
    </div>
  );
};
