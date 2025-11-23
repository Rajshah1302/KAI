/**
 * Sui Network Configuration
 * Manages network settings, RPC endpoints, and contract addresses
 */

import { getFullnodeUrl } from '@mysten/sui.js/client';
import { SuiClient } from '@mysten/sui.js/client';

export type SuiNetwork = 'mainnet' | 'testnet' | 'devnet' | 'localnet';

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  wsUrl?: string;
  explorerUrl: string;
  fullnodeUrl: string;
  faucetUrl?: string;
}

export const NETWORK_CONFIGS: Record<SuiNetwork, NetworkConfig> = {
  mainnet: {
    name: 'Mainnet',
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
    explorerUrl: 'https://suiexplorer.com',
    fullnodeUrl: getFullnodeUrl('mainnet'),
  },
  testnet: {
    name: 'Testnet',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    explorerUrl: 'https://suiexplorer.com?network=testnet',
    fullnodeUrl: getFullnodeUrl('testnet'),
    faucetUrl: 'https://faucet.testnet.sui.io/gas',
  },
  devnet: {
    name: 'Devnet',
    rpcUrl: 'https://fullnode.devnet.sui.io:443',
    explorerUrl: 'https://suiexplorer.com?network=devnet',
    fullnodeUrl: getFullnodeUrl('devnet'),
    faucetUrl: 'https://faucet.devnet.sui.io/gas',
  },
  localnet: {
    name: 'Localnet',
    rpcUrl: 'http://127.0.0.1:9000',
    explorerUrl: 'http://localhost:3000',
    fullnodeUrl: 'http://127.0.0.1:9000',
  },
};

// Get network from environment or default to testnet
export const DEFAULT_NETWORK: SuiNetwork =
  (process.env.NEXT_PUBLIC_SUI_NETWORK as SuiNetwork) || 'testnet';

export const CURRENT_NETWORK_CONFIG = NETWORK_CONFIGS[DEFAULT_NETWORK];

// Contract addresses - these should be set after deployment
export const CONTRACT_ADDRESSES = {
  // Main contract module address (set this after deployment)
  PACKAGE_ID:  '0x2e5f7fdf6822e5671a641adb434c70950100cf1942b9b7ae2887e51536e1095e',
  // DataDAO shared object ID
  DATA_DAO_ID:  '0xd67ed460a8e7d0db1279dd21cf05843434c1a27341ca007926aa036d9b011aeb',
  // Marketplace shared object ID
  MARKETPLACE_ID:  '0x98f29f34af59fe3277e39718942f21af51b296971629f8ef5ee0115ffd1dcba8',
  // KAI Coin type
  KAI_COIN_TYPE: `${process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '0x2e5f7fdf6822e5671a641adb434c70950100cf1942b9b7ae2887e51536e1095e'}::kai::KAI`,
} as const;

// SuiNS Registry address
export const SUINS_REGISTRY: Record<string, string> = {
  mainnet: '0xd22b24490e0bae52676651b4f56660aaf10614f95',
  testnet: '0x6e0ddefc0ad48089a93dd0046eb6165b1301d530',
  devnet: '',
  localnet: '',
};

export const SUINS_REGISTRY_ADDRESS =
  SUINS_REGISTRY[DEFAULT_NETWORK] || SUINS_REGISTRY.testnet;

// Create Sui client instance
export function createSuiClient(network: SuiNetwork = DEFAULT_NETWORK): SuiClient {
  const config = NETWORK_CONFIGS[network];
  return new SuiClient({ url: config.fullnodeUrl });
}

// Export default client
export const suiClient = createSuiClient();

// Helper to get explorer URL for an object/transaction
export function getExplorerUrl(
  id: string,
  type: 'object' | 'transaction' | 'address' = 'transaction',
  network: SuiNetwork = DEFAULT_NETWORK
): string {
  const config = NETWORK_CONFIGS[network];
  const baseUrl = config.explorerUrl;
  
  if (type === 'object') {
    return `${baseUrl}/object/${id}${network !== 'mainnet' ? `?network=${network}` : ''}`;
  } else if (type === 'address') {
    return `${baseUrl}/address/${id}${network !== 'mainnet' ? `?network=${network}` : ''}`;
  }
  return `${baseUrl}/txblock/${id}${network !== 'mainnet' ? `?network=${network}` : ''}`;
}

// Helper to format SUI amount
export function formatSuiAmount(amount: bigint | number | string, decimals: number = 9): string {
  const amountNum = typeof amount === 'string' ? BigInt(amount) : BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const wholePart = amountNum / divisor;
  const fractionalPart = amountNum % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  return trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
}

// Helper to parse SUI amount to MIST (smallest unit)
export function parseSuiAmount(amount: string | number, decimals: number = 9): bigint {
  const amountStr = typeof amount === 'number' ? amount.toString() : amount;
  const [whole, fractional = ''] = amountStr.split('.');
  const fractionalPadded = fractional.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole) * BigInt(10 ** decimals) + BigInt(fractionalPadded || '0');
}

// Helper to format address (show first 4 and last 4 chars)
export function formatAddress(address: string, length: number = 8): string {
  if (!address) return '';
  if (address.length <= length) return address;
  return `${address.slice(0, length / 2)}...${address.slice(-length / 2)}`;
}

