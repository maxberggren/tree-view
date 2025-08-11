import { useState, useEffect } from 'react';
import { FieldConfig } from '@/types/ConfigTypes';

export const useConfig = () => {
  const [config, setConfig] = useState<Record<string, FieldConfig> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const configUrl = `${import.meta.env.BASE_URL}config.json`;
        const response = await fetch(configUrl, { cache: 'no-cache' });
        if (!response.ok) {
          throw new Error(`Failed to load config: ${response.statusText}`);
        }
        const configData = await response.json();
        setConfig(configData);
        setError(null);
      } catch (err) {
        console.error('Error loading config:', err);
        setError(err instanceof Error ? err.message : 'Failed to load config');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading, error };
};