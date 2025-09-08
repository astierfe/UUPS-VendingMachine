/**
 * @fileoverview Enhanced contract utility functions for VendingMachine V2
 * @description Provides Web3 contract interface with V2 admin and analytics functions
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project - V2 Enhanced
 */

import { ethers } from 'ethers';

/**
 * Enhanced ABI for VendingMachine V2 contract
 * @constant {Array<string>} VENDING_MACHINE_ABI
 * @description Defines the complete V2 contract interface including admin and analytics functions
 */
export const VENDING_MACHINE_ABI = [
  // V1 View functions (read-only, no gas cost)
  "function getProducts() external view returns (tuple(uint256 id, string name, uint256 price, uint256 stock)[])",
  "function getProduct(uint256 id) external view returns (tuple(uint256 id, string name, uint256 price, uint256 stock))",
  "function getProductCount() external view returns (uint256)",
  
  // V1 State-changing functions (require gas)
  "function buyProduct(uint256 id) external payable",
  "function withdraw() external",
  
  // V2 Admin functions (require admin privileges)
  "function addProduct(uint256 id, string memory name, uint256 price, uint256 stock) external",
  "function updateProduct(uint256 id, string memory name, uint256 price, uint256 stock) external",
  "function removeProduct(uint256 id) external",
  
  // V2 Admin verification functions
  "function isAdmin(address account) external view returns (bool)",
  "function getAdmin() external view returns (address)",
  
  // V2 Analytics functions
  "function getSalesHistory() external view returns (tuple(uint256 productId, address buyer, uint256 price, uint256 timestamp, uint256 blockNumber)[])",
  "function getSalesHistoryPaginated(uint256 offset, uint256 limit) external view returns (tuple(uint256 productId, address buyer, uint256 price, uint256 timestamp, uint256 blockNumber)[])",
  "function getTotalSales() external view returns (uint256)",
  "function getProductRevenue(uint256 productId) external view returns (uint256)",
  "function getAnalyticsSummary() external view returns (uint256 totalSales, uint256 totalRevenue, uint256 totalProducts, uint256 contractBalance)",
  "function getSalesByTimeRange(uint256 fromTimestamp, uint256 toTimestamp) external view returns (tuple(uint256 productId, address buyer, uint256 price, uint256 timestamp, uint256 blockNumber)[])",
  
  // V2 Version function
  "function version() external pure returns (string memory)",
  
  // V1 Events (preserved for compatibility)
  "event ProductPurchased(uint256 indexed id, address indexed buyer, uint256 price)",
  "event RefundSent(address indexed buyer, uint256 amount)",
  "event ProductAdded(uint256 indexed id, string name, uint256 price, uint256 stock)",
  
  // V2 New Events
  "event ProductUpdated(uint256 indexed id, string name, uint256 price, uint256 stock)",
  "event ProductRemoved(uint256 indexed id, string name)",
  "event SaleRecorded(uint256 indexed saleId, uint256 indexed productId, address indexed buyer, uint256 price, uint256 timestamp)"
];

/**
 * Enhanced network configuration for V2 deployment
 * @constant {Object} NETWORK_CONFIG
 * @description Maps chain IDs to network configurations with V2 support
 */
const NETWORK_CONFIG = {
  // Local Hardhat networks (development)
  1337: {
    name: "Hardhat Local",
    contractAddress: null, // Will be loaded from deployed-addresses.json
    version: "2.0.0"
  },
  31337: {
    name: "Hardhat Local", 
    contractAddress: null, // Will be loaded from deployed-addresses.json
    version: "2.0.0"
  },
  // Sepolia testnet (public testing)
  11155111: {
    name: "Sepolia",
    contractAddress: "0x0eBc275C9167DB23958245E77AeA7B43fFa969B5", // Your V2 upgraded contract address
    version: "2.0.0"
  }
};

/**
 * Get the contract address for the current network (Enhanced for V2)
 * @async
 * @function getContractAddress
 * @description Determines the correct contract address, prioritizing V2 deployments
 * @returns {Promise<string>} The contract address for the current network
 * @throws {Error} If MetaMask is not installed or network is not supported
 */
export const getContractAddress = async () => {
  // Check if MetaMask is available
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  // Get current network information
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork();
  const chainId = network.chainId;

  console.log("Detected network:", chainId, network.name);

  // Handle local development networks (Hardhat)
  if (chainId === 1337 || chainId === 31337) {
    try {
      // Try to load contract address from deployed-addresses.json
      const response = await fetch('/deployed-addresses.json');
      if (response.ok) {
        const addresses = await response.json();
        console.log("Loaded addresses:", addresses);
        
        // V2 Enhancement: Check if we have V2 deployment info
        if (addresses.version && addresses.version.startsWith("2.")) {
          console.log("Using V2 contract at proxy address:", addresses.vendingMachineProxy);
        } else {
          console.log("Using V1 contract (will upgrade to V2):", addresses.vendingMachineProxy);
        }
        
        return addresses.vendingMachineProxy;
      } else {
        console.warn("Could not load deployed-addresses.json");
        // Fallback address for local development
        return "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
      return "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    }
  }

  // Handle public testnets and mainnet
  const config = NETWORK_CONFIG[chainId];
  if (config && config.contractAddress) {
    return config.contractAddress;
  }

  // Throw error for unsupported networks
  throw new Error(`Unsupported network: Chain ID ${chainId}`);
};

/**
 * Create a contract instance for V2 interaction
 * @async
 * @function getContract
 * @param {ethers.Signer|null} signer - The signer for transactions (null for read-only)
 * @description Creates an ethers.js Contract instance with V2 functionality
 * @returns {Promise<ethers.Contract>} V2 Contract instance ready for use
 * @example
 * // For read-only operations
 * const contract = await getContract();
 * const analytics = await contract.getAnalyticsSummary();
 * 
 * // For admin operations (requires signer and admin privileges)
 * const contract = await getContract(signer);
 * await contract.addProduct(1, "Coca Cola", ethers.utils.parseEther("0.01"), 10);
 * 
 * // For user purchases
 * await contract.buyProduct(1, { value: ethers.utils.parseEther("0.01") });
 */
export const getContract = async (signer = null) => {
  // Get the contract address for current network
  const contractAddress = await getContractAddress();
  
  // Create Web3 provider
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  console.log("Connecting to V2 contract:", contractAddress);
  
  // Create and return V2 contract instance
  const contract = new ethers.Contract(
    contractAddress, 
    VENDING_MACHINE_ABI, 
    signer || provider
  );

  // V2 Enhancement: Verify contract version if possible
  try {
    const version = await contract.version();
    console.log("Connected to contract version:", version);
    
    if (!version.startsWith("2.")) {
      console.warn("Warning: Connected contract may not be V2. Expected version 2.x.x, got:", version);
    }
  } catch (error) {
    // If version() doesn't exist, might be V1 contract
    console.warn("Could not verify contract version - might be V1 contract:", error.message);
  }
  
  return contract;
};

/**
 * Verify if connected contract supports V2 features
 * @async
 * @function verifyV2Features
 * @param {ethers.Contract} contract - Contract instance to verify
 * @description Checks if contract has V2 admin and analytics functions
 * @returns {Promise<Object>} Verification results with feature availability
 */
export const verifyV2Features = async (contract) => {
  const features = {
    isV2: false,
    hasAdminFunctions: false,
    hasAnalytics: false,
    version: "unknown"
  };

  try {
    // Try to call V2 version function
    const version = await contract.version();
    features.version = version;
    features.isV2 = version.startsWith("2.");
    
    // Test admin functions
    try {
      await contract.isAdmin("0x0000000000000000000000000000000000000000");
      features.hasAdminFunctions = true;
    } catch (error) {
      console.log("Admin functions not available");
    }
    
    // Test analytics functions
    try {
      await contract.getAnalyticsSummary();
      features.hasAnalytics = true;
    } catch (error) {
      console.log("Analytics functions not available");
    }
    
  } catch (error) {
    console.log("Version function not available - likely V1 contract");
  }
  
  return features;
};

/**
 * Format wei amount to ETH string (same as V1)
 * @function formatEther
 * @param {ethers.BigNumber} wei - Amount in wei
 * @returns {string} ETH amount as string
 */
export const formatEther = (wei) => ethers.utils.formatEther(wei);

/**
 * Parse ETH string to wei amount (same as V1)
 * @function parseEther
 * @param {string} eth - ETH amount as string
 * @returns {ethers.BigNumber} Amount in wei
 */
export const parseEther = (eth) => ethers.utils.parseEther(eth);

/**
 * Format timestamp for display
 * @function formatTimestamp
 * @param {number} timestamp - Unix timestamp
 * @description Converts Unix timestamp to human-readable format
 * @returns {string} Formatted date string
 */
export const formatTimestamp = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};

/**
 * Truncate Ethereum address for display
 * @function truncateAddress
 * @param {string} address - Full Ethereum address
 * @param {number} startChars - Number of characters to show at start (default: 6)
 * @param {number} endChars - Number of characters to show at end (default: 4)
 * @returns {string} Truncated address
 */
export const truncateAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};