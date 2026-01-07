import hre from "hardhat";

async function main() {
  console.log("Deploying NFTMarketplace contract...");
  console.log("Network:", hre.network.name);
  console.log("Config:", hre.network.config);

  // Get the deployer account
  const signers = await hre.ethers.getSigners();
  console.log("Signers count:", signers.length);
  
  if (signers.length === 0) {
    throw new Error("No signers available. Please check your PRIVATE_KEY in .env file");
  }
  
  const [deployer] = signers;
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying with account:", deployerAddress);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");

  // Get the contract factory
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  
  // Deploy the contract
  console.log("Deploying contract...");
  const nftMarketplace = await NFTMarketplace.deploy();
  
  await nftMarketplace.waitForDeployment();
  
  const address = await nftMarketplace.getAddress();
  
  console.log(`\n✅ NFTMarketplace deployed to: ${address}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${(await hre.ethers.provider.getNetwork()).chainId}`);
  console.log(`\n🔗 View on Polygonscan: https://amoy.polygonscan.com/address/${address}`);
  
  // Wait for a few block confirmations
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await nftMarketplace.deploymentTransaction().wait(5);
    console.log("✅ Confirmed!");
    
    // Verify contract on Polygonscan
    if (process.env.POLYGONSCAN_API_KEY && process.env.POLYGONSCAN_API_KEY !== "your_polygonscan_api_key_here") {
      console.log("\nVerifying contract on Polygonscan...");
      try {
        await hre.run("verify:verify", {
          address: address,
          constructorArguments: [],
        });
        console.log("✅ Contract verified successfully!");
      } catch (error) {
        console.log("⚠️  Verification failed:", error.message);
      }
    } else {
      console.log("\n⚠️  Skipping verification (no API key provided)");
      console.log("You can verify later with:");
      console.log(`npx hardhat verify --network polygonAmoy ${address}`);
    }
  }
  
  console.log("\n📝 Save this contract address for frontend integration!");
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
