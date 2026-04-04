import { useState, useEffect, useCallback } from 'react';
import { listSolicitudes, deleteSolicitude, updateSolicitudeStatus, Solicitude } from '../services/solicitudes';

export function useSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitude[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listSolicitudes();
      setSolicitudes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSolicitudes(); }, [fetchSolicitudes]);

  const removeSolicitude = async (id: string) => {
    await deleteSolicitude(id);
    setSolicitudes(prev => prev.filter(s => s.id !== id));
  };

  const updateStatus = async (id: string, status: string) => {
    await updateSolicitudeStatus(id, status);
    setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  return { solicitudes, loading, error, refresh: fetchSolicitudes, removeSolicitude, updateStatus };
}