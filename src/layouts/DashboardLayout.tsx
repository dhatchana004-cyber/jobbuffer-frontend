import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Menu, 
  X, 
  LogOut,
  ChevronDown,
  User,
  Settings,
  Building
} from 'lucide-react';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  section?: string;
  badge?: string | number;
}

interface DashboardLayoutProps {
  role: 'recruiter' | 'admin';
  navItems: NavItem[];
}

export default function DashboardLayout({ role, navItems }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    }
  });

  // Query unread notifications for badge
  const { data: notifData } = useQuery({
    queryKey: ['headerNotifications', role],
    queryFn: async () => {
      if (role === 'recruiter') {
        const res = await api.get('/recruiter/notifications');
        return res.data;
      }
      return null;
    },
    refetchInterval: 15000
  });

  const unreadCount = notifData?.unreadCount || 0;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    if (role === 'recruiter') {
      navigate(`/recruiter/candidates?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  // Group items by section if provided
  const groupedItems: { sectionTitle?: string; items: NavItem[] }[] = [];
  let currentSection: string | undefined = undefined;
  let currentGroup: NavItem[] = [];

  navItems.forEach((item) => {
    if (item.section !== currentSection) {
      if (currentGroup.length > 0) {
        groupedItems.push({ sectionTitle: currentSection, items: currentGroup });
      }
      currentSection = item.section;
      currentGroup = [item];
    } else {
      currentGroup.push(item);
    }
  });
  if (currentGroup.length > 0) {
    groupedItems.push({ sectionTitle: currentSection, items: currentGroup });
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden font-sans text-gray-900">
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden transition-opacity backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 flex flex-col justify-between shadow-xs",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(`/${role}/dashboard`)}>
              <img src="/logo.png" alt="Jobbuffer Logo" className="w-10 h-10 object-contain" />
              <img src="/logo-name.png" alt="Jobbuffer" className="h-6 object-contain" />
            </div>
            <button className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-lg" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 overflow-y-auto max-h-[calc(100vh-140px)]">
            {groupedItems.map((group, gIdx) => (
              <div key={gIdx} className={clsx(gIdx > 0 && "mt-5 pt-4 border-t border-gray-100")}>
                {group.sectionTitle && (
                  <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {group.sectionTitle}
                  </p>
                )}
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const isNotifications = item.name === 'Notifications';
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => clsx(
                          "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group",
                          isActive 
                            ? "bg-blue-50 text-blue-700 shadow-xs" 
                            : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center">
                              <item.icon className={clsx(
                                "flex-shrink-0 w-4 h-4 mr-3 transition-colors",
                                isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                              )} />
                              <span>{item.name}</span>
                            </div>
                            {isNotifications && unreadCount > 0 ? (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                                {unreadCount}
                              </span>
                            ) : item.badge ? (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                                {item.badge}
                              </span>
                            ) : null}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-gray-200 bg-gray-50/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-200 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RC'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'Recruiter'}</p>
                <p className="text-[10px] text-gray-500 truncate capitalize">{role} Portal</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shadow-2xs">
          <div className="flex items-center flex-1">
            <button 
              className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden mr-4 p-1 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Global Search */}
            <form onSubmit={handleGlobalSearch} className="max-w-md w-full hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs font-medium transition-all"
              />
              {!globalSearch && (
                <span className="absolute left-9 top-2.5 text-xs text-gray-400 pointer-events-none">
                  Search talent, jobs, or applications...
                </span>
              )}
            </form>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notifications Button with Live Badge */}
            <button 
              onClick={() => navigate(`/${role}/notifications`)}
              title="Notifications"
              className="text-gray-500 hover:text-blue-600 relative p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RC'}
                </div>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-bold text-gray-800 leading-tight">{user?.name || 'Recruiter'}</span>
                  <span className="text-[10px] text-gray-500 capitalize">{role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
              </button>

              {profileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-52 rounded-2xl shadow-xl py-1.5 bg-white border border-gray-100 ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'Recruiter'}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user?.email || ''}</p>
                  </div>

                  <button 
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(`/${role}/settings`);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                  >
                    <User className="w-3.5 h-3.5 mr-2.5 text-gray-400" /> My Profile
                  </button>

                  {role === 'recruiter' && (
                    <button 
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/recruiter/company');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                    >
                      <Building className="w-3.5 h-3.5 mr-2.5 text-gray-400" /> Company Profile
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(`/${role}/settings`);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 mr-2.5 text-gray-400" /> Account Settings
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50/50">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
