import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, ThumbsDown, ThumbsUp, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const proposals = [
    { id: 1, title: 'Approve new dataset: "NYC Taxi Rides"', status: 'Active', type: 'Dataset Approval', votes_for: 72, votes_against: 8, end_date: '3 days remaining' },
    { id: 2, title: 'Adjust pricing for "Medical Imaging Scans"', status: 'Passed', type: 'Pricing Change', votes_for: 88, votes_against: 12, end_date: 'Ended 2 weeks ago' },
    { id: 3, title: 'Update DAO governance charter', status: 'Failed', type: 'Governance', votes_for: 40, votes_against: 60, end_date: 'Ended 1 month ago' },
];

export default function GovernancePage() {
  return (
    <AppShell
      title="Governance & Proposals"
      description="Vote on approvals, pricing, or new datasets."
    >
      <div className="flex justify-end mb-6">
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Proposal
        </Button>
      </div>
      <div className="grid gap-6">
        {proposals.map((proposal) => {
            const totalVotes = proposal.votes_for + proposal.votes_against;
            const forPercentage = (proposal.votes_for / totalVotes) * 100;
            const againstPercentage = (proposal.votes_against / totalVotes) * 100;

            const getStatusBadge = () => {
                switch (proposal.status) {
                    case 'Active': return <Badge>{proposal.status}</Badge>;
                    case 'Passed': return <Badge variant="default" className="bg-green-600 hover:bg-green-700">{proposal.status}</Badge>;
                    case 'Failed': return <Badge variant="destructive">{proposal.status}</Badge>;
                    default: return <Badge variant="secondary">{proposal.status}</Badge>;
                }
            }

            return (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{proposal.title}</CardTitle>
                    {getStatusBadge()}
                  </div>
                  <CardDescription>
                      <span className="font-semibold">{proposal.type}</span> 
                      <span className="mx-2 text-muted-foreground">|</span>
                      <span>{proposal.end_date}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {proposal.status === 'Active' && (
                        <div className="space-y-2">
                             <div className="flex justify-between text-sm font-medium">
                                <span>Yes ({proposal.votes_for})</span>
                                <span>No ({proposal.votes_against})</span>
                            </div>
                            <Progress value={forPercentage} className="h-3" />
                        </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                        {proposal.status === 'Active' && (
                          <>
                            <Button variant="secondary"><ThumbsUp className="mr-2 h-4 w-4"/>Vote Yes</Button>
                            <Button variant="secondary"><ThumbsDown className="mr-2 h-4 w-4"/>Vote No</Button>
                          </>
                        )}
                        <Button variant="outline"><Eye className="mr-2 h-4 w-4"/>View Details</Button>
                    </div>
                </CardContent>
              </Card>
            )
        })}
      </div>
    </AppShell>
  );
}
