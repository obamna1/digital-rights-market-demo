import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MusicToken } from '@/types/music-token';
import { useBondingCurve } from '@/hooks/use-bonding-curve';

interface BuySellModalProps {
  visible: boolean;
  type: 'buy' | 'sell';
  token: MusicToken;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

export function BuySellModal({ visible, type, token, onClose, onConfirm }: BuySellModalProps) {
  const [amount, setAmount] = useState('');
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const [estimatedSol, setEstimatedSol] = useState(0);
  const [priceImpact, setPriceImpact] = useState(0);
  
  const { calculateTokensForSol, calculateSolForTokens, getPriceImpact } = useBondingCurve();

  useEffect(() => {
    if (amount && !isNaN(Number(amount))) {
      const numAmount = Number(amount);
      
      if (type === 'buy') {
        const tokens = calculateTokensForSol(token, numAmount);
        const impact = getPriceImpact(token, tokens, true);
        setEstimatedTokens(tokens);
        setEstimatedSol(numAmount);
        setPriceImpact(impact);
      } else {
        const sol = calculateSolForTokens(token, numAmount);
        const impact = getPriceImpact(token, numAmount, false);
        setEstimatedTokens(numAmount);
        setEstimatedSol(sol);
        setPriceImpact(impact);
      }
    } else {
      setEstimatedTokens(0);
      setEstimatedSol(0);
      setPriceImpact(0);
    }
  }, [amount, type, token, calculateTokensForSol, calculateSolForTokens, getPriceImpact]);

  const handleConfirm = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const numAmount = Number(amount);
    if (type === 'sell' && numAmount > token.circulatingSupply) {
      Alert.alert('Error', 'Insufficient tokens to sell');
      return;
    }

    onConfirm(numAmount);
  };

  const formatNumber = (num: number) => {
    return num < 0.01 ? num.toFixed(6) : num.toFixed(4);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {type === 'buy' ? 'Buy' : 'Sell'} {token.symbol}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenName}>{token.songMetadata.title}</Text>
              <Text style={styles.tokenArtist}>{token.songMetadata.artist}</Text>
              <Text style={styles.currentPrice}>
                Current Price: {formatNumber(token.currentPrice)} SOL
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {type === 'buy' ? 'SOL Amount' : 'Token Amount'}
              </Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder={`Enter ${type === 'buy' ? 'SOL' : 'token'} amount`}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            {amount && !isNaN(Number(amount)) && (
              <View style={styles.estimation}>
                <View style={styles.estimationRow}>
                  <Text style={styles.estimationLabel}>
                    {type === 'buy' ? 'Tokens to receive:' : 'SOL to receive:'}
                  </Text>
                  <Text style={styles.estimationValue}>
                    {type === 'buy' 
                      ? `${formatNumber(estimatedTokens)} ${token.symbol}`
                      : `${formatNumber(estimatedSol)} SOL`
                    }
                  </Text>
                </View>
                
                <View style={styles.estimationRow}>
                  <Text style={styles.estimationLabel}>Price Impact:</Text>
                  <Text style={[
                    styles.estimationValue,
                    { color: priceImpact > 5 ? '#e74c3c' : '#27ae60' }
                  ]}>
                    {priceImpact.toFixed(2)}%
                  </Text>
                </View>

                {type === 'buy' && (
                  <View style={styles.estimationRow}>
                    <Text style={styles.estimationLabel}>Total Cost:</Text>
                    <Text style={styles.estimationValue}>
                      {formatNumber(estimatedSol)} SOL
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.tokenStats}>
              <Text style={styles.statsTitle}>Token Statistics</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Market Cap:</Text>
                <Text style={styles.statValue}>
                  {(token.marketCap / 1000).toFixed(2)}K SOL
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>24h Volume:</Text>
                <Text style={styles.statValue}>
                  {token.totalVolume.toFixed(2)} SOL
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Dividend Yield:</Text>
                <Text style={styles.statValue}>
                  {token.dividendYield}%
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                type === 'buy' ? styles.buyConfirmButton : styles.sellConfirmButton
              ]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>
                {type === 'buy' ? 'Buy' : 'Sell'} {token.symbol}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  tokenInfo: {
    marginBottom: 20,
  },
  tokenName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tokenArtist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  estimation: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  estimationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  estimationLabel: {
    fontSize: 14,
    color: '#666',
  },
  estimationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tokenStats: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyConfirmButton: {
    backgroundColor: '#27ae60',
  },
  sellConfirmButton: {
    backgroundColor: '#e74c3c',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
}); 