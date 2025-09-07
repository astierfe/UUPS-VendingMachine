/**
 * @fileoverview Catalog component for displaying the product grid
 * @description Renders the complete product catalog with loading and empty states
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project
 */

import React from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  Spinner,
  Center,
  useColorModeValue
} from '@chakra-ui/react';
import ProductCard from './ProductCard';

/**
 * Catalog Component
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.products - Array of product objects from smart contract
 * @param {Function} props.onPurchase - Callback function to handle product purchases
 * @param {boolean} props.isLoading - Loading state for async operations
 * @description Displays the complete product catalog in a responsive grid layout
 * @returns {JSX.Element} Rendered catalog with products or appropriate state messages
 */
const Catalog = ({ products, onPurchase, isLoading }) => {
  // Dynamic styling based on color mode (light/dark theme)
  const headingColor = useColorModeValue('gray.800', 'white');

  /**
   * Loading state - shown while products are being fetched from blockchain
   */
  if (isLoading && products.length === 0) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading products from blockchain...</Text>
          <Text fontSize="sm" color="gray.500">
            This may take a few seconds depending on network conditions
          </Text>
        </VStack>
      </Center>
    );
  }

  /**
   * Empty state - shown when no products are available
   */
  if (products.length === 0) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Text fontSize="6xl">🛒</Text>
          <Text fontSize="lg" color="gray.500">
            No products available at the moment
          </Text>
          <Text fontSize="sm" color="gray.400">
            Products may be loading or the vending machine is empty
          </Text>
        </VStack>
      </Center>
    );
  }

  /**
   * Main catalog display with products
   */
  return (
    <Box py={8}>
      <VStack spacing={8} align="stretch">
        {/* Catalog header section */}
        <VStack spacing={2}>
          <Heading size="xl" color={headingColor} textAlign="center">
            Product Catalog
          </Heading>
          <Text color="gray.500" fontSize="lg" textAlign="center">
            Choose your favorite product and pay with ETH
          </Text>
          <Text fontSize="sm" color="gray.400" textAlign="center">
            {products.length} product{products.length !== 1 ? 's' : ''} available
          </Text>
        </VStack>
        
        {/* Product grid - responsive layout */}
        <SimpleGrid 
          columns={{ 
            base: 1,    // 1 column on mobile
            md: 2,      // 2 columns on tablet
            lg: 3,      // 3 columns on desktop
            xl: 4       // 4 columns on large desktop
          }} 
          spacing={6}   // Space between grid items
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}           // Unique key for React rendering
              product={product}          // Pass complete product object
              onPurchase={onPurchase}    // Pass purchase handler function
              isLoading={isLoading}      // Pass global loading state
            />
          ))}
        </SimpleGrid>

        {/* Additional information section */}
        <VStack spacing={2} pt={4}>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            All transactions are processed on the Ethereum blockchain
          </Text>
          <Text fontSize="xs" color="gray.400" textAlign="center">
            Prices are displayed in ETH. Gas fees apply for each transaction.
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Catalog;