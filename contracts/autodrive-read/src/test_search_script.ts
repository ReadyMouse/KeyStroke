// This is a test script that searches for files using searchByNameOrCID
// and displays the results.
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

const api = createAutoDriveApi({ apiKey, network: NetworkId.TAURUS })

// ============================================================================
// SEARCH LOGIC
// ============================================================================
async function searchFiles(searchValue: string) {
  try {
    console.log(`🔍 Searching for: "${searchValue}"`)
    const results = await api.searchByNameOrCID(searchValue)
    
    console.log(`✅ Search completed! Found ${results.length} result(s)`)
    
    if (results.length === 0) {
      console.log('📭 No files found matching your search criteria')
      return results
    }
    
    console.log('\n📋 Search Results:')
    console.log('='.repeat(80))
    
    results.forEach((file: any, index: number) => {
      console.log(`\n${index + 1}. File Summary:`)
      console.log(`   📁 Name: ${file.name || 'Unnamed'}`)
      console.log(`   🔗 Head CID: ${file.headCid}`)
      console.log(`   📊 Size: ${file.size || 'Unknown'} bytes`)
      console.log(`   📍 Type: ${file.type || 'Unknown'}`)
      console.log(`   📤 Upload Status: ${file.uploadStatus || 'Unknown'}`)
      
      if (file.mimeType) {
        console.log(`   📄 MIME Type: ${file.mimeType}`)
      }
      
      if (file.owners && file.owners.length > 0) {
        console.log(`   👥 Owners: ${file.owners.length} owner(s)`)
      }
    })
    
    return results
  } catch (error) {
    console.error('❌ Error searching files:', error)
    throw error
  }
}

// ============================================================================
// TEST SEARCHES
// ============================================================================
async function runTestSearches() {
  console.log('🚀 Starting test searches...\n')
  
  // Test 1: Search by a known CID
  const knownCID = 'bafkr6ihkuzw2g5l4nmcxpqprqstkl3mzixmp2exyf2dl33a62lhwf26aaa'
  console.log('Test 1: Searching by known CID')
  await searchFiles(knownCID)
  
  console.log('\n' + '='.repeat(80) + '\n')
  
  // Test 2: Search by partial name
  console.log('Test 2: Searching by partial name')
  await searchFiles('test')
  
  console.log('\n' + '='.repeat(80) + '\n')
  
  // Test 3: Search by file extension
  console.log('Test 3: Searching by file extension')
  await searchFiles('.json')
}

// Run the test searches
runTestSearches().catch(console.error) 