/**
 * @fileoverview Footer component for the VendingMachine DApp
 * @description Application footer with credits and technology links
 * @author Your Name - Alchemy Ethereum Bootcamp Project
 */

import React from 'react';
import {
  Box,
  Text,
  useColorModeValue,
  Center,
  Link
} from '@chakra-ui/react';

/**
 * Footer Component
 * @component
 * @description Displays application footer with technology credits and copyright
 * @returns {JSX.Element} Rendered footer with credits and external links
 */
const Footer = () => {
  // Dynamic styling based on color mode (light/dark theme)
  const bg = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      bg={bg}
      borderTop="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      py={8}
      mt={12}
      width="100%"
    >
      <Center>
        <Text color={textColor} fontSize="sm" textAlign="center">
          © 2024 Vending Machine V1 - Powered by{' '}
          {/* External link to Ethereum official website */}
          <Link 
            color="blue.500" 
            href="https://ethereum.org" 
            isExternal
            _hover={{ textDecoration: 'underline' }}
          >
            Ethereum
          </Link>
          {' '}and{' '}
          {/* External link to Chakra UI documentation */}
          <Link 
            color="blue.500" 
            href="https://chakra-ui.com" 
            isExternal
            _hover={{ textDecoration: 'underline' }}
          >
            Chakra UI
          </Link>
        </Text>
      </Center>
      
      {/* Additional footer information */}
      <Center mt={2}>
        <Text color={textColor} fontSize="xs" textAlign="center">
          Built with React, Hardhat, OpenZeppelin, and ethers.js
        </Text>
      </Center>
      
      <Center mt={1}>
        <Text color={textColor} fontSize="xs" textAlign="center">
          Developed for Alchemy Ethereum Developer Bootcamp
        </Text>
      </Center>
    </Box>
  );
};

export default Footer;