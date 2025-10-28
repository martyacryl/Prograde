'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  PlayIcon, 
  UsersIcon, 
  ArrowDownTrayIcon, 
  ChartBarIcon, 
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon,
    description: 'Overview and quick actions'
  },
  { 
    name: 'Games', 
    href: '/games', 
    icon: PlayIcon,
    description: 'View games by season'
  },
  { 
    name: 'Position Modules', 
    href: '/position-modules', 
    icon: UsersIcon,
    description: 'Configure grading modules'
  },
  { 
    name: 'Data Import', 
    href: '/dashboard/data-import', 
    icon: ArrowDownTrayIcon,
    description: 'Import external data'
  },
  { 
    name: 'Live Games', 
    href: '/live-game', 
    icon: PlayIcon,
    description: 'Real-time game grading'
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: ChartBarIcon,
    description: 'Performance insights'
  }
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="font-semibold text-gray-900">ProGrade</span>
            </div>
          )}
          
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-50 text-primary-700 border border-primary-200 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
                title={sidebarCollapsed ? item.description : undefined}
              >
                <item.icon 
                  className={cn(
                    "flex-shrink-0 w-5 h-5 transition-colors",
                    isActive ? "text-primary-600" : "text-gray-500 group-hover:text-gray-700"
                  )} 
                />
                {!sidebarCollapsed && (
                  <span className="ml-3">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <UserCircleIcon className="w-6 h-6 text-gray-600" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Coach Smith</p>
                <p className="text-xs text-gray-500 truncate">Head Coach</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <nav className="flex space-x-1">
                <Link 
                  href="/dashboard" 
                  className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                >
                  Home
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-sm text-gray-900 px-2 py-1 rounded">Dashboard</span>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <BellIcon className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">CS</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
