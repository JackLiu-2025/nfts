import { expect } from "chai";
import hre from "hardhat";

describe("NFTMarketplace", function () {
  let nftMarketplace;
  let owner, addr1, addr2;
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    
    const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.waitForDeployment();
  });
  
  describe("Minting", function () {
    it("Should mint a new NFT", async function () {
      const tokenURI = "ipfs://QmTest123";
      const royalty = 500; // 5%
      const category = "art";
      
      await expect(nftMarketplace.connect(addr1).mintNFT(tokenURI, royalty, category))
        .to.emit(nftMarketplace, "NFTMinted")
        .withArgs(0, addr1.address, tokenURI, royalty, category);
      
      expect(await nftMarketplace.ownerOf(0)).to.equal(addr1.address);
      expect(await nftMarketplace.tokenURI(0)).to.equal(tokenURI);
    });
    
    it("Should reject royalty above 10%", async function () {
      await expect(
        nftMarketplace.mintNFT("ipfs://test", 1001, "art")
      ).to.be.revertedWith("Royalty too high");
    });
    
    it("Should reject empty token URI", async function () {
      await expect(
        nftMarketplace.mintNFT("", 500, "art")
      ).to.be.revertedWith("Token URI cannot be empty");
    });
  });
  
  describe("Listing", function () {
    beforeEach(async function () {
      await nftMarketplace.connect(addr1).mintNFT("ipfs://test", 500, "art");
    });
    
    it("Should list an NFT for sale", async function () {
      const price = hre.ethers.parseEther("1.0");
      
      await expect(nftMarketplace.connect(addr1).listNFT(0, price))
        .to.emit(nftMarketplace, "NFTListed")
        .withArgs(0, addr1.address, price);
      
      const listing = await nftMarketplace.getListing(0);
      expect(listing.isListed).to.be.true;
      expect(listing.price).to.equal(price);
      expect(listing.seller).to.equal(addr1.address);
    });
    
    it("Should reject listing by non-owner", async function () {
      await expect(
        nftMarketplace.connect(addr2).listNFT(0, hre.ethers.parseEther("1.0"))
      ).to.be.revertedWith("Not the owner");
    });
    
    it("Should cancel a listing", async function () {
      await nftMarketplace.connect(addr1).listNFT(0, hre.ethers.parseEther("1.0"));
      
      await expect(nftMarketplace.connect(addr1).cancelListing(0))
        .to.emit(nftMarketplace, "ListingCancelled")
        .withArgs(0, addr1.address);
      
      const listing = await nftMarketplace.getListing(0);
      expect(listing.isListed).to.be.false;
    });
  });
  
  describe("Buying", function () {
    beforeEach(async function () {
      await nftMarketplace.connect(addr1).mintNFT("ipfs://test", 500, "art");
      await nftMarketplace.connect(addr1).listNFT(0, hre.ethers.parseEther("1.0"));
    });
    
    it("Should buy a listed NFT", async function () {
      const price = hre.ethers.parseEther("1.0");
      
      await expect(
        nftMarketplace.connect(addr2).buyNFT(0, { value: price })
      ).to.emit(nftMarketplace, "NFTSold")
        .withArgs(0, addr1.address, addr2.address, price);
      
      expect(await nftMarketplace.ownerOf(0)).to.equal(addr2.address);
      
      const listing = await nftMarketplace.getListing(0);
      expect(listing.isListed).to.be.false;
    });
    
    it("Should reject insufficient payment", async function () {
      await expect(
        nftMarketplace.connect(addr2).buyNFT(0, { value: hre.ethers.parseEther("0.5") })
      ).to.be.revertedWith("Insufficient payment");
    });
    
    it("Should reject buying own NFT", async function () {
      await expect(
        nftMarketplace.connect(addr1).buyNFT(0, { value: hre.ethers.parseEther("1.0") })
      ).to.be.revertedWith("Cannot buy your own NFT");
    });
  });
  
  describe("Burning", function () {
    beforeEach(async function () {
      await nftMarketplace.connect(addr1).mintNFT("ipfs://test", 500, "art");
    });
    
    it("Should burn an NFT", async function () {
      await expect(nftMarketplace.connect(addr1).burnNFT(0))
        .to.emit(nftMarketplace, "NFTBurned")
        .withArgs(0, addr1.address);
      
      await expect(nftMarketplace.ownerOf(0)).to.be.reverted;
    });
    
    it("Should reject burning by non-owner", async function () {
      await expect(
        nftMarketplace.connect(addr2).burnNFT(0)
      ).to.be.revertedWith("Not the owner");
    });
    
    it("Should cancel listing when burning", async function () {
      await nftMarketplace.connect(addr1).listNFT(0, hre.ethers.parseEther("1.0"));
      await nftMarketplace.connect(addr1).burnNFT(0);
      
      const listing = await nftMarketplace.getListing(0);
      expect(listing.isListed).to.be.false;
    });
  });
  
  describe("Marketplace Fee Management", function () {
    it("Should have default fee of 2.5%", async function () {
      const config = await nftMarketplace.getMarketplaceFeeConfig();
      expect(config.feePercent).to.equal(250); // 2.5%
      expect(config.enabled).to.be.true;
      expect(config.maxFeePercent).to.equal(1000); // 10%
    });
    
    it("Should allow owner to change fee", async function () {
      await expect(nftMarketplace.setMarketplaceFee(500))
        .to.emit(nftMarketplace, "MarketplaceFeeUpdated")
        .withArgs(250, 500);
      
      expect(await nftMarketplace.marketplaceFeePercent()).to.equal(500);
    });
    
    it("Should reject fee above maximum", async function () {
      await expect(
        nftMarketplace.setMarketplaceFee(1001)
      ).to.be.revertedWith("Fee exceeds maximum");
    });
    
    it("Should reject fee change by non-owner", async function () {
      await expect(
        nftMarketplace.connect(addr1).setMarketplaceFee(500)
      ).to.be.reverted;
    });
    
    it("Should allow owner to disable fees", async function () {
      await expect(nftMarketplace.setFeesEnabled(false))
        .to.emit(nftMarketplace, "FeesEnabledChanged")
        .withArgs(false);
      
      expect(await nftMarketplace.feesEnabled()).to.be.false;
    });
    
    it("Should not charge fees when disabled", async function () {
      // Mint and list NFT
      await nftMarketplace.connect(addr1).mintNFT("ipfs://test", 0, "art");
      await nftMarketplace.connect(addr1).listNFT(0, hre.ethers.parseEther("1.0"));
      
      // Disable fees
      await nftMarketplace.setFeesEnabled(false);
      
      // Get balances before
      const sellerBalanceBefore = await hre.ethers.provider.getBalance(addr1.address);
      const ownerBalanceBefore = await hre.ethers.provider.getBalance(owner.address);
      
      // Buy NFT
      await nftMarketplace.connect(addr2).buyNFT(0, { value: hre.ethers.parseEther("1.0") });
      
      // Get balances after
      const sellerBalanceAfter = await hre.ethers.provider.getBalance(addr1.address);
      const ownerBalanceAfter = await hre.ethers.provider.getBalance(owner.address);
      
      // Seller should receive full amount (no marketplace fee)
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(hre.ethers.parseEther("1.0"));
      
      // Owner should not receive any fee
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore);
    });
    
    it("Should charge correct fee when enabled", async function () {
      // Mint and list NFT (with 0% royalty for simplicity)
      await nftMarketplace.connect(addr1).mintNFT("ipfs://test", 0, "art");
      await nftMarketplace.connect(addr1).listNFT(0, hre.ethers.parseEther("1.0"));
      
      // Get balances before
      const sellerBalanceBefore = await hre.ethers.provider.getBalance(addr1.address);
      
      // Buy NFT
      await nftMarketplace.connect(addr2).buyNFT(0, { value: hre.ethers.parseEther("1.0") });
      
      // Get balances after
      const sellerBalanceAfter = await hre.ethers.provider.getBalance(addr1.address);
      
      // Seller should receive 97.5% (100% - 2.5% fee)
      const expectedAmount = hre.ethers.parseEther("0.975");
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedAmount);
    });
  });
});
