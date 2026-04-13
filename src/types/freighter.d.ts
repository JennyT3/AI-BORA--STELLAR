/**
 * Freighter Wallet Types
 * 
 * TypeScript declarations for Freighter wallet browser extension.
 * @see https://github.com/stellar/freighter/blob/main/packages/extension/src/contentScript/inpage/index.ts
 */

declare global {
  interface Window {
    freighter?: {
      /**
       * Check if Freighter is connected/available
       */
      isConnected(): Promise<boolean>;
      
      /**
       * Get the user's public key
       */
      getPublicKey(): Promise<string>;
      
      /**
       * Get the network passphrase (e.g., "Test SDF Network ; September 2015")
       */
      getNetwork(): Promise<string>;
      
      /**
       * Sign a transaction XDR
       * @param xdr - The transaction XDR to sign
       * @param opts - Options including networkPassphrase
       */
      signTransaction(
        xdr: string, 
        opts?: { networkPassphrase?: string }
      ): Promise<string>;
      
      /**
       * Sign a Soroban transaction with auth
       */
      signAuthEntry?(entry: unknown, opts?: { publicKey?: string }): Promise<string>;
      
      /**
       * Request user to sign and submit a transaction
       */
      submitTransaction?(xdr: string): Promise<{ hash: string; status: string }>;
    };
  }
}

export {};