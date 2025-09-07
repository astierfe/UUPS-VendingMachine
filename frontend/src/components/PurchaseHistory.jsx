/**
 * @fileoverview PurchaseHistory component for displaying user's transaction history
 * @description Shows a table of all purchases made by the current user session
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project
 */

import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  useColorModeValue,
  Center
} from '@chakra-ui/react';

/**
 * PurchaseHistory Component
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.purchases - Array of purchase objects from local state
 * @param {number} props.purchases[].id - Unique identifier for the purchase record
 * @param {number} props.purchases[].productId - ID of the purchased product
 * @param {string} props.purchases[].name - Name of the purchased product
 * @param {string} props.purchases[].price - Price paid in ETH (formatted string)
 * @param {string} props.purchases[].timestamp - Human-readable purchase timestamp
 * @description Displays user's purchase history in a responsive table format
 * @returns {JSX.Element} Rendered purchase history table or empty state
 */
const PurchaseHistory = ({ purchases }) => {
  // Dynamic styling based on color mode (light/dark theme)
  const tableBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');

  /**
   * Empty state - shown when user has no purchase history
   */
  if (purchases.length === 0) {
    return (
      <Box py={8}>
        <VStack spacing={4}>
          <Heading size="lg" color={headingColor}>
            Purchase History
          </Heading>
          <Center py={8}>
            <VStack spacing={4}>
              <Text fontSize="4xl">📦</Text>
              <Text color="gray.500">
                No purchases made yet
              </Text>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                Your purchase history will appear here after you buy products
              </Text>
            </VStack>
          </Center>
        </VStack>
      </Box>
    );
  }

  /**
   * Main purchase history display with data table
   */
  return (
    <Box py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header section with summary */}
        <VStack spacing={2}>
          <Heading size="lg" color={headingColor}>
            Purchase History
          </Heading>
          <Text color="gray.500">
            {purchases.length} purchase{purchases.length > 1 ? 's' : ''} completed
          </Text>
          <Text fontSize="sm" color="gray.400">
            Showing purchases from current session only
          </Text>
        </VStack>
        
        {/* Purchase history table */}
        <Box
          bg={tableBg}
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
        >
          <TableContainer>
            <Table variant="simple">
              {/* Table header */}
              <Thead>
                <Tr>
                  <Th>Product</Th>
                  <Th>Price Paid</Th>
                  <Th>Date & Time</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              
              {/* Table body with purchase records */}
              <Tbody>
                {/* Display purchases in reverse order (newest first) */}
                {purchases.slice().reverse().map((purchase) => (
                  <Tr key={purchase.id}>
                    {/* Product name column */}
                    <Td fontWeight="medium">{purchase.name}</Td>
                    
                    {/* Price paid column with badge styling */}
                    <Td>
                      <Badge colorScheme="blue" variant="subtle">
                        {purchase.price} ETH
                      </Badge>
                    </Td>
                    
                    {/* Timestamp column */}
                    <Td color="gray.500" fontSize="sm">
                      {purchase.timestamp}
                    </Td>
                    
                    {/* Status column - all purchases are confirmed by default */}
                    <Td>
                      <Badge colorScheme="green" variant="solid">
                        ✅ Confirmed
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* Additional information section */}
        <VStack spacing={2} pt={4}>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            All purchases are recorded on the Ethereum blockchain
          </Text>
          <Text fontSize="xs" color="gray.400" textAlign="center">
            Note: This history is stored locally and resets when you refresh the page.
            For permanent records, check your wallet transaction history or blockchain explorer.
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default PurchaseHistory;