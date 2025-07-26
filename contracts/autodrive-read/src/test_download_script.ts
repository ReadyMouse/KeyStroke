// This is a test script that downloads a file from the Autodrive API and logs the file size 
// and content to the console. 
//
// July 2025 - Author: ReadyMouse
// ============================================================================
// IMPORTS
// ============================================================================
import { createAutoDriveApi } from '@autonomys/auto-drive'
import { NetworkId } from '@autonomys/auto-utils'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// ============================================================================
// ENVIRONMENT SETUP
// ============================================================================
// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from the top-level directory
const envPath = path.resolve(__dirname, '../../../.env')
console.log('Looking for .env file at:', envPath)
dotenv.config({ path: envPath })

// ============================================================================
// API CONFIGURATION
// ============================================================================
const apiKey = process.env.AUTODRIVE_API_KEY
console.log('API Key found:', apiKey ? 'Yes' : 'No')
if (!apiKey) {
  throw new Error('AUTODRIVE_API_KEY environment variable is required')
}

const api = createAutoDriveApi({ apiKey, network: NetworkId.TAURUS }) // Initialize your API instance with API key

// ============================================================================
// FILE DOWNLOAD LOGIC
// ============================================================================
try {
  const cid = 'bafkr6ihkuzw2g5l4nmcxpqprqstkl3mzixmp2exyf2dl33a62lhwf26aaa' // random file cid
  const stream = await api.downloadFile(cid)
  let file = Buffer.alloc(0)
  for await (const chunk of stream) {
    file = Buffer.concat([file, chunk])
  }
  console.log('File downloaded successfully!')
  console.log('File size:', file.length, 'bytes')
  console.log('File content (first 200 characters):', file.toString('utf8').substring(0, 200))
} catch (error) {
  console.error('Error downloading file:', error)
}

