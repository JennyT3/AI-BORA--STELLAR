#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone)]
pub struct Recipient {
    pub address: Address,
    pub percentage: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct Payment {
    pub id: String,
    pub total_amount: i128,
    pub admin_share: u32,
    pub collaborator_share: u32,
    pub status: String,
}

#[contract]
pub struct PaymentSplitter;

#[contractimpl]
impl PaymentSplitter {
    pub fn create_payment(
        env: Env,
        id: String,
        total_amount: i128,
        admin_percent: u32,
        collaborator_percent: u32,
    ) -> String {
        let payment = Payment {
            id: id.clone(),
            total_amount,
            admin_share: admin_percent,
            collaborator_share: collaborator_percent,
            status: String::from_str(&env, "pending"),
        };

        env.storage().instance().set(&id, &payment);
        id
    }

    pub fn execute_split(env: Env, id: String) -> (i128, i128) {
        let payment: Payment = env.storage().instance().get(&id).unwrap();

        let admin_amount = (payment.total_amount * payment.admin_share as i128) / 100;
        let collab_amount = (payment.total_amount * payment.collaborator_share as i128) / 100;

        let mut updated = payment;
        updated.status = String::from_str(&env, "completed");
        env.storage().instance().set(&id, &updated);

        (admin_amount, collab_amount)
    }

    pub fn get_payment(env: Env, id: String) -> Option<Payment> {
        env.storage().instance().get(&id)
    }
}
