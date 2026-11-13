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
  Building,
  Crown,
  Zap
} from 'lucide-react';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useRecruiterPlan } from '../hooks/useRecruiterPlan';
import UpgradeToProModal from '../components/recruiter/UpgradeToProModal';

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

  const recruiterPlan = useRecruiterPlan({ enabled: role === 'recruiter' });

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
      try {
        if (role === 'recruiter') {
          const res = await api.get('/recruiter/notifications');
          return res.data;
        }
        return null;
      } catch {
        return { unreadCount: 0, notifications: [] };
      }
    },
    refetchInterval: 15000
  });

  const unreadCount = notifData?.unreadCount || 0;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
          className="fixed inset-0 z-40 bg-gray-900/60 lg:hidden transition-opacity backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 flex flex-col justify-between shadow-xl lg:shadow-xs",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(`/${role}/dashboard`)}>
              <img src="/logo.png?v=20261104" alt="JoBuffer Logo" className="w-10 h-10 object-contain" />
              <img src="/logo-name.png?v=20261104" alt="JoBuffer" className="h-7 object-contain" />
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
        <header className="relative z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-3 sm:px-6 lg:px-8 shadow-xs">
          <div className="flex items-center flex-1 min-w-0">
            <button 
              type="button"
              aria-label="Open navigation menu"
              className="text-gray-600 hover:text-gray-900 focus:outline-none lg:hidden mr-2 sm:mr-4 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Branding */}
            <div 
              className="flex items-center space-x-2 lg:hidden cursor-pointer mr-3"
              onClick={() => navigate(`/${role}/dashboard`)}
            >
              <img src="/logo.png?v=20261104" alt="JoBuffer Logo" className="w-7 h-7 object-contain" />
            </div>

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

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Recruiter Plan Badge & Quick Upgrade Action */}
            {role === 'recruiter' && (
              <div className="flex items-center mr-1">
                {recruiterPlan.isPro ? (
                  <button
                    type="button"
                    onClick={() => navigate('/recruiter/settings')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
                    title="PRO Plan Active - Click to view plan details"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                    <span className="tracking-wide">PRO ACTIVE</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => recruiterPlan.openUpgradeModal('general')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all cursor-pointer shadow-2xs group"
                    title="You are on Free Plan - Click to Upgrade to PRO"
                  >
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded">
                      FREE
                    </span>
                    <span className="hidden sm:inline font-black text-indigo-700 group-hover:underline flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600 fill-amber-500" /> Upgrade PRO
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Notifications Button with Live Badge */}
            <button 
              type="button"
              onClick={() => navigate(`/${role}/notifications`)}
              title="Notifications"
              className="text-gray-500 hover:text-blue-600 relative p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
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
              {/* Click outside backdrop overlay */}
              {profileOpen && (
                <div 
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setProfileOpen(false)}
                />
              )}

              <button 
                type="button"
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer relative z-40"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : (role === 'admin' ? 'SY' : 'RC')}
                </div>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-bold text-gray-800 leading-tight">{user?.name || (role === 'admin' ? 'System Admin' : 'Recruiter')}</span>
                  <span className="text-[10px] text-gray-500 capitalize">{role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
              </button>

              {profileOpen && (
                <div 
                  className="origin-top-right absolute right-0 mt-2 w-56 sm:w-64 rounded-2xl shadow-2xl py-2 bg-white border border-gray-200 focus:outline-none z-50 ring-1 ring-black/5"
                  style={{ backgroundColor: '#ffffff', opacity: 1 }}
                >
                  <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/60 rounded-t-xl">
                    <p className="text-xs font-bold text-gray-900 truncate">{user?.name || (role === 'admin' ? 'System Admin' : 'Recruiter')}</p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{user?.email || ''}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-blue-100 text-blue-700">
                      {role}
                    </span>
                  </div>

                  <div className="py-1">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfileOpen(false);
                        navigate(`/${role}/settings`);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 mr-2.5 text-gray-400" /> My Profile
                    </button>

                    {role === 'recruiter' ? (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileOpen(false);
                          navigate('/recruiter/company');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-colors cursor-pointer"
                      >
                        <Building className="w-4 h-4 mr-2.5 text-gray-400" /> Company Profile
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileOpen(false);
                          navigate('/admin/companies');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-colors cursor-pointer"
                      >
                        <Building className="w-4 h-4 mr-2.5 text-gray-400" /> Company Directory
                      </button>
                    )}

                    {role === 'recruiter' && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileOpen(false);
                          if (!recruiterPlan.isPro) {
                            recruiterPlan.openUpgradeModal('general');
                          } else {
                            navigate('/recruiter/settings');
                          }
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-800 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center">
                          <Crown className="w-4 h-4 mr-2.5 text-amber-500" />
                          <span>Subscription Plan</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          recruiterPlan.isPro ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {recruiterPlan.plan} {recruiterPlan.isPro ? '★' : '↑'}
                        </span>
                      </button>
                    )}

                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfileOpen(false);
                        navigate(`/${role}/settings`);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 mr-2.5 text-gray-400" /> Account Settings
                    </button>
                  </div>

                  <div className="border-t border-gray-100 my-1"></div>

                  <div className="px-1 py-0.5">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2.5 text-red-500" /> Sign out
                    </button>
                  </div>
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

      {/* Recruiter Pro Upgrade Modal */}
      {role === 'recruiter' && (
        <UpgradeToProModal
          isOpen={recruiterPlan.isModalOpen}
          onClose={recruiterPlan.closeUpgradeModal}
          featureLocked={recruiterPlan.modalFeature}
          onActivatePro={(paymentDetails) => recruiterPlan.activatePlan({ plan: 'PRO', paymentDetails })}
          isActivating={recruiterPlan.isActivating}
          currentPlan={recruiterPlan.plan}
          pricing={recruiterPlan.pricing}
        />
      )}
    </div>
  );
}
