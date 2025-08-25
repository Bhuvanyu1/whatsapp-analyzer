# WhatsApp Network Intelligence

A privacy-first desktop application that transforms your WhatsApp conversations into an intelligent, searchable professional network dashboard. Discover expertise, find mentors, and unlock the professional potential hidden in your chat history.

![WhatsApp Network Intelligence](https://img.shields.io/badge/Status-Active-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![React](https://img.shields.io/badge/React-18.3-blue)

## 🚀 Features

### 🔍 **Intelligent Network Search**

- Ask natural language questions about professional challenges
- Get ranked recommendations of contacts who can help
- Semantic matching powered by local NLP processing
- Context-aware results based on conversation history

### 📊 **Professional Network Analytics**

- Interactive network visualization
- Expertise heatmaps and skill distribution
- Relationship strength scoring
- Network health metrics and growth tracking

### 🔒 **Privacy-First Design**

- **100% Local Processing** - All data stays on your device
- No external APIs or cloud storage
- Encrypted local SQLite database
- Complete offline functionality

### 📱 **WhatsApp Integration**

- Parse individual and group chat exports (.txt format)
- Extract contacts, messages, and conversation context
- Support for multiple languages and date formats
- Batch processing for large chat histories

### 🤖 **AI-Powered Insights**

- Automatic expertise detection from conversations
- Keyword extraction and categorization
- Sentiment analysis and communication patterns
- Professional domain classification

## 🛠️ Tech Stack

### Frontend

- **React 18** + **TypeScript** - Modern UI with type safety
- **Vite** - Lightning-fast development and building
- **TailwindCSS 3** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Router 6** - SPA routing
- **Lucide React** - Beautiful icons

### Backend

- **Express 4** - Web application framework
- **SQLite** + **better-sqlite3** - Local database with full-text search
- **Multer** - File upload handling
- **Zod** - Runtime type validation

### AI/NLP Processing

- **Natural** - Natural language processing toolkit
- **Compromise** - Natural language understanding
- **Stopwords** - Text preprocessing
- Custom semantic matching algorithms

### Development

- **PNPM** - Fast, disk space efficient package manager
- **ESM Modules** - Modern JavaScript module system
- **Vitest** - Unit testing framework
- **Hot Module Replacement** - Instant development feedback

## 📦 Installation

### Prerequisites

- **Node.js 18+**
- **PNPM** (recommended) or npm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Bhuvanyu1/whatsapp-analyzer.git
cd whatsapp-analyzer

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:8080`

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Database Setup

The SQLite database is automatically created and initialized on first run. No additional setup required.

## 🎯 Usage Guide

### 1. **Export WhatsApp Chats**

1. Open WhatsApp on your phone
2. Select a chat (individual or group)
3. Tap **⋮** (three dots) → **More** → **Export chat**
4. Choose **"Without Media"**
5. Save the `.txt` file

### 2. **Import to Application**

1. Click **"Import Chats"** in the application
2. Drag & drop or select your `.txt` files
3. Watch as the app analyzes conversations and extracts insights
4. Review the processing results

### 3. **Search Your Network**

1. Type your professional challenge in the search box
   - _"I need help with digital marketing strategy"_
   - _"Looking for Python mentorship"_
   - _"Need advice on startup funding"_
2. Get ranked results of relevant contacts
3. See match explanations and conversation highlights
4. Contact your network members directly

### 4. **Explore Analytics**

1. Visit the **Analytics** page for network visualization
2. Explore expertise distribution and relationship maps
3. Track network growth and engagement metrics
4. Identify network gaps and opportunities

## 🏗️ Architecture

```
├── client/                 # React frontend
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI component library
│   │   ├── ContactSearchResults.tsx
│   │   ├── WhatsAppUpload.tsx
│   │   └── NetworkVisualization.tsx
│   ├── pages/             # Route components
│   │   ├── Index.tsx      # Main dashboard
│   │   ├── Analytics.tsx  # Network analytics
│   │   └── Settings.tsx   # App configuration
│   └── hooks/             # React hooks
├── server/                # Express backend
│   ├── database/          # Database schema and connection
│   ├── services/          # Business logic
│   │   ├── whatsapp-parser.ts    # Chat file parsing
│   │   └── nlp-processor.ts      # NLP and AI processing
│   ├── models/            # Data access layer
│   └── routes/            # API endpoints
├── shared/                # Shared types and utilities
└── public/                # Static assets
```

### Key Components

- **WhatsApp Parser**: Handles multiple chat export formats and extracts structured data
- **NLP Processor**: Analyzes text for expertise, sentiment, and professional context
- **Database Models**: Manages contacts, conversations, expertise, and relationships
- **Search Engine**: Semantic matching and ranking algorithms
- **Network Analyzer**: Relationship mapping and network health calculations

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database
DATABASE_PATH=whatsapp_network.db

# Optional: Custom ping message
PING_MESSAGE="WhatsApp Network Intelligence API"
```

### Database Schema

The application uses SQLite with the following main tables:

- `contacts` - Contact information and metadata
- `messages` - Parsed chat messages
- `expertise` - Extracted skills and knowledge areas
- `groups` - Group chat information
- `search_queries` - Search history and feedback

Full-text search is enabled for efficient content searching.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write unit tests for new features
- Update documentation as needed

## 📊 Roadmap

### Version 2.0

- [ ] Integration with other messaging platforms (Telegram, Slack)
- [ ] LinkedIn profile enrichment
- [ ] Calendar integration for relationship maintenance
- [ ] Advanced AI models for better expertise detection

### Version 3.0

- [ ] Mobile application
- [ ] Team collaboration features
- [ ] Network introduction facilitation
- [ ] Professional community integration

## 🐛 Known Issues

- **better-sqlite3**: May require manual building on some systems
- **Large Files**: Memory usage scales with chat history size
- **Group Chats**: Some participant detection edge cases

See [Issues](https://github.com/Bhuvanyu1/whatsapp-analyzer/issues) for current bug reports and feature requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Privacy & Security

### Data Handling

- **Local-Only Processing**: All data remains on your device
- **No Telemetry**: No usage data collection
- **Encrypted Storage**: SQLite database encryption
- **No External APIs**: Complete offline functionality

### Security Best Practices

- Regular dependency updates
- Input validation and sanitization
- Secure file handling
- No storage of sensitive credentials

## 🙋‍♂️ Support

- 📖 **Documentation**: Check our [Wiki](https://github.com/Bhuvanyu1/whatsapp-analyzer/wiki)
- 🐛 **Bug Reports**: [Create an Issue](https://github.com/Bhuvanyu1/whatsapp-analyzer/issues/new)
- 💡 **Feature Requests**: [Discussions](https://github.com/Bhuvanyu1/whatsapp-analyzer/discussions)
- 📧 **Contact**: Open an issue for general questions

## 🌟 Acknowledgments

- **Natural Language Processing**: Built with Natural.js and Compromise
- **UI Components**: Powered by Radix UI and TailwindCSS
- **Icon Library**: Beautiful icons from Lucide React
- **WhatsApp**: For creating the platform that connects us all

---

<div align="center">

**Transform your WhatsApp conversations into professional opportunities**

[⭐ Star this project](https://github.com/Bhuvanyu1/whatsapp-analyzer) if you find it useful!

</div>
