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

/**
 * Loads existing CIDs from the CSV database to prevent duplicates
 */
async function loadExistingCids(): Promise<Set<string>> {
  const fs = await import('fs/promises')
  const path = await import('path')
  const csvPath = path.join(process.cwd(), 'autodrive_records.csv')
  
  try {
    await fs.access(csvPath)
    const content = await fs.readFile(csvPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('cid,'))
    
    const existingCids = new Set<string>()
    for (const line of lines) {
      const fields = line.split(',')
      if (fields.length > 0) {
        // Remove quotes from CID field
        const cid = fields[0].replace(/"/g, '')
        if (cid) {
          existingCids.add(cid)
        }
      }
    }
    
    logger.info(`📚 Loaded ${existingCids.size} existing CIDs from database`)
    return existingCids
  } catch {
    logger.info('📚 No existing database found, starting fresh')
    return new Set<string>()
  }
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
async function saveDiscoveredFile(file: any, scope: string): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')
  // Save to the discovered files database
  const csvPath = path.join(process.cwd(), 'autodrive_records.csv')
  
  const record: DiscoveredFile = {
    cid: file.headCid,
    name: file.name,
    size: file.size,
    mimeType: file.mimeType,
    scope: scope, // Using the current scope from the discovery process
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
  const csvRow = `"${record.cid}","${record.name || ''}","${record.size || ''}","${record.mimeType || ''}","${record.scope}","${record.type || ''}","${record.discoveredAt}","${record.tested}","${record.testedAt || ''}","${record.isDownloadable}","${record.downloadError || ''}","${record.errorType || ''}"`
  
  if (!fileExists) {
    // Create new file with header
    const csvHeader = 'cid,name,size,mimeType,scope,type,discoveredAt,tested,testedAt,isDownloadable,downloadError,errorType\n'
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

/**
 * Removes duplicate entries from the CSV database
 * Keeps the first occurrence of each CID
 */
async function removeDuplicates(): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')
  const csvPath = path.join(process.cwd(), 'autodrive_records.csv')
  
  try {
    await fs.access(csvPath)
    const content = await fs.readFile(csvPath, 'utf8')
    const lines = content.split('\n')
    const header = lines[0]
    const dataLines = lines.slice(1).filter(line => line.trim())
    
    const seenCids = new Set<string>()
    const uniqueLines: string[] = []
    let duplicatesRemoved = 0
    
    for (const line of dataLines) {
      const fields = line.split(',')
      if (fields.length > 0) {
        const cid = fields[0].replace(/"/g, '')
        if (cid && !seenCids.has(cid)) {
          seenCids.add(cid)
          uniqueLines.push(line)
        } else if (cid) {
          duplicatesRemoved++
        }
      }
    }
    
    // Write back the cleaned data
    const cleanedContent = header + '\n' + uniqueLines.join('\n') + '\n'
    await fs.writeFile(csvPath, cleanedContent)
    
    logger.info(`🧹 Removed ${duplicatesRemoved} duplicate entries`)
    logger.info(`📊 Database now contains ${uniqueLines.length} unique entries`)
    
  } catch (error) {
    logger.error('Failed to remove duplicates:', error)
    throw error
  }
}

// ============================================================================
// MAIN CRAWLER FUNCTION
// ============================================================================


async function discoverFiles() {
  logSection('🔍 AUTODRIVE FILE DISCOVERY')
  
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
    const scopes = ['public', 'private']
    
    // Load existing CIDs from database and previous state
    const existingCids = await loadExistingCids()
    const previousState = await loadProgressState()
    
    // Merge existing CIDs with seen CIDs from previous run
    const seenCids = new Set<string>([...existingCids])
    if (previousState?.seenCids) {
      previousState.seenCids.forEach(cid => seenCids.add(cid))
    }
    
    logger.info(`📋 Total CIDs to skip (existing + previous): ${seenCids.size}`)
    
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
                    await saveDiscoveredFile(file, scope)
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
  const args = process.argv.slice(2)
  
  if (args.includes('--clean-duplicates')) {
    logSection('🧹 CLEANING DUPLICATES')
    removeDuplicates().catch(console.error)
  } else if (args.includes('--discover')) {
    discoverFiles().catch(console.error)
  } else {
    // Default behavior: clean duplicates first, then discover
    logSection('🚀 STARTING AUTODRIVE DISCOVERY')
    console.log('Available options:')
    console.log('  --clean-duplicates  : Remove existing duplicates from database')
    console.log('  --discover          : Run discovery (with duplicate prevention)')
    console.log('  (no args)          : Clean duplicates then run discovery')
    console.log('')
    
    // Clean duplicates first, then run discovery
    removeDuplicates()
      .then(() => discoverFiles())
      .catch(console.error)
  }
}