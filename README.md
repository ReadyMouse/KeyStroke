# SmirkingFace
A community-based library of AI models: HuggingFace on-chain

## Overview
Simple AI Model Registry - Where people can register and discover AI models with metadata. Think of it as a library catalog system, but for AI models.

## Architecture

### Cross-Chain Integration with AutoDrive (Autonomys DSN)

This project has evolved to include cross-chain functionality with AutoDrive (AI3) for decentralized AI model storage and management.

#### Smart Contract Architecture

**3 Contracts Total:**
1. **NEAR Read Contract** - Browse/search models (free operations)
2. **NEAR Write Contract** - Store model metadata (paid operations)  
3. **AI3 Write Contract** - Upload files to Autonomys storage (paid operations)

#### User Experience Flow

**Browsing/Searching Models (Free):**
```
User → Frontend → NEAR Contract → Model Metadata
```

**Uploading Models (Paid):**
```
User → Frontend → AutoDrive Contract → AI3 Storage → Cross-chain → NEAR Contract
```

**Downloading Models:**
```
User → Frontend → NEAR Contract → AI3 URL → Direct download from AI3
```

#### Key Design Decisions

- **No AI3 Read Contract**: Direct access to AI3 storage using URLs stored in NEAR metadata
- **Free Read Operations**: Browsing and searching models costs no gas
- **Paid Write Operations**: Uploading requires gas fees for both chains
- **Decentralized**: No central servers, oracles, or bridge infrastructure (goal)
- **Single Transaction**: User pays both gas fees upfront for seamless experience

#### Benefits

- ✅ **Minimal Gas Costs**: Free reads, paid only for uploads
- ✅ **Fast Response**: Direct NEAR calls for browsing
- ✅ **Large File Support**: AI3 handles model storage
- ✅ **Decentralized**: No central point of failure
- ✅ **User-Friendly**: Single transaction for uploads

## Project Structure

```
smirking-face/
├── hello-near-examples/          # NEAR smart contracts
│   ├── contract-rs/              # AI model registry contract
│   └── frontend/                 # Web interface
├── autonomys-bridge/             # Cross-chain bridge architecture
│   ├── README.md                 # Bridge documentation
│   └── src/                      # Bridge implementation
└── README.md                     # This file
```

## Notes
This is primarily a place for me to learn about NEAR's CLI tools, testnet, ecosystem and how to build smart contracts, with the added goal of creating a cross-chain AI model library. 
