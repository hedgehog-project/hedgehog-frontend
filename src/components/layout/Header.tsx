"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const navItems = [
  { label: "Markets", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Borrow", href: "/borrow" },
  { label: "Lend", href: "/lend" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  return (
    <header className="border-b border-[var(--border-color)]">
      <div className="max-w-[1280px] w-full mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold">
              <span className="text-[var(--primary)]">Hedge</span>
              <span>hog</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[var(--primary)]",
                  pathname === item.href
                    ? "text-[var(--primary)]"
                    : "text-[var(--foreground)]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <ConnectButton />

            {/* Mobile menu button */}
            <button
              className="block md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-4 bg-[var(--card-bg)] border-b border-[var(--border-color)]">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[var(--primary)]",
                  pathname === item.href
                    ? "text-[var(--primary)]"
                    : "text-[var(--foreground)]"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <ConnectButton />
          </nav>
        </div>
      )}
    </header>
  );
}
