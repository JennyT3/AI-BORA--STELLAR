#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Bytes, Env, String};

#[contracttype]
pub struct Proposal {
    pub client_email: String,
    pub pdf_hash: Bytes,
    pub amount: i128,
    pub status: String,
}

#[contract]
pub struct ProposalRegistry;

#[contractimpl]
impl ProposalRegistry {
    pub fn store_proposal(
        env: Env,
        admin: Address,
        id: String,
        client_email: String,
        pdf_hash: Bytes,
        amount: i128,
    ) {
        admin.require_auth();
        let proposal = Proposal {
            client_email,
            pdf_hash,
            amount,
            status: String::from_str(&env, "pending"),
        };
        env.storage().instance().set(&id, &proposal);
    }
    pub fn get_proposal(env: Env, id: String) -> Option<Proposal> {
        env.storage().instance().get(&id)
    }
    pub fn update_status(env: Env, admin: Address, id: String, new_status: String) {
        admin.require_auth();
        if let Some(mut p) = env.storage().instance().get::<String, Proposal>(&id) {
            p.status = new_status;
            env.storage().instance().set(&id, &p);
        }
    }
}
