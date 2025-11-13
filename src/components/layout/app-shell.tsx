import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export function AppShell({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-muted/40">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
