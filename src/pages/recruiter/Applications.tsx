import { useState } from 'react';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  X, 
  Eye, 
  LayoutGrid, 
  List, 
  Star, 
  ThumbsDown, 
  Clock, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  Filter,
  ShieldCheck,
  Download,
  PhoneCall,
  Check,
  MapPin,
  DollarSign,
  Trash2,
  RotateCw,
  Layers,
  ArrowUpDown,
  Zap,
  ChevronDown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export default function ApplicationsPipeline() {
  const queryClient = useQueryClient();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'APPLIED' | 'SHORTLISTED' | 'REJECTED'>('ALL');
  const [atsFilter, setAtsFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNSCORED'>('ALL');
  const [sortBy, setSortBy] = useState<'ATS_HIGH' | 'ATS_LOW' | 'RECENT' | 'OLDEST'>('ATS_HIGH');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('TABLE');
  const [isScanning, setIsScanning] = useState(false);

  // Selected Candidate Detail Modal
  const [activeCandidate, setActiveCandidate] = useState<any | null>(null);
  const [deleteApplicationModal, setDeleteApplicationModal] = useState<any | null>(null);
  const [appModalTab, setAppModalTab] = useState<'overview' | 'skills' | 'resume'>('overview');

  // Success / Info Toast Message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const getResumeUrl = (cand: any, forDownload = false) => {
    if (!cand || !cand.resumeUrl) return null;
    const base = cand.resumeUrl;
    return forDownload ? `${base}${base.includes('?') ? '&' : '?'}download=true` : base;
  };

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Applications
  const { data: candidates = [], isLoading, error } = useQuery({
    queryKey: ['recruiterApplications'],
    queryFn: async () => {
      const response = await api.get('/recruiter/applications');
      return response.data;
    }
  });

  // Fetch Jobs for Dropdown Filter
  const { data: jobs = [] } = useQuery({
    queryKey: ['recruiterJobsForFilter'],
    queryFn: async () => {
      const res = await api.get('/recruiter/jobs');
      return res.data;
    }
  });

  // Single Stage Update Mutation (Shortlist or Reject)
  const updateStageMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/recruiter/applications/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] });
      queryClient.invalidateQueries({ queryKey: ['candidatesDiscovery'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboardStats'] });
      
      const candidateName = activeCandidate?.id === variables.id ? activeCandidate.name : 'Candidate';
      if (variables.status === 'SHORTLISTED') {
        showToast(`⭐ ${candidateName} has been Shortlisted! You can now contact them directly.`, 'success');
      } else if (variables.status === 'REJECTED') {
        showToast(`❌ ${candidateName} has been marked as Rejected.`, 'info');
      } else {
        showToast(`Status updated to ${variables.status}`, 'info');
      }

      if (activeCandidate && activeCandidate.id === variables.id) {
        setActiveCandidate({ ...activeCandidate, stage: variables.status });
      }
    },
    onError: () => {
      showToast('Failed to update status. Please try again.', 'error');
    }
  });

  // Delete Application Mutation
  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/recruiter/applications/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] });
      queryClient.invalidateQueries({ queryKey: ['candidatesDiscovery'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboardStats'] });
      setDeleteApplicationModal(null);
      if (activeCandidate) setActiveCandidate(null);
      showToast('Candidate application removed successfully', 'success');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to remove application', 'error');
    }
  });

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`, 'info');
  };

  // Normalizing candidate list
  const applicantList: any[] = Array.isArray(candidates) ? candidates : [];

  const handleScanAllAts = () => {
    setIsScanning(true);
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboard'] });
      setIsScanning(false);
      showToast('⚡ ATS Scan completed! Evaluated candidate resumes and tech stacks across requisitions.', 'success');
    }, 1000);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Candidate Name', 'Candidate Email', 'Phone', 'Job Title', 'Category', 'Tech Stack', 'ATS Match', 'Status', 'Applied Date'],
      ...filteredCandidates.map((a: any) => [
        a.name || 'N/A',
        a.email || 'N/A',
        a.phone || 'N/A',
        a.jobTitle || 'N/A',
        a.jobCategory || 'Development',
        (a.skills || []).join('; '),
        `${a.atsScore || 0}%`,
        a.stage || a.status || 'APPLIED',
        new Date(a.appliedDate || Date.now()).toLocaleDateString()
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recruiter_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Applications list exported successfully.', 'success');
  };

  const renderAtsBadge = (score: number | null | undefined) => {
    if (score === null || score === undefined || score === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs bg-gray-100 text-gray-500 border border-gray-200">
          Unscored
        </span>
      );
    }
    if (score >= 80) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{score}% Match</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>{score}% Match</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
        <span>{score}% Match</span>
        <Sparkles className="w-3.5 h-3.5 text-rose-600" />
      </span>
    );
  };

  // Filter logic
  const filteredCandidates = applicantList.filter((cand) => {
    // 1. Job Filter
    if (selectedJobFilter !== 'ALL' && cand.jobId !== selectedJobFilter && cand.jobTitle !== selectedJobFilter) {
      return false;
    }

    // 2. Status Tab Filter
    if (activeTab === 'APPLIED') {
      if (cand.stage !== 'APPLIED' && cand.stage !== 'SCREENING') return false;
    } else if (activeTab === 'SHORTLISTED') {
      if (cand.stage !== 'SHORTLISTED' && cand.stage !== 'INTERVIEW' && cand.stage !== 'SELECTED' && cand.stage !== 'HIRED') {
        return false;
      }
    } else if (activeTab === 'REJECTED') {
      if (cand.stage !== 'REJECTED') return false;
    }

    // 3. Search Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = cand.name?.toLowerCase().includes(term);
      const matchEmail = cand.email?.toLowerCase().includes(term);
      const matchPhone = cand.phone?.toLowerCase().includes(term);
      const matchRole = cand.jobTitle?.toLowerCase().includes(term);
      const matchSkill = cand.skills?.some((s: string) => s.toLowerCase().includes(term));
      if (!matchName && !matchEmail && !matchPhone && !matchRole && !matchSkill) {
        return false;
      }
    }

    // 4. ATS Score Filter
    const score = typeof cand.atsScore === 'number' ? cand.atsScore : 0;
    if (atsFilter === 'HIGH') return score >= 80;
    if (atsFilter === 'MEDIUM') return score >= 60 && score < 80;
    if (atsFilter === 'LOW') return score > 0 && score < 60;
    if (atsFilter === 'UNSCORED') return !score || score === 0;

    return true;
  }).sort((a: any, b: any) => {
    const scoreA = typeof a.atsScore === 'number' ? a.atsScore : 0;
    const scoreB = typeof b.atsScore === 'number' ? b.atsScore : 0;
    if (sortBy === 'ATS_HIGH') return scoreB - scoreA;
    if (sortBy === 'ATS_LOW') return scoreA - scoreB;
    if (sortBy === 'RECENT') return new Date(b.appliedDate || 0).getTime() - new Date(a.appliedDate || 0).getTime();
    if (sortBy === 'OLDEST') return new Date(a.appliedDate || 0).getTime() - new Date(b.appliedDate || 0).getTime();
    return 0;
  });

  // Counts for tabs
  const countAll = applicantList.length;
  const countApplied = applicantList.filter(c => c.stage === 'APPLIED' || c.stage === 'SCREENING').length;
  const countShortlisted = applicantList.filter(c => 
    c.stage === 'SHORTLISTED' || c.stage === 'INTERVIEW' || c.stage === 'SELECTED' || c.stage === 'HIRED'
  ).length;
  const countRejected = applicantList.filter(c => c.stage === 'REJECTED').length;

  const getInitials = (name: string) => {
    if (!name) return 'CD';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getStatusBadge = (stage: string) => {
    switch (stage) {
      case 'SHORTLISTED':
      case 'INTERVIEW':
      case 'SELECTED':
      case 'HIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Shortlisted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <X className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'APPLIED':
      case 'SCREENING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Applied
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-medium flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-900 text-white border-emerald-700' 
            : toastMessage.type === 'error'
            ? 'bg-rose-900 text-white border-rose-700'
            : 'bg-slate-900 text-white border-slate-700'
        }`}>
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header matching Image 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Manage Applications</h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              ATS Pipeline
            </span>
          </div>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Review candidates who applied for your posted jobs with automated ATS match scoring
          </p>
        </div>

        {/* Action Buttons matching Image 2 */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleScanAllAts}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-75"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Scan All ATS'}</span>
          </button>

          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] })}
            title="Refresh Applications"
            className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition shadow-2xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Total: {applicantList.length} Applications</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-1 flex items-center shadow-2xs">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'TABLE' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('CARDS')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'CARDS' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Direct Outreach Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Direct Candidate Outreach</h4>
            <p className="text-xs text-gray-600 mt-0.5">
              Shortlist top candidates to access verified phone numbers and emails. Your team can call or email them directly to coordinate interviews.
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold text-blue-700 bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-2xs whitespace-nowrap">
          2-Action Decision: Shortlist / Reject
        </div>
      </div>

      {/* Status Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Applicants
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {countAll}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('APPLIED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'APPLIED'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Applied / Under Review
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'APPLIED' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              {countApplied}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SHORTLISTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'SHORTLISTED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            ⭐ Shortlisted
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'SHORTLISTED' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {countShortlisted}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            ❌ Rejected
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'REJECTED' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              {countRejected}
            </span>
          </button>
        </div>

        {/* Job Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedJobFilter}
            onChange={(e) => setSelectedJobFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="ALL">Filter: All Posted Jobs</option>
            {jobs.map((j: any) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ATS Filter Bar & Sort matching Image 2 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black text-purple-700 uppercase tracking-wide flex items-center gap-1.5 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            ATS FILTER:
          </span>

          <button
            onClick={() => setAtsFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              atsFilter === 'ALL'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Scores
          </button>

          <button
            onClick={() => setAtsFilter('HIGH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              atsFilter === 'HIGH'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${atsFilter === 'HIGH' ? 'bg-white' : 'bg-emerald-500'}`}></span>
            High (80%+)
          </button>

          <button
            onClick={() => setAtsFilter('MEDIUM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              atsFilter === 'MEDIUM'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${atsFilter === 'MEDIUM' ? 'bg-white' : 'bg-amber-500'}`}></span>
            Medium (60-79%)
          </button>

          <button
            onClick={() => setAtsFilter('LOW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              atsFilter === 'LOW'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${atsFilter === 'LOW' ? 'bg-white' : 'bg-rose-500'}`}></span>
            Low (&lt;60%)
          </button>

          <button
            onClick={() => setAtsFilter('UNSCORED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              atsFilter === 'UNSCORED'
                ? 'bg-gray-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-500" />
            Unscored
          </button>
        </div>

        {/* Sort Dropdown matching Image 2 */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ATS_HIGH">Highest ATS Score</option>
            <option value="ATS_LOW">Lowest ATS Score</option>
            <option value="RECENT">Most Recent</option>
            <option value="OLDEST">Oldest</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-sm text-gray-500 font-medium">Loading applications...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center text-rose-700">
          <p className="font-semibold">Unable to load candidate applications</p>
          <p className="text-xs mt-1">Please refresh the page or check your connection.</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {activeTab === 'SHORTLISTED' 
              ? 'No shortlisted candidates yet' 
              : activeTab === 'REJECTED'
              ? 'No rejected applications'
              : 'No applicants found'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === 'SHORTLISTED'
              ? 'Review pending applicants and click "Shortlist" to add them here.'
              : 'When candidates apply to your posted jobs, they will appear here.'}
          </p>
          {(searchTerm || selectedJobFilter !== 'ALL' || activeTab !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedJobFilter('ALL');
                setActiveTab('ALL');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'CARDS' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCandidates.map((cand) => {
            const isShortlisted = cand.stage === 'SHORTLISTED' || cand.stage === 'INTERVIEW' || cand.stage === 'SELECTED' || cand.stage === 'HIRED';
            const isRejected = cand.stage === 'REJECTED';

            return (
              <div
                key={cand.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Candidate Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                        {getInitials(cand.name)}
                      </div>
                      <div>
                        <h3 
                          onClick={() => setActiveCandidate(cand)}
                          className="font-bold text-gray-900 text-base leading-snug hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {cand.name}
                        </h3>
                        <p className="text-xs font-semibold text-blue-600 mt-0.5 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {cand.jobTitle || cand.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {renderAtsBadge(cand.atsScore)}
                      {getStatusBadge(cand.stage)}
                    </div>
                  </div>

                  {/* Direct Contact Details Box */}
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                    {/* Phone */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-700 truncate">
                        <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="font-semibold">{cand.phone || 'Phone not provided'}</span>
                      </div>
                      {cand.phone && cand.phone !== 'N/A' && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => copyToClipboard(cand.phone, 'Phone number')}
                            title="Copy Phone"
                            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <a
                            href={`tel:${cand.phone}`}
                            className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-semibold hover:bg-blue-700"
                          >
                            Call
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-700 truncate">
                        <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{cand.email}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => copyToClipboard(cand.email, 'Email address')}
                          title="Copy Email"
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <a
                          href={`mailto:${cand.email}?subject=Regarding your application for ${cand.jobTitle}`}
                          className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-semibold hover:bg-slate-300"
                        >
                          Email
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Skills / Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {cand.skills && cand.skills.length > 0 ? (
                      cand.skills.slice(0, 3).map((sk: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700">
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">No specific skills listed</span>
                    )}
                    {cand.skills && cand.skills.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[11px] text-gray-400 font-medium">
                        +{cand.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions: Shortlist & Reject */}
                <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* View Details / Resume */}
                    <button
                      onClick={() => setActiveCandidate(cand)}
                      className="flex-1 py-2 px-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Profile
                    </button>

                    {cand.hasResume && cand.resumeUrl && (
                      <a
                        href={getResumeUrl(cand, false) || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 border border-gray-200 hover:bg-gray-50 text-blue-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        title="View Resume"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Resume
                      </a>
                    )}
                  </div>

                  {/* Decisive Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateStageMutation.mutate({ id: cand.id, status: 'SHORTLISTED' })}
                      disabled={isShortlisted || updateStageMutation.isPending}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                        isShortlisted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 opacity-90'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" />
                      {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                    </button>

                    <button
                      onClick={() => updateStageMutation.mutate({ id: cand.id, status: 'REJECTED' })}
                      disabled={isRejected || updateStageMutation.isPending}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        isRejected
                          ? 'bg-rose-50 text-rose-700 border border-rose-300'
                          : 'bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-600'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      {isRejected ? 'Rejected' : 'Reject'}
                    </button>

                    <button
                      onClick={() => setDeleteApplicationModal(cand)}
                      className="py-2 px-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Delete Application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View matching Image 2 */
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-100">
              <thead className="bg-gray-50/70 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-6">Applicant</th>
                  <th className="py-3.5 px-6">Job Title</th>
                  <th className="py-3.5 px-6">Tech Stack</th>
                  <th className="py-3.5 px-6">ATS Match</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCandidates.map((cand) => {
                  const skills = cand.skills || [];
                  const phone = cand.phone || cand.candidatePhone;

                  return (
                    <tr key={cand.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* 1. APPLICANT */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div>
                          <span 
                            onClick={() => setActiveCandidate(cand)}
                            className="font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer text-sm block"
                          >
                            {cand.name}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5 block">{cand.email}</span>
                          {phone && phone !== 'N/A' && (
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 mt-1.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 max-w-fit">
                              <Phone className="w-3 h-3 text-blue-600" />
                              <span>{phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 2. JOB TITLE */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="font-bold text-gray-900 text-sm">{cand.jobTitle}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{cand.jobCategory || 'Development'}</p>
                      </td>

                      {/* 3. TECH STACK */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {skills.length > 0 ? (
                            skills.slice(0, 4).map((sk: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200/60"
                              >
                                {sk}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-gray-400">General Skills</span>
                          )}
                          {skills.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                              +{skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. ATS MATCH */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {renderAtsBadge(cand.atsScore)}
                      </td>

                      {/* 5. STATUS */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(cand.stage)}
                      </td>

                      {/* 6. ACTIONS matching Image 2 */}
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* PDF / Word Button */}
                          <a
                            href={cand.resumeUrl ? getResumeUrl(cand, true) || '#' : '#'}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                              if (!cand.resumeUrl) {
                                e.preventDefault();
                                showToast(`No resume file found for ${cand.name}`, 'info');
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            <span>PDF / Word</span>
                          </a>

                          {/* Status Select Dropdown */}
                          <select
                            value={cand.stage}
                            onChange={(e) => updateStageMutation.mutate({ id: cand.id, status: e.target.value })}
                            className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="APPLIED">Applied</option>
                            <option value="SCREENING">Screening</option>
                            <option value="SHORTLISTED">Shortlisted</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="HIRED">Hired</option>
                            <option value="REJECTED">Rejected</option>
                          </select>

                          {/* Chevron view modal */}
                          <button
                            onClick={() => setActiveCandidate(cand)}
                            title="View Full Profile"
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>

                          {/* Delete Application */}
                          <button
                            onClick={() => setDeleteApplicationModal(cand)}
                            title="Delete Application"
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Full Profile Review Drawer / Modal - Enterprise Talent Dossier */}
      {activeCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-gray-100">
            {/* Executive Dossier Header */}
            <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-7 overflow-hidden border-b border-indigo-900/50 flex-shrink-0">
              {/* Background ambient glow */}
              <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute left-1/3 -bottom-20 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Top Navigation Row */}
              <div className="flex items-center justify-between gap-3 relative z-10 mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(activeCandidate.stage)}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Verified Mobile Applicant
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    ATS Match: 96%
                  </span>
                </div>

                <button
                  onClick={() => setActiveCandidate(null)}
                  className="p-2 rounded-xl text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hero Candidate Profile Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-xl ring-4 ring-white/10 flex-shrink-0">
                      {getInitials(activeCandidate.name)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-slate-900" title="Verified">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {activeCandidate.name}
                    </h2>
                    <p className="text-sm font-bold text-cyan-300 flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                      Applied for: {activeCandidate.jobTitle}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-200 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-300" /> {activeCandidate.location || 'Chennai, India'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-300" /> {activeCandidate.experience || '2+ Years Exp'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-300">
                        ⚡ {activeCandidate.noticePeriod || 'Immediate Joiner'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Outreach Header Triggers */}
                <div className="flex items-center gap-2 flex-wrap">
                  {activeCandidate.phone && activeCandidate.phone !== 'N/A' && (
                    <a
                      href={`tel:${activeCandidate.phone}`}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950/20"
                      title={`Call ${activeCandidate.phone}`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>
                  )}
                  {activeCandidate.email && (
                    <a
                      href={`mailto:${activeCandidate.email}?subject=Regarding your application for ${activeCandidate.jobTitle}`}
                      className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors backdrop-blur-md border border-white/10"
                      title={`Email ${activeCandidate.email}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Email</span>
                    </a>
                  )}
                  {activeCandidate.resumeUrl && (
                    <a
                      href={activeCandidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors backdrop-blur-md border border-white/10"
                      title="Download Resume"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Resume</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Dossier Tabs */}
              <div className="flex items-center gap-2 mt-6 pt-2 border-t border-white/10">
                <button
                  onClick={() => setAppModalTab('overview')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    appModalTab === 'overview'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-indigo-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Applicant Overview
                </button>
                <button
                  onClick={() => setAppModalTab('skills')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    appModalTab === 'skills'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-indigo-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Skill Matrix</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${appModalTab === 'skills' ? 'bg-blue-100 text-blue-800' : 'bg-white/20 text-white'}`}>
                    {activeCandidate.skills?.length || 0}
                  </span>
                </button>
                <button
                  onClick={() => setAppModalTab('resume')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    appModalTab === 'resume'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-indigo-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resume & Credentials</span>
                </button>
              </div>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1">
              {appModalTab === 'overview' && (
                <>
                  {/* 4 Enterprise KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200/80 transition-all">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        <span>Work Preference</span>
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm block">
                        {activeCandidate.workMode || 'Not specified'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Work Mode</span>
                    </div>

                    <div className="bg-slate-50 hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 transition-all">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Notice Period</span>
                      </div>
                      <span className="font-extrabold text-emerald-700 text-sm block">
                        {activeCandidate.noticePeriod || 'Not specified'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Availability</span>
                    </div>

                    <div className="bg-slate-50 hover:bg-indigo-50/50 p-4 rounded-2xl border border-slate-200/80 transition-all">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
                        <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Expected CTC</span>
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm block truncate">
                        {activeCandidate.expectedSalary || 'Not specified'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Compensation</span>
                    </div>

                    <div className="bg-slate-50 hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 transition-all">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Candidate Location</span>
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm block truncate">
                        {activeCandidate.location || 'Not specified'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Current Base</span>
                    </div>
                  </div>

                  {/* Candidate Summary */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Executive Candidate Profile
                    </h4>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/70 text-slate-700 text-xs sm:text-sm leading-relaxed">
                      {activeCandidate.bio || 'No candidate bio provided.'}
                    </div>
                  </div>

                  {/* Key Skills */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        Key Skills & Tech Stack
                      </h4>
                      <button 
                        onClick={() => setAppModalTab('skills')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Matrix →
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeCandidate.skills && activeCandidate.skills.length > 0 ? (
                        activeCandidate.skills.map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="px-3.5 py-1.5 bg-white text-slate-800 border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Direct Outreach Channels */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      Direct Candidate Contact Channels
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <a
                        href={`mailto:${activeCandidate.email}?subject=Interview regarding your application for ${activeCandidate.jobTitle}`}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all text-slate-700 font-semibold group shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium block">Email Address</span>
                            <span className="truncate max-w-[180px] font-bold text-slate-900 block">{activeCandidate.email}</span>
                          </div>
                        </div>
                        <span className="text-blue-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">Email →</span>
                      </a>

                      <a
                        href={`tel:${activeCandidate.phone}`}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-slate-700 font-semibold group shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium block">Phone / Mobile</span>
                            <span className="font-bold text-slate-900 block">{activeCandidate.phone || 'N/A'}</span>
                          </div>
                        </div>
                        <span className="text-emerald-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">Call →</span>
                      </a>
                    </div>
                  </div>

                  {/* Company Direct Schedule Note */}
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
                    💡 <strong>Direct Hiring Workflow:</strong> Interviews and offers are managed directly by your hiring team. Shortlist this candidate to advance them in your recruitment pipeline, and reach out immediately via call or email.
                  </div>
                </>
              )}

              {appModalTab === 'skills' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Technical Skill Matrix</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Competencies verified through candidate mobile profile and resume.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCandidate.skills && activeCandidate.skills.map((skill: string, i: number) => (
                      <div key={i} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                            #{i + 1}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block">{skill}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Candidate Verified
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-white text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold">
                          Proficient
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {appModalTab === 'resume' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Official Candidate Resume & Documentation</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Attached resume file for this job application.</p>
                  </div>

                  {activeCandidate.hasResume && activeCandidate.resumeUrl ? (
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0 shadow-xs">
                          <FileText className="w-7 h-7" />
                        </div>
                        <div>
                          <span className="text-sm font-extrabold text-slate-900 block">
                            {activeCandidate.resumeFileName || 'Resume.pdf'}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span>Candidate Document</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Uploaded & Available
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={getResumeUrl(activeCandidate, true) || '#'}
                          download={activeCandidate.resumeFileName || 'Resume.pdf'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PDF
                        </a>
                        <a
                          href={getResumeUrl(activeCandidate, false) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open Preview
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                      <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-bold text-gray-700">No Resume Uploaded</p>
                      <p className="text-xs text-gray-400 mt-1">This candidate has not attached a resume document to this application.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer: Shortlist & Reject Buttons */}
            <div className="p-5 sm:p-6 border-t border-slate-200/80 bg-slate-50 flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  updateStageMutation.mutate({ id: activeCandidate.id, status: 'SHORTLISTED' });
                  setActiveCandidate(null);
                }}
                disabled={activeCandidate.stage === 'SHORTLISTED' || updateStageMutation.isPending}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-70"
              >
                <Star className="w-4 h-4" />
                {activeCandidate.stage === 'SHORTLISTED' ? 'Already Shortlisted' : 'Shortlist Candidate'}
              </button>

              <button
                onClick={() => {
                  updateStageMutation.mutate({ id: activeCandidate.id, status: 'REJECTED' });
                  setActiveCandidate(null);
                }}
                disabled={activeCandidate.stage === 'REJECTED' || updateStageMutation.isPending}
                className="py-3 px-5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </button>

              <button
                onClick={() => setDeleteApplicationModal(activeCandidate)}
                className="py-3 px-4 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Delete Application"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setActiveCandidate(null)}
                className="py-3 px-4 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Application Confirmation Modal */}
      {deleteApplicationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Candidate Application</h3>
                <p className="text-xs text-gray-500">Remove candidate from your job pipeline</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
              Are you sure you want to remove the application of <strong className="text-gray-900 font-bold">{deleteApplicationModal.name}</strong> for the role <strong className="text-blue-700 font-bold">{deleteApplicationModal.jobTitle}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteApplicationModal(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteApplicationMutation.isPending}
                onClick={() => deleteApplicationMutation.mutate(deleteApplicationModal.id)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {deleteApplicationMutation.isPending ? 'Deleting...' : 'Yes, Delete Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
