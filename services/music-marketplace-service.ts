import { CreateTokenRequest, TokenCreationResult } from '@/types/music-token';
// DEMO ONLY: Removed Solana imports to prevent MWA integration attempts
// TODO: INTEGRATION READY - Uncomment for Solana App Kit integration:
// import { Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
// import { useSolanaAppKit } from '@solanaappkit/react';
// import { useMobileWalletAdapter } from '@solana-mobile/mobile-wallet-adapter';

// Core Music Token Interface
export interface MusicToken {
  id: string;
  name: string;
  symbol: string;
  artist: string;
  description: string;
  isrc: string;
  
  // Financial Data
  initialPrice: number;
  currentPrice: number;
  totalSupply: number;
  circulatingSupply: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChange7d: number;
  
  // Rights & Revenue
  publishingRights: number;
  projectedRevenue: number;
  projectedDividends: number;
  roi: number;
  
  // Status & Lifecycle
  status: 'launching' | 'trading' | 'graduated' | 'ipo';
  launchDate: Date;
  graduationDate?: Date;
  ipoDate?: Date;
  
  // Metadata
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
  };
  
  // Social & Trading
  socialLinks: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
  };
  
  tradingHistory: Array<{
    timestamp: Date;
    price: number;
    volume: number;
    type: 'buy' | 'sell';
  }>;
  
  // Technical
  creator: string;
  transactionHash: string;
  mintAddress: string;
}

// Bonding Curve Configuration
export interface BondingCurveConfig {
  k: number; // Bonding curve constant
  reserveRatio: number; // Reserve ratio for price calculation
  priceImpactMultiplier: number; // How much trades affect price
}

// Market Statistics
export interface MarketStats {
  totalTokens: number;
  totalMarketCap: number;
  totalVolume24h: number;
  activeTokens: number;
  graduatedTokens: number;
  averageROI: number;
}

// ROI Projection
export interface ROIProjection {
  currentPrice: number;
  projectedPrice: number;
  potentialReturn: number;
  breakEvenPrice: number;
  timeToBreakEven: number; // in days
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Music Marketplace Service - Core business logic for music token trading
 * 
 * INTEGRATION READY: This service is designed to integrate with:
 * - Solana App Kit: @https://docs.solanaappkit.com/docs/modules/overview
 * - Mobile Wallet Adapter: @https://github.com/solana-mobile/mobile-wallet-adapter
 * - Pump.fun style bonding curves: @https://docs.solanaappkit.com/docs/modules/pumpfun
 * 
 * TODO: For blockchain integration:
 * 1. Uncomment Solana imports above
 * 2. Replace mock wallet with real MWA connection
 * 3. Implement actual blockchain transactions in createToken()
 * 4. Add real-time price feeds from DEX aggregators
 * 5. Implement actual bonding curve mechanics on-chain
 */
export class MusicMarketplaceService {
  private tokens: Map<string, MusicToken> = new Map();
  
  // DEMO ONLY: Removed connection and wallet dependencies to prevent MWA integration attempts
  // TODO: INTEGRATION READY - Uncomment for Solana App Kit integration:
  // private connection: Connection | null = null;
  // private userPublicKey: string | null = null;
  // private signAndSendTransaction: ((transaction: any, minContextSlot?: number) => Promise<string>) | null = null;
  
  private onStatusUpdate?: (status: string) => void;
  private simulationInterval: number | null = null;
  
  // Configuration
  private bondingCurveConfig: BondingCurveConfig = {
    k: 0.1,
    reserveRatio: 0.5,
    priceImpactMultiplier: 0.05,
  };
  
  private simulationConfig = {
    baseROI: 0.15, // 15% base ROI
    graduationThreshold: 1000000, // $1M market cap
    ipoThreshold: 5000000, // $5M market cap
    priceVolatility: 0.03, // 3% daily volatility
    tradingVolumeMultiplier: 1.2,
  };

  // DEMO ONLY: Simplified constructor without MWA dependencies
  constructor(config?: {
    onStatusUpdate?: (status: string) => void;
  }) {
    if (config) {
      this.onStatusUpdate = config.onStatusUpdate;
    }
    
    // Initialize with example tokens
    this.initializeExampleTokens();
    this.startSimulation();
  }

  /**
   * Initialize example tokens for demonstration
   */
  private initializeExampleTokens(): void {
    const exampleTokens: MusicToken[] = [
      {
        id: '1',
        name: 'Midnight Dreams',
        symbol: 'DREAM',
        artist: 'Luna Echo',
        description: 'A haunting electronic ballad about lost love and redemption.',
        isrc: 'USRC12345678',
        initialPrice: 0.25,
        currentPrice: 0.32,
        totalSupply: 500000,
        circulatingSupply: 450000,
        marketCap: 144000,
        volume24h: 12500,
        priceChange24h: 8.5,
        priceChange7d: 28.0,
        publishingRights: 80,
        projectedRevenue: 85000, // Tier 1: Established artist ($85K annually)
        projectedDividends: 12750,
        roi: 0.28,
        status: 'trading',
        launchDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        songMetadata: {
          title: 'Midnight Dreams',
          artist: 'Luna Echo',
          isrc: 'USRC12345678',
          genre: 'Electronic',
          duration: '3:45',
          bpm: 128,
          key: 'Am',
          releaseDate: '2024-01-15',
          compositionDate: '2023-11-20',
          publishingRevenue: 85000,
          artistAllocation: 80,
        },
        socialLinks: {
          spotify: 'https://open.spotify.com/track/example1',
          appleMusic: 'https://music.apple.com/track/example1',
        },
        tradingHistory: [
          {
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            price: 0.25,
            volume: 3000,
            type: 'buy'
          },
          {
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            price: 0.30,
            volume: 5000,
            type: 'buy'
          }
        ],
        creator: 'mock-wallet-key',
        transactionHash: 'mock-tx-hash-1',
        mintAddress: 'mock-mint-1',
      },
      {
        id: '2',
        name: 'Ocean Waves',
        symbol: 'WAVES',
        artist: 'Marina Blue',
        description: 'A soothing ambient track inspired by the ocean.',
        isrc: 'USRC87654321',
        initialPrice: 0.15,
        currentPrice: 0.18,
        totalSupply: 750000,
        circulatingSupply: 700000,
        marketCap: 126000,
        volume24h: 8900,
        priceChange24h: 5.2,
        priceChange7d: 20.0,
        publishingRights: 75,
        projectedRevenue: 45000, // Tier 2: Mid-level artist ($45K annually)
        projectedDividends: 6750,
        roi: 0.20,
        status: 'trading',
        launchDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        songMetadata: {
          title: 'Ocean Waves',
          artist: 'Marina Blue',
          isrc: 'USRC87654321',
          genre: 'Ambient',
          duration: '4:20',
          bpm: 85,
          key: 'C',
          releaseDate: '2024-01-10',
          compositionDate: '2023-12-05',
          publishingRevenue: 45000,
          artistAllocation: 75,
        },
        socialLinks: {
          spotify: 'https://open.spotify.com/track/example2',
          youtube: 'https://youtube.com/watch?v=example2',
        },
        tradingHistory: [
          {
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            price: 0.15,
            volume: 2000,
            type: 'buy'
          },
          {
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            price: 0.17,
            volume: 4000,
            type: 'buy'
          }
        ],
        creator: 'mock-wallet-key',
        transactionHash: 'mock-tx-hash-2',
        mintAddress: 'mock-mint-2',
      },
      {
        id: '3',
        name: 'Urban Rhythm',
        symbol: 'RHYTHM',
        artist: 'Beat Master',
        description: 'High-energy hip-hop track with infectious beats.',
        isrc: 'USRC11223344',
        initialPrice: 0.10,
        currentPrice: 0.12,
        totalSupply: 1000000,
        circulatingSupply: 950000,
        marketCap: 114000,
        volume24h: 15600,
        priceChange24h: 12.0,
        priceChange7d: 35.0,
        publishingRights: 70,
        projectedRevenue: 12000, // Tier 3: Emerging artist ($12K annually)
        projectedDividends: 1800,
        roi: 0.35,
        status: 'launching',
        launchDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        songMetadata: {
          title: 'Urban Rhythm',
          artist: 'Beat Master',
          isrc: 'USRC11223344',
          genre: 'Hip-Hop',
          duration: '3:15',
          bpm: 95,
          key: 'F',
          releaseDate: '2024-01-20',
          compositionDate: '2024-01-05',
          publishingRevenue: 12000,
          artistAllocation: 70,
        },
        socialLinks: {
          spotify: 'https://open.spotify.com/track/example3',
          appleMusic: 'https://music.apple.com/track/example3',
        },
        tradingHistory: [
          {
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            price: 0.10,
            volume: 6000,
            type: 'buy'
          },
          {
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            price: 0.11,
            volume: 8000,
            type: 'buy'
          }
        ],
        creator: 'mock-wallet-key',
        transactionHash: 'mock-tx-hash-3',
        mintAddress: 'mock-mint-3',
      },
    ];

    // Add example tokens to the map
    exampleTokens.forEach(token => {
      this.tokens.set(token.id, token);
    });
  }

  // ===== TOKEN CREATION (IPO Value Calculation) =====
  
  /**
   * Create a new music token with IPO value calculation
   */
  async createToken(request: CreateTokenRequest): Promise<TokenCreationResult> {
    try {
      this.onStatusUpdate?.('Creating token...');
      
      // Calculate IPO value
      const ipoValue = this.calculateIPOValue(request);
      
      // Create simulated transaction signature
      const txSignature = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the token
      const token = await this.createSimulatedToken(request, ipoValue, txSignature);
      
      this.onStatusUpdate?.('Token created successfully!');
      
      return {
        success: true,
        tokenId: token.id,
        transactionHash: txSignature,
      };
    } catch (error) {
      console.error('Token creation failed:', error);
      this.onStatusUpdate?.('Token creation failed');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Calculate IPO value based on publishing revenue estimate
   */
  private calculateIPOValue(request: CreateTokenRequest): number {
    const baseRevenue = request.initialPrice * request.initialSupply * 100; // Simulated annual revenue
    const publishingRevenue = baseRevenue * (request.publishingRights / 100);
    const projectedDividends = publishingRevenue * (this.simulationConfig.baseROI / 100);
    
    // IPO value = projected dividends * multiplier
    const ipoMultiplier = 20; // 20x projected dividends
    return Math.round(projectedDividends * ipoMultiplier * 100) / 100;
  }

  /**
   * Create simulated token with calculated IPO value
   */
  private async createSimulatedToken(
    request: CreateTokenRequest, 
    ipoValue: number, 
    txSignature: string
  ): Promise<MusicToken> {
    const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mintAddress = `mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const projectedRevenue = ipoValue / 20; // Reverse calculation
    const projectedDividends = projectedRevenue * (this.simulationConfig.baseROI / 100);

    const token: MusicToken = {
      id: tokenId,
      name: request.name,
      symbol: request.symbol,
      artist: request.artist,
      description: request.description,
      isrc: request.isrc || '',
      
      // Financial Data
      initialPrice: ipoValue / request.initialSupply,
      currentPrice: ipoValue / request.initialSupply,
      totalSupply: request.initialSupply,
      circulatingSupply: request.initialSupply * 0.8, // 80% initially circulating
      marketCap: ipoValue,
      volume24h: 0,
      priceChange24h: 0,
      priceChange7d: 0,
      
      // Rights & Revenue
      publishingRights: request.publishingRights,
      projectedRevenue,
      projectedDividends,
      roi: this.simulationConfig.baseROI,
      
      // Status & Lifecycle
      status: 'launching',
      launchDate: new Date(),
      
      // Metadata
      songMetadata: request.songMetadata,
      socialLinks: request.socialLinks,
      tradingHistory: [],
             creator: 'mock-wallet-key',
      transactionHash: txSignature,
      mintAddress,
    };

    this.tokens.set(tokenId, token);
    console.log('🎵 Created token:', token.name, 'IPO Value:', ipoValue);
    
    return token;
  }

  // ===== BONDING CURVE & PRICE SIMULATION =====
  
  /**
   * Calculate tokens for SOL using bonding curve
   */
  calculateTokensForSol(token: MusicToken, solAmount: number): number {
    const { k, reserveRatio } = this.bondingCurveConfig;
    const currentSupply = token.circulatingSupply;
    const currentPrice = token.currentPrice;
    
    // Bonding curve formula: tokens = supply * (1 - (1 - sol/reserve)^(1/reserveRatio))
    const reserve = currentSupply * currentPrice;
    const tokens = currentSupply * (1 - Math.pow(1 - solAmount / reserve, 1 / reserveRatio));
    
    return Math.max(0, tokens);
  }

  /**
   * Calculate SOL for tokens using bonding curve
   */
  calculateSolForTokens(token: MusicToken, tokenAmount: number): number {
    const { k, reserveRatio } = this.bondingCurveConfig;
    const currentSupply = token.circulatingSupply;
    const currentPrice = token.currentPrice;
    
    // Reverse bonding curve formula
    const reserve = currentSupply * currentPrice;
    const sol = reserve * (1 - Math.pow(1 - tokenAmount / currentSupply, reserveRatio));
    
    return Math.max(0, sol);
  }

  /**
   * Calculate price impact of a trade
   */
  calculatePriceImpact(token: MusicToken, amount: number, isBuy: boolean): number {
    const impact = (amount / token.marketCap) * this.bondingCurveConfig.priceImpactMultiplier;
    return isBuy ? impact : -impact;
  }

  /**
   * Execute a trade and update token price
   */
  executeTrade(tokenId: string, amount: number, type: 'buy' | 'sell'): boolean {
    const token = this.tokens.get(tokenId);
    if (!token) return false;

    // Calculate price impact
    const priceImpact = this.calculatePriceImpact(token, amount, type === 'buy');
    const newPrice = Math.max(0.001, token.currentPrice * (1 + priceImpact));
    
    // Update token data
    token.currentPrice = newPrice;
    token.marketCap = token.currentPrice * token.circulatingSupply;
    token.volume24h += amount;

    // Add to trading history
    token.tradingHistory.push({
      timestamp: new Date(),
      price: token.currentPrice,
      volume: amount,
      type,
    });

    // Keep only last 100 trades
    if (token.tradingHistory.length > 100) {
      token.tradingHistory = token.tradingHistory.slice(-100);
    }

    return true;
  }

  // ===== ROI PROJECTIONS =====
  
  /**
   * Calculate ROI projection for a token purchase
   */
  calculateROIProjection(token: MusicToken, investmentAmount: number): ROIProjection {
    const tokensToBuy = this.calculateTokensForSol(token, investmentAmount);
    const currentValue = tokensToBuy * token.currentPrice;
    
    // Project future price based on growth rate
    const growthRate = token.roi / 365; // Daily growth rate
    const projectedPrice = token.currentPrice * Math.pow(1 + growthRate, 30); // 30 days projection
    const projectedValue = tokensToBuy * projectedPrice;
    const potentialReturn = projectedValue - investmentAmount;
    
    // Calculate break-even
    const breakEvenPrice = investmentAmount / tokensToBuy;
    const timeToBreakEven = Math.log(breakEvenPrice / token.currentPrice) / Math.log(1 + growthRate);
    
    // Determine risk level
    const riskLevel = token.marketCap < 100000 ? 'high' : 
                     token.marketCap < 1000000 ? 'medium' : 'low';

    return {
      currentPrice: token.currentPrice,
      projectedPrice,
      potentialReturn,
      breakEvenPrice,
      timeToBreakEven: Math.max(0, timeToBreakEven),
      riskLevel,
    };
  }

  // ===== MARKET SIMULATION =====
  
  /**
   * Start market simulation
   */
  private startSimulation(): void {
    this.simulationInterval = setInterval(() => {
      this.tokens.forEach(token => {
        this.simulateTokenActivity(token);
      });
    }, 5000); // Update every 5 seconds
  }

  /**
   * Simulate token activity (price movement, status changes)
   */
  private simulateTokenActivity(token: MusicToken): void {
    // Simulate price movement
    const priceChange = (Math.random() - 0.5) * 2 * this.simulationConfig.priceVolatility;
    const newPrice = token.currentPrice * (1 + priceChange);
    
    // Update price and market cap
    token.currentPrice = Math.max(0.001, newPrice);
    token.marketCap = token.currentPrice * token.circulatingSupply;
    
    // Update price changes
    token.priceChange24h = priceChange * 100;
    
    // Check for status changes
    this.checkStatusChanges(token);
  }

  /**
   * Check and update token status based on market cap
   */
  private checkStatusChanges(token: MusicToken): void {
    const now = new Date();
    const daysSinceLaunch = (now.getTime() - token.launchDate.getTime()) / (1000 * 60 * 60 * 24);

    // Graduation to trading (after 7 days and $1M market cap)
    if (token.status === 'launching' && daysSinceLaunch >= 7 && token.marketCap >= this.simulationConfig.graduationThreshold) {
      token.status = 'trading';
      console.log('🎓 Token graduated to trading:', token.name);
    }

    // IPO eligibility (after 30 days and $5M market cap)
    if (token.status === 'trading' && daysSinceLaunch >= 30 && token.marketCap >= this.simulationConfig.ipoThreshold) {
      token.status = 'ipo';
      token.ipoDate = now;
      console.log('📈 Token eligible for IPO:', token.name);
    }

    // Graduation to main exchange (after 90 days and sustained growth)
    if (token.status === 'ipo' && daysSinceLaunch >= 90 && token.marketCap >= this.simulationConfig.ipoThreshold * 2) {
      token.status = 'graduated';
      token.graduationDate = now;
      console.log('🚀 Token graduated to main exchange:', token.name);
    }
  }

  // ===== SIMULATION EVENTS =====
  
  /**
   * Simulate Musika Labs securing a tour for an artist
   */
  simulateTourAnnouncement(tokenId: string): boolean {
    const token = this.tokens.get(tokenId);
    if (!token) return false;

    // Tour announcement typically increases projected revenue by 40-60%
    const revenueIncrease = 0.5 + Math.random() * 0.2; // 50-70% increase
    const newProjectedRevenue = token.projectedRevenue * (1 + revenueIncrease);
    
    // Update token data
    token.projectedRevenue = newProjectedRevenue;
    token.projectedDividends = newProjectedRevenue * (this.simulationConfig.baseROI / 100);
    
    // Price typically increases by 20-40% on tour announcement
    const priceIncrease = 0.2 + Math.random() * 0.2; // 20-40% increase
    token.currentPrice = token.currentPrice * (1 + priceIncrease);
    token.marketCap = token.currentPrice * token.circulatingSupply;
    
    // Update ROI
    token.roi = (token.projectedDividends / token.marketCap) * 100;
    
    console.log('🎤 Tour announced for:', token.name, 'Price increased by', (priceIncrease * 100).toFixed(1) + '%');
    return true;
  }

  /**
   * Simulate token graduating to major exchanges (Raydium/Orca) after $20k lifetime volume
   */
  simulateGraduation(tokenId: string): boolean {
    const token = this.tokens.get(tokenId);
    if (!token) return false;

    // Check if token has sufficient volume (simulate $20k threshold)
    const lifetimeVolume = token.tradingHistory.reduce((sum, trade) => sum + trade.volume, 0);
    if (lifetimeVolume < 20000) {
      console.log('📊 Insufficient volume for graduation:', token.name, 'Volume:', lifetimeVolume);
      return false;
    }

    // Graduation to major exchanges
    token.status = 'graduated';
    token.graduationDate = new Date();
    
    // Price increases by 20x (2000%) on graduation to major exchanges
    const priceIncrease = 20; // 20x increase
    token.currentPrice = token.currentPrice * priceIncrease;
    token.marketCap = token.currentPrice * token.circulatingSupply;
    
    // Increase trading volume due to new exchange listings
    token.volume24h *= 10; // 10x volume increase
    
    console.log('🚀 Token graduated to major exchanges:', token.name, 'Price increased by 20x (2000%)');
    return true;
  }

  instantGraduation(tokenId: string): boolean {
    const token = this.tokens.get(tokenId);
    if (!token) return false;

    // Instant graduation for demo - bypasses volume requirement
    token.status = 'graduated';
    token.graduationDate = new Date();

    // Price increases by 20x (2000%) on graduation to major exchanges
    const priceIncrease = 20; // 20x increase
    token.currentPrice = token.currentPrice * priceIncrease;
    token.marketCap = token.currentPrice * token.circulatingSupply;

    // Increase trading volume due to new exchange listings
    token.volume24h *= 10; // 10x volume increase

    console.log('⚡ Token instantly graduated for demo:', token.name, 'Price increased by 20x (2000%)');
    return true;
  }

  getLifetimeVolume(tokenId: string): number {
    const token = this.tokens.get(tokenId);
    if (!token) return 0;
    
    const lifetimeVolume = token.tradingHistory.reduce((sum, trade) => sum + trade.volume, 0);
    console.log(`📊 Lifetime volume for ${token.name}: $${lifetimeVolume.toFixed(2)}`);
    return lifetimeVolume;
  }

  /**
   * Simulate increased demand from major exchange listing
   */
  simulateExchangeDemand(tokenId: string): boolean {
    const token = this.tokens.get(tokenId);
    if (!token || token.status !== 'graduated') return false;

    // Major exchange listing typically drives 30-60% price increase
    const priceIncrease = 0.3 + Math.random() * 0.3; // 30-60% increase
    token.currentPrice = token.currentPrice * (1 + priceIncrease);
    token.marketCap = token.currentPrice * token.circulatingSupply;
    
    // Increase volume due to new exchange access
    token.volume24h *= 2; // 2x volume increase
    
    console.log('📈 Exchange demand surge for:', token.name, 'Price increased by', (priceIncrease * 100).toFixed(1) + '%');
    return true;
  }

  /**
   * Update market stats to be more realistic for touring artists
   */
  updateRealisticMarketStats(): void {
    // Update example tokens with more realistic touring artist data
    const updatedTokens = [
      {
        id: '1',
        name: 'Midnight Dreams',
        symbol: 'DREAM',
        artist: 'Luna Echo',
        description: 'A haunting electronic ballad about lost love and redemption.',
        isrc: 'USRC12345678',
        initialPrice: 0.25,
        currentPrice: 0.42, // Increased due to touring success
        totalSupply: 500000,
        circulatingSupply: 450000,
        marketCap: 189000, // Increased market cap
        volume24h: 28500, // Higher volume from touring
        priceChange24h: 12.5,
        priceChange7d: 68.0, // Strong weekly performance
        publishingRights: 80,
        projectedRevenue: 45000, // Increased from touring
        projectedDividends: 6750,
        roi: 0.48, // Higher ROI
        status: 'trading',
        launchDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        songMetadata: {
          title: 'Midnight Dreams',
          artist: 'Luna Echo',
          isrc: 'USRC12345678',
          genre: 'Electronic',
          duration: '3:45',
          bpm: 128,
          key: 'Am',
          releaseDate: '2024-01-15',
          compositionDate: '2023-11-20',
          publishingRevenue: 45000, // Updated
          artistAllocation: 80,
        },
        socialLinks: {
          spotify: 'https://open.spotify.com/track/example1',
          appleMusic: 'https://music.apple.com/track/example1',
        },
        tradingHistory: [
          {
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            price: 0.25,
            volume: 3000,
            type: 'buy'
          },
          {
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            price: 0.35,
            volume: 5000,
            type: 'buy'
          }
        ],
        creator: 'mock-wallet-key',
        transactionHash: 'mock-tx-hash-1',
        mintAddress: 'mock-mint-1',
      },
      {
        id: '2',
        name: 'Ocean Waves',
        symbol: 'WAVES',
        artist: 'Marina Blue',
        description: 'A soothing ambient track inspired by the ocean.',
        isrc: 'USRC87654321',
        initialPrice: 0.15,
        currentPrice: 0.28, // Increased from festival performances
        totalSupply: 750000,
        circulatingSupply: 700000,
        marketCap: 196000, // Higher market cap
        volume24h: 22400, // Increased volume
        priceChange24h: 8.2,
        priceChange7d: 86.7, // Strong weekly growth
        publishingRights: 75,
        projectedRevenue: 32000, // Increased from festival circuit
        projectedDividends: 4800,
        roi: 0.41, // Higher ROI
        status: 'trading',
        launchDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        songMetadata: {
          title: 'Ocean Waves',
          artist: 'Marina Blue',
          isrc: 'USRC87654321',
          genre: 'Ambient',
          duration: '4:20',
          bpm: 85,
          key: 'C',
          releaseDate: '2024-01-10',
          compositionDate: '2023-12-05',
          publishingRevenue: 32000, // Updated
          artistAllocation: 75,
        },
        socialLinks: {
          spotify: 'https://open.spotify.com/track/example2',
          youtube: 'https://youtube.com/watch?v=example2',
        },
        tradingHistory: [
          {
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            price: 0.15,
            volume: 2000,
            type: 'buy'
          },
          {
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            price: 0.22,
            volume: 4000,
            type: 'buy'
          }
        ],
        creator: 'mock-wallet-key',
        transactionHash: 'mock-tx-hash-2',
        mintAddress: 'mock-mint-2',
      },
      {
        id: '3',
        name: 'Urban Rhythm',
        symbol: 'RHYTHM',
        artist: 'Beat Master',
        description: 'High-energy hip-hop track with infectious beats.',
        isrc: 'USRC11223344',
        initialPrice: 0.10,
        currentPrice: 0.18, // Increased from club performances
        totalSupply: 1000000,
        circulatingSupply: 950000,
        marketCap: 171000, // Higher market cap
        volume24h: 34200, // High volume from club scene
        priceChange24h: 15.0,
        priceChange7d: 80.0, // Strong weekly performance
        publishingRights: 70,
        projectedRevenue: 28000, // Increased from club licensing
        projectedDividends: 4200,
        roi: 0.49, // Higher ROI
        status: 'trading',
        launchDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        songMetadata: {
          title: 'Urban Rhythm',
          artist: 'Beat Master',
          isrc: 'USRC11223344',
          genre: 'Hip-Hop',
          duration: '3:15',
          bpm: 95,
          key: 'F',
          releaseDate: '2024-01-20',
          compositionDate: '2024-01-05',
          publishingRevenue: 28000, // Updated
          artistAllocation: 70,
        },
        socialLinks: {
          spotify: 'https://open.spotify.com/track/example3',
          appleMusic: 'https://music.apple.com/track/example3',
        },
        tradingHistory: [
          {
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            price: 0.10,
            volume: 6000,
            type: 'buy'
          },
          {
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            price: 0.15,
            volume: 8000,
            type: 'buy'
          }
        ],
        creator: 'mock-wallet-key',
        transactionHash: 'mock-tx-hash-3',
        mintAddress: 'mock-mint-3',
      },
    ];

    // Update tokens in the map
    this.tokens.clear();
    updatedTokens.forEach(token => {
      this.tokens.set(token.id, token as MusicToken);
    });

    console.log('📊 Updated market stats with realistic touring artist data');
  }

  // ===== GETTERS =====
  
  /**
   * Get all tokens
   */
  getAllTokens(): MusicToken[] {
    return Array.from(this.tokens.values());
  }

  /**
   * Get token by ID
   */
  getToken(id: string): MusicToken | undefined {
    return this.tokens.get(id);
  }

  /**
   * Get trending tokens
   */
  getTrendingTokens(limit: number = 10): MusicToken[] {
    return Array.from(this.tokens.values())
      .filter(token => token.status === 'trading' || token.status === 'ipo' || token.status === 'graduated')
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, limit);
  }

  /**
   * Get tokens by status
   */
  getTokensByStatus(status: MusicToken['status']): MusicToken[] {
    return Array.from(this.tokens.values()).filter(token => token.status === status);
  }

  /**
   * Get market statistics
   */
  getMarketStats(): MarketStats {
    const tokens = Array.from(this.tokens.values());
    const activeTokens = tokens.filter(t => t.status === 'trading' || t.status === 'ipo' || t.status === 'graduated');
    const graduatedTokens = tokens.filter(t => t.status === 'graduated');

    return {
      totalTokens: tokens.length,
      totalMarketCap: tokens.reduce((sum, t) => sum + t.marketCap, 0),
      totalVolume24h: tokens.reduce((sum, t) => sum + t.volume24h, 0),
      activeTokens: activeTokens.length,
      graduatedTokens: graduatedTokens.length,
      averageROI: tokens.length > 0 ? tokens.reduce((sum, t) => sum + t.roi, 0) / tokens.length : 0,
    };
  }

  // ===== UTILITY METHODS =====
  
  /**
   * Stop simulation
   */
  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  /**
   * Update service configuration
   */
  // DEMO ONLY: Simplified config update without MWA dependencies
  updateConfig(config: {
    onStatusUpdate?: (status: string) => void;
  }): void {
    if (config.onStatusUpdate) this.onStatusUpdate = config.onStatusUpdate;
  }
}

// Export singleton instance
export const musicMarketplaceService = new MusicMarketplaceService(); 