"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProposeCategory, useAccountCap, useDao } from '@/hooks/use-dao';
import { useSuiWallet } from '@/hooks/use-sui-wallet';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Wallet } from 'lucide-react';
import { parseSuiAmount } from '@/lib/sui/config';
import Link from 'next/link';

export default function CreateProposalPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [type, setType] = useState<'category' | ''>('');
  
  const router = useRouter();
  const { proposeCategory, isLoading: proposing } = useProposeCategory();
  const { accountCap, isLoading: loadingAccountCap } = useAccountCap();
  const { dao, isLoading: loadingDao } = useDao();
  const { isConnected } = useSuiWallet();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!isConnected) {
      toast({
        variant: 'destructive',
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to create a proposal.',
      });
      return;
    }

    if (!accountCap) {
      toast({
        variant: 'destructive',
        title: 'AccountCap Required',
        description: 'You need to purchase KAI tokens first to get an AccountCap. Go to Dashboard → Purchase KAI.',
      });
      return;
    }

    if (!dao) {
      toast({
        variant: 'destructive',
        title: 'DAO Not Loaded',
        description: 'Failed to load DAO information. Please refresh the page.',
      });
      return;
    }

    // Verify AccountCap matches DAO
    if (accountCap.daoId !== dao.id) {
      toast({
        variant: 'destructive',
        title: 'AccountCap Mismatch',
        description: `Your AccountCap is for a different DAO. Expected: ${dao.id}, Got: ${accountCap.daoId}`,
      });
      return;
    }

    if (type !== 'category') {
      toast({
        variant: 'destructive',
        title: 'Unsupported Type',
        description: 'Only category proposals are supported at this time.',
      });
      return;
    }

    if (!name || !description || !rewardAmount) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields to create a proposal.',
      });
      return;
    }

    // Validate reward amount
    const rewardInMist = parseSuiAmount(rewardAmount, 6);
    if (rewardInMist <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Reward',
        description: 'Reward amount must be greater than 0.',
      });
      return;
    }

    console.log('Creating proposal with:', {
      name,
      description,
      rewardInMist: rewardInMist.toString(),
      daoId: dao.id,
      accountCapId: accountCap.id,
    });

    const result = await proposeCategory(
      name,
      description,
      rewardInMist.toString(),
      dao.id,
      accountCap.id
    );

    if (result) {
      toast({
        title: 'Proposal Created!',
        description: 'Your category proposal has been submitted to the blockchain.',
      });
      
      // Clear form
      setName('');
      setDescription('');
      setRewardAmount('');
      setType('');
      
      // Navigate to governance page
      setTimeout(() => {
        router.push('/governance');
      }, 1500);
    }
  };

  const isLoading = proposing || loadingAccountCap || loadingDao;

  return (
    <AppShell>
      <Card className="max-w-3xl mx-auto bg-card/60 backdrop-blur-sm border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle>Create a New Proposal</CardTitle>
          <CardDescription>
            Create a proposal to add a new data category to the DAO. You must have an AccountCap (purchase KAI tokens) to create proposals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <Wallet className="h-5 w-5" />
                <span className="font-medium">Wallet Not Connected</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Please connect your wallet to create a proposal.
              </p>
            </div>
          )}

          {isConnected && !accountCap && !loadingAccountCap && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-500 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Account Required</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                You need an AccountCap to create proposals. Purchase KAI tokens first.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard">
                  Purchase KAI
                </Link>
              </Button>
            </div>
          )}

          {isConnected && accountCap && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-green-500 mb-1">
                    <span className="font-medium">Account Ready</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your AccountCap: {accountCap.id.substring(0, 10)}...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    KAI Balance: {parseFloat(accountCap.kaiBalance) / 1e6} KAI
                  </p>
                </div>
              </div>
            </div>
          )}

          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="proposal-type">Proposal Type</Label>
              <Select onValueChange={(value) => setType(value as 'category')} value={type} required>
                <SelectTrigger id="proposal-type" className="bg-background/70">
                  <SelectValue placeholder="Select a proposal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Category Creation</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Currently only category proposals are supported. More types coming soon.
              </p>
            </div>

            {type === 'category' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    placeholder="e.g., Research Data, Medical Imaging, etc."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-background/70"
                  />
                  <p className="text-xs text-muted-foreground">
                    The name of the new data category
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category-description">Description</Label>
                  <Textarea
                    id="category-description"
                    placeholder="Provide a detailed description of what data this category will contain..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    className="bg-background/70"
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe the purpose and scope of this data category
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reward-amount">Reward Amount (KAI)</Label>
                  <Input
                    id="reward-amount"
                    type="number"
                    placeholder="e.g., 1000"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                    required
                    min="1"
                    step="1"
                    className="bg-background/70"
                  />
                  <p className="text-xs text-muted-foreground">
                    The amount of KAI tokens to reward contributors for submitting data to this category
                  </p>
                </div>
              </>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className="w-full" 
              disabled={isLoading || !isConnected || !accountCap || !type}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {proposing ? 'Creating Proposal...' : 'Loading...'}
                </>
              ) : (
                'Create Proposal'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
