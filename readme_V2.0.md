# VendingMachine V2 - Decentralized Vending Machine DApp

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Solidity](https://img.shields.io/badge/solidity-0.8.19-brightgreen.svg)
![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-UUPS-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> **Alchemy Certification Project** - Demonstrating deep understanding of EVM chains through a complete decentralized application

## Project Overview

This project demonstrates comprehensive knowledge of EVM chains by building a sophisticated decentralized vending machine that **reads from and writes to** the Ethereum blockchain. The application showcases advanced smart contract patterns, upgradeable architecture, and full-stack Web3 development.

## Project Evolution

### Phase 1: VendingMachine V1
- **Core functionality**: Product catalog, ETH payments, stock management
- **Smart contract**: Basic vending machine with owner controls
- **Frontend**: React DApp with MetaMask integration
- **Testing**: Complete unit and integration test suite

### Phase 2: VendingMachine V2 (Upgrade)
- **Enhanced features**: Admin interface, analytics dashboard, advanced permissions
- **Seamless upgrade**: V1 → V2 migration preserving all data
- **New capabilities**: CRUD operations, sales tracking, revenue analytics
- **Backward compatibility**: All V1 functions preserved and enhanced

## EVM Chain Mastery Demonstrated

### Reading from EVM Chains
- **Complex queries**: Multi-dimensional analytics, filtered data retrieval
- **State inspection**: Product catalogs, sales history, revenue metrics
- **Event filtering**: Transaction logs, purchase history, admin actions
- **Pagination**: Efficient large dataset handling

### Writing to EVM Chains
- **State management**: Product lifecycle, inventory control, user permissions
- **Payment processing**: ETH transactions, automatic refunds, balance tracking
- **Event emission**: Comprehensive logging for indexation and analytics
- **Access control**: Role-based permissions, upgrade authorization

## Architecture & Design

The project follows enterprise-grade patterns with comprehensive UML documentation:

### System Architecture
- [**VendingMachine Architecture**](docs/VendingMachine%20Architecture.png) - Overall system overview
- [**Class Diagram**](docs/VendingMachine%20Class%20Diagram.png) - Smart contract structure
- [**Component Diagram**](docs/Component%20Diagram.png) - System components interaction
- [**Package Diagram**](docs/Package%20Diagram%20A4.png) - Project organization

### Process Flows
- [**Use Case Diagram**](docs/Use%20Case%20Diagram.png) - User interactions and features
- [**Purchase Sequence Diagram**](docs/Purchase%20Sequence%20Diagram.png) - Transaction flow
- [**Purchase Activity Diagram**](docs/Purchase%20Activity%20Diagram.png) - Purchase process
- [**Admin Activity Diagram**](docs/Admin%20Activity%20Diagram.png) - Administrative operations

### Technical Implementation
- [**Deployment Diagram**](docs/VendingMachine%20Deployment%20Diagram.png) - Infrastructure setup
- [**Deployment Sequence**](docs/Deployment%20Sequence%20Diagram.png) - Deployment process
- [**MetaMask State Machine**](docs/MetaMask%20Transaction%20State%20Machine.png) - Wallet integration

## Technology Stack

### Smart Contracts
- **Solidity 0.8.19** - Latest stable with optimizations
- **OpenZeppelin** - Security patterns and upgradeable contracts
- **UUPS Proxy** - Universal upgradeable proxy standard
- **Hardhat** - Development environment and testing framework

### Frontend DApp
- **React 18** - Modern UI framework
- **Ethers.js** - Ethereum interaction library
- **Chakra UI** - Responsive component library
- **Custom Web3 Hooks** - Advanced blockchain state management

## Smart Contract Architecture

### UUPS Proxy Pattern
Why UUPS over Transparent Proxy:
- **Gas Efficiency**: Lower deployment and transaction costs
- **Enhanced Security**: Upgrade logic in implementation contract
- **Simplicity**: Single proxy contract, reduced complexity
- **Modern Standard**: OpenZeppelin recommended pattern since 2021

### Contract Structure
```
VendingMachineV2 (Proxy)
├── ProductLibrary (Utility functions)
├── Admin Interface (V2 enhancement)
├── Analytics System (V2 enhancement)
└── V1 Compatibility (Preserved functionality)
```

## Key Features

### V1 Core Features
- ✅ Product catalog management
- ✅ ETH-based payments
- ✅ Automatic refunds for overpayments
- ✅ Stock management
- ✅ Owner fund withdrawal

### V2 Enhancements
- ✅ **Admin Dashboard**: Complete CRUD operations
- ✅ **Analytics System**: Sales tracking, revenue reports
- ✅ **Permission System**: Role-based access control  
- ✅ **Event Logging**: Comprehensive blockchain events
- ✅ **Upgrade Capability**: Seamless V1→V2 migration

## Quick Start

### Prerequisites
- Node.js 20.x
- MetaMask browser / Rabby Wallet extension
- Basic understanding of Ethereum

### Installation
```bash
# Clone repository
git clone <repository-url>
cd vending-machine-v2

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npm test
```

### Deployment
```bash
# Start local blockchain
npx hardhat node

# Deploy V1 then upgrade to V2
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/deploy-v2.js --network localhost

# Start frontend
cd frontend && npm install && npm run dev
```

## Testing & Quality

### Comprehensive Test Suite
- **Unit Tests**: Individual function validation
- **Integration Tests**: Multi-contract interactions
- **Upgrade Tests**: V1→V2 migration scenarios
- **Security Tests**: Access control validation

### Test Coverage
- Statements: 96%
- Branches: 94%  
- Functions: 98%
- Lines: 95%

## Future Evolution - V3 Security Enhancements

### Identified Security Improvements
- **Front-running Protection**: Implement commit-reveal schemes
- **Reentrancy Guards**: Add protection to all payable functions
- **Oracle Integration**: Dynamic pricing with Chainlink feeds
- **Circuit Breaker**: Emergency pause functionality
- **Multi-signature**: Enhanced admin controls

## Project Achievements

### EVM Chain Understanding Demonstrated
- ✅ **Advanced Storage Patterns**: Complex state management with upgrades
- ✅ **Gas Optimization**: Efficient contract design and transaction patterns
- ✅ **Event Architecture**: Comprehensive logging and indexation
- ✅ **Proxy Implementation**: Modern upgradeable contract patterns
- ✅ **Access Control**: Granular permission systems
- ✅ **Payment Systems**: ETH handling with automated refunds


## Project Impact

This project demonstrates the practical application of EVM chain knowledge through:
- **Real-world Use Case**: Functional vending machine with business logic
- **Production-Ready Code**: Comprehensive testing and documentation
- **Scalable Architecture**: Upgradeable design for future enhancements
- **Security Awareness**: Identified vulnerabilities and improvement paths

---


> 💡 This project showcases the transition from traditional enterprise architecture to modern blockchain development, demonstrating both technical proficiency and architectural thinking in the Web3 space.