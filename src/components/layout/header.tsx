import Link from 'next/link';
import { DatabaseZap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <DatabaseZap className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Kaivalya</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button asChild>
            <Link href="#get-involved">Get Involved</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
