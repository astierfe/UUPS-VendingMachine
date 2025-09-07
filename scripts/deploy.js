/**
 * @fileoverview Deployment script for VendingMachine V1 smart contracts
 * @description Deploys ProductLibrary and VendingMachineV1 using UUPS proxy pattern
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project
 */

const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Main deployment function
 * @async
 * @function main
 * @description Deploys ProductLibrary and VendingMachine contracts with proxy
 * @returns {Promise<Object>} Object containing deployed contract instances
 */
async function main() {
  console.log("🚀 Deploying VendingMachine V1...");
  
  // Step 1: Deploy the ProductLibrary
  // This library contains utility functions for product operations
  console.log("📚 Deploying ProductLibrary...");
  const ProductLibrary = await ethers.getContractFactory("ProductLibrary");
  const productLibrary = await ProductLibrary.deploy();
  await productLibrary.deployed(); // Wait for deployment confirmation (ethers v5 syntax)
  console.log("📚 ProductLibrary deployed at:", productLibrary.address);
  
  // Step 2: Deploy VendingMachine with UUPS upgradeable proxy
  // This creates both implementation and proxy contracts
  console.log("🏪 Deploying VendingMachine V1 with UUPS proxy...");
  const VendingMachineV1 = await ethers.getContractFactory("VendingMachineV1");
  
  // deployProxy automatically:
  // 1. Deploys the implementation contract
  // 2. Deploys the proxy contract
  // 3. Calls the initialize function on the proxy
  const vendingMachine = await upgrades.deployProxy(VendingMachineV1, [], {
    initializer: 'initialize', // Function to call after deployment
  });
  await vendingMachine.deployed(); // Wait for proxy deployment confirmation

  console.log("🏪 VendingMachine V1 (Proxy) deployed at:", vendingMachine.address);
  
  // Step 3: Get network information for configuration
  const network = await ethers.provider.getNetwork();
  
  // Step 4: Create addresses configuration object
  // This object contains all important deployment information
  const addresses = {
    productLibrary: productLibrary.address,        // Library contract address
    vendingMachineProxy: vendingMachine.address,   // Proxy contract address (main interface)
    network: hre.network.name,                     // Network name (localhost, sepolia, etc.)
    chainId: network.chainId,                      // Chain ID for network identification
    deployedAt: new Date().toISOString()          // Deployment timestamp
  };
  
  // Step 5: Save addresses to JSON file for frontend and other scripts
  const addressesFilePath = 'deployed-addresses.json';
  fs.writeFileSync(addressesFilePath, JSON.stringify(addresses, null, 2));
  console.log("📝 Addresses saved to", addressesFilePath);

  // Step 6: Copy addresses to frontend public directory if it exists
  // This allows the frontend to automatically detect the contract address
  const frontendPublicDir = path.join(__dirname, '..', 'frontend', 'public');
  if (fs.existsSync(path.join(__dirname, '..', 'frontend'))) {
    try {
      // Create public directory if it doesn't exist
      if (!fs.existsSync(frontendPublicDir)) {
        fs.mkdirSync(frontendPublicDir, { recursive: true });
      }
      
      // Copy addresses file to frontend public directory
      fs.writeFileSync(
        path.join(frontendPublicDir, 'deployed-addresses.json'), 
        JSON.stringify(addresses, null, 2)
      );
      console.log("📋 Addresses copied to frontend/public/deployed-addresses.json");
    } catch (error) {
      console.warn("⚠️ Could not copy to frontend/public:", error.message);
    }
  }

  // Step 7: Display MetaMask configuration for local development
  if (hre.network.name === "localhost") {
    console.log("\n🦊 MetaMask configuration for local network:");
    console.log("- Network Name: Hardhat Local");
    console.log("- RPC URL: http://127.0.0.1:8545");
    console.log("- Chain ID: 31337");
    console.log("- Currency Symbol: ETH");
    console.log("- Block Explorer URL: (optional)");
    console.log("\n💡 Import one of the private keys from 'npx hardhat node' into MetaMask");
  }

  // Return deployed contract instances for use in tests or other scripts
  return { vendingMachine, productLibrary };
}

// Execute the deployment if this script is run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))  // Exit successfully
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);            // Exit with error code
    });
}

// Export the main function for use in other scripts
module.exports = { main };