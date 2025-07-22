use near_sdk::{log, env};
use crate::{Contract, Model};

impl Contract {
    pub(crate) fn internal_create_model(
        &mut self,
        id: String,
        name: String,
        description: String,
        model_type: String,
        autonomys_location: String,
        tags: Vec<String>,
    ) {
        log!("Creating new AI model: {}", name);
        // Check if model with this ID already exists
        for model in &self.models {
            if model.id == id {
                panic!("Model with ID {} already exists", id);
            }
        }
        let model = Model {
            id: id.clone(),
            name: name.clone(),
            description,
            model_type,
            version: "1.0.0".to_string(),
            owner: env::predecessor_account_id().to_string(), // Store as String
            autonomys_location,
            tags,
            created_at: env::block_timestamp(),
            is_active: true,
        };
        // Store the model
        self.models.push(model);
        self.total_models += 1;
    }
} 