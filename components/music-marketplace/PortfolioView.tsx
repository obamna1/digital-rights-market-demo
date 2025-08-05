import { useMusicMarketplace } from '@/hooks/use-music-marketplace';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PortfolioViewProps {
  onBack: () => void;
}

export function PortfolioView({ onBack }: PortfolioViewProps) {
  const {
    tokens,
    formatPrice,
    formatMarketCap,
    getStatusColor,
    getStatusIcon,
  } = useMusicMarketplace();

  // Mock portfolio data - in a real app this would come from user's wallet
  const mockPortfolio = [
    {
      tokenId: tokens[0]?.id || '1',
      amount: 1000,
      averagePrice: 0.15,
      currentValue: 150,
      profitLoss: 25,
      profitLossPercentage: 20,
    },
    {
      tokenId: tokens[1]?.id || '2',
      amount: 500,
      averagePrice: 0.08,
      currentValue: 40,
      profitLoss: -5,
      profitLossPercentage: -11.11,
    },
  ];

  const totalValue = mockPortfolio.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalProfitLoss = mockPortfolio.reduce((sum, holding) => sum + holding.profitLoss, 0);
  const totalProfitLossPercentage = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Portfolio Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Value</Text>
          <Text style={styles.summaryValue}>{formatPrice(totalValue)} SOL</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>P&L (24h)</Text>
          <Text style={[
            styles.summaryValue,
            { color: totalProfitLoss >= 0 ? '#4CAF50' : '#FF3B30' }
          ]}>
            {totalProfitLoss >= 0 ? '+' : ''}{formatPrice(totalProfitLoss)} SOL
          </Text>
          <Text style={[
            styles.summaryPercentage,
            { color: totalProfitLoss >= 0 ? '#4CAF50' : '#FF3B30' }
          ]}>
            {totalProfitLossPercentage >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Holdings */}
      <ScrollView style={styles.holdingsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Your Holdings</Text>
        
        {mockPortfolio.map((holding, index) => {
          const token = tokens.find(t => t.id === holding.tokenId);
          if (!token) return null;

          return (
            <View key={holding.tokenId} style={styles.holdingCard}>
              <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.cardGradient}
              >
                {/* Token Info */}
                <View style={styles.holdingHeader}>
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenName}>{token.songMetadata.title}</Text>
                    <Text style={styles.tokenArtist}>{token.songMetadata.artist}</Text>
                    <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  </View>
                  <View style={styles.currentPrice}>
                    <Text style={styles.priceText}>{formatPrice(token.currentPrice)} SOL</Text>
                    <Text style={[
                      styles.priceChange,
                      { color: token.priceChange24h >= 0 ? '#4CAF50' : '#FF3B30' }
                    ]}>
                      {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                    </Text>
                  </View>
                </View>

                {/* Holding Details */}
                <View style={styles.holdingDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.detailValue}>{holding.amount.toLocaleString()} tokens</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Avg. Price:</Text>
                    <Text style={styles.detailValue}>{formatPrice(holding.averagePrice)} SOL</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Current Value:</Text>
                    <Text style={styles.detailValue}>{formatPrice(holding.currentValue)} SOL</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>P&L:</Text>
                    <Text style={[
                      styles.detailValue,
                      { color: holding.profitLoss >= 0 ? '#4CAF50' : '#FF3B30' }
                    ]}>
                      {holding.profitLoss >= 0 ? '+' : ''}{formatPrice(holding.profitLoss)} SOL
                      {' '}({holding.profitLossPercentage >= 0 ? '+' : ''}{holding.profitLossPercentage.toFixed(2)}%)
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(token.status) }]}>
                  <Ionicons name={getStatusIcon(token.status) as any} size={12} color="white" />
                  <Text style={styles.statusText}>{token.status.toUpperCase()}</Text>
                </View>
              </LinearGradient>
            </View>
          );
        })}

        {mockPortfolio.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No holdings yet</Text>
            <Text style={styles.emptyStateSubtext}>Start investing in music tokens to see your portfolio here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
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
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryPercentage: {
    fontSize: 12,
    marginTop: 2,
  },
  holdingsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  holdingCard: {
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
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tokenArtist: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tokenSymbol: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  currentPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  priceChange: {
    fontSize: 10,
    marginTop: 2,
  },
  holdingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
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
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
}); 