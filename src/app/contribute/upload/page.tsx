
"use client"

import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { useLendingDataStorage } from '@/hooks/use-walrus';
import { useToast } from '@/hooks/use-toast';

export default function UploadDataPage() {
  const [datasetName, setDatasetName] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { storeLendingData, isLoading } = useLendingDataStorage();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !datasetName || !datasetDescription) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields and select a file to upload.',
      });
      return;
    }

    // We don't need to read the file on the client for Walrus upload
    // The hook will handle the file object directly if modified to do so,
    // but for now we'll send the metadata. The hook expects a file data URI.
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataToStore = {
        name: datasetName,
        description: datasetDescription,
        file: reader.result,
        fileName: file.name,
        fileType: file.type,
      };

      const result = await storeLendingData(dataToStore);

      if (result?.success && result.blobId) {
        toast({
          title: 'Upload Successful!',
          description: `Your data has been stored with Blob ID: ${result.blobId}`,
        });

        // Store metadata in local storage
        try {
          const existingDatasets = JSON.parse(localStorage.getItem('datasets') || '[]');
          const newDataset = {
            id: result.blobId, // Use blobId as the unique ID
            name: datasetName,
            description: datasetDescription,
            // Add other relevant metadata, matching marketplace structure
            category: 'User Contributed', // Example category
            price: Math.floor(Math.random() * 1000) + 100, // Example price
            contributors: 1, // The current user
          };
          
          existingDatasets.push(newDataset);
          localStorage.setItem('datasets', JSON.stringify(existingDatasets));
          
          // Clear the form
          setDatasetName('');
          setDatasetDescription('');
          setFile(null);

        } catch (e) {
            console.error("Failed to save to local storage", e);
            toast({
                variant: 'destructive',
                title: 'Local Storage Error',
                description: 'Could not save dataset to your browser\'s local storage.',
            });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: result?.error || 'Could not store data on Walrus. Please try again.',
        });
      }
    };
    reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'Could not read the selected file.',
        });
    }
  };

  return (
    <AppShell
      title="Upload & Donate Data"
      description="Register and upload encrypted data to the DAO."
    >
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Contribute Your Data</CardTitle>
          <CardDescription>
            Fill out the form below to register your dataset. Your data will be encrypted and secured on the network via Walrus.
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
              />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="file-upload">Upload Encrypted Data File</Label>
                <div className="flex items-center justify-center w-full">
                    <Label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors">
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
            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Storing on Walrus...' : 'Register & Upload Dataset'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
