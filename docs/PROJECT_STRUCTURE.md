# SportWarren Project Structure

This document outlines the complete project structure for SportWarren, explaining the purpose and organization of each directory and key files.

## Root Directory Overview

```
sportwarren/
├── .bolt/                      # Bolt.new configuration files
├── .qodo/                      # Qodo AI tool configuration
├── contracts/                  # Algorand smart contracts (TEAL)
├── dist/                       # Built application files
├── docs/                       # Project documentation
├── node_modules/               # npm dependencies (auto-generated)
├── scripts/                    # Deployment and utility scripts
├── server/                     # Backend Node.js application
├── src/                        # Frontend React application
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore patterns
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML entry point
├── package.json               # Project dependencies and scripts
├── package-lock.json          # Locked dependency versions
├── postcss.config.js          # PostCSS configuration
├── README.md                  # Main project documentation
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.app.json          # TypeScript config for app
├── tsconfig.json              # Main TypeScript configuration
├── tsconfig.node.json         # TypeScript config for Node.js
└── vite.config.ts             # Vite build configuration
```

## Detailed Directory Structure

### `/contracts` - Smart Contracts
Organized Algorand smart contracts by functionality:

```
contracts/
├── README.md                  # Smart contracts documentation
├── global_challenges/         # Global tournament contracts
│   ├── approval.teal         # Main contract logic
│   └── clear_state.teal      # Account cleanup program
├── match_verification/        # Match result verification
│   ├── approval.teal
│   └── clear_state.teal
├── reputation_system/         # Player reputation tokens
│   ├── approval.teal
│   └── clear_state.teal
└── squad_dao/                 # Squad governance contracts
    ├── approval.teal
    └── clear_state.teal
```

**Purpose:** Contains all blockchain smart contracts written in TEAL (Transaction Execution Approval Language) for Algorand. Each contract handles specific SportWarren functionality like governance, verification, and reputation management.

### `/docs` - Documentation
Project documentation and guides:

```
docs/
├── DEPLOYMENT.md              # Deployment guide
├── PROJECT_STRUCTURE.md       # This file
├── API_REFERENCE.md           # API documentation (future)
├── SMART_CONTRACTS.md         # Contract specifications (future)
└── CONTRIBUTING.md            # Contribution guidelines (future)
```

**Purpose:** Comprehensive project documentation for developers, deployment engineers, and contributors.

### `/scripts` - Utility Scripts
Deployment and utility scripts:

```
scripts/
├── deploy-contracts.ts        # Smart contract deployment
├── verify-contracts.ts        # Contract verification (future)
├── test-contracts.ts          # Contract testing (future)
├── db-migrate.ts              # Database migrations (future)
└── seed-data.ts               # Sample data seeding (future)
```

**Purpose:** Automation scripts for deployment, testing, and maintenance tasks.

### `/server` - Backend Application
Node.js/Express backend with GraphQL API:

```
server/
├── src/
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Express middleware
│   ├── models/                # Database models
│   ├── resolvers/             # GraphQL resolvers
│   ├── routes/                # REST API routes
│   ├── services/              # Business logic services
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   └── index.ts               # Server entry point
├── tests/                     # Backend tests
├── tsconfig.json              # TypeScript configuration
└── package.json               # Backend-specific dependencies
```

**Purpose:** Backend API server handling authentication, database operations, GraphQL/REST endpoints, and blockchain interactions.

### `/src` - Frontend Application
React TypeScript frontend application:

```
src/
├── components/                # Reusable UI components
│   ├── ui/                   # Base UI components
│   ├── forms/                # Form components
│   ├── layout/               # Layout components
│   └── features/             # Feature-specific components
├── pages/                     # Page components
├── hooks/                     # Custom React hooks
├── services/                  # API service functions
├── store/                     # State management (Redux/Zustand)
├── types/                     # TypeScript type definitions
├── utils/                     # Utility functions
├── assets/                    # Static assets (images, icons)
├── styles/                    # Global styles
├── App.tsx                    # Main app component
├── main.tsx                   # React entry point
└── vite-env.d.ts             # Vite environment types
```

**Purpose:** React-based frontend application providing the user interface for SportWarren platform.

## Key Configuration Files

### Package Management
- **`package.json`** - Main project dependencies, scripts, and metadata
- **`package-lock.json`** - Locked versions of all dependencies
- **`node_modules/`** - Installed npm packages (auto-generated)

### TypeScript Configuration
- **`tsconfig.json`** - Main TypeScript compiler configuration
- **`tsconfig.app.json`** - Frontend-specific TypeScript settings
- **`tsconfig.node.json`** - Node.js/backend TypeScript settings

### Build Tools
- **`vite.config.ts`** - Vite build tool configuration for frontend
- **`eslint.config.js`** - Code linting rules and configuration
- **`tailwind.config.js`** - Tailwind CSS utility framework config
- **`postcss.config.js`** - PostCSS processor configuration

### Environment & Security
- **`.env.example`** - Template for environment variables
- **`.gitignore`** - Files and directories excluded from version control

## File Naming Conventions

### Components
- **React Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Custom Hooks:** camelCase with "use" prefix (e.g., `useAuth.ts`)
- **Utility Functions:** camelCase (e.g., `formatDate.ts`)

### Smart Contracts
- **Contract Files:** lowercase with underscores (e.g., `squad_dao_approval.teal`)
- **Now Organized:** Descriptive names in folders (e.g., `contracts/squad_dao/approval.teal`)

### Scripts and Configuration
- **Scripts:** kebab-case (e.g., `deploy-contracts.ts`)
- **Config Files:** lowercase with dots (e.g., `vite.config.ts`)

## Development Workflow

### 1. Local Development
```bash
npm run dev                    # Start both frontend and backend
npm run dev:client            # Frontend only (port 5173)
npm run dev:server            # Backend only (port 4000)
```

### 2. Smart Contract Development
```bash
npm run deploy:contracts:local     # Deploy to local Algorand sandbox
npm run deploy:contracts:testnet   # Deploy to Algorand testnet
npm run verify:contracts           # Verify contract deployment
```

### 3. Building for Production
```bash
npm run build                 # Build frontend for production
npm run build:server          # Build backend for production
npm run lint                  # Run code linting
```

## Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Blockchain    │
│   (React)       │◄──►│  (Node.js)      │◄──►│  (Algorand)     │
│                 │    │                 │    │                 │
│ • User Interface│    │ • GraphQL API   │    │ • Smart         │
│ • State Mgmt    │    │ • REST Endpoints│    │   Contracts     │
│ • Auth          │    │ • Database      │    │ • Tokens        │
│ • Real-time UI  │    │ • WebSockets    │    │ • Verification  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   Database      │
                       │  (PostgreSQL)   │
                       │                 │
                       │ • User Data     │
                       │ • Match Records │
                       │ • Squad Info    │
                       │ • Statistics    │
                       └─────────────────┘
```

## Security Considerations

### Smart Contracts
- Stored in `/contracts` with clear separation by functionality
- Each contract has approval and clear state programs
- Deployment scripts include verification steps

### Environment Variables
- Secrets stored in `.env` files (not committed to version control)
- Separate configurations for development, testing, and production
- Template provided in `.env.example`

### Code Organization
- Clear separation between frontend, backend, and blockchain code
- Type safety enforced through TypeScript
- Linting rules prevent common security issues

## Future Enhancements

### Planned Directory Additions
- `/tests` - Comprehensive test suites
- `/docker` - Docker configuration files
- `/kubernetes` - K8s deployment manifests
- `/monitoring` - Logging and monitoring configurations
- `/migrations` - Database migration files

### Tooling Improvements
- Automated testing pipeline
- Code coverage reporting
- Performance monitoring
- Security scanning integration

## Getting Started

1. **Clone the repository**
2. **Install dependencies:** `npm install`
3. **Copy environment template:** `cp .env.example .env`
4. **Configure environment variables**
5. **Start development servers:** `npm run dev`
6. **Deploy smart contracts:** `npm run deploy:contracts:local`

For detailed setup instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Contributing

When adding new features:
1. Follow the established directory structure
2. Use consistent naming conventions
3. Add appropriate documentation
4. Include tests for new functionality
5. Update this document if structure changes

For more information, see the main [README.md](../README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md).