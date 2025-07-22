// Find all our documentation at https://docs.near.org
use near_sdk::near;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use borsh_derive::BorshSchema;
use near_sdk::serde::{Deserialize, Serialize};
use schemars::JsonSchema;

// Define the contract structure
#[near(contract_state)]
pub struct Contract {
    pub models: Vec<Model>, // Store models in a vector
    pub total_models: u64,
}

// Define the model structure
#[derive(Clone, BorshSerialize, BorshDeserialize, BorshSchema, Serialize, Deserialize, JsonSchema)]
#[serde(crate = "near_sdk::serde")]
pub struct Model {
    pub id: String,
    pub name: String,
    pub description: String,
    pub model_type: String, // "llm", "image", "audio", etc.
    pub version: String,
    pub owner: String, // Store as String for BorshSchema compatibility
    pub autonomys_location: String, // Autonomys storage location
    pub tags: Vec<String>,
    pub created_at: u64,
    pub is_active: bool,
}

// Define the default, which automatically initializes the contract
impl Default for Contract {
    fn default() -> Self {
        Self {
            models: Vec::new(),
            total_models: 0,
        }
    }
}

// Implement the contract structure - READ ONLY FUNCTIONS
#[near]
impl Contract {
    // Get all models with pagination
    pub fn get_all_models(&self, from_index: Option<u64>, limit: Option<u64>) -> Vec<Model> {
        let from_index = from_index.unwrap_or(0);
        let limit = limit.unwrap_or(50);
        
        self.models
            .iter()
            .skip(from_index as usize)
            .take(limit as usize)
            .cloned()
            .collect()
    }

    // Search models by name (case-insensitive partial match)
    pub fn search_by_name(&self, name_query: String) -> Vec<Model> {
        let query = name_query.to_lowercase();
        self.models
            .iter()
            .filter(|model| model.name.to_lowercase().contains(&query))
            .cloned()
            .collect()
    }

    // Search models by type
    pub fn search_by_type(&self, model_type: String) -> Vec<Model> {
        self.models
            .iter()
            .filter(|model| model.model_type == model_type)
            .cloned()
            .collect()
    }

    // Search models by tags (models must have ALL specified tags)
    pub fn search_by_tags(&self, tags: Vec<String>) -> Vec<Model> {
        self.models
            .iter()
            .filter(|model| {
                // Check if model has all the specified tags
                tags.iter().all(|tag| {
                    model.tags.iter().any(|model_tag| 
                        model_tag.to_lowercase() == tag.to_lowercase()
                    )
                })
            })
            .cloned()
            .collect()
    }

    // Get model information by ID
    pub fn get_model_info(&self, id: String) -> Option<(String, String, String, String, String, String, Vec<String>, u64, bool)> {
        for model in &self.models {
            if model.id == id {
                return Some((
                    model.id.clone(),
                    model.name.clone(),
                    model.description.clone(),
                    model.model_type.clone(),
                    model.version.clone(),
                    model.autonomys_location.clone(),
                    model.tags.clone(),
                    model.created_at,
                    model.is_active,
                ));
            }
        }
        None
    }

    // Get total count of models
    pub fn get_total_models(&self) -> u64 {
        self.total_models
    }

    // Get Autonomys location for model download
    pub fn get_model_location(&self, id: String) -> Option<String> {
        for model in &self.models {
            if model.id == id {
                return Some(model.autonomys_location.clone());
            }
        }
        None
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 */
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_all_models() {
        let contract = Contract::default();
        // Test with empty contract
        let models = contract.get_all_models(None, None);
        assert_eq!(models.len(), 0);
        
        // Test with pagination
        let models = contract.get_all_models(Some(0), Some(10));
        assert_eq!(models.len(), 0);
    }

    #[test]
    fn test_search_by_name() {
        let contract = Contract::default();
        // Test with empty contract
        let results = contract.search_by_name("GPT".to_string());
        assert_eq!(results.len(), 0);
    }

    #[test]
    fn test_search_by_type() {
        let contract = Contract::default();
        // Test with empty contract
        let results = contract.search_by_type("llm".to_string());
        assert_eq!(results.len(), 0);
    }

    #[test]
    fn test_search_by_tags() {
        let contract = Contract::default();
        // Test with empty contract
        let results = contract.search_by_tags(vec!["language".to_string()]);
        assert_eq!(results.len(), 0);
    }

    #[test]
    fn test_get_model_info() {
        let contract = Contract::default();
        // Test with non-existent model
        let result = contract.get_model_info("non_existent".to_string());
        assert_eq!(result, None);
    }

    #[test]
    fn test_get_total_models() {
        let contract = Contract::default();
        assert_eq!(contract.get_total_models(), 0);
    }

    #[test]
    fn test_get_model_location() {
        let contract = Contract::default();
        // Test with non-existent model
        let result = contract.get_model_location("non_existent".to_string());
        assert_eq!(result, None);
    }
}
