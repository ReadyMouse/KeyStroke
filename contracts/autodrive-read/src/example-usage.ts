// ============================================================================
// EXAMPLE USAGE OF UTILITIES
// ============================================================================
// Demonstrates how to use the utility functions
// July 2025 - Author: ReadyMouse

import {
  getDefaultApi,
  loadEnvironment,
  validateEnvironment
} from './utils/api-setup'

import {
  downloadFileAsBuffer,
  downloadFileAsString,
  analyzeFile,
  downloadMultipleFiles
} from './utils/file-operations'

import {
  searchFiles,
  formatSearchResults,
  extractCids,
  groupByType,
  findLargestFile
} from './utils/search-utils'

import {
  isValidCID,
  validateCIDs,
  validateSearchParams
} from './utils/validation'

import {
  logger,
  logSection,
  logProgress,
  logTable,
  logExecutionTime,
  logMemoryUsage
} from './utils/logging'

// ============================================================================
// MAIN EXAMPLE FUNCTION
// ============================================================================

async function demonstrateUtilities() {
  logSection('🚀 UTILITIES DEMONSTRATION')
  
  try {
    // 1. API Setup
    logSection('🔧 API Setup')
    loadEnvironment()
    validateEnvironment()
    const api = getDefaultApi()
    
    // 2. Validation Examples
    logSection('✅ Validation Examples')
    
    const testCids = [
      'bafkr6ihkuzw2g5l4nmcxpqprqstkl3mzixmp2exyf2dl33a62lhwf26aaa',
      'invalid-cid',
      'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
    ]
    
    const cidValidation = validateCIDs(testCids)
    logger.info('CID Validation Results:', cidValidation)
    
    const searchValidation = validateSearchParams('test')
    logger.info('Search Validation:', searchValidation)
    
    // 3. Search Examples
    logSection('🔍 Search Examples')
    
    const searchResults = await logExecutionTime('File Search', async () => {
      return await searchFiles(api, 'test', {
        includeDetails: true,
        sortBy: 'size',
        sortOrder: 'desc'
      })
    })
    
    logger.info(formatSearchResults(searchResults))
    
    // 4. File Analysis
    if (searchResults.length > 0) {
      logSection('📊 File Analysis')
      
      const largestFile = findLargestFile(searchResults)
      if (largestFile) {
        logger.info('Largest file found:', largestFile)
        
        // Download and analyze the largest file
        const fileBuffer = await logExecutionTime('File Download', async () => {
          return await downloadFileAsBuffer(api, largestFile.headCid)
        })
        
        const analysis = analyzeFile(fileBuffer)
        logger.info('File Analysis:', analysis)
      }
      
      // Group files by type
      const groupedFiles = groupByType(searchResults)
      logger.info('Files grouped by type:')
      for (const [type, files] of groupedFiles) {
        logger.info(`  ${type}: ${files.length} files`)
      }
    }
    
    // 5. Download Operations
    logSection('📦 Download Operations')
    
    // Example 1: Download a single file by CID
    logger.info('Example 1: Download single file')
    if (searchResults.length > 0) {
      const singleFile = searchResults[0]
      const buffer = await logExecutionTime('Single File Download', async () => {
        return await downloadFileAsBuffer(api, singleFile.headCid)
      })
      
      const analysis = analyzeFile(buffer)
      logger.info('Single File Analysis:', {
        cid: singleFile.headCid,
        size: `${Math.round(buffer.length / 1024 * 100) / 100} KB`,
        type: analysis.isText ? 'Text' : 'Binary',
        preview: analysis.preview
      })
    }
    
    // Example 2: Download multiple files
    logger.info('\nExample 2: Download multiple files')
    const cids = extractCids(searchResults.slice(0, 3)) // Take first 3 files
    if (cids.length > 0) {
      const downloadedFiles = await logExecutionTime('Batch Download', async () => {
        return await downloadMultipleFiles(api, cids, 2) // Max 2 concurrent
      })
      
      logger.info(`Successfully downloaded ${downloadedFiles.size} files`)
      
      // Create a table of downloaded files
      const downloadTable = Array.from(downloadedFiles.entries()).map(([cid, buffer]) => ({
        CID: cid.substring(0, 20) + '...',
        Size: `${Math.round(buffer.length / 1024 * 100) / 100} KB`,
        Type: analyzeFile(buffer).isText ? 'Text' : 'Binary'
      }))
      
      logTable(downloadTable, 'Downloaded Files Summary')
      
      // Example usage of download script options:
      logger.info('\nDownload Script Usage Examples:')
      logger.info('1. Download single file:')
      logger.info('   npm run download bafkr6ihkuzw2g5l4nmcxpqprqstkl3mzixmp2exyf2dl33a62lhwf26aaa')
      logger.info('\n2. Download multiple files:')
      logger.info('   npm run download CID1 CID2 CID3')
      logger.info('\n3. Download all files (with caution):')
      logger.info('   npm run download --all')
      logger.info('\n4. Specify output directory:')
      logger.info('   npm run download CID1 --output=./my-downloads')
    }
    
    // 6. Memory Usage
    logSection('💾 System Information')
    logMemoryUsage()
    
    logger.success('🎉 Utilities demonstration completed successfully!')
    
  } catch (error) {
    logger.error('❌ Demonstration failed:', error)
    throw error
  }
}

// ============================================================================
// RUN THE EXAMPLE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateUtilities().catch(console.error)
}
