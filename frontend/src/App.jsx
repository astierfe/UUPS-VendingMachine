/**
 * @fileoverview Main application component for VendingMachine V2 DApp
 * @description Enhanced app with admin interface and analytics
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project - V2 Enhanced
 */

import React, { useState } from 'react';
import {
  ChakraProvider,
  Container,
  Box,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue
} from '@chakra-ui/react';

// Import all components
import Header from './components/Header';
import Catalog from './components/Catalog';
import PurchaseHistory from './components/PurchaseHistory';
import Admin from './components/Admin';
import Footer from './components/Footer';

// Import the enhanced contract hook
import { useContract } from './hooks/useContract';

/**
 * Main Application Component
 * @component
 * @description Entry point for the VendingMachine V2 DApp with admin interface
 * @returns {JSX.Element} Complete application with all features
 */
function App() {
  // Get all contract functionality from the enhanced hook
  const {
    // V1 core functionality (preserved)
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
  } = useContract();

  // Local state for tab management
  const [activeTab, setActiveTab] = useState(0);

  // Dynamic styling
  const bg = useColorModeValue('gray.50', 'gray.900');

  /**
   * Handle product purchase with error handling
   * @async
   * @function handlePurchase
   * @param {number} productId - ID of product to purchase
   * @param {BigNumber} price - Price in wei
   * @returns {Promise<boolean>} Success status
   */
  const handlePurchase = async (productId, price) => {
    try {
      return await buyProduct(productId, price);
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  };

  /**
   * Handle adding new product (admin only)
   * @async
   * @function handleAddProduct
   * @param {number} id - Product ID
   * @param {string} name - Product name
   * @param {string} price - Price in ETH
   * @param {number} stock - Stock quantity
   * @returns {Promise<boolean>} Success status
   */
  const handleAddProduct = async (id, name, price, stock) => {
    try {
      return await addProduct(id, name, price, stock);
    } catch (error) {
      console.error('Add product failed:', error);
      return false;
    }
  };

  /**
   * Handle updating existing product (admin only)
   * @async
   * @function handleUpdateProduct
   * @param {number} id - Product ID
   * @param {string} name - Product name
   * @param {string} price - Price in ETH
   * @param {number} stock - Stock quantity
   * @returns {Promise<boolean>} Success status
   */
  const handleUpdateProduct = async (id, name, price, stock) => {
    try {
      return await updateProduct(id, name, price, stock);
    } catch (error) {
      console.error('Update product failed:', error);
      return false;
    }
  };

  /**
   * Handle removing product (admin only)
   * @async
   * @function handleRemoveProduct
   * @param {number} id - Product ID to remove
   * @returns {Promise<boolean>} Success status
   */
  const handleRemoveProduct = async (id) => {
    try {
      return await removeProduct(id);
    } catch (error) {
      console.error('Remove product failed:', error);
      return false;
    }
  };

  /**
   * Handle analytics refresh
   * @async
   * @function handleLoadAnalytics
   */
  const handleLoadAnalytics = async () => {
    try {
      await loadAnalytics();
    } catch (error) {
      console.error('Load analytics failed:', error);
    }
  };

  return (
    <ChakraProvider>
      <Box minHeight="100vh" bg={bg}>
        {/* Enhanced Header with admin status */}
        <Header 
          account={account}
          onConnect={connectWallet}
          isAdmin={isAdmin}
        />

        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Connection Status Alert */}
            {!account && (
              <Alert status="warning" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <AlertTitle>Wallet Not Connected!</AlertTitle>
                  <AlertDescription>
                    Please connect your MetaMask wallet to interact with the vending machine.
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Main Content Tabs */}
            <Tabs 
              index={activeTab} 
              onChange={(index) => setActiveTab(index)}
              variant="enclosed"
              colorScheme="blue"
            >
              <TabList>
                <Tab>🛒 Store</Tab>
                <Tab>📋 My Purchases</Tab>
                {/* Conditionally show admin tab only for admins */}
                {isAdmin && <Tab>⚙️ Admin</Tab>}
              </TabList>

              <TabPanels>
                {/* Store Tab - Product Catalog */}
                <TabPanel px={0}>
                  <Catalog
                    products={products || []} // Provide default empty array
                    onPurchase={handlePurchase}
                    isLoading={loading}
                  />
                </TabPanel>

                {/* Purchase History Tab */}
                <TabPanel px={0}>
                  <PurchaseHistory 
                    purchases={purchaseHistory || []} // Provide default empty array
                  />
                </TabPanel>

                {/* Admin Tab - Only visible to admins */}
                {isAdmin && (
                  <TabPanel px={0}>
                    <Admin
                      products={products || []} // Provide default empty array
                      analytics={analytics || { // Provide default analytics object
                        totalSales: 0,
                        totalRevenue: '0',
                        totalProducts: 0,
                        contractBalance: '0'
                      }}
                      salesHistory={salesHistory || []} // Provide default empty array
                      isLoading={loading}
                      adminLoading={adminLoading}
                      onAddProduct={handleAddProduct}
                      onUpdateProduct={handleUpdateProduct}
                      onRemoveProduct={handleRemoveProduct}
                      onLoadAnalytics={handleLoadAnalytics}
                    />
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>

            {/* Development Information */}
            {process.env.NODE_ENV === 'development' && (
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <AlertTitle>Development Mode</AlertTitle>
                  <AlertDescription>
                    {account ? (
                      <>
                        Connected as: {account.slice(0, 6)}...{account.slice(-4)}
                        {isAdmin && ' (Admin)'}
                      </>
                    ) : (
                      'Not connected to blockchain'
                    )}
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </VStack>
        </Container>

        {/* Footer */}
        <Footer />
      </Box>
    </ChakraProvider>
  );
}

export default App;