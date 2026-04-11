#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
pub struct Payment {
    pub total_amount: i128,
    pub admin_amount: i128,
    pub collaborator_amount: i128,
    pub status: String,
}

#[contract]
pub struct PaymentSplitter;

#[contractimpl]
impl PaymentSplitter {
    pub fn create_payment(env: Env, admin: Address, id: String, total_amount: i128) -> String {
        admin.require_auth();
        let admin_amt = (total_amount * 70) / 100;
        let collab_amt = (total_amount * 30) / 100;
        let payment = Payment {
            total_amount,
            admin_amount: admin_amt,
            collaborator_amount: collab_amt,
            status: String::from_str(&env, "pending"),
        };
        env.storage().instance().set(&id, &payment);
        id
    }

    pub fn execute_split(env: Env, admin: Address, id: String) -> (i128, i128) {
        admin.require_auth();
        let mut p: Payment = env.storage().instance().get(&id).unwrap();
        p.status = String::from_str(&env, "completed");
        env.storage().instance().set(&id, &p);
        (p.admin_amount, p.collaborator_amount)
    }

    pub fn get_payment(env: Env, id: String) -> Option<Payment> {
        env.storage().instance().get(&id)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_create_payment() {
        let env = Env::default();
        let contract_id = env.register(PaymentSplitter, ());
        let client = PaymentSplitterClient::new(&env, &contract_id);

        let admin = Address::generate(&env);

        let payment_id =
            client.create_payment(&admin, &String::from_str(&env, "pay-001"), &1000000000);

        let payment = client
            .get_payment(&String::from_str(&env, "pay-001"))
            .unwrap();
        assert_eq!(payment.total_amount, 1000000000);
        assert_eq!(payment.admin_amount, 700000000);
        assert_eq!(payment.collaborator_amount, 300000000);
        assert_eq!(payment.status, String::from_str(&env, "pending"));
    }

    #[test]
    fn test_execute_split() {
        let env = Env::default();
        let contract_id = env.register(PaymentSplitter, ());
        let client = PaymentSplitterClient::new(&env, &contract_id);

        let admin = Address::generate(&env);

        client.create_payment(&admin, &String::from_str(&env, "pay-002"), &1000000000);

        let (admin_amt, collab_amt) =
            client.execute_split(&admin, &String::from_str(&env, "pay-002"));

        assert_eq!(admin_amt, 700000000);
        assert_eq!(collab_amt, 300000000);

        let payment = client
            .get_payment(&String::from_str(&env, "pay-002"))
            .unwrap();
        assert_eq!(payment.status, String::from_str(&env, "completed"));
    }

    #[test]
    fn test_70_30_split_precision() {
        let env = Env::default();
        let contract_id = env.register(PaymentSplitter, ());
        let client = PaymentSplitterClient::new(&env, &contract_id);

        let admin = Address::generate(&env);

        // Test with prime number to verify correct rounding
        client.create_payment(&admin, &String::from_str(&env, "pay-003"), &1234567891);

        let payment = client
            .get_payment(&String::from_str(&env, "pay-003"))
            .unwrap();
        assert_eq!(
            payment.admin_amount + payment.collaborator_amount,
            payment.total_amount
        );
    }
}
