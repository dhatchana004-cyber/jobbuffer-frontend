import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Pause, 
  Play, 
  XCircle, 
  Trash2, 
  Briefcase, 
  Users, 
  MapPin, 
  Clock, 
  Copy, 
  Check,
  ChevronRight,
  Flame
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export default function JobsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PUBLISHED' | 'PAUSED' | 'DRAFT' | 'CLOSED'>('ALL');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['recruiterJobs'],
    queryFn: async () => {
      const response = await api.get('/recruiter/jobs');
      return response.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      const res = await api.patch(`/recruiter/jobs/${jobId}/status`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboard'] });
      showToast(`Job status updated to ${variables.status}`);
      setActiveDropdown(null);
    },
    onError: () => {
      showToast('Failed to update job status');
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const res = await api.delete(`/recruiter/jobs/${jobId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboard'] });
      showToast('Job posting deleted successfully');
      setActiveDropdown(null);
    },
    onError: () => {
      showToast('Failed to delete job posting');
    }
  });

  const handleDeleteJob = (jobId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const copyShareLink = (jobId: string) => {
    const shareUrl = `${window.location.origin}/jobs/${jobId}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Job application link copied to clipboard!');
    setActiveDropdown(null);
  };

  const jobList: any[] = Array.isArray(jobs) ? jobs : [];

  // Filter jobs by tab and search
  const filteredJobs = jobList.filter((j: any) => {
    if (activeTab !== 'ALL' && j.status !== activeTab) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = j.title?.toLowerCase().includes(term);
      const matchLoc = j.location?.toLowerCase().includes(term);
      const matchType = j.type?.toLowerCase().includes(term);
      if (!matchTitle && !matchLoc && !matchType) return false;
    }
    return true;
  });

  // Counts for tabs
  const countAll = jobList.length;
  const countPublished = jobList.filter(j => j.status === 'PUBLISHED').length;
  const countPaused = jobList.filter(j => j.status === 'PAUSED').length;
  const countDraft = jobList.filter(j => j.status === 'DRAFT').length;
  const countClosed = jobList.filter(j => j.status === 'CLOSED').length;
  const totalApplicants = jobList.reduce((acc, j) => acc + (j.applications || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Paused
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Closed
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Job Openings</h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Enterprise ATS
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Manage your company's active openings, review candidate applications, and track hiring status.
          </p>
        </div>

        <button 
          onClick={() => navigate('/recruiter/jobs/create')}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Post New Job Opening
        </button>
      </div>

      {/* Quick KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Active Jobs</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{countPublished}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Openings</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">{countAll}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Inbound Applicants</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">{totalApplicants}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Drafts & Paused</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{countDraft + countPaused}</span>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Openings
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
              }`}>
                {countAll}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('PUBLISHED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'PUBLISHED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Active
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'PUBLISHED' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {countPublished}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('PAUSED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'PAUSED'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Paused
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'PAUSED' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {countPaused}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('DRAFT')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'DRAFT'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Drafts
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'DRAFT' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
              }`}>
                {countDraft}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('CLOSED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'CLOSED'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Closed
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'CLOSED' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {countClosed}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

        </div>
      </div>

      {/* Main Jobs Listing */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Loading job postings...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center text-rose-700">
          <p className="font-semibold">Unable to load job postings</p>
          <p className="text-xs mt-1">Please try refreshing the page.</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {searchTerm ? 'No matching job postings found' : 'No jobs in this category yet'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {searchTerm 
              ? 'Try modifying your search keywords or clear filters.' 
              : 'Post a new job opening to start receiving applications from qualified candidates.'}
          </p>
          <button
            onClick={() => navigate('/recruiter/jobs/create')}
            className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-md"
          >
            + Create New Job Opening
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredJobs.map((job) => {
            const isDropdownOpen = activeDropdown === job.id;

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left Job Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-xs">
                    <Briefcase className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 
                        onClick={() => navigate('/recruiter/applications')}
                        className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors cursor-pointer truncate"
                      >
                        {job.title}
                      </h3>
                      {getStatusBadge(job.status)}
                      {Boolean(job.isUrgent) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                          <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                          Urgent Hiring
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      <span>•</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                        {job.type}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        Created: {job.created}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Metrics & Quick Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Applicants Pill & Button */}
                  <button
                    onClick={() => navigate('/recruiter/applications')}
                    className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{job.applications || 0} Applicants</span>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  </button>

                  {/* Quick Publish for Drafts */}
                  {job.status === 'DRAFT' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ jobId: job.id, status: 'PUBLISHED' })}
                      disabled={updateStatusMutation.isPending}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      title="Publish this draft opening"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Publish Now</span>
                    </button>
                  )}

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(isDropdownOpen ? null : job.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="More Options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 text-xs">
                        {/* Pause / Publish */}
                        {job.status === 'PUBLISHED' ? (
                          <button
                            onClick={() => updateStatusMutation.mutate({ jobId: job.id, status: 'PAUSED' })}
                            className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Pause className="w-3.5 h-3.5 text-amber-500" />
                            Pause Posting
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStatusMutation.mutate({ jobId: job.id, status: 'PUBLISHED' })}
                            className="w-full px-4 py-2.5 text-left text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer font-semibold"
                          >
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                            Publish Opening
                          </button>
                        )}

                        {/* Close Opening */}
                        {job.status !== 'CLOSED' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ jobId: job.id, status: 'CLOSED' })}
                            className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            Close Opening
                          </button>
                        )}

                        {/* Copy Link */}
                        <button
                          onClick={() => copyShareLink(job.id)}
                          className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-blue-500" />
                          Copy Share Link
                        </button>

                        <div className="border-t border-slate-100 my-1" />

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteJob(job.id, job.title)}
                          className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          Delete Posting
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
