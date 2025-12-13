# SportWarren

A next-generation football management and community platform built with React, TypeScript, and integrated with Algorand blockchain for enhanced user experience and FIFA ecosystem compatibility.

## Overview

SportWarren transforms amateur football by combining traditional match tracking with blockchain-powered governance, verification, and community features. Built for the modern footballer who wants more than just statistics - they want ownership, transparency, and global recognition.

## Core Features

### 🏆 Smart Match Tracking
- Real-time match logging with voice and photo capture
- AI-powered event recognition and statistics
- Multi-platform data synchronization

### 👥 Adaptive Community Hub
- Squad management with dynamic roles
- Rivalry tracking and banter systems
- Local and global leaderboards

### 🎯 Achievement System
- Progressive skill-based achievements
- Seasonal challenges and competitions
- Performance analytics and insights

## Algorand Blockchain Integration

SportWarren leverages Algorand's fast, secure, and sustainable blockchain to create a truly decentralized sports ecosystem.

### 🏛️ Squad Governance & Decision Making

**Current Enhancement**: Transform basic squad management into decentralized autonomous organizations (DAOs)

**Features**:
- **Squad DAOs**: Each squad becomes a decentralized autonomous organization
- **Democratic Decisions**: Vote on team selections, tactics, transfers
- **Transparent Governance**: All decisions recorded on-chain
- **Token-Based Voting**: Squad tokens based on contribution/performance

**Benefits**:
- Democratic team management
- Transparent decision-making process
- Increased engagement through governance participation
- Fair representation based on contribution

### ⚡ Match Verification & Statistics

**Current Enhancement**: Replace self-reported data with blockchain-verified match results

**Features**:
- **Match Oracles**: Verified match results through consensus
- **Immutable Statistics**: Tamper-proof performance records
- **Multi-Party Verification**: Opponents and referees verify results
- **Smart Contract Automation**: Automatic stat updates and rewards

**Benefits**:
- Trusted, verifiable performance data
- Elimination of disputes over results
- Automatic achievement unlocking
- Enhanced credibility for player profiles

### 🌍 Community Challenges & Competitions

**Current Enhancement**: Expand local challenges to global, incentivized competitions

**Features**:
- **Global Tournaments**: FIFA-sponsored competitions on Algorand
- **Prize Pools**: Cryptocurrency rewards for winners
- **Sponsorship Integration**: Brands can sponsor challenges with token rewards
- **Cross-League Competition**: Compete with players worldwide

**Benefits**:
- Real monetary incentives
- Global competition scope
- Professional sponsorship opportunities
- Enhanced competitive experience

### 🆔 Player Identity & Reputation

**Current Enhancement**: Create portable, verifiable player identities

**Features**:
- **Decentralized Identity**: Self-sovereign identity on Algorand
- **Reputation Tokens**: Earn reputation through verified performance
- **Skill Verification**: Blockchain-verified skill ratings
- **Professional Pathways**: Scouts can verify talent through on-chain data

**Benefits**:
- Portable identity across platforms
- Verified skill credentials
- Professional opportunities
- Enhanced trust in player ratings

## Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **Apollo Client** for GraphQL state management
- **Socket.IO** for real-time features

### Backend Stack
- **Node.js** with Express and TypeScript
- **GraphQL** with Apollo Server
- **PostgreSQL** for relational data
- **Redis** for caching and sessions
- **Socket.IO** for real-time communication

### Blockchain Integration
- **Algorand SDK** for blockchain interactions
- **Smart Contracts** for governance and verification
- **ASAs (Algorand Standard Assets)** for tokens and NFTs
- **Atomic Transactions** for complex operations

### AI & Advanced Features
- **OpenAI Integration** for voice processing
- **Computer Vision** for match photo analysis
- **Player Analytics** with Roboflow Rapid + SAM3
  - Real-time player performance analysis
  - Pro comparison and benchmarking
  - Match outcome prediction
  - Video analysis and technique coaching
- **Multi-platform Communication** (WhatsApp, Telegram, XMTP)
- **Event Streaming** with Kafka

## Development Roadmap

### Phase 1: Foundation (Months 1-3)
- [x] Core match tracking functionality
- [x] Basic squad management
- [x] Achievement system foundation
- [1/2] Algorand wallet integration
- [1/2] Basic DAO smart contracts

### Phase 2: Governance (Months 4-6)
- [ ] Squad DAO implementation
- [ ] Token-based voting system
- [ ] Match verification oracles
- [ ] Reputation token system

### Phase 3: Ecosystem (Months 7-12)
- [ ] Global challenge platform
- [ ] FIFA ecosystem integration
- [ ] Professional scouting features
- [ ] Marketplace for tokens/achievements

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Algorand Sandbox (for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/sportwarren.git
cd sportwarren
```

2. Install dependencies:
```bash
npm install
```

3. Set up Python analytics service:
```bash
npm run setup:analytics
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- GraphQL API: `http://localhost:4000/graphql`
- Analytics Service: `http://localhost:5001`

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/sportwarren
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-auth0-client-id

# Algorand
ALGORAND_NODE_URL=https://testnet-api.algonode.cloud
ALGORAND_INDEXER_URL=https://testnet-idx.algonode.cloud
ALGORAND_PRIVATE_KEY=your-algorand-private-key

# AI Services
OPENAI_API_KEY=your-openai-api-key

# Player Analytics
ROBOFLOW_API_KEY=your-roboflow-api-key
ROBOFLOW_WORKSPACE=sportwarren
ROBOFLOW_MODEL=football-player-detection
ANALYTICS_SERVICE_URL=http://localhost:5001
ANALYTICS_PORT=5001

# Communication
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
WHATSAPP_SESSION_SECRET=your-whatsapp-session
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commits
- Ensure mobile responsiveness
- Test blockchain integrations on Algorand testnet

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@sportwarren.com
- 💬 Discord: [SportWarren Community](https://discord.gg/sportwarren)
- 🐦 Twitter: [@SportWarren](https://twitter.com/sportwarren)

---

Built with ⚽ by the SportWarren team. Powered by Algorand blockchain.
