
'use client';

import { useState, useEffect } from 'react'
import { AGGREGATORS, PUBLISHERS } from '@/constants/walrus_constants';

// Walrus Protocol integration hook for data storage
export function useWalrusStorage() {
  const [isConnected, setIsConnected] = useState(false)
  const [walrusClient, setWalrusClient] = useState<{
    aggregators: string[],
    publishers: string[],
    primaryAggregator: string,
    primaryPublisher: string,
  } | null>(null)

  useEffect(() => {
    // Initialize Walrus client
    const initWalrus = async () => {
      try {
        // Test connection to primary aggregator
        const response = await fetch(`${AGGREGATORS[0]}/v1/api`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          setWalrusClient({
            aggregators: AGGREGATORS,
            publishers: PUBLISHERS,
            primaryAggregator: AGGREGATORS[0],
            primaryPublisher: PUBLISHERS[0]
          })
          setIsConnected(true)
          console.log('Walrus client initialized with fallback endpoints')
        } else {
          throw new Error('Failed to connect to primary aggregator')
        }
      } catch (error) {
        console.error('Failed to initialize Walrus client:', error)
        // Still set as connected with fallback endpoints
        setWalrusClient({
          aggregators: AGGREGATORS,
          publishers: PUBLISHERS,
          primaryAggregator: AGGREGATORS[0],
          primaryPublisher: PUBLISHERS[0]
        })
        setIsConnected(true)
        console.log('Walrus client initialized with fallback endpoints (primary may be down)')
      }
    }

    initWalrus()
  }, [])

  return {
    isConnected,
    walrusClient
  }
}

// Hook for storing lending data on Walrus
export function useLendingDataStorage() {
  const { isConnected, walrusClient } = useWalrusStorage()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper function to try multiple endpoints
  const tryWithFallback = async (endpoints: string[], operation: (endpoint: string) => Promise<any>) => {
    for (const endpoint of endpoints) {
      try {
        const result = await operation(endpoint)
        return result
      } catch (error: any) {
        console.warn(`Failed with ${endpoint}:`, error.message)
        continue
      }
    }
    throw new Error('All endpoints failed')
  }

  const storeLendingData = async (data: any) => {
    if (!isConnected || !walrusClient) {
      setError('Walrus not connected, using localStorage fallback')
      // Store in localStorage as fallback
      if (typeof window !== 'undefined') {
        try {
          const blobId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem(`walrus_blob_${blobId}`, JSON.stringify(data))
          console.log('Stored data in localStorage fallback')
          return { blobId, success: true, fallback: true }
        } catch (err) {
          console.error('localStorage fallback failed:', err)
        }
      }
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      // Convert data to JSON string
      const dataString = JSON.stringify(data)

      // Try storing with fallback publishers
      const storeOperation = async (publisher: string) => {
        const response = await fetch(`${publisher}/v1/blobs?epochs=1`, {
          method: 'PUT',
          body: dataString,
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.newlyCreated) {
          return {
            blobId: result.newlyCreated.blobObject.blobId,
            success: true
          }
        } else if (result.alreadyCertified) {
          return {
            blobId: result.alreadyCertified.blobId,
            success: true,
            alreadyExists: true
          }
        } else {
          throw new Error('Unexpected response format')
        }
      }

      const result = await tryWithFallback(walrusClient.publishers, storeOperation)
      
      console.log('✅ Successfully uploaded to Walrus:', result.blobId)
      
      // Also save to localStorage as backup
      if (typeof window !== 'undefined' && result?.blobId) {
        try {
          localStorage.setItem(`walrus_blob_${result.blobId}`, dataString)
          console.log('Stored backup copy in localStorage')
        } catch (err) {
          console.warn('Failed to store localStorage backup:', err)
        }
      }

      setIsLoading(false)
      return result

    } catch (err: any) {
      console.error('Walrus storage failed, using localStorage fallback:', err.message)
      setError(err.message)
      
      // Fallback to localStorage if Walrus fails
      if (typeof window !== 'undefined') {
        try {
          const blobId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem(`walrus_blob_${blobId}`, JSON.stringify(data))
          console.log('Stored data in localStorage fallback')
          setIsLoading(false)
          return { blobId, success: true, fallback: true }
        } catch (localErr) {
          console.error('localStorage fallback also failed:', localErr)
        }
      }
      
      setIsLoading(false)
      return null
    }
  }

  const retrieveLendingData = async (blobId: string) => {
    if (!isConnected || !walrusClient) {
      console.warn('Walrus not connected, checking localStorage fallback...')
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        try {
          const localData = localStorage.getItem(`walrus_blob_${blobId}`)
          if (localData) {
            console.log('Found data in localStorage fallback')
            return JSON.parse(localData)
          }
        } catch (err) {
          console.error('localStorage fallback failed:', err)
        }
      }
      return null
    }

    try {
      // Try retrieving from Walrus with fallback aggregators
      const retrieveOperation = async (aggregator: string) => {
        const response = await fetch(`${aggregator}/v1/blobs/${blobId}`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.text()
        return JSON.parse(data)
      }

      const data = await tryWithFallback(walrusClient.aggregators, retrieveOperation)
      console.log('Successfully retrieved data from Walrus')
      return data

    } catch (err: any) {
      console.warn('Error retrieving from Walrus, trying localStorage fallback:', err.message)
      
      // Fallback to localStorage if Walrus fails
      if (typeof window !== 'undefined') {
        try {
          const localData = localStorage.getItem(`walrus_blob_${blobId}`)
          if (localData) {
            console.log('Found data in localStorage fallback')
            return JSON.parse(localData)
          }
        } catch (localErr) {
          console.error('localStorage fallback also failed:', localErr)
        }
      }
      
      return null
    }
  }

  return {
    storeLendingData,
    retrieveLendingData,
    isLoading,
    error,
    isConnected
  }
}

// Hook for storing orderbook data
export function useOrderbookStorage() {
  const { storeLendingData, retrieveLendingData, isLoading, error, isConnected } = useLendingDataStorage()

  const storeOrderbookSnapshot = async (snapshot: any) => {
    const data = {
      type: 'orderbook_snapshot',
      timestamp: Date.now(),
      data: snapshot
    }

    return await storeLendingData(data)
  }

  const storeMatchingEvent = async (event: any) => {
    const data = {
      type: 'matching_event',
      timestamp: Date.now(),
      data: event
    }

    return await storeLendingData(data)
  }

  const getOrderbookHistory = async (timeRange: any) => {
    // In a real implementation, you'd query Walrus for historical data
    // For now, return empty array as historical queries require indexing
    return []
  }

  return {
    storeOrderbookSnapshot,
    storeMatchingEvent,
    getOrderbookHistory,
    isLoading,
    error,
    isConnected
  }
}

// Hook for storing user preferences
export function useUserPreferences() {
  const { storeLendingData, retrieveLendingData, isLoading, error, isConnected } = useLendingDataStorage()

  const savePreferences = async (preferences: any) => {
    const data = {
      type: 'user_preferences',
      timestamp: Date.now(),
      data: preferences
    }

    return await storeLendingData(data)
  }

  const loadPreferences = async (userId: string) => {
    // Note: This requires maintaining a mapping of userId to blobId
    // In a real implementation, you'd store this mapping on-chain or in a database
    return null
  }

  return {
    savePreferences,
    loadPreferences,
    isLoading,
    error,
    isConnected
  }
}

// Utility functions for Walrus integration
export const walrusUtils = {
  // Generate unique key for data storage
  generateKey: (type: string, identifier: string) => {
    return `${type}_${identifier}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // Format data for Walrus storage
  formatData: (type: string, data: any) => {
    return {
      type,
      timestamp: Date.now(),
      version: '1.0',
      data
    }
  },

  // Validate data before storage
  validateData: (data: any) => {
    return data && typeof data === 'object' && data.type && data.timestamp
  },

  // Check if blob ID is valid format
  isValidBlobId: (blobId: string) => {
    // Walrus blob IDs are base64url encoded
    const base64urlRegex = /^[A-Za-z0-9_-]+$/
    return typeof blobId === 'string' && blobId.length > 0 && base64urlRegex.test(blobId)
  },

  // Get aggregator endpoints
  getAggregators: () => [
    'https://aggregator.walrus-testnet.walrus.space',
    'http://cs74th801mmedkqu25ng.bdnodes.net:8443',
    'http://walrus-storage.testnet.nelrann.org:9000',
    'http://walrus-testnet.equinoxdao.xyz:9000',
    'http://walrus-testnet.suicore.com:9000',
    'https://agg.test.walrus.eosusa.io',
    'https://aggregator.testnet.walrus.atalma.io',
    'https://aggregator.testnet.walrus.mirai.cloud',
    'https://aggregator.walrus-01.tududes.com'
  ],

  // Get publisher endpoints
  getPublishers: () => [
    'https://publisher.walrus-testnet.walrus.space',
    'http://walrus-publisher-testnet.cetus.zone:9001',
    'http://walrus-publisher-testnet.haedal.xyz:9001',
    'http://walrus-publisher-testnet.suisec.tech:9001',
    'http://walrus-storage.testnet.nelrann.org:9001',
    'http://walrus-testnet.equinoxdao.xyz:9001',
    'http://walrus-testnet.suicore.com:9001',
    'http://walrus.testnet.pops.one:9001',
    'http://waltest.chainflow.io:9001'
  ]
}
