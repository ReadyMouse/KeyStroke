// AutoDrive File Crawler - Builds a database of downloadable files
// July 2025 - Author: ReadyMouse

import {
  getDefaultApi,
  loadEnvironment,
  validateEnvironment
} from './utils/api-setup'

import {
  analyzeFile
} from './utils/file-operations'

import {
  searchFiles
} from './utils/search-utils'

import {
  logger,
  logSection,
  logProgress
} from './utils/logging'

// ============================================================================
// DATABASE INTERFACES
// ============================================================================

interface DiscoveredFile {
  cid: string
  name?: string
  size?: number
  mimeType?: string
  scope: string
  type?: string
  tested: boolean
  testedAt?: number
  isDownloadable: boolean
  downloadError?: string
  errorType?: 'encrypted' | 'server_issue' | 'not_found' | 'unknown'
  owners?: any[]
  discoveredAt: number
}

interface FileRecord {
  cid: string
  name?: string
  size?: number
  mimeType?: string
  scope: string
  type?: string
  tested: boolean
  testedAt?: number
  isDownloadable: boolean
  downloadError?: string
  errorType?: 'encrypted' | 'server_issue' | 'not_found' | 'unknown'
  owners?: any[]
  discoveredAt: number
}

interface CrawlResults {
  totalSearched: number
  totalDownloadable: number
  totalFailed: number
  files: FileRecord[]
}

// ==========================================================================
// RETRY/CONCURRENCY UTILITIES
// ==========================================================================

interface RetryOptions {
  retries: number
  baseDelayMs: number
  maxDelayMs: number
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function withJitter(ms: number): number {
  const jitter = Math.random() * (ms * 0.25)
  return Math.min(ms + jitter, ms * 2)
}

async function downloadWithRetry(api: any, cid: string, options: RetryOptions): Promise<Buffer> {
  let attempt = 0
  let delay = options.baseDelayMs
  let lastError: any
  while (attempt <= options.retries) {
    try {
      // Attempt download
      const { downloadFileAsBuffer } = await import('./utils/file-operations')
      return await downloadFileAsBuffer(api, cid)
    } catch (error) {
      lastError = error
      attempt += 1
      // On final attempt, break
      if (attempt > options.retries) break
      // Backoff with jitter
      await sleep(withJitter(delay))
      delay = Math.min(delay * 2, options.maxDelayMs)
    }
  }
  throw lastError
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
  onProgress?: (done: number, total: number) => void
): Promise<R[]> {
  const results: R[] = []
  let nextIndex = 0
  let completed = 0
  const total = items.length

  async function runOne() {
    const current = nextIndex++
    if (current >= total) return
    try {
      const res = await worker(items[current], current)
      results[current] = res
      // Add delay between requests to be nice to the API
      await sleep(500)
    } finally {
      completed += 1
      if (onProgress) onProgress(completed, total)
      await runOne()
    }
  }

  const starters = Array.from({ length: Math.min(concurrency, total) }, () => runOne())
  await Promise.all(starters)
  return results
}

// ============================================================================
// CRAWLER FUNCTIONS
// ============================================================================

/**
 * Saves a discovered file to the discovered_files database
 */
async function saveDiscoveredFile(file: any): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')
  // Save database in the current directory
  const csvPath = path.join(process.cwd(), 'autodrive_records.csv')
  
  const record: DiscoveredFile = {
    cid: file.headCid,
    name: file.name,
    size: file.size,
    mimeType: file.mimeType,
    scope: file.scope || 'unknown',
    type: file.type || 'unknown',
    owners: file.owners,
    discoveredAt: Date.now(),
    tested: false,
    testedAt: undefined,
    isDownloadable: false
  }
  
  // Check if file exists to determine if we need to write header
  let fileExists = false
  try {
    await fs.access(csvPath)
    fileExists = true
  } catch {
    // File doesn't exist, will create it
  }
  
  // Prepare CSV row for this record
  const csvRow = `"${record.cid}","${record.name || ''}","${record.size || ''}","${record.mimeType || ''}","${record.scope}","${record.type || ''}","${record.discoveredAt}","${record.tested}","${record.testedAt || ''}","${record.isDownloadable}","${record.downloadError || ''}","${record.errorType || ''}"`
  
  if (!fileExists) {
    // Create new file with header
    const csvHeader = 'cid,name,size,mimeType,scope,type,discoveredAt,tested,testedAt,isDownloadable,downloadError,errorType\n'
    await fs.writeFile(csvPath, csvHeader + csvRow + '\n')
    logger.info(`💾 Created discovered files database and saved: ${record.name || 'Unnamed'}`)
  } else {
    // Append to existing file
    await fs.appendFile(csvPath, csvRow + '\n')
    logger.info(`💾 Saved discovered file: ${record.name || 'Unnamed'}`)
  }
}

/**
 * Marks a CID as tested in the discovered files database
 */
async function markCidAsTested(cid: string): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')
  const csvPath = path.join(process.cwd(), 'autodrive_records.csv')
  
  try {
    const content = await fs.readFile(csvPath, 'utf8')
    const lines = content.split('\n')
    const updatedLines = lines.map(line => {
      if (line.includes(`"${cid}"`)) {
        // Replace the "false" tested status with "true"
        return line.replace(',"false"', ',"true"')
      }
      return line
    })
    await fs.writeFile(csvPath, updatedLines.join('\n'))
  } catch (error) {
    logger.warn(`Failed to mark CID ${cid} as tested:`, error)
  }
}

/**
 * Gets all untested CIDs from the discovered files database
 */
async function getUntestedCids(): Promise<Set<string>> {
  const fs = await import('fs/promises')
  const path = await import('path')
  const csvPath = path.join(process.cwd(), 'autodrive_records.csv')
  
  const untestedCids = new Set<string>()
  try {
    const content = await fs.readFile(csvPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const columns = line.split(',').map(col => col.replace(/"/g, ''))
      // Check if tested is false (column 8)
      if (columns[7] === 'false') {
        // Extract CID from the first column
        untestedCids.add(columns[0])
      }
    }
  } catch {
    // File doesn't exist or other error, return empty set
  }
  return untestedCids
}

/**
 * Checks if a CID has already been tested
 */
async function isCidAlreadyTested(cid: string): Promise<boolean> {
  const fs = await import('fs/promises')
  const path = await import('path')
  // Save database in the current directory
  const csvPath = path.join(process.cwd(), 'autodrive_records.csv')
  logger.info(`📁 Using database path: ${csvPath}`)
  
  try {
    await fs.access(csvPath)
    const content = await fs.readFile(csvPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const columns = line.split(',').map(col => col.replace(/"/g, ''))
      if (columns[0] === cid) {
        // Check if tested is true (column 8)
        return columns[7] === 'true'
      }
    }
    return false
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
  // Save database in the current directory
  const csvPath = path.join(process.cwd(), 'autodrive_records.csv')
  logger.info(`📁 Using database path: ${csvPath}`)
  
  // Prepare CSV row for this record
  const csvRow = `"${record.cid}","${record.name || ''}","${record.size || ''}","${record.mimeType || ''}","${record.scope}","${record.type || ''}","${record.discoveredAt}","${record.tested}","${record.testedAt || ''}","${record.isDownloadable}","${record.downloadError || ''}","${record.errorType || ''}"` 
  
  // Append to existing file
  await fs.appendFile(csvPath, csvRow + '\n')
  logger.info(`💾 Saved to database: ${record.name || 'Unnamed'}`)
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
async function testFileDownload(
  api: any,
  file: any,
  retryOptions: RetryOptions
): Promise<FileRecord | null> {
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
    scope: file.scope || 'unknown',
    type: file.type || 'unknown',
    owners: file.owners,
    discoveredAt: Date.now(),
    tested: true,
    testedAt: Date.now(),
    isDownloadable: false
  }
  
  try {
    logger.info(`Testing download: ${file.name || 'Unnamed'} (${file.headCid})`)
    const buffer = await downloadWithRetry(api, file.headCid, retryOptions)
    
    // Analyze the downloaded file
    const analysis = analyzeFile(buffer)
    record.isDownloadable = true
    record.type = analysis.isText ? 'text' : 'binary'
    
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
  
  // Save record immediately after testing and mark as tested in discovered database
  try {
    logger.info(`💾 Attempting to save record for: ${record.name || 'Unnamed'} (${record.cid})`)
    await saveRecordToDatabase(record)
    await markCidAsTested(record.cid)
    logger.info(`✅ Successfully saved record for: ${record.name || 'Unnamed'} (${record.cid})`)
  } catch (error) {
    logger.error(`❌ Failed to save record for: ${record.name || 'Unnamed'} (${record.cid})`, error)
  }
  
  return record
}



/**
 * Gets database statistics
 */
async function getDatabaseStats(): Promise<{ total: number, tested: number, downloadable: number, failed: number }> {
  const fs = await import('fs/promises')
  const path = await import('path')
  // Save database in the current directory
  const csvPath = path.join(process.cwd(), 'autodrive_records.csv')
  logger.info(`📁 Using database path: ${csvPath}`)
  
  try {
    await fs.access(csvPath)
    const content = await fs.readFile(csvPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('cid,'))
    
    const total = lines.length
    const tested = lines.filter(line => {
      const columns = line.split(',').map(col => col.replace(/"/g, ''))
      return columns[7] === 'true' // tested column
    }).length
    const downloadable = lines.filter(line => {
      const columns = line.split(',').map(col => col.replace(/"/g, ''))
      return columns[9] === 'true' // isDownloadable column
    }).length
    const failed = tested - downloadable // only count failed among tested files
    
    return { total, tested, downloadable, failed }
  } catch {
    return { total: 0, tested: 0, downloadable: 0, failed: 0 }
  }
}

// ============================================================================
// MAIN CRAWLER FUNCTION
// ============================================================================

async function testDiscoveredFiles() {
  logSection('🧪 TESTING DISCOVERED FILES')
  
  try {
    // CLI options
    const args = process.argv.slice(2)
    const getArg = (name: string, fallback?: string) => {
      const prefix = `--${name}=`
      const found = args.find(a => a.startsWith(prefix))
      return found ? found.substring(prefix.length) : fallback
    }

    // Initialize API
    loadEnvironment()
    validateEnvironment()
    const api = getDefaultApi()
    
    // Get current database stats
    const stats = await getDatabaseStats()
    logger.info(`📊 Current database: ${stats.total} total files (${stats.downloadable} downloadable out of ${stats.tested} tested)`)
    
    // Set up retry and concurrency options
    const concurrency = Math.max(1, Number(getArg('concurrency', '4')))
    const retries = Math.max(0, Number(getArg('retries', '3')))
    const baseDelayMs = Math.max(100, Number(getArg('base-delay', '1000')))
    const maxDelayMs = Math.max(baseDelayMs, Number(getArg('max-delay', '10000')))
    const retryOptions: RetryOptions = { retries, baseDelayMs, maxDelayMs }
    
    // Get all untested CIDs
    logger.info('🔍 Getting untested files from database...')
    const untestedCids = await getUntestedCids()
    logger.info(`Found ${untestedCids.size} untested files`)
    
    if (untestedCids.size === 0) {
      logger.info('No untested files found. Exiting...')
      return
    }
    
    // Convert CIDs to file objects
    const filesToTest = Array.from(untestedCids).map(cid => ({ headCid: cid }))
    
    // Process in batches to avoid memory issues
    const batchSize = 100
    const allRecords: FileRecord[] = []
    
    // Process in batches
    for (let i = 0; i < filesToTest.length; i += batchSize) {
      const batch = filesToTest.slice(i, i + batchSize)
      logger.info(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(filesToTest.length/batchSize)} (${batch.length} files)`)
      
      await runWithConcurrency(batch, concurrency, async (file) => {
        const record = await testFileDownload(api, file, retryOptions)
        if (record) allRecords.push(record)
        return record
      }, (done, total) => {
        const overallDone = i + done
        logProgress(overallDone, filesToTest.length, 'Testing files')
      })
      
      // Log intermediate stats
      const stats = await getDatabaseStats()
      logger.info(`\n📊 Progress: ${stats.total} total files (${stats.downloadable} downloadable out of ${stats.tested} tested)`)
      
      // Add delay between batches to be nice to the API
      if (i + batchSize < filesToTest.length) {
        logger.info('😴 Taking a short break between batches...')
        await sleep(2000)
      }
    }
    
    // Final stats
    const finalStats = await getDatabaseStats()
    logger.info(`\n📊 Final database stats:`)
    logger.info(`   Total files: ${finalStats.total}`)
    logger.info(`   Files tested: ${finalStats.tested}`)
    logger.info(`   Downloadable: ${finalStats.downloadable}`)
    
    logger.success('✅ Testing completed!')
    
  } catch (error) {
    logger.error('❌ Testing failed:', error)
    throw error
  }
}

// ============================================================================
// RUN THE SCRIPT
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  testDiscoveredFiles().catch(console.error)
}