import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  UserCircle, 
  Building2, 
  Briefcase, 
  FileText, 
  BarChart, 
  Layers, 
  ShieldAlert, 
  Bell, 
  Settings 
} from 'lucide-react';
import DashboardLayout, { type NavItem } from './DashboardLayout';

const navItems: NavItem[] = [
  // 1. Core Platform
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, section: 'Core Platform' },
  { name: 'Jobs', href: '/admin/jobs', icon: Briefcase, section: 'Core Platform' },
  { name: 'Applications', href: '/admin/applications', icon: FileText, section: 'Core Platform' },

  // 2. User & Talent Directory
  { name: 'Users', href: '/admin/users', icon: Users, section: 'User & Talent Directory' },
  { name: 'Recruiters', href: '/admin/recruiters', icon: UserCheck, section: 'User & Talent Directory' },
  { name: 'Candidates', href: '/admin/candidates', icon: UserCircle, section: 'User & Talent Directory' },
  { name: 'Companies', href: '/admin/companies', icon: Building2, section: 'User & Talent Directory' },

  // 3. Governance & Reports
  { name: 'Moderation', href: '/admin/moderation', icon: ShieldAlert, section: 'Governance & Reports' },
  { name: 'Categories', href: '/admin/categories', icon: Layers, section: 'Governance & Reports' },
  { name: 'Reports', href: '/admin/reports', icon: BarChart, section: 'Governance & Reports' },

  // 4. System & Preferences
  { name: 'Notifications', href: '/admin/notifications', icon: Bell, section: 'System & Preferences' },
  { name: 'System Settings', href: '/admin/settings', icon: Settings, section: 'System & Preferences' },
];

export default function AdminLayout() {
  return <DashboardLayout role="admin" navItems={navItems} />;
}
