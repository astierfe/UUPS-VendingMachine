# Vending Machine V1 - Ethereum DApp

## Overview

This decentralized application (DApp) implements a virtual vending machine on the Ethereum blockchain. Users can browse a product catalog and make purchases by paying directly with ETH. The project uses the upgradeable proxy pattern (UUPS) to enable evolution to V2 without losing state or changing the contract address.

## Technical Architecture

### Smart Contracts
- **VendingMachineV1**: Main upgradeable contract (UUPS pattern)
- **ProductLibrary**: Library for product operations
- **Proxy Pattern**: Enables future updates without data migration

### Frontend
- **React** with hooks for state management
- **Chakra UI** for user interface
- **ethers.js** for blockchain interaction
- **MetaMask** for transaction management

### Infrastructure
- **Hardhat** for development and testing
- **OpenZeppelin** for secure contracts
- **CSV** for product data import

## Alchemy Ethereum Bootcamp Concepts Covered

### Blockchain & Ethereum Fundamentals
- ✅ **Transactions**: Product purchases with ETH payments
- ✅ **Gas Management**: Transaction cost optimization
- ✅ **Events & Logs**: ProductAdded, ProductPurchased, RefundSent
- ✅ **Address Management**: User account handling

### Smart Contract Development
- ✅ **Solidity**: Contracts written in Solidity ^0.8.19
- ✅ **Contract Interactions**: Frontend ↔ Smart Contract communication
- ✅ **State Management**: Product mapping, stock tracking
- ✅ **Access Control**: `onlyOwner` modifier for administration
- ✅ **Error Handling**: require() statements and try/catch blocks

### Advanced Patterns
- ✅ **Upgradeable Contracts**: UUPS (Universal Upgradeable Proxy Standard)
- ✅ **Libraries**: ProductLibrary for business logic
- ✅ **Proxy Pattern**: Logic/storage separation
- ✅ **Initialization**: Initializer pattern for proxies

### DApp Development
- ✅ **Web3 Integration**: ethers.js for blockchain interaction
- ✅ **Wallet Connection**: MetaMask integration
- ✅ **Network Detection**: Multi-network support (local/testnet)
- ✅ **Transaction Management**: Confirmation handling

### Testing & Deployment
- ✅ **Local Development**: Hardhat node for testing
- ✅ **Testnet Deployment**: Sepolia deployment
- ✅ **Script Automation**: Automated deployment and population
- ✅ **Environment Management**: Multi-environment configuration

## Prerequisites

### Required Tools
- **Node.js** v16+ 
- **npm** or **yarn**
- **MetaMask** (browser extension)
- **Git**

### Accounts and Access
- **MetaMask Account** configured
- **Sepolia ETH** (for testnet) via [faucet](https://sepoliafaucet.com/)
- **Alchemy API Key** (optional, for Sepolia)

## Local Installation

### 1. Clone and Install

```bash
git clone [your-repo]
cd myVendingMachine
npm install
cd frontend
npm install
cd ..
```

### 2. Create Data File

Create `data/products.csv`:
```csv
id,name,price,stock
1,Coca Cola,0.002,50
2,Chips Lays,0.003,30
3,Eau Evian,0.001,100
4,Snickers,0.0025,40
5,Red Bull,0.004,25
```

### 3. Start Local Network

```bash
# Terminal 1 - Hardhat Node
npx hardhat node
```

### 4. Deploy Contracts

```bash
# Terminal 2 - Deployment
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/populate-products.js --network localhost

# Copy addresses for frontend
cp deployed-addresses.json frontend/public/
```

### 5. Configure MetaMask

**Add local network:**
- Name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Symbol: `ETH`

**Import test account:**
Use one of the private keys displayed by `npx hardhat node`

### 6. Launch Frontend

```bash
# Terminal 3 - Frontend
cd frontend
npm run dev
```

Open http://localhost:3000

## Sepolia Deployment

### 1. Configuration

Create `.env`:
```env
PRIVATE_KEY=your_metamask_private_key
ALCHEMY_API_KEY=your_alchemy_api_key
```

### 2. Hardhat Configuration

Verify `hardhat.config.js`:
```javascript
sepolia: {
  url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  accounts: [`0x${process.env.PRIVATE_KEY}`]
}
```

### 3. Deployment

```bash
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat run scripts/populate-products.js --network sepolia
```

### 4. Frontend

Update `utils/contract.js` with Sepolia address:
```javascript
11155111: {
  name: "Sepolia",
  contractAddress: "YOUR_SEPOLIA_CONTRACT_ADDRESS"
}
```

## Usage

### User Interface

1. **Connection**: Click "Connect MetaMask"
2. **Catalog**: Browse available products
3. **Purchase**: Click "Buy Now" for a product
4. **History**: View your purchases in the dedicated tab

### Admin Functions

```javascript
// Via Hardhat console
const contract = await ethers.getContractAt("VendingMachineV1", "ADDRESS");

// Add product
await contract.addProduct(6, "New Product", ethers.utils.parseEther("0.005"), 20);

// Withdraw funds
await contract.withdraw();
```

## Project Structure

```
myVendingMachine/
├── contracts/
│   ├── VendingMachineV1.sol    # Main contract with UUPS proxy
│   └── ProductLibrary.sol      # Utility library for products
├── scripts/
│   ├── deploy.js               # Contract deployment script
│   └── populate-products.js    # Product population script
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # Utility functions
│   └── public/                # Static assets
├── data/
│   └── products.csv           # Product data
└── deployed-addresses.json    # Contract addresses
```

## Upgrade Path to V2

The contract uses UUPS pattern enabling:
- **Transparent migration** without address change
- **Data preservation** (products, history)
- **New features** without user impact

### Example V2 Features

Potential enhancements:
- Loyalty system with ERC20 tokens
- Product categories
- Promotions and discounts
- Multi-vendor management

## Testing and Verification

```bash
# Unit tests
npx hardhat test

# Contract verification
npx hardhat verify --network sepolia CONTRACT_ADDRESS

# Interactive console
npx hardhat console --network localhost
```

## Troubleshooting

### Common Issues

**❌ "call revert exception"**
- Verify contract is deployed on correct network
- Confirm MetaMask is on same network

**❌ "Insufficient payment"**
- Check ETH price displayed
- Ensure sufficient ETH in account

**❌ "Nonce too high"**
- Reset MetaMask: Settings > Advanced > Reset Account

### Debug Logs

Enable browser console logs to diagnose contract connection issues.

## Security

### Implemented Best Practices
- ✅ Access Control with `onlyOwner`
- ✅ `require()` validations on all inputs
- ✅ Automatic refund handling
- ✅ Reentrancy protection (transfers at function end)
- ✅ Product ID validation

### Known Limitations
- No front-running protection
- Prices fixed in wei (sensitive to ETH fluctuations)
- No emergency pause system

## Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open Pull Request

## License

MIT License - see `LICENSE` file for details.

---

**Developed as part of the Alchemy Ethereum Developer Bootcamp**

## File Structure with Comments

All project files include comprehensive English comments:

### Smart Contracts
- **ProductLibrary.sol**: Library with utility functions and detailed NatSpec documentation
- **VendingMachineV1.sol**: Main contract with UUPS pattern and extensive inline comments

### Deployment Scripts
- **deploy.js**: Deployment automation with step-by-step explanations
- **populate-products.js**: CSV data import with error handling documentation

### Frontend Components
- **App.jsx**: Main application component with React best practices
- **useContract.js**: Web3 integration hook with detailed state management
- **contract.js**: Contract utilities with network configuration
- **ProductCard.jsx**: Individual product display with purchase flow
- **Catalog.jsx**: Product grid with responsive design
- **PurchaseHistory.jsx**: Transaction history with local state management
- **Header.jsx**: Navigation with wallet connection
- **Footer.jsx**: Application footer with credits
- **main.jsx**: Application bootstrap with React 18 features

### Documentation Standards
- JSDoc comments for all functions
- Inline explanations for complex logic
- Error handling with descriptive messages
- React component prop documentation
- Smart contract NatSpec documentation
- Network configuration explanations