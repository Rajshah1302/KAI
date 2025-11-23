/**
 * Transaction Utilities
 * Handles gas estimation, simulation, execution, and error handling
 */

import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiTransactionBlockResponse, SuiClient } from '@mysten/sui.js/client';
import { Signer } from '@mysten/sui.js/cryptography';
import { suiClient, DEFAULT_NETWORK, CURRENT_NETWORK_CONFIG } from './config';

export interface TransactionOptions {
  /** Whether to simulate the transaction before execution */
  simulate?: boolean;
  /** Custom gas budget (in MIST) */
  gasBudget?: string | bigint;
  /** Request type (waitForEffectsCert or waitForLocalExecution) */
  requestType?: 'WaitForEffectsCert' | 'WaitForLocalExecution';
  /** Show progress toasts */
  showProgress?: boolean;
}

export interface TransactionResult {
  digest: string;
  effects?: any;
  events?: any[];
  error?: string;
}

export class TransactionError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
  txb: TransactionBlock,
  signer: Signer
): Promise<bigint> {
  try {
    // Get sender address for building
    const senderAddress = await signer.getAddress();
    
    // Build and simulate to get gas estimate
    const dryRunResult = await suiClient.dryRunTransactionBlock({
      transactionBlock: await txb.build({ client: suiClient, sender: senderAddress }),
    });

    // Get gas budget from effects
    if (dryRunResult.effects?.gasUsed?.computationCost) {
      const computationCost = BigInt(dryRunResult.effects.gasUsed.computationCost);
      const storageCost = BigInt(dryRunResult.effects.gasUsed.storageCost || '0');
      const storageRebate = BigInt(dryRunResult.effects.gasUsed.storageRebate || '0');
      
      // Gas budget = computation + storage - rebate, with 20% buffer
      const total = computationCost + storageCost - storageRebate;
      return (total * BigInt(120)) / BigInt(100); // 20% buffer
    }

    // Fallback: return default gas budget
    return BigInt(50_000_000); // 0.05 SUI
  } catch (error: any) {
    console.error('Gas estimation failed:', error);
    // Return default gas budget on error
    return BigInt(50_000_000); // 0.05 SUI
  }
}

/**
 * Simulate a transaction without executing it
 */
export async function simulateTransaction(
  txb: TransactionBlock,
  signer: Signer
): Promise<any> {
  try {
    // Get sender address for building
    const senderAddress = await signer.getAddress();
    
    const dryRunResult = await suiClient.dryRunTransactionBlock({
      transactionBlock: await txb.build({ client: suiClient, sender: senderAddress }),
    });

    // Check for errors
    if (dryRunResult.effects?.status?.status === 'failure') {
      throw new TransactionError(
        dryRunResult.effects.status.error || 'Transaction simulation failed',
        dryRunResult.effects.status.error?.code,
        dryRunResult.effects.status
      );
    }

    return {
      effects: dryRunResult.effects,
      events: dryRunResult.events,
      gasUsed: dryRunResult.effects?.gasUsed,
    };
  } catch (error: any) {
    if (error instanceof TransactionError) {
      throw error;
    }
    throw new TransactionError(
      `Simulation failed: ${error.message}`,
      undefined,
      error
    );
  }
}

/**
 * Execute a transaction
 */
export async function executeTransaction(
  txb: TransactionBlock,
  signer: Signer,
  options: TransactionOptions = {}
): Promise<TransactionResult> {
  const {
    simulate = false,
    gasBudget,
    requestType = 'WaitForEffectsCert',
    showProgress = true,
  } = options;

  try {
    // Set gas budget if provided
    if (gasBudget) {
      txb.setGasBudget(
        typeof gasBudget === 'string' ? BigInt(gasBudget) : gasBudget
      );
    } else {
      // Auto-estimate gas if not provided
      const estimatedGas = await estimateGas(txb, signer);
      txb.setGasBudget(estimatedGas);
    }

    // Simulate first if requested
    if (simulate) {
      if (showProgress) {
        console.log('Simulating transaction...');
      }
      await simulateTransaction(txb, signer);
      if (showProgress) {
        console.log('Simulation successful');
      }
    }

    // Build and execute transaction
    if (showProgress) {
      console.log('Executing transaction...');
    }

    const result = await signer.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      options: {
        showEffects: true,
        showEvents: true,
        showBalanceChanges: true,
        showInput: false,
      },
      requestType,
    });

    if (showProgress) {
      console.log('Transaction executed:', result.digest);
    }

    return {
      digest: result.digest,
      effects: result.effects,
      events: result.events,
    };
  } catch (error: any) {
    const errorMessage = parseTransactionError(error);
    if (showProgress) {
      console.error('Transaction failed:', errorMessage);
    }
    return {
      digest: '',
      error: errorMessage,
    };
  }
}

/**
 * Parse transaction error into user-friendly message
 */
export function parseTransactionError(error: any): string {
  if (!error) return 'Unknown error occurred';

  // Check for structured error
  if (error.message) {
    // Common Sui error patterns
    const message = error.message.toLowerCase();

    if (message.includes('insufficient gas')) {
      return 'Insufficient gas. Please ensure you have enough SUI in your wallet.';
    }

    if (message.includes('insufficient balance')) {
      return 'Insufficient balance. You do not have enough tokens to complete this transaction.';
    }

    if (message.includes('already voted')) {
      return 'You have already voted on this proposal.';
    }

    if (message.includes('voting ended')) {
      return 'Voting period has ended for this proposal.';
    }

    if (message.includes('voting not ended')) {
      return 'Voting period has not ended yet. Please wait before executing.';
    }

    if (message.includes('insufficient kai')) {
      return 'Insufficient KAI balance.';
    }

    if (message.includes('no kai available')) {
      return 'No KAI available in reserve.';
    }

    if (message.includes('wrong dao')) {
      return 'Invalid DAO. This account does not belong to the correct DAO.';
    }

    if (message.includes('not listed')) {
      return 'This dataset is not listed for sale.';
    }

    if (message.includes('insufficient payment')) {
      return 'Insufficient payment amount.';
    }

    if (message.includes('user rejected')) {
      return 'Transaction was rejected by user.';
    }

    if (message.includes('timeout')) {
      return 'Transaction timed out. Please try again.';
    }

    // Return original message if no pattern matches
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  digest: string,
  timeout: number = 30000
): Promise<SuiTransactionBlockResponse> {
  return suiClient.waitForTransaction({
    digest,
    timeout,
    pollInterval: 1000,
  });
}

/**
 * Get transaction details
 */
export async function getTransactionDetails(
  digest: string
): Promise<SuiTransactionBlockResponse | null> {
  try {
    return await suiClient.getTransactionBlock({
      digest,
      options: {
        showEffects: true,
        showEvents: true,
        showBalanceChanges: true,
        showInput: true,
      },
    });
  } catch (error) {
    console.error('Failed to get transaction details:', error);
    return null;
  }
}

/**
 * Check if transaction was successful
 */
export function isTransactionSuccessful(result: TransactionResult): boolean {
  if (result.error) return false;
  if (!result.effects) return false;
  
  const status = result.effects.status;
  if (!status || typeof status !== 'object') return false;
  
  return status.status === 'success';
}

/**
 * Hook-friendly transaction executor
 * This is a utility that can be used within React hooks
 * Updated to work with dapp-kit WalletWithRequiredFeatures
 */
export async function executeTransactionWithFeedback(
  txb: TransactionBlock,
  wallet: any, // WalletWithRequiredFeatures from dapp-kit
  options: TransactionOptions & {
    onSuccess?: (result: TransactionResult) => void;
    onError?: (error: string) => void;
    toast?: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
  } = {}
): Promise<TransactionResult | null> {
  const { onSuccess, onError, toast, ...txOptions } = options;

  try {
    // Get account address from wallet
    const address = wallet?.address;
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (toast) {
      toast({
        title: 'Processing Transaction',
        description: 'Please confirm in your wallet...',
      });
    }

    // Suiet wallet kit handles transaction execution directly
    const result = await wallet.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
        showInput: true,
      },
    });

    console.log('Transaction result:', {
      digest: result.digest,
      effects: result.effects,
      events: result.events,
      objectChanges: result.objectChanges,
      rawEffects: result.rawEffects,
      fullResult: result,
    });

    // Check if effects exist
    if (!result.effects && result.rawEffects) {
      console.log('Effects not parsed, but rawEffects available. Attempting to decode...');
      console.log('Raw effects bytes:', result.rawEffects);
      
      // The transaction was executed, but effects aren't parsed
      // Since we have rawEffects, the transaction likely succeeded
      if (toast) {
        toast({
          title: 'Transaction Submitted',
          description: `Transaction ${result.digest.slice(0, 16)}... was submitted successfully. Verifying on-chain...`,
          variant: 'default',
        });
      }
      
      // Try to get transaction details from the blockchain
      try {
        const client = new SuiClient({ url: CURRENT_NETWORK_CONFIG.fullnodeUrl });
        const txDetails = await client.getTransactionBlock({
          digest: result.digest,
          options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
          }
        });
        
        console.log('Fetched transaction details:', txDetails);
        
        if (txDetails.effects?.status?.status === 'success') {
          console.log('✅ Transaction confirmed successful on-chain!');
          
          // Save created Proposal objects to localStorage
          if (txDetails.objectChanges) {
            const createdProposals = txDetails.objectChanges.filter(
              (change: any) => 
                change.type === 'created' && 
                change.objectType?.includes('::kai::Proposal')
            );
            
            if (createdProposals.length > 0 && typeof window !== 'undefined') {
              createdProposals.forEach((proposal: any) => {
                const proposalId = proposal.objectId;
                console.log('Saving proposal to localStorage:', proposalId);
                
                // Store in localStorage for later retrieval
                const existingProposals = JSON.parse(
                  localStorage.getItem('kai_proposals') || '[]'
                );
                if (!existingProposals.includes(proposalId)) {
                  existingProposals.push(proposalId);
                  localStorage.setItem('kai_proposals', JSON.stringify(existingProposals));
                }
              });
            }
          }
          
          if (toast) {
            toast({
              title: 'Transaction Successful',
              description: `Transaction confirmed: ${result.digest.slice(0, 8)}...`,
            });
          }
          onSuccess?.(txDetails as any);
          return txDetails as any;
        } else {
          const errorMsg = txDetails.effects?.status?.error || 'Transaction failed';
          console.error('Transaction failed:', errorMsg);
          if (toast) {
            toast({
              title: 'Transaction Failed',
              description: errorMsg,
              variant: 'destructive',
            });
          }
          onError?.(errorMsg);
          return null;
        }
      } catch (fetchError: any) {
        console.error('Failed to fetch transaction details:', fetchError);
        // Return the original result anyway
        return result as any;
      }
    }
    
    if (!result.effects) {
      console.error('Transaction result missing effects and rawEffects:', result);
      
      if (toast) {
        toast({
          title: 'Transaction Status Unknown',
          description: `Transaction ${result.digest.slice(0, 8)}... submitted but status unclear. Check Sui Explorer.`,
          variant: 'default',
        });
      }
      
      return result as any;
    }

    if (result.effects?.status?.status !== 'success') {
      const errorMsg = result.effects?.status?.error || 'Transaction failed';
      const errorDetails = JSON.stringify(result.effects?.status, null, 2);
      
      console.error('Transaction failed with details:', errorDetails);
      console.error('Full effects:', result.effects);
      
      if (toast) {
        toast({
          title: 'Transaction Failed',
          description: `${errorMsg}\n\nCheck console for full details.`,
          variant: 'destructive',
        });
      }
      onError?.(errorMsg);
      return null;
    }

    console.log('✅ Transaction successful!', result.digest);
    
    if (toast) {
      toast({
        title: 'Transaction Successful',
        description: `Transaction confirmed: ${result.digest.slice(0, 8)}...`,
      });
    }

    onSuccess?.(result);
    return result;
  } catch (error: any) {
    console.error('Transaction execution error:', {
      message: error.message,
      stack: error.stack,
      full: error,
    });
    
    const errorMsg = parseTransactionError(error);
    if (toast) {
      toast({
        title: 'Transaction Failed',
        description: `${errorMsg}\n\nError: ${error.message || 'Unknown error'}\n\nCheck console for details.`,
        variant: 'destructive',
      });
    }
    onError?.(errorMsg);
    return null;
  }
}

