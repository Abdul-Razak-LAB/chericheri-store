'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  ClipboardCheck,
  Activity,
  AlertTriangle,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAppStore } from '@/src/stores/app-store';
import { Button } from '../ui/button';
import type { UserRole } from '@/src/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/farm/dashboard',
    icon: LayoutDashboard,
    roles: ['owner', 'manager', 'worker'],
  },
  {
    name: 'Tasks',
    href: '/farm/tasks',
    icon: CheckSquare,
    roles: ['owner', 'manager', 'worker'],
  },
  {
    name: 'Procurement',
    href: '/farm/procurement',
    icon: ShoppingCart,
    roles: ['owner', 'manager'],
  },
  {
    name: 'Inventory',
    href: '/farm/inventory',
    icon: Package,
    roles: ['owner', 'manager'],
  },
  {
    name: 'Payroll',
    href: '/farm/payroll',
    icon: DollarSign,
    roles: ['owner', 'manager'],
  },
  {
    name: 'Team',
    href: '/farm/team',
    icon: Users,
    roles: ['owner', 'manager'],
  },
  {
    name: 'Verification',
    href: '/farm/verification',
    icon: ClipboardCheck,
    roles: ['owner', 'verifier'],
  },
  {
    name: 'Monitoring',
    href: '/farm/monitoring',
    icon: Activity,
    roles: ['owner', 'manager'],
  },
  {
    name: 'Incidents',
    href: '/farm/incidents',
    icon: AlertTriangle,
    roles: ['owner', 'manager', 'worker'],
  },
  {
    name: 'Settings',
    href: '/farm/settings',
    icon: Settings,
    roles: ['owner', 'manager'],
  },
];

export function FarmNavigation() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, userRole } = useAppStore();

  const filteredNav = navigation.filter((item) =>
    userRole ? item.roles.includes(userRole) : true
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 border-r bg-card transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/farm/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-lg font-bold">F</span>
              </div>
              <span className="text-lg font-semibold">FarmOps</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              <div className="mb-1 font-medium">Role</div>
              <div className="capitalize">{userRole || 'Not set'}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
