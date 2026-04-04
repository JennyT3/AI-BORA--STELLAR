import { useState, useEffect, useCallback } from 'react';
import { listClientes, deleteCliente, updateCliente } from '../services/firebase';
import { Cliente } from '../types';
import { Cliente } from '../types';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listClientes();
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  const removeCliente = async (id: string) => {
    await deleteCliente(id);
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  const updateClienteData = async (id: string, data: Partial<Cliente>) => {
    await updateCliente(id, data);
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  return { clientes, loading, error, refresh: fetchClientes, removeCliente, updateClienteData };
}