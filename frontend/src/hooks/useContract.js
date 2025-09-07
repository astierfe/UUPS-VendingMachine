/**
 * @fileoverview Custom React hook for blockchain interactions
 * @description Manages Web3 connection, contract interactions, and application state
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getContract, formatEther } from '../utils/contract';

/**
 * Custom hook for managing VendingMachine contract interactions
 * @hook
 * @description Provides state management and functions for Web3 operations
 * @returns {Object} Hook state and functions for blockchain interactions
 */
export const useContract = () => {
  // State variables for managing application data
  const [account, setAccount] = useState(null);           // Connected wallet address
  const [products, setProducts] = useState([]);           // Array of products from contract
  const [loading, setLoading] = useState(false);          // Loading state for async operations
  const [purchaseHistory, setPurchaseHistory] = useState([]); // User's purchase history
  const [contract, setContract] = useState(null);         // Contract instance
  const [signer, setSigner] = useState(null);             // Ethers signer for transactions

  /**
   * Connect to MetaMask wallet
   * @async
   * @function connectWallet
   * @description Requests wallet connection and sets up event listeners
   * @returns {Promise<void>}
   */
  const connectWallet = async () => {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      alert('MetaMask is not installed! Please install it from metamask.io');
      return;
    }

    try {
      // Create Web3 provider from MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Request account access from MetaMask
      await provider.send("eth_requestAccounts", []);
      
      // Get signer (account that can sign transactions)
      const signerInstance = provider.getSigner();
      const address = await signerInstance.getAddress();
      
      // Update state with connection info
      setAccount(address);
      setSigner(signerInstance);
      
      // Create contract instance with signer for transactions
      try {
        const contractInstance = await getContract(signerInstance);
        setContract(contractInstance);
        console.log("Contract connected:", contractInstance.address);
      } catch (error) {
        console.error("Error connecting to contract:", error);
        alert(`Contract connection error: ${error.message}`);
      }
      
      // Set up event listeners for MetaMask changes
      // Listen for account changes (user switches account)
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          setAccount(null);
          setSigner(null);
          setContract(null);
        } else {
          // User switched to different account
          setAccount(accounts[0]);
          // Reconnect contract with new account
          connectContract(accounts[0]);
        }
      });

      // Listen for network changes (user switches network)
      window.ethereum.on('chainChanged', (chainId) => {
        console.log("Network changed:", chainId);
        // Reload page to reconnect to correct contract
        window.location.reload();
      });
      
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Error connecting to MetaMask');
    }
  };

  /**
   * Reconnect contract when account changes
   * @async
   * @function connectContract
   * @param {string} accountAddress - The new account address
   * @description Reconnects to contract with new signer
   */
  const connectContract = async (accountAddress) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signerInstance = provider.getSigner();
      const contractInstance = await getContract(signerInstance);
      setContract(contractInstance);
      console.log("Contract reconnected for:", accountAddress);
    } catch (error) {
      console.error("Error reconnecting contract:", error);
    }
  };

  /**
   * Load products from the smart contract
   * @async
   * @function loadProducts
   * @description Fetches all products and formats them for frontend display
   * @returns {Promise<void>}
   */
  const loadProducts = useCallback(async () => {
    // Return early if contract is not available
    if (!contract) return;
    
    setLoading(true);
    try {
      console.log("Loading products from:", contract.address);
      
      // Call the getProducts function on the smart contract
      const productsList = await contract.getProducts();
      console.log("Products received:", productsList);
      
      // Format products for frontend use
      const formattedProducts = productsList.map(product => ({
        id: Number(product.id),                           // Convert BigNumber to number
        name: product.name,                               // Keep as string
        price: formatEther(product.price),                // Convert wei to ETH string
        priceWei: product.price,                          // Keep original wei value for transactions
        stock: Number(product.stock)                      // Convert BigNumber to number
      }));
      
      console.log("Products formatted:", formattedProducts);
      setProducts(formattedProducts);
      
    } catch (error) {
      console.error('Error loading products:', error);
      
      // Provide detailed error diagnosis
      if (error.code === 'CALL_EXCEPTION') {
        console.error("Contract does not exist at this address or method not found");
        console.error("Contract address:", contract?.address);
        alert("Error: Cannot access contract. Please verify network and contract deployment.");
      }
    } finally {
      setLoading(false);
    }
  }, [contract]);

  /**
   * Purchase a product
   * @async
   * @function buyProduct
   * @param {number} productId - ID of the product to purchase
   * @param {BigNumber} price - Price in wei
   * @description Handles the complete purchase flow including transaction and state updates
   * @returns {Promise<boolean>} Success status of the purchase
   */
  const buyProduct = async (productId, price) => {
    // Validate prerequisites
    if (!contract || !signer) {
      alert('Please connect your wallet first');
      return false;
    }

    try {
      setLoading(true);
      
      console.log(`Purchasing product ${productId} for ${formatEther(price)} ETH`);
      
      // Send transaction to smart contract
      const tx = await contract.buyProduct(productId, {
        value: price,           // Amount of ETH to send
        gasLimit: 100000       // Gas limit for the transaction
      });
      
      console.log("Transaction sent:", tx.hash);
      
      // Wait for transaction to be mined
      await tx.wait();
      console.log("Transaction confirmed");
      
      // Add purchase to local history
      const product = products.find(p => p.id === productId);
      if (product) {
        setPurchaseHistory(prev => [...prev, {
          id: Date.now(),                                 // Unique identifier for history entry
          productId,                                      // Product that was purchased
          name: product.name,                             // Product name
          price: product.price,                           // Price paid (in ETH string)
          timestamp: new Date().toLocaleString()          // Human-readable timestamp
        }]);
      }
      
      // Reload products to update stock levels
      await loadProducts();
      
      return true;
      
    } catch (error) {
      console.error('Purchase error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = error.message;
      if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH balance for this purchase";
      } else if (error.message.includes("Out of stock")) {
        errorMessage = "This product is out of stock";
      } else if (error.message.includes("Insufficient payment")) {
        errorMessage = "Payment amount is less than product price";
      }
      
      alert(`Purchase failed: ${errorMessage}`);
      return false;
      
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load products when contract becomes available
   * @effect
   * @description Automatically loads products when contract is connected
   */
  useEffect(() => {
    if (contract) {
      loadProducts();
    }
  }, [contract, loadProducts]);

  /**
   * Auto-connect wallet if previously connected
   * @effect
   * @description Checks for existing connection on component mount
   */
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          // If accounts exist, user was previously connected
          if (accounts.length > 0) {
            const signerInstance = provider.getSigner();
            const address = await signerInstance.getAddress();
            
            setAccount(address);
            setSigner(signerInstance);
            
            // Connect to contract
            try {
              const contractInstance = await getContract(signerInstance);
              setContract(contractInstance);
              console.log("Auto-connected to contract:", contractInstance.address);
            } catch (error) {
              console.error("Error during auto-connection to contract:", error);
            }
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, []); // Empty dependency array = run once on mount

  // Return all state and functions for use by components
  return {
    account,          // Connected wallet address
    products,         // Array of formatted products
    loading,          // Loading state for UI feedback
    purchaseHistory,  // Array of user purchases
    connectWallet,    // Function to connect wallet
    buyProduct,       // Function to purchase products
    loadProducts      // Function to manually reload products
  };
};