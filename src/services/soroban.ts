import * as StellarSdk from '@stellar/stellar-sdk';

const CONTRACT_ID = 'CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

const server = new StellarSdk.SorobanRpc.Server(RPC_URL, { allowHttp: true });

export async function invokeContract(
  method: string,
  args: Record<string, any>,
  secretKey: string
): Promise<StellarSdk.SorobanRpc.GetTransactionResponse> {
  const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
  const sourceAccount = await server.getAccount(sourceKeypair.publicKey());

  const contract = new StellarSdk.Contract(CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .setTimeout(30)
    .build();

  // Build the operation to invoke the contract
  const op = StellarSdk.Operation.invokeHostFunction({
    function: StellarSdk.xdr.HostFunctionType.hostFunctionTypeInvokeContract(
      new StellarSdk.xdr.InvokeContract({
        contractId: StellarSdk.Keypair.xdrDecodeContractAddress(CONTRACT_ID),
        functionName: method,
        args: Object.entries(args).map(([key, value]) => {
          if (typeof value === 'string') {
            return StellarSdk.nativeToScVal(value, { type: 'string' });
          }
          if (typeof value === 'number') {
            return StellarSdk.nativeToScVal(value, { type: 'i128' });
          }
          return StellarSdk.nativeToScVal(value);
        }),
      })
    ),
  });

  tx.appendOperation(op);
  tx.sign(sourceKeypair);

  const response = await server.sendTransaction(tx);
  
  if (response.status === 'PENDING') {
    const result = await server.getTransaction(response.hash);
    return result;
  }
  
  return response;
}

export async function storeProposalOnChain(
  proposalId: string,
  clientEmail: string,
  pdfHash: string,
  amount: number,
  secretKey: string
) {
  const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
  const sourceAccount = await server.getAccount(sourceKeypair.publicKey());

  const contract = new StellarSdk.Contract(CONTRACT_ID);

  // Convert hash hex to BytesN
  const pdfHashBuffer = Buffer.from(pdfHash.replace('0x', ''), 'hex');

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: '200000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .appendOperation(contract.call(
      'store_proposal',
      proposalId,
      clientEmail,
      StellarSdk.xdr.ScVal.scvBytes(pdfHashBuffer),
      amount * 10000000 // Convert to stroops
    ))
    .setTimeout(60)
    .build();

  tx.sign(sourceKeypair);

  const result = await server.sendTransaction(tx);
  
  if (result.status === 'PENDING') {
    await server.getTransaction(result.hash);
  }
  
  return result;
}

export async function getProposalFromChain(proposalId: string) {
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  
  const result = await server.simulateTransaction(
    new StellarSdk.TransactionBuilder(server.getBaseUrl(), {
      fee: '10000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .appendOperation(contract.call('get_proposal', proposalId))
      .setTimeout(30)
      .build()
  );

  return result;
}

export async function updateProposalStatus(
  proposalId: string,
  newStatus: string,
  secretKey: string
) {
  const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
  const sourceAccount = await server.getAccount(sourceKeypair.publicKey());

  const contract = new StellarSdk.Contract(CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .appendOperation(contract.call('update_status', proposalId, newStatus))
    .setTimeout(30)
    .build();

  tx.sign(sourceKeypair);

  return await server.sendTransaction(tx);
}

export { CONTRACT_ID, NETWORK_PASSPHRASE };