import { createAutoDriveApi } from '@autonomys/auto-drive'
import { NetworkId } from '@autonomys/auto-utils'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from the top-level directory
const envPath = path.resolve(__dirname, '../../../.env')
console.log('Looking for .env file at:', envPath)
dotenv.config({ path: envPath })

const apiKey = process.env.AUTODRIVE_API_KEY
console.log('API Key found:', apiKey ? 'Yes' : 'No')
if (!apiKey) {
  throw new Error('AUTODRIVE_API_KEY environment variable is required')
}

const api = createAutoDriveApi({ apiKey, network: NetworkId.TAURUS }) // Initialize your API instance with API key
 
try {
  const cid = 'bafkr6ihkuzw2g5l4nmcxpqprqstkl3mzixmp2exyf2dl33a62lhwf26aaa'
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