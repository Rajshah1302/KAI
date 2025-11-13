'Use client';
import { Sidebar } from "./sidebar";
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  if (isHomePage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full bg-background">
       <div className="fixed inset-0 -z-10 h-full w-full bg-gradient-to-br from-background via-neutral-50 to-stone-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-stone-900" />
      <Sidebar />
      <div className="flex flex-col flex-1 md:pl-64">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </div>
    </div>
  );
}
