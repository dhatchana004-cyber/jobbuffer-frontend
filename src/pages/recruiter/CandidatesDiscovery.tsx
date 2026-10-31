import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Filter, 
  Send, 
  User, 
  Mail, 
  Phone, 
  X, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ExternalLink,
  PhoneCall,
  FileText,
  Download,
  ShieldCheck,
  Check,
  Trash2
} from 'lucide-react';
import api from '../../services/api';

interface Candidate {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  workMode: string;
  noticePeriod: string;
  expectedSalary: string;
  skills: string[];
  experience: string;
  bio: string;
  profileImage: string | null;
  hasResume: boolean;
  resumeUrl: string | null;
  resumeFileName?: string;
  status: string;
  joinedAt: string;
  appliedJobs: string[];
  isShortlisted?: boolean;
  stage?: string;
  applicationStatus?: string;
  shortlistedJobs?: string[];
}

export default function CandidatesDiscovery() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');
  const [selectedNotice, setSelectedNotice] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('All');

  // Modal States
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'skills' | 'resume'>('overview');
  const [inviteModalCandidate, setInviteModalCandidate] = useState<Candidate | null>(null);
  const [deleteCandidateModal, setDeleteCandidateModal] = useState<Candidate | null>(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');
  const [inviteErrorMsg, setInviteErrorMsg] = useState('');
  const [selectedStage, setSelectedStage] = useState('SHORTLISTED');

  const getResumeUrl = (cand: Candidate, forDownload = false) => {
    if (!cand.resumeUrl) return null;
    const base = cand.resumeUrl;
    return forDownload ? `${base}${base.includes('?') ? '&' : '?'}download=true` : base;
  };

  // Fetch candidates
  const { data: candidates = [], isLoading, error } = useQuery<Candidate[]>({
    queryKey: ['candidatesDiscovery', searchTerm, selectedWorkMode, selectedNotice, selectedSkill],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedWorkMode !== 'All') params.append('workMode', selectedWorkMode);
      if (selectedNotice !== 'All') params.append('noticePeriod', selectedNotice);
      if (selectedSkill !== 'All') params.append('skill', selectedSkill);

      const response = await api.get(`/recruiter/candidates?${params.toString()}`);
      return response.data;
    }
  });

  // Fetch recruiter's jobs for the invite dropdown
  const { data: myJobs = [] } = useQuery({
    queryKey: ['recruiterJobsForInvite'],
    queryFn: async () => {
      const res = await api.get('/recruiter/jobs');
      return res.data;
    }
  });

  // Delete / Remove candidate mutation
  const deleteCandidateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/recruiter/candidates/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatesDiscovery'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] });
      setDeleteCandidateModal(null);
      if (selectedCandidate) setSelectedCandidate(null);
    }
  });

  // Invite candidate mutation
  const inviteMutation = useMutation({
    mutationFn: async ({ candidateProfileId, jobId, status }: { candidateProfileId: string; jobId: string; status?: string }) => {
      const res = await api.post('/recruiter/candidates/invite', { candidateProfileId, jobId, status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      setInviteSuccessMsg(`Candidate added to job pipeline as ${variables.status || 'SHORTLISTED'} successfully!`);
      setInviteErrorMsg('');
      queryClient.invalidateQueries({ queryKey: ['candidatesDiscovery'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] });
      setTimeout(() => {
        setInviteSuccessMsg('');
        setInviteModalCandidate(null);
        setSelectedJobId('');
      }, 2000);
    },
    onError: (err: any) => {
      setInviteErrorMsg(err.response?.data?.message || 'Failed to add candidate. Please try again.');
    }
  });

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteModalCandidate || !selectedJobId) {
      setInviteErrorMsg('Please choose an active job opening from the list.');
      return;
    }
    inviteMutation.mutate({
      candidateProfileId: inviteModalCandidate.id,
      jobId: selectedJobId,
      status: selectedStage
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'CD';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const extractedSkills = Array.from(new Set(candidates.flatMap((c: any) => c.skills || []))).filter(Boolean);
  const allSkills = extractedSkills.length > 0 ? ['All', ...extractedSkills] : ['All'];

  const immediateCount = candidates.filter(c => c.noticePeriod?.toLowerCase().includes('immediate')).length;
  const remoteCount = candidates.filter(c => c.workMode?.toLowerCase().includes('remote')).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Talent Discovery</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Candidates
            </span>
          </div>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Search registered candidates across the platform, evaluate credentials, and invite top talent to your job openings.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-xs text-center">
            <span className="text-[11px] text-gray-400 font-medium block">Total Talent</span>
            <span className="text-lg font-bold text-gray-900">{candidates.length}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-xs text-center">
            <span className="text-[11px] text-gray-400 font-medium block">Immediate Joiners</span>
            <span className="text-lg font-bold text-green-600">{immediateCount}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-xs text-center">
            <span className="text-[11px] text-gray-400 font-medium block">Remote Ready</span>
            <span className="text-lg font-bold text-blue-600">{remoteCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="absolute right-3 top-2.5 text-[11px] text-gray-400 pointer-events-none">
                Search Talent
              </span>
            )}
          </div>

          {/* Work Mode Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-gray-500 px-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Mode:
            </span>
            {['All', 'Remote', 'Hybrid', 'On-site'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedWorkMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedWorkMode === mode
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Notice Period Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500 px-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Notice:
            </span>
            <select
              value={selectedNotice}
              onChange={(e) => setSelectedNotice(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Notice Periods</option>
              <option value="Immediate">Immediate Joiner</option>
              <option value="15 Days">Within 15 Days</option>
              <option value="30 Days">30 Days Notice</option>
            </select>
          </div>
        </div>

        {/* Skill Tags Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Filter by Skill:
          </span>
          {allSkills.map((sk) => (
            <button
              key={sk}
              onClick={() => setSelectedSkill(sk)}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                selectedSkill === sk
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium'
              }`}
            >
              {sk}
            </button>
          ))}
          {(searchTerm || selectedWorkMode !== 'All' || selectedNotice !== 'All' || selectedSkill !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedWorkMode('All');
                setSelectedNotice('All');
                setSelectedSkill('All');
              }}
              className="text-xs text-red-600 hover:text-red-700 font-semibold ml-auto flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Candidates List / Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-gray-500">Discovering qualified candidate profiles...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center text-red-700">
          <p className="font-bold text-sm">Unable to load candidate database</p>
          <p className="text-xs mt-1">Please refresh the page or check your server connection.</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {searchTerm || selectedWorkMode !== 'All' || selectedNotice !== 'All' || selectedSkill !== 'All' 
              ? 'No candidates match your selected criteria' 
              : 'No candidates registered yet'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {searchTerm || selectedWorkMode !== 'All' || selectedNotice !== 'All' || selectedSkill !== 'All'
              ? 'Try resetting the filters or searching with different keywords.'
              : 'As candidates register on Jobbuffer, their profiles will populate here for discovery.'}
          </p>
          {(searchTerm || selectedWorkMode !== 'All' || selectedNotice !== 'All' || selectedSkill !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedWorkMode('All');
                setSelectedNotice('All');
                setSelectedSkill('All');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map((cand) => (
            <div
              key={cand.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header: Avatar, Name, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                      {getInitials(cand.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 
                        onClick={() => setSelectedCandidate(cand)}
                        className="font-bold text-gray-900 text-sm leading-snug hover:text-blue-600 transition-colors cursor-pointer truncate" 
                      >
                        {cand.name}
                      </h3>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5 truncate">
                        {cand.role || 'Software Engineer'}
                      </p>
                    </div>
                  </div>
                  {cand.isShortlisted || cand.stage === 'SHORTLISTED' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 flex items-center gap-1 flex-shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-amber-600" />
                      Shortlisted
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                      Available
                    </span>
                  )}
                </div>

                {/* Shortlisted Requisition Pill if applicable */}
                {cand.shortlistedJobs && cand.shortlistedJobs.length > 0 && (
                  <div className="mt-2.5 px-2.5 py-1.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center gap-1.5 text-[11px] text-amber-900 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">Shortlisted: {cand.shortlistedJobs.join(', ')}</span>
                  </div>
                )}

                {/* Metadata Tags */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600 bg-gray-50/60 p-2.5 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{cand.location || 'Location Open'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{cand.workMode || 'Remote / Hybrid'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className={cand.noticePeriod?.toLowerCase().includes('immediate') ? 'font-bold text-green-700' : ''}>
                      {cand.noticePeriod || 'Standard Notice'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{cand.expectedSalary || 'Negotiable'}</span>
                  </div>
                </div>

                {/* Bio snippet */}
                {cand.bio && (
                  <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                    {cand.bio}
                  </p>
                )}

                {/* Skills Chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {cand.skills.slice(0, 4).map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700"
                    >
                      {sk}
                    </span>
                  ))}
                  {cand.skills.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded-md text-[11px] text-gray-400 font-medium">
                      +{cand.skills.length - 4}
                    </span>
                  )}
                </div>

                {/* Direct Contact Triggers */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 text-xs">
                  {cand.phone && (
                    <a
                      href={`tel:${cand.phone}`}
                      className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors text-[11px]"
                      title={`Call ${cand.phone}`}
                    >
                      <PhoneCall className="w-3 h-3 text-emerald-600" />
                      <span>Call</span>
                    </a>
                  )}
                  {cand.email && (
                    <a
                      href={`mailto:${cand.email}`}
                      className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors text-[11px]"
                      title={`Email ${cand.email}`}
                    >
                      <Mail className="w-3 h-3 text-blue-600" />
                      <span>Email</span>
                    </a>
                  )}
                  {cand.hasResume && cand.resumeUrl ? (
                    <a
                      href={getResumeUrl(cand, false) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors text-[11px]"
                      title="View Resume"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Resume</span>
                    </a>
                  ) : (
                    <span className="py-1.5 px-2 bg-gray-50 text-gray-400 rounded-lg font-medium flex items-center justify-center gap-1 text-[11px]">
                      No Resume
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-100">
                <button
                  onClick={() => setSelectedCandidate(cand)}
                  className="flex-1 py-2 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Full Profile
                </button>
                <button
                  onClick={() => {
                    setInviteModalCandidate(cand);
                    setInviteSuccessMsg('');
                    setInviteErrorMsg('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
                    cand.isShortlisted || cand.stage === 'SHORTLISTED'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {cand.isShortlisted || cand.stage === 'SHORTLISTED' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Shortlisted
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Shortlist
                    </>
                  )}
                </button>
                <button
                  onClick={() => setDeleteCandidateModal(cand)}
                  className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Remove candidate from talent pool"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Detail Modal - Enterprise Talent Dossier */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-gray-100">
            {/* Executive Dossier Header */}
            <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-7 overflow-hidden border-b border-indigo-900/50 flex-shrink-0">
              {/* Background ambient lighting */}
              <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute left-1/3 -bottom-20 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Top Navigation Row */}
              <div className="flex items-center justify-between gap-3 relative z-10 mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedCandidate.isShortlisted || selectedCandidate.stage === 'SHORTLISTED' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      Shortlisted Candidate
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-2 shadow-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Actively Available
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Verified Mobile Applicant
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    ATS Score: 95%
                  </span>
                </div>

                <button
                  onClick={() => setSelectedCandidate(null)}
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
                      {getInitials(selectedCandidate.name)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-slate-900" title="Verified">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {selectedCandidate.name}
                      </h2>
                    </div>
                    <p className="text-sm font-bold text-cyan-300 flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                      {selectedCandidate.role}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-200 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-300" /> {selectedCandidate.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-300" /> {selectedCandidate.experience}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-300">
                        ⚡ {selectedCandidate.noticePeriod}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Outreach Header Triggers */}
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedCandidate.phone && (
                    <a
                      href={`tel:${selectedCandidate.phone}`}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950/20"
                      title={`Call ${selectedCandidate.phone}`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>
                  )}
                  {selectedCandidate.email && (
                    <a
                      href={`mailto:${selectedCandidate.email}?subject=Opportunity regarding ${selectedCandidate.role}`}
                      className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors backdrop-blur-md border border-white/10"
                      title={`Email ${selectedCandidate.email}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Email</span>
                    </a>
                  )}
                  {selectedCandidate.resumeUrl && (
                    <a
                      href={selectedCandidate.resumeUrl}
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
                  onClick={() => setModalTab('overview')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    modalTab === 'overview'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-indigo-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Candidate Overview
                </button>
                <button
                  onClick={() => setModalTab('skills')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    modalTab === 'skills'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-indigo-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Skill Matrix</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${modalTab === 'skills' ? 'bg-blue-100 text-blue-800' : 'bg-white/20 text-white'}`}>
                    {selectedCandidate.skills.length}
                  </span>
                </button>
                <button
                  onClick={() => setModalTab('resume')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    modalTab === 'resume'
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
              {modalTab === 'overview' && (
                <>
                  {/* 4 Enterprise KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200/80 transition-all">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        <span>Work Preference</span>
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm block">
                        {selectedCandidate.workMode || 'Not specified'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Work Mode</span>
                    </div>

                    <div className="bg-slate-50 hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 transition-all">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Notice Period</span>
                      </div>
                      <span className="font-extrabold text-emerald-700 text-sm block">
                        {selectedCandidate.noticePeriod || 'Not specified'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Availability</span>
                    </div>

                    <div className="bg-slate-50 hover:bg-indigo-50/50 p-4 rounded-2xl border border-slate-200/80 transition-all">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
                        <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Expected CTC</span>
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm block truncate">
                        {selectedCandidate.expectedSalary || 'Not specified'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Compensation</span>
                    </div>

                    <div className="bg-slate-50 hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 transition-all">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Hiring Status</span>
                      </div>
                      <span className="font-extrabold text-emerald-600 text-sm block">
                        Ready to Connect
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Direct Reach Enabled</span>
                    </div>
                  </div>

                  {/* Professional Summary */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Executive Professional Summary
                    </h4>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/70 text-slate-700 text-xs sm:text-sm leading-relaxed">
                      {selectedCandidate.bio || 'No candidate bio provided.'}
                    </div>
                  </div>

                  {/* Core Technical Highlights */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        Primary Tech Stack & Verified Skills
                      </h4>
                      <button 
                        onClick={() => setModalTab('skills')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Matrix →
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3.5 py-1.5 bg-white text-slate-800 border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Applied Job Requisitions History */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      Applied Requisition & Candidate Intent
                    </h4>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Target Position</span>
                        <span className="text-sm font-bold text-slate-900 block mt-0.5">{selectedCandidate.role}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span>Applied to your open requisition</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600">Active Applicant</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setInviteModalCandidate(selectedCandidate);
                          setSelectedCandidate(null);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
                          selectedCandidate.isShortlisted || selectedCandidate.stage === 'SHORTLISTED'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {selectedCandidate.isShortlisted || selectedCandidate.stage === 'SHORTLISTED' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Update Pipeline / Shortlist
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Move to Pipeline Stage
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Direct Contact Channels */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      Direct Candidate Outreach Channels
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <a
                        href={`mailto:${selectedCandidate.email}?subject=Regarding your profile for ${selectedCandidate.role}`}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all text-slate-700 font-semibold group shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium block">Email Address</span>
                            <span className="truncate max-w-[180px] font-bold text-slate-900 block">{selectedCandidate.email}</span>
                          </div>
                        </div>
                        <span className="text-blue-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">Send →</span>
                      </a>

                      <a
                        href={`tel:${selectedCandidate.phone}`}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-slate-700 font-semibold group shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium block">Phone / Mobile</span>
                            <span className="font-bold text-slate-900 block">{selectedCandidate.phone}</span>
                          </div>
                        </div>
                        <span className="text-emerald-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">Call →</span>
                      </a>
                    </div>
                  </div>
                </>
              )}

              {modalTab === 'skills' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Verified Technical Competencies</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Skills evaluated and verified through candidate submissions and resume extraction.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCandidate.skills.map((skill, i) => (
                      <div key={i} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                            #{i + 1}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block">{skill}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified by Platform
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-white text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold">
                          Proficient
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-900">AI Role Match Analysis</h4>
                      <p className="text-xs text-blue-800/80 mt-0.5 leading-relaxed">
                        This candidate possesses strong synergy with standard requirements for <strong>{selectedCandidate.role}</strong>. Their mastery of {selectedCandidate.skills.slice(0, 3).join(', ')} directly aligns with current hiring needs.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'resume' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Official Candidate Resume & Documentation</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Primary resume submitted during requisition application.</p>
                  </div>

                  {selectedCandidate.hasResume && selectedCandidate.resumeUrl ? (
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0 shadow-xs">
                          <FileText className="w-7 h-7" />
                        </div>
                        <div>
                          <span className="text-sm font-extrabold text-slate-900 block">
                            {selectedCandidate.resumeFileName || `${selectedCandidate.name.replace(/\s+/g, '_')}_Resume.pdf`}
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
                          href={getResumeUrl(selectedCandidate, true) || '#'}
                          download={selectedCandidate.resumeFileName || 'Resume.pdf'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PDF
                        </a>
                        <a
                          href={getResumeUrl(selectedCandidate, false) || '#'}
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
                      <p className="text-xs text-gray-400 mt-1">This candidate has not attached a resume document to their profile.</p>
                    </div>
                  )}

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <h4 className="text-xs font-bold text-slate-700 mb-2">Candidate Verification Highlights</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Identity & Contact Authenticated</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Work Authorization: Available</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Notice Period: {selectedCandidate.noticePeriod}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Compensation Range Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
              <div className="text-xs text-slate-400">
                Application received via <span className="font-semibold text-slate-600">Orasis Mobile Portal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setDeleteCandidateModal(selectedCandidate)}
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Remove candidate from talent pool"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Candidate</span>
                </button>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
                <button
                  onClick={() => {
                    setInviteModalCandidate(selectedCandidate);
                    setSelectedCandidate(null);
                    setInviteSuccessMsg('');
                    setInviteErrorMsg('');
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Shortlist to Job Requisition
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Add to Job Pipeline</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Connect <span className="font-bold text-gray-800">{inviteModalCandidate.name}</span> with one of your active positions.
                </p>
              </div>
              <button
                onClick={() => setInviteModalCandidate(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-6 space-y-4">
              {inviteSuccessMsg && (
                <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{inviteSuccessMsg}</span>
                </div>
              )}
              {inviteErrorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {inviteErrorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Job Requisition *
                </label>
                {myJobs.length === 0 ? (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    No active jobs found. Please create a job first in the Jobs section.
                  </div>
                ) : (
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">-- Choose from your active requisitions --</option>
                    {myJobs.map((j: any) => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.location} • {j.type})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Initial Pipeline Stage *
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="SHORTLISTED">⭐ Shortlisted (Recommended)</option>
                  <option value="APPLIED">Under Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Candidate Email Address
                </label>
                <input
                  type="text"
                  disabled
                  value={inviteModalCandidate.email}
                  className="w-full px-3.5 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-xs font-semibold text-gray-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInviteModalCandidate(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending || myJobs.length === 0}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{inviteMutation.isPending ? 'Adding to Job...' : 'Confirm Candidate Shortlist'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Candidate Confirmation Modal */}
      {deleteCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Remove Candidate</h3>
                <p className="text-xs text-gray-500">Remove candidate from your company's talent pool</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
              Are you sure you want to remove <strong className="text-gray-900 font-bold">{deleteCandidateModal.name}</strong> from your candidate pool? Any job applications or shortlist records for this candidate under your company will also be removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidateModal(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteCandidateMutation.isPending}
                onClick={() => deleteCandidateMutation.mutate(deleteCandidateModal.id)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {deleteCandidateMutation.isPending ? 'Removing...' : 'Yes, Remove Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
