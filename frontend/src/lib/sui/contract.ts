/**
 * Contract ABI Types and Utilities
 * Type definitions and utilities for interacting with the DAO contract
 */

import { TransactionBlock } from '@mysten/sui.js/transactions';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';
import { CONTRACT_ADDRESSES, suiClient } from './config';
import { formatSuiAmount, parseSuiAmount } from './config';

// Contract function names
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

// Contract types
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
 * Build transaction to purchase KAI tokens
 */
export function buildPurchaseKaiTx(
  txb: TransactionBlock,
  daoId: string,
  suiAmount: string | bigint
): TransactionBlock {
  const suiAmountMist = typeof suiAmount === 'string' ? parseSuiAmount(suiAmount) : suiAmount;
  
  const [coin] = txb.splitCoins(txb.gas, [suiAmountMist]);
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::${CONTRACT_FUNCTIONS.PURCHASE_KAI}`,
    arguments: [
      txb.object(daoId),
      coin,
    ],
  });

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
  const suiAmountMist = typeof suiAmount === 'string' ? parseSuiAmount(suiAmount) : suiAmount;
  
  const [coin] = txb.splitCoins(txb.gas, [suiAmountMist]);
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::${CONTRACT_FUNCTIONS.ADD_KAI}`,
    arguments: [
      txb.object(daoId),
      txb.object(accountCapId),
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
  const kaiAmountMist = typeof kaiAmount === 'string' ? parseSuiAmount(kaiAmount, decimals) : kaiAmount;
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::${CONTRACT_FUNCTIONS.BURN_KAI}`,
    arguments: [
      txb.object(daoId),
      txb.object(accountCapId),
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
  const rewardAmountMist = typeof rewardAmount === 'string' ? parseSuiAmount(rewardAmount, 6) : rewardAmount;
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::${CONTRACT_FUNCTIONS.PROPOSE_CATEGORY}`,
    arguments: [
      txb.object(daoId),
      txb.object(accountCapId),
      txb.pure.string(name),
      txb.pure.string(description),
      txb.pure.u64(rewardAmountMist),
      txb.object(clockId),
    ],
  });

  return txb;
}

/**
 * Build transaction to submit data
 */
export function buildSubmitDataTx(
  txb: TransactionBlock,
  daoId: string,
  walrusBlobId: string,
  metadata: string,
  categoryId: string,
  clockId: string = '0x6'
): TransactionBlock {
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::${CONTRACT_FUNCTIONS.SUBMIT_DATA}`,
    arguments: [
      txb.object(daoId),
      txb.pure.string(walrusBlobId),
      txb.pure.string(metadata),
      txb.pure.id(categoryId),
      txb.object(clockId),
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
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::${CONTRACT_FUNCTIONS.VOTE}`,
    arguments: [
      txb.object(daoId),
      txb.object(accountCapId),
      txb.object(proposalId),
      txb.object(clockId),
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
  const priceMist = typeof price === 'string' ? parseSuiAmount(price, 6) : price;
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::${CONTRACT_FUNCTIONS.PROPOSE_PRICE}`,
    arguments: [
      txb.object(daoId),
      txb.object(accountCapId),
      txb.pure.id(submissionId),
      txb.pure.u64(priceMist),
      txb.object(clockId),
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
  const priceMist = typeof price === 'string' ? parseSuiAmount(price) : price;
  
  const [coin] = txb.splitCoins(txb.gas, [priceMist]);
  
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::${CONTRACT_FUNCTIONS.PURCHASE_DATA}`,
    arguments: [
      txb.object(daoId),
      txb.object(submissionId),
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
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::${CONTRACT_FUNCTIONS.EXECUTE_CATEGORY_PROPOSAL}`,
    arguments: [
      txb.object(daoId),
      txb.object(proposalId),
      txb.object(clockId),
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
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::${CONTRACT_FUNCTIONS.EXECUTE_DATA_PROPOSAL}`,
    arguments: [
      txb.object(daoId),
      txb.object(proposalId),
      txb.object(submissionId),
      txb.object(categoryId),
      txb.object(clockId),
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
  txb.moveCall({
    target: `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::${CONTRACT_FUNCTIONS.EXECUTE_PRICE_PROPOSAL}`,
    arguments: [
      txb.object(daoId),
      txb.object(proposalId),
      txb.object(submissionId),
      txb.object(marketplaceId),
      txb.object(clockId),
    ],
  });

  return txb;
}

/**
 * Parse proposal data based on proposal type
 */
export function parseProposalData(proposal: Proposal): any {
  switch (proposal.proposalType) {
    case ProposalType.CATEGORY: {
      // Data format: name|0|description|0|reward (u64)
      const data = Buffer.from(proposal.data, 'base64');
      // Simplified parsing - adjust based on actual encoding
      return {
        type: 'category',
        data: proposal.data,
      };
    }
    case ProposalType.DATA_APPROVAL: {
      // Data is submission ID
      return {
        type: 'data_approval',
        submissionId: proposal.data,
      };
    }
    case ProposalType.SET_PRICE: {
      // Data format: submission_id|price (u64)
      return {
        type: 'set_price',
        data: proposal.data,
      };
    }
    default:
      return { type: 'unknown', data: proposal.data };
  }
}

