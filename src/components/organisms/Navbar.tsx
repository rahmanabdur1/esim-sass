'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Bell, ChevronDown, User, LogOut, Settings, Search } from 'lucide-react';
import { LanguageSwitcher } from '@/features/i18n/LanguageSwitcher';
import { CurrencySwitcher } from '@/features/i18n/CurrencySwitcher';
import { Button } from '@/components/atoms/Button';
import { Avatar, Badge } from '@/components/atoms/index';
import { cn } from '@/utils';
import { ROUTES } from '@/constants';
import { useAuthStore, useNotificationStore } from '@/store';

const navLinks = [
  { href: ROUTES.HOME, label: 'Home' },
  { href: ROUTES.PLANS, label: 'Plans' },
  { href: ROUTES.COUNTRIES, label: 'Coverage' },
  { href: ROUTES.ABOUT, label: 'About' },
  { href: ROUTES.BLOG, label: 'Blog' },
  { href: ROUTES.CONTACT, label: 'Contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'
      )}
      role="banner"
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6" aria-label="Main navigation">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2 font-display font-bold text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm" aria-label="eSIM Platform Home">
          <Globe className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="text-gradient">eSIM Platform</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-1" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                )}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <LanguageSwitcher compact />
          <CurrencySwitcher compact />
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open search (Command K)"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Search</span>
            <kbd className="ml-2 text-xs bg-muted rounded px-1.5 py-0.5">⌘K</kbd>
          </button>
          {isAuthenticated ? (
            <>
              <Link href={ROUTES.NOTIFICATIONS} aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`} className="relative p-2 rounded-md hover:bg-accent transition-colors">
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-md p-1.5 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-label="User menu"
                >
                  <Avatar src={user?.avatar} alt={user?.name || 'User'} name={user?.name} size="sm" />
                  <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', userMenuOpen && 'rotate-180')} aria-hidden="true" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-48 rounded-md border bg-popover shadow-lg"
                      role="menu"
                      aria-label="User menu options"
                    >
                      <div className="p-1">
                        {[
                          { href: ROUTES.DASHBOARD, icon: User, label: 'Dashboard' },
                          { href: ROUTES.PROFILE, icon: Settings, label: 'Profile' },
                        ].map((item) => (
                          <Link key={item.href} href={item.href} role="menuitem" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors" onClick={() => setUserMenuOpen(false)}>
                            <item.icon className="h-4 w-4" aria-hidden="true" /> {item.label}
                          </Link>
                        ))}
                        <hr className="my-1 border-border" />
                        <button role="menuitem" className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                          <LogOut className="h-4 w-4" aria-hidden="true" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link href={ROUTES.LOGIN}>Sign In</Link></Button>
              <Button size="sm" variant="gradient" asChild><Link href={ROUTES.REGISTER}>Get Started</Link></Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-background overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    pathname === link.href ? 'text-primary bg-primary/10' : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                  )}
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                {isAuthenticated ? (
                  <Button asChild variant="gradient"><Link href={ROUTES.DASHBOARD}>Dashboard</Link></Button>
                ) : (
                  <>
                    <Button asChild variant="outline"><Link href={ROUTES.LOGIN}>Sign In</Link></Button>
                    <Button asChild variant="gradient"><Link href={ROUTES.REGISTER}>Get Started</Link></Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
