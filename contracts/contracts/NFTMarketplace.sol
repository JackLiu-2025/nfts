// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NFTMarketplace
 * @dev NFT Marketplace contract with minting, listing, buying, and burning functionality
 */
contract NFTMarketplace is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, ReentrancyGuard {
    
    uint256 private _tokenIdCounter;
    
    // Marketplace fee (configurable, default 2.5%)
    uint256 public marketplaceFeePercent = 250; // 2.5% = 250 basis points
    uint256 public constant MAX_MARKETPLACE_FEE = 1000; // Maximum 10% = 1000 basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    // Maximum royalty percentage (10%)
    uint256 public constant MAX_ROYALTY_PERCENT = 1000; // 10% = 1000 basis points
    
    // Fee control
    bool public feesEnabled = true;
    
    struct NFTListing {
        uint256 price;
        address seller;
        bool isListed;
    }
    
    struct NFTInfo {
        address creator;
        uint256 royaltyPercent; // in basis points (e.g., 500 = 5%)
        string category;
    }
    
    // Mapping from token ID to listing info
    mapping(uint256 => NFTListing) public listings;
    
    // Mapping from token ID to NFT info
    mapping(uint256 => NFTInfo) public nftInfo;
    
    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string tokenURI,
        uint256 royaltyPercent,
        string category
    );
    
    event NFTListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    
    event NFTSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    
    event ListingCancelled(
        uint256 indexed tokenId,
        address indexed seller
    );
    
    event NFTBurned(
        uint256 indexed tokenId,
        address indexed burner
    );
    
    event MarketplaceFeeUpdated(
        uint256 oldFeePercent,
        uint256 newFeePercent
    );
    
    event FeesEnabledChanged(
        bool enabled
    );
    
    constructor() ERC721("NFT Marketplace", "NFTM") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new NFT
     * @param uri The metadata URI for the NFT
     * @param royaltyPercent The royalty percentage in basis points (max 1000 = 10%)
     * @param category The category of the NFT
     */
    function mintNFT(
        string memory uri,
        uint256 royaltyPercent,
        string memory category
    ) public returns (uint256) {
        require(royaltyPercent <= MAX_ROYALTY_PERCENT, "Royalty too high");
        require(bytes(uri).length > 0, "Token URI cannot be empty");
        require(bytes(category).length > 0, "Category cannot be empty");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        
        nftInfo[tokenId] = NFTInfo({
            creator: msg.sender,
            royaltyPercent: royaltyPercent,
            category: category
        });
        
        emit NFTMinted(tokenId, msg.sender, uri, royaltyPercent, category);
        
        return tokenId;
    }
    
    /**
     * @dev List an NFT for sale
     * @param tokenId The ID of the NFT to list
     * @param price The listing price in wei
     */
    function listNFT(uint256 tokenId, uint256 price) public {
        require(_ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].isListed, "Already listed");
        
        listings[tokenId] = NFTListing({
            price: price,
            seller: msg.sender,
            isListed: true
        });
        
        emit NFTListed(tokenId, msg.sender, price);
    }
    
    /**
     * @dev Cancel an NFT listing
     * @param tokenId The ID of the NFT to cancel listing
     */
    function cancelListing(uint256 tokenId) public {
        require(listings[tokenId].isListed, "Not listed");
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        
        delete listings[tokenId];
        
        emit ListingCancelled(tokenId, msg.sender);
    }
    
    /**
     * @dev Buy a listed NFT
     * @param tokenId The ID of the NFT to buy
     */
    function buyNFT(uint256 tokenId) public payable nonReentrant {
        NFTListing memory listing = listings[tokenId];
        require(listing.isListed, "NFT not listed");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");
        
        NFTInfo memory info = nftInfo[tokenId];
        
        // Calculate fees
        uint256 marketplaceFee = feesEnabled 
            ? (listing.price * marketplaceFeePercent) / BASIS_POINTS 
            : 0;
        uint256 royaltyFee = (listing.price * info.royaltyPercent) / BASIS_POINTS;
        uint256 sellerProceeds = listing.price - marketplaceFee - royaltyFee;
        
        // Transfer NFT
        address seller = listing.seller;
        delete listings[tokenId];
        _transfer(seller, msg.sender, tokenId);
        
        // Transfer payments
        if (marketplaceFee > 0) {
            payable(owner()).transfer(marketplaceFee);
        }
        if (royaltyFee > 0) {
            payable(info.creator).transfer(royaltyFee);
        }
        payable(seller).transfer(sellerProceeds);
        
        // Refund excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
        
        emit NFTSold(tokenId, seller, msg.sender, listing.price);
    }
    
    /**
     * @dev Burn an NFT (only owner can burn)
     * @param tokenId The ID of the NFT to burn
     */
    function burnNFT(uint256 tokenId) public {
        require(_ownerOf(tokenId) == msg.sender, "Not the owner");
        
        // Cancel listing if exists
        if (listings[tokenId].isListed) {
            delete listings[tokenId];
        }
        
        // Delete NFT info
        delete nftInfo[tokenId];
        
        // Burn the token
        _burn(tokenId);
        
        emit NFTBurned(tokenId, msg.sender);
    }
    
    /**
     * @dev Get NFT info
     * @param tokenId The ID of the NFT
     */
    function getNFTInfo(uint256 tokenId) public view returns (
        address creator,
        uint256 royaltyPercent,
        string memory category,
        address owner,
        string memory uri
    ) {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        
        NFTInfo memory info = nftInfo[tokenId];
        return (
            info.creator,
            info.royaltyPercent,
            info.category,
            _ownerOf(tokenId),
            tokenURI(tokenId)
        );
    }
    
    /**
     * @dev Get listing info
     * @param tokenId The ID of the NFT
     */
    function getListing(uint256 tokenId) public view returns (
        uint256 price,
        address seller,
        bool isListed
    ) {
        NFTListing memory listing = listings[tokenId];
        return (listing.price, listing.seller, listing.isListed);
    }
    
    /**
     * @dev Get total number of minted NFTs
     */
    function getTotalMinted() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Set marketplace fee percentage (only owner)
     * @param newFeePercent The new fee percentage in basis points (max 1000 = 10%)
     */
    function setMarketplaceFee(uint256 newFeePercent) public onlyOwner {
        require(newFeePercent <= MAX_MARKETPLACE_FEE, "Fee exceeds maximum");
        uint256 oldFee = marketplaceFeePercent;
        marketplaceFeePercent = newFeePercent;
        emit MarketplaceFeeUpdated(oldFee, newFeePercent);
    }
    
    /**
     * @dev Enable or disable marketplace fees (only owner)
     * @param enabled Whether fees should be enabled
     */
    function setFeesEnabled(bool enabled) public onlyOwner {
        feesEnabled = enabled;
        emit FeesEnabledChanged(enabled);
    }
    
    /**
     * @dev Get current marketplace fee configuration
     */
    function getMarketplaceFeeConfig() public view returns (
        uint256 feePercent,
        bool enabled,
        uint256 maxFeePercent
    ) {
        return (marketplaceFeePercent, feesEnabled, MAX_MARKETPLACE_FEE);
    }
    
    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
