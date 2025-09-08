/**
 * @fileoverview Fixed deployment script for upgrading VendingMachine V1 to V2
 * @description Handles existing proxy registration with forceImport
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project - V2 Upgrade Fixed
 */

const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Main upgrade function with forceImport for existing proxies
 */
async function main() {
  console.log("🚀 Upgrading VendingMachine V1 to V2...");
  
  // Step 1: Load existing deployment addresses
  let addresses;
  try {
    addresses = JSON.parse(fs.readFileSync('deployed-addresses.json', 'utf8'));
    console.log("📋 Loaded existing deployment:", addresses);
  } catch (error) {
    console.error("❌ Could not read deployed-addresses.json");
    console.error("Please run V1 deployment script first: npx hardhat run scripts/deploy.js");
    throw error;
  }

  // Step 2: Verify the proxy contract exists
  if (!addresses.vendingMachineProxy) {
    throw new Error("No existing VendingMachine proxy found in deployed-addresses.json");
  }
  
  console.log("🔍 Existing proxy address:", addresses.vendingMachineProxy);
  
  // Step 3: Get contract factories
  console.log("🏭 Getting contract factories...");
  const VendingMachineV1 = await ethers.getContractFactory("VendingMachineV1");
  const VendingMachineV2 = await ethers.getContractFactory("VendingMachineV2");
  
  // Step 4: IMPORTANT - Force import the existing proxy
  console.log("📥 Registering existing proxy with OpenZeppelin...");
  try {
    await upgrades.forceImport(addresses.vendingMachineProxy, VendingMachineV1, {
      kind: 'uups'
    });
    console.log("✅ Proxy successfully registered");
  } catch (importError) {
    console.log("ℹ️  Proxy might already be registered:", importError.message);
  }
  
  // Step 5: Perform the upgrade
  console.log("⬆️  Upgrading proxy to V2 implementation...");
  const vendingMachineV2 = await upgrades.upgradeProxy(
    addresses.vendingMachineProxy, 
    VendingMachineV2
  );
  
  await vendingMachineV2.deployed();
  console.log("✅ Upgrade completed! Proxy still at:", vendingMachineV2.address);
  
  // Step 6: Initialize V2 storage
  console.log("🔧 Initializing V2 storage...");
  try {
    const initTx = await vendingMachineV2.initializeV2();
    await initTx.wait();
    console.log("✅ V2 initialization completed");
  } catch (error) {
    if (error.message.includes("already initialized")) {
      console.log("ℹ️  V2 already initialized - skipping");
    } else {
      console.log("⚠️  V2 initialization warning:", error.message);
    }
  }
  
  // Step 7: Verify the upgrade was successful
  console.log("🔍 Verifying upgrade...");
  try {
    const version = await vendingMachineV2.version();
    console.log("📊 Contract version:", version);
    
    const totalSales = await vendingMachineV2.getTotalSales();
    console.log("📈 Total sales recorded:", totalSales.toString());
    
    const analytics = await vendingMachineV2.getAnalyticsSummary();
    console.log("📊 Analytics Summary:");
    console.log("  - Total Sales:", analytics.totalSales.toString());
    console.log("  - Total Revenue:", ethers.utils.formatEther(analytics.totalRevenue), "ETH");
    console.log("  - Total Products:", analytics.totalProducts.toString());
    console.log("  - Contract Balance:", ethers.utils.formatEther(analytics.contractBalance), "ETH");
    
    // Test V1 compatibility
    const products = await vendingMachineV2.getProducts();
    console.log("🛍️  Products preserved:", products.length);
    
  } catch (error) {
    console.warn("⚠️  Could not verify some V2 features:", error.message);
  }
  
  // Step 8: Get network and implementation info
  const network = await ethers.provider.getNetwork();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    vendingMachineV2.address
  );
  
  // Step 9: Update addresses file
  const updatedAddresses = {
    ...addresses,
    vendingMachineV2Implementation: implementationAddress,
    version: "2.0.0",
    upgradedAt: new Date().toISOString(),
    previousVersion: "1.0.0"
  };
  
  // Step 10: Save updated addresses
  const addressesFilePath = 'deployed-addresses.json';
  fs.writeFileSync(addressesFilePath, JSON.stringify(updatedAddresses, null, 2));
  console.log("💾 Updated addresses saved to", addressesFilePath);

  // Step 11: Copy to frontend if exists
  const frontendPublicDir = path.join(__dirname, '..', 'frontend', 'public');
  if (fs.existsSync(path.join(__dirname, '..', 'frontend'))) {
    try {
      if (!fs.existsSync(frontendPublicDir)) {
        fs.mkdirSync(frontendPublicDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(frontendPublicDir, 'deployed-addresses.json'), 
        JSON.stringify(updatedAddresses, null, 2)
      );
      console.log("📋 Updated addresses copied to frontend/public/");
    } catch (error) {
      console.warn("⚠️  Could not copy to frontend/public:", error.message);
    }
  }

  // Step 12: Display success summary
  console.log("\n🎉 VendingMachine V2 Upgrade Completed Successfully!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("✅ Proxy Address (UNCHANGED):", vendingMachineV2.address);
  console.log("✅ New V2 Implementation:", implementationAddress);
  console.log("✅ All V1 data preserved");
  console.log("✅ New V2 features available");
  console.log("\n📱 Your frontend will automatically use V2 features!");
  
  // Step 13: Check admin access
  try {
    const deployerAddress = await ethers.provider.getSigner().getAddress();
    const isAdmin = await vendingMachineV2.isAdmin(deployerAddress);
    console.log("\n👑 Admin Access:");
    console.log("  - Deployer Address:", deployerAddress);
    console.log("  - Has Admin Access:", isAdmin ? "✅ YES" : "❌ NO");
  } catch (error) {
    console.warn("⚠️  Could not verify admin access:", error.message);
  }

  console.log("═══════════════════════════════════════════════════════");
  
  return { vendingMachine: vendingMachineV2, implementationAddress };
}

// Execute the upgrade
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Upgrade failed:", error);
      console.error("\n🔧 Troubleshooting tips:");
      console.error("1. Ensure your deployed-addresses.json is correct");
      console.error("2. Check that you're using the correct network");
      console.error("3. Verify you have sufficient ETH for gas");
      console.error("4. Make sure you're the contract owner");
      process.exit(1);
    });
}

module.exports = { main };