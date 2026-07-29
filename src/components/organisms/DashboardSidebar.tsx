'use client';
import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Smartphone, ShoppingCart, Package, FileText,
  BarChart2, Bell, Headphones, Gift, Star, User,
  Shield, CreditCard, Settings, ChevronLeft, Globe, LogOut,
  Plane, Scale, BookOpen, Link2, History, LineChart, Lock,
} from 'lucide-react';
import { cn } from '@/utils';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store';
import { useLogout } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar } from '@/components/atoms/index';

const navItems = [
  { href: ROUTES.DASHBOARD,        icon: LayoutDashboard, label: 'Dashboard'       },
  { href: ROUTES.MY_ESIMS,         icon: Smartphone,      label: 'My eSIMs'        },
  { href: ROUTES.BUY_PLAN,         icon: ShoppingCart,    label: 'Buy Plan'        },
  { href: ROUTES.TRAVEL_PLANNER,   icon: Plane,           label: 'Travel Planner'  },
  { href: ROUTES.COMPARE,          icon: Scale,           label: 'Compare Plans'   },
  { href: ROUTES.ORDERS,           icon: Package,         label: 'Orders'          },
  { href: ROUTES.INVOICES,         icon: FileText,        label: 'Invoices'        },
  { href: ROUTES.ANALYTICS,        icon: BarChart2,       label: 'Analytics'       },
  { href: ROUTES.ADVANCED_ANALYTICS, icon: LineChart,     label: 'Advanced Analytics' },
  { href: ROUTES.NOTIFICATIONS,    icon: Bell,            label: 'Notifications'   },
  { href: ROUTES.SUPPORT,          icon: Headphones,  label: 'Support'         },
  { href: ROUTES.KNOWLEDGE_BASE,   icon: BookOpen,        label: 'Knowledge Base'  },
  { href: ROUTES.REFERRAL,         icon: Gift,            label: 'Referral'        },
  { href: ROUTES.AFFILIATE,        icon: Link2,           label: 'Affiliate Center'},
  { href: ROUTES.REWARDS,          icon: Star,            label: 'Rewards'         },
];

const accountItems = [
  { href: ROUTES.PROFILE,          icon: User,            label: 'Profile'         },
  { href: ROUTES.SECURITY,         icon: Shield,          label: 'Security'        },
  { href: ROUTES.ACTIVITY,         icon: History,         label: 'Account Activity'},
  { href: ROUTES.PAYMENT_METHODS,  icon: CreditCard,      label: 'Payment Methods' },
  { href: ROUTES.PRIVACY_CENTER,   icon: Lock,            label: 'Privacy & Data'  },
  { href: ROUTES.SETTINGS,         icon: Settings,        label: 'Settings'        },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname    = usePathname();
  const router      = useRouter();
  const queryClient = useQueryClient();
  const { user, logout: clearStore } = useAuthStore();
  const { mutate: logoutMutate } = useLogout();

  const handleLogout = useCallback(() => {
    logoutMutate(undefined, {
      onSettled: () => {
        clearStore();
        queryClient.clear();
        router.push(ROUTES.LOGIN);
      },
    });
  }, [logoutMutate, clearStore, queryClient, router]);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex h-screen flex-col border-r bg-card overflow-hidden"
      aria-label="Dashboard navigation"
    >
      {/* Header */}
      <div className={cn('flex h-16 items-center border-b px-4', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <Link href={ROUTES.HOME} className="flex items-center gap-2 font-display font-bold text-lg">
            <Globe className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
            <span className="text-gradient whitespace-nowrap">eSIM</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform duration-200', collapsed && 'rotate-180')} aria-hidden="true" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2" aria-label="Main dashboard navigation">
        <SidebarSection items={navItems} pathname={pathname} collapsed={collapsed} label="Main" />
        <div className="my-2 border-t" />
        <SidebarSection items={accountItems} pathname={pathname} collapsed={collapsed} label="Account" />
      </nav>

      {/* User + Logout */}
      <div className="border-t p-3">
        <div className={cn('flex items-center gap-2 rounded-md p-2', collapsed && 'justify-center')}>
          <Avatar src={user?.avatar} alt={user?.name || 'User'} name={user?.name} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          className={cn(
            'mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors',
            collapsed && 'justify-center'
          )}
          aria-label="Sign out"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}

function SidebarSection({ items, pathname, collapsed, label }: {
  items: { href: string; icon: any; label: string }[];
  pathname: string;
  collapsed: boolean;
  label: string;
}) {
  return (
    <ul role="list" aria-label={label} className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                collapsed && 'justify-center',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
