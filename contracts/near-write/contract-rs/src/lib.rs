// Find all our documentation at https://docs.near.org
use near_sdk::{log, near};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use borsh_derive::BorshSchema;
use near_sdk::serde::{Deserialize, Serialize};
use schemars::JsonSchema;

// Declare the models module
mod models;

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

// Implement the contract structure - WRITE ONLY FUNCTIONS
#[near]
impl Contract {
    #[payable]
    pub fn create_model(
        &mut self,
        id: String,
        name: String,
        description: String,
        model_type: String,
        autonomys_location: String,
        tags: Vec<String>,
    ) {
        self.internal_create_model(id, name, description, model_type, autonomys_location, tags);
    }

    // Update model status
    pub fn set_active_status(&mut self, id: String, is_active: bool) {
        log!("Setting model {} active status to: {}", id, is_active);
        for model in &mut self.models {
            if model.id == id {
                model.is_active = is_active;
                return;
            }
        }
    }

    // Update model version
    pub fn update_version(&mut self, id: String, new_version: String) {
        log!("Updating model {} version to: {}", id, new_version);
        for model in &mut self.models {
            if model.id == id {
                model.version = new_version;
                return;
            }
        }
    }

    // Add tags to model
    pub fn add_tags(&mut self, id: String, new_tags: Vec<String>) {
        log!("Adding tags to model {}: {:?}", id, new_tags);
        for model in &mut self.models {
            if model.id == id {
                model.tags.extend(new_tags);
                return;
            }
        }
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 */
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_model() {
        let mut contract = Contract::default();
        contract.create_model(
            "model_001".to_string(),
            "GPT-4".to_string(),
            "Advanced language model".to_string(),
            "llm".to_string(),
            "autonomys://model_001_location".to_string(),
            vec!["language".to_string(), "ai".to_string()],
        );
        
        // Verify the model was created
        assert_eq!(contract.total_models, 1);
        assert_eq!(contract.models.len(), 1);
        
        // Verify the model data directly
        let model = &contract.models[0];
        assert_eq!(model.id, "model_001");
        assert_eq!(model.name, "GPT-4");
        assert_eq!(model.description, "Advanced language model");
        assert_eq!(model.model_type, "llm");
        assert_eq!(model.version, "1.0.0");
        assert_eq!(model.autonomys_location, "autonomys://model_001_location");
        assert_eq!(model.tags, vec!["language", "ai"]);
        assert!(model.is_active);
    }

    #[test]
    fn test_create_multiple_models() {
        let mut contract = Contract::default();
        
        // Create first model
        contract.create_model(
            "model_001".to_string(),
            "GPT-4".to_string(),
            "Advanced language model".to_string(),
            "llm".to_string(),
            "autonomys://model_001_location".to_string(),
            vec!["language".to_string()],
        );
        
        // Create second model
        contract.create_model(
            "model_002".to_string(),
            "DALL-E".to_string(),
            "Image generation model".to_string(),
            "image".to_string(),
            "autonomys://model_002_location".to_string(),
            vec!["image".to_string()],
        );
        
        // Verify both models were created
        assert_eq!(contract.total_models, 2);
        assert_eq!(contract.models.len(), 2);
        
        // Verify we can access both models directly
        assert_eq!(contract.models[0].name, "GPT-4");
        assert_eq!(contract.models[1].name, "DALL-E");
    }

    #[test]
    fn test_update_model_status() {
        let mut contract = Contract::default();
        contract.create_model(
            "model_002".to_string(),
            "DALL-E".to_string(),
            "Image generation model".to_string(),
            "image".to_string(),
            "autonomys://model_002_location".to_string(),
            vec!["image".to_string()],
        );
        
        contract.set_active_status("model_002".to_string(), false);
        assert_eq!(contract.models[0].is_active, false);
        
        contract.set_active_status("model_002".to_string(), true);
        assert_eq!(contract.models[0].is_active, true);
    }

    #[test]
    fn test_add_tags() {
        let mut contract = Contract::default();
        contract.create_model(
            "model_003".to_string(),
            "Whisper".to_string(),
            "Speech recognition model".to_string(),
            "audio".to_string(),
            "autonomys://model_003_location".to_string(),
            vec!["speech".to_string()],
        );
        
        contract.add_tags("model_003".to_string(), vec!["transcription".to_string(), "openai".to_string()]);
        assert_eq!(contract.models[0].tags, vec!["speech", "transcription", "openai"]);
    }
}
