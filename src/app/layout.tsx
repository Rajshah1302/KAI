import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Kaivalya - Own Your Data',
  description:
    'A minimalistic landing page for the KAI Data DAO (Kaivalya), designed to introduce its mission and value proposition.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}