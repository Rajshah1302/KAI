/**
 * SuiNS Name Resolution Utilities
 * Provides ENS-like name resolution for Sui addresses
 */

import { suiClient } from './config';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';

const SUINS_REVERSE_REGISTRY_OBJECT_ID = '0x6fd0ee40b84a8e6a28f88c8a5a42b39430b0e7b6';

interface SuiNSNameResponse {
  nft_id: string;
  expiration_timestamp_ms: string | null;
  target_address: string | null;
}

interface SuiNSReverseResponse {
  nft_id: string;
  domain: string;
}

// Cache for name resolution (address -> name)
const nameCache = new Map<string, string | null>();
// Cache for reverse resolution (name -> address)
const reverseCache = new Map<string, string | null>();
// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;
const cacheTimestamps = new Map<string, number>();

/**
 * Check if cache entry is still valid
 */
function isCacheValid(key: string): boolean {
  const timestamp = cacheTimestamps.get(key);
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Set cache entry with timestamp
 */
function setCache(key: string, value: string | null): void {
  nameCache.set(key, value);
  cacheTimestamps.set(key, Date.now());
}

/**
 * Get cache entry if valid
 */
function getCache(key: string): string | null | undefined {
  if (!isCacheValid(key)) {
    nameCache.delete(key);
    cacheTimestamps.delete(key);
    return undefined;
  }
  return nameCache.get(key);
}

/**
 * Resolve a SuiNS name to an address
 * @param name - The SuiNS name (e.g., "alice.sui")
 * @returns The resolved address or null if not found
 */
export async function resolveSuiNSName(name: string): Promise<string | null> {
  // Check cache first
  const cached = getCache(`name:${name}`);
  if (cached !== undefined) return cached;

  try {
    // Normalize name (ensure .sui suffix)
    const normalizedName = name.endsWith('.sui') ? name : `${name}.sui`;
    
    // Query the SuiNS registry
    // Note: This is a simplified version. The actual implementation depends on
    // the SuiNS registry structure. Adjust based on actual SuiNS contract.
    const response = await suiClient.getObject({
      id: SUINS_REVERSE_REGISTRY_OBJECT_ID,
      options: {
        showContent: true,
        showOwner: true,
      },
    });

    // For now, we'll use an API-based approach if available
    // The official SuiNS API endpoint (if available)
    try {
      const apiResponse = await fetch(
        `https://api.suins.io/api/v1/name/${normalizedName}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        if (data.address) {
          const resolved = normalizeSuiAddress(data.address);
          setCache(`name:${normalizedName}`, resolved);
          reverseCache.set(resolved, normalizedName);
          return resolved;
        }
      }
    } catch (apiError) {
      console.warn('SuiNS API not available, falling back to on-chain lookup:', apiError);
    }

    // Fallback: On-chain lookup (simplified)
    // In a real implementation, you'd query the SuiNS registry contract directly
    // This requires understanding the exact contract structure
    
    setCache(`name:${normalizedName}`, null);
    return null;
  } catch (error) {
    console.error('Error resolving SuiNS name:', error);
    return null;
  }
}

/**
 * Resolve an address to a SuiNS name (reverse lookup)
 * @param address - The Sui address to resolve
 * @returns The SuiNS name or null if not found
 */
export async function resolveSuiNSAddress(address: string): Promise<string | null> {
  const normalizedAddress = normalizeSuiAddress(address);
  
  // Check cache first
  const cached = getCache(`addr:${normalizedAddress}`);
  if (cached !== undefined) return cached;

  try {
    // Try API first
    try {
      const apiResponse = await fetch(
        `https://api.suins.io/api/v1/address/${normalizedAddress}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        if (data.name) {
          const name = data.name.endsWith('.sui') ? data.name : `${data.name}.sui`;
          setCache(`addr:${normalizedAddress}`, name);
          reverseCache.set(name, normalizedAddress);
          return name;
        }
      }
    } catch (apiError) {
      console.warn('SuiNS API not available for reverse lookup:', apiError);
    }

    // Fallback: On-chain reverse lookup
    // Query the reverse registry
    try {
      const ownedObjects = await suiClient.getOwnedObjects({
        owner: normalizedAddress,
        filter: {
          StructType: '0x2::dynamic_object_field::DynamicField',
        },
        options: {
          showContent: true,
        },
      });

      // Search for SuiNS domain in owned objects
      // This is a simplified check - adjust based on actual SuiNS structure
      for (const obj of ownedObjects.data) {
        if (obj.data?.content && 'fields' in obj.data.content) {
          const fields = obj.data.content.fields as any;
          if (fields?.name?.endsWith?.('.sui')) {
            const name = fields.name;
            setCache(`addr:${normalizedAddress}`, name);
            reverseCache.set(name, normalizedAddress);
            return name;
          }
        }
      }
    } catch (chainError) {
      console.warn('On-chain reverse lookup failed:', chainError);
    }

    setCache(`addr:${normalizedAddress}`, null);
    return null;
  } catch (error) {
    console.error('Error resolving address to SuiNS name:', error);
    return null;
  }
}

/**
 * Check if a string is a valid SuiNS name
 */
export function isValidSuiNSName(name: string): boolean {
  if (!name) return false;
  const normalized = name.endsWith('.sui') ? name : `${name}.sui`;
  // Basic validation: alphanumeric and hyphens, ends with .sui
  return /^[a-z0-9-]+\.sui$/i.test(normalized) && normalized.length >= 5;
}

/**
 * Clear the SuiNS cache
 */
export function clearSuiNSCache(): void {
  nameCache.clear();
  reverseCache.clear();
  cacheTimestamps.clear();
}

/**
 * Preload SuiNS names for multiple addresses
 */
export async function preloadSuiNSNames(addresses: string[]): Promise<void> {
  await Promise.allSettled(
    addresses.map((addr) => resolveSuiNSAddress(addr))
  );
}

