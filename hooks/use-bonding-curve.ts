import { useMemo } from 'react';
import { MusicToken } from '@/types/music-token';

export function useBondingCurve() {
  // Bonding curve calculation using the Bancor formula
  // Price = Reserve Balance / (Supply * Reserve Ratio)
  
  const calculatePrice = (token: MusicToken, tokenAmount: number): number => {
    const { k, reserveRatio } = token.bondingCurveParams;
    const currentSupply = token.circulatingSupply;
    
    // Calculate price using bonding curve formula
    const price = k * Math.pow(currentSupply + tokenAmount, reserveRatio - 1);
    return price;
  };

  const calculateTokensForSol = (token: MusicToken, solAmount: number): number => {
    const { k, reserveRatio } = token.bondingCurveParams;
    const currentSupply = token.circulatingSupply;
    
    // Calculate tokens received for SOL amount
    const tokensReceived = Math.pow(
      (solAmount / k) + Math.pow(currentSupply, reserveRatio),
      1 / reserveRatio
    ) - currentSupply;
    
    return Math.max(0, tokensReceived);
  };

  const calculateSolForTokens = (token: MusicToken, tokenAmount: number): number => {
    const { k, reserveRatio } = token.bondingCurveParams;
    const currentSupply = token.circulatingSupply;
    
    // Calculate SOL received for token amount
    const solReceived = k * (
      Math.pow(currentSupply, reserveRatio) - 
      Math.pow(currentSupply - tokenAmount, reserveRatio)
    );
    
    return Math.max(0, solReceived);
  };

  const getPriceImpact = (token: MusicToken, tokenAmount: number, isBuy: boolean): number => {
    const currentPrice = token.currentPrice;
    let newPrice: number;
    
    if (isBuy) {
      newPrice = calculatePrice(token, tokenAmount);
    } else {
      newPrice = calculatePrice(token, -tokenAmount);
    }
    
    return ((newPrice - currentPrice) / currentPrice) * 100;
  };

  return {
    calculatePrice,
    calculateTokensForSol,
    calculateSolForTokens,
    getPriceImpact,
  };
} 