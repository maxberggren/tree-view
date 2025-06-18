
import React from 'react';
import { BuildingData } from '@/types/TreemapData';

interface StatsCardProps {
  filteredBuildings: BuildingData[];
}

export const StatsCard: React.FC<StatsCardProps> = ({ filteredBuildings }) => {
  const stats = React.useMemo(() => {
    const onlineBuildings = filteredBuildings.filter(b => b.isOnline);
    const offlineBuildings = filteredBuildings.filter(b => !b.isOnline);
    
    const totalSquareMetersOnline = onlineBuildings.reduce((sum, b) => sum + b.squareMeters, 0);
    const totalSquareMetersOffline = offlineBuildings.reduce((sum, b) => sum + b.squareMeters, 0);
    
    const uniqueClients = new Set(filteredBuildings.map(b => b.client)).size;
    const uniqueCountries = new Set(filteredBuildings.map(b => b.country)).size;
    
    return {
      totalBuildings: filteredBuildings.length,
      totalSquareMetersOnline,
      totalSquareMetersOffline,
      uniqueClients,
      uniqueCountries,
    };
  }, [filteredBuildings]);

  const formatSquareMeters = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="absolute bottom-4 left-4 bg-black bg-opacity-90 text-white p-3 rounded-lg max-w-xs z-20">
      <div className="text-xs font-bold mb-2">Statistics</div>
      
      <div className="flex flex-col gap-1 text-xs">
        <div className="flex justify-between">
          <span className="opacity-75 pr-2">Buildings:</span>
          <span className="text-blue-400">{stats.totalBuildings}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="opacity-75 pr-2">Clients:</span>
          <span className="text-purple-400">{stats.uniqueClients}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="opacity-75 pr-2">Countries:</span>
          <span className="text-yellow-400">{stats.uniqueCountries}</span>
        </div>
        
        <div className="border-t border-gray-600 mt-1 pt-1">
          <div className="flex justify-between">
            <span className="opacity-75 pr-2">Online m²:</span>
            <span className="text-green-400">{formatSquareMeters(stats.totalSquareMetersOnline)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="opacity-75 pr-2">Offline m²:</span>
            <span className="text-red-400">{formatSquareMeters(stats.totalSquareMetersOffline)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
