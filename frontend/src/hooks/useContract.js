/**
 * @fileoverview Enhanced React hook for V2 blockchain interactions
 * @description Manages Web3 connection, V2 contract interactions, admin functions, and analytics
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project - V2 Enhanced
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getContract, formatEther } from '../utils/contract';

/**
 * Custom hook for managing VendingMachine V2 contract interactions
 * @hook
 * @description Provides state management and functions for Web3 operations including admin and analytics
 * @returns {Object} Hook state and functions for blockchain interactions
 */
export const useContract = () => {
  // Existing V1 state variables
  const [account, setAccount] = useState(null);           // Connected wallet address
  const [products, setProducts] = useState([]);           // Array of products from contract
  const [loading, setLoading] = useState(false);          // Loading state for async operations
  const [purchaseHistory, setPurchaseHistory] = useState([]); // User's purchase history (local)
  const [contract, setContract] = useState(null);         // Contract instance
  const [signer, setSigner] = useState(null);             // Ethers signer for transactions
  
  // V2 New state variables
  const [isAdmin, setIsAdmin] = useState(false);          // Whether current user is admin
  const [salesHistory, setSalesHistory] = useState([]);   // Complete sales history from blockchain
  const [analytics, setAnalytics] = useState({            // Analytics summary
    totalSales: 0,
    totalRevenue: '0',
    totalProducts: 0,
    contractBalance: '0'
  });
  const [adminLoading, setAdminLoading] = useState(false); // Loading state for admin operations

  /**
   * Connect to MetaMask wallet (Enhanced for V2)
   * @async
   * @function connectWallet
   * @description Requests wallet connection and sets up event listeners
   * @returns {Promise<void>}
   */
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed! Please install it from metamask.io');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      const signerInstance = provider.getSigner();
      const address = await signerInstance.getAddress();
      
      setAccount(address);
      setSigner(signerInstance);
      
      try {
        const contractInstance = await getContract(signerInstance);
        setContract(contractInstance);
        console.log("Contract connected:", contractInstance.address);
        
        // V2 Enhancement: Check admin status
        await checkAdminStatus(contractInstance, address);
        
      } catch (error) {
        console.error("Error connecting to contract:", error);
        alert(`Contract connection error: ${error.message}`);
      }
      
      // Set up event listeners
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setSigner(null);
          setContract(null);
          setIsAdmin(false); // V2: Reset admin status
        } else {
          setAccount(accounts[0]);
          connectContract(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        console.log("Network changed:", chainId);
        window.location.reload();
      });
      
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Error connecting to MetaMask');
    }
  };

  /**
   * Check if current account is admin
   * @async
   * @function checkAdminStatus
   * @param {Object} contractInstance - Contract instance
   * @param {string} address - Account address to check
   * @description Verifies admin privileges for the connected account
   */
  const checkAdminStatus = async (contractInstance, address) => {
    try {
      const adminStatus = await contractInstance.isAdmin(address);
      setIsAdmin(adminStatus);
      console.log("Admin status for", address, ":", adminStatus);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  /**
   * Reconnect contract when account changes
   * @async
   * @function connectContract
   * @param {string} accountAddress - The new account address
   * @description Reconnects to contract with new signer and checks admin status
   */
  const connectContract = async (accountAddress) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signerInstance = provider.getSigner();
      const contractInstance = await getContract(signerInstance);
      setContract(contractInstance);
      
      // V2: Check admin status for new account
      await checkAdminStatus(contractInstance, accountAddress);
      
      console.log("Contract reconnected for:", accountAddress);
    } catch (error) {
      console.error("Error reconnecting contract:", error);
    }
  };

  /**
   * Load products from the smart contract (Enhanced for V2)
   * @async
   * @function loadProducts
   * @description Fetches all products and formats them for frontend display
   * @returns {Promise<void>}
   */
  const loadProducts = useCallback(async () => {
    if (!contract) return;
    
    setLoading(true);
    try {
      console.log("Loading products from:", contract.address);
      
      const productsList = await contract.getProducts();
      console.log("Products received:", productsList);
      
      const formattedProducts = productsList.map(product => ({
        id: Number(product.id),
        name: product.name,
        price: formatEther(product.price),
        priceWei: product.price,
        stock: Number(product.stock)
      }));
      
      console.log("Products formatted:", formattedProducts);
      setProducts(formattedProducts);
      
    } catch (error) {
      console.error('Error loading products:', error);
      
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
   * Load analytics data from blockchain
   * @async
   * @function loadAnalytics
   * @description Fetches analytics summary and sales history
   * @returns {Promise<void>}
   */
  const loadAnalytics = useCallback(async () => {
    if (!contract) return;
    
    try {
      // Get analytics summary
      const analyticsSummary = await contract.getAnalyticsSummary();
      setAnalytics({
        totalSales: Number(analyticsSummary.totalSales),
        totalRevenue: formatEther(analyticsSummary.totalRevenue),
        totalProducts: Number(analyticsSummary.totalProducts),
        contractBalance: formatEther(analyticsSummary.contractBalance)
      });

      // Get sales history (limit to recent 100 for performance)
      const totalSales = Number(analyticsSummary.totalSales);
      if (totalSales > 0) {
        const limit = Math.min(100, totalSales);
        const offset = Math.max(0, totalSales - limit);
        
        const salesData = await contract.getSalesHistoryPaginated(offset, limit);
        const formattedSales = salesData.map((sale, index) => ({
          id: offset + index,
          productId: Number(sale.productId),
          buyer: sale.buyer,
          price: formatEther(sale.price),
          timestamp: new Date(Number(sale.timestamp) * 1000).toLocaleString(),
          blockNumber: Number(sale.blockNumber)
        }));
        
        setSalesHistory(formattedSales.reverse()); // Show newest first
      }
      
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }, [contract]);

  /**
   * Purchase a product (Enhanced with V2 analytics)
   * @async
   * @function buyProduct
   * @param {number} productId - ID of the product to purchase
   * @param {BigNumber} price - Price in wei
   * @description Handles the complete purchase flow
   * @returns {Promise<boolean>} Success status of the purchase
   */
  const buyProduct = async (productId, price) => {
    if (!contract || !signer) {
      alert('Please connect your wallet first');
      return false;
    }

    try {
      setLoading(true);
      
      console.log(`Purchasing product ${productId} for ${formatEther(price)} ETH`);
      
      const tx = await contract.buyProduct(productId, {
        value: price,
        gasLimit: 150000 // Increased gas limit for V2 analytics
      });
      
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      
      // Add purchase to local history
      const product = products.find(p => p.id === productId);
      if (product) {
        setPurchaseHistory(prev => [...prev, {
          id: Date.now(),
          productId,
          name: product.name,
          price: product.price,
          timestamp: new Date().toLocaleString()
        }]);
      }
      
      // Reload products and analytics to reflect the purchase
      await loadProducts();
      if (isAdmin) {
        await loadAnalytics();
      }
      
      return true;
      
    } catch (error) {
      console.error('Purchase error:', error);
      
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

  // ========== V2 ADMIN FUNCTIONS ==========

  /**
   * Add a new product (Admin only)
   * @async
   * @function addProduct
   * @param {number} id - Product ID
   * @param {string} name - Product name
   * @param {string} priceEth - Price in ETH (string)
   * @param {number} stock - Initial stock
   * @returns {Promise<boolean>} Success status
   */
  const addProduct = async (id, name, priceEth, stock) => {
    if (!contract || !isAdmin) {
      alert('Admin access required');
      return false;
    }

    try {
      setAdminLoading(true);
      
      const priceWei = ethers.utils.parseEther(priceEth);
      const tx = await contract.addProduct(id, name, priceWei, stock);
      
      console.log("Adding product, transaction:", tx.hash);
      await tx.wait();
      console.log("Product added successfully");
      
      await loadProducts();
      await loadAnalytics();
      
      return true;
      
    } catch (error) {
      console.error('Add product error:', error);
      
      let errorMessage = error.message;
      if (error.message.includes("Product already exists")) {
        errorMessage = "Product ID already exists. Use a different ID or update the existing product.";
      } else if (error.message.includes("Access denied")) {
        errorMessage = "Admin access required to add products";
      }
      
      alert(`Failed to add product: ${errorMessage}`);
      return false;
      
    } finally {
      setAdminLoading(false);
    }
  };

  /**
   * Update an existing product (Admin only)
   * @async
   * @function updateProduct
   * @param {number} id - Product ID
   * @param {string} name - Product name
   * @param {string} priceEth - Price in ETH (string)
   * @param {number} stock - Stock quantity
   * @returns {Promise<boolean>} Success status
   */
  const updateProduct = async (id, name, priceEth, stock) => {
    if (!contract || !isAdmin) {
      alert('Admin access required');
      return false;
    }

    try {
      setAdminLoading(true);
      
      const priceWei = ethers.utils.parseEther(priceEth);
      const tx = await contract.updateProduct(id, name, priceWei, stock);
      
      console.log("Updating product, transaction:", tx.hash);
      await tx.wait();
      console.log("Product updated successfully");
      
      await loadProducts();
      await loadAnalytics();
      
      return true;
      
    } catch (error) {
      console.error('Update product error:', error);
      
      let errorMessage = error.message;
      if (error.message.includes("Product does not exist")) {
        errorMessage = "Product not found. Please check the product ID.";
      } else if (error.message.includes("Access denied")) {
        errorMessage = "Admin access required to update products";
      }
      
      alert(`Failed to update product: ${errorMessage}`);
      return false;
      
    } finally {
      setAdminLoading(false);
    }
  };

  /**
   * Remove a product (Admin only)
   * @async
   * @function removeProduct
   * @param {number} id - Product ID to remove
   * @returns {Promise<boolean>} Success status
   */
  const removeProduct = async (id) => {
    if (!contract || !isAdmin) {
      alert('Admin access required');
      return false;
    }

    try {
      setAdminLoading(true);
      
      const tx = await contract.removeProduct(id);
      
      console.log("Removing product, transaction:", tx.hash);
      await tx.wait();
      console.log("Product removed successfully");
      
      await loadProducts();
      await loadAnalytics();
      
      return true;
      
    } catch (error) {
      console.error('Remove product error:', error);
      
      let errorMessage = error.message;
      if (error.message.includes("Product does not exist")) {
        errorMessage = "Product not found. It may have already been removed.";
      } else if (error.message.includes("Access denied")) {
        errorMessage = "Admin access required to remove products";
      }
      
      alert(`Failed to remove product: ${errorMessage}`);
      return false;
      
    } finally {
      setAdminLoading(false);
    }
  };

  // ========== EFFECTS ==========

  /**
   * Load products when contract becomes available
   */
  useEffect(() => {
    if (contract) {
      loadProducts();
    }
  }, [contract, loadProducts]);

  /**
   * Load analytics when contract becomes available and user is admin
   */
  useEffect(() => {
    if (contract && isAdmin) {
      loadAnalytics();
    }
  }, [contract, isAdmin, loadAnalytics]);

  /**
   * Auto-connect wallet if previously connected
   */
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const signerInstance = provider.getSigner();
            const address = await signerInstance.getAddress();
            
            setAccount(address);
            setSigner(signerInstance);
            
            try {
              const contractInstance = await getContract(signerInstance);
              setContract(contractInstance);
              await checkAdminStatus(contractInstance, address);
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
  }, []);

  // Return all state and functions for use by components
  return {
    // V1 compatibility
    account,
    products,
    loading,
    purchaseHistory,
    connectWallet,
    buyProduct,
    loadProducts,
    
    // V2 new features
    isAdmin,
    salesHistory,
    analytics,
    adminLoading,
    loadAnalytics,
    
    // V2 admin functions
    addProduct,
    updateProduct,
    removeProduct
  };
};