import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { SuiWalletProvider } from '@/providers/sui-wallet-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Force dynamic rendering to prevent SSR issues with wallet provider
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kai',
  description:
    'A minimalistic landing page for the KAI Data DAO (Kaivalya), designed to introduce its mission and value proposition.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <SuiWalletProvider>
          <main>{children}</main>
          <Toaster />
        </SuiWalletProvider>
      </body>
    </html>
  );
}
