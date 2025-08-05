export interface MusicToken {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  artist: string;
  imageUrl: string;
  totalSupply: number;
  circulatingSupply: number;
  currentPrice: number;
  totalVolume: number;
  marketCap: number;
  dividendYield: number;
  lastDividendPayout: number;
  isrc?: string;
  // Compositional rights specific fields
  compositionalRights: number; // Percentage of compositional rights
  royaltyShare: number; // Percentage of royalties
  publishingRights: number; // Percentage of publishing rights
  // Song metadata based on PNG examples
  songMetadata: {
    title: string;
    artist: string;
    isrc: string;
    genre: string;
    duration: string;
    bpm: number;
    key: string;
    releaseDate: string;
    compositionDate: string;
    publishingRevenue?: number;
    artistAllocation?: number;
    // Split ownership structure
    ownershipSplits: OwnershipSplit[];
  };
  bondingCurveParams: {
    k: number; // Bonding curve constant
    reserveRatio: number; // Reserve ratio for price calculation
  };
  socialLinks: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OwnershipSplit {
  role: string; // e.g., "Composer", "Lyricist", "Producer", "Publisher"
  name: string;
  percentage: number;
  walletAddress?: string;
  isTokenized: boolean; // Whether this split is available as tokens
}

export interface CreateTokenRequest {
  name: string;
  symbol: string;
  description: string;
  artist: string;
  imageFile?: File;
  imageUrl?: string;
  isrc?: string;
  compositionalRights: number;
  royaltyShare: number;
  publishingRights: number;
  initialPrice: number;
  initialSupply: number;
  songMetadata: {
    title: string;
    artist: string;
    isrc: string;
    genre: string;
    duration: string;
    bpm: number;
    key: string;
    releaseDate: string;
    compositionDate: string;
    publishingRevenue?: number;
    artistAllocation?: number;
    ownershipSplits: OwnershipSplit[];
  };
  socialLinks: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface TokenCreationResult {
  success: boolean;
  tokenId?: string;
  transactionHash?: string;
  error?: string;
}

export interface TokenTransaction {
  id: string;
  tokenMint: string;
  type: 'buy' | 'sell' | 'dividend';
  amount: number;
  price: number;
  totalValue: number;
  userAddress: string;
  timestamp: Date;
  transactionHash: string;
}

export interface DividendPayout {
  id: string;
  tokenMint: string;
  amountPerToken: number;
  totalAmount: number;
  payoutDate: Date;
  transactionHash: string;
  source: 'spotify' | 'apple_music' | 'youtube' | 'publishing' | 'other';
} 