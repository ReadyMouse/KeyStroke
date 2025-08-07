# AutoDrive File Crawler

A TypeScript crawler for AutoDrive that searches for files, tests their downloadability, and builds a persistent database of file statuses.

## Features

- 🔍 **Multi-file type search** - Searches for jpg, png, mp3, pdf, txt, doc, docx, zip, rar, tar, gz
- 📊 **Persistent database** - Saves results to CSV file that grows incrementally
- 🔒 **Error analysis** - Distinguishes between encrypted files, server issues, and other errors
- ⚡ **Resume capability** - Skips already tested files when restarted
- 📈 **Progress tracking** - Shows database stats and progress

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

### Start the Crawler

```bash
npm run test:search
```

This will:
- Search for files of different types on AutoDrive
- Test if each file is downloadable
- Categorize errors (encrypted/server/not_found)
- Save results to `autodrive_database.csv`

### Database Structure

The CSV database contains:
- `cid` - Content ID
- `name` - File name
- `size` - File size
- `mimeType` - MIME type
- `uploadStatus` - Upload status
- `isDownloadable` - Whether download succeeded
- `downloadError` - Error message if failed
- `errorType` - Error category (encrypted/server_issue/not_found/unknown)
- `fileType` - File type (text/binary)
- `timestamp` - When tested

### Error Types

- 🔒 **Encrypted** - File requires password
- ⚠️ **Server Issue** - Timeout/overload (retryable later)
- ❌ **Not Found** - File doesn't exist
- ❓ **Unknown** - Other errors

## Scripts

- `npm run test:search` - Run the main crawler
- `npm run test:download` - Test download with known working CID

## Files

- `src/test_search_script.ts` - Main crawler script
- `src/utils/` - Utility functions for API, search, file operations
- `autodrive_database.csv` - Persistent database (created automatically)

## AutoDrive SDK Reference

Based on: https://develop.autonomys.xyz/sdk/auto-drive/overview_setup

