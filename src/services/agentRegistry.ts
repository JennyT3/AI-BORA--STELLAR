/**
 * Agent Registry Service
 * 
 * Interacts with the AgentRegistry Soroban contract for:
 * - Registering AI agents with their services and rates
 * - Recording payments to agents
 * - Querying agent information
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { CONTRACT_IDS, SOROBAN_CONFIG, AGENT_SERVICES } from '../config/contracts';

const server = new StellarSdk.SorobanRpc.Server(SOROBAN_CONFIG.RPC_URL);

export interface AgentService {
  type: keyof typeof AGENT_SERVICES;
  price: number;
}

export interface Agent {
  address: string;
  name: string;
  services: Map<string, number>;
  totalEarned: number;
  active: boolean;
}

export interface RegisterAgentParams {
  agentAddress: string;
  name: string;
  services: { serviceType: string; price: number }[];
  secretKey: string;
}

export interface RecordPaymentParams {
  payerAddress: string;
  agentAddress: string;
  amount: number;
  secretKey: string;
}

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function waitForTransaction(hash: string, retries = 20): Promise<StellarSdk.SorobanRpc.GetTransactionResponse> {
  for (let i = 0; i < retries; i++) {
    const result = await server.getTransaction(hash);
    if (result.status !== 'NOT_FOUND') return result;
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Transaction timeout');
}

export async function registerAgent(params: RegisterAgentParams): Promise<{ txHash: string; success: boolean }> {
  const { agentAddress, name, services, secretKey } = params;
  
  const keypair = StellarSdk.Keypair.fromSecret(secretKey);
  const account = await server.getAccount(keypair.publicKey());
  
  const contract = new StellarSdk.Contract(CONTRACT_IDS.AGENT_REGISTRY);
  
  const servicesMap = new StellarSdk.SorobanRpc.MapBuilder();
  services.forEach(({ serviceType, price }) => {
    servicesMap.set(
      StellarSdk.nativeToScVal(serviceType, { type: 'symbol' }),
      StellarSdk.nativeToScVal(BigInt(Math.round(price * 1_000_000)), { type: 'i128' })
    );
  });
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: SOROBAN_CONFIG.NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(
      'register_agent',
      StellarSdk.nativeToScVal(agentAddress, { type: 'address' }),
      StellarSdk.nativeToScVal(name, { type: 'string' }),
      servicesMap.build() as StellarSdk.xdr.ScVal,
    ))
    .setTimeout(60)
    .build();
  
  tx.sign(keypair);
  
  const result = await server.sendTransaction(tx);
  
  if (result.status === 'ERROR') {
    throw new Error(`Transaction failed: ${result.errorResultXdr}`);
  }
  
  const finalResult = await waitForTransaction(result.hash);
  
  return {
    txHash: result.hash,
    success: finalResult.status==='SUCCESS',
  };
}

export async function getAgent(agentAddress: string): Promise<Agent | null> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_IDS.AGENT_REGISTRY);
    
    const account = await server.getAccount(StellarSdk.Keypair.fromSecret('S'.padEnd(56, 'A')).publicKey());
    
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: SOROBAN_CONFIG.NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(
        'get_agent',
        StellarSdk.nativeToScVal(agentAddress, { type: 'address' }),
      ))
      .setTimeout(30)
      .build();
    
    const simResult = await server.simulateTransaction(tx);
    
    if ('result' in simResult && simResult.result) {
      const nativeResult = StellarSdk.scValToNative(simResult.result.retval);
      
      if (!nativeResult) return null;
      
      return {
        address: agentAddress,
        name: nativeResult.name || '',
        services: nativeResult.services || new Map(),
        totalEarned: Number(nativeResult.total_earned || 0) / 1_000_000,
        active: nativeResult.active ?? true,
      };
    }
    
    return null;
  } catch (err) {
    console.error('[AgentRegistry] getAgent error:', err);
    return null;
  }
}

export async function recordPayment(params: RecordPaymentParams): Promise<{ txHash: string; success: boolean }> {
  const { payerAddress, agentAddress, amount, secretKey } = params;
  
  const keypair = StellarSdk.Keypair.fromSecret(secretKey);
  const account = await server.getAccount(keypair.publicKey());
  
  const contract = new StellarSdk.Contract(CONTRACT_IDS.AGENT_REGISTRY);
  
  const amountStroops = BigInt(Math.round(amount * 1_000_000));
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: SOROBAN_CONFIG.NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(
      'record_payment',
      StellarSdk.nativeToScVal(payerAddress, { type: 'address' }),
      StellarSdk.nativeToScVal(agentAddress, { type: 'address' }),
      StellarSdk.nativeToScVal(amountStroops, { type: 'i128' }),
    ))
    .setTimeout(60)
    .build();
  
  tx.sign(keypair);
  
  const result = await server.sendTransaction(tx);
  
  if (result.status === 'ERROR') {
    throw new Error(`Transaction failed: ${result.errorResultXdr}`);
  }
  
  const finalResult = await waitForTransaction(result.hash);
  
  return {
    txHash: result.hash,
    success: finalResult.status === 'SUCCESS',
  };
}

export async function getServicePrice(agentAddress: string, serviceType: string): Promise<number> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_IDS.AGENT_REGISTRY);
    
    const account = await server.getAccount(StellarSdk.Keypair.fromSecret('S'.padEnd(56, 'A')).publicKey());
    
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: SOROBAN_CONFIG.NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(
        'get_service_price',
        StellarSdk.nativeToScVal(agentAddress, { type: 'address' }),
        StellarSdk.nativeToScVal(serviceType, { type: 'symbol' }),
      ))
      .setTimeout(30)
      .build();
    
    const simResult = await server.simulateTransaction(tx);
    
    if ('result' in simResult && simResult.result) {
      const price = StellarSdk.scValToNative(simResult.result.retval);
      return Number(price) / 1_000_000;
    }
    
    return0;
  } catch (err) {
    console.error('[AgentRegistry] getServicePrice error:', err);
    return 0;
  }
}

export async function getTotalEarned(agentAddress: string): Promise<number> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_IDS.AGENT_REGISTRY);
    
    const account = await server.getAccount(StellarSdk.Keypair.fromSecret('S'.padEnd(56, 'A')).publicKey());
    
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: SOROBAN_CONFIG.NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(
        'get_total_earned',
        StellarSdk.nativeToScVal(agentAddress, { type: 'address' }),
      ))
      .setTimeout(30)
      .build();
    
    const simResult = await server.simulateTransaction(tx);
    
    if ('result' in simResult && simResult.result) {
      const earned = StellarSdk.scValToNative(simResult.result.retval);
      return Number(earned) / 1_000_000;
    }
    
    return 0;
  } catch (err) {
    console.error('[AgentRegistry] getTotalEarned error:', err);
    return 0;
  }
}

export async function updateAgentRates(
  agentAddress: string,
  services: { serviceType: string; price: number }[],
  secretKey: string
): Promise<{ txHash: string; success: boolean }> {
  const keypair = StellarSdk.Keypair.fromSecret(secretKey);
  const account = await server.getAccount(keypair.publicKey());
  
  const contract = new StellarSdk.Contract(CONTRACT_IDS.AGENT_REGISTRY);
  
  const servicesMap = new StellarSdk.SorobanRpc.MapBuilder();
  services.forEach(({ serviceType, price }) => {
    servicesMap.set(
      StellarSdk.nativeToScVal(serviceType, { type: 'symbol' }),
      StellarSdk.nativeToScVal(BigInt(Math.round(price * 1_000_000)), { type: 'i128' })
    );
  });
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: SOROBAN_CONFIG.NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(
      'update_rates',
      StellarSdk.nativeToScVal(agentAddress, { type: 'address' }),
      servicesMap.build() as StellarSdk.xdr.ScVal,
    ))
    .setTimeout(60)
    .build();
  
  tx.sign(keypair);
  
  const result = await server.sendTransaction(tx);
  
  if (result.status === 'ERROR') {
    throw new Error(`Transaction failed: ${result.errorResultXdr}`);
  }
  
  const finalResult = await waitForTransaction(result.hash);
  
  return {
    txHash: result.hash,
    success: finalResult.status === 'SUCCESS',
  };
}

export async function deactivateAgent(
  agentAddress: string,
  secretKey: string
): Promise<{ txHash: string; success: boolean }> {
  const keypair = StellarSdk.Keypair.fromSecret(secretKey);
  const account = await server.getAccount(keypair.publicKey());
  
  const contract = new StellarSdk.Contract(CONTRACT_IDS.AGENT_REGISTRY);
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: SOROBAN_CONFIG.NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(
      'deactivate_agent',
      StellarSdk.nativeToScVal(agentAddress, { type: 'address' }),
    ))
    .setTimeout(60)
    .build();
  
  tx.sign(keypair);
  
  const result = await server.sendTransaction(tx);
  
  if (result.status === 'ERROR') {
    throw new Error(`Transaction failed: ${result.errorResultXdr}`);
  }
  
  const finalResult = await waitForTransaction(result.hash);
  
  return {
    txHash: result.hash,
    success: finalResult.status === 'SUCCESS',
  };
}

export { CONTRACT_IDS };