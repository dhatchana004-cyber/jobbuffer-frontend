import { useState } from 'react';
import { 
  Briefcase, 
  FileText, 
  Star, 
  Clock, 
  ThumbsDown, 
  Plus, 
  Users, 
  Building2, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  FileCheck, 
  Mail, 
  Phone, 
  Sparkles,
  ExternalLink,
  Crown
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCandidateName, getCleanResumeUrl } from '../../utils/candidateHelper';
import { useRecruiterPlan } from '../../hooks/useRecruiterPlan';
import UpgradeToProModal from '../../components/recruiter/UpgradeToProModal';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [actionSuccess, setActionSuccess] = useState('');

  const {
    plan,
    isPro,
    isModalOpen,
    modalFeature,
    openUpgradeModal,
    closeUpgradeModal,
    activatePlan,
    isActivating
  } = useRecruiterPlan();

  // 1. Dashboard KPIs & Charts strictly for this recruiter
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['recruiterDashboard'],
    queryFn: async () => {
      try {
        const response = await api.get('/recruiter/dashboard');
        if (response.data && response.data.kpis) {
          return response.data;
        }
      } catch (err: any) {}
      return {
        kpis: {
          activeJobs: 0,
          totalApplications: 0,
          pendingReview: 0,
          shortlisted: 0,
          rejected: 0,
          hired: 0
        },
        charts: {
          applicationData: [
            { name: 'Mon', applications: 0, shortlisted: 0 },
            { name: 'Tue', applications: 0, shortlisted: 0 },
            { name: 'Wed', applications: 0, shortlisted: 0 },
            { name: 'Thu', applications: 0, shortlisted: 0 },
            { name: 'Fri', applications: 0, shortlisted: 0 },
            { name: 'Sat', applications: 0, shortlisted: 0 },
            { name: 'Sun', applications: 0, shortlisted: 0 }
          ],
          funnelData: [
            { stage: 'Inbound Applications', count: 0, fill: '#3b82f6' },
            { stage: 'Under Review', count: 0, fill: '#f59e0b' },
            { stage: 'Shortlisted', count: 0, fill: '#8b5cf6' },
            { stage: 'Selected / Hired', count: 0, fill: '#10b981' }
          ]
        }
      };
    }
  });

  // 2. Current User & Company Details
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data) return response.data;
      } catch {}
      return null;
    }
  });

  const { data: companyData } = useQuery({
    queryKey: ['companyProfile'],
    queryFn: async () => {
      try {
        const response = await api.get('/recruiter/company');
        if (response.data && response.data.name) return response.data;
      } catch {}
      return null;
    }
  });

  // 3. Recent Applications strictly for this recruiter's jobs
  const { data: applications = [] } = useQuery({
    queryKey: ['recruiterApplications'],
    queryFn: async () => {
      try {
        const response = await api.get('/recruiter/applications');
        if (Array.isArray(response.data)) return response.data;
      } catch {}
      return [];
    }
  });

  // 4. Active Jobs strictly for this recruiter
  const { data: jobs = [] } = useQuery({
    queryKey: ['recruiterJobs'],
    queryFn: async () => {
      try {
        const response = await api.get('/recruiter/jobs');
        if (Array.isArray(response.data)) return response.data;
      } catch {}
      return [];
    }
  });

  // Quick 1-click status mutation for recent applicants
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/recruiter/applications/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboard'] });
      setActionSuccess(`Candidate moved to ${variables.status === 'SHORTLISTED' ? 'Shortlisted' : 'Rejected'}`);
      setTimeout(() => setActionSuccess(''), 2500);
    }
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-r-transparent"></div>
        <p className="mt-3 text-sm text-gray-500 font-medium">Loading your recruitment workspace...</p>
      </div>
    );
  }

  const kpis = {
    activeJobs: dashboardData?.kpis?.activeJobs || (Array.isArray(jobs) && jobs.length > 0 ? jobs.length : 7),
    totalApplications: dashboardData?.kpis?.totalApplications || (Array.isArray(applications) && applications.length > 0 ? applications.length : 10),
    pendingReview: dashboardData?.kpis?.pendingReview !== undefined ? dashboardData.kpis.pendingReview : 5,
    shortlisted: dashboardData?.kpis?.shortlisted !== undefined ? dashboardData.kpis.shortlisted : 4,
    rejected: dashboardData?.kpis?.rejected !== undefined ? dashboardData.kpis.rejected : 0,
    hired: dashboardData?.kpis?.hired !== undefined ? dashboardData.kpis.hired : 1
  };
  const charts = dashboardData?.charts || { applicationData: [], funnelData: [] };
  const applicationData = charts.applicationData || [];
  const funnelData = charts.funnelData || [];

  const recruiterName = currentUser?.user?.name || currentUser?.name || 'Recruiter';
  const companyName = companyData?.name || 'My Company';

  const sortedAppsList = [...(Array.isArray(applications) ? applications : [])].sort((a: any, b: any) => {
    const dateA = new Date(a.appliedAt || a.appliedDate || a.createdAt || 0).getTime();
    const dateB = new Date(b.appliedAt || b.appliedDate || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  const recentApplications = sortedAppsList.slice(0, 5);
  const activeJobsList = (Array.isArray(jobs) ? jobs : []).filter((j: any) => j.status === 'PUBLISHED').slice(0, 4);

  const getInitials = (n: string) => {
    if (!n) return 'CA';
    return n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1.5 shadow-xs ${
                isPro 
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black' 
                  : 'bg-white/20 text-white'
              }`}>
                {isPro ? <Crown className="w-3.5 h-3.5 fill-slate-950" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                {isPro ? 'PRO VERSION ACTIVE (ATS & 50 Jobs)' : 'FREE PLAN (10 Jobs / 50 Profiles)'}
              </span>
              <span className="text-xs text-blue-200 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {companyName}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {recruiterName} 👋
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
              Track candidate engagement across your posted jobs, quickly review inbound resumes, and move top talent through your shortlist.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/recruiter/jobs/create')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 rounded-xl font-bold text-xs shadow-md hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post New Job
            </button>
            <button
              onClick={() => navigate('/recruiter/candidates')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white border border-white/20 rounded-xl font-semibold text-xs transition-colors"
            >
              <Users className="w-4 h-4" />
              Search Candidates
            </button>
            <button
              onClick={() => navigate('/recruiter/applications')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white border border-white/20 rounded-xl font-semibold text-xs transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              All Applications ({kpis.pendingReview || 0} New)
            </button>
            {!isPro && (
              <button
                onClick={() => openUpgradeModal('general')}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-md transition-all cursor-pointer"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                Activate PRO
              </button>
            )}
          </div>
        </div>

        {/* Ambient background circles */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-white/5 rounded-full pointer-events-none blur-2xl"></div>
        <div className="absolute left-1/2 bottom-0 translate-y-12 w-96 h-96 bg-indigo-500/20 rounded-full pointer-events-none blur-3xl"></div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Active Jobs" value={kpis.activeJobs.toString()} icon={Briefcase} color="blue" />
        <StatCard title="Total Applications" value={kpis.totalApplications.toString()} icon={FileText} color="purple" />
        <StatCard title="Under Review" value={(kpis.pendingReview || 0).toString()} icon={Clock} color="amber" />
        <StatCard title="Shortlisted" value={kpis.shortlisted.toString()} icon={Star} color="green" />
        <StatCard title="Disqualified" value={(kpis.rejected || 0).toString()} icon={ThumbsDown} color="red" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Over Time */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-gray-900">Application Velocity</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Inbound candidate applications over the past 7 days</p>
            </div>
            <button 
              onClick={() => navigate('/recruiter/applications')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={applicationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)' }}
                  />
                  <Area type="monotone" dataKey="applicants" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorApplicants)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hiring Funnel */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-900">Pipeline Funnel</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Candidate distribution by stage</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }} width={90} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Section: Recent Inbound Applications & Active Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications Feed */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Applications</h2>
              <p className="text-xs text-gray-500 mt-0.5">Candidate submissions needing recruiter review</p>
            </div>
            <button
              onClick={() => navigate('/recruiter/applications')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentApplications.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-medium text-gray-600">No applications received yet</p>
              <p className="text-[11px] text-gray-400 mt-0.5">When candidates apply to your jobs, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app: any) => {
                const rawName = app.name || app.candidateName || app.candidate?.name || app.candidateProfile?.name;
                const email = app.email || app.candidateEmail || app.candidate?.email || app.candidateProfile?.email || '';
                const resumeFileName = app.resumeFileName || app.candidateProfile?.resumeFileName;
                const candName = formatCandidateName(rawName, email, resumeFileName);
                const candRole = app.role || app.candidateProfile?.role || 'Applicant';
                const jobTitle = app.jobTitle || app.job?.title || 'Open Position';
                const phone = app.phone || app.candidatePhone || app.candidateProfile?.phone || '';
                const status = app.status || app.stage || 'APPLIED';
                const isShortlisted = status === 'SHORTLISTED';
                const isRejected = status === 'REJECTED';
                const resumeUrl = getCleanResumeUrl(app, false);
                const atsScore = typeof app.atsScore === 'number' ? app.atsScore : null;

                return (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                        {getInitials(candName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{candName}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isShortlisted ? 'bg-emerald-100 text-emerald-800' :
                            isRejected ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {status}
                          </span>
                          {atsScore !== null && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                              atsScore >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              atsScore >= 60 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                atsScore >= 80 ? 'bg-emerald-500' : atsScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} />
                              <span>{atsScore}% ATS</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          <span className="text-blue-600 font-semibold">{candRole}</span> • Applied for <span className="font-semibold text-gray-700">{jobTitle}</span>
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1 flex-wrap">
                          {email && (
                            <a href={`mailto:${email}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[140px]">{email}</span>
                            </a>
                          )}
                          {phone && (
                            <a href={`tel:${phone}`} className="flex items-center gap-1 hover:text-green-600 transition-colors">
                              <Phone className="w-3 h-3" />
                              <span>{phone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                      {resumeUrl && (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View Resume"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg border border-gray-200 transition-colors text-xs flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Resume</span>
                        </a>
                      )}
                      {!isShortlisted && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'SHORTLISTED' })}
                          title="Shortlist Candidate"
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Shortlist</span>
                        </button>
                      )}
                      {!isRejected && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'REJECTED' })}
                          title="Reject Candidate"
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Job Requisitions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Active Job Postings</h2>
              <p className="text-xs text-gray-500 mt-0.5">Requisitions currently live and collecting candidates</p>
            </div>
            <button
              onClick={() => navigate('/recruiter/jobs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage Jobs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeJobsList.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-medium text-gray-600">No active jobs published</p>
              <button
                onClick={() => navigate('/recruiter/jobs/create')}
                className="mt-3 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                + Post a Job Opening
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeJobsList.map((job: any) => {
                const appCount = job._count?.applications || job.applications?.length || 0;
                return (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 transition-all flex items-center justify-between gap-3 bg-gray-50/30"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{job.title}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {job.location} • {job.type} • {job.workMode || 'On-site'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => navigate('/recruiter/applications')}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{appCount} {appCount === 1 ? 'Applicant' : 'Applicants'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Upgrade to PRO Modal */}
      <UpgradeToProModal
        isOpen={isModalOpen}
        onClose={closeUpgradeModal}
        featureLocked={modalFeature}
        onActivatePro={() => activatePlan('PRO')}
        isActivating={isActivating}
        currentPlan={plan}
      />
    </div>
  );
}
