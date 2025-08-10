# KeyStroke

**Connected, Contextual Answers at each KeyStroke**

A User Interface (UI) for Autonomy's Auto Drive system combined with an LLM-powered chat interface backed with knowledge graphs for contextual understanding and retrieval-augmented generation (RAG) for accuracy and evidence of claim.

![KeyStroke Overview](OV1.png)

## Overview

KeyStroke is a blockchain-native search interface for Autonomys' growing database of multi-modal information in Auto Drive. It provides actionable information at each keystroke through intelligent, contextual AI-powered search that goes beyond traditional keyword search.

Autonomys provides the infrastructure to scale web3 applications by building permanent data storage with fast availability. A database of documents, images, transactions, and important information accessible anytime, anywhere. Information is only as good as the ability to find it. Keyword search is for web2.0; web3.0 needs connected, contextual AI-powered search.

## Features
### 📁 Document Archival
- **Secure Storage**: Permanent document storage with blockchain verification
- **One-Time Fee**: Forever storage on the Autonomys network
- **Cryptographic Proof**: Ownership and integrity verification
- **Decentralized Network**: No single point of failure
- **Multi-Modal Support**: Documents, images, transactions, and more
- **Direct API Integration**: Seamless connection to Autonomys AutoDrive

### 🔍 Knowledge Query (RAG + KG)
- **Retrieval-Augmented Generation (RAG)**: Get accurate, evidence-based answers to your questions
- **Knowledge Graphs (KG)**: Contextual understanding of relationships between data points
- **Intelligent Search**: Ask questions about your documents and get relevant responses
- **Evidence-Based Answers**: All responses include source verification and evidence
- **Local Processing**: RAG + KG pipeline runs on local or rented servers (MVP)
- **Future: NEAR Integration**: Decentralized computing coming in future releases

## Architecture
### Frontend
- **Jekyll**: Static site generator for the user interface
- **Modern UI**: Clean, responsive design with intuitive navigation
- **Real-time Interaction**: Immediate feedback and contextual responses
- **GitHub Pages**: Easy deployment and hosting

### Backend Infrastructure
- **Local/Rented Servers**: RAG + KG processing on traditional infrastructure (MVP)
- **AutoDrive Integration**: Direct connection to Autonomys storage network
- **Python Backend**: High-performance processing pipeline

### Core Components
- **Document Processing**: Secure upload and archival system via AutoDrive API
- **Knowledge Graph Engine**: Relationship mapping and contextual understanding
- **RAG Pipeline**: Retrieval and generation of accurate responses on local/rented servers
- **Data Verification**: Cryptographic proof of data integrity

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ReadyMouse/KeyStroke.git
   cd KeyStroke
   ```

2. **Install Jekyll dependencies**
   ```bash
   bundle install
   ```

3. **Set up Python processing pipeline**
   ```bash
   cd contracts/autodrive-read
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   # Add your AutoDrive credentials and backend configuration
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the development server**
   ```bash
   bundle exec jekyll serve --livereload
   ```

## Development
### Project Structure
```
KeyStroke/
├── _includes/              # Jekyll includes/components
├── _layouts/              # Jekyll layout templates
├── _data/                 # Data files for Jekyll
├── assets/                # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── images/           # Images and media
├── contracts/            # Smart contracts and backend
│   ├── query/            # Query-related contracts
│   └── autodrive-read/   # AutoDrive integration
└── docs/                 # Documentation
```
