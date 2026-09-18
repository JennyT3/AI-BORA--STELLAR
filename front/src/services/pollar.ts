import { useSyncExternalStore } from 'react';
import { PollarClient, type AuthState } from '@pollar/core';

// Official Pollar docs use `VITE_POLLAR_PUBLISHABLE_KEY`. Keep
// `VITE_POLLAR_PUBLIC_KEY` as a fallback for backward compatibility.
const POLLAR_PUBLIC_KEY =
  (import.meta.env.VITE_POLLAR_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_POLLAR_PUBLIC_KEY as string | undefined);

export const pollarConfigured = !!POLLAR_PUBLIC_KEY;

export const pollarClient: PollarClient | null = POLLAR_PUBLIC_KEY
  ? new PollarClient({ apiKey: POLLAR_PUBLIC_KEY })
  : null;

export function usePollarAuth(): AuthState {
  return useSyncExternalStore(
    (onChange) => {
      if (!pollarClient) return () => {};
      return pollarClient.onAuthStateChange(onChange);
    },
    () => (pollarClient ? pollarClient.getAuthState() : ({ step: 'idle' } as AuthState)),
    () => (pollarClient ? pollarClient.getAuthState() : ({ step: 'idle' } as AuthState)),
  );
}