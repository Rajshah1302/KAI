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
import { useLendingDataStorage } from '@/hooks/use-walrus';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function CreateProposalPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  
  const router = useRouter();
  const { storeLendingData, isLoading } = useLendingDataStorage();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title || !description || !type) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields to create a proposal.',
      });
      return;
    }

    const proposalData = {
      title,
      description,
      type,
      status: 'Active', // New proposals are active by default
      votes_for: 0,
      votes_against: 0,
      end_date: '7 days remaining', // Mock end date
    };

    const result = await storeLendingData(proposalData);

    if (result?.success && result.blobId) {
      toast({
        title: 'Proposal Submitted!',
        description: 'Your proposal has been stored on Walrus and is now open for voting.',
      });

      try {
        const existingProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
        const newProposal = {
          ...proposalData,
          id: result.blobId, // Use the blobId as the unique ID
        };
        
        existingProposals.push(newProposal);
        localStorage.setItem('proposals', JSON.stringify(existingProposals));
        
        router.push('/dashboard');
      } catch (e) {
          console.error("Failed to save to local storage", e);
          toast({
              variant: 'destructive',
              title: 'Local Storage Error',
              description: 'Could not save proposal to your browser\'s local storage.',
          });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: result?.error || 'Could not store proposal on Walrus. Please try again.',
      });
    }
  };

  return (
    <AppShell>
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create a New Proposal</h1>
            <p className="text-muted-foreground">Propose a new action for the DAO to vote on.</p>
        </div>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
          <CardDescription>
            Fill out the form below. Your proposal will be uploaded to Walrus and become visible on the governance page for voting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="proposal-title">Proposal Title</Label>
              <Input
                id="proposal-title"
                placeholder="e.g., Create a 'Research' Data Category"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proposal-description">Description</Label>
              <Textarea
                id="proposal-description"
                placeholder="Provide a detailed description of your proposal and its purpose..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
              />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="proposal-type">Proposal Type</Label>
                <Select onValueChange={setType} value={type} required>
                    <SelectTrigger id="proposal-type">
                        <SelectValue placeholder="Select a proposal type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Category Creation">Category Creation</SelectItem>
                        <SelectItem value="Pricing">Pricing</SelectItem>
                        <SelectItem value="Governance">Governance</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting to Walrus...
                </>
              ) : 'Create Proposal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
