import { MusicMarketplace } from '@/components/music-marketplace/MusicMarketplace';
import { MusicToken } from '@/services/music-marketplace-service';
import React from 'react';

export default function MarketplaceScreen() {
  const handleTokenPress = (token: MusicToken) => {
    // Handle token press - could navigate to detailed view
    console.log('Token pressed:', token.name);
  };

  const handleHoldingsUpdate = () => {
    // This will trigger a refresh of the account tab holdings
    console.log('Holdings updated - account tab should refresh');
  };

  return <MusicMarketplace onTokenPress={handleTokenPress} onHoldingsUpdate={handleHoldingsUpdate} />;
} 