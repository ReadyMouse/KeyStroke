# AutoDrive Utilities

A comprehensive set of utility functions for working with the AutoDrive API. These utilities provide reusable "hammers and drills" for common operations.

## 📁 Structure

```
utils/
├── index.ts          # Main entry point - exports all utilities
├── api-setup.ts      # API configuration and initialization
├── file-operations.ts # File download and processing utilities
├── search-utils.ts   # Search and filtering utilities
├── validation.ts     # Input validation and data integrity
├── logging.ts        # Consistent logging and debugging
└── README.md         # This documentation
```

## 🚀 Quick Start

```typescript
import { getDefaultApi, searchFiles, downloadFileAsBuffer } from './utils'

// Initialize API
const api = getDefaultApi()

// Search for files
const results = await searchFiles(api, 'test')

// Download a file
const buffer = await downloadFileAsBuffer(api, results[0].headCid)
```

## 📦 Available Utilities

### API Setup (`api-setup.ts`)

**Functions:**
- `loadEnvironment(relativePath?)` - Load environment variables
- `validateEnvironment(requiredVars?)` - Validate required env vars
- `createApiInstance(options)` - Create configured API instance
- `getDefaultApi()` - Get pre-configured API instance

**Example:**
```typescript
import { getDefaultApi } from './utils/api-setup'

const api = getDefaultApi()
```

### File Operations (`file-operations.ts`)

**Functions:**
- `downloadFileAsBuffer(api, cid)` - Download file as Buffer
- `downloadFileAsString(api, cid, encoding?)` - Download file as string
- `downloadFileToPath(api, cid, outputPath)` - Download to filesystem
- `analyzeFile(buffer)` - Analyze file metadata
- `downloadMultipleFiles(api, cids, concurrency?)` - Batch download

**Example:**
```typescript
import { downloadFileAsBuffer, analyzeFile } from './utils/file-operations'

const buffer = await downloadFileAsBuffer(api, 'bafy...')
const analysis = analyzeFile(buffer)
console.log(`File size: ${analysis.sizeKB} KB`)
```

### Search Utilities (`search-utils.ts`)

**Functions:**
- `searchFiles(api, searchValue, options)` - Search with filtering/sorting
- `searchMultipleTerms(api, searchTerms, options)` - Multi-term search
- `formatSearchResults(results, includeDetails?)` - Format for display
- `extractCids(results)` - Extract CIDs from results
- `groupByType(results)` - Group files by type
- `findLargestFile(results)` - Find largest file
- `findSmallestFile(results)` - Find smallest file

**Example:**
```typescript
import { searchFiles, formatSearchResults } from './utils/search-utils'

const results = await searchFiles(api, 'test', {
  sortBy: 'size',
  sortOrder: 'desc',
  filterBySize: { min: 1024, max: 1024 * 1024 }
})

console.log(formatSearchResults(results))
```

### Validation (`validation.ts`)

**Functions:**
- `isValidCID(cid)` - Validate CID format
- `validateCIDs(cids)` - Validate array of CIDs
- `isValidFileSize(size, maxSize)` - Validate file size
- `isValidMimeType(mimeType, allowedTypes)` - Validate MIME type
- `validateSearchParams(searchValue)` - Validate search parameters
- `validateSearchResults(results)` - Validate result structure

**Example:**
```typescript
import { isValidCID, validateCIDs } from './utils/validation'

const cids = ['bafy...', 'invalid', 'bafk...']
const validation = validateCIDs(cids)
console.log(`Valid: ${validation.valid.length}, Invalid: ${validation.invalid.length}`)
```

### Logging (`logging.ts`)

**Features:**
- Configurable log levels (DEBUG, INFO, WARN, ERROR, SILENT)
- Timestamp and emoji support
- Progress bars and tables
- Execution time tracking
- Memory usage monitoring

**Example:**
```typescript
import { logger, logSection, logExecutionTime } from './utils/logging'

logSection('🚀 Starting Operation')

const result = await logExecutionTime('File Download', async () => {
  return await downloadFileAsBuffer(api, cid)
})

logger.success('Operation completed!')
```

## 🎯 Usage Patterns

### Basic Search and Download
```typescript
import { getDefaultApi, searchFiles, downloadFileAsBuffer } from './utils'

const api = getDefaultApi()
const results = await searchFiles(api, 'document')
const file = await downloadFileAsBuffer(api, results[0].headCid)
```

### Batch Processing
```typescript
import { searchFiles, extractCids, downloadMultipleFiles } from './utils'

const results = await searchFiles(api, 'image')
const cids = extractCids(results)
const files = await downloadMultipleFiles(api, cids, 3) // 3 concurrent
```

### Validation and Error Handling
```typescript
import { validateCIDs, logger } from './utils'

const cids = ['bafy...', 'invalid']
const validation = validateCIDs(cids)

if (validation.invalid.length > 0) {
  logger.warn('Invalid CIDs found:', validation.invalid)
}
```

### Advanced Search with Filtering
```typescript
import { searchFiles, groupByType } from './utils'

const results = await searchFiles(api, 'data', {
  filterByType: 'json',
  filterBySize: { min: 100, max: 10000 },
  sortBy: 'size',
  sortOrder: 'desc'
})

const grouped = groupByType(results)
for (const [type, files] of grouped) {
  console.log(`${type}: ${files.length} files`)
}
```

## 🔧 Configuration

### Logger Configuration
```typescript
import { Logger, LogLevel } from './utils/logging'

const logger = new Logger({
  level: LogLevel.DEBUG,
  includeTimestamp: true,
  includeEmojis: true
})
```

### API Configuration
```typescript
import { createApiInstance } from './utils/api-setup'

const api = createApiInstance({
  apiKey: 'your-key',
  network: NetworkId.TAURUS,
  loadEnv: false
})
```

## 📝 Example Script

See `example-usage.ts` for a complete demonstration of all utilities working together.

## 🛠️ Best Practices

1. **Always validate inputs** before processing
2. **Use logging** for debugging and monitoring
3. **Handle errors gracefully** with try-catch blocks
4. **Use batch operations** for multiple files
5. **Monitor memory usage** for large operations
6. **Cache API instances** when possible

## 🔄 Migration from Test Scripts

To migrate your existing test scripts:

1. Replace direct API creation with `getDefaultApi()`
2. Replace console.log with logger functions
3. Use validation functions before processing
4. Use utility functions instead of inline code
5. Add proper error handling

**Before:**
```typescript
const api = createAutoDriveApi({ apiKey, network: NetworkId.TAURUS })
console.log('Searching...')
const results = await api.searchByNameOrCID('test')
```

**After:**
```typescript
import { getDefaultApi, searchFiles, logger } from './utils'

const api = getDefaultApi()
logger.info('Searching...')
const results = await searchFiles(api, 'test')
```
