// This is a test script that downloads a file from the Autodrive API using utilities
// and logs the file size and content to the console. 
//
// July 2025 - Author: ReadyMouse
// ============================================================================
// IMPORTS
// ============================================================================
import {
  getDefaultApi,
  loadEnvironment,
  validateEnvironment
} from './utils/api-setup'

import {
  downloadFileAsBuffer,
  analyzeFile
} from './utils/file-operations'

import {
  logger,
  logSection,
  logExecutionTime
} from './utils/logging'

// ============================================================================
// MAIN DOWNLOAD FUNCTION
// ============================================================================

async function testDownload() {
  logSection('📥 TESTING FILE DOWNLOAD')
  
  try {
    // Initialize API
    loadEnvironment()
    validateEnvironment()
    const api = getDefaultApi()
    
    // Test with the known working CID from the original script
    const testCid = 'bafkr6ihkuzw2g5l4nmcxpqprqstkl3mzixmp2exyf2dl33a62lhwf26aaa'
    
    logger.info(`Testing download with CID: ${testCid}`)
    
    const fileBuffer = await logExecutionTime('File Download', async () => {
      return await downloadFileAsBuffer(api, testCid)
    })
    
    // Analyze the downloaded file
    const analysis = analyzeFile(fileBuffer)
    
    logger.success('✅ File downloaded successfully!')
    logger.info('File Analysis:', {
      size: `${analysis.size} bytes`,
      sizeKB: `${analysis.sizeKB} KB`,
      isText: analysis.isText,
      preview: analysis.preview
    })
    
    // Save the file locally with proper extension
    const fs = await import('fs/promises')
    const timestamp = Date.now()
    
    // Use a default extension
    const outputPath = `./test_download_${timestamp}.bin`
    
    try {
      await fs.writeFile(outputPath, fileBuffer)
      logger.success(`💾 File saved to: ${outputPath}`)
      logger.info(`📁 File type: BIN`)
    } catch (error) {
      logger.error('Failed to save file:', error)
    }
    
  } catch (error) {
    logger.error('❌ Download test failed:', error)
    throw error
  }
}

// ============================================================================
// RUN THE SCRIPT
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  testDownload().catch(console.error)
}

