# Musika - Music IP Token Marketplace

A Solana Mobile dApp for tokenizing and trading music intellectual property rights, built with React Native, Expo, and Solana Mobile Wallet Adapter.

## 🚀 Integration Ready for Hackathon

This application is **ready for blockchain integration** and can be easily connected to:
- **Solana App Kit**: @https://docs.solanaappkit.com/docs/modules/overview
- **Mobile Wallet Adapter**: @https://github.com/solana-mobile/mobile-wallet-adapter  
- **Pump.fun Style Bonding Curves**: @https://docs.solanaappkit.com/docs/modules/pumpfun

### Quick Integration Steps:
1. Uncomment Solana imports in `services/music-marketplace-service.ts`
2. Replace mock wallet with real MWA connection
3. Implement actual blockchain transactions in `createToken()` and `executeTrade()`
4. Add real-time price feeds from DEX aggregators
5. Implement actual bonding curve mechanics on-chain

**All integration points are clearly marked with TODO comments throughout the codebase.**

## 🎵 Overview

Musika is a **demo platform** that allows artists and investors to tokenize and trade compositional rights to music. Similar to pump.fun/bonk.fun, it uses bonding curve mechanics for price discovery and provides dividend-yielding tokens that represent shares of music publishing and royalty rights.

### Current Demo State
- **Pure UI Simulation**: All blockchain interactions are simulated for demonstration
- **Mock Wallet**: Uses simulated wallet for demo purposes
- **Local Storage**: Token holdings stored locally via AsyncStorage
- **Realistic Data**: Includes example tokens with realistic market data
- **Simulation Features**: Tour announcements, graduation, and exchange demand simulation

### Production Ready Features
- **Complete UI/UX**: Fully functional marketplace interface
- **Token Creation**: Complete token creation flow with revenue splits
- **Trading Simulation**: Buy/sell functionality with price impact
- **Portfolio Management**: Holdings display with real-time updates
- **Market Statistics**: Real-time market cap, volume, and ROI tracking

### Key Features

- **Music IP Tokenization**: Create tokens representing compositional rights to songs
- **Bonding Curve Trading**: Automated market making with Bancor-style bonding curves
- **Dividend Distribution**: Tokens yield dividends from music royalties
- **Mobile-First Design**: Built for Solana Mobile with wallet integration
- **Compositional Rights Focus**: Specifically designed for music publishing rights
- **Ownership Splits**: Transparent display of songwriter, producer, and publisher splits

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React Native with Expo
- **Blockchain**: Solana
- **Wallet Integration**: Solana Mobile Wallet Adapter
- **Token Standard**: SPL Tokens with Metaplex metadata
- **State Management**: React Query + Local State
- **UI Components**: Custom components with LinearGradient and Ionicons

### Project Structure

```
M6D2/
├── app/                          # Expo Router app structure
│   ├── (tabs)/                   # Tab navigation
│   │   ├── marketplace/          # Music token marketplace (main demo)
│   │   ├── account/              # Portfolio & simulation controls
│   │   └── settings/             # App settings
├── components/                   # Reusable UI components
│   ├── music-marketplace/       # Main marketplace components
│   │   └── MusicMarketplace.tsx # Core marketplace UI
│   ├── account/                 # Account & portfolio components
│   │   └── account-feature.tsx  # Holdings & simulation controls
│   ├── solana/                  # Solana integration components (unused in demo)
│   └── ui/                      # Base UI components
├── hooks/                       # Custom React hooks
│   └── use-music-marketplace.ts # Central marketplace hook
├── services/                    # Business logic services
│   └── music-marketplace-service.ts # Core marketplace logic
├── types/                       # TypeScript type definitions
│   └── music-token.ts           # Music token interfaces
└── assets/                      # Images, fonts, and branding
    ├── images/                  # Token images and logos
    └── fonts/                   # Custom fonts
```

### Clean Architecture
- **Single Service Pattern**: All business logic centralized in `MusicMarketplaceService`
- **Custom Hook**: `useMusicMarketplace` provides all marketplace functionality
- **Component-Based UI**: Modular React Native components
- **Type Safety**: Full TypeScript coverage with proper interfaces

## 🎮 Demo Features & Simulation

### Simulation Controls
The demo includes interactive simulation features accessible from the Account tab:

- **Tour Announcement**: Simulates Musika Labs securing a tour, increasing token ROI
- **Graduation**: Simulates token reaching $20k lifetime volume and graduating to major exchanges
- **Exchange Demand**: Simulates increased demand from Raydium/Orca listings
- **Instant Graduation**: Demo button for immediate 20x price increase (bypasses volume requirements)

### Market Simulation
- **Real-time Price Updates**: Simulated price movements every 5 seconds
- **Volume Tracking**: Lifetime volume calculation for graduation mechanics
- **Status Progression**: Tokens progress through launching → trading → graduated states
- **Realistic Data**: Example tokens represent different artist tiers (all generating $5K+ annually)

### Token Creation Flow
- **Revenue Splits**: Artist %, Publisher %, Other Musika Users %
- **Rights Offered**: Slider for % of rights offered for sale
- **Supply Calculation**: Dynamic supply based on total revenue and rights percentage
- **ISRC Integration**: International Standard Recording Code tracking
- **Test Token**: Auto-populate button for quick demo setup

## 🎼 Music Token System

### Token Structure

Each music token represents compositional rights to a song and includes:

```typescript
interface MusicToken {
  mint: string;                    // Solana token mint address
  name: string;                    // Token name
  symbol: string;                  // Token symbol
  description: string;             // Token description
  artist: string;                  // Primary artist
  imageUrl: string;                // Token artwork
  totalSupply: number;             // Total token supply
  circulatingSupply: number;       // Tokens in circulation
  currentPrice: number;            // Current price in SOL
  totalVolume: number;             // 24h trading volume
  marketCap: number;               // Market capitalization
  dividendYield: number;           // Annual dividend yield %
  lastDividendPayout: number;      // Last dividend amount
  isrc?: string;                   // International Standard Recording Code
  
  // Compositional rights specific fields
  compositionalRights: number;     // % of compositional rights
  royaltyShare: number;            // % of royalties
  publishingRights: number;        // % of publishing rights
  
  // Song metadata
  songMetadata: {
    title: string;
    artist: string;
    isrc: string;
    genre: string;
    duration: string;
    bpm?: number;
    key?: string;
    releaseDate: string;
    compositionDate: string;
    ownershipSplits: OwnershipSplit[];
  };
  
  // Bonding curve parameters
  bondingCurveParams: {
    k: number;                     // Bonding curve constant
    reserveRatio: number;          // Reserve ratio for price calculation
  };
  
  // Social and streaming links
  socialLinks: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
  };
}
```

### Ownership Splits

The system tracks detailed ownership splits for each song:

```typescript
interface OwnershipSplit {
  role: string;                    // e.g., "Composer", "Lyricist", "Producer"
  name: string;                    // Contributor name
  percentage: number;              // Ownership percentage
  walletAddress?: string;          // Contributor wallet
  isTokenized: boolean;            // Whether this split is available as tokens
}
```

## 📈 Bonding Curve Mechanics

### Price Calculation

The platform uses Bancor-style bonding curves for automated market making:

```typescript
// Price calculation using bonding curve formula
const calculatePrice = (token: MusicToken, tokenAmount: number): number => {
  const { k, reserveRatio } = token.bondingCurveParams;
  const currentSupply = token.circulatingSupply;
  
  // Price = k * (currentSupply + tokenAmount)^(reserveRatio - 1)
  const price = k * Math.pow(currentSupply + tokenAmount, reserveRatio - 1);
  return price;
};
```

### Token Purchase/Sale

- **Buying**: Users pay SOL to receive tokens based on the bonding curve
- **Selling**: Users receive SOL for their tokens based on the bonding curve
- **Price Impact**: Large trades have higher price impact due to curve mechanics

## 🎯 Core Components

### 1. Marketplace Screen (`app/(tabs)/marketplace/index.tsx`)

The main marketplace interface featuring:

- **Header**: Gradient background with title and "Tokenize Song" button
- **Statistics Cards**: Total tokens, volume, and average rights available
- **Token List**: Scrollable list of available music tokens
- **Pull-to-Refresh**: Refresh token data
- **Wallet Integration**: Connect wallet to enable trading

### 2. MusicTokenCard Component (`components/music-token/MusicTokenCard.tsx`)

Displays individual music tokens with:

- **Token Artwork**: Song cover image
- **Song Information**: Title, artist, ISRC, genre, duration, BPM
- **Market Data**: Price, market cap, volume, dividend yield
- **Ownership Splits**: Visual breakdown of compositional rights
- **Trading Buttons**: Buy/Sell actions with modal integration

### 3. BuySellModal Component (`components/music-token/BuySellModal.tsx`)

Trading interface with:

- **Amount Input**: SOL or token amount input
- **Real-time Calculations**: Estimated tokens/SOL to receive
- **Price Impact Warning**: Visual indicators for large trades
- **Token Statistics**: Market cap, volume, dividend yield
- **Confirmation**: Final trade execution

### 4. Bonding Curve Hook (`hooks/use-bonding-curve.ts`)

Provides bonding curve calculations:

- `calculatePrice()`: Calculate token price at given supply
- `calculateTokensForSol()`: Calculate tokens received for SOL
- `calculateSolForTokens()`: Calculate SOL received for tokens
- `getPriceImpact()`: Calculate price impact of trade

### 5. Music Token Service (`services/music-token-service.ts`)

Handles token operations:

- **Token Creation**: Mint new SPL tokens with metadata
- **Token Fetching**: Get all tokens or specific token
- **Trading**: Buy/sell token operations
- **Dividend History**: Track dividend payouts

## 🔧 Technical Implementation

### Solana Integration

The app integrates with Solana using:

- **Solana Web3.js**: Core blockchain interaction
- **SPL Token**: Token creation and management
- **Metaplex**: Token metadata standards
- **Mobile Wallet Adapter**: Wallet connection and transaction signing

### Wallet Integration

```typescript
// Wallet connection using Mobile Wallet Adapter
const { account } = useWalletUi();
const { authorizeSession } = useAuthorization();

// Transaction execution
await transact(async (wallet: Web3MobileWallet) => {
  const authResult = await authorizeSession(wallet);
  // Execute transaction...
});
```

### State Management

- **React Query**: Server state management for token data
- **Local State**: UI state management with useState/useEffect
- **Custom Hooks**: Encapsulated business logic

### Error Handling

- **Try-catch blocks**: Graceful error handling
- **User feedback**: Alert dialogs for errors
- **Loading states**: Visual feedback during operations
- **Retry mechanisms**: Allow users to retry failed operations

## 🎨 UI/UX Design

### Design Principles

- **Mobile-First**: Optimized for mobile devices
- **Gradient Backgrounds**: Modern visual appeal
- **Card-Based Layout**: Clean, organized information display
- **Intuitive Navigation**: Easy-to-use tab structure
- **Visual Feedback**: Loading states and animations

### Color Scheme

- **Primary**: Purple gradient (#667eea to #764ba2)
- **Success**: Green (#27ae60)
- **Error**: Red (#e74c3c)
- **Background**: White and light gray (#f8f9fa)
- **Text**: Dark gray (#333) and medium gray (#666)

### Typography

- **Headers**: Bold, large fonts for titles
- **Body**: Regular weight for content
- **Labels**: Smaller, lighter fonts for metadata
- **Numbers**: Bold for important statistics

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Android Studio with emulator
- Solana CLI tools
- Expo CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd M6D2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run android
   ```

4. **Run on Android emulator**
   - Press 'a' in the Expo terminal to open Android
   - Or scan the QR code with Expo Go app

### Development Commands

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Build for production
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## 📱 Demo Data

The app includes demo music tokens with realistic data:

### Sample Tokens

1. **Midnight Dreams** (MDREAMS)
   - Artist: Sarah Johnson
   - Genre: R&B
   - Price: 0.05 SOL
   - Dividend Yield: 8.5%

2. **Electric Storm** (ESTORM)
   - Artist: DJ Thunder
   - Genre: Electronic
   - Price: 0.08 SOL
   - Dividend Yield: 6.2%

3. **Ocean Waves** (OWAVES)
   - Artist: Luna Moon
   - Genre: Ambient
   - Price: 0.03 SOL
   - Dividend Yield: 12.0%

### Ownership Splits Example

```
Midnight Dreams Ownership:
- Composer (Sarah Johnson): 60% (Tokenized)
- Lyricist (Sarah Johnson): 40% (Tokenized)
- Publisher (Johnson Publishing): 25% (Not Tokenized)
- Producer (Mike Davis): 15% (Not Tokenized)
```

## 🔐 Security Considerations

### Smart Contract Security

- **Token Validation**: Verify token authenticity
- **Access Control**: Proper authorization checks
- **Reentrancy Protection**: Prevent reentrancy attacks
- **Input Validation**: Validate all user inputs

### Wallet Security

- **Transaction Signing**: Secure transaction approval
- **Private Key Protection**: Never expose private keys
- **Session Management**: Proper session handling
- **Error Handling**: Graceful error recovery

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd M6D2

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the Demo

1. **Start the App**: Run `npm start` and scan QR code with Expo Go app
2. **Marketplace Tab**: View example tokens and create new ones
3. **Account Tab**: View holdings and use simulation controls
4. **Token Creation**: Use the "Create Token" button with test data
5. **Trading**: Buy tokens and watch your portfolio grow
6. **Simulation**: Use the simulation buttons to test different scenarios

### Demo Walkthrough

1. **Browse Tokens**: View the marketplace with example tokens
2. **Create Token**: Click "Create Token" and use "Populate Test Data"
3. **Buy Tokens**: Purchase tokens from the marketplace
4. **Check Holdings**: Go to Account tab to see your portfolio
5. **Simulate Events**: Use simulation buttons to test token performance
6. **Watch Growth**: Refresh marketplace to see updated values

## 🧪 Testing

### Manual Testing

1. **Token Creation**: Test the complete token creation flow
2. **Trading**: Test buy/sell functionality with price impact
3. **Simulation**: Test all simulation buttons and features
4. **Portfolio**: Verify holdings display and updates
5. **Market Data**: Check real-time market statistics

### Demo Testing

```bash
# Start the demo
npm start

# Test on device
# Scan QR code with Expo Go app
```

## 🔮 Blockchain Integration Roadmap

### Phase 1: Solana App Kit Integration
1. **Real Wallet Connection**: Replace mock wallet with MWA
2. **SPL Token Minting**: Actual token creation on Solana
3. **Real Transactions**: Implement actual buy/sell transactions
4. **Metaplex Metadata**: Add proper token metadata standards

### Phase 2: Advanced Features
1. **Bonding Curve Smart Contracts**: On-chain price discovery
2. **Dividend Distribution**: Automated royalty payments
3. **DEX Integration**: Real-time price feeds from Raydium/Orca
4. **Cross-chain Bridges**: Interoperability with other chains

### Phase 3: Production Features
1. **Advanced Analytics**: Trading charts and metrics
2. **Social Features**: Comments and ratings
3. **AI Integration**: Music recommendation engine
4. **Performance Optimization**: WebAssembly calculations

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow TypeScript best practices
2. **Component Structure**: Use functional components with hooks
3. **Error Handling**: Implement proper error boundaries
4. **Testing**: Write unit tests for new features
5. **Documentation**: Update documentation for changes

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Solana Foundation**: For the mobile dApp template and Solana App Kit
- **Solana Mobile**: For the Mobile Wallet Adapter protocol
- **Expo**: For the React Native development platform
- **Metaplex**: For token metadata standards
- **Pump.fun**: For inspiration on bonding curve mechanics and graduation system

## 📞 Support

For support and questions:

- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Documentation**: Check the docs folder
- **Community**: Join our Discord server

---

**Note**: This is a demo implementation for educational purposes. The bonding curve calculations and trading functionality are simulated and do not execute real blockchain transactions.
