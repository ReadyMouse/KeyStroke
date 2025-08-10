// AutoDrive File Discovery - Finds and saves file metadata
// July 2025 - Author: ReadyMouse

import {
  getDefaultApi,
  loadEnvironment,
  validateEnvironment
} from './utils/api-setup'

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
  uploadStatus?: string
  owners?: any[]
  discoveredAt: number
  type?: string
  tested: boolean
  isDownloadable: boolean
}

// ==========================================================================
// UTILITIES
// ==========================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface ProgressState {
  scope: string
  offset: number
  totalCount: number
  seenCids: string[]
}

async function loadProgressState(): Promise<ProgressState | null> {
  const fs = await import('fs/promises')
  const path = await import('path')
  const statePath = path.join(process.cwd(), 'autodrive_discovery_state.json')
  
  try {
    await fs.access(statePath)
    const content = await fs.readFile(statePath, 'utf8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

async function saveProgressState(state: ProgressState): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')
  const statePath = path.join(process.cwd(), 'autodrive_discovery_state.json')
  
  await fs.writeFile(statePath, JSON.stringify(state, null, 2))
  logger.info('💾 Saved discovery progress state')
}

// ============================================================================
// DISCOVERY FUNCTIONS
// ============================================================================

/**
 * Saves a discovered file to the database
 */
async function saveDiscoveredFile(file: any): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')
  // Save to the discovered files database
  const csvPath = path.join(process.cwd(), 'autodrive_records.csv')
  
  const record: DiscoveredFile = {
    cid: file.headCid,
    name: file.name,
    size: file.size,
    mimeType: file.mimeType,
    uploadStatus: file.uploadStatus,
    owners: file.owners,
    discoveredAt: Date.now(),
    type: 'type' in file ? file.type : 'unknown',
    tested: false,
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
  const csvRow = `"${record.cid}","${record.name || ''}","${record.size || ''}","${record.mimeType || ''}","${record.uploadStatus || ''}","${record.type || ''}","${record.discoveredAt}","${record.tested}","${record.isDownloadable}"`
  
  if (!fileExists) {
    // Create new file with header
    const csvHeader = 'cid,name,size,mimeType,uploadStatus,type,discoveredAt,tested,isDownloadable\n'
    await fs.writeFile(csvPath, csvHeader + csvRow + '\n')
    logger.info(`💾 Created database and saved: ${record.name || 'Unnamed'}`)
  } else {
    // Append to existing file
    await fs.appendFile(csvPath, csvRow + '\n')
    logger.info(`💾 Saved to database: ${record.name || 'Unnamed'}`)
  }
}

/**
 * Gets database statistics
 */
async function getDatabaseStats(): Promise<{ total: number }> {
  const fs = await import('fs/promises')
  const path = await import('path')
  const csvPath = path.join(process.cwd(), 'autodrive_records.csv')
  
  try {
    await fs.access(csvPath)
    const content = await fs.readFile(csvPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('cid,'))
    return { total: lines.length }
  } catch {
    return { total: 0 }
  }
}

// ============================================================================
// MAIN CRAWLER FUNCTION
// ============================================================================

/**
 * Migrates existing CSV data to include new fields if they're missing
 */
async function migrateExistingData(): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')
  const oldCsvPath = path.join(process.cwd(), 'autodrive_discovered.csv')
  const newCsvPath = path.join(process.cwd(), 'autodrive_records.csv')
  
  try {
    // Check if old file exists
    await fs.access(oldCsvPath)
    const content = await fs.readFile(oldCsvPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) return
    
    logger.info('🔄 Creating new records file from existing data...')
    
    // Create new header
    const newHeader = 'cid,name,size,mimeType,uploadStatus,type,discoveredAt,tested,isDownloadable'
    
    // Process all data lines
    const newLines = [newHeader]
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      
      // Add new fields to existing data
      // First ensure the line ends with a quote for the timestamp
      const fixedLine = line.trim().endsWith('"') ? line : `${line}"`
      const newLine = `${fixedLine},"false","false"`
      newLines.push(newLine)
    }
    
    // Write new file
    await fs.writeFile(newCsvPath, newLines.join('\n') + '\n')
    logger.info(`✅ Created ${newCsvPath} with ${newLines.length - 1} records`)
    logger.info('ℹ️  Original data preserved in autodrive_discovered.csv')
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Old file doesn't exist, start fresh
      logger.info('📊 Starting fresh with new records file')
      return
    }
    logger.warn('⚠️ Migration failed:', error)
  }
}

async function discoverFiles() {
  logSection('🔍 AUTODRIVE FILE DISCOVERY')
  
  // Migrate existing data if needed
  await migrateExistingData()
  
  try {
    // Initialize API
    loadEnvironment()
    validateEnvironment()
    const api = getDefaultApi()
    
    // Get current database stats
    const stats = await getDatabaseStats()
    logger.info(`📊 Current database: ${stats.total} files discovered`)
    
    // Use getRoots endpoint with pagination to get all files
    const PAGE_SIZE = 100
    logger.info(`Getting all files with pagination (${PAGE_SIZE} per page)...`)
    
    // Try different scopes
    const scopes = ['public', 'private', 'all']
    
    // Load previous state if exists
    const previousState = await loadProgressState()
    const seenCids = new Set<string>(previousState?.seenCids || [])
    let totalDiscovered = 0
    
    // Start from where we left off
    let startScopeIndex = 0
    if (previousState) {
      startScopeIndex = scopes.indexOf(previousState.scope)
      if (startScopeIndex === -1) startScopeIndex = 0
      logger.info(`📋 Resuming from scope: ${scopes[startScopeIndex]} at offset ${previousState.offset}`)
    }
    
    // Try each scope
    for (let i = startScopeIndex; i < scopes.length; i++) {
      const scope = scopes[i]
      logger.info(`\nTrying scope: ${scope}`)
      let offset = scope === previousState?.scope ? previousState.offset : 0
      let hasMore = true
      let totalCount = previousState?.totalCount || 0
      
      while (hasMore) {
        try {
          const response = await api.sendAPIRequest(
            `/objects/roots?scope=${scope}&limit=${PAGE_SIZE}&offset=${offset}`,
            { method: 'GET' }
          )
          
          if (response.ok) {
            const data = await response.json()
            if (data.rows && Array.isArray(data.rows)) {
              // Process and save new files
              let newFiles = 0
              for (const file of data.rows) {
                if (file.headCid && !seenCids.has(file.headCid)) {
                  seenCids.add(file.headCid)
                  // Save the file immediately when discovered
                  try {
                    await saveDiscoveredFile(file)
                    newFiles++
                    totalDiscovered++
                  } catch (error) {
                    logger.warn(`Failed to save discovered file ${file.headCid}:`, error)
                  }
                }
              }
              
              logger.info(`Found and saved ${newFiles} new files on page ${Math.floor(offset/PAGE_SIZE) + 1} (offset ${offset})`)
              
              // Save progress state
              totalCount = data.totalCount || totalCount
              await saveProgressState({
                scope,
                offset,
                totalCount,
                seenCids: Array.from(seenCids)
              })
              
              // Check if we have more pages
              if (data.totalCount && offset + PAGE_SIZE < data.totalCount) {
                offset += PAGE_SIZE
                logger.info(`Progress: ${offset}/${data.totalCount} files`)
              } else {
                hasMore = false
                logger.info(`Completed scope ${scope}: ${data.totalCount} total files`)
              }
            } else {
              hasMore = false
            }
          } else {
            logger.warn(`Failed to get page for scope ${scope}:`, await response.text())
            hasMore = false
          }
        } catch (error) {
          logger.warn(`Error getting page for scope ${scope}:`, error)
          // Save state before exiting on error
          await saveProgressState({
            scope,
            offset,
            totalCount,
            seenCids: Array.from(seenCids)
          })
          throw error
        }
        
        // Add delay between pages
        await sleep(1000)
      }
    }
    
    // Clear progress state file on completion
    const fs = await import('fs/promises')
    const path = await import('path')
    const statePath = path.join(process.cwd(), 'autodrive_discovery_state.json')
    try {
      await fs.unlink(statePath)
    } catch {
      // Ignore if file doesn't exist
    }
    
    // Final stats
    const finalStats = await getDatabaseStats()
    logger.info(`\n📊 Final database stats:`)
    logger.info(`   Total files discovered: ${finalStats.total}`)
    logger.info(`   New files this run: ${totalDiscovered}`)
    
    logger.success('✅ Discovery completed!')
    
  } catch (error) {
    logger.error('❌ Discovery failed:', error)
    throw error
  }
}

// ============================================================================
// RUN THE SCRIPT
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  discoverFiles().catch(console.error)
}