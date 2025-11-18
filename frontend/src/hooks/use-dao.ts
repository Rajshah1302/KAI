'use client';

/**
 * DAO Contract Hooks
 * React hooks for interacting with the DAO contract
 */

import { useSuiClient } from '@mysten/dapp-kit';
import { useCurrentWallet } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useEffect, useState, useCallback } from 'react';
import { CONTRACT_ADDRESSES, CURRENT_NETWORK_CONFIG } from '@/lib/sui/config';
import {
  DataDAO,
  AccountCap,
  Proposal,
  DataCategory,
  DataSubmission,
  ProposalType,
} from '@/lib/sui/contract';
import {
  buildPurchaseKaiTx,
  buildAddKaiTx,
  buildBurnKaiTx,
  buildProposeCategoryTx,
  buildSubmitDataTx,
  buildVoteTx,
  buildProposePriceTx,
  buildPurchaseDataTx,
  buildExecuteCategoryProposalTx,
  buildExecuteDataProposalTx,
  buildExecutePriceProposalTx,
} from '@/lib/sui/contract';
import {
  executeTransactionWithFeedback,
  TransactionOptions,
} from '@/lib/sui/transactions';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to get DAO state
 */
export function useDao(daoId?: string) {
  const client = useSuiClient();
  const [dao, setDao] = useState<DataDAO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetDaoId = "0x0417758e231c61da4f26cd26276193efcdda10742e0b2ab308301710e9d4a4fc" || CONTRACT_ADDRESSES.DATA_DAO_ID;

  useEffect(() => {
    if (!targetDaoId) {
      setError('DAO ID not configured');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    client
      .getObject({
        id: targetDaoId,
        options: {
          showContent: true,
          showOwner: true,
        },
      })
      .then((obj) => {
        if (obj.data?.content && 'fields' in obj.data.content) {
          const fields = obj.data.content.fields as any;
          setDao({
            id: obj.data.objectId,
            treasury: fields.treasury || '0',
            kaiReserve: fields.kai_reserve || '0',
            rewardPool: fields.reward_pool || '0',
            kaiPrice: fields.kai_price || '0',
            quorum: fields.quorum || '0',
            threshold: fields.threshold || '0',
            voteTime: fields.vote_time || '0',
          });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch DAO:', err);
        setError('Failed to load DAO data');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [client, targetDaoId]);

  return { dao, isLoading, error };
}

/**
 * Hook to get user's AccountCap
 */
export function useAccountCap(daoId?: string) {
  const client = useSuiClient();
  const wallet = useCurrentWallet();
  const [accountCap, setAccountCap] = useState<AccountCap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetDaoId = "0x0417758e231c61da4f26cd26276193efcdda10742e0b2ab308301710e9d4a4fc" || CONTRACT_ADDRESSES.DATA_DAO_ID;
  const address = wallet?.currentWallet?.accounts?.[0]?.address;

  useEffect(() => {
    if (!address || !targetDaoId) {
      setAccountCap(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Query for AccountCap owned by user
    const rpcUrl = CURRENT_NETWORK_CONFIG.fullnodeUrl;

    fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getOwnedObjects',
        params: [
          address,
          {
            filter: {
              StructType: `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::AccountCap`,
            },
            options: {
              showContent: true,
            },
          },
          null, // cursor
          10, // limit
        ],
      }),
    })
      .then((res) => res.json())
      .then((data: any) => {
        if (data.error) {
          throw new Error(data.error.message || 'Query failed');
        }

        const objects = data.result?.data || [];
        const caps = objects
          .filter((obj: any) => obj.data?.content && 'fields' in obj.data.content)
          .map((obj: any) => {
            const fields = obj.data.content.fields as any;
            return {
              id: obj.data.objectId,
              daoId: fields.dao_id,
              kaiBalance: String(fields.kai_balance || '0'),
            };
          })
          .filter((cap: AccountCap) => cap.daoId === targetDaoId);

        setAccountCap(caps.length > 0 ? caps[0] : null);
      })
      .catch((err) => {
        console.error('Failed to fetch AccountCap:', err);
        setError('Failed to load account');
        setAccountCap(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [client, address, targetDaoId]);

  return { accountCap, isLoading, error };
}

/**
 * Hook to get proposals
 */
export function useProposals(daoId?: string, limit: number = 50) {
  const client = useSuiClient();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetDaoId = "0x0417758e231c61da4f26cd26276193efcdda10742e0b2ab308301710e9d4a4fc" || CONTRACT_ADDRESSES.DATA_DAO_ID;

  useEffect(() => {
    if (!targetDaoId) {
      setError('DAO ID not configured');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Query for Proposal objects using RPC
    const rpcUrl = CURRENT_NETWORK_CONFIG.fullnodeUrl;

    fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_queryObjects',
        params: [
          {
            filter: {
              StructType: `${CONTRACT_ADDRESSES.PACKAGE_ID}::contract::Proposal`,
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

        const objects = data.result?.data || [];
        const parsedProposals: Proposal[] = objects
          .filter((obj: any) => obj.data?.content && 'fields' in obj.data.content)
          .map((obj: any) => {
            const fields = obj.data.content.fields as any;
            
            // Handle data field - it's a vector<u8> which can come as:
            // - base64 string in JSON
            // - array of numbers [1, 2, 3...]
            let dataField = '';
            if (fields.data) {
              if (typeof fields.data === 'string') {
                // Already a string - could be base64 or raw
                dataField = fields.data;
              } else if (Array.isArray(fields.data)) {
                // Array of bytes - convert to base64
                const bytes = Uint8Array.from(fields.data);
                dataField = btoa(String.fromCharCode(...bytes));
              }
            }
            
            return {
              id: obj.data.objectId,
              daoId: fields.dao_id,
              proposalType: Number(fields.proposal_type) as ProposalType,
              data: dataField,
              votes: String(fields.votes || 0),
              voters: fields.voters || [],
              ends: String(fields.ends || 0),
              executed: fields.executed || false,
            };
          })
          .filter((p) => p.daoId === targetDaoId);

        setProposals(parsedProposals);
      })
      .catch((err) => {
        console.error('Failed to fetch proposals:', err);
        setError('Failed to load proposals');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [client, targetDaoId, limit]);

  return { proposals, isLoading, error, refetch: () => {} };
}

/**
 * Hook to purchase KAI tokens
 */
export function usePurchaseKai() {
  const wallet = useCurrentWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const purchaseKai = useCallback(
    async (suiAmount: string, daoId?: string) => {
      if (!wallet?.isConnected || !wallet.currentWallet) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet first.',
          variant: 'destructive',
        });
        return null;
      }

      const targetDaoId = daoId || CONTRACT_ADDRESSES.DATA_DAO_ID;
      if (!targetDaoId) {
        toast({
          title: 'Configuration Error',
          description: 'DAO ID not configured.',
          variant: 'destructive',
        });
        return null;
      }

      setIsLoading(true);

      try {
        const txb = new TransactionBlock();
        buildPurchaseKaiTx(txb, targetDaoId, suiAmount);

        const result = await executeTransactionWithFeedback(
          txb,
          wallet.currentWallet,
          {
            simulate: true,
            toast,
            onSuccess: (result) => {
              toast({
                title: 'KAI Purchased',
                description: `Successfully purchased KAI tokens.`,
              });
            },
          }
        );

        return result;
      } catch (error: any) {
        toast({
          title: 'Purchase Failed',
          description: error.message || 'Failed to purchase KAI tokens.',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, toast]
  );

  return { purchaseKai, isLoading };
}

/**
 * Hook to vote on a proposal
 */
export function useVote() {
  const wallet = useCurrentWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const vote = useCallback(
    async (
      daoId: string,
      accountCapId: string,
      proposalId: string,
      daoIdParam?: string
    ) => {
      if (!wallet?.isConnected || !wallet.currentWallet) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet first.',
          variant: 'destructive',
        });
        return null;
      }

      const targetDaoId = daoIdParam || CONTRACT_ADDRESSES.DATA_DAO_ID;

      setIsLoading(true);

      try {
        const txb = new TransactionBlock();
        buildVoteTx(txb, targetDaoId, accountCapId, proposalId);

        const result = await executeTransactionWithFeedback(
          txb,
          wallet.currentWallet,
          {
            simulate: true,
            toast,
            onSuccess: () => {
              toast({
                title: 'Vote Submitted',
                description: 'Your vote has been recorded.',
              });
            },
          }
        );

        return result;
      } catch (error: any) {
        toast({
          title: 'Vote Failed',
          description: error.message || 'Failed to submit vote.',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, toast]
  );

  return { vote, isLoading };
}

/**
 * Hook to submit data
 */
export function useSubmitData() {
  const wallet = useCurrentWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const submitData = useCallback(
    async (
      walrusBlobId: string,
      metadata: string,
      categoryId: string, // Now expects category object ID
      daoId?: string
    ) => {
      if (!wallet?.isConnected || !wallet.currentWallet) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet first.',
          variant: 'destructive',
        });
        return null;
      }

      const targetDaoId = daoId || CONTRACT_ADDRESSES.DATA_DAO_ID;

      setIsLoading(true);

      try {
        const txb = new TransactionBlock();
        buildSubmitDataTx(txb, targetDaoId, categoryId, walrusBlobId, metadata);

        const result = await executeTransactionWithFeedback(
          txb,
          wallet.currentWallet,
          {
            simulate: true,
            toast,
            onSuccess: () => {
              toast({
                title: 'Data Submitted',
                description: 'Your data submission has been created and a proposal is pending DAO approval.',
              });
            },
          }
        );

        return result;
      } catch (error: any) {
        toast({
          title: 'Submission Failed',
          description: error.message || 'Failed to submit data.',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, toast]
  );

  return { submitData, isLoading };
}

/**
 * Hook to add KAI to existing account
 */
export function useAddKai() {
  const wallet = useCurrentWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const addKai = useCallback(
    async (
      daoId: string,
      accountCapId: string,
      suiAmount: string,
      daoIdParam?: string
    ) => {
      if (!wallet?.isConnected || !wallet.currentWallet) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet first.',
          variant: 'destructive',
        });
        return null;
      }

      const targetDaoId = daoIdParam || CONTRACT_ADDRESSES.DATA_DAO_ID;

      if (!accountCapId) {
        toast({
          title: 'Account Required',
          description: 'You need an AccountCap to add KAI. Purchase KAI first to create an account.',
          variant: 'destructive',
        });
        return null;
      }

      setIsLoading(true);

      try {
        const txb = new TransactionBlock();
        buildAddKaiTx(txb, targetDaoId, accountCapId, suiAmount);

        const result = await executeTransactionWithFeedback(
          txb,
          wallet.currentWallet,
          {
            simulate: true,
            toast,
            onSuccess: () => {
              toast({
                title: 'KAI Added',
                description: `Successfully added KAI tokens to your account.`,
              });
            },
          }
        );

        return result;
      } catch (error: any) {
        toast({
          title: 'Add Failed',
          description: error.message || 'Failed to add KAI tokens.',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, toast]
  );

  return { addKai, isLoading };
}

/**
 * Hook to burn KAI and redeem SUI
 */
export function useBurnKai() {
  const wallet = useCurrentWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const burnKai = useCallback(
    async (
      daoId: string,
      accountCapId: string,
      kaiAmount: string,
      daoIdParam?: string
    ) => {
      if (!wallet?.isConnected || !wallet.currentWallet) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet first.',
          variant: 'destructive',
        });
        return null;
      }

      const targetDaoId = daoIdParam || CONTRACT_ADDRESSES.DATA_DAO_ID;

      if (!accountCapId) {
        toast({
          title: 'Account Required',
          description: 'You need an AccountCap to burn KAI.',
          variant: 'destructive',
        });
        return null;
      }

      setIsLoading(true);

      try {
        const txb = new TransactionBlock();
        buildBurnKaiTx(txb, targetDaoId, accountCapId, kaiAmount, 6);

        const result = await executeTransactionWithFeedback(
          txb,
          wallet.currentWallet,
          {
            simulate: true,
            toast,
            onSuccess: () => {
              toast({
                title: 'KAI Burned',
                description: `Successfully burned KAI tokens and redeemed SUI.`,
              });
            },
          }
        );

        return result;
      } catch (error: any) {
        toast({
          title: 'Burn Failed',
          description: error.message || 'Failed to burn KAI tokens.',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, toast]
  );

  return { burnKai, isLoading };
}

/**
 * Hook to propose a category
 */
export function useProposeCategory() {
  const wallet = useCurrentWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const proposeCategory = useCallback(
    async (
      name: string,
      description: string,
      rewardAmount: string,
      daoId?: string,
      accountCapId?: string
    ) => {
      if (!wallet?.isConnected || !wallet.currentWallet) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet first.',
          variant: 'destructive',
        });
        return null;
      }

      const targetDaoId = daoId || CONTRACT_ADDRESSES.DATA_DAO_ID;

      // Note: accountCapId should be provided or fetched separately
      // We can't use hooks in callbacks, so caller should provide it
      if (!accountCapId) {
        toast({
          title: 'Account Required',
          description: 'You need an AccountCap to create proposals. Purchase KAI first.',
          variant: 'destructive',
        });
        return null;
      }

      setIsLoading(true);

      try {
        const txb = new TransactionBlock();
        buildProposeCategoryTx(
          txb,
          targetDaoId,
          accountCapId,
          name,
          description,
          rewardAmount
        );

        const result = await executeTransactionWithFeedback(
          txb,
          wallet.currentWallet,
          {
            simulate: true,
            toast,
            onSuccess: () => {
              toast({
                title: 'Proposal Created',
                description: 'Your category proposal has been submitted.',
              });
            },
          }
        );

        return result;
      } catch (error: any) {
        toast({
          title: 'Proposal Failed',
          description: error.message || 'Failed to create proposal.',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, toast]
  );

  return { proposeCategory, isLoading };
}

/**
 * Hook to execute a category proposal
 */
export function useExecuteCategoryProposal() {
  const wallet = useCurrentWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const executeProposal = useCallback(
    async (
      daoId: string,
      proposalId: string,
      clockId: string = '0x6'
    ) => {
      if (!wallet?.isConnected || !wallet.currentWallet) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet first.',
          variant: 'destructive',
        });
        return null;
      }

      setIsLoading(true);

      try {
        const txb = new TransactionBlock();
        buildExecuteCategoryProposalTx(txb, daoId, proposalId, clockId);

        const result = await executeTransactionWithFeedback(
          txb,
          wallet.currentWallet,
          {
            simulate: true,
            toast,
            onSuccess: () => {
              toast({
                title: 'Proposal Executed',
                description: 'The category proposal has been executed successfully.',
              });
            },
          }
        );

        return result;
      } catch (error: any) {
        toast({
          title: 'Execution Failed',
          description: error.message || 'Failed to execute proposal.',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, toast]
  );

  return { executeProposal, isLoading };
}

/**
 * Hook to execute a data proposal
 */
export function useExecuteDataProposal() {
  const wallet = useCurrentWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const executeProposal = useCallback(
    async (
      daoId: string,
      proposalId: string,
      clockId: string = '0x6'
    ) => {
      if (!wallet?.isConnected || !wallet.currentWallet) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet first.',
          variant: 'destructive',
        });
        return null;
      }

      setIsLoading(true);

      try {
        const txb = new TransactionBlock();
        buildExecuteDataProposalTx(txb, daoId, proposalId, clockId);

        const result = await executeTransactionWithFeedback(
          txb,
          wallet.currentWallet,
          {
            simulate: true,
            toast,
            onSuccess: () => {
              toast({
                title: 'Proposal Executed',
                description: 'The data proposal has been executed successfully.',
              });
            },
          }
        );

        return result;
      } catch (error: any) {
        toast({
          title: 'Execution Failed',
          description: error.message || 'Failed to execute proposal.',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, toast]
  );

  return { executeProposal, isLoading };
}

/**
 * Hook to execute a price proposal
 */
export function useExecutePriceProposal() {
  const wallet = useCurrentWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const executeProposal = useCallback(
    async (
      daoId: string,
      proposalId: string,
      marketplaceId: string,
      clockId: string = '0x6'
    ) => {
      if (!wallet?.isConnected || !wallet.currentWallet) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet first.',
          variant: 'destructive',
        });
        return null;
      }

      setIsLoading(true);

      try {
        const txb = new TransactionBlock();
        buildExecutePriceProposalTx(txb, daoId, proposalId, marketplaceId, clockId);

        const result = await executeTransactionWithFeedback(
          txb,
          wallet.currentWallet,
          {
            simulate: true,
            toast,
            onSuccess: () => {
              toast({
                title: 'Proposal Executed',
                description: 'The price proposal has been executed successfully.',
              });
            },
          }
        );

        return result;
      } catch (error: any) {
        toast({
          title: 'Execution Failed',
          description: error.message || 'Failed to execute proposal.',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, toast]
  );

  return { executeProposal, isLoading };
}
