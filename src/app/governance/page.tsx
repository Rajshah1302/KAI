import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const proposals = [
    { id: 1, title: 'Approve new dataset: "NYC Taxi Rides"', status: 'Active', type: 'Dataset Approval' },
    { id: 2, title: 'Adjust pricing for "Medical Imaging Scans"', status: 'Passed', type: 'Pricing Change' },
    { id: 3, title: 'Update DAO governance charter', status: 'Failed', type: 'Governance' },
];

export default function GovernancePage() {
  return (
    <AppShell
      title="Governance & Proposals"
      description="Vote on approvals, pricing, or new datasets."
    >
      <div className="flex justify-end mb-4">
        <Button>Create New Proposal</Button>
      </div>
      <div className="grid gap-4">
        {proposals.map((proposal) => (
          <Card key={proposal.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{proposal.title}</CardTitle>
                <Badge variant={proposal.status === 'Active' ? 'default' : 'secondary'}>{proposal.status}</Badge>
              </div>
              <CardDescription>{proposal.type}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <Button>Vote Yes</Button>
                    <Button variant="secondary">Vote No</Button>
                    <Button variant="outline">View Details</Button>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
