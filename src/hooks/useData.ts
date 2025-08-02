import { useState, useEffect } from 'react';
import { DataItem } from '@/types/DataTypes';

export const useData = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.statusText}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    // Initial load
    loadData();

    // Set up polling every 1 second
    const interval = setInterval(loadData, 1000);

    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};