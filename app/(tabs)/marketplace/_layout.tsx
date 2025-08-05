import { Stack } from 'expo-router'
import React from 'react'

export default function MarketplaceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  )
} 