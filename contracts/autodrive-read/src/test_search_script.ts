// AutoDrive File Crawler - Builds a database of downloadable files
// July 2025 - Author: ReadyMouse

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
  searchFiles,
  formatSearchResults
} from './utils/search-utils'

import {
  logger,
  logSection
} from './utils/logging'

// ============================================================================
// DATABASE INTERFACES
// ============================================================================

interface FileRecord {
  cid: string
  name?: string
  size?: number
  mimeType?: string
  uploadStatus?: string
  owners?: any[]
  isDownloadable: boolean
  downloadError?: string
  errorType?: 'encrypted' | 'server_issue' | 'not_found' | 'unknown'
  fileType?: string
  timestamp: number
}

interface CrawlResults {
  totalSearched: number
  totalDownloadable: number
  totalFailed: number
  files: FileRecord[]
}

// ============================================================================
// CRAWLER FUNCTIONS
// ============================================================================

/**
 * Checks if a CID has already been tested
 */
async function isCidAlreadyTested(cid: string): Promise<boolean> {
  const fs = await import('fs/promises')
  const csvPath = `./autodrive_database.csv`
  
  try {
    await fs.access(csvPath)
    const content = await fs.readFile(csvPath, 'utf8')
    return content.includes(cid)
  } catch {
    // File doesn't exist, so CID hasn't been tested
    return false
  }
}

/**
 * Saves a single record to the CSV database
 */
async function saveRecordToDatabase(record: FileRecord) {
  const fs = await import('fs/promises')
  const path = await import('path')
  const csvPath = path.join(process.cwd(), 'autodrive_database.csv')
  
  // Check if file exists to determine if we need to write header
  let fileExists = false
  try {
    await fs.access(csvPath)
    fileExists = true
  } catch {
    // File doesn't exist, will create it
  }
  
  // Prepare CSV row for this record
  const csvRow = `"${record.cid}","${record.name || ''}","${record.size || ''}","${record.mimeType || ''}","${record.uploadStatus || ''}","${record.isDownloadable}","${record.downloadError || ''}","${record.errorType || ''}","${record.fileType || ''}","${record.timestamp}"`
  
      if (!fileExists) {
      // Create new file with header
      const csvHeader = 'cid,name,size,mimeType,uploadStatus,isDownloadable,downloadError,errorType,fileType,timestamp\n'
    await fs.writeFile(csvPath, csvHeader + csvRow + '\n')
    logger.info(`💾 Created database and saved: ${record.name || 'Unnamed'}`)
  } else {
    // Append to existing file
    await fs.appendFile(csvPath, csvRow + '\n')
    logger.info(`💾 Saved to database: ${record.name || 'Unnamed'}`)
  }
}

/**
 * Analyzes download error to determine the cause
 */
function analyzeDownloadError(error: any): { type: 'encrypted' | 'server_issue' | 'not_found' | 'unknown', reason: string } {
  const errorMessage = error instanceof Error ? error.message : String(error)
  
  // Check for encrypted file patterns
  if (errorMessage.includes('password') || errorMessage.includes('encrypted') || errorMessage.includes('authentication')) {
    return { type: 'encrypted', reason: 'File requires password/encryption' }
  }
  
  // Check for server issues
  if (errorMessage.includes('Internal Server Error') || errorMessage.includes('524') || errorMessage.includes('timeout') || errorMessage.includes('Cloudflare')) {
    return { type: 'server_issue', reason: 'Server timeout or overload' }
  }
  
  // Check for not found
  if (errorMessage.includes('not found') || errorMessage.includes('404') || errorMessage.includes('<none>')) {
    return { type: 'not_found', reason: 'File not found or inaccessible' }
  }
  
  return { type: 'unknown', reason: errorMessage }
}

/**
 * Tests if a file is downloadable
 */
async function testFileDownload(api: any, file: any): Promise<FileRecord | null> {
  // Check if already tested
  if (await isCidAlreadyTested(file.headCid)) {
    logger.info(`⏭️  Skipping already tested: ${file.name || 'Unnamed'} (${file.headCid})`)
    return null
  }
  
  const record: FileRecord = {
    cid: file.headCid,
    name: file.name,
    size: file.size,
    mimeType: file.mimeType,
    uploadStatus: file.uploadStatus,
    owners: file.owners,
    isDownloadable: false,
    timestamp: Date.now()
  }
  
  try {
    logger.info(`Testing download: ${file.name || 'Unnamed'} (${file.headCid})`)
    const buffer = await downloadFileAsBuffer(api, file.headCid)
    
    // Analyze the downloaded file
    const analysis = analyzeFile(buffer)
    record.isDownloadable = true
    record.fileType = analysis.isText ? 'text' : 'binary'
    
    logger.success(`✅ Downloadable: ${file.name || 'Unnamed'}`)
    
  } catch (error) {
    record.isDownloadable = false
    record.downloadError = error instanceof Error ? error.message : String(error)
    
    // Analyze the error type
    const errorAnalysis = analyzeDownloadError(error)
    const errorType = errorAnalysis.type
    const errorReason = errorAnalysis.reason
    
    // Store error type in record
    record.errorType = errorType
    
    // Log with appropriate emoji based on error type
    switch (errorType) {
      case 'encrypted':
        logger.warn(`🔒 Encrypted file: ${file.name || 'Unnamed'} - ${errorReason}`)
        break
      case 'server_issue':
        logger.warn(`⚠️  Server issue: ${file.name || 'Unnamed'} - ${errorReason}`)
        break
      case 'not_found':
        logger.warn(`❌ File not found: ${file.name || 'Unnamed'} - ${errorReason}`)
        break
      default:
        logger.warn(`❓ Unknown error: ${file.name || 'Unnamed'} - ${errorReason}`)
    }
  }
  
  // Save record immediately after testing
  await saveRecordToDatabase(record)
  
  return record
}

/**
 * Crawls for files of a specific type
 */
async function crawlFileType(api: any, searchTerm: string, maxFiles: number = 10): Promise<FileRecord[]> {
  logger.info(`🔍 Crawling for files matching: "${searchTerm}"`)
  
  const results = await searchFiles(api, searchTerm, {
    includeDetails: true
  })
  
  logger.info(`Found ${results.length} files matching "${searchTerm}"`)
  
  if (results.length === 0) {
    return []
  }
  
  // Limit the number of files to test
  const filesToTest = results.slice(0, maxFiles)
  const records: FileRecord[] = []
  
  for (const file of filesToTest) {
    const record = await testFileDownload(api, file)
    if (record) {
      records.push(record)
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  return records
}

/**
 * Gets database statistics
 */
async function getDatabaseStats(): Promise<{ total: number, downloadable: number, failed: number }> {
  const fs = await import('fs/promises')
  const csvPath = `./autodrive_database.csv`
  
  try {
    await fs.access(csvPath)
    const content = await fs.readFile(csvPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('cid,'))
    
    const total = lines.length
    const downloadable = lines.filter(line => line.includes('"true"')).length
    const failed = total - downloadable
    
    return { total, downloadable, failed }
  } catch {
    return { total: 0, downloadable: 0, failed: 0 }
  }
}

// ============================================================================
// MAIN CRAWLER FUNCTION
// ============================================================================

async function crawlAutoDrive() {
  logSection('🕷️ AUTODRIVE CRAWLER')
  
  try {
    // Initialize API
    loadEnvironment()
    validateEnvironment()
    const api = getDefaultApi()
    
    // Get current database stats
    const stats = await getDatabaseStats()
    logger.info(`📊 Current database: ${stats.total} files tested (${stats.downloadable} downloadable, ${stats.failed} failed)`)
    
    // Define search terms and limits
    const searchTerms = ['jpg', 'png', 'mp3', 'pdf', 'txt', 'doc', 'docx', 'zip', 'rar', 'tar', 'gz']
    const maxFilesPerType = 5
    
    const allRecords: FileRecord[] = []
    
    for (const searchTerm of searchTerms) {
      logger.info(`\n🔍 Searching for: ${searchTerm}`)
      const records = await crawlFileType(api, searchTerm, maxFilesPerType)
      allRecords.push(...records)
      
      // Small delay between search terms
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Final stats
    const finalStats = await getDatabaseStats()
    logger.info(`\n📊 Final database stats:`)
    logger.info(`   Total files tested: ${finalStats.total}`)
    logger.info(`   Downloadable: ${finalStats.downloadable}`)
    logger.info(`   Failed: ${finalStats.failed}`)
    
    logger.success('✅ Crawling completed!')
    
  } catch (error) {
    logger.error('❌ Crawling failed:', error)
    throw error
  }
}

// ============================================================================
// RUN THE SCRIPT
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  crawlAutoDrive().catch(console.error)
} 