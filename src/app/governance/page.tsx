
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, ThumbsDown, ThumbsUp, Eye, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GovernancePage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-muted-foreground">Redirecting to the dashboard...</p>
      </div>
    </AppShell>
  );
}
