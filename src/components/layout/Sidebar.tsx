'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Home,
  Play,
  BarChart3,
  Users,
  Target,
  FileText,
  Settings,
  Database,
  TrendingUp,
  Calendar,
  Shield,
  Zap
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    current: true
  },
  {
    name: 'Live Grading',
    href: '/dashboard/live',
    icon: Play,
    current: false
  },
  {
    name: 'Film Study',
    href: '/dashboard/film',
    icon: Target,
    current: false
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    current: false
  },
  {
    name: 'Tendencies',
    href: '/dashboard/tendencies',
    icon: TrendingUp,
    current: false
  },
  {
    name: 'Formations',
    href: '/dashboard/formations',
    icon: Shield,
    current: false
  },
  {
    name: 'Games',
    href: '/dashboard/games',
    icon: Calendar,
    current: false
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
    current: false
  },
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: Users,
    current: false
  },
  {
    name: 'Data Import',
    href: '/dashboard/import',
    icon: Database,
    current: false
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    current: false
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "bg-white border-r border-slate-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="p-4 border-b border-slate-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center"
          >
            <Zap className="h-4 w-4" />
            {!collapsed && <span className="ml-2">ProGrade</span>}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-red-50 text-red-700 border-r-2 border-red-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="p-4 border-t border-slate-200">
            <Button className="w-full bg-red-600 hover:bg-red-700">
              <Play className="h-4 w-4 mr-2" />
              New Game
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
