/**
 * @fileoverview Enhanced Header component for VendingMachine V2 DApp
 * @description Navigation header with wallet connection and admin status indicator
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project - V2 Enhanced
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
  Spacer,
  HStack
} from '@chakra-ui/react';

/**
 * Enhanced Header Component (V2)
 * @component
 * @param {Object} props - Component props
 * @param {string|null} props.account - Connected wallet address (null if not connected)
 * @param {Function} props.onConnect - Callback function to handle wallet connection
 * @param {boolean} props.isAdmin - Whether the connected account has admin privileges
 * @description Displays the application header with wallet connection and admin status
 * @returns {JSX.Element} Rendered header with enhanced V2 features
 */
const Header = ({ account, onConnect, isAdmin }) => {
  // Dynamic styling based on color mode (light/dark theme)
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  /**
   * Truncate wallet address for display
   * @function truncateAddress
   * @param {string} address - Full wallet address
   * @description Shortens long wallet addresses to first 6 and last 4 characters
   * @returns {string} Truncated address (e.g., "0x1234...5678")
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
        {/* Application branding/logo section with V2 indicator */}
        <HStack spacing={3}>
          <Heading size="lg" color="blue.500">
            VendingMachine V2
          </Heading>
          
          {/* V2 Version badge */}
          <Badge 
            colorScheme="green" 
            variant="solid" 
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="full"
          >
            V2.0
          </Badge>
        </HStack>
        
        {/* Spacer to push wallet section to the right */}
        <Spacer />
        
        {/* Wallet connection section with enhanced V2 features */}
        {account ? (
          /* Connected state - show wallet address and admin status */
          <HStack spacing={3}>
            {/* Admin status badge - only show if user is admin */}
            {isAdmin && (
              <Badge 
                colorScheme="purple" 
                variant="solid" 
                p={2} 
                borderRadius="md"
                fontSize="sm"
              >
                Admin
              </Badge>
            )}
            
            {/* Connected wallet badge */}
            <Badge 
              colorScheme="green" 
              variant="subtle" 
              p={2} 
              borderRadius="md"
              fontSize="sm"
            >
              Connected: {truncateAddress(account)}
            </Badge>
          </HStack>
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