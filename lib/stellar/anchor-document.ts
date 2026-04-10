import { Keypair, Networks, TransactionBuilder, Memo, Operation, Asset } from '@stellar/stellar-sdk';

const VENDOR_SECRET = process.env.STELLAR_VENDOR_SECRET || 'SCNAYRZDW6DCNHNJTH6XGDXATRGJKDYXL5AWCKWRMDTWM5VXUCSMFH3R';
const VENDOR_PUBLIC = 'GBM4USEN622JABS37BVEHK43HASCX7PSRDMB37PKL53R725OFOHNWL3B';
const API_URL = (globalThis as any).process?.env?.VITE_API_URL || 'http://localhost:3001';

export interface AnchorResult {
  documentHash: string;
  anchorTxHash: string;
  explorerUrl: string;
  anchoredAt: string;
}

export interface AnchorResultFull extends AnchorResult {
  documentId: string;
}

export async function calculatePdfHash(pdfBlob: Blob): Promise<string> {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const documentHash = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return documentHash;
}

export async function anchorDocumentHash(
  pdfBlob: Blob,
  documentId: string
): Promise<AnchorResultFull> {
  const documentHash = await calculatePdfHash(pdfBlob);

  console.log(`[ANCHOR] Document: ${documentId}`);
  console.log(`[ANCHOR] Hash (64 chars): ${documentHash}`);

  const response = await fetch(`${API_URL}/api/anchor-document`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentHash, documentId }),
  });

  if (!response.ok) {
    throw new Error(`Anchor failed: ${response.statusText}`);
  }

  const result = await response.json();

  console.log(`[ANCHOR] Transaction: ${result.anchorTxHash}`);
  console.log(`[ANCHOR] Explorer: ${result.explorerUrl}`);

  return {
    documentHash: result.documentHash,
    anchorTxHash: result.anchorTxHash,
    explorerUrl: result.explorerUrl,
    anchoredAt: result.anchoredAt,
    documentId,
  };
}

export function formatHashDisplay(hash: string): string {
  if (!hash || hash.length < 16) return hash;
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
}

export function isValidHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/.test(hash);
}