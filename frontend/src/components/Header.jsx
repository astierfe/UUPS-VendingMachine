/**
 * @fileoverview Header component for the VendingMachine DApp
 * @description Navigation header with wallet connection functionality
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project
 */

import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  useColorModeValue,
  Heading,
  Badge,
  Spacer
} from '@chakra-ui/react';

/**
 * Header Component
 * @component
 * @param {Object} props - Component props
 * @param {string|null} props.account - Connected wallet address (null if not connected)
 * @param {Function} props.onConnect - Callback function to handle wallet connection
 * @description Displays the application header with branding and wallet connection status
 * @returns {JSX.Element} Rendered header with wallet connection functionality
 */
const Header = ({ account, onConnect }) => {
  // Dynamic styling based on color mode (light/dark theme)
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  /**
   * Truncate wallet address for display
   * @function truncateAddress
   * @param {string} address - Full wallet address
   * @description Shortens long wallet addresses to first 6 and last 4 characters
   * @returns {string} Truncated address (e.g., "0x1234...5678")
   * @example
   * truncateAddress("0x1234567890123456789012345678901234567890")
   * // Returns: "0x1234...7890"
   */
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Box
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      py={4}
      px={6}
      shadow="sm"
      width="100%"
    >
      <Flex align="center">
        {/* Application branding/logo section */}
        <Heading size="lg" color="blue.500">
          🛍️ Vending Machine V1
        </Heading>
        
        {/* Spacer to push wallet section to the right */}
        <Spacer />
        
        {/* Wallet connection section */}
        {account ? (
          /* Connected state - show wallet address */
          <Flex align="center" gap={3}>
            <Badge 
              colorScheme="green" 
              variant="subtle" 
              p={2} 
              borderRadius="md"
              fontSize="sm"
            >
              ✅ Connected: {truncateAddress(account)}
            </Badge>
          </Flex>
        ) : (
          /* Disconnected state - show connect button */
          <Button
            colorScheme="blue"
            onClick={onConnect}
            size="md"
            variant="solid"
            _hover={{ 
              transform: 'translateY(-1px)',
              shadow: 'md' 
            }}
          >
            Connect MetaMask
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default Header;