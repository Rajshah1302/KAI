'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, X, Menu, LayoutDashboard, Store, Database, Landmark, CircleDollarSign, ShieldQuestion, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import logo from '@/public/logo.png';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/marketplace', label: 'Marketplace', icon: Store },
  { href: '/contribute/upload', label: 'Contribute', icon: Database },
  { href: '/governance', label: 'Governance', icon: Landmark },
  { href: '/tokenomics', label: 'Tokenomics', icon: CircleDollarSign },
];

const secondaryNavLinks = [
    { href: '/admin/analytics', label: 'Admin', icon: ShieldQuestion },
    { href: '#', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-[60] md:hidden bg-background/50 backdrop-blur-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
            "fixed top-0 left-0 z-50 h-screen w-64 bg-card/60 backdrop-blur-lg border-r border-border/50 shadow-lg transition-transform duration-300 ease-in-out",
            isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border/50 h-20 flex items-center">
            <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
              <Image src={logo} height={40} width={40} alt="Kai Logo" />
              <span className="font-bold text-2xl text-foreground">Kai</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navLinks.map(link => {
              const isActive =
                (link.href === '/dashboard' && pathname === link.href) ||
                (link.href !== '/dashboard' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <link.icon className="h-5 w-5"/>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Secondary Nav */}
          <nav className="p-4 space-y-1 border-t border-border/50">
             {secondaryNavLinks.map(link => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <link.icon className="h-5 w-5"/>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Wallet Connect Button */}
          <div className="p-4 border-t border-border/50">
            <Button asChild className="w-full">
              <Link href="/auth/wallet-connect" onClick={() => setIsOpen(false)}>
                <LogIn className="mr-2 h-4 w-4" /> Connect Wallet
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
