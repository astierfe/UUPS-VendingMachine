/**
 * @fileoverview Main App component for VendingMachine V1 DApp
 * @description Root component that manages the application layout and navigation
 * @author Félicien ASTIER - Alchemy Ethereum Bootcamp Project
 */

import React, { useState } from 'react';
import {
  ChakraProvider,
  Container,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  useColorModeValue
} from '@chakra-ui/react';

// Import custom components
import Header from './components/Header';
import Footer from './components/Footer';
import Catalog from './components/Catalog';
import PurchaseHistory from './components/PurchaseHistory';

// Import custom hook for blockchain interaction
import { useContract } from './hooks/useContract';

/**
 * Main App Component
 * @component
 * @description Root component that provides the main application structure
 * @returns {JSX.Element} The complete VendingMachine DApp interface
 */
function App() {
  // Destructure state and functions from the custom useContract hook
  // This hook manages all blockchain-related state and operations
  const {
    account,          // Connected wallet address (null if not connected)
    products,         // Array of products from the smart contract
    loading,          // Loading state for async operations
    purchaseHistory,  // User's purchase history
    connectWallet,    // Function to connect MetaMask wallet
    buyProduct        // Function to purchase a product
  } = useContract();

  // Get background color based on current color mode (light/dark theme)
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <ChakraProvider>
      {/* Main container with full viewport height and responsive background */}
      <Box minHeight="100vh" bg={bgColor}>
        <VStack spacing={0} minHeight="100vh">
          
          {/* Header component with wallet connection functionality */}
          <Header account={account} onConnect={connectWallet} />
          
          {/* Main content container with responsive max width */}
          <Container maxW="container.xl" flex="1" py={6}>
            
            {/* Alert: MetaMask not detected */}
            {!window.ethereum && (
              <Alert status="warning" mb={6} borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>MetaMask Required!</AlertTitle>
                  <AlertDescription>
                    Please install MetaMask browser extension to use this application.
                    Visit metamask.io to download and install.
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Alert: Wallet not connected (but MetaMask is available) */}
            {!account && window.ethereum && (
              <Alert status="info" mb={6} borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Wallet Connection Required</AlertTitle>
                  <AlertDescription>
                    Connect your MetaMask wallet to access products and make purchases.
                    Click the "Connect MetaMask" button in the header.
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Main navigation tabs */}
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                {/* Product catalog tab */}
                <Tab>🛍️ Product Catalog</Tab>
                
                {/* Purchase history tab with dynamic counter */}
                <Tab>📦 Purchase History ({purchaseHistory.length})</Tab>
              </TabList>

              <TabPanels>
                {/* Tab Panel 1: Product Catalog */}
                <TabPanel px={0}>
                  <Catalog
                    products={products}           // Pass products array to catalog
                    onPurchase={buyProduct}       // Pass purchase function
                    isLoading={loading}           // Pass loading state
                  />
                </TabPanel>
                
                {/* Tab Panel 2: Purchase History */}
                <TabPanel px={0}>
                  <PurchaseHistory purchases={purchaseHistory} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Container>
          
          {/* Footer component */}
          <Footer />
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;