// ============================================================================
// SEARCH UTILITIES
// ============================================================================
// Handles file searching, filtering, and result processing
// July 2025 - Author: ReadyMouse

import { AutoDriveApi } from '@autonomys/auto-drive'

// ============================================================================
// SEARCH INTERFACES
// ============================================================================

export interface SearchResult {
  name?: string
  headCid: string
  size?: number
  type?: string
  uploadStatus?: string
  mimeType?: string
  owners?: any[]
}

export interface SearchOptions {
  includeDetails?: boolean
  filterByType?: string
  filterBySize?: {
    min?: number
    max?: number
  }
  sortBy?: 'name' | 'size' | 'type' | 'uploadStatus'
  sortOrder?: 'asc' | 'desc'
}

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Searches for files using AutoDrive API
 * @param api - AutoDrive API instance
 * @param searchValue - Search term (name, CID, or partial match)
 * @param options - Search options
 * @returns Promise<SearchResult[]> - Array of search results
 */
export async function searchFiles(
  api: AutoDriveApi,
  searchValue: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  try {
    console.log(`🔍 Searching for: "${searchValue}"`)
    const results = await api.searchByNameOrCID(searchValue)
    
    console.log(`✅ Search completed! Found ${results.length} result(s)`)
    
    if (results.length === 0) {
      console.log('📭 No files found matching your search criteria')
      return []
    }
    
    // Apply filters and sorting
    let filteredResults = results as SearchResult[]
    
    if (options.filterByType) {
      filteredResults = filteredResults.filter(file => 
        file.type?.toLowerCase().includes(options.filterByType!.toLowerCase())
      )
    }
    
    if (options.filterBySize) {
      filteredResults = filteredResults.filter(file => {
        if (!file.size) return true
        const size = file.size
        const { min, max } = options.filterBySize!
        return (!min || size >= min) && (!max || size <= max)
      })
    }
    
    // Apply sorting
    if (options.sortBy) {
      filteredResults.sort((a, b) => {
        const aValue = a[options.sortBy!] || ''
        const bValue = b[options.sortBy!] || ''
        
        let comparison = 0
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue)
        } else {
          comparison = (aValue as number) - (bValue as number)
        }
        
        return options.sortOrder === 'desc' ? -comparison : comparison
      })
    }
    
    return filteredResults
  } catch (error) {
    console.error('❌ Error searching files:', error)
    throw error
  }
}

/**
 * Searches for files by multiple criteria
 * @param api - AutoDrive API instance
 * @param searchTerms - Array of search terms
 * @param options - Search options
 * @returns Promise<Map<string, SearchResult[]>> - Map of search term to results
 */
export async function searchMultipleTerms(
  api: AutoDriveApi,
  searchTerms: string[],
  options: SearchOptions = {}
): Promise<Map<string, SearchResult[]>> {
  const results = new Map<string, SearchResult[]>()
  
  for (const term of searchTerms) {
    try {
      const termResults = await searchFiles(api, term, options)
      results.set(term, termResults)
    } catch (error) {
      console.error(`❌ Error searching for term "${term}":`, error)
      results.set(term, [])
    }
  }
  
  return results
}

// ============================================================================
// RESULT PROCESSING
// ============================================================================

/**
 * Formats search results for display
 * @param results - Array of search results
 * @param includeDetails - Whether to include detailed information
 * @returns Formatted string representation
 */
export function formatSearchResults(
  results: SearchResult[],
  includeDetails: boolean = true
): string {
  if (results.length === 0) {
    return '📭 No files found matching your search criteria'
  }
  
  let output = `\n📋 Search Results (${results.length} found):\n`
  output += '='.repeat(80) + '\n'
  
  results.forEach((file, index) => {
    output += `\n${index + 1}. File Summary:\n`
    output += `   📁 Name: ${file.name || 'Unnamed'}\n`
    output += `   🔗 Head CID: ${file.headCid}\n`
    
    if (includeDetails) {
      output += `   📊 Size: ${file.size || 'Unknown'} bytes\n`
      output += `   📍 Type: ${file.type || 'Unknown'}\n`
      output += `   📤 Upload Status: ${file.uploadStatus || 'Unknown'}\n`
      
      if (file.mimeType) {
        output += `   📄 MIME Type: ${file.mimeType}\n`
      }
      
      if (file.owners && file.owners.length > 0) {
        output += `   👥 Owners: ${file.owners.length} owner(s)\n`
      }
    }
  })
  
  return output
}

/**
 * Extracts CIDs from search results
 * @param results - Array of search results
 * @returns Array of CIDs
 */
export function extractCids(results: SearchResult[]): string[] {
  return results.map(result => result.headCid)
}

/**
 * Groups search results by type
 * @param results - Array of search results
 * @returns Map of file type to results
 */
export function groupByType(results: SearchResult[]): Map<string, SearchResult[]> {
  const grouped = new Map<string, SearchResult[]>()
  
  results.forEach(result => {
    const type = result.type || 'Unknown'
    if (!grouped.has(type)) {
      grouped.set(type, [])
    }
    grouped.get(type)!.push(result)
  })
  
  return grouped
}

/**
 * Finds the largest file in search results
 * @param results - Array of search results
 * @returns SearchResult with the largest size, or null if no size info
 */
export function findLargestFile(results: SearchResult[]): SearchResult | null {
  const filesWithSize = results.filter(file => file.size !== undefined)
  
  if (filesWithSize.length === 0) return null
  
  return filesWithSize.reduce((largest, current) => 
    (current.size! > largest.size!) ? current : largest
  )
}

/**
 * Finds the smallest file in search results
 * @param results - Array of search results
 * @returns SearchResult with the smallest size, or null if no size info
 */
export function findSmallestFile(results: SearchResult[]): SearchResult | null {
  const filesWithSize = results.filter(file => file.size !== undefined)
  
  if (filesWithSize.length === 0) return null
  
  return filesWithSize.reduce((smallest, current) => 
    (current.size! < smallest.size!) ? current : smallest
  )
}
