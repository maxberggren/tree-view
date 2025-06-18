
import React from 'react';
import { Treemap } from '@/components/Treemap';
import { useWindowSize } from '@/hooks/useWindowSize';

const Index = () => {
  const { width, height } = useWindowSize();

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-900">
      <Treemap width={width} height={height} />
    </div>
  );
};

export default Index;
