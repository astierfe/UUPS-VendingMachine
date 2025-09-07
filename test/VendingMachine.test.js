const chai = require("chai"); // <-- il faut ça
const { expect } = chai;
const { ethers, upgrades } = require("hardhat");
const waffle = require("ethereum-waffle");

chai.use(waffle.solidity);

describe("VendingMachine V1", function () {
  let vendingMachine;
  let owner;
  let buyer;

  beforeEach(async function () {
    [owner, buyer] = await ethers.getSigners();

    // Déployer VendingMachine avec proxy
    const VendingMachineV1 = await ethers.getContractFactory("VendingMachineV1");
    vendingMachine = await upgrades.deployProxy(VendingMachineV1, [], {
      initializer: "initialize",
    });
    await vendingMachine.deployed();
  });

  describe("Gestion des produits", function () {
    it("Should add a product successfully", async function () {
      const price = ethers.utils.parseEther("0.01");

      await expect(
        vendingMachine.addProduct(1, "Coca Cola", price, 10)
      )
        .to.emit(vendingMachine, "ProductAdded")
        .withArgs(1, "Coca Cola", price, 10);

      const product = await vendingMachine.getProduct(1);
      expect(product.name).to.equal("Coca Cola");
      expect(product.price).to.equal(price);
      expect(product.stock).to.equal(10);
    });

    it("Should return all products", async function () {
      await vendingMachine.addProduct(1, "Coca", ethers.utils.parseEther("0.01"), 10);
      await vendingMachine.addProduct(2, "Chips", ethers.utils.parseEther("0.005"), 20);

      const products = await vendingMachine.getProducts();
      expect(products.length).to.equal(2);
      expect(products[0].name).to.equal("Coca");
      expect(products[1].name).to.equal("Chips");
    });

    it("Should reject invalid product ID", async function () {
      await expect(
        vendingMachine.addProduct(0, "Invalid", ethers.utils.parseEther("0.01"), 10)
      ).to.be.revertedWith("Invalid product ID");
    });

    it("Should reject zero price", async function () {
      await expect(
        vendingMachine.addProduct(1, "Free Item", 0, 10)
      ).to.be.revertedWith("Price must be greater than 0");
    });
  });

  describe("Achat de produits", function () {
    beforeEach(async function () {
      await vendingMachine.addProduct(1, "Test Product", ethers.utils.parseEther("0.01"), 5);
    });

    it("Should buy a product successfully", async function () {
      const price = ethers.utils.parseEther("0.01");

      await expect(
        vendingMachine.connect(buyer).buyProduct(1, { value: price })
      )
        .to.emit(vendingMachine, "ProductPurchased")
        .withArgs(1, buyer.address, price);

      const product = await vendingMachine.getProduct(1);
      expect(product.stock).to.equal(4);
    });

    it("Should refund excess payment", async function () {
      const price = ethers.utils.parseEther("0.01");
      const overpayment = ethers.utils.parseEther("0.02");

      const balanceBefore = await ethers.provider.getBalance(buyer.address);

      const tx = await vendingMachine.connect(buyer).buyProduct(1, { value: overpayment });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      await expect(tx)
        .to.emit(vendingMachine, "RefundSent")
        .withArgs(buyer.address, price);

      const balanceAfter = await ethers.provider.getBalance(buyer.address);
      const expected = balanceBefore.sub(price).sub(gasUsed);
      expect(balanceAfter).to.be.closeTo(expected, ethers.utils.parseEther("0.001"));
    });

    it("Should reject insufficient payment", async function () {
      await expect(
        vendingMachine.connect(buyer).buyProduct(1, { value: ethers.utils.parseEther("0.005") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should reject purchase when out of stock", async function () {
      for (let i = 0; i < 5; i++) {
        await vendingMachine.connect(buyer).buyProduct(1, { value: ethers.utils.parseEther("0.01") });
      }
      await expect(
        vendingMachine.connect(buyer).buyProduct(1, { value: ethers.utils.parseEther("0.01") })
      ).to.be.revertedWith("Out of stock");
    });

    it("Should reject purchase of non-existent product", async function () {
      await expect(
        vendingMachine.connect(buyer).buyProduct(999, { value: ethers.utils.parseEther("0.01") })
      ).to.be.revertedWith("Product does not exist");
    });
  });

  describe("Administration", function () {
    it("Should allow owner to withdraw funds", async function () {
      await vendingMachine.addProduct(1, "Test", ethers.utils.parseEther("0.01"), 10);
      await vendingMachine.connect(buyer).buyProduct(1, { value: ethers.utils.parseEther("0.01") });

      const contractBalance = await ethers.provider.getBalance(vendingMachine.address);
      expect(contractBalance).to.equal(ethers.utils.parseEther("0.01"));

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await vendingMachine.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      const expected = ownerBalanceBefore.add(ethers.utils.parseEther("0.01")).sub(gasUsed);
      expect(ownerBalanceAfter).to.be.closeTo(expected, ethers.utils.parseEther("0.001"));
    });

    it("Should reject non-owner from adding products", async function () {
      await expect(
        vendingMachine.connect((await ethers.getSigners())[1]).addProduct(1, "Hack", ethers.utils.parseEther("0.01"), 10)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Upgradabilité", function () {
    it("Should be upgradable", async function () {
      const implementationAddress = await upgrades.erc1967.getImplementationAddress(vendingMachine.address);
      expect(implementationAddress).to.not.equal(ethers.constants.AddressZero);
      expect(implementationAddress).to.not.equal(vendingMachine.address);
    });
  });
});
