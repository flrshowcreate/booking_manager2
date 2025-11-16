'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Music2,
  Users,
  FileText,
  DollarSign,
  Settings,
  Globe,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Events', href: '/events', icon: Music2 },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Finance', href: '/finance', icon: DollarSign },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Public Widgets', href: '/public', icon: Globe },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-gray-900">Booking Manager</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="text-xs text-gray-500">
          <p className="font-medium">FLR Show Create SRL</p>
          <p className="mt-1">v3.0.0</p>
        </div>
      </div>
    </div>
  );
}
