import { useState } from 'react';
import { 
  Building2, 
  Briefcase, 
  FileText, 
  UserCircle, 
  Users, 
  ShieldCheck, 
  Download, 
  ArrowUpRight, 
  Activity, 
  CheckCircle2
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const COLORS = ['#2563eb', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [exportNotice, setExportNotice] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard', selectedYear],
    queryFn: async () => {
      const response = await api.get(`/admin/dashboard?year=${selectedYear}`);
      return response.data;
    }
  });

  // Recent users for activity feed
  const { data: recentUsers = [] } = useQuery({
    queryKey: ['adminRecentUsers'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data;
    }
  });

  // Recent jobs for quick overview
  const { data: recentJobs = [] } = useQuery({
    queryKey: ['adminRecentJobs'],
    queryFn: async () => {
      const res = await api.get('/admin/jobs');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-r-transparent"></div>
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading platform administration intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-2xl">
        <p className="font-bold text-sm">Failed to load administration dashboard</p>
        <p className="text-xs text-red-500 mt-1">Please refresh the page or check your connection.</p>
      </div>
    );
  }

  const kpis = data?.kpis || { totalCandidates: 0, totalRecruiters: 0, totalCompanies: 0, activeJobs: 0, totalApplications: 0 };
  const charts = data?.charts || { growthData: [], categoryData: [] };
  const { growthData, categoryData } = charts;

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleDownloadReport = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [
      ['Metric', 'Value'],
      ['Total Candidates', kpis.totalCandidates],
      ['Total Recruiters', kpis.totalRecruiters],
      ['Total Companies', kpis.totalCompanies],
      ['Active Jobs', kpis.activeJobs],
      ['Total Applications', kpis.totalApplications],
      ['Report Generated Date', new Date().toISOString()]
    ].map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jobbuffer_admin_summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Platform audit report downloaded successfully!');
    setTimeout(() => setExportNotice(''), 3000);
  };

  const latestUsersList = Array.isArray(recentUsers) ? recentUsers.slice(0, 5) : [];
  const latestJobsList = Array.isArray(recentJobs) ? recentJobs.slice(0, 4) : [];

  return (
    <div className="space-y-6 pb-16">
      {/* Executive Admin Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white backdrop-blur-sm flex items-center gap-1.5 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Root Administrator Console
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                All Systems Operational
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Platform Master Command Center
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Global administration panel overseeing multi-tenant recruiters, candidate talent pools, job requisitions, and platform compliance.
            </p>
          </div>

          {/* Quick Admin Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs shadow-md hover:bg-slate-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Audit
            </button>
            <button
              onClick={() => navigate('/admin/jobs')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-xs transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" />
              All Jobs
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-xs transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              Directory
            </button>
          </div>
        </div>

        {/* Ambient background glows */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-80 h-80 bg-blue-500/10 rounded-full pointer-events-none blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 translate-y-12 w-96 h-96 bg-purple-500/10 rounded-full pointer-events-none blur-3xl"></div>
      </div>

      {/* Export notification */}
      {exportNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Candidates" value={kpis.totalCandidates.toString()} icon={UserCircle} color="blue" />
        <StatCard title="Total Recruiters" value={kpis.totalRecruiters.toString()} icon={Users} color="purple" />
        <StatCard title="Verified Companies" value={kpis.totalCompanies.toString()} icon={Building2} color="amber" />
        <StatCard title="Active Requisitions" value={kpis.activeJobs.toString()} icon={Briefcase} color="green" />
        <StatCard title="Total Applications" value={kpis.totalApplications.toString()} icon={FileText} color="blue" />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Area Chart */}
        <Card className="lg:col-span-2 border-gray-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-gray-900">User Growth Trends</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Monthly candidate & recruiter platform onboarding</p>
            </div>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {years.map(y => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRecruiters" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)' }}
                  />
                  <Area yAxisId="left" type="monotone" name="Candidates" dataKey="candidates" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCandidates)" />
                  <Area yAxisId="right" type="monotone" name="Recruiters" dataKey="recruiters" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRecruiters)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 pt-3 text-xs font-semibold text-gray-600 border-t border-gray-100 mt-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>Candidates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                <span>Recruiters</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs by Category Donut */}
        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-900">Job Requisitions by Field</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Top industry distribution</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full flex flex-col justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black text-gray-900">{kpis.activeJobs}</span>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Live Openings</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              {categoryData.slice(0, 3).map((cat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="font-semibold text-gray-700 truncate max-w-[140px]">{cat.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{cat.value} jobs</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Columns: Recent Registrations & Global Job Postings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Recent Platform Registrations</h3>
              <p className="text-xs text-gray-500 mt-0.5">Newly joined recruiters and candidates</p>
            </div>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All Users</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {latestUsersList.map((u: any) => {
              const isRecruiter = u.role === 'RECRUITER';
              const isAdmin = u.role === 'ADMIN';
              return (
                <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {u.name ? u.name.slice(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{u.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isAdmin ? 'bg-red-100 text-red-800' :
                      isRecruiter ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role}
                    </span>
                    <span className="text-[11px] text-gray-400">{u.joined}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Jobs Snapshot */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Latest Job Postings</h3>
              <p className="text-xs text-gray-500 mt-0.5">Requisitions recently published across employers</p>
            </div>
            <button
              onClick={() => navigate('/admin/jobs')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage Jobs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {latestJobsList.map((job: any) => (
              <div key={job.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{job.title}</p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {job.company || 'Employer'} • {job.location} • {job.type}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {job.status || 'Active'}
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                    {job.applicants || 0} apps
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
