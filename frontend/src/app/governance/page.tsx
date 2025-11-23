"use client"

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, ThumbsDown, ThumbsUp, Eye, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useProposals, useDao, useAccountCap, useVote, useExecuteCategoryProposal } from '@/hooks/use-dao';
import { parseProposalData, getProposalStatus, ProposalType } from '@/lib/sui/contract';
import { useSuiWallet } from '@/hooks/use-sui-wallet';
import { formatSuiAmount } from '@/lib/sui/config';
import { useToast } from '@/hooks/use-toast';

export default function GovernancePage() {
    const { dao, isLoading: daoLoading } = useDao();
    const { proposals, isLoading: proposalsLoading, error } = useProposals();
    const { accountCap, isLoading: accountCapLoading } = useAccountCap();
    const { isConnected, address } = useSuiWallet();
    const { vote, isLoading: voting } = useVote();
    const { executeProposal: executeCategoryProposal, isLoading: executing } = useExecuteCategoryProposal();
    const { toast } = useToast();

    // Format time remaining
    const formatTimeRemaining = (endTime: string) => {
        const now = Date.now();
        const ends = Number(BigInt(endTime));
        const diff = ends - now;
        
        if (diff <= 0) {
            return 'Ended';
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} remaining`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
        } else {
            return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
        }
    };

    // Get proposal type label
    const getProposalTypeLabel = (type: ProposalType) => {
        switch (type) {
            case ProposalType.CATEGORY:
                return 'Category Creation';
            case ProposalType.DATA_APPROVAL:
                return 'Data Approval';
            case ProposalType.SET_PRICE:
                return 'Pricing';
            default:
                return 'Unknown';
        }
    };

    // Handle voting
    const handleVote = async (proposalId: string) => {
        if (!isConnected || !accountCap || !dao) {
            toast({
                title: 'Action Required',
                description: 'Please connect your wallet and ensure you have an AccountCap.',
                variant: 'destructive',
            });
            return;
        }

        const result = await vote(
            dao.id,
            accountCap.id,
            proposalId,
            dao.id
        );

        if (result) {
            // Proposal list will auto-refresh
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
        }
    };

    // Handle execution
    const handleExecute = async (proposalId: string, proposalType: ProposalType) => {
        if (!isConnected || !dao) {
            toast({
                title: 'Action Required',
                description: 'Please connect your wallet.',
                variant: 'destructive',
            });
            return;
        }

        if (proposalType === ProposalType.CATEGORY) {
            const result = await executeCategoryProposal(dao.id, proposalId);
            if (result) {
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            }
        } else {
            toast({
                title: 'Not Implemented',
                description: 'Execution for this proposal type is not yet implemented.',
                variant: 'destructive',
            });
        }
    };

    // Process proposals with parsed data and status
    const processedProposals = useMemo(() => {
        if (!proposals || !dao) return [];
        
        return proposals.map((proposal) => {
            const parsed = parseProposalData(proposal);
            const status = getProposalStatus(proposal, dao);
            const votes = BigInt(proposal.votes || '0');
            const totalSupply = BigInt(dao.kaiReserve) + BigInt(dao.rewardPool);
            const circulating = BigInt('1000000000000') - totalSupply;
            
            // Calculate vote percentage
            let votePercentage = 0;
            if (circulating > BigInt(0)) {
                votePercentage = Number((votes * BigInt(100)) / circulating);
            }

            return {
                ...proposal,
                ...parsed,
                status,
                votePercentage,
                votes: votes.toString(),
                typeLabel: getProposalTypeLabel(proposal.proposalType),
                timeRemaining: formatTimeRemaining(proposal.ends),
                userVoted: proposal.voters?.includes(address || '') || false,
            };
        });
    }, [proposals, dao, address]);

    const isLoading = daoLoading || proposalsLoading || accountCapLoading;

    return (
        <AppShell>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-medium text-foreground mb-2">
                        Governance
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Active proposals and voting
                    </p>
                </div>
                <Button asChild className="bg-gradient-to-br from-primary/80 to-purple-500/80 text-primary-foreground">
                    <Link href="/governance/create">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create Proposal
                    </Link>
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                    Error loading proposals: {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading proposals...</span>
                </div>
            ) : processedProposals.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg mb-4">No proposals found</p>
                    <Button asChild>
                        <Link href="/governance/create">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Create First Proposal
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {processedProposals.map((proposal) => {
                        const isActive = proposal.status === 'Active';
                        const isPassed = proposal.status === 'Passed';
                        const canExecute = isPassed && !proposal.executed && proposal.proposalType === ProposalType.CATEGORY;

                        return (
                            <div
                                key={proposal.id}
                                className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-foreground mb-2">
                                            {proposal.title || 'Untitled Proposal'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {proposal.description || 'No description available'}
                                        </p>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                                {proposal.typeLabel}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {proposal.timeRemaining}
                                            </span>
                                            {proposal.rewardAmount && (
                                                <span className="text-xs text-muted-foreground">
                                                    Reward: {formatSuiAmount(proposal.rewardAmount, 6)} KAI
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${
                                            proposal.status === "Active"
                                                ? "bg-green-500/10 text-green-500"
                                                : proposal.status === "Passed"
                                                ? "bg-blue-500/10 text-blue-500"
                                                : "bg-red-500/10 text-red-500"
                                        }`}
                                    >
                                        {proposal.status}
                                    </span>
                                </div>

                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-foreground">
                                            Votes: {proposal.votes} ({proposal.votePercentage.toFixed(2)}%)
                                        </span>
                                        {proposal.userVoted && (
                                            <span className="text-xs text-primary">✓ You voted</span>
                                        )}
                                    </div>
                                    <div className="relative h-2 w-full rounded-full overflow-hidden bg-secondary">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                                            style={{ width: `${Math.min(proposal.votePercentage, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {isActive && !proposal.userVoted && isConnected && accountCap && (
                                        <Button
                                            onClick={() => handleVote(proposal.id)}
                                            disabled={voting}
                                            className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20"
                                        >
                                            {voting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Voting...
                                                </>
                                            ) : (
                                                <>
                                                    <ThumbsUp className="mr-2 h-4 w-4" />
                                                    Vote Yes
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    {canExecute && isConnected && (
                                        <Button
                                            onClick={() => handleExecute(proposal.id, proposal.proposalType)}
                                            disabled={executing}
                                            className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border-blue-500/20"
                                        >
                                            {executing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Executing...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Execute
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    {!isActive && !canExecute && (
                                        <div className="flex-1 text-center text-sm text-muted-foreground py-3">
                                            {proposal.executed ? 'Executed' : proposal.status === 'Failed' ? 'Did not pass' : 'Awaiting execution'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AppShell>
    );
}
