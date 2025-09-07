// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Import OpenZeppelin upgradeable contracts for proxy pattern
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./ProductLibrary.sol";

/**
 * @title VendingMachineV1
 * @dev A decentralized vending machine implementation using UUPS proxy pattern
 * @notice This contract allows users to purchase products using ETH
 * @dev Inherits from OpenZeppelin's upgradeable contracts for future upgrades
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project
 */
contract VendingMachineV1 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    // Use ProductLibrary for product-related operations
    using ProductLibrary for ProductLibrary.Product;
    
    // Storage: mapping from product ID to Product struct
    mapping(uint256 => ProductLibrary.Product) public products;
    // Array to keep track of all product IDs for enumeration
    uint256[] public productIds;
    
    // Events emitted by the contract for frontend integration and logging
    /**
     * @dev Emitted when a new product is added or updated
     * @param id The unique product identifier
     * @param name The product name
     * @param price The product price in wei
     * @param stock The available stock quantity
     */
    event ProductAdded(uint256 indexed id, string name, uint256 price, uint256 stock);
    
    /**
     * @dev Emitted when a product is successfully purchased
     * @param id The product ID that was purchased
     * @param buyer The address of the buyer
     * @param price The price paid for the product in wei
     */
    event ProductPurchased(uint256 indexed id, address indexed buyer, uint256 price);
    
    /**
     * @dev Emitted when a refund is sent to a buyer (overpayment)
     * @param buyer The address receiving the refund
     * @param amount The refund amount in wei
     */
    event RefundSent(address indexed buyer, uint256 amount);
    
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
    }
    
    /**
     * @dev Add or update a product in the vending machine (admin only)
     * @param id Unique product identifier (must be > 0)
     * @param name Human-readable product name
     * @param price Product price in wei
     * @param stock Available quantity of the product
     * @notice Only the contract owner can call this function
     * @notice If product ID already exists, it will be updated; otherwise, it will be added
     */
    function addProduct(
        uint256 id, 
        string memory name, 
        uint256 price, 
        uint256 stock
    ) external onlyOwner {
        // Validate input parameters using ProductLibrary
        require(ProductLibrary.validateProductId(id), "Invalid product ID");
        require(price > 0, "Price must be greater than 0");
        
        // If this is a new product (ID doesn't exist), add it to the tracking array
        if (products[id].id == 0) {
            productIds.push(id);
        }
        
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
     * @dev Purchase a product from the vending machine
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
        
        // Calculate and handle refund if customer overpaid
        uint256 refund = ProductLibrary.calculateRefund(msg.value, product.price);
        if (refund > 0) {
            // Send refund to customer
            payable(msg.sender).transfer(refund);
            emit RefundSent(msg.sender, refund);
        }
        
        // Emit purchase event
        emit ProductPurchased(id, msg.sender, product.price);
    }
    
    /**
     * @dev Get all products in the vending machine
     * @return Array of all Product structs
     * @notice This function returns the complete product catalog
     * @dev Uses memory array for gas efficiency in view function
     */
    function getProducts() external view returns (ProductLibrary.Product[] memory) {
        // Create memory array with the correct size
        ProductLibrary.Product[] memory allProducts = new ProductLibrary.Product[](productIds.length);
        
        // Populate the array with product data
        for (uint256 i = 0; i < productIds.length; i++) {
            allProducts[i] = products[productIds[i]];
        }
        
        return allProducts;
    }
    
    /**
     * @dev Get a specific product by its ID
     * @param id The product ID to retrieve
     * @return The Product struct for the specified ID
     * @notice Reverts if product doesn't exist
     */
    function getProduct(uint256 id) external view returns (ProductLibrary.Product memory) {
        require(products[id].id != 0, "Product does not exist");
        return products[id];
    }
    
    /**
     * @dev Get the total number of products in the catalog
     * @return The count of products
     * @notice Useful for pagination and UI display
     */
    function getProductCount() external view returns (uint256) {
        return productIds.length;
    }
    
    /**
     * @dev Withdraw all contract funds (owner only)
     * @notice Only the contract owner can withdraw funds
     * @notice Transfers the entire contract balance to the owner
     * @dev Security: Uses owner() function to get current owner address
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Internal function to authorize contract upgrades (UUPS pattern)
     * @param newImplementation Address of the new implementation contract
     * @notice Only the contract owner can authorize upgrades
     * @dev This function is required by UUPSUpgradeable
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}