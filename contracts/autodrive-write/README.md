# AutoDrive Write Integration

This module provides TypeScript/JavaScript functions for uploading files to AutoDrive (AI3) storage and integrating with NEAR smart contracts.

## Overview

The AutoDrive Write integration handles:
- **File uploads** to AutoDrive storage
- **Progress tracking** for large file uploads
- **CID generation** for file references
- **Integration** with NEAR contracts for metadata storage

## Architecture

```
User → AutoDrive API → AI3 Storage → NEAR Contract (metadata)
```

### Flow:
1. **Upload file** to AutoDrive using the API
2. **Get CID** (Content Identifier) back
3. **Store metadata** in NEAR contract with AutoDrive location
4. **Users can download** directly from AutoDrive using the CID

## Installation

```bash
npm install @autonomys/auto-drive @autonomys/auto-utils
```

## Testing

Run the examples to test the uploader:

```bash
npm run example
```

### Debug Mode

Enable debug logging:

```typescript
const uploader = createAutoDriveUploader(apiKey, NetworkId.TAURUS);
// Debug logs will be printed to console
```
