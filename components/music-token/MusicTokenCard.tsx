import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MusicToken } from '@/types/music-token';
import { BuySellModal } from './BuySellModal';

interface MusicTokenCardProps {
  token: MusicToken;
  onBuy: (amount: number) => void;
  onSell: (amount: number) => void;
  onPress: () => void;
}

export function MusicTokenCard({ token, onBuy, onSell, onPress }: MusicTokenCardProps) {
  const [showBuySellModal, setShowBuySellModal] = useState(false);
  const [modalType, setModalType] = useState<'buy' | 'sell'>('buy');

  const handleBuyPress = () => {
    setModalType('buy');
    setShowBuySellModal(true);
  };

  const handleSellPress = () => {
    setModalType('sell');
    setShowBuySellModal(true);
  };

  const formatPrice = (price: number) => {
    return price < 0.01 ? price.toFixed(6) : price.toFixed(4);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) {
      return `${(marketCap / 1000000).toFixed(2)}M`;
    } else if (marketCap >= 1000) {
      return `${(marketCap / 1000).toFixed(2)}K`;
    }
    return marketCap.toFixed(2);
  };

  const getOwnershipDisplay = () => {
    const availableRights = token.compositionalRights;
    const tokenizedRights = (token.circulatingSupply / token.totalSupply) * availableRights;
    return `${tokenizedRights.toFixed(1)}% / ${availableRights.toFixed(1)}%`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.card}
      >
        <View style={styles.header}>
          <Image source={{ uri: token.imageUrl }} style={styles.image} />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{token.songMetadata.title}</Text>
            <Text style={styles.artist}>{token.songMetadata.artist}</Text>
            <Text style={styles.symbol}>{token.symbol}</Text>
            <Text style={styles.isrc}>ISRC: {token.songMetadata.isrc}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(token.currentPrice)} SOL</Text>
            <Text style={styles.priceChange}>+2.5%</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Market Cap</Text>
            <Text style={styles.statValue}>{formatMarketCap(token.marketCap)} SOL</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Volume (24h)</Text>
            <Text style={styles.statValue}>{token.totalVolume.toFixed(2)} SOL</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Rights Available</Text>
            <Text style={styles.statValue}>{getOwnershipDisplay()}</Text>
          </View>
        </View>

        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <Ionicons name="musical-notes" size={16} color="#666" />
            <Text style={styles.metadataText}>{token.songMetadata.genre}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.metadataText}>{token.songMetadata.duration}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="trending-up" size={16} color="#666" />
            <Text style={styles.metadataText}>{token.songMetadata.bpm} BPM</Text>
          </View>
        </View>

        <View style={styles.ownershipInfo}>
          <Text style={styles.ownershipTitle}>Compositional Rights Split:</Text>
          <View style={styles.ownershipSplits}>
            {token.songMetadata.ownershipSplits.slice(0, 3).map((split, index) => (
              <View key={index} style={styles.splitItem}>
                <Text style={styles.splitRole}>{split.role}</Text>
                <Text style={styles.splitName}>{split.name}</Text>
                <Text style={styles.splitPercentage}>{split.percentage}%</Text>
              </View>
            ))}
            {token.songMetadata.ownershipSplits.length > 3 && (
              <Text style={styles.moreSplits}>+{token.songMetadata.ownershipSplits.length - 3} more</Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.buyButton]}
            onPress={handleBuyPress}
          >
            <Ionicons name="trending-up" size={16} color="white" />
            <Text style={styles.buyButtonText}>Buy Rights</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.sellButton]}
            onPress={handleSellPress}
          >
            <Ionicons name="trending-down" size={16} color="#e74c3c" />
            <Text style={styles.sellButtonText}>Sell Rights</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <BuySellModal
        visible={showBuySellModal}
        type={modalType}
        token={token}
        onClose={() => setShowBuySellModal(false)}
        onConfirm={(amount) => {
          if (modalType === 'buy') {
            onBuy(amount);
          } else {
            onSell(amount);
          }
          setShowBuySellModal(false);
        }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  artist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  symbol: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 2,
  },
  isrc: {
    fontSize: 10,
    color: '#999',
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 2,
  },
  priceChange: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  ownershipInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  ownershipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  ownershipSplits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  splitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  splitRole: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  splitName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  splitPercentage: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  moreSplits: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  buyButton: {
    backgroundColor: '#27ae60',
  },
  sellButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  buyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  sellButtonText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 