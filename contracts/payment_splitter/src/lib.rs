#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, String};

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
    pub fn create_payment(env: Env, id: String, total_amount: i128) -> String {
        let admin = (total_amount * 70) / 100;
        let collab = (total_amount * 30) / 100;
        let payment = Payment {
            total_amount,
            admin_amount: admin,
            collaborator_amount: collab,
            status: String::from_str(&env, "pending"),
        };
        env.storage().instance().set(&id, &payment);
        id
    }
    pub fn execute_split(env: Env, id: String) -> (i128, i128) {
        let mut p: Payment = env.storage().instance().get(&id).unwrap();
        p.status = String::from_str(&env, "completed");
        env.storage().instance().set(&id, &p);
        (p.admin_amount, p.collaborator_amount)
    }
    pub fn get_payment(env: Env, id: String) -> Option<Payment> {
        env.storage().instance().get(&id)
    }
}
