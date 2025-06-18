
import React from 'react';
import { TreemapNode } from '@/types/TreemapData';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface BuildingHoverCardProps {
  node: TreemapNode;
  children: React.ReactNode;
}

export const BuildingHoverCard: React.FC<BuildingHoverCardProps> = ({ node, children }) => {
  const building = node.data as any;
  const displayId = building.id.replace(/^BLD-/, '');

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-64">
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-semibold">{building.name}</h4>
            <p className="text-xs text-muted-foreground">Building id: {displayId}</p>
          </div>
          <div className="text-xs space-y-1">
            <p>Temperature: {building.temperature}°C</p>
            <p>Status: {building.isOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
