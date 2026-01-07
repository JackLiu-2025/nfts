# NFT Minting Issue - Debugging Guide

## Issue Summary
User experiencing "Internal JSON-RPC error" when trying to mint NFT from frontend, but contract works perfectly when called directly through Hardhat.

## Test Results

### ✅ Contract Test (Hardhat) - SUCCESS
```bash
cd contracts
npx hardhat run scripts/test-mint.js --network polygonAmoy
```

**Result**: NFT minted successfully!
- Token ID: 0
- Transaction: https://amoy.polygonscan.com/tx/0xdbf550376191e52c5f5a484b4f6dd829c93ba278ec2ad678aade23accf60df0f
- Gas used: 232,804
- Cost: ~0.05 MATIC

### ✅ Configuration Check - ALL CORRECT
- Contract address: `0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5`
- Chain ID: `80002` (Polygon Amoy)
- RPC URL: `https://rpc-amoy.polygon.technology/`
- Pinata: Fully configured with JWT, API Key, Secret Key
- IPFS uploads: Working correctly

### ❌ Frontend Minting - FAILS
Error: "Internal JSON-RPC error" from MetaMask

## Root Cause Analysis

Since the contract works perfectly through Hardhat but fails from the frontend, the issue is **NOT** with:
- ❌ Contract deployment
- ❌ Contract code
- ❌ Environment variables
- ❌ IPFS configuration
- ❌ Network configuration in code

The issue **IS** with:
- ✅ **MetaMask configuration** (most likely)
- ✅ **Network mismatch in MetaMask**
- ✅ **Gas settings in MetaMask**
- ✅ **RPC endpoint issues in MetaMask**

## Solution Steps

### Step 1: Verify MetaMask Network

1. Open MetaMask
2. Click on the network dropdown (top left)
3. Verify you're on **"Polygon Amoy Testnet"**
4. If not, switch to it or add it manually:

**Network Details:**
```
Network Name: Polygon Amoy Testnet
RPC URL: https://rpc-amoy.polygon.technology/
Chain ID: 80002
Currency Symbol: MATIC
Block Explorer: https://amoy.polygonscan.com/
```

### Step 2: Check Wallet Balance

1. Make sure your wallet has enough MATIC for gas
2. Minimum recommended: 0.1 MATIC
3. Get test MATIC from: https://faucet.polygon.technology/

Current deployer balance: **49.72 MATIC** ✅

### Step 3: Clear MetaMask Cache

1. Go to MetaMask Settings
2. Advanced → Reset Account
3. This clears transaction history and nonce issues

### Step 4: Try Different RPC Endpoints

If the default RPC is having issues, try these alternatives:

**Option 1: Alchemy**
```
https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY
```

**Option 2: Infura**
```
https://polygon-amoy.infura.io/v3/YOUR_API_KEY
```

**Option 3: Public RPC (backup)**
```
https://rpc-amoy.polygon.technology/
```

### Step 5: Check Gas Settings

When the MetaMask popup appears:
1. Click "Edit" on gas settings
2. Try "Aggressive" gas settings
3. Or manually set:
   - Gas Limit: 250,000
   - Max Priority Fee: 30 gwei
   - Max Fee: 250 gwei

### Step 6: Browser Console Debugging

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try minting again
4. Look for detailed error messages

Expected console output:
```javascript
Minting NFT with params: {
  tokenURI: "ipfs://...",
  royaltyPercent: 500,
  category: "collectible",
  contractAddress: "0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5"
}
```

### Step 7: Test with Hardhat Script First

Before using the frontend, verify the contract works:

```bash
cd contracts
npx hardhat run scripts/test-mint.js --network polygonAmoy
```

If this works but frontend doesn't, it's definitely a MetaMask/browser issue.

## Common Error Messages and Solutions

### "Internal JSON-RPC error"
**Causes:**
1. Wrong network in MetaMask
2. RPC endpoint issues
3. Gas estimation failure
4. Nonce issues

**Solutions:**
- Verify network is Polygon Amoy (Chain ID: 80002)
- Try different RPC endpoint
- Reset MetaMask account
- Increase gas limit manually

### "Insufficient funds"
**Cause:** Not enough MATIC for gas

**Solution:** Get test MATIC from faucet

### "Transaction underpriced"
**Cause:** Gas price too low

**Solution:** Increase gas price in MetaMask

### "Nonce too low"
**Cause:** Transaction nonce mismatch

**Solution:** Reset MetaMask account

## Verification Checklist

Before attempting to mint from frontend:

- [ ] MetaMask installed and unlocked
- [ ] Connected to Polygon Amoy Testnet (Chain ID: 80002)
- [ ] Wallet has sufficient MATIC (>0.1 MATIC)
- [ ] Contract verified on Polygonscan
- [ ] Hardhat test script works
- [ ] Frontend dev server running (http://localhost:5174)
- [ ] Backend API running (http://localhost:8000)
- [ ] Browser console open for debugging

## Testing Workflow

1. **Test contract directly:**
   ```bash
   cd contracts
   npx hardhat run scripts/test-mint.js --network polygonAmoy
   ```

2. **If contract works, test frontend:**
   - Open http://localhost:5174
   - Connect wallet
   - Verify network in MetaMask shows "Polygon Amoy Testnet"
   - Try minting
   - Check browser console for errors

3. **If frontend fails:**
   - Check MetaMask network
   - Try resetting MetaMask account
   - Try different RPC endpoint
   - Check gas settings

## Additional Resources

- **Polygon Amoy Faucet:** https://faucet.polygon.technology/
- **Amoy Explorer:** https://amoy.polygonscan.com/
- **Contract Address:** https://amoy.polygonscan.com/address/0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5
- **RPC Status:** https://polygon.technology/blog/introducing-the-amoy-testnet-for-polygon-pos

## Next Steps

1. **User should verify MetaMask network** - This is the most likely issue
2. If network is correct, try resetting MetaMask account
3. If still failing, try a different RPC endpoint
4. Check browser console for specific error details
5. Share console error logs for further debugging

## Success Indicators

When minting works correctly, you should see:
1. MetaMask popup asking to confirm transaction
2. Transaction hash in console
3. "Transaction confirmed" message
4. NFT appears in your profile
5. Transaction visible on Polygonscan

## Contract Verification

Contract is deployed and working:
- ✅ Deployed to: `0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5`
- ✅ Network: Polygon Amoy Testnet
- ✅ Verified on Polygonscan
- ✅ Test mint successful via Hardhat
- ✅ Gas cost: ~0.05 MATIC per mint
