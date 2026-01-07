# NFT Minting Troubleshooting Guide

## 🎯 Current Status

### ✅ What's Working
- ✅ Smart contract deployed and verified on Polygon Amoy
- ✅ Contract address: `0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5`
- ✅ Direct minting via Hardhat works perfectly
- ✅ IPFS uploads to Pinata working
- ✅ All environment variables configured correctly
- ✅ Backend API and indexer running
- ✅ Frontend configuration correct

### ❌ What's Not Working
- ❌ Minting from frontend shows "Internal JSON-RPC error"

## 🔍 Root Cause

The contract works perfectly when called directly through Hardhat, which means:
- The contract code is correct
- The deployment is successful
- The network configuration is correct

**The issue is with MetaMask/browser setup, not the code.**

## 🛠️ Solution Steps

### Option 1: Use Diagnostic Tool (Recommended)

1. Open the diagnostic tool in your browser:
   ```bash
   # From project root
   open test_metamask.html
   # Or just double-click the file
   ```

2. Follow the steps in the tool:
   - Connect MetaMask
   - Check network (should be Polygon Amoy, Chain ID: 80002)
   - Verify contract
   - Test gas estimation

3. The tool will tell you exactly what's wrong

### Option 2: Manual Verification

#### Step 1: Verify MetaMask Network

Open MetaMask and check:
- Network name should be "Polygon Amoy Testnet"
- Chain ID should be 80002
- RPC URL should be `https://rpc-amoy.polygon.technology/`

If not correct, add the network manually:
1. Click network dropdown in MetaMask
2. Click "Add Network"
3. Enter these details:
   ```
   Network Name: Polygon Amoy Testnet
   RPC URL: https://rpc-amoy.polygon.technology/
   Chain ID: 80002
   Currency Symbol: MATIC
   Block Explorer: https://amoy.polygonscan.com/
   ```

#### Step 2: Reset MetaMask Account

This clears any cached transaction data:
1. Open MetaMask
2. Settings → Advanced
3. Scroll down and click "Reset Account"
4. Confirm

#### Step 3: Check Balance

Make sure you have enough MATIC:
- Minimum: 0.1 MATIC
- Recommended: 0.5 MATIC
- Get test MATIC: https://faucet.polygon.technology/

Current deployer balance: **49.72 MATIC** ✅

#### Step 4: Try Minting Again

1. Refresh your frontend page (http://localhost:5174)
2. Disconnect and reconnect wallet
3. Try minting
4. When MetaMask popup appears, check:
   - Network shows "Polygon Amoy Testnet"
   - Gas estimate is reasonable (~0.05 MATIC)
   - No error messages

## 🧪 Testing Tools

### 1. Hardhat Test Script
Verify the contract works:
```bash
cd contracts
npx hardhat run scripts/test-mint.js --network polygonAmoy
```

Expected output:
```
✅ NFT Minted Successfully!
Token ID: X
Transaction: https://amoy.polygonscan.com/tx/...
```

### 2. MetaMask Diagnostic Tool
Open `test_metamask.html` in your browser to:
- Check wallet connection
- Verify network configuration
- Test contract accessibility
- Estimate gas for minting

### 3. Frontend Configuration Check
```bash
node check_frontend_config.js
```

Should show all ✅ checks passing.

## 📋 Verification Checklist

Before minting from frontend:

- [ ] MetaMask installed and unlocked
- [ ] Connected to Polygon Amoy Testnet (verify in MetaMask)
- [ ] Chain ID is 80002 (check in MetaMask network settings)
- [ ] Wallet has >0.1 MATIC
- [ ] Frontend running on http://localhost:5174
- [ ] Backend running on http://localhost:8000
- [ ] Browser console open (F12) for debugging
- [ ] MetaMask account reset (if having issues)

## 🐛 Common Errors and Solutions

### "Internal JSON-RPC error"

**Most Common Cause:** Wrong network in MetaMask

**Solutions:**
1. Check MetaMask network dropdown - should say "Polygon Amoy Testnet"
2. If it says something else, switch to Polygon Amoy
3. If Polygon Amoy isn't in the list, add it manually (see Step 1 above)
4. Reset MetaMask account
5. Refresh browser page

### "Insufficient funds"

**Cause:** Not enough MATIC for gas

**Solution:** Get test MATIC from https://faucet.polygon.technology/

### "Transaction underpriced"

**Cause:** Gas price too low

**Solution:** 
1. When MetaMask popup appears, click "Edit" on gas
2. Select "Aggressive" or "Market"
3. Or set manually: Gas Limit: 250000, Max Fee: 250 gwei

### "Nonce too low"

**Cause:** Transaction nonce mismatch

**Solution:** Reset MetaMask account (Settings → Advanced → Reset Account)

## 📊 Expected Behavior

When minting works correctly:

1. **IPFS Upload Phase:**
   - Console shows: "Uploading to IPFS..."
   - File uploads to Pinata
   - Metadata JSON uploads to Pinata
   - Console shows IPFS URIs

2. **Minting Phase:**
   - Console shows: "Minting NFT with params..."
   - MetaMask popup appears
   - Network shows "Polygon Amoy Testnet"
   - Gas estimate shown (~0.05 MATIC)
   - User confirms transaction

3. **Confirmation Phase:**
   - Console shows: "Transaction sent: 0x..."
   - Console shows: "Transaction confirmed"
   - Success message appears
   - NFT appears in profile

## 🔗 Useful Links

- **Contract on Explorer:** https://amoy.polygonscan.com/address/0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5
- **Test Faucet:** https://faucet.polygon.technology/
- **Amoy Explorer:** https://amoy.polygonscan.com/
- **Polygon Docs:** https://docs.polygon.technology/

## 📝 Debug Information to Collect

If the issue persists, collect this information:

1. **MetaMask Info:**
   - Network name shown in MetaMask
   - Chain ID (from MetaMask network settings)
   - Wallet address
   - Balance

2. **Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Try minting
   - Copy all error messages

3. **Network Request:**
   - Open DevTools (F12)
   - Go to Network tab
   - Try minting
   - Look for failed requests
   - Check request/response details

## 🎯 Next Steps

1. **First:** Open `test_metamask.html` and run through all checks
2. **If all checks pass:** The issue is likely browser cache or MetaMask state
   - Clear browser cache
   - Reset MetaMask account
   - Try in incognito/private window
3. **If checks fail:** The diagnostic tool will tell you exactly what's wrong
4. **Still stuck:** Share the output from the diagnostic tool

## ✅ Success Confirmation

You'll know it's working when:
- Diagnostic tool shows all ✅ green checks
- Gas estimation succeeds
- MetaMask popup shows correct network
- Transaction confirms on Polygonscan
- NFT appears in your profile

## 📞 Support

If you've tried all the above and still having issues:
1. Run the diagnostic tool and screenshot results
2. Copy browser console errors
3. Note which step fails (IPFS upload, gas estimation, transaction send, etc.)
4. Check if Hardhat test script works (if yes, it's definitely MetaMask)
