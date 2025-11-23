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

    // TEMPORARY: Using placeholder category object IDs
    // TODO: Create real categories using: sui client call --package 0x2e5f... --module kai --function create_test_category
    // For now, we'll use the DAO object ID as a placeholder since submit_data requires a valid object reference
    const PLACEHOLDER_CATEGORY = CONTRACT_ADDRESSES.DATA_DAO_ID || '0xd67e02be1ffbe3e51a8f3d44f6cff3e1e089ca83d3a30d07a47a65fe08bab476';
    
    const defaultCategories: DataCategory[] = [
      {
        id: `${PLACEHOLDER_CATEGORY}_1`, // Make IDs unique for React keys
        name: 'Financial Data',
        description: 'Financial market data, stock prices, trading data',
        rewardAmount: '100',
        active: true,
      },
      {
        id: `${PLACEHOLDER_CATEGORY}_2`,
        name: 'Healthcare',
        description: 'Medical records, health metrics, clinical trials',
        rewardAmount: '150',
        active: true,
      },
      {
        id: `${PLACEHOLDER_CATEGORY}_3`,
        name: 'IoT & Sensors',
        description: 'Internet of Things data, sensor readings',
        rewardAmount: '80',
        active: true,
      },
      {
        id: `${PLACEHOLDER_CATEGORY}_4`,
        name: 'Social Media',
        description: 'Social network data, engagement metrics',
        rewardAmount: '120',
        active: true,
      },
      {
        id: `${PLACEHOLDER_CATEGORY}_5`,
        name: 'Research',
        description: 'Academic research data, experiments',
        rewardAmount: '200',
        active: true,
      },
      {
        id: `${PLACEHOLDER_CATEGORY}_6`,
        name: 'Other',
        description: 'Miscellaneous datasets',
        rewardAmount: '50',
        active: true,
      },
    ];

    // Simulate async loading
    setTimeout(() => {
      setCategories(defaultCategories);
      setIsLoading(false);
    }, 100);
  }, [limit]);

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

