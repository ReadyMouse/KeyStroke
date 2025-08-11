// ============================================================================
// FILE OPERATION UTILITIES
// ============================================================================
// Handles file download, processing, and manipulation
// July 2025 - Author: ReadyMouse

import { AutoDriveApi } from '@autonomys/auto-drive'

// ============================================================================
// FILE DOWNLOAD UTILITIES
// ============================================================================

/**
 * Downloads a file from AutoDrive and returns it as a Buffer
 * @param api - AutoDrive API instance
 * @param cid - Content ID of the file to download
 * @returns Promise<Buffer> - The downloaded file as a buffer
 */
export async function downloadFileAsBuffer(api: AutoDriveApi, cid: string): Promise<Buffer> {
  try {
    console.log(`📥 Downloading file with CID: ${cid}`)
    const stream = await api.downloadFile(cid)
    
    let fileBuffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      fileBuffer = Buffer.concat([fileBuffer, chunk])
    }
    
    console.log(`✅ File downloaded successfully! Size: ${fileBuffer.length} bytes`)
    return fileBuffer
  } catch (error) {
    console.error(`❌ Error downloading file with CID ${cid}:`, error)
    throw error
  }
}

/**
 * Downloads a file and returns it as a string
 * @param api - AutoDrive API instance
 * @param cid - Content ID of the file to download
 * @param encoding - Text encoding (default: 'utf8')
 * @returns Promise<string> - The downloaded file as a string
 */
export async function downloadFileAsString(
  api: AutoDriveApi, 
  cid: string, 
  encoding: BufferEncoding = 'utf8'
): Promise<string> {
  const buffer = await downloadFileAsBuffer(api, cid)
  return buffer.toString(encoding)
}

/**
 * Downloads a file and saves it to the local filesystem
 * @param api - AutoDrive API instance
 * @param cid - Content ID of the file to download
 * @param outputPath - Path where to save the file
 * @returns Promise<void>
 */
export async function downloadFileToPath(
  api: AutoDriveApi, 
  cid: string, 
  outputPath: string
): Promise<void> {
  const fs = await import('fs')
  const { pipeline } = await import('stream/promises')
  
  try {
    console.log(`📥 Downloading file with CID: ${cid}`)
    
    // Check if file is encrypted first
    const statusResponse = await api.sendDownloadRequest(
      `/downloads/${cid}/status`,
      { method: 'GET' }
    )

    if (!statusResponse.ok) {
      const error = await statusResponse.text()
      if (error.includes('encrypted') || error.includes('password')) {
        throw new Error('File is encrypted and requires a password')
      }
      throw new Error(`Failed to check file status: ${statusResponse.statusText}`)
    }

    // Download the file directly
    const response = await api.sendDownloadRequest(
      `/downloads/${cid}?ignoreEncoding=true`,
      {
        method: 'GET',
        headers: new Headers({
          'Accept': 'application/octet-stream'
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }

    // Get the binary data as a blob
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    let buffer = Buffer.from(arrayBuffer)
    
    // Check if the data is zlib compressed (starts with 78 da)
    if (buffer[0] === 0x78 && buffer[1] === 0xda) {
      console.log('File is zlib compressed, decompressing...')
      const zlib = await import('zlib')
      const { promisify } = await import('util')
      const inflate = promisify(zlib.inflate)
      buffer = await inflate(buffer)
    }
    
    // Write the decompressed data to file
    await fs.promises.writeFile(outputPath, buffer)
    
    console.log(`💾 File saved to: ${outputPath}`)
  } catch (error) {
    console.error(`❌ Error saving file to ${outputPath}:`, error)
    throw error
  }
}

// ============================================================================
// FILE ANALYSIS UTILITIES
// ============================================================================

/**
 * Analyzes a file buffer and returns metadata
 * @param buffer - File buffer to analyze
 * @returns Object with file metadata
 */
export function analyzeFile(buffer: Buffer) {
  return {
    size: buffer.length,
    sizeKB: Math.round(buffer.length / 1024 * 100) / 100,
    sizeMB: Math.round(buffer.length / (1024 * 1024) * 100) / 100,
    isText: isTextFile(buffer),
    preview: getFilePreview(buffer)
  }
}

/**
 * Checks if a buffer contains text content
 * @param buffer - Buffer to check
 * @returns boolean - True if the buffer appears to be text
 */
export function isTextFile(buffer: Buffer): boolean {
  // Simple heuristic: check if buffer contains null bytes
  return !buffer.includes(0)
}

/**
 * Gets a preview of file content
 * @param buffer - File buffer
 * @param maxLength - Maximum preview length (default: 200)
 * @returns string - File preview
 */
export function getFilePreview(buffer: Buffer, maxLength: number = 200): string {
  try {
    const text = buffer.toString('utf8')
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...'
      : text
  } catch {
    return '[Binary file - preview not available]'
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Downloads multiple files in parallel
 * @param api - AutoDrive API instance
 * @param cids - Array of Content IDs to download
 * @param concurrency - Maximum concurrent downloads (default: 3)
 * @returns Promise<Map<string, Buffer>> - Map of CID to file buffer
 */
export async function downloadMultipleFiles(
  api: AutoDriveApi,
  cids: string[],
  concurrency: number = 3
): Promise<Map<string, Buffer>> {
  const results = new Map<string, Buffer>()
  
  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < cids.length; i += concurrency) {
    const batch = cids.slice(i, i + concurrency)
    const promises = batch.map(async (cid) => {
      try {
        const buffer = await downloadFileAsBuffer(api, cid)
        return { cid, buffer }
      } catch (error) {
        console.error(`❌ Failed to download ${cid}:`, error)
        return { cid, buffer: null }
      }
    })
    
    const batchResults = await Promise.all(promises)
    batchResults.forEach(({ cid, buffer }) => {
      if (buffer) {
        results.set(cid, buffer)
      }
    })
  }
  
  console.log(`✅ Downloaded ${results.size}/${cids.length} files successfully`)
  return results
}
