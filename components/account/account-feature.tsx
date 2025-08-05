import { AccountUiBalance } from '@/components/account/account-ui-balance'
import { AccountUiTokenAccounts } from '@/components/account/account-ui-token-accounts'
import { useGetBalanceInvalidate } from '@/components/account/use-get-balance'
import { useGetTokenAccountsInvalidate } from '@/components/account/use-get-token-accounts'
import { AppPage } from '@/components/app-page'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { WalletUiButtonConnect } from '@/components/solana/wallet-ui-button-connect'
import { useMusicMarketplace } from '@/hooks/use-music-marketplace'
import { MusicToken, musicMarketplaceService } from '@/services/music-marketplace-service'
import { ellipsify } from '@/utils/ellipsify'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PublicKey } from '@solana/web3.js'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useState } from 'react'
import { Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { AccountUiButtons } from './account-ui-buttons'

export function AccountFeature() {
  const { account } = useWalletUi()
  const [refreshing, setRefreshing] = useState(false)
  const [showPortfolio, setShowPortfolio] = useState(false)
  const [holdings, setHoldings] = useState<Array<{token: MusicToken, amount: number}>>([])
  
  // Load holdings from AsyncStorage on component mount
  React.useEffect(() => {
    const loadHoldings = async () => {
      try {
        const stored = await AsyncStorage.getItem('musika-holdings');
        const storedHoldings = stored ? JSON.parse(stored) : [];
        // For demo purposes, create mock token objects from stored data
        const mockHoldings = storedHoldings.map((h: any) => {
          // Get latest token data from marketplace service
          const latestToken = musicMarketplaceService.getToken(h.tokenId);
          return {
            token: latestToken || {
              id: h.tokenId,
              songMetadata: {
                title: h.tokenName,
                artist: h.tokenArtist,
              },
              symbol: h.tokenSymbol,
              currentPrice: h.currentPrice,
            } as MusicToken,
            amount: h.amount
          };
        });
        setHoldings(mockHoldings);
      } catch (error) {
        console.log('No holdings found or error loading holdings');
      }
    };
    loadHoldings();
  }, []);

  // Refresh holdings when portfolio is shown
  React.useEffect(() => {
    if (showPortfolio) {
      const loadHoldings = async () => {
        try {
          const stored = await AsyncStorage.getItem('musika-holdings');
          const storedHoldings = stored ? JSON.parse(stored) : [];
          const mockHoldings = storedHoldings.map((h: any) => {
            // Get latest token data from marketplace service
            const latestToken = musicMarketplaceService.getToken(h.tokenId);
            return {
              token: latestToken || {
                id: h.tokenId,
                songMetadata: {
                  title: h.tokenName,
                  artist: h.tokenArtist,
                },
                symbol: h.tokenSymbol,
                currentPrice: h.currentPrice,
              } as MusicToken,
              amount: h.amount
            };
          });
          setHoldings(mockHoldings);
        } catch (error) {
          console.log('No holdings found or error loading holdings');
        }
      };
      loadHoldings();
    }
  }, [showPortfolio]);
  const invalidateBalance = useGetBalanceInvalidate({ address: account?.publicKey as PublicKey })
  const invalidateTokenAccounts = useGetTokenAccountsInvalidate({ address: account?.publicKey as PublicKey })
  const { marketStats, formatMarketCap, formatPrice } = useMusicMarketplace()
  
  // Function to add token to holdings (called from marketplace when buying)
  const addToHoldings = useCallback((token: MusicToken, amount: number) => {
    setHoldings(prev => {
      const existing = prev.find(h => h.token.id === token.id)
      if (existing) {
        return prev.map(h => h.token.id === token.id 
          ? { ...h, amount: h.amount + amount }
          : h
        )
      } else {
        return [...prev, { token, amount }]
      }
    })
  }, [])

  // Function to refresh holdings manually
  const refreshHoldings = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('musika-holdings');
      const storedHoldings = stored ? JSON.parse(stored) : [];
      
      const mockHoldings = storedHoldings.map((h: any) => {
        // Get latest token data from marketplace service
        const latestToken = musicMarketplaceService.getToken(h.tokenId);
        return {
          token: latestToken || {
            id: h.tokenId,
            songMetadata: {
              title: h.tokenName,
              artist: h.tokenArtist,
            },
            symbol: h.tokenSymbol,
            currentPrice: h.currentPrice,
          } as MusicToken,
          amount: h.amount
        };
      });
      setHoldings(mockHoldings);
    } catch (error) {
      console.log('No holdings found or error loading holdings');
    }
  }, []);

  // Simulation functions
  const { simulateTourAnnouncement, simulateGraduation, instantGraduation, simulateExchangeDemand, updateRealisticMarketStats, getLifetimeVolume } = useMusicMarketplace();

  const handleTourAnnouncement = useCallback(() => {
    if (holdings.length === 0) {
      Alert.alert('No Holdings', 'You need to own tokens to simulate tour announcements.');
      return;
    }
    
    // Simulate tour announcement for the first holding
    const firstHolding = holdings[0];
    const success = simulateTourAnnouncement(firstHolding.token.id);
    
    if (success) {
      Alert.alert(
        '🎤 Tour Announced!', 
        `Musika Labs secured a tour for ${firstHolding.token.songMetadata.artist}! Token price increased.`
      );
      refreshHoldings(); // Refresh to show updated prices
    } else {
      Alert.alert('Error', 'Failed to simulate tour announcement.');
    }
  }, [holdings, simulateTourAnnouncement, refreshHoldings]);

  const handleGraduation = useCallback(() => {
    if (holdings.length === 0) {
      Alert.alert('No Holdings', 'You need to own tokens to simulate graduation.');
      return;
    }
    
    // Simulate graduation for the first holding
    const firstHolding = holdings[0];
    const success = simulateGraduation(firstHolding.token.id);
    
    if (success) {
      Alert.alert(
        '🚀 Token Graduated!', 
        `${firstHolding.token.symbol} graduated to major exchanges (Raydium/Orca)! Price surged.`
      );
      refreshHoldings(); // Refresh to show updated prices
    } else {
      Alert.alert('Graduation Failed', 'Token needs $20k lifetime volume to graduate. Keep trading!');
    }
  }, [holdings, simulateGraduation, refreshHoldings]);

  const handleExchangeDemand = useCallback(() => {
    if (holdings.length === 0) {
      Alert.alert('No Holdings', 'You need to own tokens to simulate exchange demand.');
      return;
    }
    
    // Simulate exchange demand for the first holding
    const firstHolding = holdings[0];
    const success = simulateExchangeDemand(firstHolding.token.id);
    
    if (success) {
      Alert.alert(
        '📈 Exchange Demand Surge!', 
        `Major exchange listing drove demand for ${firstHolding.token.symbol}! Price increased.`
      );
      refreshHoldings(); // Refresh to show updated prices
    } else {
      Alert.alert('Exchange Demand Failed', 'Token must be graduated to major exchanges first.');
    }
  }, [holdings, simulateExchangeDemand, refreshHoldings]);

  const handleUpdateMarketStats = useCallback(() => {
    updateRealisticMarketStats();
    Alert.alert(
      '📊 Market Updated!', 
      'Market stats updated with realistic touring artist data. All artists are now generating modest revenue from touring.'
    );
    refreshHoldings(); // Refresh to show updated prices
  }, [updateRealisticMarketStats, refreshHoldings]);

  const handleInstantGraduation = useCallback(() => {
    if (holdings.length === 0) {
      Alert.alert('No Holdings', 'You need to own tokens to graduate them');
      return;
    }
    
    // Graduate the first token in holdings for demo
    const firstHolding = holdings[0];
    
    // Debug: Check lifetime volume before graduation
    const lifetimeVolume = getLifetimeVolume(firstHolding.token.id);
    console.log(`🎯 Attempting instant graduation for ${firstHolding.token.name} with lifetime volume: $${lifetimeVolume}`);
    
    const success = instantGraduation(firstHolding.token.id);
    
    if (success) {
      Alert.alert('⚡ Instant Graduation', `${firstHolding.token.songMetadata.title} graduated instantly! Price increased by 20x.`);
    } else {
      Alert.alert('Graduation Failed', 'Could not graduate token');
    }
    
    refreshHoldings();
  }, [holdings, instantGraduation, getLifetimeVolume, refreshHoldings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([invalidateBalance(), invalidateTokenAccounts()])
    setRefreshing(false)
  }, [invalidateBalance, invalidateTokenAccounts])

  if (showPortfolio) {
    return (
      <AppPage>
        <ScrollView
          contentContainerStyle={{}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => onRefresh()} />}
        >
          <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
            <TouchableOpacity onPress={() => setShowPortfolio(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <AppText style={styles.headerTitle}>Musika Portfolio</AppText>
            <View style={styles.headerSpacer} />
          </LinearGradient>

          <AppView style={styles.portfolioContainer}>
            <AppView style={styles.portfolioStats}>
              <AppView style={styles.statCard}>
                <AppText style={styles.statLabel}>Total Tokens</AppText>
                <AppText style={styles.statValue}>{marketStats.totalTokens}</AppText>
              </AppView>
              <AppView style={styles.statCard}>
                <AppText style={styles.statLabel}>Market Cap</AppText>
                <AppText style={styles.statValue}>{formatMarketCap(marketStats.totalMarketCap)}</AppText>
              </AppView>
            </AppView>

            <AppView style={styles.portfolioActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="trending-up" size={20} color="#6366f1" />
                <AppText style={styles.actionButtonText}>View Holdings</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="analytics" size={20} color="#6366f1" />
                <AppText style={styles.actionButtonText}>Performance</AppText>
              </TouchableOpacity>
            </AppView>

            {/* Simulation Buttons */}
            <AppView style={styles.simulationSection}>
              <AppText style={styles.simulationTitle}>🎮 Token Performance Simulation</AppText>
              <AppText style={styles.simulationSubtitle}>Test how real-world events affect token prices</AppText>
              
              <AppView style={styles.simulationButtons}>
                <TouchableOpacity style={styles.simulationButton} onPress={handleTourAnnouncement}>
                  <Ionicons name="mic" size={20} color="white" />
                  <AppText style={styles.simulationButtonText}>Tour Announcement</AppText>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.simulationButton} onPress={handleGraduation}>
                  <Ionicons name="trophy" size={20} color="white" />
                  <AppText style={styles.simulationButtonText}>Graduate to Exchanges</AppText>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.simulationButton} onPress={handleExchangeDemand}>
                  <Ionicons name="trending-up" size={20} color="white" />
                  <AppText style={styles.simulationButtonText}>Exchange Demand Surge</AppText>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.simulationButton} onPress={handleUpdateMarketStats}>
                  <Ionicons name="refresh" size={20} color="white" />
                  <AppText style={styles.simulationButtonText}>Update Market Stats</AppText>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.simulationButton} onPress={handleInstantGraduation}>
                  <Ionicons name="flash" size={20} color="white" />
                  <AppText style={styles.simulationButtonText}>Instant Graduation (Demo)</AppText>
                </TouchableOpacity>
              </AppView>
            </AppView>

            {/* Holdings List */}
            <AppView style={styles.holdingsSection}>
              <View style={styles.holdingsHeader}>
                <AppText style={styles.holdingsTitle}>Your Holdings</AppText>
                <TouchableOpacity onPress={refreshHoldings} style={styles.refreshButton}>
                  <Ionicons name="refresh" size={20} color="#6366f1" />
                </TouchableOpacity>
              </View>
              {holdings.length === 0 ? (
                <AppText style={styles.noHoldingsText}>No tokens purchased yet. Buy tokens from the marketplace!</AppText>
              ) : (
                holdings.map((holding, index) => (
                  <AppView key={index} style={styles.holdingItem}>
                    <AppView style={styles.holdingInfo}>
                      <AppText style={styles.holdingName}>{holding.token.songMetadata.title}</AppText>
                      <AppText style={styles.holdingArtist}>{holding.token.songMetadata.artist}</AppText>
                      <AppText style={styles.holdingSymbol}>{holding.token.symbol}</AppText>
                    </AppView>
                    <AppView style={styles.holdingAmount}>
                      <AppText style={styles.holdingQuantity}>{holding.amount.toFixed(2)} tokens</AppText>
                      <AppText style={styles.holdingValue}>
                        {formatPrice(holding.token.currentPrice * holding.amount)} SOL
                      </AppText>
                    </AppView>
                  </AppView>
                ))
              )}
            </AppView>
          </AppView>
        </ScrollView>
      </AppPage>
    )
  }

  return (
    <AppPage>
      {account ? (
        <ScrollView
          contentContainerStyle={{}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => onRefresh()} />}
        >
          <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
            <AppText style={styles.headerTitle}>Musika Account</AppText>
          </LinearGradient>

          <AppView style={styles.accountContainer}>
            <AppView style={styles.accountInfo}>
              <AppView style={styles.avatar}>
                <Ionicons name="person" size={32} color="#6366f1" />
              </AppView>
              <AppText style={styles.address}>{ellipsify(account.publicKey.toString(), 8)}</AppText>
            </AppView>

            <AppView style={styles.balanceSection}>
              <AccountUiBalance address={account.publicKey} />
            </AppView>

            <AppView style={styles.actionsSection}>
              <TouchableOpacity 
                style={styles.portfolioButton}
                onPress={() => setShowPortfolio(true)}
              >
                <Ionicons name="wallet" size={20} color="white" />
                <AppText style={styles.portfolioButtonText}>View Portfolio</AppText>
              </TouchableOpacity>
              
              <AppView style={styles.actionButtons}>
                <AccountUiButtons />
              </AppView>
            </AppView>

            <AppView style={styles.tokenSection}>
              <AppText style={styles.sectionTitle}>Token Accounts</AppText>
              <AccountUiTokenAccounts address={account.publicKey} />
            </AppView>
          </AppView>
        </ScrollView>
      ) : (
        <AppView style={styles.connectContainer}>
          <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
            <AppText style={styles.headerTitle}>Welcome to Musika</AppText>
          </LinearGradient>
          
          <AppView style={styles.connectContent}>
            <Ionicons name="wallet-outline" size={64} color="#6366f1" />
            <AppText style={styles.connectTitle}>Connect Your Wallet</AppText>
            <AppText style={styles.connectSubtitle}>
              Connect your Solana wallet to start investing in Musika tokens
            </AppText>
            <WalletUiButtonConnect />
          </AppView>
        </AppView>
      )}
    </AppPage>
  )
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    padding: 8,
  },
  headerSpacer: {
    width: 40,
  },
  accountContainer: {
    padding: 20,
  },
  accountInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  balanceSection: {
    marginBottom: 24,
  },
  actionsSection: {
    marginBottom: 24,
  },
  portfolioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  portfolioButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtons: {
    alignItems: 'center',
  },
  tokenSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  connectContainer: {
    flex: 1,
  },
  connectContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  connectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  connectSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  portfolioContainer: {
    padding: 20,
  },
  portfolioStats: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  portfolioActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  holdingsSection: {
    marginTop: 24,
  },
  holdingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  holdingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  noHoldingsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  holdingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  holdingArtist: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  holdingSymbol: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  holdingAmount: {
    alignItems: 'flex-end',
  },
  holdingQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  holdingValue: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 2,
  },
  simulationSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  simulationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  simulationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  simulationButtons: {
    gap: 12,
  },
  simulationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simulationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
