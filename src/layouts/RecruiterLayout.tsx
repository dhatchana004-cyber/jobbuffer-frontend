import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  MessageSquare, 
  Building,
  Bell,
  Settings,
  BarChart3,
  Mail
} from 'lucide-react';
import DashboardLayout, { type NavItem } from './DashboardLayout';

const navItems: NavItem[] = [
  // 1. Recruitment Workspace
  { name: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard, section: 'Recruitment Workspace' },
  { name: 'Jobs', href: '/recruiter/jobs', icon: Briefcase, section: 'Recruitment Workspace' },
  { name: 'Candidates', href: '/recruiter/candidates', icon: Users, section: 'Recruitment Workspace' },
  { name: 'Applications', href: '/recruiter/applications', icon: FileText, section: 'Recruitment Workspace' },
  { name: 'Messages', href: '/recruiter/messages', icon: MessageSquare, section: 'Recruitment Workspace' },
  { name: 'Analytics', href: '/recruiter/analytics', icon: BarChart3, section: 'Recruitment Workspace' },

  // 2. Organization & Employer Brand
  { name: 'Company Profile', href: '/recruiter/company', icon: Building, section: 'Organization' },
  { name: 'Email Templates', href: '/recruiter/templates', icon: Mail, section: 'Organization' },

  // 3. System & Account
  { name: 'Notifications', href: '/recruiter/notifications', icon: Bell, section: 'System & Account' },
  { name: 'Settings', href: '/recruiter/settings', icon: Settings, section: 'System & Account' },
];

export default function RecruiterLayout() {
  return <DashboardLayout role="recruiter" navItems={navItems} />;
}
