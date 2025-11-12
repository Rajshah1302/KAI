
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, ThumbsDown, ThumbsUp, Eye, Clock } from 'lucide-react';

const proposals = [
    { id: 1, title: 'Approve new dataset: "NYC Taxi Rides"', status: 'Active', type: 'Dataset Approval', votes_for: 72, votes_against: 8, end_date: '3 days remaining' },
    { id: 2, title: 'Create new category: "Geospatial Data"', status: 'Passed', type: 'Category Creation', votes_for: 88, votes_against: 12, end_date: 'Ended 2 weeks ago' },
    { id: 4, title: 'Set price for "Medical Imaging Scans"', status: 'Active', type: 'Pricing', votes_for: 34, votes_against: 16, end_date: '1 day remaining' },
    { id: 3, title: 'Update DAO governance charter', status: 'Failed', type: 'Governance', votes_for: 40, votes_against: 60, end_date: 'Ended 1 month ago' },
];

export default function GovernancePage() {
  return (
    <AppShell
      title="Governance & Proposals"
      description="Vote on dataset approvals, category creation, pricing, and other DAO matters."
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
            const forPercentage = totalVotes > 0 ? (proposal.votes_for / totalVotes) * 100 : 0;
            const againstPercentage = totalVotes > 0 ? (proposal.votes_against / totalVotes) * 100 : 0;

            const getStatusClasses = () => {
                switch (proposal.status) {
                    case 'Active': return { badge: 'default', border: 'border-primary', iconColor: 'text-primary' };
                    case 'Passed': return { badge: 'default', border: 'border-green-600', iconColor: 'text-green-600' };
                    case 'Failed': return { badge: 'destructive', border: 'border-red-600', iconColor: 'text-red-600' };
                    default: return { badge: 'secondary', border: 'border-border', iconColor: 'text-muted-foreground' };
                }
            }

            const { badge, border, iconColor } = getStatusClasses();
            
            const getBadgeClass = () => {
                switch(proposal.status) {
                    case 'Passed': return 'bg-green-600 hover:bg-green-700';
                    case 'Failed': return 'bg-red-600';
                    case 'Active': return 'bg-primary hover:bg-primary/80';
                    default: return 'bg-gray-500';
                }
            }


            return (
              <Card key={proposal.id} className={`transition-all hover:shadow-md ${border}`}>
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg font-semibold">{proposal.title}</CardTitle>
                    <Badge variant={badge} className={getBadgeClass()}>{proposal.status}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4 text-xs pt-1">
                      <Badge variant="outline">{proposal.type}</Badge>
                      <div className={`flex items-center gap-1.5 ${iconColor}`}>
                        <Clock className="h-3 w-3" />
                        <span>{proposal.end_date}</span>
                      </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {(proposal.status === 'Active' || proposal.status === 'Passed' || proposal.status === 'Failed') && (
                        <div className="space-y-2">
                           <div className="relative h-3 w-full rounded-full overflow-hidden bg-secondary">
                                <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${forPercentage}%` }} />
                                <div className="absolute top-0 right-0 h-full bg-red-500" style={{ width: `${againstPercentage}%` }} />
                            </div>
                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                <span className="text-green-600">Yes: {proposal.votes_for} ({forPercentage.toFixed(1)}%)</span>
                                <span className="text-red-600">No: {proposal.votes_against} ({againstPercentage.toFixed(1)}%)</span>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-2 flex-wrap items-center border-t pt-4 mt-2">
                        {proposal.status === 'Active' && (
                          <>
                            <Button variant="outline" size="sm" className="hover:bg-green-100 dark:hover:bg-green-900/50 hover:text-green-800 border-green-300">
                                <ThumbsUp className="mr-2 h-4 w-4"/>Vote Yes
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-800 border-red-300">
                                <ThumbsDown className="mr-2 h-4 w-4"/>Vote No
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" className="ml-auto">
                            <Eye className="mr-2 h-4 w-4"/>View Details
                        </Button>
                    </div>
                </CardContent>
              </Card>
            )
        })}
      </div>
    </AppShell>
  );
}
