#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Proposal {
    pub id: String,
    pub client_email: String,
    pub pdf_hash: BytesN<32>,
    pub amount: i128,
    pub status: String,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct PaymentRecipient {
    pub address: Address,
    pub percentage: u32,
}

#[contract]
pub struct ProposalRegistry;

#[contractimpl]
impl ProposalRegistry {
    pub fn init(_env: Env) {
        // Empty init
    }

    pub fn store_proposal(
        env: Env,
        id: String,
        client_email: String,
        pdf_hash: BytesN<32>,
        amount: i128,
    ) -> String {
        let proposal = Proposal {
            id: id.clone(),
            client_email,
            pdf_hash,
            amount,
            status: String::from_str(&env, "pending"),
            created_at: env.ledger().timestamp(),
        };

        env.storage().instance().set(&id, &proposal);
        id
    }

    pub fn get_proposal(env: Env, id: String) -> Option<Proposal> {
        env.storage().instance().get(&id)
    }

    pub fn update_status(env: Env, id: String, new_status: String) {
        let mut proposal: Proposal = env.storage().instance().get(&id).unwrap();
        proposal.status = new_status;
        env.storage().instance().set(&id, &proposal);
    }

    pub fn set_payment_recipients(
        env: Env,
        proposal_id: String,
        recipients: Vec<PaymentRecipient>,
    ) {
        env.storage().instance().set(&proposal_id, &recipients);
    }

    pub fn get_payment_recipients(env: Env, proposal_id: String) -> Vec<PaymentRecipient> {
        env.storage()
            .instance()
            .get(&proposal_id)
            .unwrap_or(Vec::new(&env))
    }
}
