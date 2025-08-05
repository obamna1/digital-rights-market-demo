import { PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';

export interface SimulatedBalance {
  sol: number;
  usdc: number;
  tokens: { [mint: string]: number };
  lastUpdated: Date;
}

export function useSimulatedBalance(address?: PublicKey): SimulatedBalance {
  return useMemo(() => {
    if (!address) {
      return {
        sol: 0,
        usdc: 0,
        tokens: {},
        lastUpdated: new Date(),
      };
    }

    // Generate a deterministic but random-looking balance based on the address
    const addressString = address.toString();
    const seed = addressString.charCodeAt(0) + addressString.charCodeAt(10) + addressString.charCodeAt(20);
    
    // Simulate realistic balances
    const baseSol = 2.5 + (seed % 10) * 0.1; // 2.5-3.5 SOL
    const baseUsdc = 100 + (seed % 500); // 100-600 USDC
    
    return {
      sol: parseFloat(baseSol.toFixed(4)),
      usdc: baseUsdc,
      tokens: {
        // Simulate some music tokens
        'MusicToken1': Math.floor(Math.random() * 1000) + 100,
        'MusicToken2': Math.floor(Math.random() * 500) + 50,
      },
      lastUpdated: new Date(),
    };
  }, [address]);
}

export function useSimulatedBalanceQuery(address?: PublicKey) {
  const balance = useSimulatedBalance(address);
  
  return {
    data: balance,
    isLoading: false,
    error: null,
    refetch: () => {}, // No-op for simulation
  };
} 