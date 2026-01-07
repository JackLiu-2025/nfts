import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("🚀 Deploying NFTMarketplace to Polygon Amoy Testnet...");
  console.log("================================================");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", await deployer.getAddress());

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC");

  if (balance === 0n) {
    console.error("❌ Error: Account has no MATIC. Please get test MATIC from faucet:");
    console.error("   https://faucet.polygon.technology/");
    process.exit(1);
  }

  // Deploy contract
  console.log("\n📦 Deploying NFTMarketplace contract...");
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy();

  await marketplace.waitForDeployment();
  const address = await marketplace.getAddress();

  console.log("✅ NFTMarketplace deployed to:", address);
  console.log("\n📋 Deployment Summary:");
  console.log("================================================");
  console.log("Network:          Polygon Amoy Testnet");
  console.log("Chain ID:         80002");
  console.log("Contract Address:", address);
  console.log("Deployer:        ", await deployer.getAddress());
  console.log("Block Explorer:  ", `https://amoy.polygonscan.com/address/${address}`);
  console.log("================================================");

  // Wait for block confirmations
  console.log("\n⏳ Waiting for 5 block confirmations...");
  await marketplace.deploymentTransaction().wait(5);
  console.log("✅ Confirmed!");

  // Verify contract on Polygonscan
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("\n🔍 Verifying contract on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified!");
      } else {
        console.log("⚠️  Verification failed:", error.message);
        console.log("   You can verify manually later using:");
        console.log(`   npx hardhat verify --network polygonAmoy ${address}`);
      }
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: "polygonAmoy",
    chainId: 80002,
    contractAddress: address,
    deployer: await deployer.getAddress(),
    deployedAt: new Date().toISOString(),
    blockExplorer: `https://amoy.polygonscan.com/address/${address}`,
  };

  fs.writeFileSync(
    "./deployment-amoy.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-amoy.json");

  console.log("\n🎉 Deployment complete!");
  console.log("\n📝 Next steps:");
  console.log("1. Update frontend/.env with:");
  console.log(`   VITE_CONTRACT_ADDRESS=${address}`);
  console.log(`   VITE_CHAIN_ID=80002`);
  console.log(`   VITE_RPC_URL=https://rpc-amoy.polygon.technology/`);
  console.log(`   VITE_NETWORK=amoy`);
  console.log("\n2. Update backend/.env with:");
  console.log(`   CONTRACT_ADDRESS=${address}`);
  console.log(`   RPC_URL=https://rpc-amoy.polygon.technology/`);
  console.log(`   CHAIN_ID=80002`);
  console.log("\n3. Restart backend and frontend services");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
