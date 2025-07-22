use near_workspaces::types::{NearToken, Gas};
use serde_json::json;

const FIVE_NEAR: NearToken = NearToken::from_near(5);

#[tokio::test]
async fn test_contract_is_operational() -> Result<(), Box<dyn std::error::Error>> {
    let sandbox = near_workspaces::sandbox().await?;
    let contract_wasm = near_workspaces::compile_project(env!("CARGO_MANIFEST_DIR")).await?;

    let root = sandbox.root_account()?;

    let user_account = root.create_subaccount("user").initial_balance(FIVE_NEAR).transact().await?.unwrap();
    let contract_account = root.create_subaccount("contract").initial_balance(FIVE_NEAR).transact().await?.unwrap();

    let contract = contract_account.deploy(&contract_wasm).await?.unwrap();

    // Test creating a model
    let outcome = user_account
        .call(contract.id(), "create_model")
        .args_json(json!({
            "id": "test_model_001",
            "name": "Test GPT Model",
            "description": "A test language model",
            "model_type": "llm",
            "autonomys_location": "autonomys://test_model_001_location",
            "tags": ["test", "language", "ai"]
        }))
        .gas(Gas::from_gas(300_000_000_000_000)) // 300 TGas
        .deposit(NearToken::from_yoctonear(1)) // 1 yoctoNEAR deposit
        .transact()
        .await?;
    
    if !outcome.is_success() {
        println!("Transaction failed: {:?}", outcome);
        panic!("Transaction failed");
    }

    // Test updating model status
    let status_outcome = user_account
        .call(contract.id(), "set_active_status")
        .args_json(json!({
            "id": "test_model_001",
            "is_active": false
        }))
        .gas(Gas::from_gas(50_000_000_000_000)) // 50 TGas
        .transact()
        .await?;
    
    if !status_outcome.is_success() {
        println!("Status update failed: {:?}", status_outcome);
        panic!("Status update failed");
    }

    // Test updating model version
    let version_outcome = user_account
        .call(contract.id(), "update_version")
        .args_json(json!({
            "id": "test_model_001",
            "new_version": "2.0.0"
        }))
        .gas(Gas::from_gas(50_000_000_000_000)) // 50 TGas
        .transact()
        .await?;
    
    if !version_outcome.is_success() {
        println!("Version update failed: {:?}", version_outcome);
        panic!("Version update failed");
    }

    // Test adding tags to model
    let tags_outcome = user_account
        .call(contract.id(), "add_tags")
        .args_json(json!({
            "id": "test_model_001",
            "new_tags": ["updated", "v2"]
        }))
        .gas(Gas::from_gas(50_000_000_000_000)) // 50 TGas
        .transact()
        .await?;
    
    if !tags_outcome.is_success() {
        println!("Tags update failed: {:?}", tags_outcome);
        panic!("Tags update failed");
    }

    println!("✅ All write operations completed successfully");
    Ok(())
}
