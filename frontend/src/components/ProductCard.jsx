/**
 * @fileoverview ProductCard component for displaying individual products
 * @description Renders a single product with purchase functionality and visual feedback
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project
 */

import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Badge,
  useColorModeValue,
  Spinner,
  useToast,
  Flex,
  Icon
} from '@chakra-ui/react';

/**
 * ProductCard Component
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.product - Product object from smart contract
 * @param {number} props.product.id - Unique product identifier
 * @param {string} props.product.name - Product name
 * @param {string} props.product.price - Product price in ETH (formatted string)
 * @param {BigNumber} props.product.priceWei - Product price in wei (for transactions)
 * @param {number} props.product.stock - Available stock quantity
 * @param {Function} props.onPurchase - Callback function to handle product purchase
 * @param {boolean} props.isLoading - Global loading state from parent component
 * @description Displays product information and handles purchase interactions
 * @returns {JSX.Element} Rendered product card with purchase functionality
 */
const ProductCard = ({ product, onPurchase, isLoading }) => {
  // Local state for this specific product card
  const [purchasing, setPurchasing] = useState(false); // Individual purchase loading state
  const toast = useToast(); // Chakra UI toast notifications
  
  // Dynamic styling based on color mode (light/dark theme)
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  /**
   * Handle product purchase
   * @async
   * @function handlePurchase
   * @description Manages the complete purchase flow with error handling and user feedback
   * @returns {Promise<void>}
   */
  const handlePurchase = async () => {
    setPurchasing(true); // Show loading state for this specific product
    
    try {
      // Call the purchase function passed from parent component
      // Pass product ID and price in wei for the transaction
      const success = await onPurchase(product.id, product.priceWei);
      
      // Show success notification if purchase completed
      if (success) {
        toast({
          title: 'Purchase Successful!',
          description: `You purchased ${product.name} for ${product.price} ETH`,
          status: 'success',
          duration: 5000,      // Show for 5 seconds
          isClosable: true,    // User can dismiss
        });
      }
    } catch (error) {
      // Show error notification if purchase failed
      toast({
        title: 'Purchase Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPurchasing(false); // Hide loading state
    }
  };

  /**
   * Get appropriate emoji for product based on name
   * @function getProductEmoji
   * @param {string} name - Product name
   * @description Returns relevant emoji based on product name keywords
   * @returns {string} Unicode emoji character
   */
  const getProductEmoji = (name) => {
    const lowName = name.toLowerCase();
    // Match product names to appropriate emojis for visual appeal
    if (lowName.includes('coca') || lowName.includes('cola')) return '🥤';
    if (lowName.includes('chip') || lowName.includes('doritos')) return '🍿';
    if (lowName.includes('eau') || lowName.includes('water')) return '💧';
    if (lowName.includes('snickers') || lowName.includes('kit kat') || lowName.includes('twix')) return '🍫';
    if (lowName.includes('red bull') || lowName.includes('monster') || lowName.includes('energy')) return '⚡';
    if (lowName.includes('sprite')) return '🥤';
    return '🍭'; // Default emoji for unmatched products
  };

  // Determine if product is out of stock
  const isOutOfStock = product.stock === 0;

  return (
    <Box
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
      shadow="md"
      transition="all 0.2s"
      // Add hover effects only if product is in stock
      _hover={!isOutOfStock ? { shadow: 'lg', transform: 'translateY(-2px)' } : {}}
      // Reduce opacity for out-of-stock products
      opacity={isOutOfStock ? 0.6 : 1}
    >
      <VStack spacing={4} align="center">
        {/* Product emoji/icon */}
        <Text fontSize="4xl">{getProductEmoji(product.name)}</Text>
        
        {/* Product information section */}
        <VStack spacing={2} align="center">
          {/* Product name */}
          <Text fontWeight="bold" fontSize="lg" textAlign="center">
            {product.name}
          </Text>
          
          {/* Product price badge */}
          <Flex align="center" gap={2}>
            <Badge colorScheme="blue" variant="solid" fontSize="md" px={3} py={1}>
              {product.price} ETH
            </Badge>
          </Flex>
          
          {/* Stock status badge */}
          <Badge 
            colorScheme={isOutOfStock ? 'red' : 'green'}
            variant="subtle"
            fontSize="sm"
          >
            {isOutOfStock ? 'Out of Stock' : `Stock: ${product.stock}`}
          </Badge>
        </VStack>
        
        {/* Purchase button */}
        <Button
          colorScheme="blue"
          size="md"
          width="full"
          onClick={handlePurchase}
          // Disable button if out of stock or if any loading operation is in progress
          isDisabled={isOutOfStock || isLoading}
          // Show loading spinner during purchase
          isLoading={purchasing}
          loadingText="Purchasing..."
        >
          {isOutOfStock ? 'Unavailable' : 'Buy Now'}
        </Button>
      </VStack>
    </Box>
  );
};

export default ProductCard;