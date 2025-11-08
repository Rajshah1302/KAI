import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export function AppShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-muted/40">
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
