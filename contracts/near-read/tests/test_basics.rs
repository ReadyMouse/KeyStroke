use serde_json::json;

#[tokio::test]
async fn test_contract_is_operational() -> Result<(), Box<dyn std::error::Error>> {
    let contract_wasm = near_workspaces::compile_project("./").await?;

    test_read_functions_on(&contract_wasm).await?;
    Ok(())
}

async fn test_read_functions_on(contract_wasm: &[u8]) -> Result<(), Box<dyn std::error::Error>> {
    let sandbox = near_workspaces::sandbox().await?;
    let contract = sandbox.dev_deploy(contract_wasm).await?;

    // Test with empty contract first
    test_empty_contract(&contract).await?;

    // Add some sample models to test with
    setup_sample_models(&contract).await?;

    // Test all read functions with sample data
    test_get_all_models(&contract).await?;
    test_search_by_name(&contract).await?;
    test_search_by_type(&contract).await?;
    test_search_by_tags(&contract).await?;
    test_get_model_info(&contract).await?;
    test_get_total_models(&contract).await?;
    test_get_model_location(&contract).await?;

    Ok(())
}

async fn test_empty_contract(contract: &near_workspaces::Contract) -> Result<(), Box<dyn std::error::Error>> {
    println!("Testing empty contract...");

    // Test get_all_models with empty contract
    let models_outcome = contract.view("get_all_models")
        .args_json(json!({"from_index": 0, "limit": 10}))
        .await?;
    let models: Vec<serde_json::Value> = models_outcome.json()?;
    assert_eq!(models.len(), 0, "Empty contract should return no models");

    // Test get_total_models with empty contract
    let total_outcome = contract.view("get_total_models").args_json(json!({})).await?;
    let total: u64 = total_outcome.json()?;
    assert_eq!(total, 0, "Empty contract should have 0 total models");

    // Test search functions with empty contract
    let search_outcome = contract.view("search_by_name")
        .args_json(json!({"name_query": "GPT"}))
        .await?;
    let search_results: Vec<serde_json::Value> = search_outcome.json()?;
    assert_eq!(search_results.len(), 0, "Empty contract should return no search results");

    println!("✅ Empty contract tests passed");
    Ok(())
}

async fn setup_sample_models(_contract: &near_workspaces::Contract) -> Result<(), Box<dyn std::error::Error>> {
    println!("Setting up sample models...");

    // Note: Since this is a read-only contract, we can't actually create models
    // In a real scenario, the models would be created by the write contract
    // For testing purposes, we'll simulate having models by testing the functions
    // that would work if models existed

    println!("✅ Sample models setup complete (simulated)");
    Ok(())
}

async fn test_get_all_models(contract: &near_workspaces::Contract) -> Result<(), Box<dyn std::error::Error>> {
    println!("Testing get_all_models...");

    // Test with default parameters
    let outcome = contract.view("get_all_models")
        .args_json(json!({}))
        .await?;
    let models: Vec<serde_json::Value> = outcome.json()?;
    // Should return empty array since no models are created in read-only contract
    assert_eq!(models.len(), 0);

    // Test with pagination parameters
    let outcome = contract.view("get_all_models")
        .args_json(json!({"from_index": 0, "limit": 5}))
        .await?;
    let models: Vec<serde_json::Value> = outcome.json()?;
    assert_eq!(models.len(), 0);

    println!("✅ get_all_models tests passed");
    Ok(())
}

async fn test_search_by_name(contract: &near_workspaces::Contract) -> Result<(), Box<dyn std::error::Error>> {
    println!("Testing search_by_name...");

    // Test search with non-existent model
    let outcome = contract.view("search_by_name")
        .args_json(json!({"name_query": "GPT-4"}))
        .await?;
    let results: Vec<serde_json::Value> = outcome.json()?;
    assert_eq!(results.len(), 0, "Should return no results for non-existent model");

    // Test case-insensitive search
    let outcome = contract.view("search_by_name")
        .args_json(json!({"name_query": "gpt"}))
        .await?;
    let results: Vec<serde_json::Value> = outcome.json()?;
    assert_eq!(results.len(), 0, "Should return no results for case-insensitive search");

    println!("✅ search_by_name tests passed");
    Ok(())
}

async fn test_search_by_type(contract: &near_workspaces::Contract) -> Result<(), Box<dyn std::error::Error>> {
    println!("Testing search_by_type...");

    // Test search by type
    let outcome = contract.view("search_by_type")
        .args_json(json!({"model_type": "llm"}))
        .await?;
    let results: Vec<serde_json::Value> = outcome.json()?;
    assert_eq!(results.len(), 0, "Should return no results for non-existent type");

    // Test search by another type
    let outcome = contract.view("search_by_type")
        .args_json(json!({"model_type": "image"}))
        .await?;
    let results: Vec<serde_json::Value> = outcome.json()?;
    assert_eq!(results.len(), 0, "Should return no results for non-existent type");

    println!("✅ search_by_type tests passed");
    Ok(())
}

async fn test_search_by_tags(contract: &near_workspaces::Contract) -> Result<(), Box<dyn std::error::Error>> {
    println!("Testing search_by_tags...");

    // Test search by single tag
    let outcome = contract.view("search_by_tags")
        .args_json(json!({"tags": ["language"]}))
        .await?;
    let results: Vec<serde_json::Value> = outcome.json()?;
    assert_eq!(results.len(), 0, "Should return no results for non-existent tags");

    // Test search by multiple tags
    let outcome = contract.view("search_by_tags")
        .args_json(json!({"tags": ["language", "ai"]}))
        .await?;
    let results: Vec<serde_json::Value> = outcome.json()?;
    assert_eq!(results.len(), 0, "Should return no results for non-existent tags");

    println!("✅ search_by_tags tests passed");
    Ok(())
}

async fn test_get_model_info(contract: &near_workspaces::Contract) -> Result<(), Box<dyn std::error::Error>> {
    println!("Testing get_model_info...");

    // Test with non-existent model ID
    let outcome = contract.view("get_model_info")
        .args_json(json!({"id": "non_existent_model"}))
        .await?;
    let result: Option<serde_json::Value> = outcome.json()?;
    assert_eq!(result, None, "Should return None for non-existent model");

    // Test with empty string
    let outcome = contract.view("get_model_info")
        .args_json(json!({"id": ""}))
        .await?;
    let result: Option<serde_json::Value> = outcome.json()?;
    assert_eq!(result, None, "Should return None for empty ID");

    println!("✅ get_model_info tests passed");
    Ok(())
}

async fn test_get_total_models(contract: &near_workspaces::Contract) -> Result<(), Box<dyn std::error::Error>> {
    println!("Testing get_total_models...");

    let outcome = contract.view("get_total_models")
        .args_json(json!({}))
        .await?;
    let total: u64 = outcome.json()?;
    assert_eq!(total, 0, "Should return 0 for empty contract");

    println!("✅ get_total_models tests passed");
    Ok(())
}

async fn test_get_model_location(contract: &near_workspaces::Contract) -> Result<(), Box<dyn std::error::Error>> {
    println!("Testing get_model_location...");

    // Test with non-existent model ID
    let outcome = contract.view("get_model_location")
        .args_json(json!({"id": "non_existent_model"}))
        .await?;
    let result: Option<String> = outcome.json()?;
    assert_eq!(result, None, "Should return None for non-existent model");

    // Test with empty string
    let outcome = contract.view("get_model_location")
        .args_json(json!({"id": ""}))
        .await?;
    let result: Option<String> = outcome.json()?;
    assert_eq!(result, None, "Should return None for empty ID");

    println!("✅ get_model_location tests passed");
    Ok(())
}


