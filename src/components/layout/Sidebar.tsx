import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Building2,
  Bookmark,
  BarChart2,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Job Applications', path: '/jobs', icon: Briefcase },
  { name: 'Resumes', path: '/resumes', icon: FileText },
  { name: 'Companies', path: '/companies', icon: Building2 },
  { name: 'Saved Jobs', path: '/saved-jobs', icon: Bookmark },
  { name: 'Statistics', path: '/statistics', icon: BarChart2 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">JobTrack</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-2 text-sm rounded-lg',
                  'hover:bg-gray-100 transition-colors duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-600'
                )
              }
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 mt-4"
      >
        <LogOut className="h-5 w-5 mr-3" />
        Logout
      </button>
    </div>
  );
}
