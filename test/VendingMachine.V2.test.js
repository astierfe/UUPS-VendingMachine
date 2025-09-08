/**
 * @fileoverview Comprehensive test suite for VendingMachine V2
 * @description Tests V1 compatibility, V2 new features, upgrade process, and admin functionality
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project - V2 Tests
 */

const chai = require("chai");
const { expect } = chai;
const { ethers, upgrades } = require("hardhat");
const waffle = require("ethereum-waffle");

chai.use(waffle.solidity);

describe("VendingMachine V2", function () {
  let vendingMachineV1;
  let vendingMachineV2;
  let owner;
  let buyer;
  let nonAdmin;

  // Test data constants
  const PRODUCT_PRICE = ethers.utils.parseEther("0.01");
  const PRODUCT_PRICE_2 = ethers.utils.parseEther("0.005");
  const INITIAL_STOCK = 10;

  beforeEach(async function () {
    [owner, buyer, nonAdmin] = await ethers.getSigners();

    // Deploy V1 first (simulating existing deployment)
    const VendingMachineV1 = await ethers.getContractFactory("VendingMachineV1");
    vendingMachineV1 = await upgrades.deployProxy(VendingMachineV1, [], {
      initializer: "initialize",
    });
    await vendingMachineV1.deployed();

    // Add some V1 products for testing compatibility
    await vendingMachineV1.addProduct(1, "V1 Coca Cola", PRODUCT_PRICE, INITIAL_STOCK);
    await vendingMachineV1.addProduct(2, "V1 Chips", PRODUCT_PRICE_2, 5);

    // Make a V1 purchase to test data preservation
    await vendingMachineV1.connect(buyer).buyProduct(1, { value: PRODUCT_PRICE });

    // Upgrade to V2
    const VendingMachineV2 = await ethers.getContractFactory("VendingMachineV2");
    vendingMachineV2 = await upgrades.upgradeProxy(vendingMachineV1.address, VendingMachineV2);
    await vendingMachineV2.deployed();

    // Initialize V2 storage
    await vendingMachineV2.initializeV2();
  });

  describe("Upgrade Process & Compatibility", function () {
    it("Should preserve contract address after upgrade", async function () {
      expect(vendingMachineV2.address).to.equal(vendingMachineV1.address);
    });

    it("Should report correct V2 version", async function () {
      const version = await vendingMachineV2.version();
      expect(version).to.equal("2.0.0");
    });

    it("Should preserve V1 products after upgrade", async function () {
      const products = await vendingMachineV2.getProducts();
      expect(products.length).to.equal(2);
      expect(products[0].name).to.equal("V1 Coca Cola");
      expect(products[0].stock).to.equal(INITIAL_STOCK - 1); // One was purchased
      expect(products[1].name).to.equal("V1 Chips");
    });

    it("Should preserve contract balance after upgrade", async function () {
      const balance = await ethers.provider.getBalance(vendingMachineV2.address);
      expect(balance).to.equal(PRODUCT_PRICE); // From V1 purchase
    });

    it("Should maintain V1 function compatibility", async function () {
      // Test V1 functions still work
      const productCount = await vendingMachineV2.getProductCount();
      expect(productCount).to.equal(2);

      const product = await vendingMachineV2.getProduct(1);
      expect(product.name).to.equal("V1 Coca Cola");

      // Test V1 purchase still works
      await expect(
        vendingMachineV2.connect(buyer).buyProduct(2, { value: PRODUCT_PRICE_2 })
      ).to.emit(vendingMachineV2, "ProductPurchased");
    });
  });

  describe("V2 Admin Access Control", function () {
    it("Should correctly identify admin", async function () {
      expect(await vendingMachineV2.isAdmin(owner.address)).to.be.true;
      expect(await vendingMachineV2.isAdmin(buyer.address)).to.be.false;
      expect(await vendingMachineV2.isAdmin(nonAdmin.address)).to.be.false;
    });

    it("Should return correct admin address", async function () {
      const adminAddress = await vendingMachineV2.getAdmin();
      expect(adminAddress).to.equal(owner.address);
    });

    it("Should reject admin functions from non-admin", async function () {
      await expect(
        vendingMachineV2.connect(nonAdmin).addProduct(10, "Unauthorized", PRODUCT_PRICE, 5)
      ).to.be.revertedWith("Access denied: Admin only");

      await expect(
        vendingMachineV2.connect(nonAdmin).updateProduct(1, "Hacked", PRODUCT_PRICE, 1)
      ).to.be.revertedWith("Access denied: Admin only");

      await expect(
        vendingMachineV2.connect(nonAdmin).removeProduct(1)
      ).to.be.revertedWith("Access denied: Admin only");
    });
  });

  describe("V2 Product Management (Admin Functions)", function () {
    describe("Add Product (Enhanced)", function () {
      it("Should add new product successfully", async function () {
        await expect(
          vendingMachineV2.addProduct(10, "V2 Energy Drink", PRODUCT_PRICE, 15)
        )
          .to.emit(vendingMachineV2, "ProductAdded")
          .withArgs(10, "V2 Energy Drink", PRODUCT_PRICE, 15);

        const product = await vendingMachineV2.getProduct(10);
        expect(product.name).to.equal("V2 Energy Drink");
        expect(product.stock).to.equal(15);
      });

      it("Should reject empty product name", async function () {
        await expect(
          vendingMachineV2.addProduct(10, "", PRODUCT_PRICE, 5)
        ).to.be.revertedWith("Product name cannot be empty");
      });

      it("Should reject duplicate product ID", async function () {
        await expect(
          vendingMachineV2.addProduct(1, "Duplicate", PRODUCT_PRICE, 5)
        ).to.be.revertedWith("Product already exists - use updateProduct instead");
      });
    });

    describe("Update Product (New V2 Function)", function () {
      it("Should update existing product successfully", async function () {
        const newPrice = ethers.utils.parseEther("0.02");
        
        await expect(
          vendingMachineV2.updateProduct(1, "Updated Coca Cola", newPrice, 20)
        )
          .to.emit(vendingMachineV2, "ProductUpdated")
          .withArgs(1, "Updated Coca Cola", newPrice, 20);

        const product = await vendingMachineV2.getProduct(1);
        expect(product.name).to.equal("Updated Coca Cola");
        expect(product.price).to.equal(newPrice);
        expect(product.stock).to.equal(20);
      });

      it("Should reject updating non-existent product", async function () {
        await expect(
          vendingMachineV2.updateProduct(999, "Non-existent", PRODUCT_PRICE, 5)
        ).to.be.revertedWith("Product does not exist");
      });

      it("Should reject zero price in update", async function () {
        await expect(
          vendingMachineV2.updateProduct(1, "Free Item", 0, 5)
        ).to.be.revertedWith("Price must be greater than 0");
      });

      it("Should reject empty name in update", async function () {
        await expect(
          vendingMachineV2.updateProduct(1, "", PRODUCT_PRICE, 5)
        ).to.be.revertedWith("Product name cannot be empty");
      });
    });

    describe("Remove Product (New V2 Function)", function () {
      it("Should remove product successfully", async function () {
        await expect(
          vendingMachineV2.removeProduct(2)
        )
          .to.emit(vendingMachineV2, "ProductRemoved")
          .withArgs(2, "V1 Chips");

        await expect(
          vendingMachineV2.getProduct(2)
        ).to.be.revertedWith("Product does not exist");

        const products = await vendingMachineV2.getProducts();
        expect(products.length).to.equal(1); // Only product 1 should remain
      });

      it("Should reject removing non-existent product", async function () {
        await expect(
          vendingMachineV2.removeProduct(999)
        ).to.be.revertedWith("Product does not exist");
      });
    });
  });

  describe("V2 Enhanced Purchase with Analytics", function () {
    beforeEach(async function () {
      // Add a V2 product for testing
      await vendingMachineV2.addProduct(10, "V2 Product", PRODUCT_PRICE, 5);
    });

    it("Should record sale in analytics", async function () {
      const tx = await vendingMachineV2.connect(buyer).buyProduct(10, { value: PRODUCT_PRICE });
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      // Check SaleRecorded event
      const saleEvent = receipt.events.find(e => e.event === "SaleRecorded");
      expect(saleEvent).to.not.be.undefined;
      expect(saleEvent.args.productId).to.equal(10);
      expect(saleEvent.args.buyer).to.equal(buyer.address);
      expect(saleEvent.args.price).to.equal(PRODUCT_PRICE);

      // Check analytics data
      const totalSales = await vendingMachineV2.getTotalSales();
      expect(totalSales).to.equal(1); // This is the first V2 sale recorded

      const productRevenue = await vendingMachineV2.getProductRevenue(10);
      expect(productRevenue).to.equal(PRODUCT_PRICE);
    });

    it("Should update analytics summary correctly", async function () {
      // Get current analytics before making new purchases
      const analyticsBefore = await vendingMachineV2.getAnalyticsSummary();
      
      // Make multiple purchases
      await vendingMachineV2.connect(buyer).buyProduct(10, { value: PRODUCT_PRICE });
      await vendingMachineV2.connect(nonAdmin).buyProduct(10, { value: PRODUCT_PRICE });

      const analytics = await vendingMachineV2.getAnalyticsSummary();
      
      // Vérifier l'augmentation depuis l'état précédent
      expect(analytics.totalSales).to.equal(analyticsBefore.totalSales.add(2));
      expect(analytics.totalRevenue).to.equal(analyticsBefore.totalRevenue.add(PRODUCT_PRICE.mul(2)));
      expect(analytics.totalProducts).to.equal(3); // 2 V1 + 1 V2 product
      expect(analytics.contractBalance).to.equal(analyticsBefore.contractBalance.add(PRODUCT_PRICE.mul(2)));
    });

  });

  describe("V2 Analytics Functions", function () {
    beforeEach(async function () {
      // Add products and make purchases for analytics testing
      await vendingMachineV2.addProduct(20, "Analytics Test 1", PRODUCT_PRICE, 10);
      await vendingMachineV2.addProduct(21, "Analytics Test 2", PRODUCT_PRICE_2, 10);

      // Make several purchases
      await vendingMachineV2.connect(buyer).buyProduct(20, { value: PRODUCT_PRICE });
      await vendingMachineV2.connect(nonAdmin).buyProduct(21, { value: PRODUCT_PRICE_2 });
      await vendingMachineV2.connect(buyer).buyProduct(20, { value: PRODUCT_PRICE });
    });

    it("Should return complete sales history", async function () {
      const salesHistory = await vendingMachineV2.getSalesHistory();
      expect(salesHistory.length).to.equal(3);
      
      // Check first sale
      expect(salesHistory[0].productId).to.equal(20);
      expect(salesHistory[0].buyer).to.equal(buyer.address);
      expect(salesHistory[0].price).to.equal(PRODUCT_PRICE);
      
      // Check second sale
      expect(salesHistory[1].productId).to.equal(21);
      expect(salesHistory[1].buyer).to.equal(nonAdmin.address);
      expect(salesHistory[1].price).to.equal(PRODUCT_PRICE_2);
    });

    it("Should return paginated sales history", async function () {
      const paginatedSales = await vendingMachineV2.getSalesHistoryPaginated(0, 2);
      expect(paginatedSales.length).to.equal(2);
      expect(paginatedSales[0].productId).to.equal(20);
      expect(paginatedSales[1].productId).to.equal(21);

      const nextPage = await vendingMachineV2.getSalesHistoryPaginated(2, 2);
      expect(nextPage.length).to.equal(1);
      expect(nextPage[0].productId).to.equal(20);
    });

    it("Should reject invalid pagination parameters", async function () {
      await expect(
        vendingMachineV2.getSalesHistoryPaginated(10, 5)
      ).to.be.revertedWith("Offset out of bounds");
    });

    it("Should calculate product revenue correctly", async function () {
      const revenue20 = await vendingMachineV2.getProductRevenue(20);
      expect(revenue20).to.equal(PRODUCT_PRICE.mul(2)); // Two purchases

      const revenue21 = await vendingMachineV2.getProductRevenue(21);
      expect(revenue21).to.equal(PRODUCT_PRICE_2); // One purchase
    });

    it("Should filter sales by time range", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const pastTime = currentTime - 3600; // 1 hour ago
      const futureTime = currentTime + 3600; // 1 hour from now

      const salesInRange = await vendingMachineV2.getSalesByTimeRange(pastTime, futureTime);
      expect(salesInRange.length).to.equal(3); // All sales should be in this range

      const salesInPast = await vendingMachineV2.getSalesByTimeRange(pastTime - 7200, pastTime);
      expect(salesInPast.length).to.equal(0); // No sales in the past
    });

    it("Should reject invalid time range", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      await expect(
        vendingMachineV2.getSalesByTimeRange(currentTime + 3600, currentTime)
      ).to.be.revertedWith("Invalid time range");
    });
  });

  describe("V2 Advanced Scenarios", function () {
    it("Should handle complex product management workflow", async function () {
      // Add product
      await vendingMachineV2.addProduct(30, "Workflow Test", PRODUCT_PRICE, 5);
      
      // Purchase some stock
      await vendingMachineV2.connect(buyer).buyProduct(30, { value: PRODUCT_PRICE });
      await vendingMachineV2.connect(buyer).buyProduct(30, { value: PRODUCT_PRICE });
      
      let product = await vendingMachineV2.getProduct(30);
      expect(product.stock).to.equal(3);
      
      // Update product (restock and change price)
      const newPrice = ethers.utils.parseEther("0.015");
      await vendingMachineV2.updateProduct(30, "Updated Workflow Test", newPrice, 10);
      
      product = await vendingMachineV2.getProduct(30);
      expect(product.name).to.equal("Updated Workflow Test");
      expect(product.price).to.equal(newPrice);
      expect(product.stock).to.equal(10);
      
      // Purchase with new price
      await vendingMachineV2.connect(buyer).buyProduct(30, { value: newPrice });
      
      product = await vendingMachineV2.getProduct(30);
      expect(product.stock).to.equal(9);
      
      // Check analytics reflect all transactions
      const productRevenue = await vendingMachineV2.getProductRevenue(30);
      const expectedRevenue = PRODUCT_PRICE.mul(2).add(newPrice);
      expect(productRevenue).to.equal(expectedRevenue);
      
      // Remove product
      await vendingMachineV2.removeProduct(30);
      await expect(vendingMachineV2.getProduct(30)).to.be.revertedWith("Product does not exist");
    });

    it("Should maintain data integrity with concurrent operations", async function () {
      await vendingMachineV2.addProduct(40, "Concurrency Test", PRODUCT_PRICE, 2);
      
      // Simulate concurrent purchases (should deplete stock correctly)
      const tx1 = vendingMachineV2.connect(buyer).buyProduct(40, { value: PRODUCT_PRICE });
      const tx2 = vendingMachineV2.connect(nonAdmin).buyProduct(40, { value: PRODUCT_PRICE });
      
      await Promise.all([tx1, tx2]);
      
      const product = await vendingMachineV2.getProduct(40);
      expect(product.stock).to.equal(0);
      
      // Next purchase should fail
      await expect(
        vendingMachineV2.connect(buyer).buyProduct(40, { value: PRODUCT_PRICE })
      ).to.be.revertedWith("Out of stock");
    });

    it("Should handle edge case of analytics initialization", async function () {
      // Deploy fresh V2 (no V1 history)
      const VendingMachineV2 = await ethers.getContractFactory("VendingMachineV2");
      const freshV2 = await upgrades.deployProxy(VendingMachineV2, [], {
        initializer: "initialize",
      });
      await freshV2.deployed();

      // Check initial analytics state
      const analytics = await freshV2.getAnalyticsSummary();
      expect(analytics.totalSales).to.equal(0);
      expect(analytics.totalRevenue).to.equal(0);
      expect(analytics.totalProducts).to.equal(0);
      expect(analytics.contractBalance).to.equal(0);

      const salesHistory = await freshV2.getSalesHistory();
      expect(salesHistory.length).to.equal(0);
    });
  });

  describe("V2 Security & Access Control", function () {
    it("Should prevent unauthorized upgrades", async function () {
      // Only owner should be able to authorize upgrades
      const VendingMachineV2 = await ethers.getContractFactory("VendingMachineV2");
      
      await expect(
        upgrades.upgradeProxy(vendingMachineV2.address, VendingMachineV2.connect(nonAdmin))
      ).to.be.reverted;
    });

    it("Should maintain admin restrictions after upgrade", async function () {
      // Deploy a mock V3 for testing
      const VendingMachineV3 = await ethers.getContractFactory("VendingMachineV2"); // Using V2 as mock V3
      const upgradedV3 = await upgrades.upgradeProxy(vendingMachineV2.address, VendingMachineV3);
      
      // Admin functions should still be restricted
      await expect(
        upgradedV3.connect(nonAdmin).addProduct(50, "Unauthorized V3", PRODUCT_PRICE, 5)
      ).to.be.revertedWith("Access denied: Admin only");
      
      // Owner should still work
      await upgradedV3.addProduct(50, "Authorized V3", PRODUCT_PRICE, 5);
      const product = await upgradedV3.getProduct(50);
      expect(product.name).to.equal("Authorized V3");
    });
  });

  describe("Gas Optimization & Performance", function () {
    it("Should handle large product catalogs efficiently", async function () {
      // Add many products
      for (let i = 100; i < 110; i++) {
        await vendingMachineV2.addProduct(i, `Product ${i}`, PRODUCT_PRICE, 10);
      }
      
      const products = await vendingMachineV2.getProducts();
      expect(products.length).to.equal(12); // 2 V1 + 10 new products
      
      // Should be able to get product count efficiently
      const count = await vendingMachineV2.getProductCount();
      expect(count).to.equal(12);
    });

    it("Should handle analytics queries with reasonable gas usage", async function () {
      // Make several purchases
      await vendingMachineV2.addProduct(60, "Gas Test", PRODUCT_PRICE, 20);
      
      for (let i = 0; i < 5; i++) {
        await vendingMachineV2.connect(buyer).buyProduct(60, { value: PRODUCT_PRICE });
      }
      
      // Analytics queries should not fail due to gas limits
      const analytics = await vendingMachineV2.getAnalyticsSummary();
      expect(analytics.totalSales).to.equal(5);
      
      const salesHistory = await vendingMachineV2.getSalesHistoryPaginated(0, 5);
      expect(salesHistory.length).to.equal(5);
    });
  });
});