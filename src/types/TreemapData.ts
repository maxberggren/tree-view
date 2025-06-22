
export interface FeatureConfig {
  label: string;
  type: 'boolean' | 'percentage' | 'number' | 'temperature';
  bins?: {
    value: any;
    label: string;
    color: string;
    borderColor: string;
  }[];
  colors?: {
    true: { bg: string; border: string };
    false: { bg: string; border: string };
  };
  gradientColors?: {
    min: { r: number; g: number; b: number };
    max: { r: number; g: number; b: number };
  };
}

export interface BuildingData {
  id: string;
  name: string;
  squareMeters: number;
  temperature: number;
  client: string;
  country: string;
  isOnline: boolean;
  
  // Flattened features - all at root level
  adaptiveMin: number;
  adaptiveMax: number;
  hasClimateBaseline: boolean;
  hasReadWriteDiscrepancies: boolean;
  hasZoneAssets: boolean;
  hasHeatingCircuit: boolean;
  hasVentilation: boolean;
  missingVSGTOVConnections: boolean;
  missingLBGPOVConnections: boolean;
  missingLBGTOVConnections: boolean;
  savingEnergy: number;
  automaticComfortScheduleActive: boolean;
  manualComfortScheduleActive: boolean;
  componentsErrors: boolean;
  modelTrainingTestR2Score: number;
  hasDistrictHeatingMeter: boolean;
  hasDistrictCoolingMeter: boolean;
  hasElectricityMeter: boolean;
  lastWeekUptime: number;
}

// Feature configuration mapping
export const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  temperature: {
    label: 'Temperature',
    type: 'temperature',
    bins: [
      { value: [0, 10], label: 'Cold (<10°C)', color: '#3B82F6', borderColor: '#1D4ED8' },
      { value: [10, 18], label: 'Cool (10-18°C)', color: '#06B6D4', borderColor: '#0891B2' },
      { value: [18, 25], label: 'Comfort (18-25°C)', color: '#10B981', borderColor: '#059669' },
      { value: [25, 30], label: 'Warm (25-30°C)', color: '#F59E0B', borderColor: '#D97706' },
      { value: [30, 100], label: 'Hot (>30°C)', color: '#EF4444', borderColor: '#DC2626' }
    ]
  },
  comfort: {
    label: 'Comfort Zone',
    type: 'temperature',
    bins: [
      { value: [0, 18], label: 'Too Cold (<18°C)', color: '#3B82F6', borderColor: '#2563EB' },
      { value: [18, 20], label: 'Mild', color: '#A3A3A3', borderColor: '#737373' },
      { value: [20, 25], label: 'Comfortable (20-25°C)', color: '#22C55E', borderColor: '#16A34A' },
      { value: [25, 28], label: 'Mild', color: '#A3A3A3', borderColor: '#737373' },
      { value: [28, 100], label: 'Too Hot (>28°C)', color: '#F97316', borderColor: '#EA580C' }
    ]
  },
  adaptiveMin: {
    label: 'Adaptive Min',
    type: 'percentage',
    gradientColors: {
      min: { r: 251, g: 191, b: 36 }, // Yellow
      max: { r: 107, g: 116, b: 128 }  // Gray
    }
  },
  adaptiveMax: {
    label: 'Adaptive Max',
    type: 'percentage',
    gradientColors: {
      min: { r: 139, g: 92, b: 246 }, // Purple
      max: { r: 107, g: 116, b: 128 }  // Gray
    }
  },
  hasClimateBaseline: {
    label: 'Climate Baseline',
    type: 'boolean',
    colors: {
      true: { bg: '#059669', border: '#047857' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  hasReadWriteDiscrepancies: {
    label: 'Read/Write Issues',
    type: 'boolean',
    colors: {
      true: { bg: '#EA580C', border: '#C2410C' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  hasZoneAssets: {
    label: 'Zone Assets',
    type: 'boolean',
    colors: {
      true: { bg: '#7C3AED', border: '#6D28D9' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  hasHeatingCircuit: {
    label: 'Heating Circuit',
    type: 'boolean',
    colors: {
      true: { bg: '#DC2626', border: '#991B1B' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  hasVentilation: {
    label: 'Ventilation',
    type: 'boolean',
    colors: {
      true: { bg: '#0EA5E9', border: '#0284C7' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  missingVSGTOVConnections: {
    label: 'Missing VSGT OV',
    type: 'boolean',
    colors: {
      true: { bg: '#F59E0B', border: '#D97706' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  missingLBGPOVConnections: {
    label: 'Missing LBGP OV',
    type: 'boolean',
    colors: {
      true: { bg: '#EF4444', border: '#DC2626' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  missingLBGTOVConnections: {
    label: 'Missing LBGT OV',
    type: 'boolean',
    colors: {
      true: { bg: '#F97316', border: '#EA580C' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  savingEnergy: {
    label: 'Energy Saving',
    type: 'percentage',
    bins: [
      { value: [-1, -0.1], label: 'Wasting (-10% or more)', color: '#DC2626', borderColor: '#991B1B' },
      { value: [-0.1, -0.05], label: 'Slight waste (-5% to -10%)', color: '#EF4444', borderColor: '#DC2626' },
      { value: [-0.05, 0.05], label: 'Neutral (-5% to +5%)', color: '#6B7280', borderColor: '#4B5563' },
      { value: [0.05, 0.1], label: 'Saving (5% to 10%)', color: '#FBBF24', borderColor: '#F59E0B' },
      { value: [0.1, 0.2], label: 'Good saving (10% to 20%)', color: '#10B981', borderColor: '#059669' },
      { value: [0.2, 1], label: 'Excellent saving (20%+)', color: '#059669', borderColor: '#047857' }
    ]
  },
  automaticComfortScheduleActive: {
    label: 'Auto Comfort Schedule',
    type: 'boolean',
    colors: {
      true: { bg: '#16A34A', border: '#15803D' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  manualComfortScheduleActive: {
    label: 'Manual Comfort Schedule',
    type: 'boolean',
    colors: {
      true: { bg: '#CA8A04', border: '#A16207' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  componentsErrors: {
    label: 'Component Errors',
    type: 'boolean',
    colors: {
      true: { bg: '#DC2626', border: '#991B1B' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  modelTrainingTestR2Score: {
    label: 'Model R² Score',
    type: 'percentage',
    bins: [
      { value: [0, 0.3], label: 'Poor (0.0-0.3)', color: '#DC2626', borderColor: '#991B1B' },
      { value: [0.3, 0.6], label: 'Fair (0.3-0.6)', color: '#F59E0B', borderColor: '#D97706' },
      { value: [0.6, 0.8], label: 'Good (0.6-0.8)', color: '#FBBF24', borderColor: '#F59E0B' },
      { value: [0.8, 1], label: 'Excellent (0.8-1.0)', color: '#10B981', borderColor: '#059669' }
    ]
  },
  hasDistrictHeatingMeter: {
    label: 'District Heating Meter',
    type: 'boolean',
    colors: {
      true: { bg: '#BE123C', border: '#9F1239' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  hasDistrictCoolingMeter: {
    label: 'District Cooling Meter',
    type: 'boolean',
    colors: {
      true: { bg: '#0891B2', border: '#0E7490' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  hasElectricityMeter: {
    label: 'Electricity Meter',
    type: 'boolean',
    colors: {
      true: { bg: '#7C2D12', border: '#92400E' },
      false: { bg: '#6B7280', border: '#4B5563' }
    }
  },
  lastWeekUptime: {
    label: 'Last Week Uptime',
    type: 'percentage',
    bins: [
      { value: [0, 0.80], label: 'Poor (<80%)', color: '#EF4444', borderColor: '#DC2626' },
      { value: [0.80, 0.90], label: 'Fair (80-90%)', color: '#FBBF24', borderColor: '#F59E0B' },
      { value: [0.90, 0.95], label: 'Good (90-95%)', color: '#10B981', borderColor: '#059669' },
      { value: [0.95, 1], label: 'Excellent (95%+)', color: '#059669', borderColor: '#047857' }
    ]
  }
};

export interface ClientData {
  name: string;
  children: BuildingData[];
}

export interface TreemapNode {
  data: BuildingData | ClientData;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  children?: TreemapNode[];
  parent?: TreemapNode;
  value?: number;
}

export type ColorMode = 'temperature' | 'comfort' | 'adaptiveMin' | 'adaptiveMax' | 'hasClimateBaseline' | 'hasReadWriteDiscrepancies' | 'hasZoneAssets' | 'hasHeatingCircuit' | 'hasVentilation' | 'missingVSGTOVConnections' | 'missingLBGPOVConnections' | 'missingLBGTOVConnections' | 'savingEnergy' | 'automaticComfortScheduleActive' | 'manualComfortScheduleActive' | 'componentsErrors' | 'modelTrainingTestR2Score' | 'hasDistrictHeatingMeter' | 'hasDistrictCoolingMeter' | 'hasElectricityMeter' | 'lastWeekUptime';

export type GroupMode = 'client' | 'country' | 'isOnline' | 'hasClimateBaseline' | 'hasReadWriteDiscrepancies' | 'hasZoneAssets' | 'hasHeatingCircuit' | 'hasVentilation' | 'missingVSGTOVConnections' | 'missingLBGPOVConnections' | 'missingLBGTOVConnections' | 'automaticComfortScheduleActive' | 'manualComfortScheduleActive' | 'componentsErrors' | 'hasDistrictHeatingMeter' | 'hasDistrictCoolingMeter' | 'hasElectricityMeter' | 'lastWeekUptime';

// Utility function to get binned value for a feature
export const getBinnedValue = (feature: string, value: any): { label: string; color: string; borderColor: string } => {
  const config = FEATURE_CONFIGS[feature];
  if (!config) return { label: 'Unknown', color: '#6B7280', borderColor: '#4B5563' };

  if (config.type === 'boolean') {
    const colorConfig = config.colors?.[value ? 'true' : 'false'];
    return {
      label: value ? 'Yes' : 'No',
      color: colorConfig?.bg || '#6B7280',
      borderColor: colorConfig?.border || '#4B5563'
    };
  }

  if (config.bins) {
    for (const bin of config.bins) {
      const [min, max] = bin.value;
      if (value >= min && value < max) {
        return {
          label: bin.label,
          color: bin.color,
          borderColor: bin.borderColor
        };
      }
    }
  }

  if (config.gradientColors) {
    const { min, max } = config.gradientColors;
    const t = Math.max(0, Math.min(1, value)); // Clamp between 0 and 1
    const r = Math.round(min.r + (max.r - min.r) * t);
    const g = Math.round(min.g + (max.g - min.g) * t);
    const b = Math.round(min.b + (max.b - min.b) * t);
    
    const borderR = Math.max(0, r - 20);
    const borderG = Math.max(0, g - 20);
    const borderB = Math.max(0, b - 20);

    return {
      label: config.type === 'percentage' ? `${(value * 100).toFixed(1)}%` : value.toString(),
      color: `rgb(${r}, ${g}, ${b})`,
      borderColor: `rgb(${borderR}, ${borderG}, ${borderB})`
    };
  }

  return { label: value.toString(), color: '#6B7280', borderColor: '#4B5563' };
};

// Utility function to format display value
export const formatFeatureValue = (feature: string, value: any): string => {
  const config = FEATURE_CONFIGS[feature];
  if (!config) return value?.toString() || 'N/A';

  if (config.type === 'boolean') return value ? 'Yes' : 'No';
  if (config.type === 'percentage') return `${(value * 100).toFixed(1)}%`;
  if (config.type === 'temperature') return `${value}°C`;
  if (config.type === 'number') return value.toString();

  return value?.toString() || 'N/A';
};
