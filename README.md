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
- **Next.js**: React-based framework for the user interface
- **Modern UI**: Clean, responsive design with intuitive navigation
- **Real-time Interaction**: Immediate feedback and contextual responses
- **Traditional Authentication**: Email/password user management (MVP)

### Backend Infrastructure
- **Local/Rented Servers**: RAG + KG processing on traditional infrastructure (MVP)
- **AutoDrive Integration**: Direct connection to Autonomys storage network
- **Python/Node.js Backend**: High-performance processing pipeline

### Core Components
- **Document Processing**: Secure upload and archival system via AutoDrive API
- **User Management**: Traditional user accounts and authentication (MVP)
- **Knowledge Graph Engine**: Relationship mapping and contextual understanding
- **RAG Pipeline**: Retrieval and generation of accurate responses on local/rented servers
- **Data Verification**: Cryptographic proof of data integrity

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ReadyMouse/KeyStroke.git
   cd KeyStroke
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up backend processing pipeline**
   ```bash
   cd backend
   pip install -r requirements.txt
   python setup.py install
   ```

4. **Configure environment**
   ```bash
   # Add your AutoDrive credentials and backend configuration
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the development server**
   ```bash
   cd frontend
   npm run dev
   ```

## Usage
### Document Archival
1. Navigate to the Document Archival page
2. Upload your documents (supports multiple formats)
3. Pay the one-time fee for permanent storage via AutoDrive
4. Receive cryptographic proof of ownership
5. Access your documents anytime, anywhere

### Knowledge Query (MVP)
1. Create a user account with email/password
2. Go to the Knowledge Query page
3. Ask questions about your stored documents
4. Pay for processing via subscription or pay-per-query
5. Get contextual, evidence-based answers
6. View source documents and verification proofs
7. Explore related information through knowledge graphs

## Development
### Project Structure
```
KeyStroke/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Next.js pages
│   │   └── styles/         # CSS modules
├── contracts/              # Smart contracts
│   ├── query/              # Query-related contracts
│   └── autodrive-write/    # AutoDrive integration
└── docs/                   # Documentation
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Business Model & Revenue Streams
### **Three-Tier User Model**

**Tier 1: Individual Users**
- **Document Archival**: One-time AI3 storage fees + KeyStroke processing fee
- **Knowledge Query**: Limited free query model for RAG + KG processing
- **Features**: Basic document storage and search capabilities
- **Target**: Individual researchers, students, small businesses

**Tier 2: Professional Users**
- **Knowledge Query**: Monthly subscription with higher query limits
- **Features**: Advanced analytics, custom knowledge graphs
- **Target**: Law firms, consulting companies, research institutions

**Tier 3: Enterprise Users**
- **Knowledge Query**: Annual licensing with unlimited queries and custom models
- **Features**: White-label solutions, custom RAG model training, dedicated support
- **Target**: Large corporations, government agencies, healthcare systems

### **Revenue Streams**
- **Storage Fees**: One-time KeyStroke fees for permanent document storage on Autonomys
- **Subscription Revenue**: Monthly/annual plans for professional and enterprise users
- **Custom Development**: Tailored solutions and consulting services

## Technology Roadmap
### **0-6months MVP Foundation**
- Core RAG + KG functionality on traditional infrastructure
- Document archival via AutoDrive integration
- Basic user management and authentication
- Initial customer validation and feedback

### **NEAR Integration**
- Smart contract development for decentralized processing
- NEAR wallet integration and account management
- Migration of RAG + KG pipeline to NEAR computing
- Beta testing with early adopters

### **Advanced Features**
- Multi-modal processing capabilities
- Advanced knowledge graph features
- Marketplace for custom models
- Enterprise-grade security and compliance

#### **Platform Expansion**
- Advanced AI/ML capabilities
- Industry-specific solutions

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/ReadyMouse/KeyStroke) to submit issues or start discussions.

---

**KeyStroke**: Where every keystroke connects you to contextual, actionable information.

