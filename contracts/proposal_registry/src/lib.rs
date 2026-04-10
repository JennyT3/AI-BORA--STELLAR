#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, testutils::Address as _, Address, Bytes, Env, String,
};

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

    pub fn verify_hash(env: Env, id: String, expected_hash: Bytes) -> bool {
        if let Some(p) = env.storage().instance().get::<String, Proposal>(&id) {
            p.pdf_hash == expected_hash
        } else {
            false
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_store_proposal() {
        let env = Env::default();
        let contract_id = env.register(ProposalRegistry, ());
        let client = ProposalRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let pdf_hash = Bytes::from_slice(&env, b"abc123def456");

        client.store_proposal(
            &admin,
            &String::from_str(&env, "prop-001"),
            &String::from_str(&env, "client@example.com"),
            &pdf_hash,
            &1000000000,
        );

        let proposal = client.get_proposal(&String::from_str(&env, "prop-001"));
        assert!(proposal.is_some());
        let p = proposal.unwrap();
        assert_eq!(p.client_email, String::from_str(&env, "client@example.com"));
        assert_eq!(p.status, String::from_str(&env, "pending"));
    }

    #[test]
    fn test_update_status() {
        let env = Env::default();
        let contract_id = env.register(ProposalRegistry, ());
        let client = ProposalRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let pdf_hash = Bytes::from_slice(&env, b"abc123def456");

        client.store_proposal(
            &admin,
            &String::from_str(&env, "prop-002"),
            &String::from_str(&env, "client@example.com"),
            &pdf_hash,
            &1000000000,
        );

        client.update_status(
            &admin,
            &String::from_str(&env, "prop-002"),
            &String::from_str(&env, "paid"),
        );

        let proposal = client
            .get_proposal(&String::from_str(&env, "prop-002"))
            .unwrap();
        assert_eq!(proposal.status, String::from_str(&env, "paid"));
    }

    #[test]
    fn test_verify_hash() {
        let env = Env::default();
        let contract_id = env.register(ProposalRegistry, ());
        let client = ProposalRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let pdf_hash = Bytes::from_slice(&env, b"abc123def456");

        client.store_proposal(
            &admin,
            &String::from_str(&env, "prop-003"),
            &String::from_str(&env, "client@example.com"),
            &pdf_hash,
            &1000000000,
        );

        let valid = client.verify_hash(
            &String::from_str(&env, "prop-003"),
            &Bytes::from_slice(&env, b"abc123def456"),
        );
        assert!(valid);

        let invalid = client.verify_hash(
            &String::from_str(&env, "prop-003"),
            &Bytes::from_slice(&env, b"wronghash"),
        );
        assert!(!invalid);
    }
}
