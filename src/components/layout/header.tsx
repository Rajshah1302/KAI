'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import logo from '@/public/logo.png';

const navLinks = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/contribute/upload', label: 'Contribute' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/governance', label: 'Governance' },
  { href: '/tokenomics', label: 'Tokenomics' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src={logo} height={32} width={32} alt="Kai Logo" />
            <span className="font-bold text-xl text-[#002B5B]">Kai</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[#007BFF] after:content-[""] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[2px] after:bg-[#007BFF] after:rounded-full'
                      : 'text-[#002B5B] hover:text-[#007BFF]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Wallet + Mobile */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            className="bg-gradient-to-r from-[#007BFF] to-[#00BFFF] text-white hover:from-[#0066d1] hover:to-[#00a0e0] transition-all duration-200"
          >
            <Link href="/auth/wallet-connect">
              <LogIn className="mr-2 h-4 w-4" /> Connect Wallet
            </Link>
          </Button>
          <div className="md:hidden">
            <MobileNav pathname={pathname} />
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="border-blue-200 text-[#002B5B]">
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
          <span className="sr-only">Open main menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white text-[#002B5B] border border-blue-100 shadow-md">
        <DropdownMenuLabel className="text-[#007BFF] font-semibold">Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {navLinks.map(link => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <DropdownMenuItem
              key={link.href}
              asChild
              className={`transition-all ${
                isActive
                  ? 'text-[#007BFF] font-semibold'
                  : 'hover:text-[#007BFF]'
              }`}
            >
              <Link href={link.href}>{link.label}</Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
