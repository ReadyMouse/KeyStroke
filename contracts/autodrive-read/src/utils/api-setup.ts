// ============================================================================
// API SETUP UTILITIES
// ============================================================================
// Handles AutoDrive API configuration and initialization
// July 2025 - Author: ReadyMouse

import { createAutoDriveApi } from '@autonomys/auto-drive'
import { NetworkId } from '@autonomys/auto-utils'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

/**
 * Loads environment variables from the project root
 * @param relativePath - Optional relative path to .env file
 * @returns The path where the .env file was found
 */
export function loadEnvironment(relativePath: string = '../../../../.env'): string {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const envPath = path.resolve(__dirname, relativePath)
  
  console.log('🔧 Loading environment from:', envPath)
  dotenv.config({ path: envPath })
  
  return envPath
}

/**
 * Validates that required environment variables are present
 * @param requiredVars - Array of required environment variable names
 * @throws Error if any required variable is missing
 */
export function validateEnvironment(requiredVars: string[] = ['AUTODRIVE_API_KEY']): void {
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  console.log('✅ Environment validation passed')
}

// ============================================================================
// API INITIALIZATION
// ============================================================================

/**
 * Creates and configures an AutoDrive API instance
 * @param options - Configuration options
 * @returns Configured AutoDrive API instance
 */
export function createApiInstance(options: {
  apiKey?: string
  network?: NetworkId
  loadEnv?: boolean
} = {}) {
  const {
    apiKey = process.env.AUTODRIVE_API_KEY,
    network = NetworkId.TAURUS,
    loadEnv = true
  } = options

  if (loadEnv) {
    loadEnvironment()
  }

  if (!apiKey) {
    throw new Error('AUTODRIVE_API_KEY is required')
  }

  console.log('🔑 API Key found:', apiKey ? 'Yes' : 'No')
  console.log('🌐 Network:', network)

  return createAutoDriveApi({ apiKey, network: network as any })
}

/**
 * Creates a pre-configured API instance with default settings
 * @returns Configured AutoDrive API instance
 */
export function getDefaultApi() {
  return createApiInstance()
}
