// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Import OpenZeppelin upgradeable contracts for proxy pattern
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./ProductLibrary.sol";

/**
 * @title VendingMachineV2
 * @dev Enhanced vending machine implementation with admin interface and analytics
 * @notice This contract allows users to purchase products and admins to manage them
 * @dev Inherits from OpenZeppelin's upgradeable contracts for future upgrades
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project - V2 Upgrade
 */
contract VendingMachineV2 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    // Use ProductLibrary for product-related operations
    using ProductLibrary for ProductLibrary.Product;
    
    // Storage: mapping from product ID to Product struct (V1 storage - DO NOT MODIFY)
    mapping(uint256 => ProductLibrary.Product) public products;
    // Array to keep track of all product IDs for enumeration (V1 storage - DO NOT MODIFY)
    uint256[] public productIds;
    
    // ========== V2 STORAGE ADDITIONS (MUST BE AFTER V1 STORAGE) ==========
    
    // Analytics storage for tracking sales data
    struct SaleRecord {
        uint256 productId;      // ID of the sold product
        address buyer;          // Address of the buyer
        uint256 price;          // Price paid in wei
        uint256 timestamp;      // Block timestamp of the sale
        uint256 blockNumber;    // Block number of the sale
    }
    
    // Array to store all sales for analytics
    SaleRecord[] public salesHistory;
    
    // Mapping to track total sales per product
    mapping(uint256 => uint256) public productTotalSales;
    
    // Total ETH collected by the contract
    uint256 public totalEthCollected;
    
    // Track when the contract was deployed for analytics
    uint256 public deploymentTimestamp;
    
    // ========== EVENTS ==========
    
    // V1 Events (preserved for compatibility)
    event ProductAdded(uint256 indexed id, string name, uint256 price, uint256 stock);
    event ProductPurchased(uint256 indexed id, address indexed buyer, uint256 price);
    event RefundSent(address indexed buyer, uint256 amount);
    
    // V2 New Events
    event ProductUpdated(uint256 indexed id, string name, uint256 price, uint256 stock);
    event ProductRemoved(uint256 indexed id, string name);
    event SaleRecorded(uint256 indexed saleId, uint256 indexed productId, address indexed buyer, uint256 price, uint256 timestamp);
    
    // ========== MODIFIERS ==========
    
    /**
     * @dev Modifier to restrict access to only the contract owner
     * @notice Used for admin functions like adding/updating/removing products
     */
    modifier onlyAdmin() {
        require(_msgSender() == owner(), "Access denied: Admin only");
        _;
    }
    
    /**
     * @dev Constructor that disables initializers to prevent initialization of implementation contract
     * @notice This is required for UUPS proxy pattern security
     */
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev Initializer function (replaces constructor for upgradeable contracts)
     * @notice This function is called once when the proxy is deployed
     * @dev Initializes OpenZeppelin's Ownable and UUPS modules
     */
    function initialize() public initializer {
        __Ownable_init(); // Initialize ownership functionality
        __UUPSUpgradeable_init(); // Initialize UUPS upgrade functionality
        
        // V2 initialization
        deploymentTimestamp = block.timestamp;
        totalEthCollected = 0;
    }
    
    /**
     * @dev Initializer function for V2 upgrade
     * @notice This function is called during the upgrade to V2
     * @dev Sets up new V2 storage variables
     */
    function initializeV2() public reinitializer(2) {
        // Initialize V2 specific storage
        deploymentTimestamp = block.timestamp;
        totalEthCollected = address(this).balance; // Set current balance as starting point
        
        // No need to initialize arrays and mappings - they start empty
    }
    
    // ========== V1 FUNCTIONS (PRESERVED WITH ENHANCEMENTS) ==========
    
    /**
     * @dev Add a new product in the vending machine (admin only)
     * @param id Unique product identifier (must be > 0)
     * @param name Human-readable product name
     * @param price Product price in wei
     * @param stock Available quantity of the product
     * @notice Only the contract owner can call this function
     * @notice This creates a new product - use updateProduct to modify existing ones
     */
    function addProduct(
        uint256 id, 
        string memory name, 
        uint256 price, 
        uint256 stock
    ) external onlyAdmin {
        // Validate input parameters using ProductLibrary
        require(ProductLibrary.validateProductId(id), "Invalid product ID");
        require(price > 0, "Price must be greater than 0");
        require(bytes(name).length > 0, "Product name cannot be empty");
        require(products[id].id == 0, "Product already exists - use updateProduct instead");
        
        // Add to the tracking array
        productIds.push(id);
        
        // Create and store the product struct
        products[id] = ProductLibrary.Product({
            id: id,
            name: name,
            price: price,
            stock: stock
        });
        
        // Emit event for frontend and logging
        emit ProductAdded(id, name, price, stock);
    }
    
    /**
     * @dev Update an existing product in the vending machine (admin only)
     * @param id Product identifier to update
     * @param name New product name
     * @param price New product price in wei
     * @param stock New stock quantity
     * @notice Only the contract owner can call this function
     * @notice Product must exist to be updated
     */
    function updateProduct(
        uint256 id, 
        string memory name, 
        uint256 price, 
        uint256 stock
    ) external onlyAdmin {
        require(products[id].id != 0, "Product does not exist");
        require(price > 0, "Price must be greater than 0");
        require(bytes(name).length > 0, "Product name cannot be empty");
        
        // Update the product struct
        products[id].name = name;
        products[id].price = price;
        products[id].stock = stock;
        
        // Emit event for frontend and logging
        emit ProductUpdated(id, name, price, stock);
    }
    
    /**
     * @dev Remove a product from the vending machine (admin only)
     * @param id Product identifier to remove
     * @notice Only the contract owner can call this function
     * @notice This completely removes the product from the catalog
     */
    function removeProduct(uint256 id) external onlyAdmin {
        require(products[id].id != 0, "Product does not exist");
        
        string memory productName = products[id].name;
        
        // Remove from productIds array
        for (uint256 i = 0; i < productIds.length; i++) {
            if (productIds[i] == id) {
                productIds[i] = productIds[productIds.length - 1];
                productIds.pop();
                break;
            }
        }
        
        // Delete the product
        delete products[id];
        
        // Emit event for frontend and logging
        emit ProductRemoved(id, productName);
    }
    
    /**
     * @dev Purchase a product from the vending machine (ENHANCED WITH ANALYTICS)
     * @param id The ID of the product to purchase
     * @notice Function is payable - customer must send ETH with the transaction
     * @notice Automatically handles overpayment by sending refund
     * @dev Validates product existence, stock availability, and payment amount
     */
    function buyProduct(uint256 id) external payable {
        // Get reference to the product (storage pointer for gas efficiency)
        ProductLibrary.Product storage product = products[id];
        
        // Validate purchase conditions
        require(product.id != 0, "Product does not exist");
        require(product.stock > 0, "Out of stock");
        require(msg.value >= product.price, "Insufficient payment");
        
        // Update product stock (decrement by 1)
        product.stock -= 1;
        
        // V2 ENHANCEMENT: Record sale for analytics
        salesHistory.push(SaleRecord({
            productId: id,
            buyer: msg.sender,
            price: product.price,
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        
        // Update analytics counters
        productTotalSales[id] += product.price;
        totalEthCollected += product.price;
        
        // Emit V2 analytics event
        emit SaleRecorded(salesHistory.length - 1, id, msg.sender, product.price, block.timestamp);
        
        // Calculate and handle refund if customer overpaid
        uint256 refund = ProductLibrary.calculateRefund(msg.value, product.price);
        if (refund > 0) {
            // Send refund to customer
            payable(msg.sender).transfer(refund);
            emit RefundSent(msg.sender, refund);
        }
        
        // Emit V1 compatible purchase event
        emit ProductPurchased(id, msg.sender, product.price);
    }
    
    // ========== V1 VIEW FUNCTIONS (PRESERVED) ==========
    
    function getProducts() external view returns (ProductLibrary.Product[] memory) {
        ProductLibrary.Product[] memory allProducts = new ProductLibrary.Product[](productIds.length);
        for (uint256 i = 0; i < productIds.length; i++) {
            allProducts[i] = products[productIds[i]];
        }
        return allProducts;
    }
    
    function getProduct(uint256 id) external view returns (ProductLibrary.Product memory) {
        require(products[id].id != 0, "Product does not exist");
        return products[id];
    }
    
    function getProductCount() external view returns (uint256) {
        return productIds.length;
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // ========== V2 NEW ANALYTICS FUNCTIONS ==========
    
    /**
     * @dev Get complete sales history
     * @return Array of all sale records
     * @notice Returns all sales since contract deployment
     */
    function getSalesHistory() external view returns (SaleRecord[] memory) {
        return salesHistory;
    }
    
    /**
     * @dev Get sales history with pagination
     * @param offset Starting index
     * @param limit Maximum number of records to return
     * @return Array of sale records for the specified range
     */
    function getSalesHistoryPaginated(uint256 offset, uint256 limit) 
        external 
        view 
        returns (SaleRecord[] memory) 
    {
        require(offset < salesHistory.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > salesHistory.length) {
            end = salesHistory.length;
        }
        
        SaleRecord[] memory paginatedSales = new SaleRecord[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            paginatedSales[i - offset] = salesHistory[i];
        }
        
        return paginatedSales;
    }
    
    /**
     * @dev Get total number of sales transactions
     * @return Total number of completed sales
     */
    function getTotalSales() external view returns (uint256) {
        return salesHistory.length;
    }
    
    /**
     * @dev Get total ETH revenue for a specific product
     * @param productId The product ID to query
     * @return Total ETH collected from sales of this product
     */
    function getProductRevenue(uint256 productId) external view returns (uint256) {
        return productTotalSales[productId];
    }
    
    /**
     * @dev Get analytics summary
     * @return totalSales Total number of transactions
     * @return totalRevenue Total ETH collected (in wei)
     * @return totalProducts Number of active products
     * @return contractBalance Current contract balance
     */
    function getAnalyticsSummary() external view returns (
        uint256 totalSales,
        uint256 totalRevenue,
        uint256 totalProducts,
        uint256 contractBalance
    ) {
        return (
            salesHistory.length,
            totalEthCollected,
            productIds.length,
            address(this).balance
        );
    }
    
    /**
     * @dev Get sales for a specific time period
     * @param fromTimestamp Start timestamp (inclusive)
     * @param toTimestamp End timestamp (inclusive)
     * @return Array of sale records within the time range
     */
    function getSalesByTimeRange(uint256 fromTimestamp, uint256 toTimestamp) 
        external 
        view 
        returns (SaleRecord[] memory) 
    {
        require(fromTimestamp <= toTimestamp, "Invalid time range");
        
        // First pass: count matching sales
        uint256 matchCount = 0;
        for (uint256 i = 0; i < salesHistory.length; i++) {
            if (salesHistory[i].timestamp >= fromTimestamp && 
                salesHistory[i].timestamp <= toTimestamp) {
                matchCount++;
            }
        }
        
        // Second pass: populate result array
        SaleRecord[] memory filteredSales = new SaleRecord[](matchCount);
        uint256 resultIndex = 0;
        for (uint256 i = 0; i < salesHistory.length; i++) {
            if (salesHistory[i].timestamp >= fromTimestamp && 
                salesHistory[i].timestamp <= toTimestamp) {
                filteredSales[resultIndex] = salesHistory[i];
                resultIndex++;
            }
        }
        
        return filteredSales;
    }
    
    // ========== ADMIN VERIFICATION FUNCTIONS ==========
    
    /**
     * @dev Check if an address is the contract admin/owner
     * @param account Address to check
     * @return True if the address is the contract owner
     */
    function isAdmin(address account) external view returns (bool) {
        return account == owner();
    }
    
    /**
     * @dev Get the current contract owner address
     * @return Address of the contract owner
     */
    function getAdmin() external view returns (address) {
        return owner();
    }
    
    // ========== UUPS UPGRADE AUTHORIZATION ==========
    
    /**
     * @dev Internal function to authorize contract upgrades (UUPS pattern)
     * @param newImplementation Address of the new implementation contract
     * @notice Only the contract owner can authorize upgrades
     * @dev This function is required by UUPSUpgradeable
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    /**
     * @dev Get the current implementation version
     * @return Version identifier for this implementation
     */
    function version() external pure returns (string memory) {
        return "2.0.0";
    }
}