# NFT Marketplace Frontend - Testing Guide

## 🚀 Development Server

The application is running at: **http://localhost:5174/**

## ✅ What's Implemented

### Pages
1. **Home Page** (`/`) - Landing page with featured NFTs and transaction feed
2. **Marketplace** (`/marketplace`) - Browse all NFTs with filters and search
3. **Mint NFT** (`/mint`) - Create new NFTs (mock implementation)
4. **Profile** (`/profile`) - User's NFT collection with 3 tabs:
   - 我创作的 (Created)
   - 我收藏的 (Collected)
   - 出售中 (On Sale)
5. **NFT Detail** (`/nft/:id`) - View NFT details, buy, or burn

### Features
- ✅ Multi-language support (中文/日本語/English)
- ✅ Wallet connection (mock)
- ✅ NFT browsing and filtering
- ✅ NFT minting form with validation
- ✅ NFT purchasing (mock)
- ✅ NFT burning with confirmation
- ✅ Real-time transaction feed
- ✅ Responsive design
- ✅ Web3 cyber-punk aesthetic

### Mock Data
- 24 NFTs across different categories
- 20 recent transactions
- Mock wallet connection

## 🧪 Testing Checklist

### Navigation
- [ ] Click through all pages in the header
- [ ] Test language switcher (中/日/EN)
- [ ] Verify footer links

### Wallet
- [ ] Click "Connect Wallet" button
- [ ] Select MetaMask in modal
- [ ] Verify wallet address displays
- [ ] Test disconnect

### Marketplace
- [ ] Browse all NFTs
- [ ] Filter by category
- [ ] Filter by price range
- [ ] Search by name
- [ ] Sort by different options
- [ ] Click on NFT cards

### NFT Detail
- [ ] View NFT information
- [ ] Click "Buy Now" button
- [ ] Verify purchase confirmation
- [ ] Test "Burn NFT" for owned NFTs
- [ ] Verify burn warning messages

### Mint Page
- [ ] Fill out mint form
- [ ] Test file upload (mock)
- [ ] Test form validation
- [ ] Submit form
- [ ] Verify success message

### Profile Page
- [ ] Switch between tabs
- [ ] View created NFTs
- [ ] View collected NFTs
- [ ] View NFTs on sale
- [ ] Test burn functionality

### Responsive Design
- [ ] Test on desktop
- [ ] Test on tablet
- [ ] Test on mobile

## 🎨 Design Features

- Deep dark blue background (#0a0e27)
- Neon gradient effects
- Glassmorphism cards
- Smooth animations
- Hover effects
- Custom scrollbars

## 📝 Notes

- All blockchain interactions are mocked
- No real wallet connection required
- No real transactions occur
- Data persists only in memory (resets on refresh)

## 🐛 Known Limitations

- Mock data only (no backend)
- No real IPFS integration
- No real smart contract interaction
- No persistent storage
