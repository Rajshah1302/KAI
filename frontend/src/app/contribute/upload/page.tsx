'use client';

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useLendingDataStorage } from '@/hooks/use-walrus';
import { useToast } from '@/hooks/use-toast';
import { useSubmitData } from '@/hooks/use-dao';
import { useCategories } from '@/hooks/use-categories';
import { useSuiWallet } from '@/hooks/use-sui-wallet';

export default function UploadDataPage() {
  const [datasetName, setDatasetName] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const { isConnected } = useSuiWallet();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { storeLendingData, isLoading: walrusLoading } = useLendingDataStorage();
  const { submitData, isLoading: submitLoading } = useSubmitData();
  const { toast } = useToast();

  const isLoading = walrusLoading || submitLoading;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validation
    if (!isConnected) {
      toast({
        variant: 'destructive',
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to submit data.',
      });
      return;
    }

    if (!file || !datasetName || !datasetDescription || !selectedCategoryId) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields, select a category, and choose a file to upload.',
      });
      return;
    }

    // Step 1: Upload file to Walrus
    toast({
      title: 'Uploading to Walrus',
      description: 'Uploading your data file to Walrus storage...',
    });

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = async () => {
      try {
        const dataToStore = {
          name: datasetName,
          description: datasetDescription,
          file: reader.result,
          fileName: file.name,
          fileType: file.type,
          timestamp: Date.now(),
        };

        const walrusResult = await storeLendingData(dataToStore);

        if (!walrusResult?.success || !walrusResult.blobId) {
          toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: walrusResult?.error || 'Could not store data on Walrus. Please try again.',
          });
          return;
        }

        // Step 2: Create metadata JSON
        const metadata = JSON.stringify({
          name: datasetName,
          description: datasetDescription,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          timestamp: Date.now(),
        });

        // Step 3: Submit to blockchain (creates proposal automatically)
        // TEMPORARY: Skip blockchain submission until categories are created
        // Categories require DAO governance to create, so for now we'll just save locally
        toast({
          title: 'Upload Complete!',
          description: 'Dataset uploaded to Walrus and saved locally. Blockchain submission requires categories to be created first.',
        });

        // Add dataset to localStorage so it appears in marketplace
        if (typeof window !== 'undefined') {
          try {
            const existingDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
            const categoryName = categories.find(c => c.id === selectedCategoryId)?.name || 'User Contributed';
            
            const newDataset = {
              id: walrusResult.blobId,
              name: datasetName,
              description: datasetDescription,
              category: categoryName,
              price: 100, // Default price, can be updated later
              contributors: 1,
              size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              format: file.type || 'Unknown',
              lastUpdated: new Date().toISOString().split('T')[0],
            };
            
            existingDatasets.push(newDataset);
            localStorage.setItem('datasets', JSON.stringify(existingDatasets));
          } catch (err) {
            console.error('Failed to save to localStorage:', err);
          }
        }

        // Clear the form
        setDatasetName('');
        setDatasetDescription('');
        setSelectedCategoryId('');
        setFile(null);

        /* BLOCKCHAIN SUBMISSION - COMMENTED OUT UNTIL CATEGORIES ARE CREATED
        toast({
          title: 'Creating Proposal',
          description: 'Submitting data submission to the DAO...',
        });

        const txResult = await submitData(
          walrusResult.blobId,
          metadata,
          selectedCategoryId // Category object ID
        );

        if (txResult && !txResult.error) {
          toast({
            title: 'Submission Successful!',
            description: `Your data has been submitted and a proposal has been created for DAO approval. Transaction: ${txResult.digest.slice(0, 8)}...`,
          });

          // Clear the form
          setDatasetName('');
          setDatasetDescription('');
          setSelectedCategoryId('');
          setFile(null);
        } else {
          toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: txResult?.error || 'Failed to create proposal on-chain.',
          });
        }
        */
      } catch (error: any) {
        console.error('Submission error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'An unexpected error occurred.',
        });
      }
    };

    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'Could not read the selected file.',
      });
    };
  };

  return (
    <AppShell>
      <Card className="max-w-3xl mx-auto bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle>Contribute Your Data</CardTitle>
          <CardDescription>
            Your data will be uploaded to Walrus, and a "Dataset Approval" proposal will be automatically created for the DAO to vote on. No KAI is required to submit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="dataset-name">Dataset Name</Label>
              <Input
                id="dataset-name"
                placeholder="e.g., NYC Taxi Data Q2 2024"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                required
                className="bg-background/70"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dataset-description">Description</Label>
              <Textarea
                id="dataset-description"
                placeholder="Provide a detailed description of your dataset..."
                value={datasetDescription}
                onChange={(e) => setDatasetDescription(e.target.value)}
                required
                className="bg-background/70"
                rows={4}
              />
            </div>
            
            {!isConnected && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-600">
                  ⚠️ Please connect your wallet to submit data to the blockchain.
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="category-select">Data Category</Label>
              {categoriesLoading ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading categories...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    No active categories available. A category proposal must be created first.
                  </p>
                </div>
              ) : (
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} required>
                  <SelectTrigger className="bg-background/70" disabled={!isConnected}>
                    <SelectValue placeholder="Select a data category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-xs text-muted-foreground">
                            Reward: {category.rewardAmount} KAI
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
             <div className="grid gap-2">
                <Label htmlFor="file-upload">Upload Data File (Encrypted)</Label>
                <div className="flex items-center justify-center w-full">
                    <Label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-background/50 hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                            {file ? (
                              <p className="text-sm text-muted-foreground">{file.name}</p>
                            ) : (
                              <>
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">ZIP, GZIP, etc. (Encrypted)</p>
                              </>
                            )}
                        </div>
                        <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                    </Label>
                </div>
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="w-full" 
              disabled={isLoading || !isConnected || !selectedCategoryId || categories.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {walrusLoading ? 'Uploading to Walrus...' : 'Creating Proposal...'}
                </>
              ) : (
                'Submit Dataset Proposal'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
