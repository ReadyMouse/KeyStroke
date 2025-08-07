// ============================================================================
// VALIDATION UTILITIES
// ============================================================================
// Handles input validation, data integrity, and error checking
// July 2025 - Author: ReadyMouse

// ============================================================================
// CID VALIDATION
// ============================================================================

/**
 * Validates if a string is a valid CID format
 * @param cid - Content ID to validate
 * @returns boolean - True if CID format is valid
 */
export function isValidCID(cid: string): boolean {
  if (!cid || typeof cid !== 'string') return false
  
  // Basic CID format validation
  // CIDs typically start with 'bafy', 'bafk', 'bafz', 'bafkr', etc.
  const cidPattern = /^baf[a-z0-9]{50,}$/
  return cidPattern.test(cid)
}

/**
 * Validates an array of CIDs
 * @param cids - Array of CIDs to validate
 * @returns Object with validation results
 */
export function validateCIDs(cids: string[]): {
  valid: string[]
  invalid: string[]
  errors: string[]
} {
  const valid: string[] = []
  const invalid: string[] = []
  const errors: string[] = []
  
  cids.forEach((cid, index) => {
    if (isValidCID(cid)) {
      valid.push(cid)
    } else {
      invalid.push(cid)
      errors.push(`Invalid CID at index ${index}: ${cid}`)
    }
  })
  
  return { valid, invalid, errors }
}

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Validates file size constraints
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns boolean - True if file size is acceptable
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size >= 0 && size <= maxSize
}

/**
 * Validates file type based on MIME type
 * @param mimeType - MIME type to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns boolean - True if MIME type is allowed
 */
export function isValidMimeType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => 
    mimeType.toLowerCase().includes(type.toLowerCase())
  )
}

/**
 * Validates file name
 * @param fileName - File name to validate
 * @returns boolean - True if file name is valid
 */
export function isValidFileName(fileName: string): boolean {
  if (!fileName || typeof fileName !== 'string') return false
  
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(fileName)) return false
  
  // Check length
  if (fileName.length === 0 || fileName.length > 255) return false
  
  // Check for reserved names (Windows)
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
  const upperName = fileName.toUpperCase()
  if (reservedNames.includes(upperName)) return false
  
  return true
}

// ============================================================================
// API VALIDATION
// ============================================================================

/**
 * Validates API configuration
 * @param config - API configuration object
 * @returns Object with validation results
 */
export function validateApiConfig(config: {
  apiKey?: string
  network?: string
  [key: string]: any
}): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!config.apiKey) {
    errors.push('API key is required')
  }
  
  if (!config.network) {
    errors.push('Network configuration is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates search parameters
 * @param searchValue - Search term to validate
 * @returns Object with validation results
 */
export function validateSearchParams(searchValue: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!searchValue || typeof searchValue !== 'string') {
    errors.push('Search value must be a non-empty string')
  }
  
  if (searchValue.length < 1) {
    errors.push('Search value cannot be empty')
  }
  
  if (searchValue.length > 1000) {
    errors.push('Search value is too long (max 1000 characters)')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// ============================================================================
// DATA INTEGRITY
// ============================================================================

/**
 * Validates search result data structure
 * @param result - Search result object to validate
 * @returns boolean - True if result has valid structure
 */
export function isValidSearchResult(result: any): boolean {
  if (!result || typeof result !== 'object') return false
  
  // Check for required fields
  if (!result.headCid || typeof result.headCid !== 'string') return false
  
  // Validate optional fields if present
  if (result.name !== undefined && typeof result.name !== 'string') return false
  if (result.size !== undefined && typeof result.size !== 'number') return false
  if (result.type !== undefined && typeof result.type !== 'string') return false
  if (result.uploadStatus !== undefined && typeof result.uploadStatus !== 'string') return false
  if (result.mimeType !== undefined && typeof result.mimeType !== 'string') return false
  
  return true
}

/**
 * Validates an array of search results
 * @param results - Array of search results to validate
 * @returns Object with validation results
 */
export function validateSearchResults(results: any[]): {
  valid: any[]
  invalid: any[]
  errors: string[]
} {
  const valid: any[] = []
  const invalid: any[] = []
  const errors: string[] = []
  
  results.forEach((result, index) => {
    if (isValidSearchResult(result)) {
      valid.push(result)
    } else {
      invalid.push(result)
      errors.push(`Invalid search result at index ${index}`)
    }
  })
  
  return { valid, invalid, errors }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Creates a standardized error message
 * @param operation - Name of the operation that failed
 * @param details - Additional error details
 * @returns Formatted error message
 */
export function createErrorMessage(operation: string, details: string): string {
  return `❌ ${operation} failed: ${details}`
}

/**
 * Validates error object structure
 * @param error - Error object to validate
 * @returns boolean - True if error has valid structure
 */
export function isValidError(error: any): boolean {
  return error && (
    error instanceof Error ||
    (typeof error === 'object' && (error.message || error.stack))
  )
}
