import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleDollarSign, FileText, Users, ShieldCheck } from 'lucide-react';

// This is mock data. In a real app, you'd fetch this based on the `params.id`.
const dataset = {
    id: '1',
    name: 'Global Climate Data',
    description: 'A comprehensive collection of global climate metrics from 2000 to 2024, including temperature anomalies, sea levels, and atmospheric CO2 concentrations. Sourced from various international climate research institutions.',
    category: 'Environment',
    price: 500,
    contributors: 150,
    size: '10 GB',
    format: 'CSV, NetCDF',
    lastUpdated: '2024-07-20',
};

export default function DatasetDetailsPage({ params }: { params: { id: string } }) {
  return (
    <AppShell
      title={dataset.name}
      description={`Detailed view of the "${dataset.name}" dataset.`}
    >
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-2xl">{dataset.name}</CardTitle>
                        <Badge variant="secondary">{dataset.category}</Badge>
                    </div>
                    <CardDescription>{dataset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold mb-4">Dataset Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Size</p>
                            <p>{dataset.size}</p>
                        </div>
                         <div>
                            <p className="text-muted-foreground">Format</p>
                            <p>{dataset.format}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Last Updated</p>
                            <p>{dataset.lastUpdated}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Contributors</p>
                            <p className="flex items-center gap-1"><Users className="h-4 w-4" /> {dataset.contributors}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Purchase Dataset</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <div className="flex items-center justify-center text-3xl font-bold">
                        <CircleDollarSign className="h-7 w-7 mr-2 text-primary" />
                        {dataset.price} KAI
                    </div>
                    <Button size="lg" className="w-full">
                        Buy Now
                    </Button>
                    <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Secure transaction on the blockchain.
                    </div>
                    <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" /> View Sample Data
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppShell>
  );
}
