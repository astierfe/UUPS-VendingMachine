// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ProductLibrary
 * @dev Library containing utility functions for product operations in the vending machine
 * @notice This library provides reusable functions for product validation and calculations
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project
 */
library ProductLibrary {
    /**
     * @dev Structure representing a product in the vending machine
     * @param id Unique identifier for the product (must be > 0)
     * @param name Human-readable name of the product
     * @param price Price of the product in wei (smallest unit of ETH)
     * @param stock Available quantity of the product
     */
    struct Product {
        uint256 id;
        string name;
        uint256 price; // Price in wei
        uint256 stock;
    }
    
    /**
     * @dev Calculates the total ETH amount to pay for a quantity of products
     * @param price Unit price of the product in wei
     * @param quantity Number of products to purchase
     * @return Total amount in wei (price * quantity)
     * @notice This is a pure function that performs simple multiplication
     */
    function calculateTotal(uint256 price, uint256 quantity) 
        internal 
        pure 
        returns (uint256) 
    {
        return price * quantity;
    }
    
    /**
     * @dev Validates that a product has sufficient stock for purchase
     * @param product The product struct to validate
     * @param quantity The desired quantity to purchase
     * @return bool True if stock is sufficient, false otherwise
     * @notice Used to prevent purchases when stock is insufficient
     */
    function validateStock(Product memory product, uint256 quantity) 
        internal 
        pure 
        returns (bool) 
    {
        return product.stock >= quantity;
    }
    
    /**
     * @dev Validates that a product ID is valid (greater than 0)
     * @param productId The product ID to validate
     * @return bool True if ID is valid (> 0), false otherwise
     * @notice Product ID 0 is reserved to indicate non-existent products
     */
    function validateProductId(uint256 productId) 
        internal 
        pure 
        returns (bool) 
    {
        return productId > 0;
    }
    
    /**
     * @dev Calculates the refund amount when customer overpays
     * @param paidAmount The amount paid by the customer in wei
     * @param requiredAmount The actual price of the product in wei
     * @return The refund amount (paidAmount - requiredAmount)
     * @notice Reverts with "Insufficient payment" if paid amount is less than required
     */
    function calculateRefund(uint256 paidAmount, uint256 requiredAmount) 
        internal 
        pure 
        returns (uint256) 
    {
        require(paidAmount >= requiredAmount, "Insufficient payment");
        return paidAmount - requiredAmount;
    }
}