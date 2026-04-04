import { useState, useEffect, useCallback } from 'react';
import { listProposals, deleteProposal, updateProposal } from '../services/firebase';
import { Proposal } from '../types';
import { Proposal } from '../types';

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listProposals();
      setProposals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading proposals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  const removeProposal = async (id: string) => {
    await deleteProposal(id);
    setProposals(prev => prev.filter(p => p.id !== id));
  };

  const updateProposalStatus = async (id: string, status: string) => {
    await updateProposal(id, { status });
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  return { proposals, loading, error, refresh: fetchProposals, removeProposal, updateProposalStatus };
}