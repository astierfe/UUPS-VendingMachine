# Solidity API

## Table of Contents
- [ProductLibrary](#productlibrary)
  - [Structures](#product)
  - [Functions](#calculatetotal)
- [VendingMachineV1](#vendingmachinev1)
  - [Contract State](#products)
  - [Events](#productadded)
  - [Public Functions](#initialize)
- [VendingMachineV2](#vendingmachinev2)
  - [Contract State](#products-1)
  - [Structures](#salerecord)
  - [Events](#productadded-1)
  - [Administrative Functions](#addproduct-1)
  - [Public Functions](#buyproduct-1)
  - [View Functions](#getproducts-1)
  - [Analytics Functions](#getsaleshistory)

## ProductLibrary

This library provides reusable functions for product validation and calculations

_Library containing utility functions for product operations in the vending machine_



### Product

```solidity
struct Product {
  uint256 id;
  string name;
  uint256 price;
  uint256 stock;
}
```

### calculateTotal

```solidity
function calculateTotal(uint256 price, uint256 quantity) internal pure returns (uint256)
```

This is a pure function that performs simple multiplication

_Calculates the total ETH amount to pay for a quantity of products_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| price | uint256 | Unit price of the product in wei |
| quantity | uint256 | Number of products to purchase |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Total amount in wei (price * quantity) |

### validateStock

```solidity
function validateStock(struct ProductLibrary.Product product, uint256 quantity) internal pure returns (bool)
```

Used to prevent purchases when stock is insufficient

_Validates that a product has sufficient stock for purchase_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| product | struct ProductLibrary.Product | The product struct to validate |
| quantity | uint256 | The desired quantity to purchase |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool True if stock is sufficient, false otherwise |

### validateProductId

```solidity
function validateProductId(uint256 productId) internal pure returns (bool)
```

Product ID 0 is reserved to indicate non-existent products

_Validates that a product ID is valid (greater than 0)_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| productId | uint256 | The product ID to validate |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool True if ID is valid (> 0), false otherwise |

### calculateRefund

```solidity
function calculateRefund(uint256 paidAmount, uint256 requiredAmount) internal pure returns (uint256)
```

Reverts with "Insufficient payment" if paid amount is less than required

_Calculates the refund amount when customer overpays_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| paidAmount | uint256 | The amount paid by the customer in wei |
| requiredAmount | uint256 | The actual price of the product in wei |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The refund amount (paidAmount - requiredAmount) |

## VendingMachineV1

This contract allows users to purchase products using ETH

_A decentralized vending machine implementation using UUPS proxy pattern
Inherits from OpenZeppelin's upgradeable contracts for future upgrades_

### products

```solidity
mapping(uint256 => struct ProductLibrary.Product) products
```

### productIds

```solidity
uint256[] productIds
```

### ProductAdded

```solidity
event ProductAdded(uint256 id, string name, uint256 price, uint256 stock)
```

_Emitted when a new product is added or updated_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The unique product identifier |
| name | string | The product name |
| price | uint256 | The product price in wei |
| stock | uint256 | The available stock quantity |

### ProductPurchased

```solidity
event ProductPurchased(uint256 id, address buyer, uint256 price)
```

_Emitted when a product is successfully purchased_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The product ID that was purchased |
| buyer | address | The address of the buyer |
| price | uint256 | The price paid for the product in wei |

### RefundSent

```solidity
event RefundSent(address buyer, uint256 amount)
```

_Emitted when a refund is sent to a buyer (overpayment)_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| buyer | address | The address receiving the refund |
| amount | uint256 | The refund amount in wei |

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize() public
```

This function is called once when the proxy is deployed

_Initializer function (replaces constructor for upgradeable contracts)
Initializes OpenZeppelin's Ownable and UUPS modules_

### addProduct

```solidity
function addProduct(uint256 id, string name, uint256 price, uint256 stock) external
```

Only the contract owner can call this function
If product ID already exists, it will be updated; otherwise, it will be added

_Add or update a product in the vending machine (admin only)_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | Unique product identifier (must be > 0) |
| name | string | Human-readable product name |
| price | uint256 | Product price in wei |
| stock | uint256 | Available quantity of the product |

### buyProduct

```solidity
function buyProduct(uint256 id) external payable
```

Function is payable - customer must send ETH with the transaction
Automatically handles overpayment by sending refund

_Purchase a product from the vending machine
Validates product existence, stock availability, and payment amount_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The ID of the product to purchase |

### getProducts

```solidity
function getProducts() external view returns (struct ProductLibrary.Product[])
```

This function returns the complete product catalog

_Get all products in the vending machine
Uses memory array for gas efficiency in view function_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct ProductLibrary.Product[] | Array of all Product structs |

### getProduct

```solidity
function getProduct(uint256 id) external view returns (struct ProductLibrary.Product)
```

Reverts if product doesn't exist

_Get a specific product by its ID_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The product ID to retrieve |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct ProductLibrary.Product | The Product struct for the specified ID |

### getProductCount

```solidity
function getProductCount() external view returns (uint256)
```

Useful for pagination and UI display

_Get the total number of products in the catalog_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The count of products |

### withdraw

```solidity
function withdraw() external
```

Only the contract owner can withdraw funds
Transfers the entire contract balance to the owner

_Withdraw all contract funds (owner only)
Security: Uses owner() function to get current owner address_

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

Only the contract owner can authorize upgrades

_Internal function to authorize contract upgrades (UUPS pattern)
This function is required by UUPSUpgradeable_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newImplementation | address | Address of the new implementation contract |

## VendingMachineV2

This contract allows users to purchase products and admins to manage them

_Enhanced vending machine implementation with admin interface and analytics
Inherits from OpenZeppelin's upgradeable contracts for future upgrades_

### products

```solidity
mapping(uint256 => struct ProductLibrary.Product) products
```

### productIds

```solidity
uint256[] productIds
```

### SaleRecord

```solidity
struct SaleRecord {
  uint256 productId;
  address buyer;
  uint256 price;
  uint256 timestamp;
  uint256 blockNumber;
}
```

### salesHistory

```solidity
struct VendingMachineV2.SaleRecord[] salesHistory
```

### productTotalSales

```solidity
mapping(uint256 => uint256) productTotalSales
```

### totalEthCollected

```solidity
uint256 totalEthCollected
```

### deploymentTimestamp

```solidity
uint256 deploymentTimestamp
```

### ProductAdded

```solidity
event ProductAdded(uint256 id, string name, uint256 price, uint256 stock)
```

### ProductPurchased

```solidity
event ProductPurchased(uint256 id, address buyer, uint256 price)
```

### RefundSent

```solidity
event RefundSent(address buyer, uint256 amount)
```

### ProductUpdated

```solidity
event ProductUpdated(uint256 id, string name, uint256 price, uint256 stock)
```

### ProductRemoved

```solidity
event ProductRemoved(uint256 id, string name)
```

### SaleRecorded

```solidity
event SaleRecorded(uint256 saleId, uint256 productId, address buyer, uint256 price, uint256 timestamp)
```

### onlyAdmin

```solidity
modifier onlyAdmin()
```

Used for admin functions like adding/updating/removing products

_Modifier to restrict access to only the contract owner_

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize() public
```

This function is called once when the proxy is deployed

_Initializer function (replaces constructor for upgradeable contracts)
Initializes OpenZeppelin's Ownable and UUPS modules_

### initializeV2

```solidity
function initializeV2() public
```

This function is called during the upgrade to V2

_Initializer function for V2 upgrade
Sets up new V2 storage variables_

### addProduct

```solidity
function addProduct(uint256 id, string name, uint256 price, uint256 stock) external
```

Only the contract owner can call this function
This creates a new product - use updateProduct to modify existing ones

_Add a new product in the vending machine (admin only)_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | Unique product identifier (must be > 0) |
| name | string | Human-readable product name |
| price | uint256 | Product price in wei |
| stock | uint256 | Available quantity of the product |

### updateProduct

```solidity
function updateProduct(uint256 id, string name, uint256 price, uint256 stock) external
```

Only the contract owner can call this function
Product must exist to be updated

_Update an existing product in the vending machine (admin only)_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | Product identifier to update |
| name | string | New product name |
| price | uint256 | New product price in wei |
| stock | uint256 | New stock quantity |

### removeProduct

```solidity
function removeProduct(uint256 id) external
```

Only the contract owner can call this function
This completely removes the product from the catalog

_Remove a product from the vending machine (admin only)_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | Product identifier to remove |

### buyProduct

```solidity
function buyProduct(uint256 id) external payable
```

Function is payable - customer must send ETH with the transaction
Automatically handles overpayment by sending refund

_Purchase a product from the vending machine (ENHANCED WITH ANALYTICS)
Validates product existence, stock availability, and payment amount_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint256 | The ID of the product to purchase |

### getProducts

```solidity
function getProducts() external view returns (struct ProductLibrary.Product[])
```

### getProduct

```solidity
function getProduct(uint256 id) external view returns (struct ProductLibrary.Product)
```

### getProductCount

```solidity
function getProductCount() external view returns (uint256)
```

### withdraw

```solidity
function withdraw() external
```

### getSalesHistory

```solidity
function getSalesHistory() external view returns (struct VendingMachineV2.SaleRecord[])
```

Returns all sales since contract deployment

_Get complete sales history_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct VendingMachineV2.SaleRecord[] | Array of all sale records |

### getSalesHistoryPaginated

```solidity
function getSalesHistoryPaginated(uint256 offset, uint256 limit) external view returns (struct VendingMachineV2.SaleRecord[])
```

_Get sales history with pagination_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| offset | uint256 | Starting index |
| limit | uint256 | Maximum number of records to return |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct VendingMachineV2.SaleRecord[] | Array of sale records for the specified range |

### getTotalSales

```solidity
function getTotalSales() external view returns (uint256)
```

_Get total number of sales transactions_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Total number of completed sales |

### getProductRevenue

```solidity
function getProductRevenue(uint256 productId) external view returns (uint256)
```

_Get total ETH revenue for a specific product_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| productId | uint256 | The product ID to query |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Total ETH collected from sales of this product |

### getAnalyticsSummary

```solidity
function getAnalyticsSummary() external view returns (uint256 totalSales, uint256 totalRevenue, uint256 totalProducts, uint256 contractBalance)
```

_Get analytics summary_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| totalSales | uint256 | Total number of transactions |
| totalRevenue | uint256 | Total ETH collected (in wei) |
| totalProducts | uint256 | Number of active products |
| contractBalance | uint256 | Current contract balance |

### getSalesByTimeRange

```solidity
function getSalesByTimeRange(uint256 fromTimestamp, uint256 toTimestamp) external view returns (struct VendingMachineV2.SaleRecord[])
```

_Get sales for a specific time period_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| fromTimestamp | uint256 | Start timestamp (inclusive) |
| toTimestamp | uint256 | End timestamp (inclusive) |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct VendingMachineV2.SaleRecord[] | Array of sale records within the time range |

### isAdmin

```solidity
function isAdmin(address account) external view returns (bool)
```

_Check if an address is the contract admin/owner_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | Address to check |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the address is the contract owner |

### getAdmin

```solidity
function getAdmin() external view returns (address)
```

_Get the current contract owner address_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Address of the contract owner |

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

Only the contract owner can authorize upgrades

_Internal function to authorize contract upgrades (UUPS pattern)
This function is required by UUPSUpgradeable_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newImplementation | address | Address of the new implementation contract |

### version

```solidity
function version() external pure returns (string)
```

_Get the current implementation version_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | Version identifier for this implementation |

