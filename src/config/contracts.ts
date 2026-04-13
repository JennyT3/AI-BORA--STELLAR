/**
 * Contract IDs - Stellar Soroban Testnet
 * 
 * Centralized configuration for all deployed contracts.
 * Import from this file instead of hardcoding in multiple places.
 */

export const SOROBAN_CONFIG = {
  RPC_URL: 'https://soroban-testnet.stellar.org',
  NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
} as const;

export const CONTRACT_IDS = {
  PROPOSAL_REGISTRY: 'CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5',
  AGENT_REGISTRY: 'CCXDYLNIWJJB7VNTUWBWJOH26LUZOXKE24JWOPE7Y2E3MOTX2TC66T7M',
  PAYMENT_SPLITTER: 'CCP4JPWI33BC2XCDOLEDOIUR3MP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P',
} as const;

export const EXPLORER_URLS = {
  transaction: (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`,
  account: (address: string) => `https://stellar.expert/explorer/testnet/account/${address}`,
  contract: (id: string) => `https://stellar.expert/explorer/testnet/contract/${id}`,
} as const;

export const USDC_ASSET = {
  code: 'USDC',
  issuer: 'GBBD4776CWNWKHTZVJENQ5OWLT3MOOWQZIO6VVEHUD7H7H7MBYGCHQV',
  decimals: 7,
} as const;

export const AGENT_SERVICES = {
  MARKETING_ANALYSIS: 'MarketingAnalysis',
  SALES_SCRIPT: 'SalesScript',
  CONTRACT_DRAFT: 'ContractDraft',
  CUSTOM: 'Custom',
} as const;

export type AgentServiceType = typeof AGENT_SERVICES[keyof typeof AGENT_SERVICES];