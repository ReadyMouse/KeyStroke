# AutoDrive File Crawler

A TypeScript toolset for AutoDrive that discovers files, tests their downloadability, and maintains a database of file statuses. The workflow is split into three main scripts:

1. 🔍 **discover_script.ts** - Discovers files and saves metadata
2. 🧪 **test_CID_downloadable.ts** - Tests downloadability of discovered files
3. 📥 **test_download_single.ts** - Tests individual file downloads

## Features

- 🔍 **File Discovery** - Systematically discovers files across all scopes
- 📊 **Two-Stage Process** - Separates discovery from download testing
- 🔒 **Error Analysis** - Distinguishes between encrypted files, server issues, and other errors
- ⚡ **Resume Capability** - Both discovery and testing can resume if interrupted
- 📈 **Progress Tracking** - Shows detailed stats for both processes

## Installation

```bash
npm install @autonomys/auto-drive
npm install @autonomys/auto-utils
```

## Setup

1. Create a `.env` file in the project root with your AutoDrive API key:
```
AUTODRIVE_API_KEY=your_api_key_here
```

2. Install dependencies:
```bash
npm install
```

## Usage

The workflow is split into three stages:

### 1. Discover Files

First, run the discovery script to find files and save their metadata:

```bash
npm run discover
```

This will:
- Search through all scopes (public, private, all)
- Save discovered files to `autodrive_discovered.csv`
- Resume from last position if interrupted

### 2. Test Downloadability

Once files are discovered, test their downloadability:

```bash
npm run test:cid
```

Options:
- `--concurrency=NUM` - Parallel downloads (default 4)
- `--retries=NUM` - Download retry attempts (default 3)
- `--base-delay=MS` - Initial retry delay in ms (default 1000)
- `--max-delay=MS` - Max retry delay in ms (default 10000)

This will:
- Read untested files from `autodrive_discovered.csv`
- Test their downloadability
- Save results to `autodrive_database.csv`
- Mark tested files in `autodrive_discovered.csv`

### 3. Test Individual Files

To test a specific file:

```bash
npm run test:download YOUR_CID_HERE
```

This will:
- Download the specified file
- Show detailed analysis
- Save the file locally



This will:
- Search for files of different types on AutoDrive
- Test if each file is downloadable (with retries)
- Run multiple downloads in parallel
- Categorize errors (encrypted/server/not_found)
- Save results to `autodrive_database.csv`

### Database Structure

The CSV database contains:
- `cid` - Content ID
- `name` - File name
- `size` - File size
- `mimeType` - MIME type
- `uploadStatus` - Upload status (Note: This column could be removed for security if needed)
- `isDownloadable` - Whether download succeeded
- `downloadError` - Error message if failed
- `errorType` - Error category (encrypted/server_issue/not_found/unknown)
- `fileType` - File type (text/binary)
- `timestamp` - When tested

Note: The `uploadStatus` could be removed. This would require updating both the database files and the discovery script.

### Error Types

- 🔒 **Encrypted** - File requires password
- ⚠️ **Server Issue** - Timeout/overload (retryable later)
- ❌ **Not Found** - File doesn't exist
- ❓ **Unknown** - Other errors

## Scripts

- `npm run discover` - Run the file discovery process
- `npm run test:cid` - Test downloadability of discovered files
- `npm run test:download` - Test individual file download

## Files

- `src/discover_script.ts` - File discovery script
- `src/test_CID_downloadable.ts` - Downloadability testing script
- `src/test_download_single.ts` - Single file test script
- `src/utils/` - Utility functions for API, search, file operations
- `autodrive_discovered.csv` - Database of discovered files
- `autodrive_database.csv` - Database of download test results

## AutoDrive SDK Reference

Based on: https://develop.autonomys.xyz/sdk/auto-drive/overview_setup
