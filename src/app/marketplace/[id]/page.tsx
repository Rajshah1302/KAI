
'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleDollarSign, FileText, Users, ShieldCheck, Download, Loader2 } from 'lucide-react';
import { useLendingDataStorage } from '@/hooks/use-walrus';
import { useToast } from '@/hooks/use-toast';

// This is mock data for display purposes. The actual blobId comes from the URL.
// The component now fetches live data based on the ID.
const defaultDataset = {
    id: '1',
    name: 'Loading Dataset...',
    description: 'Fetching details from the decentralized network...',
    category: 'Unknown',
    price: 0,
    contributors: 0,
    size: 'N/A',
    format: 'N/A',
    lastUpdated: 'N/A',
};

export default function DatasetDetailsPage({ params }: { params: { id: string } }) {
  const [dataset, setDataset] = useState(defaultDataset);
  const [isDownloading, setIsDownloading] = useState(false);
  const { retrieveLendingData, isLoading } = useLendingDataStorage();
  const { toast } = useToast();

  const blobId = params.id;

  // Fetch dataset metadata from local storage to display details
  useEffect(() => {
    try {
      const allDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
      const foundDataset = allDatasets.find((d: any) => d.id === blobId);
      if (foundDataset) {
        setDataset({ ...defaultDataset, ...foundDataset });
      } else {
         // If not in localstorage, maybe it's one of the defaults
         const defaultDatasets = [
            { id: '1', name: 'Global Climate Data', description: 'Comprehensive climate metrics from 2000–2024.', category: 'Environment', price: 500, contributors: 150, size: '10 GB', format: 'CSV, NetCDF', lastUpdated: '2024-07-20' },
            { id: '2', name: 'Medical Imaging Scans', description: 'A large collection of anonymized MRI scans.', category: 'Healthcare', price: 1200, contributors: 80, size: '50 GB', format: 'DICOM', lastUpdated: '2024-06-15' },
          ];
          const defaultFound = defaultDatasets.find(d => d.id === blobId);
          if (defaultFound) {
            setDataset(defaultFound);
          } else {
             toast({ variant: 'destructive', title: 'Error', description: 'Dataset not found.' });
          }
      }
    } catch (e) {
      console.error("Failed to load dataset from local storage", e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load dataset details.' });
    }
  }, [blobId, toast]);

  const handleDownload = async () => {
    setIsDownloading(true);
    toast({ title: 'Processing Purchase...', description: 'Fetching your data securely from the network.' });

    const storedData = await retrieveLendingData(blobId);
    
    if (storedData && storedData.file && storedData.fileName) {
      try {
        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = storedData.file; // This is the data URI
        link.download = storedData.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({ title: 'Download Started!', description: `Your download of ${storedData.fileName} should begin shortly.` });
      } catch (e) {
        console.error('Download failed:', e);
        toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not initiate the file download.' });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Purchase Failed',
        description: 'Could not retrieve data from Walrus. The data may be unavailable or the blob ID is incorrect.',
      });
    }

    setIsDownloading(false);
  };

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
                            <p>{dataset.size || 'N/A'}</p>
                        </div>
                         <div>
                            <p className="text-muted-foreground">Format</p>
                            <p>{dataset.format || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Last Updated</p>
                            <p>{dataset.lastUpdated || 'N/A'}</p>
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
            <Card className='bg-card/80 border-blue-200/50 shadow-lg'>
                <CardHeader className="text-center">
                    <CardTitle>Purchase Dataset</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <div className="flex items-center justify-center text-3xl font-bold">
                        <CircleDollarSign className="h-7 w-7 mr-2 text-primary" />
                        {dataset.price} KAI
                    </div>
                    <Button size="lg" className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:scale-105 transition-transform" onClick={handleDownload} disabled={isDownloading || isLoading}>
                        {isDownloading || isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-5 w-5" />
                                Buy Now
                            </>
                        )}
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

    