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
    const groupBy = searchParams.get('groupBy') || (groupableFields[0]?.field || '');
    const colorBy = searchParams.get('colorBy') || (colorableFields[0]?.field || '');
    
    return {
      groupBy,
      colorBy,
      filters: {}
    };
  });

  // Update URL when state changes
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    if (treeState.groupBy) newParams.set('groupBy', treeState.groupBy);
    if (treeState.colorBy) newParams.set('colorBy', treeState.colorBy);
    
    setSearchParams(newParams, { replace: true });
  }, [treeState, setSearchParams]);

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

    const treemapLayout = treemap<any>()
      .size([width, height - 100]) // Reserve space for controls
      .padding(3)
      .round(true);

    return treemapLayout(root);
  }, [width, height, groupedData, sizeField, config]);

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
              className="absolute text-white text-sm font-medium px-2 rounded cursor-pointer hover:text-gray-200 transition-colors z-10"
              style={{
                left: '0px',
                top: '-22px',
                backgroundColor: '#06112d',
              }}
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
        <div className="flex items-center justify-center h-full text-white">
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
        className="absolute w-full"
        style={{
          top: 60, // Space for filters
          height: height - 60
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
        />
      )}

      {/* Dynamic Legend */}
      {config && treeState.colorBy && (
        <DataLegend
          config={config}
          colorField={treeState.colorBy}
        />
      )}
    </div>
  );
};
