/**
 * kai ABI Types and Utilities
 * Type definitions and utilities for interacting with the DAO kai
 */

import { TransactionBlock } from '@mysten/sui.js/transactions';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';
import { CONTRACT_ADDRESSES, suiClient } from './config';
import { formatSuiAmount, parseSuiAmount } from './config';

// kai function names
export const CONTRACT_FUNCTIONS = {
  PURCHASE_KAI: 'purchase_kai',
  ADD_KAI: 'add_kai',
  BURN_KAI: 'burn_kai',
  PROPOSE_CATEGORY: 'propose_category',
  SUBMIT_DATA: 'submit_data',
  VOTE: 'vote',
  EXECUTE_CATEGORY_PROPOSAL: 'execute_category_proposal',
  EXECUTE_DATA_PROPOSAL: 'execute_data_proposal',
  EXECUTE_PRICE_PROPOSAL: 'execute_price_proposal',
  PROPOSE_PRICE: 'propose_price',
  PURCHASE_DATA: 'purchase_data',
} as const;

// Proposal types
export enum ProposalType {
  CATEGORY = 1,
  DATA_APPROVAL = 2,
  SET_PRICE = 3,
}

// kai types
export interface DataDAO {
  id: string;
  treasury: string; // SUI balance
  kaiReserve: string; // KAI balance
  rewardPool: string; // KAI balance
  kaiPrice: string; // SUI per KAI
  quorum: string; // percentage (e.g., 30)
  threshold: string; // percentage (e.g., 70)
  voteTime: string; // milliseconds
}

export interface AccountCap {
  id: string;
  daoId: string;
  kaiBalance: string;
}

export interface DataCategory {
  id: string;
  name: string;
  description: string;
  rewardAmount: string;
  active: boolean;
}

export interface DataSubmission {
  id: string;
  walrusBlobId: string;
  metadata: string;
  categoryId: string;
  submitter: string;
  approved: boolean;
  price: string;
  listed: boolean;
}

export interface Proposal {
  id: string;
  daoId: string;
  proposalType: ProposalType;
  data: string; // encoded data
  votes: string; // total votes (KAI amount)
  voters: string[]; // addresses who voted
  ends: string; // timestamp in ms
  executed: boolean;
}

export interface Marketplace {
  id: string;
  listings: Record<string, string>; // submission_id -> price
}

/**
 * Validate kai addresses are configured
 */
function validateContractAddresses() {
  const packageId = CONTRACT_ADDRESSES.PACKAGE_ID || process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';
  // Check if package ID is valid (not empty and not a placeholder)
  if (!packageId || packageId.length < 10 || packageId.startsWith('0x00000')) {
    throw new Error(
      'Contract package ID is not configured. Please set NEXT_PUBLIC_SUI_PACKAGE_ID in your .env.local file. ' +
      'See README_DEPLOYMENT.md for deployment instructions.'
    );
  }
}

/**
 * Build transaction to purchase KAI tokens
 */
export function buildPurchaseKaiTx(
  txb: TransactionBlock,
  daoId: string,
  suiAmount: string | bigint,
  senderAddress: string
): TransactionBlock {
  validateContractAddresses();
  
  const suiAmountMist = typeof suiAmount === 'string' ? parseSuiAmount(suiAmount) : suiAmount;
  
  const [coin] = txb.splitCoins(txb.gas, [suiAmountMist]);
  
  // Normalize the DAO ID address
  const normalizedDaoId = normalizeSuiAddress(daoId);
  
  const [accountCap] = txb.moveCall({    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::kai::${CONTRACT_FUNCTIONS.PURCHASE_KAI}`,
    arguments: [
      txb.object(normalizedDaoId),
      coin,
    ],
  });
  
  // Transfer the AccountCap to the sender
  txb.transferObjects([accountCap], senderAddress);

  return txb;
}

/**
 * Build transaction to add KAI to existing account
 */
export function buildAddKaiTx(
  txb: TransactionBlock,
  daoId: string,
  accountCapId: string,
  suiAmount: string | bigint
): TransactionBlock {
  validateContractAddresses();
  
  const suiAmountMist = typeof suiAmount === 'string' ? parseSuiAmount(suiAmount) : suiAmount;
  
  const [coin] = txb.splitCoins(txb.gas, [suiAmountMist]);
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::kai::${CONTRACT_FUNCTIONS.ADD_KAI}`,
    arguments: [
      txb.object(normalizeSuiAddress(daoId)),
      txb.object(normalizeSuiAddress(accountCapId)),
      coin,
    ],
  });

  return txb;
}

/**
 * Build transaction to burn KAI and redeem SUI
 */
export function buildBurnKaiTx(
  txb: TransactionBlock,
  daoId: string,
  accountCapId: string,
  kaiAmount: string | bigint,
  decimals: number = 6 // KAI has 6 decimals
): TransactionBlock {
  validateContractAddresses();
  
  const kaiAmountMist = typeof kaiAmount === 'string' ? parseSuiAmount(kaiAmount, decimals) : kaiAmount;
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::kai::${CONTRACT_FUNCTIONS.BURN_KAI}`,
    arguments: [
      txb.object(normalizeSuiAddress(daoId)),
      txb.object(normalizeSuiAddress(accountCapId)),
      txb.pure.u64(kaiAmountMist),
    ],
  });

  return txb;
}

/**
 * Build transaction to propose a new category
 */
export function buildProposeCategoryTx(
  txb: TransactionBlock,
  daoId: string,
  accountCapId: string,
  name: string,
  description: string,
  rewardAmount: string | bigint,
  clockId: string = '0x6' // Sui clock object
): TransactionBlock {
  validateContractAddresses();
  
  const rewardAmountMist = typeof rewardAmount === 'string' ? parseSuiAmount(rewardAmount, 6) : rewardAmount;
  
  // Convert strings to byte arrays (vector<u8>)
  const nameBytes = Array.from(new TextEncoder().encode(name));
  const descriptionBytes = Array.from(new TextEncoder().encode(description));
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::kai::${CONTRACT_FUNCTIONS.PROPOSE_CATEGORY}`,
    arguments: [
      txb.object(normalizeSuiAddress(daoId)),
      txb.object(normalizeSuiAddress(accountCapId)),
      txb.pure(nameBytes, 'vector<u8>'),
      txb.pure(descriptionBytes, 'vector<u8>'),
      txb.pure.u64(rewardAmountMist),
      txb.object(normalizeSuiAddress(clockId)),
    ],
  });

  return txb;
}

/**
 * Build transaction to submit data
 * Note: Now requires category object reference instead of category ID
 */
export function buildSubmitDataTx(
  txb: TransactionBlock,
  daoId: string,
  categoryId: string,
  walrusBlobId: string,
  metadata: string,
  clockId: string = '0x6'
): TransactionBlock {
  validateContractAddresses();
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::kai::${CONTRACT_FUNCTIONS.SUBMIT_DATA}`,
    arguments: [
      txb.object(normalizeSuiAddress(daoId)),
      txb.object(normalizeSuiAddress(categoryId)), // Category object reference
      txb.pure.string(walrusBlobId),
      txb.pure.string(metadata),
      txb.object(normalizeSuiAddress(clockId)),
    ],
  });

  return txb;
}

/**
 * Build transaction to vote on a proposal
 */
export function buildVoteTx(
  txb: TransactionBlock,
  daoId: string,
  accountCapId: string,
  proposalId: string,
  clockId: string = '0x6'
): TransactionBlock {
  validateContractAddresses();
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::kai::${CONTRACT_FUNCTIONS.VOTE}`,
    arguments: [
      txb.object(normalizeSuiAddress(daoId)),
      txb.object(normalizeSuiAddress(accountCapId)),
      txb.object(normalizeSuiAddress(proposalId)),
      txb.object(normalizeSuiAddress(clockId)),
    ],
  });

  return txb;
}

/**
 * Build transaction to propose a price for a submission
 */
export function buildProposePriceTx(
  txb: TransactionBlock,
  daoId: string,
  accountCapId: string,
  submissionId: string,
  price: string | bigint,
  clockId: string = '0x6'
): TransactionBlock {
  validateContractAddresses();
  
  const priceMist = typeof price === 'string' ? parseSuiAmount(price, 6) : price;
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::kai::${CONTRACT_FUNCTIONS.PROPOSE_PRICE}`,
    arguments: [
      txb.object(normalizeSuiAddress(daoId)),
      txb.object(normalizeSuiAddress(accountCapId)),
      txb.pure.id(normalizeSuiAddress(submissionId)),
      txb.pure.u64(priceMist),
      txb.object(normalizeSuiAddress(clockId)),
    ],
  });

  return txb;
}

/**
 * Build transaction to purchase data
 */
export function buildPurchaseDataTx(
  txb: TransactionBlock,
  daoId: string,
  submissionId: string,
  price: string | bigint
): TransactionBlock {
  validateContractAddresses();
  
  const priceMist = typeof price === 'string' ? parseSuiAmount(price) : price;
  
  const [coin] = txb.splitCoins(txb.gas, [priceMist]);
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::kai::${CONTRACT_FUNCTIONS.PURCHASE_DATA}`,
    arguments: [
      txb.object(normalizeSuiAddress(daoId)),
      txb.object(normalizeSuiAddress(submissionId)),
      coin,
    ],
  });

  return txb;
}

/**
 * Build transaction to execute category proposal
 */
export function buildExecuteCategoryProposalTx(
  txb: TransactionBlock,
  daoId: string,
  proposalId: string,
  clockId: string = '0x6'
): TransactionBlock {
  validateContractAddresses();
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::kai::${CONTRACT_FUNCTIONS.EXECUTE_CATEGORY_PROPOSAL}`,
    arguments: [
      txb.object(normalizeSuiAddress(daoId)),
      txb.object(normalizeSuiAddress(proposalId)),
      txb.object(normalizeSuiAddress(clockId)),
    ],
  });

  return txb;
}

/**
 * Build transaction to execute data approval proposal
 */
export function buildExecuteDataProposalTx(
  txb: TransactionBlock,
  daoId: string,
  proposalId: string,
  submissionId: string,
  categoryId: string,
  clockId: string = '0x6'
): TransactionBlock {
  validateContractAddresses();
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::kai::${CONTRACT_FUNCTIONS.EXECUTE_DATA_PROPOSAL}`,
    arguments: [
      txb.object(normalizeSuiAddress(daoId)),
      txb.object(normalizeSuiAddress(proposalId)),
      txb.object(normalizeSuiAddress(submissionId)),
      txb.object(normalizeSuiAddress(categoryId)),
      txb.object(normalizeSuiAddress(clockId)),
    ],
  });

  return txb;
}

/**
 * Build transaction to execute price proposal
 */
export function buildExecutePriceProposalTx(
  txb: TransactionBlock,
  daoId: string,
  proposalId: string,
  submissionId: string,
  marketplaceId: string,
  clockId: string = '0x6'
): TransactionBlock {
  validateContractAddresses();
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::kai::${CONTRACT_FUNCTIONS.EXECUTE_PRICE_PROPOSAL}`,
    arguments: [
      txb.object(normalizeSuiAddress(daoId)),
      txb.object(normalizeSuiAddress(proposalId)),
      txb.object(normalizeSuiAddress(submissionId)),
      txb.object(normalizeSuiAddress(marketplaceId)),
      txb.object(normalizeSuiAddress(clockId)),
    ],
  });

  return txb;
}

/**
 * Parse proposal data based on proposal type
 * Handles decoding of binary-encoded proposal data from the kai
 */
export function parseProposalData(proposal: Proposal): {
  type: string;
  title?: string;
  description?: string;
  rewardAmount?: string;
  submissionId?: string;
  price?: string;
} {
  // Handle if data is already a string (from JSON) or needs decoding
  let dataBytes: Uint8Array;
  
  if (typeof proposal.data === 'string') {
    // Try to decode as base64 first, fallback to raw bytes
    try {
      dataBytes = Uint8Array.from(atob(proposal.data), c => c.charCodeAt(0));
    } catch {
      // If not base64, treat as raw bytes from vector<u8>
      dataBytes = new TextEncoder().encode(proposal.data);
    }
  } else {
    dataBytes = proposal.data as Uint8Array;
  }

  switch (proposal.proposalType) {
    case ProposalType.CATEGORY: {
      // Data format: name|0|description|0|reward (u64, 8 bytes, little-endian)
      let i = 0;
      const nameBytes: number[] = [];
      const descBytes: number[] = [];
      
      // Parse name (until null separator)
      while (i < dataBytes.length && dataBytes[i] !== 0) {
        nameBytes.push(dataBytes[i]);
        i++;
      }
      i++; // Skip separator
      
      // Parse description (until null separator)
      while (i < dataBytes.length && dataBytes[i] !== 0) {
        descBytes.push(dataBytes[i]);
        i++;
      }
      i++; // Skip separator
      
      // Parse reward amount (last 8 bytes, little-endian u64)
      let reward = BigInt(0);
      let shift = BigInt(0);
      while (i < dataBytes.length && shift < BigInt(8)) {
        reward += BigInt(dataBytes[i]) << (shift * BigInt(8));
        i++;
        shift++;
      }
      
      const name = new TextDecoder().decode(Uint8Array.from(nameBytes));
      const description = new TextDecoder().decode(Uint8Array.from(descBytes));
      
      return {
        type: 'category',
        title: `Create Category: ${name}`,
        description,
        rewardAmount: reward.toString(),
      };
    }
    case ProposalType.DATA_APPROVAL: {
      // Data format: submission_id (32 bytes) | walrus_id | metadata | category_id
      // First 32 bytes are the submission ID
      if (dataBytes.length >= 32) {
        const submissionIdBytes = Array.from(dataBytes.slice(0, 32))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        const submissionId = '0x' + submissionIdBytes;
        
        return {
          type: 'data_approval',
          title: `Approve Data Submission`,
          description: `Proposal to approve data submission: ${submissionId.substring(0, 10)}...`,
          submissionId,
        };
      }
      
      return {
        type: 'data_approval',
        title: `Approve Data Submission`,
        description: 'Proposal to approve a data submission',
      };
    }
    case ProposalType.SET_PRICE: {
      // Data format: submission_id (32 bytes) | price (8 bytes, little-endian u64)
      if (dataBytes.length >= 40) {
        const submissionIdBytes = Array.from(dataBytes.slice(0, 32))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        const submissionId = '0x' + submissionIdBytes;
        
        // Parse price (bytes 32-39, little-endian u64)
        let price = BigInt(0);
        for (let i = 0; i < 8; i++) {
          price += BigInt(dataBytes[32 + i]) << (BigInt(i) * BigInt(8));
        }
        
        return {
          type: 'set_price',
          title: `Set Price for Data Submission`,
          description: `Proposal to set price for submission: ${submissionId.substring(0, 10)}...`,
          submissionId,
          price: price.toString(),
        };
      }
      
      return {
        type: 'set_price',
        title: `Set Price for Data Submission`,
        description: 'Proposal to set price for a data submission',
      };
    }
    default:
      return { 
        type: 'unknown', 
        title: 'Unknown Proposal',
        description: 'Proposal type not recognized',
      };
  }
}

/**
 * Get proposal status based on votes, threshold, and end time
 */
export function getProposalStatus(
  proposal: Proposal,
  dao: DataDAO,
  currentTime?: number
): 'Active' | 'Passed' | 'Failed' {
  if (proposal.executed) {
    return 'Passed';
  }
  
  const now = currentTime || Date.now();
  const endTime = BigInt(proposal.ends);
  
  // Check if voting has ended
  if (BigInt(now) >= endTime) {
    // Calculate vote percentage
    const totalSupply = BigInt(dao.kaiReserve) + BigInt(dao.rewardPool);
    const locked = totalSupply; // All KAI is either in reserve or reward pool
    const circulating = BigInt('1000000000000') - locked; // Total supply - locked (1M KAI with 6 decimals)
    const votes = BigInt(proposal.votes || '0');
    
    if (circulating > BigInt(0)) {
      const votePercentage = Number((votes * BigInt(100)) / circulating);
      const threshold = Number(dao.threshold);
      
      // Check quorum and threshold
      if (votePercentage >= threshold) {
        return 'Passed';
      }
    }
    
    return 'Failed';
  }
  
  return 'Active';
}

