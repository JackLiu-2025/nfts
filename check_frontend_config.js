// Quick diagnostic script to check frontend configuration
import fs from 'fs';
import path from 'path';

console.log("🔍 Frontend Configuration Diagnostic");
console.log("=====================================\n");

// Read .env file
const envPath = './frontend/.env';
const envContent = fs.readFileSync(envPath, 'utf8');

console.log("📄 Environment Variables:");
console.log(envContent);
console.log();

// Read contract JSON
const contractPath = './frontend/src/contracts/NFTMarketplace.json';
const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

console.log("📦 Contract Configuration:");
console.log("   Address:", contractJson.address);
console.log("   ABI entries:", contractJson.abi.length);
console.log();

// Check if addresses match
const envAddress = envContent.match(/VITE_CONTRACT_ADDRESS=(.+)/)?.[1]?.trim();
console.log("✅ Verification:");
console.log("   .env address:", envAddress);
console.log("   JSON address:", contractJson.address);
console.log("   Match:", envAddress === contractJson.address ? "✅ YES" : "❌ NO");
console.log();

// Check network config
const chainId = envContent.match(/VITE_CHAIN_ID=(.+)/)?.[1]?.trim();
const rpcUrl = envContent.match(/VITE_RPC_URL=(.+)/)?.[1]?.trim();
const network = envContent.match(/VITE_NETWORK=(.+)/)?.[1]?.trim();

console.log("🌐 Network Configuration:");
console.log("   Chain ID:", chainId, chainId === "80002" ? "✅" : "❌");
console.log("   RPC URL:", rpcUrl);
console.log("   Network:", network);
console.log();

// Check Pinata config
const hasJWT = envContent.includes('VITE_PINATA_JWT=');
const hasAPIKey = envContent.includes('VITE_PINATA_API_KEY=');
const hasSecretKey = envContent.includes('VITE_PINATA_SECRET_KEY=');

console.log("📌 Pinata Configuration:");
console.log("   JWT:", hasJWT ? "✅ Present" : "❌ Missing");
console.log("   API Key:", hasAPIKey ? "✅ Present" : "❌ Missing");
console.log("   Secret Key:", hasSecretKey ? "✅ Present" : "❌ Missing");
console.log();

console.log("💡 Recommendations:");
if (envAddress !== contractJson.address) {
  console.log("   ⚠️  Contract addresses don't match!");
  console.log("   Update NFTMarketplace.json address to:", envAddress);
}
if (chainId !== "80002") {
  console.log("   ⚠️  Chain ID should be 80002 for Polygon Amoy");
}
if (!hasJWT || !hasAPIKey || !hasSecretKey) {
  console.log("   ⚠️  Pinata configuration incomplete");
}

console.log("\n✅ Diagnostic complete!");
