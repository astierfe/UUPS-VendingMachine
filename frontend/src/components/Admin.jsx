/**
 * @fileoverview Admin component for VendingMachine V2 management interface
 * @description Provides admin dashboard with product management and analytics
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project - V2 Admin Interface
 */

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  useColorModeValue,
  useToast,
  Spinner,
  Center
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon, ViewIcon } from '@chakra-ui/icons';

/**
 * Admin Component
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.products - Array of products from smart contract
 * @param {Object} props.analytics - Analytics data object
 * @param {Array} props.salesHistory - Complete sales history
 * @param {boolean} props.isLoading - Loading state for operations
 * @param {boolean} props.adminLoading - Loading state for admin operations
 * @param {Function} props.onAddProduct - Callback to add product
 * @param {Function} props.onUpdateProduct - Callback to update product
 * @param {Function} props.onRemoveProduct - Callback to remove product
 * @param {Function} props.onLoadAnalytics - Callback to refresh analytics
 * @description Complete admin interface for managing vending machine
 * @returns {JSX.Element} Admin dashboard with management tools
 */
const Admin = ({
  products = [], // Default to empty array
  analytics = { // Default analytics object
    totalSales: 0,
    totalRevenue: '0',
    totalProducts: 0,
    contractBalance: '0'
  },
  salesHistory = [], // Default to empty array
  isLoading = false,
  adminLoading = false,
  onAddProduct = () => {},
  onUpdateProduct = () => {},
  onRemoveProduct = () => {},
  onLoadAnalytics = () => {}
}) => {
  // Modal states for product management
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  // Form states
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    price: '',
    stock: ''
  });
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const toast = useToast();
  
  // Styling
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];
  const safeSalesHistory = Array.isArray(salesHistory) ? salesHistory : [];

  /**
   * Reset form data
   */
  const resetForm = () => {
    setProductForm({
      id: '',
      name: '',
      price: '',
      stock: ''
    });
    setSelectedProduct(null);
  };

  /**
   * Handle add product
   */
  const handleAddProduct = async () => {
    if (!productForm.id || !productForm.name || !productForm.price || !productForm.stock) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const success = await onAddProduct(
      parseInt(productForm.id),
      productForm.name,
      productForm.price,
      parseInt(productForm.stock)
    );

    if (success) {
      toast({
        title: 'Product Added',
        description: `${productForm.name} has been added successfully`,
        status: 'success',
        duration: 3000,
      });
      resetForm();
      onAddClose();
    }
  };

  /**
   * Handle edit product
   */
  const handleEditProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.stock) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const success = await onUpdateProduct(
      selectedProduct.id,
      productForm.name,
      productForm.price,
      parseInt(productForm.stock)
    );

    if (success) {
      toast({
        title: 'Product Updated',
        description: `${productForm.name} has been updated successfully`,
        status: 'success',
        duration: 3000,
      });
      resetForm();
      onEditClose();
    }
  };

  /**
   * Handle delete product
   */
  const handleDeleteProduct = async () => {
    const success = await onRemoveProduct(selectedProduct.id);

    if (success) {
      toast({
        title: 'Product Removed',
        description: `${selectedProduct.name} has been removed successfully`,
        status: 'success',
        duration: 3000,
      });
      resetForm();
      onDeleteClose();
    }
  };

  /**
   * Open edit modal with product data
   */
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setProductForm({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      stock: product.stock.toString()
    });
    onEditOpen();
  };

  /**
   * Open delete confirmation modal
   */
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    onDeleteOpen();
  };

  // Loading state
  if (isLoading) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading admin dashboard...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <VStack spacing={2}>
          <Heading size="xl" color="purple.500">
            Admin Dashboard
          </Heading>
          <Text color="gray.500" textAlign="center">
            Manage products and view analytics for your vending machine
          </Text>
        </VStack>

        {/* Main admin tabs */}
        <Tabs variant="enclosed" colorScheme="purple">
          <TabList>
            <Tab>Product Management</Tab>
            <Tab>Analytics Dashboard</Tab>
            <Tab>Sales History</Tab>
          </TabList>

          <TabPanels>
            {/* Product Management Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                {/* Action buttons */}
                <HStack justify="space-between">
                  <Heading size="lg">Product Management</Heading>
                  <Button
                    colorScheme="purple"
                    leftIcon={<AddIcon />}
                    onClick={onAddOpen}
                    isDisabled={adminLoading}
                  >
                    Add Product
                  </Button>
                </HStack>

                {/* Products table */}
                <Box
                  bg={cardBg}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  overflow="hidden"
                >
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Name</Th>
                          <Th>Price (ETH)</Th>
                          <Th>Stock</Th>
                          <Th>Status</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {safeProducts.map((product) => (
                          <Tr key={product.id}>
                            <Td fontWeight="bold">{product.id}</Td>
                            <Td>{product.name}</Td>
                            <Td>
                              <Badge colorScheme="blue" variant="subtle">
                                {product.price} ETH
                              </Badge>
                            </Td>
                            <Td>{product.stock}</Td>
                            <Td>
                              <Badge
                                colorScheme={product.stock > 0 ? 'green' : 'red'}
                                variant="solid"
                              >
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <IconButton
                                  size="sm"
                                  icon={<EditIcon />}
                                  onClick={() => openEditModal(product)}
                                  isDisabled={adminLoading}
                                  aria-label="Edit product"
                                />
                                <IconButton
                                  size="sm"
                                  colorScheme="red"
                                  icon={<DeleteIcon />}
                                  onClick={() => openDeleteModal(product)}
                                  isDisabled={adminLoading}
                                  aria-label="Delete product"
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>

                {safeProducts.length === 0 && (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>No products found!</AlertTitle>
                    <AlertDescription>
                      Add your first product to get started.
                    </AlertDescription>
                  </Alert>
                )}
              </VStack>
            </TabPanel>

            {/* Analytics Dashboard Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading size="lg">Analytics Dashboard</Heading>
                  <Button
                    colorScheme="blue"
                    leftIcon={<ViewIcon />}
                    onClick={onLoadAnalytics}
                    isLoading={isLoading}
                    loadingText="Refreshing..."
                  >
                    Refresh Data
                  </Button>
                </HStack>

                {/* Analytics stats */}
                <Box
                  bg={cardBg}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  p={6}
                >
                  <StatGroup>
                    <Stat>
                      <StatLabel>Total Sales</StatLabel>
                      <StatNumber color="green.500">
                        {analytics.totalSales || 0}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Total Revenue</StatLabel>
                      <StatNumber color="blue.500">
                        {analytics.totalRevenue || '0'} ETH
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Active Products</StatLabel>
                      <StatNumber color="purple.500">
                        {analytics.totalProducts || 0}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Contract Balance</StatLabel>
                      <StatNumber color="orange.500">
                        {analytics.contractBalance || '0'} ETH
                      </StatNumber>
                    </Stat>
                  </StatGroup>
                </Box>

                {/* Additional analytics info */}
                <Box
                  bg={cardBg}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  p={6}
                >
                  <VStack align="start" spacing={3}>
                    <Heading size="md">Quick Insights</Heading>
                    <Text>
                      <strong>Average Sale Value:</strong>{' '}
                      {(analytics.totalSales || 0) > 0
                        ? (parseFloat(analytics.totalRevenue || '0') / (analytics.totalSales || 1)).toFixed(4)
                        : '0'}{' '}
                      ETH
                    </Text>
                    <Text>
                      <strong>Most Recent Activity:</strong>{' '}
                      {safeSalesHistory.length > 0
                        ? safeSalesHistory[0].timestamp
                        : 'No sales yet'}
                    </Text>
                    <Text>
                      <strong>Revenue vs Balance:</strong>{' '}
                      {parseFloat(analytics.contractBalance || '0') > 0 ? (
                        <Badge colorScheme="green">Funds Available</Badge>
                      ) : (
                        <Badge colorScheme="yellow">Funds Withdrawn</Badge>
                      )}
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </TabPanel>

            {/* Sales History Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading size="lg">Sales History</Heading>
                  <Text color="gray.500">
                    {safeSalesHistory.length} transactions recorded
                  </Text>
                </HStack>

                {safeSalesHistory.length > 0 ? (
                  <Box
                    bg={cardBg}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    overflow="hidden"
                  >
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Product ID</Th>
                            <Th>Buyer</Th>
                            <Th>Price</Th>
                            <Th>Timestamp</Th>
                            <Th>Block</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {safeSalesHistory.map((sale) => (
                            <Tr key={sale.id}>
                              <Td fontWeight="bold">#{sale.productId}</Td>
                              <Td>
                                <Text fontSize="sm" fontFamily="mono">
                                  {sale.buyer?.slice(0, 6)}...{sale.buyer?.slice(-4)}
                                </Text>
                              </Td>
                              <Td>
                                <Badge colorScheme="green" variant="subtle">
                                  {sale.price} ETH
                                </Badge>
                              </Td>
                              <Td fontSize="sm">{sale.timestamp}</Td>
                              <Td fontSize="sm">#{sale.blockNumber}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>No sales data!</AlertTitle>
                    <AlertDescription>
                      Sales transactions will appear here once customers start purchasing products.
                    </AlertDescription>
                  </Alert>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Add Product Modal */}
        <Modal isOpen={isAddOpen} onClose={onAddClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Product</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Product ID</FormLabel>
                  <NumberInput min={1}>
                    <NumberInputField
                      value={productForm.id}
                      onChange={(e) => setProductForm({...productForm, id: e.target.value})}
                      placeholder="Enter unique product ID"
                    />
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Product Name</FormLabel>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Price (ETH)</FormLabel>
                  <NumberInput min={0} step={0.001}>
                    <NumberInputField
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      placeholder="0.001"
                    />
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Stock</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                      placeholder="Enter stock quantity"
                    />
                  </NumberInput>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAddClose}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleAddProduct}
                isLoading={adminLoading}
                loadingText="Adding..."
              >
                Add Product
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Product Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Product #{selectedProduct?.id}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Product Name</FormLabel>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Price (ETH)</FormLabel>
                  <NumberInput min={0} step={0.001}>
                    <NumberInputField
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      placeholder="0.001"
                    />
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Stock</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                      placeholder="Enter stock quantity"
                    />
                  </NumberInput>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditClose}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleEditProduct}
                isLoading={adminLoading}
                loadingText="Updating..."
              >
                Update Product
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirm Deletion</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Alert status="warning">
                <AlertIcon />
                <Box>
                  <AlertTitle>Are you sure?</AlertTitle>
                  <AlertDescription>
                    This will permanently remove "{selectedProduct?.name}" from the vending machine.
                    This action cannot be undone.
                  </AlertDescription>
                </Box>
              </Alert>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteProduct}
                isLoading={adminLoading}
                loadingText="Removing..."
              >
                Delete Product
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default Admin;