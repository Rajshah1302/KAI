'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import logo from '@/public/logo.png';
import { useState } from 'react';

const navLinks = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/contribute/upload', label: 'Contribute' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tokenomics', label: 'Tokenomics' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-0 left-4 z-50 md:hidden border-blue-200 text-[#002B5B] bg-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white/95 backdrop-blur-md border-r border-blue-100 shadow-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-blue-100">
            <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
              <Image src={logo} height={40} width={40} alt="Kai Logo" />
              <span className="font-bold text-2xl text-[#002B5B]">Kai</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navLinks.map(link => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#007BFF]/10 to-[#00BFFF]/10 text-[#007BFF] border-l-4 border-[#007BFF]'
                      : 'text-[#002B5B] hover:bg-blue-50 hover:text-[#007BFF]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Wallet Connect Button */}
          <div className="p-4 border-t border-blue-100">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-[#007BFF] to-[#00BFFF] text-white hover:from-[#0066d1] hover:to-[#00a0e0] transition-all duration-200"
            >
              <Link href="/auth/wallet-connect" onClick={() => setIsOpen(false)}>
                <LogIn className="mr-2 h-4 w-4" /> Connect Wallet
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Spacer for desktop to prevent content from going under sidebar */}
      <div className="hidden md:block w-64" />
    </>
  );
}