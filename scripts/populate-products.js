/**
 * @fileoverview Product population script for VendingMachine V1
 * @description Reads product data from CSV file and populates the deployed contract
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project
 */

const { ethers } = require("hardhat");
const fs = require('fs');
const csv = require('csv-parser');

/**
 * Populate products from CSV file into the deployed VendingMachine contract
 * @async
 * @function populateFromCSV
 * @description Reads products.csv and adds each product to the smart contract
 * @returns {Promise<void>} Resolves when all products are added successfully
 */
async function populateFromCSV() {
  console.log("📦 Populating products from CSV...");

  // Step 1: Load the deployed contract address from the addresses file
  let addresses;
  try {
    addresses = JSON.parse(fs.readFileSync('deployed-addresses.json', 'utf8'));
  } catch (error) {
    console.error("❌ Could not read deployed-addresses.json");
    console.error("Please run deployment script first: npx hardhat run scripts/deploy.js");
    throw error;
  }

  // Step 2: Connect to the deployed VendingMachine contract
  console.log("🔗 Connecting to VendingMachine at:", addresses.vendingMachineProxy);
  const VendingMachineV1 = await ethers.getContractFactory("VendingMachineV1");
  const vendingMachine = VendingMachineV1.attach(addresses.vendingMachineProxy);

  // Step 3: Read and parse the CSV file
  const products = []; // Array to store parsed product data

  return new Promise((resolve, reject) => {
    // Create a readable stream from the CSV file
    fs.createReadStream('data/products.csv')
      .pipe(csv()) // Parse CSV format
      .on('data', (row) => {
        // Process each row from the CSV file
        // Convert string values to appropriate types
        products.push({
          id: parseInt(row.id),                           // Convert to integer
          name: row.name,                                 // Keep as string
          price: ethers.utils.parseEther(row.price),     // Convert ETH string to wei (ethers v5)
          stock: parseInt(row.stock)                      // Convert to integer
        });
      })
      .on('end', async () => {
        // Step 4: Process all products after CSV parsing is complete
        console.log(`📊 Found ${products.length} products in CSV file`);

        // Add each product to the smart contract
        for (const product of products) {
          try {
            console.log(`➕ Adding ${product.name}...`);
            
            // Call the addProduct function on the smart contract
            // This requires owner permissions
            const tx = await vendingMachine.addProduct(
              product.id,      // Product ID
              product.name,    // Product name
              product.price,   // Product price in wei
              product.stock    // Initial stock quantity
            );
            
            // Wait for the transaction to be mined
            await tx.wait();
            console.log(`✅ ${product.name} added successfully`);
            
          } catch (error) {
            // Log errors but continue with other products
            console.error(`❌ Error adding ${product.name}:`, error.message);
            
            // Common error messages and their meanings:
            // - "Ownable: caller is not the owner" = Not deploying from owner account
            // - "Invalid product ID" = Product ID is 0 or invalid
            // - "Price must be greater than 0" = Price validation failed
          }
        }

        // Step 5: Verify the population was successful
        try {
          const totalProducts = await vendingMachine.getProductCount();
          console.log(`📈 Total products in contract: ${totalProducts}`);
          
          // Optional: Display first product for verification
          if (totalProducts > 0) {
            const firstProduct = await vendingMachine.getProduct(products[0].id);
            console.log(`🔍 First product verification: ${firstProduct.name} - ${ethers.utils.formatEther(firstProduct.price)} ETH`);
          }
        } catch (error) {
          console.warn("⚠️ Could not verify product count:", error.message);
        }

        console.log("🎉 Product population completed!");
        resolve();
      })
      .on('error', (error) => {
        // Handle CSV reading errors
        console.error("❌ Error reading CSV file:", error);
        reject(error);
      });
  });
}

// Execute the population if this script is run directly
if (require.main === module) {
  populateFromCSV()
    .then(() => process.exit(0))  // Exit successfully
    .catch((error) => {
      console.error("❌ Population failed:", error);
      process.exit(1);            // Exit with error code
    });
}

// Export the function for use in other scripts
module.exports = { populateFromCSV };