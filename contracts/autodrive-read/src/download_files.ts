// AutoDrive File Downloader - Downloads single files or batches from database
// July 2025 - Author: ReadyMouse

import { loadEnvironment, validateEnvironment, getDefaultApi } from './utils/api-setup'
import { downloadFileAsBuffer } from './utils/file-operations'
import { analyzeFile } from './utils/file-operations'
import { logger, logSection, logExecutionTime } from './utils/logging'
import fs from 'fs/promises'
import path from 'path'

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

/**
 * Reads the database and returns downloadable files
 */
async function getDownloadableFiles(): Promise<FileRecord[]> {
  const csvPath = path.join(process.cwd(), 'autodrive_database.csv')
  
  try {
    const content = await fs.readFile(csvPath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('cid,'))
    
    const downloadableFiles: FileRecord[] = []
    
    for (const line of lines) {
      const columns = line.split(',').map(col => col.replace(/"/g, ''))
      if (columns.length >= 6 && columns[5] === 'true') {
        downloadableFiles.push({
          cid: columns[0],
          name: columns[1],
          size: parseInt(columns[2]) || undefined,
          mimeType: columns[3],
          uploadStatus: columns[4],
          isDownloadable: true,
          fileType: columns[7],
          timestamp: parseInt(columns[8]) || 0
        })
      }
    }
    
    return downloadableFiles
  } catch (error) {
    logger.error('Failed to read database:', error)
    return []
  }
}

/**
 * Downloads a file and saves it locally
 */
async function downloadAndSaveFile(api: any, file: FileRecord | string, downloadsDir: string = './downloads'): Promise<void> {
  const cid = typeof file === 'string' ? file : file.cid
  const name = typeof file === 'string' ? undefined : file.name
  const mimeType = typeof file === 'string' ? undefined : file.mimeType

  try {
    logger.info(`📥 Downloading: ${name || cid}`)
    
    const buffer = await logExecutionTime('Download', async () => {
      return await downloadFileAsBuffer(api, cid)
    })

    // Analyze the downloaded file
    const analysis = analyzeFile(buffer)
    logger.info('File Analysis:', {
      size: `${analysis.size} bytes`,
      sizeKB: `${analysis.sizeKB} KB`,
      isText: analysis.isText,
      preview: analysis.preview
    })
    
    // Create downloads directory if it doesn't exist
    await fs.mkdir(downloadsDir, { recursive: true })
    
    // Generate filename
    let extension = 'bin'
    if (mimeType) {
      extension = mimeType.split('/')[1] || 'bin'
    } else if (analysis.isText) {
      extension = 'txt'
    }

    const filename = name ? 
      name.replace(/[^a-zA-Z0-9.-]/g, '_') : 
      `file_${cid.slice(-8)}.${extension}`
    
    const filePath = path.join(downloadsDir, filename)
    
    // Save file
    await fs.writeFile(filePath, buffer)
    
    logger.success(`✅ Saved: ${filename} (${buffer.length} bytes)`)
    
  } catch (error) {
    logger.error(`❌ Failed to download ${name || cid}: ${error}`)
  }
}

/**
 * Main download function that handles both single and batch downloads
 */
async function downloadFiles() {
  logSection('📥 AUTODRIVE FILE DOWNLOADER')
  
  try {
    // Parse CLI args
    const args = process.argv.slice(2)
    const getArg = (name: string) => {
      const prefix = `--${name}=`
      const arg = args.find(a => a.startsWith(prefix))
      return arg ? arg.substring(prefix.length) : undefined
    }
    const hasFlag = (name: string) => args.includes(`--${name}`)

    // Get download options
    const downloadAll = hasFlag('all')
    const cids = args.filter(arg => !arg.startsWith('--'))
    const outputDir = getArg('output') || './downloads'

    // Initialize API
    loadEnvironment()
    validateEnvironment()
    const api = getDefaultApi()

    // Handle different download modes
    if (downloadAll) {
      logger.warn('⚠️  Warning: Downloading all files from database. This could take a while...')
      const downloadableFiles = await getDownloadableFiles()
      
      if (downloadableFiles.length === 0) {
        logger.warn('No downloadable files found in database')
        return
      }
      
      logger.info(`Found ${downloadableFiles.length} downloadable files:`)
      downloadableFiles.forEach((file, index) => {
        logger.info(`  ${index + 1}. ${file.name || 'Unnamed'} (${file.cid})`)
        logger.info(`     Size: ${file.size || 'unknown'} bytes, Type: ${file.mimeType || 'unknown'}`)
      })
      
      // Download each file
      for (const file of downloadableFiles) {
        await downloadAndSaveFile(api, file, outputDir)
        await new Promise(resolve => setTimeout(resolve, 500)) // Delay between downloads
      }
      
      logger.success(`✅ Downloaded ${downloadableFiles.length} files to ${outputDir}/`)
    }
    else if (cids.length > 0) {
      logger.info(`Downloading ${cids.length} specified file(s)...`)
      for (const cid of cids) {
        await downloadAndSaveFile(api, cid, outputDir)
        if (cids.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500)) // Delay between downloads
        }
      }
      logger.success(`✅ Downloaded ${cids.length} file(s) to ${outputDir}/`)
    }
    else {
      logger.error('❌ No files specified to download')
      logger.info('Usage:')
      logger.info('  Download specific files:')
      logger.info('    npm run download CID1 CID2 CID3')
      logger.info('  Download all files from database (not recommended):')
      logger.info('    npm run download --all')
      logger.info('  Specify output directory:')
      logger.info('    npm run download CID1 --output=./my-downloads')
    }
    
  } catch (error) {
    logger.error('❌ Download failed:', error)
    throw error
  }
}

// ============================================================================
// RUN THE SCRIPT
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  downloadFiles().catch(console.error)
}
