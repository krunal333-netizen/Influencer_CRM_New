import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Zap,
  Package,
  Building2,
  FileText,
  TrendingUp,
  Receipt,
  Truck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  {
    label: 'Influencers',
    href: '/dashboard/influencers',
    icon: Users,
  },
  {
    label: 'Campaigns',
    href: '/dashboard/campaigns',
    icon: Zap,
  },
  {
    label: 'Products',
    href: '/dashboard/products',
    icon: Package,
  },
  {
    label: 'Firms & Stores',
    href: '/dashboard/stores',
    icon: Building2,
  },
  {
    label: 'Invoices',
    href: '/dashboard/invoices',
    icon: Receipt,
  },
  {
    label: 'Courier Tracking',
    href: '/dashboard/courier',
    icon: Truck,
  },
  {
    label: 'Financial',
    href: '/dashboard/financial',
    icon: FileText,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: TrendingUp,
  },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:static md:transform-none',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-primary text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900">CRM</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-primary text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-4">
            <p className="text-xs text-slate-500">CRM Dashboard v1.0</p>
          </div>
        </div>
      </div>
    </>
  );
}
