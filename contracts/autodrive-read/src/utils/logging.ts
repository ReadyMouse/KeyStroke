// ============================================================================
// LOGGING UTILITIES
// ============================================================================
// Handles consistent logging, debugging, and output formatting
// July 2025 - Author: ReadyMouse

// ============================================================================
// LOG LEVELS
// ============================================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

// ============================================================================
// LOGGER CONFIGURATION
// ============================================================================

export interface LoggerConfig {
  level: LogLevel
  includeTimestamp: boolean
  includeEmojis: boolean
  maxLineLength: number
}

export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  includeTimestamp: true,
  includeEmojis: true,
  maxLineLength: 80
}

// ============================================================================
// LOGGER CLASS
// ============================================================================

export class Logger {
  private config: LoggerConfig

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config }
  }

  private formatMessage(level: string, message: string, emoji?: string): string {
    let formatted = ''
    
    if (this.config.includeTimestamp) {
      const timestamp = new Date().toISOString()
      formatted += `[${timestamp}] `
    }
    
    if (this.config.includeEmojis && emoji) {
      formatted += `${emoji} `
    }
    
    formatted += `[${level}] ${message}`
    
    return formatted
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, '🔍'))
      if (data) console.log(data)
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('INFO', message, 'ℹ️'))
      if (data) console.log(data)
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, '⚠️'))
      if (data) console.warn(data)
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message, '❌'))
      if (error) console.error(error)
    }
  }

  success(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('SUCCESS', message, '✅'))
      if (data) console.log(data)
    }
  }
}

// ============================================================================
// GLOBAL LOGGER INSTANCE
// ============================================================================

export const logger = new Logger()

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Logs a section header with visual separation
 * @param title - Section title
 * @param level - Log level (default: INFO)
 */
export function logSection(title: string, level: LogLevel = LogLevel.INFO): void {
  const separator = '='.repeat(80)
  const message = `\n${separator}\n${title}\n${separator}`
  
  switch (level) {
    case LogLevel.DEBUG:
      logger.debug(message)
      break
    case LogLevel.INFO:
      logger.info(message)
      break
    case LogLevel.WARN:
      logger.warn(message)
      break
    case LogLevel.ERROR:
      logger.error(message)
      break
  }
}

/**
 * Logs a progress indicator
 * @param current - Current progress value
 * @param total - Total value
 * @param operation - Operation description
 */
export function logProgress(current: number, total: number, operation: string): void {
  const percentage = Math.round((current / total) * 100)
  const progressBar = createProgressBar(percentage)
  logger.info(`${operation}: ${progressBar} ${percentage}% (${current}/${total})`)
}

/**
 * Creates a visual progress bar
 * @param percentage - Progress percentage (0-100)
 * @param width - Bar width (default: 20)
 * @returns Progress bar string
 */
export function createProgressBar(percentage: number, width: number = 20): string {
  const filled = Math.round((percentage / 100) * width)
  const empty = width - filled
  
  const filledChar = '█'
  const emptyChar = '░'
  
  return filledChar.repeat(filled) + emptyChar.repeat(empty)
}

/**
 * Logs a table of data
 * @param data - Array of objects to display
 * @param title - Optional table title
 */
export function logTable(data: any[], title?: string): void {
  if (title) {
    logger.info(title)
  }
  
  if (data.length === 0) {
    logger.info('No data to display')
    return
  }
  
  // Get all unique keys from all objects
  const keys = [...new Set(data.flatMap(obj => Object.keys(obj)))]
  
  // Calculate column widths
  const columnWidths = new Map<string, number>()
  keys.forEach(key => {
    columnWidths.set(key, key.length)
  })
  
  data.forEach(row => {
    keys.forEach(key => {
      const value = String(row[key] || '')
      const currentWidth = columnWidths.get(key) || 0
      columnWidths.set(key, Math.max(currentWidth, value.length))
    })
  })
  
  // Create header
  const header = keys.map(key => key.padEnd(columnWidths.get(key)!)).join(' | ')
  logger.info(header)
  logger.info('-'.repeat(header.length))
  
  // Create rows
  data.forEach(row => {
    const rowStr = keys.map(key => {
      const value = String(row[key] || '')
      return value.padEnd(columnWidths.get(key)!)
    }).join(' | ')
    logger.info(rowStr)
  })
}

/**
 * Logs execution time for a function
 * @param operation - Operation name
 * @param fn - Function to time
 * @returns Promise with function result
 */
export async function logExecutionTime<T>(
  operation: string, 
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now()
  logger.info(`🚀 Starting: ${operation}`)
  
  try {
    const result = await fn()
    const duration = Date.now() - start
    logger.success(`✅ Completed: ${operation} (${duration}ms)`)
    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`❌ Failed: ${operation} (${duration}ms)`, error)
    throw error
  }
}

/**
 * Logs memory usage information
 */
export function logMemoryUsage(): void {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    logger.info('💾 Memory Usage:', {
      rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(usage.external / 1024 / 1024)} MB`
    })
  }
}
