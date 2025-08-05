/**
 * Music Marketplace Component - Main UI for music token trading
 * 
 * INTEGRATION READY: This component is designed to integrate with:
 * - Solana App Kit: @https://docs.solanaappkit.com/docs/modules/overview
 * - Mobile Wallet Adapter: @https://github.com/solana-mobile/mobile-wallet-adapter
 * - Pump.fun style bonding curves: @https://docs.solanaappkit.com/docs/modules/pumpfun
 * 
 * TODO: For blockchain integration:
 * 1. Uncomment wallet dependencies below
 * 2. Replace mock wallet with real MWA connection
 * 3. Implement actual blockchain transactions in handleTrade()
 * 4. Add real-time price feeds from DEX aggregators
 * 5. Implement actual bonding curve mechanics on-chain
 */
// DEMO ONLY: Removed wallet dependencies to prevent MWA integration attempts
// TODO: INTEGRATION READY - Uncomment for Solana App Kit integration:
// import { useWalletUi } from '@/components/solana/use-wallet-ui';
import { useMusicMarketplace } from '@/hooks/use-music-marketplace';
import { MusicToken } from '@/services/music-marketplace-service';
import { CreateTokenRequest } from '@/types/music-token';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface MusicMarketplaceProps {
  onTokenPress?: (token: MusicToken) => void;
  onHoldingsUpdate?: () => void;
}

export function MusicMarketplace({ onTokenPress, onHoldingsUpdate }: MusicMarketplaceProps) {
  const {
    tokens,
    marketStats,
    trendingTokens,
    loading,
    error,
    createToken,
    isCreating,
    creationStatus,
    executeTrade,
    calculateTokensForSol,
    calculateSolForTokens,
    calculatePriceImpact,
    calculateROIProjection,
    getTokensByStatus,
    formatPrice,
    formatMarketCap,
    formatVolume,
    getStatusColor,
    getStatusIcon,
  } = useMusicMarketplace();

  // DEMO ONLY: Removed wallet connection check for pure UI demonstration
  // const { account } = useWalletUi();
  // const isWalletConnected = !!account;
  const isWalletConnected = true; // Always show as connected for demo

  // UI State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showTokenDetailModal, setShowTokenDetailModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<MusicToken | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'launching' | 'trading' | 'graduated'>('all');

  // Create Token Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    symbol: '',
    artist: '',
    isrc: '',
    // description removed from form, will be shown in detail view
    averageRevenue: '10000',
    artistSplit: '50',
    publisherSplit: '40',
    otherSplit: '10',
    rightsOffered: 50, // percent
    initialPrice: '0.1',
    initialSupply: '', // calculated
  });

  // Test token data for auto-population
  const testTokenData = {
    name: 'Midnight Dreams',
    symbol: 'DREAM',
    artist: 'Luna Echo',
    isrc: 'USRC12345678',
    averageRevenue: '25000',
    artistSplit: '50',
    publisherSplit: '40',
    otherSplit: '10',
    rightsOffered: 50,
    initialPrice: '0.25',
    initialSupply: '12500', // calculated based on revenue and rights offered
  };

  // Calculate supply based on revenue and rights offered
  const calculateSupply = () => {
    const revenue = parseFloat(createForm.averageRevenue);
    const percent = createForm.rightsOffered;
    if (isNaN(revenue) || isNaN(percent)) return '';
    // 1 token per $1 of revenue offered
    return Math.round((revenue * percent) / 100).toString();
  };

  // Update supply when revenue or rights offered changes
  React.useEffect(() => {
    const newSupply = calculateSupply();
    if (newSupply !== createForm.initialSupply) {
      setCreateForm(prev => ({ ...prev, initialSupply: newSupply }));
    }
  }, [createForm.averageRevenue, createForm.rightsOffered]);

  // Filtered tokens based on active tab
  const filteredTokens = activeTab === 'all' 
    ? tokens 
    : getTokensByStatus(activeTab as MusicToken['status']);

  const populateTestToken = () => {
    setCreateForm(testTokenData);
  };

  const handleCreateToken = async () => {
    if (!createForm.name || !createForm.symbol || !createForm.artist || 
        !createForm.isrc || !createForm.averageRevenue || 
        !createForm.artistSplit || !createForm.publisherSplit || !createForm.otherSplit || 
        !createForm.initialPrice || !createForm.initialSupply) {
      Alert.alert('Error', 'Please fill in all required fields (marked with *)');
      return;
    }

    // Validate splits sum to 100%
    const totalSplit = parseInt(createForm.artistSplit) + parseInt(createForm.publisherSplit) + parseInt(createForm.otherSplit);
    if (totalSplit !== 100) {
      Alert.alert('Error', 'Splits must sum to 100%');
      return;
    }

    const request: CreateTokenRequest = {
      name: createForm.name,
      symbol: createForm.symbol,
      description: `A music token for ${createForm.name} by ${createForm.artist}`, // Generate description
      artist: createForm.artist,
      isrc: createForm.isrc,
      compositionalRights: 100,
      royaltyShare: 50,
      publishingRights: parseFloat(createForm.artistSplit),
      initialPrice: parseFloat(createForm.initialPrice),
      initialSupply: parseInt(createForm.initialSupply),
      songMetadata: {
        title: createForm.name,
        artist: createForm.artist,
        isrc: createForm.isrc,
        genre: 'Music',
        duration: '3:30',
        bpm: 120,
        key: 'C',
        releaseDate: new Date().toISOString().split('T')[0],
        compositionDate: new Date().toISOString().split('T')[0],
        ownershipSplits: [],
      },
      socialLinks: {},
    };

    try {
      await createToken(request);
      setShowCreateModal(false);
      setCreateForm({
        name: '', symbol: '', artist: '', isrc: '',
        averageRevenue: '10000', artistSplit: '50', publisherSplit: '40', otherSplit: '10',
        rightsOffered: 50, initialPrice: '0.1', initialSupply: '',
      });
      Alert.alert('Success', 'Musika Token created successfully! 🎵');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create token';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleTrade = () => {
    if (!selectedToken || !tradeAmount || isNaN(Number(tradeAmount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amount = Number(tradeAmount);
    const success = executeTrade(selectedToken.id, amount, tradeType);
    
    if (success) {
      // For demo purposes, simulate adding to holdings
      if (tradeType === 'buy') {
        const tokensReceived = calculateTokensForSol(selectedToken, amount);
        // Store in AsyncStorage for React Native demo
        try {
          AsyncStorage.getItem('musika-holdings').then((stored: string | null) => {
            const holdings = stored ? JSON.parse(stored) : [];
            const existingHolding = holdings.find((h: any) => h.tokenId === selectedToken.id);
            
            if (existingHolding) {
              existingHolding.amount += tokensReceived;
            } else {
              holdings.push({
                tokenId: selectedToken.id,
                tokenName: selectedToken.songMetadata.title,
                tokenArtist: selectedToken.songMetadata.artist,
                tokenSymbol: selectedToken.symbol,
                amount: tokensReceived,
                currentPrice: selectedToken.currentPrice
              });
            }
            
            AsyncStorage.setItem('musika-holdings', JSON.stringify(holdings));
          });
          
          // Notify parent component that holdings have been updated
          if (onHoldingsUpdate) {
            onHoldingsUpdate();
          }
        } catch (error) {
          console.log('Demo: Simulated token purchase');
        }
      }
      
      setShowTradeModal(false);
      setTradeAmount('');
      setSelectedToken(null);
      Alert.alert('Success', `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${amount} SOL worth of tokens`);
    } else {
      Alert.alert('Error', 'Trade failed');
    }
  };

  const openTradeModal = (token: MusicToken, type: 'buy' | 'sell') => {
    setSelectedToken(token);
    setTradeType(type);
    setShowTradeModal(true);
  };

  const calculateTradePreview = () => {
    if (!selectedToken || !tradeAmount || isNaN(Number(tradeAmount))) {
      return { tokens: 0, sol: 0, priceImpact: 0 };
    }

    const amount = Number(tradeAmount);
    const tokens = calculateTokensForSol(selectedToken, amount);
    const sol = calculateSolForTokens(selectedToken, amount);
    const priceImpact = calculatePriceImpact(selectedToken, amount, tradeType === 'buy');

    return { tokens, sol, priceImpact };
  };

  const getROIProjection = () => {
    if (!selectedToken || !tradeAmount || isNaN(Number(tradeAmount))) {
      return null;
    }

    return calculateROIProjection(selectedToken, Number(tradeAmount));
  };

  // Function to get different placeholder images based on token name
  const getTokenImage = (tokenName: string) => {
    const images = [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop',
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=150&h=150&fit=crop',
    ];
    const index = tokenName.length % images.length;
    return images[index];
  };

  // Function to get different background colors for token images
  const getTokenImageColor = (tokenName: string) => {
    const colors = ['#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec', '#f1f8e9', '#e0f2f1', '#fafafa'];
    const index = tokenName.length % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading marketplace...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
             {/* Header */}
       <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
                   <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.logoText}>MUSIKA</Text>
              <Text style={styles.headerTitle}>Marketplace</Text>
            </View>
            <View style={[styles.walletStatus, { backgroundColor: isWalletConnected ? '#4CAF50' : '#6366f1' }]}>
              <Ionicons 
                name={isWalletConnected ? 'wallet' : 'wallet-outline'} 
                size={16} 
                color="white" 
              />
              <Text style={styles.walletStatusText}>
                {isWalletConnected ? 'Mock Wallet' : 'Simulation Mode'}
              </Text>
            </View>
          </View>
         <Text style={styles.headerSubtitle}>Invest in Music Publishing Rights</Text>
        
        {/* Market Stats */}
        <View style={styles.marketStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{marketStats.totalTokens}</Text>
            <Text style={styles.statLabel}>Tokenized Songs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatMarketCap(marketStats.totalMarketCap)}</Text>
            <Text style={styles.statLabel}>Market Cap</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatVolume(marketStats.totalVolume24h)}</Text>
            <Text style={styles.statLabel}>24h Volume</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{marketStats.graduatedTokens}</Text>
            <Text style={styles.statLabel}>Graduated</Text>
          </View>
        </View>
      </LinearGradient>

             {/* Create Token Button */}
       <TouchableOpacity 
         style={styles.createButton}
         onPress={() => setShowCreateModal(true)}
       >
         <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.createButtonGradient}>
           <Ionicons name="add-circle" size={24} color="white" />
           <Text style={styles.createButtonText}>Create Musika Token</Text>
         </LinearGradient>
       </TouchableOpacity>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['all', 'launching', 'trading', 'graduated'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

             {/* Publishing Revenue Info */}
       <View style={styles.rightsInfoContainer}>
                  <Text style={styles.rightsInfoTitle}>🎵 Musika Publishing Revenue</Text>
         <Text style={styles.rightsInfoText}>
           Each token represents ownership in music publishing revenue streams. 
           Buy tokens to earn royalties from streaming, licensing, and other publishing income.
         </Text>
         <View style={styles.rightsStats}>
           <View style={styles.rightsStat}>
             <Text style={styles.rightsStatValue}>${tokens.reduce((sum, t) => sum + (t.songMetadata.publishingRevenue || 0), 0).toLocaleString()}</Text>
             <Text style={styles.rightsStatLabel}>Total Annual Revenue</Text>
           </View>
           <View style={styles.rightsStat}>
             <Text style={styles.rightsStatValue}>{tokens.length}</Text>
             <Text style={styles.rightsStatLabel}>Tokenized Songs</Text>
           </View>
         </View>
       </View>

      {/* Token List */}
      <ScrollView style={styles.tokenList} showsVerticalScrollIndicator={false}>
        {filteredTokens.map((token) => (
                     <TouchableOpacity
             key={token.id}
             style={styles.tokenCard}
             onPress={() => {
               setSelectedToken(token);
               setShowTokenDetailModal(true);
             }}
           >
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.cardGradient}
            >
              {/* Token Image */}
              <View style={styles.tokenImageContainer}>
                <View style={[styles.tokenImage, { backgroundColor: getTokenImageColor(token.songMetadata.title) }]}>
                  <Image 
                    source={{ uri: getTokenImage(token.songMetadata.title) }}
                    style={styles.tokenImageContent}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Token Header */}
              <View style={styles.tokenHeader}>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenName}>{token.songMetadata.title}</Text>
                  <Text style={styles.tokenArtist}>{token.songMetadata.artist}</Text>
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                </View>
                <View style={styles.tokenPrice}>
                  <Text style={styles.priceText}>{formatPrice(token.currentPrice)} SOL</Text>
                  <Text style={[
                    styles.priceChange,
                    { color: token.priceChange24h >= 0 ? '#4CAF50' : '#FF3B30' }
                  ]}>
                    {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                  </Text>
                </View>
              </View>

              {/* Token Stats */}
              <View style={styles.tokenStats}>
                <View style={styles.stat}>
                  <Text style={styles.tokenStatLabel}>Market Cap</Text>
                  <Text style={styles.tokenStatValue}>{formatMarketCap(token.marketCap)}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.tokenStatLabel}>Volume</Text>
                  <Text style={styles.tokenStatValue}>{formatVolume(token.volume24h)}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.tokenStatLabel}>ROI</Text>
                  <Text style={styles.tokenStatValue}>{(token.roi * 100).toFixed(1)}%</Text>
                </View>
              </View>

              {/* Status Badge */}
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(token.status) }]}>
                <Ionicons name={getStatusIcon(token.status) as any} size={12} color="white" />
                <Text style={styles.statusText}>{token.status.toUpperCase()}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.buyButton]}
                  onPress={() => openTradeModal(token, 'buy')}
                >
                  <Ionicons name="trending-up" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.sellButton]}
                  onPress={() => openTradeModal(token, 'sell')}
                >
                  <Ionicons name="trending-down" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Sell</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Create Token Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
                         <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Create Musika Token</Text>
              <View style={styles.modalHeaderButtons}>
                                 <TouchableOpacity 
                   style={styles.testTokenButton}
                   onPress={populateTestToken}
                 >
                   <Ionicons name="flask" size={16} color="#6366f1" />
                   <Text style={styles.testTokenButtonText}>Test Token</Text>
                 </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

                                                   <ScrollView style={styles.modalContent}>
                <View style={styles.formSection}>
                  <Text style={styles.sectionLabel}>Song Information</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Song Title *"
                    value={createForm.name}
                    onChangeText={(text) => setCreateForm({ ...createForm, name: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Artist Name *"
                    value={createForm.artist}
                    onChangeText={(text) => setCreateForm({ ...createForm, artist: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="ISRC *"
                    value={createForm.isrc}
                    onChangeText={(text) => setCreateForm({ ...createForm, isrc: text })}
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.sectionLabel}>Token Configuration</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Token Symbol (e.g., DREAM) *"
                    value={createForm.symbol}
                    onChangeText={(text) => setCreateForm({ ...createForm, symbol: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Initial Token Price (SOL) *"
                    value={createForm.initialPrice}
                    onChangeText={(text) => setCreateForm({ ...createForm, initialPrice: text })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.sectionLabel}>Revenue & Splits</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Average Annual Revenue (USD) *"
                    value={createForm.averageRevenue}
                    onChangeText={(text) => setCreateForm({ ...createForm, averageRevenue: text })}
                    keyboardType="numeric"
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, marginRight: 4 }}>
                      <Text style={styles.inputLabel}>Artist %</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Artist %"
                        keyboardType="numeric"
                        value={createForm.artistSplit}
                        onChangeText={(text) => setCreateForm({ ...createForm, artistSplit: text })}
                      />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 4 }}>
                      <Text style={styles.inputLabel}>Publisher %</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Publisher %"
                        keyboardType="numeric"
                        value={createForm.publisherSplit}
                        onChangeText={(text) => setCreateForm({ ...createForm, publisherSplit: text })}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 4 }}>
                      <Text style={styles.inputLabel}>Other Musika Users %</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Other %"
                        keyboardType="numeric"
                        value={createForm.otherSplit}
                        onChangeText={(text) => setCreateForm({ ...createForm, otherSplit: text })}
                      />
                    </View>
                  </View>
                  <Text style={{ color: (parseInt(createForm.artistSplit) + parseInt(createForm.publisherSplit) + parseInt(createForm.otherSplit) === 100) ? 'green' : 'red', marginTop: 4 }}>
                    Total: {parseInt(createForm.artistSplit) + parseInt(createForm.publisherSplit) + parseInt(createForm.otherSplit)}%
                  </Text>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.sectionLabel}>Rights Offered & Supply</Text>
                  <Text style={{ marginBottom: 8 }}>% of Rights Offered: {createForm.rightsOffered}%</Text>
                  <View style={{ height: 40, justifyContent: 'center' }}>
                    <View style={{ width: '100%', height: 4, backgroundColor: '#ddd', borderRadius: 2 }}>
                      <View 
                        style={{ 
                          width: `${createForm.rightsOffered}%`, 
                          height: '100%', 
                          backgroundColor: '#6366f1', 
                          borderRadius: 2 
                        }} 
                      />
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.sliderButton}
                    onPress={() => {
                      const newValue = createForm.rightsOffered >= 100 ? 1 : createForm.rightsOffered + 10;
                      setCreateForm({ ...createForm, rightsOffered: newValue });
                    }}
                  >
                    <Text style={styles.sliderButtonText}>Adjust Rights Offered</Text>
                  </TouchableOpacity>
                  <Text style={{ marginTop: 8 }}>Calculated Supply: {createForm.initialSupply || 'Enter revenue first'}</Text>
                </View>
              </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createModalButton]}
                onPress={handleCreateToken}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.createModalButtonText}>Create Musika Token</Text>
                )}
              </TouchableOpacity>
            </View>

            {creationStatus && (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>{creationStatus}</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Trade Modal */}
      <Modal
        visible={showTradeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedToken?.symbol}
              </Text>
              <TouchableOpacity onPress={() => setShowTradeModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {selectedToken && (
                <>
                  <View style={styles.tokenPreview}>
                    <Text style={styles.tokenPreviewName}>{selectedToken.songMetadata.title}</Text>
                    <Text style={styles.tokenPreviewArtist}>{selectedToken.songMetadata.artist}</Text>
                    <Text style={styles.tokenPreviewPrice}>
                      Current Price: {formatPrice(selectedToken.currentPrice)} SOL
                    </Text>
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder={`Amount in ${tradeType === 'buy' ? 'SOL' : 'Tokens'}`}
                    value={tradeAmount}
                    onChangeText={setTradeAmount}
                    keyboardType="numeric"
                  />

                  {tradeAmount && !isNaN(Number(tradeAmount)) && (
                    <View style={styles.tradePreview}>
                      <Text style={styles.previewTitle}>Trade Preview:</Text>
                      <Text style={styles.previewText}>
                        {tradeType === 'buy' 
                          ? `You'll receive ${calculateTradePreview().tokens.toFixed(2)} tokens`
                          : `You'll receive ${calculateTradePreview().sol.toFixed(4)} SOL`
                        }
                      </Text>
                      <Text style={styles.previewText}>
                        Price Impact: {(calculateTradePreview().priceImpact * 100).toFixed(2)}%
                      </Text>
                    </View>
                  )}

                  {/* ROI Projection */}
                  {tradeType === 'buy' && tradeAmount && !isNaN(Number(tradeAmount)) && (
                    <View style={styles.roiProjection}>
                      <Text style={styles.previewTitle}>ROI Projection (30 days):</Text>
                      {(() => {
                        const roi = getROIProjection();
                        if (!roi) return null;
                        return (
                          <>
                            <Text style={styles.previewText}>
                              Projected Price: {formatPrice(roi.projectedPrice)} SOL
                            </Text>
                            <Text style={styles.previewText}>
                              Potential Return: {roi.potentialReturn >= 0 ? '+' : ''}{roi.potentialReturn.toFixed(4)} SOL
                            </Text>
                            <Text style={styles.previewText}>
                              Risk Level: {roi.riskLevel.toUpperCase()}
                            </Text>
                          </>
                        );
                      })()}
                    </View>
                  )}
                </>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTradeModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, tradeType === 'buy' ? styles.buyButton : styles.sellButton]}
                onPress={handleTrade}
              >
                <Text style={styles.actionButtonText}>
                  {tradeType === 'buy' ? 'Buy' : 'Sell'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
                 </View>
       </Modal>

       {/* Token Detail Modal */}
       <Modal
         visible={showTokenDetailModal}
         animationType="slide"
         transparent={true}
         onRequestClose={() => setShowTokenDetailModal(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modal}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Token Details</Text>
               <TouchableOpacity onPress={() => setShowTokenDetailModal(false)}>
                 <Ionicons name="close" size={24} color="#666" />
               </TouchableOpacity>
             </View>

             <ScrollView style={styles.modalContent}>
               {selectedToken && (
                 <>
                   <View style={styles.tokenPreview}>
                     <Text style={styles.tokenPreviewName}>{selectedToken.songMetadata.title}</Text>
                     <Text style={styles.tokenPreviewArtist}>{selectedToken.songMetadata.artist}</Text>
                     <Text style={styles.tokenPreviewPrice}>
                       Current Price: {formatPrice(selectedToken.currentPrice)} SOL
                     </Text>
                   </View>

                   <View style={styles.formSection}>
                     <Text style={styles.sectionLabel}>Description</Text>
                     <Text style={styles.detailText}>{selectedToken.description}</Text>
                   </View>

                   <View style={styles.formSection}>
                     <Text style={styles.sectionLabel}>Token Information</Text>
                     <View style={styles.detailRow}>
                       <Text style={styles.detailLabel}>Symbol:</Text>
                       <Text style={styles.detailValue}>{selectedToken.symbol}</Text>
                     </View>
                     <View style={styles.detailRow}>
                       <Text style={styles.detailLabel}>ISRC:</Text>
                       <Text style={styles.detailValue}>{selectedToken.songMetadata.isrc}</Text>
                     </View>
                     <View style={styles.detailRow}>
                       <Text style={styles.detailLabel}>Status:</Text>
                       <Text style={styles.detailValue}>{selectedToken.status.toUpperCase()}</Text>
                     </View>
                     <View style={styles.detailRow}>
                       <Text style={styles.detailLabel}>Market Cap:</Text>
                       <Text style={styles.detailValue}>{formatMarketCap(selectedToken.marketCap)}</Text>
                     </View>
                     <View style={styles.detailRow}>
                       <Text style={styles.detailLabel}>Volume 24h:</Text>
                       <Text style={styles.detailValue}>{formatVolume(selectedToken.volume24h)}</Text>
                     </View>
                     <View style={styles.detailRow}>
                       <Text style={styles.detailLabel}>ROI:</Text>
                       <Text style={styles.detailValue}>{(selectedToken.roi * 100).toFixed(1)}%</Text>
                     </View>
                   </View>
                 </>
               )}
             </ScrollView>

             <View style={styles.modalFooter}>
               <TouchableOpacity
                 style={[styles.modalButton, styles.cancelButton]}
                 onPress={() => setShowTokenDetailModal(false)}
               >
                 <Text style={styles.cancelButtonText}>Close</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={[styles.modalButton, styles.buyButton]}
                 onPress={() => {
                   setShowTokenDetailModal(false);
                   openTradeModal(selectedToken!, 'buy');
                 }}
               >
                 <Text style={styles.actionButtonText}>Buy Token</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>
     </View>
   );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 120,
    height: 30,
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  walletStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  walletStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  marketStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  createButton: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  rightsInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  rightsInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  rightsInfoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  rightsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rightsStat: {
    alignItems: 'center',
  },
  rightsStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  rightsStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  tokenList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tokenCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  tokenImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tokenImageContent: {
    width: '100%',
    height: '100%',
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tokenArtist: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  tokenSymbol: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  tokenPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  priceChange: {
    fontSize: 12,
    marginTop: 2,
  },
  tokenStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
  },
  tokenStatLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  tokenStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buyButton: {
    backgroundColor: '#4CAF50',
  },
  sellButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testTokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  testTokenButtonText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    marginLeft: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createModalButton: {
    backgroundColor: '#6366f1',
  },
  createModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    margin: 20,
    borderRadius: 8,
  },
  tokenPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tokenPreviewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tokenPreviewArtist: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  tokenPreviewPrice: {
    fontSize: 16,
    color: '#6366f1',
    marginTop: 4,
  },
  tradePreview: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  roiProjection: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
  },
  sliderButton: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  sliderButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
  },
}); 