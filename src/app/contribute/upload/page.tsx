import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UploadDataPage() {
  return (
    <AppShell
      title="Upload & Donate Data"
      description="Register and upload encrypted data to the DAO."
    >
      <Card>
        <CardHeader>
          <CardTitle>Contribute Your Data</CardTitle>
          <CardDescription>
            Your data is encrypted and secured on the network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center w-full">
            <p className="text-muted-foreground">Upload form will be here.</p>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
