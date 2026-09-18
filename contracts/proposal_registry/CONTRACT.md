# AI BORA - Stellar Smart Contract

## Contract Address (Testnet)
```
CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5
```

## Deployed Functions

| Function | Description |
|----------|-------------|
| `init` | Initialize contract |
| `store_proposal(id, client_email, pdf_hash, amount)` | Store proposal with PDF hash |
| `get_proposal(id)` | Retrieve proposal by ID |
| `update_status(id, new_status)` | Update proposal status (pending/paid/completed) |
| `set_payment_recipients(proposal_id, recipients)` | Set payment distribution |
| `get_payment_recipients(proposal_id)` | Get payment recipients |

## WASM Details
- **File**: `target/wasm32v1-none/release/proposal_registry.wasm`
- **Hash**: `3d812c089646422d2d7fe248a36e807d0daa364015598089cd0f188017326fc0`
- **Size**: 4117 bytes

## Testnet Explorer
https://stellar.expert/explorer/testnet/contract/CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5