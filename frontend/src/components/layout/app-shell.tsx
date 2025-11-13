import { Footer } from "@/components/layout/footer";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      <Sidebar />
      <div className="flex flex-col flex-1 md:ml-2">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 md:py-12">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
