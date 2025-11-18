'use client';

/**
 * Categories Hook
 * React hooks for fetching and interacting with data categories
 */

import { useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';
import { CONTRACT_ADDRESSES, CURRENT_NETWORK_CONFIG } from '@/lib/sui/config';
import { DataCategory } from '@/lib/sui/contract';

/**
 * Hook to get all active categories
 */
export function useCategories(limit: number = 100) {
  const client = useSuiClient();
  const [categories, setCategories] = useState<DataCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (!CONTRACT_ADDRESSES.PACKAGE_ID) {
      setError('Contract not configured');
      setIsLoading(false);
      return;
    }

    // Query for DataCategory objects
    // Categories are shared objects, so we query by type using RPC
    const structType = `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::DataCategory`;
    
    // Use RPC endpoint - construct URL from network config
    const rpcUrl = CURRENT_NETWORK_CONFIG.fullnodeUrl;
    
    fetch(`${rpcUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_queryObjects',
        params: [
          {
            filter: {
              StructType: structType,
            },
            options: {
              showContent: true,
              showOwner: true,
            },
          },
          null, // cursor
          limit, // limit
          false, // descending order
        ],
      }),
    })
      .then((res) => res.json())
      .then((data: any) => {
        if (data.error) {
          throw new Error(data.error.message || 'Query failed');
        }
        
        // Extract objects from RPC response
        const objects = data.result?.data || [];
        const parsedCategories: DataCategory[] = objects
          .filter((obj: any) => obj.data?.content && 'fields' in obj.data.content)
          .map((obj: any) => {
            const fields = obj.data.content.fields as any;
            const nameBytes = fields.name || [];
            const descBytes = fields.description || [];
            
            return {
              id: obj.data.objectId,
              name: nameBytes.length > 0 
                ? new TextDecoder().decode(new Uint8Array(nameBytes))
                : '',
              description: descBytes.length > 0
                ? new TextDecoder().decode(new Uint8Array(descBytes))
                : '',
              rewardAmount: String(fields.reward_amount || 0),
              active: fields.active || false,
            };
          })
          .filter((cat: DataCategory) => cat.active); // Only return active categories

        setCategories(parsedCategories);
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.error('Failed to fetch categories:', err);
        // Fallback: return empty array
        setCategories([]);
        setError('Failed to load categories. Please ensure the contract is deployed.');
        setIsLoading(false);
      });
  }, [client, limit]);

  return { categories, isLoading, error };
}

/**
 * Hook to get a single category by ID
 */
export function useCategory(categoryId: string | null) {
  const client = useSuiClient();
  const [category, setCategory] = useState<DataCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setCategory(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    client
      .getObject({
        id: categoryId,
        options: {
          showContent: true,
          showOwner: true,
        },
      })
      .then((obj) => {
        if (obj.data?.content && 'fields' in obj.data.content) {
          const fields = obj.data.content.fields as any;
          setCategory({
            id: obj.data.objectId,
            name: new TextDecoder().decode(new Uint8Array(fields.name || [])),
            description: new TextDecoder().decode(new Uint8Array(fields.description || [])),
            rewardAmount: fields.reward_amount || '0',
            active: fields.active || false,
          });
        } else {
          setCategory(null);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch category:', err);
        setError('Failed to load category');
        setCategory(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [client, categoryId]);

  return { category, isLoading, error };
}

