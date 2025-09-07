/**
 * @fileoverview Contract utility functions and configuration
 * @description Provides Web3 contract interface and network configuration
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project
 */

import { ethers } from 'ethers';

/**
 * ABI (Application Binary Interface) for the VendingMachine contract
 * @constant {Array<string>} VENDING_MACHINE_ABI
 * @description Defines the contract interface for frontend interaction
 * @notice These are the human-readable function signatures
 */
export const VENDING_MACHINE_ABI = [
  // View functions (read-only, no gas cost)
  "function getProducts() external view returns (tuple(uint256 id, string name, uint256 price, uint256 stock)[])",
  "function getProduct(uint256 id) external view returns (tuple(uint256 id, string name, uint256 price, uint256 stock))",
  "function getProductCount() external view returns (uint256)",
  
  // State-changing functions (require gas)
  "function buyProduct(uint256 id) external payable",
  
  // Events (for listening to contract emissions)
  "event ProductPurchased(uint256 indexed id, address indexed buyer, uint256 price)",
  "event RefundSent(address indexed buyer, uint256 amount)"
];

/**
 * Network configuration for different blockchain networks
 * @constant {Object} NETWORK_CONFIG
 * @description Maps chain IDs to network configurations
 */
const NETWORK_CONFIG = {
  // Local Hardhat networks (development)
  1337: {
    name: "Hardhat Local",
    contractAddress: null, // Will be loaded from deployed-addresses.json
  },
  31337: {
    name: "Hardhat Local", 
    contractAddress: null, // Will be loaded from deployed-addresses.json
  },
  // Sepolia testnet (public testing)
  11155111: {
    name: "Sepolia",
    contractAddress: "0x0eBc275C9167DB23958245E77AeA7B43fFa969B5", // Your deployed contract address
  }
};

/**
 * Get the contract address for the current network
 * @async
 * @function getContractAddress
 * @description Determines the correct contract address based on the connected network
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
      // This file is created by the deployment script
      const response = await fetch('/deployed-addresses.json');
      if (response.ok) {
        const addresses = await response.json();
        console.log("Loaded addresses:", addresses);
        return addresses.vendingMachineProxy;
      } else {
        console.warn("Could not load deployed-addresses.json");
        // Fallback address for local development
        // Note: This address changes each time you restart hardhat node
        return "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
      // Fallback address for local development
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
 * Create a contract instance for interaction
 * @async
 * @function getContract
 * @param {ethers.Signer|null} signer - The signer for transactions (null for read-only)
 * @description Creates an ethers.js Contract instance for blockchain interaction
 * @returns {Promise<ethers.Contract>} Contract instance ready for use
 * @example
 * // For read-only operations
 * const contract = await getContract();
 * const products = await contract.getProducts();
 * 
 * // For transactions (requires signer)
 * const contract = await getContract(signer);
 * await contract.buyProduct(1, { value: ethers.utils.parseEther("0.01") });
 */
export const getContract = async (signer = null) => {
  // Get the contract address for current network
  const contractAddress = await getContractAddress();
  
  // Create Web3 provider
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  console.log("Connecting to contract:", contractAddress);
  
  // Create and return contract instance
  // If signer is provided, contract can execute transactions
  // If signer is null, contract is read-only
  return new ethers.Contract(
    contractAddress, 
    VENDING_MACHINE_ABI, 
    signer || provider
  );
};

/**
 * Format wei amount to ETH string
 * @function formatEther
 * @param {ethers.BigNumber} wei - Amount in wei (smallest ETH unit)
 * @description Converts wei to human-readable ETH format
 * @returns {string} ETH amount as string (e.g., "0.01")
 * @example
 * const priceWei = ethers.BigNumber.from("10000000000000000"); // 0.01 ETH in wei
 * const priceETH = formatEther(priceWei); // "0.01"
 */
export const formatEther = (wei) => ethers.utils.formatEther(wei);

/**
 * Parse ETH string to wei amount
 * @function parseEther
 * @param {string} eth - ETH amount as string
 * @description Converts human-readable ETH to wei for transactions
 * @returns {ethers.BigNumber} Amount in wei
 * @example
 * const priceETH = "0.01";
 * const priceWei = parseEther(priceETH); // BigNumber representing 10000000000000000 wei
 */
export const parseEther = (eth) => ethers.utils.parseEther(eth);