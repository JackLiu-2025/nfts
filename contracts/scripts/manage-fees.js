import hre from "hardhat";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log("🎛️  NFT Marketplace Fee Management Tool\n");
  
  const contractAddress = "0x4681BE5B76bACF483Ec7d6f228f6F4C31394c761";
  
  // Get contract instance
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const contract = NFTMarketplace.attach(contractAddress);
  
  const [signer] = await hre.ethers.getSigners();
  const owner = await contract.owner();
  
  console.log("📋 Contract:", contractAddress);
  console.log("🔑 Your Address:", signer.address);
  console.log("👤 Owner Address:", owner);
  console.log("");
  
  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    console.log("❌ Error: You are not the contract owner!");
    console.log("   Only the owner can manage fees.");
    process.exit(1);
  }
  
  // Get current config
  const config = await contract.getMarketplaceFeeConfig();
  console.log("📊 Current Configuration:");
  console.log(`   Fee: ${Number(config.feePercent) / 100}%`);
  console.log(`   Enabled: ${config.enabled ? 'Yes' : 'No'}`);
  console.log("");
  
  console.log("What would you like to do?");
  console.log("1. Change fee percentage");
  console.log("2. Enable/Disable fees");
  console.log("3. View current config only");
  console.log("4. Exit");
  console.log("");
  
  const choice = await question("Enter your choice (1-4): ");
  console.log("");
  
  switch (choice.trim()) {
    case "1":
      await changeFeePercentage(contract);
      break;
    case "2":
      await toggleFees(contract, config.enabled);
      break;
    case "3":
      console.log("✅ Current configuration displayed above.");
      break;
    case "4":
      console.log("👋 Goodbye!");
      break;
    default:
      console.log("❌ Invalid choice!");
  }
  
  rl.close();
}

async function changeFeePercentage(contract) {
  console.log("💰 Change Fee Percentage");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Enter new fee percentage (0-10):");
  console.log("Examples: 0 = 0%, 2.5 = 2.5%, 5 = 5%, 10 = 10%");
  console.log("");
  
  const input = await question("New fee %: ");
  const feePercent = parseFloat(input);
  
  if (isNaN(feePercent) || feePercent < 0 || feePercent > 10) {
    console.log("❌ Invalid fee! Must be between 0 and 10.");
    return;
  }
  
  const basisPoints = Math.round(feePercent * 100);
  console.log("");
  console.log(`Setting fee to ${feePercent}% (${basisPoints} basis points)...`);
  
  try {
    const tx = await contract.setMarketplaceFee(basisPoints);
    console.log("⏳ Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    await tx.wait();
    console.log("✅ Fee updated successfully!");
    console.log(`   New fee: ${feePercent}%`);
  } catch (error) {
    console.log("❌ Transaction failed:", error.message);
  }
}

async function toggleFees(contract, currentlyEnabled) {
  console.log("🔄 Enable/Disable Fees");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Current status: ${currentlyEnabled ? 'Enabled' : 'Disabled'}`);
  console.log("");
  console.log("What would you like to do?");
  console.log("1. Enable fees");
  console.log("2. Disable fees");
  console.log("3. Cancel");
  console.log("");
  
  const choice = await question("Enter your choice (1-3): ");
  console.log("");
  
  let newStatus;
  switch (choice.trim()) {
    case "1":
      newStatus = true;
      break;
    case "2":
      newStatus = false;
      break;
    case "3":
      console.log("❌ Cancelled.");
      return;
    default:
      console.log("❌ Invalid choice!");
      return;
  }
  
  if (newStatus === currentlyEnabled) {
    console.log(`ℹ️  Fees are already ${newStatus ? 'enabled' : 'disabled'}.`);
    return;
  }
  
  console.log(`${newStatus ? 'Enabling' : 'Disabling'} fees...`);
  
  try {
    const tx = await contract.setFeesEnabled(newStatus);
    console.log("⏳ Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    await tx.wait();
    console.log(`✅ Fees ${newStatus ? 'enabled' : 'disabled'} successfully!`);
  } catch (error) {
    console.log("❌ Transaction failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
