import { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Star, 
  Download, 
  CheckCircle2, 
  FileSpreadsheet,
  Sparkles,
  Laptop
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Cell
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function RecruiterAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [exportNotice, setExportNotice] = useState('');

  // 1. Dashboard KPIs & Trends strictly for this recruiter
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['recruiterDashboard'],
    queryFn: async () => {
      try {
        const res = await api.get('/recruiter/dashboard');
        if (res.data && res.data.kpis) return res.data;
      } catch {}
      return {
        kpis: {
          activeJobs: 0,
          totalApplications: 0,
          pendingReview: 0,
          shortlisted: 0,
          rejected: 0,
          hired: 0
        }
      };
    }
  });

  // 2. Jobs List strictly for this recruiter
  const { data: jobs = [], isLoading: isJobsLoading } = useQuery({
    queryKey: ['recruiterJobs'],
    queryFn: async () => {
      try {
        const res = await api.get('/recruiter/jobs');
        if (Array.isArray(res.data)) return res.data;
      } catch {}
      return [];
    }
  });

  // 3. Applications Pipeline strictly for this recruiter
  const { data: applications = [], isLoading: isAppsLoading } = useQuery({
    queryKey: ['recruiterApplications'],
    queryFn: async () => {
      try {
        const res = await api.get('/recruiter/applications');
        if (Array.isArray(res.data)) return res.data;
      } catch {}
      return [];
    }
  });

  const isLoading = isDashboardLoading || isJobsLoading || isAppsLoading;

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-r-transparent"></div>
        <p className="mt-3 text-xs font-semibold text-gray-500">Calculating hiring performance analytics...</p>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || { activeJobs: 0, totalApplications: 0, pendingReview: 0, shortlisted: 0, rejected: 0 };
  const totalApps = kpis.totalApplications || applications.length || 0;
  const shortlistedCount = kpis.shortlisted || applications.filter((a: any) => a.status === 'SHORTLISTED').length || 0;
  const hiredCount = applications.filter((a: any) => a.status === 'SELECTED' || a.status === 'HIRED').length || 0;
  const activeJobsCount = kpis.activeJobs || jobs.filter((j: any) => j.status === 'PUBLISHED').length || 0;

  // Conversion calculations
  const shortlistRate = totalApps > 0 ? Math.round((shortlistedCount / totalApps) * 100) : 0;
  const hireRate = totalApps > 0 ? Math.round((hiredCount / totalApps) * 100) : 0;
  const avgAppsPerJob = activeJobsCount > 0 ? (totalApps / activeJobsCount).toFixed(1) : '0';

  // Work Mode breakdown
  const workModeMap: Record<string, number> = {};
  jobs.forEach((j: any) => {
    const wm = j.workMode || 'On-site';
    workModeMap[wm] = (workModeMap[wm] || 0) + 1;
  });
  const workModeData = Object.entries(workModeMap).map(([name, value]) => ({ name, value }));

  // Top skills extraction
  const skillCountMap: Record<string, number> = {};
  applications.forEach((app: any) => {
    const sks: string[] = app.candidateProfile?.skills || [];
    sks.forEach(s => {
      if (s) {
        skillCountMap[s] = (skillCountMap[s] || 0) + 1;
      }
    });
  });
  const topSkillsData = Object.entries(skillCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));

  const displaySkills = topSkillsData;

  // Pipeline funnel chart data
  const funnelData = [
    { stage: 'Total Inbound', count: totalApps, fill: '#3b82f6' },
    { stage: 'Under Review', count: kpis.pendingReview || 0, fill: '#f59e0b' },
    { stage: 'Shortlisted', count: shortlistedCount, fill: '#10b981' },
    { stage: 'Selected / Hired', count: hiredCount, fill: '#8b5cf6' },
  ];

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = ['Job Title', 'Location', 'Type', 'Work Mode', 'Status', 'Applications Count', 'Created Date'];
    const rows = jobs.map((j: any) => [
      `"${j.title}"`,
      `"${j.location}"`,
      `"${j.type}"`,
      `"${j.workMode || 'On-site'}"`,
      `"${j.status}"`,
      j._count?.applications || j.applications?.length || 0,
      new Date(j.createdAt).toLocaleDateString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: (string | number)[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jobuffer_recruitment_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Recruitment performance report downloaded successfully as CSV!');
    setTimeout(() => setExportNotice(''), 3500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Hiring Insights</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Real-time Metrics
            </span>
          </div>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            Evaluate your applicant conversion funnels, job visibility, and hiring turnaround velocity.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-xs">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last Quarter'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Export notification */}
      {exportNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 block">Total Inbound Applicants</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-gray-900">{totalApps}</span>
              <span className="text-[11px] font-bold text-blue-600 flex items-center">
                {activeJobsCount} Jobs Active
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Across all posted openings</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Shortlist Rate */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 block">Shortlist Conversion Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">{shortlistRate}%</span>
              <span className="text-[11px] font-bold text-gray-500">({shortlistedCount} candidates)</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Advanced to discussion</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Applications Per Job */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 block">Avg. Velocity / Requisition</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-gray-900">{avgAppsPerJob}</span>
              <span className="text-[11px] font-semibold text-gray-500">apps/job</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{activeJobsCount} Active Requisitions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Hire Success Rate */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 block">Selection / Offer Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-600">{hireRate}%</span>
              <span className="text-[11px] font-bold text-purple-700">({hiredCount} Hired)</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Final stage closures</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inbound Talent Progression Funnel */}
        <Card className="lg:col-span-2 border-gray-200 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-900">Talent Progression Funnel</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Applicant stage drop-off and progression metrics</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="stage" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)' }} 
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={42}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Candidate Skills Breakdown & Work Modes */}
        <Card className="border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-gray-900">Top Applicant Skills</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Most common technologies among candidates</p>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-2">
              {displaySkills.length === 0 ? (
                <div className="py-10 text-center text-gray-400">
                  <p className="text-xs font-semibold text-gray-500">No applicant skills recorded yet</p>
                  <p className="text-[11px] text-gray-400 mt-1">Applicant competencies will populate here once candidates apply.</p>
                </div>
              ) : (
                displaySkills.map((item, idx) => {
                  const maxCount = Math.max(...displaySkills.map(s => s.count), 1);
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800">{item.skill}</span>
                        <span className="text-gray-500 font-semibold">{item.count} applicants</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </div>

          {/* Work Mode Breakdown Badge Strip */}
          <div className="p-4 bg-gray-50/80 border-t border-gray-100 m-4 rounded-xl">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5" /> Requisition Work Modes
            </span>
            <div className="flex flex-wrap gap-2">
              {workModeData.map((wm, i) => (
                <span key={i} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs">
                  {wm.name}: <strong className="text-blue-600">{wm.value}</strong>
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Requisitions Performance Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Requisitions Performance Matrix</h3>
            <p className="text-xs text-gray-500 mt-0.5">Detailed breakdown of applications, views, and conversion per job</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Matrix</span>
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No job requisition data to analyze yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                  <th className="pb-3 pl-2">Job Requisition</th>
                  <th className="pb-3">Location & Mode</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-center">Applicants</th>
                  <th className="pb-3 text-center">Conversion</th>
                  <th className="pb-3 text-right pr-2">Date Live</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job: any) => {
                  const jobApps = job._count?.applications || job.applications?.length || 0;
                  const convPct = totalApps > 0 ? Math.round((jobApps / totalApps) * 100) : 0;
                  const isActive = job.status === 'PUBLISHED';
                  return (
                    <tr key={job.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-gray-900">
                        {job.title}
                        <span className="block text-[11px] text-gray-400 font-normal">{job.type}</span>
                      </td>
                      <td className="py-3.5 text-gray-600">
                        {job.location} • <span className="font-semibold text-gray-800">{job.workMode || 'On-site'}</span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {isActive ? 'Active' : job.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-center font-bold text-gray-900">
                        {jobApps}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[11px]">
                          {convPct}%
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2 text-gray-500 font-medium">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
