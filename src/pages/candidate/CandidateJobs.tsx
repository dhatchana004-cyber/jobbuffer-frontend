import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  Briefcase,
  Building,
  Clock,
  ExternalLink,
  Zap,
  RotateCw,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { authService } from '../../services/auth';
import { Link } from 'react-router-dom';

const INDIAN_CITIES = [
  'All India',
  'Bengaluru',
  'Chennai',
  'Hyderabad',
  'Mumbai',
  'Pune',
  'Delhi NCR'
];

export default function CandidateJobs() {
  const currentUser = authService.getCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All India');
  const [selectedSource, setSelectedSource] = useState<'ALL' | 'JOBVETTA' | 'INTERNAL'>('ALL');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applyModalJob, setApplyModalJob] = useState<any | null>(null);
  const [applySuccessMsg, setApplySuccessMsg] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Pagination state: Pages 1, 2, 3, 4 with 9 jobs per page
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Form for internal application
  const [candidateName, setCandidateName] = useState(currentUser?.name || 'Dhatchana Moorthy');
  const [candidateEmail, setCandidateEmail] = useState(currentUser?.email || 'dhatchana004@gmail.com');
  const [candidatePhone, setCandidatePhone] = useState(currentUser?.phone || '+91 9876543210');

  // Locally cached applied IDs for instant persistent UI feedback
  const storageUserKey = `candidate_applied_jobs_${currentUser?.id || currentUser?.email || 'guest'}`;
  const [localAppliedIds, setLocalAppliedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageUserKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reset pagination to Page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCity, selectedSource, urgentOnly]);

  // Unified Jobs Query with 30-min Cache Support
  const { data: jobs = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['candidateJobs', searchTerm, selectedCity, selectedSource, urgentOnly],
    queryFn: async () => {
      const params: any = {};
      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (selectedCity !== 'All India') params.location = selectedCity;
      if (selectedSource !== 'ALL') params.source = selectedSource;
      if (urgentOnly) params.urgent = 'true';

      const res = await api.get('/jobs', { params });
      return res.data;
    },
    staleTime: 30 * 60 * 1000 // 30 mins frontend cache
  });

  // Fetch actual application status from PostgreSQL database for the logged-in candidate
  const { data: dbApplications = [], refetch: refetchApplications } = useQuery({
    queryKey: ['candidateDbApplications', currentUser?.id, currentUser?.email],
    queryFn: async () => {
      try {
        const res = await api.get('/applications/my', {
          params: { userId: currentUser?.id, email: currentUser?.email }
        });
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        return list;
      } catch {
        return [];
      }
    },
    refetchOnWindowFocus: true
  });

  // Combine database applications with local cache to guarantee 100% persistence across pagination
  const appliedJobIdSet = new Set<string>();
  localAppliedIds.forEach(id => appliedJobIdSet.add(String(id)));
  dbApplications.forEach((app: any) => {
    if (app.jobId) {
      appliedJobIdSet.add(String(app.jobId));
      appliedJobIdSet.add(String(app.jobId).replace(/^jobvetta_/, ''));
    }
    if (app.id) appliedJobIdSet.add(String(app.id));
  });

  const checkIsApplied = (jobId: string) => {
    if (!jobId) return false;
    const str = String(jobId);
    return appliedJobIdSet.has(str) ||
      appliedJobIdSet.has(str.replace(/^jobvetta_/, '')) ||
      appliedJobIdSet.has(`jobvetta_${str}`);
  };

  const markJobAsApplied = (jobId: string) => {
    const str = String(jobId);
    setLocalAppliedIds(prev => {
      const next = Array.from(new Set([...prev, str]));
      try {
        localStorage.setItem(storageUserKey, JSON.stringify(next));
      } catch {}
      return next;
    });
    refetchApplications();
  };

  // Cache Status Query for transparency
  const { data: cacheStatus } = useQuery({
    queryKey: ['jobvettaCacheStatus'],
    queryFn: async () => {
      const res = await api.get('/jobs/jobvetta/cache-status');
      return res.data;
    },
    refetchInterval: 60000 // Refresh telemetry every minute
  });

  // Handle Apply Now Click
  const handleApplyClick = async (job: any) => {
    if (checkIsApplied(job.id)) {
      alert('You have already applied for this opening. The recruiter has your application.');
      return;
    }

    if (job.isExternal && job.externalUrl) {
      // 1. Submit application to backend so it is permanently persisted in PostgreSQL
      try {
        await api.post(`/jobs/${job.id}/apply`, {
          userId: currentUser?.id,
          email: currentUser?.email || candidateEmail,
          fullName: candidateName,
          phone: candidatePhone
        });
      } catch (e) {
        // Fallback to /applications
        try {
          await api.post('/applications', {
            jobId: job.id,
            userId: currentUser?.id,
            email: currentUser?.email || candidateEmail,
            fullName: candidateName,
            phone: candidatePhone
          });
        } catch {}
      }

      markJobAsApplied(job.id);

      // 2. Open official external employer website in a new tab
      window.open(job.externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Internal job application modal
      setApplyModalJob(job);
    }
  };

  const handleInternalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalJob) return;

    if (checkIsApplied(applyModalJob.id)) {
      alert('You have already applied for this opening.');
      setApplyModalJob(null);
      return;
    }

    setIsApplying(true);
    try {
      await api.post(`/jobs/${applyModalJob.id}/apply`, {
        userId: currentUser?.id,
        name: candidateName,
        fullName: candidateName,
        email: candidateEmail,
        phone: candidatePhone
      });

      markJobAsApplied(applyModalJob.id);
      setApplySuccessMsg(`Application successfully submitted for ${applyModalJob.title}!`);
      setTimeout(() => {
        setApplySuccessMsg('');
        setApplyModalJob(null);
      }, 2500);
    } catch (err) {
      alert('Error submitting application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const internalCount = jobs.filter((j: any) => !j.isExternal).length;
  const externalCount = jobs.filter((j: any) => j.isExternal).length;
  const urgentCount = jobs.filter((j: any) => Boolean(j.isUrgent)).length;

  // Pagination calculation across 1st, 2nd, 3rd, 4th pages
  const totalPages = Math.max(1, Math.min(4, Math.ceil(jobs.length / ITEMS_PER_PAGE)));
  const paginatedJobs = jobs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src="/logo.png" alt="JoBuffer" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white block">
                  JoBuffer <span className="text-blue-400 font-semibold text-xs tracking-wider uppercase ml-1 px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-500/30">India Jobs</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1 font-medium">Candidate Job Portal & Aggregator</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Cache & Freshness Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/60 text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-slate-200">Jobvetta 30m Auto-Cache</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-bold">{cacheStatus?.rateLimitRemaining ?? 50} API quota left</span>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
              title="Refresh jobs from API / Cache"
            >
              <RotateCw className={`w-3.5 h-3.5 text-blue-400 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-sm transition-all"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-700">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Integrated with Jobvetta API — Live Openings Across India</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Find High-Impact Tech Jobs <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
              Across Major Tech Hubs in India
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Access direct openings from JoBuffer employer partners and thousands of live career portal vacancies via Jobvetta. Apply directly to official employer portals in one click.
          </p>

          {/* Unified Search Input Box */}
          <div className="bg-white p-2.5 rounded-2xl shadow-2xl border border-slate-200 flex flex-col md:flex-row items-stretch gap-2 max-w-3xl mx-auto">
            <div className="flex-1 relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Job title, skills (Python, React, Data Engineer, Java)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="w-px h-8 bg-slate-200 hidden md:block self-center"></div>

            <div className="relative flex items-center md:w-56">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-11 pr-8 py-3 rounded-xl text-slate-900 bg-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none cursor-pointer"
              >
                {INDIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => refetch()}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Search Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Location Quick Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
            <span className="text-xs text-slate-400 font-semibold mr-1">Top Cities:</span>
            {INDIAN_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                  selectedCity === city
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Controls & Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Available Jobs ({jobs.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing verified opportunities matching your criteria across India
            </p>
          </div>

          {/* Source Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <button
              onClick={() => setSelectedSource('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSource === 'ALL'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Openings ({jobs.length})
            </button>
            <button
              onClick={() => setSelectedSource('JOBVETTA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedSource === 'JOBVETTA'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Jobvetta India ({externalCount})</span>
            </button>
            <button
              onClick={() => setSelectedSource('INTERNAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedSource === 'INTERNAL'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>JoBuffer Direct ({internalCount})</span>
            </button>
            <button
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                urgentOnly
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current text-rose-500" />
              <span>Urgent Hiring ({urgentCount})</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <RotateCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Connecting to Jobvetta India Index & Local DB...</p>
            <p className="text-xs text-slate-400 mt-1">Applying 30-minute caching & freshness validation</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && jobs.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No vacancies found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              We couldn't find openings matching "{searchTerm}" in {selectedCity}. Try searching for a broader skill like "Developer", "Engineer", or select "All India".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('All India');
                setSelectedSource('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Job Cards Grid */}
        {!isLoading && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedJobs.map((job: any) => {
              const isJobvetta = job.isExternal;
              const companyName = job.company?.name || 'Top Employer';
              const location = job.location || 'India';
              const daysAgo = job.daysAgo ?? 1;
              const isApplied = checkIsApplied(job.id);

              return (
                <div
                  key={job.id}
                  className={`bg-white rounded-2xl p-5 border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group ${
                    isApplied ? 'border-emerald-300 ring-1 ring-emerald-400/20' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isApplied && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Applied
                          </span>
                        )}

                        {Boolean(job.isUrgent) && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs">
                            <Flame className="w-3.5 h-3.5 fill-current text-yellow-200" />
                            Urgent Hiring
                          </span>
                        )}

                        {isJobvetta ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                            Jobvetta India
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            JoBuffer Direct
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                        </span>
                      </div>

                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                        {job.workMode || 'Hybrid'}
                      </span>
                    </div>

                    {/* Job Title */}
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                      {job.title}
                    </h3>

                    {/* Company and Location */}
                    <div className="flex items-center gap-3 text-xs text-slate-600 mb-3">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        {job.company?.logo ? (
                          <img
                            src={job.company.logo}
                            alt={companyName}
                            className="w-4 h-4 rounded object-contain"
                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        {companyName}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1 truncate text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{location}</span>
                      </span>
                    </div>

                    {/* Snippet */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {job.description || job.responsibilities}
                    </p>

                    {/* Compensation or Type */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 py-2 border-t border-slate-100 mb-4">
                      <span className="text-emerald-700 font-bold">
                        {job.salaryMin && job.salaryMax
                          ? `₹${(job.salaryMin / 100000).toFixed(1)}L - ₹${(job.salaryMax / 100000).toFixed(1)}L PA`
                          : 'Competitive Industry CTC'}
                      </span>
                      <span className="text-slate-400 text-[11px] font-medium">
                        {job.experienceMin ? `${job.experienceMin}+ yrs exp` : 'Any Experience'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center"
                    >
                      View Details
                    </button>

                    {isApplied ? (
                      <button
                        disabled
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 transition-all flex items-center justify-center gap-1.5 cursor-default shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Applied ✓</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApplyClick(job)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                          isJobvetta
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        <span>{isJobvetta ? 'Apply Now' : 'Quick Apply'}</span>
                        {isJobvetta ? (
                          <ExternalLink className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4-Page Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 px-4 py-4 mt-8 sm:px-6 bg-white rounded-2xl shadow-2xs gap-4">
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-600">
                Showing page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span> ({jobs.length} total jobs)
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              {[1, 2, 3, 4].filter(p => p <= totalPages).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Job Details Overview */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {Boolean(selectedJob.isUrgent) && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-current text-yellow-200" />
                      Urgent Hiring
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedJob.isExternal ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {selectedJob.isExternal ? 'Jobvetta External Job' : 'JoBuffer Direct Opening'}
                  </span>
                  <span className="text-xs text-slate-400">• Posted {selectedJob.daysAgo || 1} days ago</span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{selectedJob.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {selectedJob.company?.logo && (
                    <img
                      src={selectedJob.company.logo}
                      alt={selectedJob.company.name}
                      className="w-5 h-5 rounded object-contain border border-slate-200 p-0.5"
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                  )}
                  <p className="text-sm font-bold text-blue-600">{selectedJob.company?.name}</p>
                  {selectedJob.company?.website && (
                    <a
                      href={selectedJob.company.website.startsWith('http') ? selectedJob.company.website : `https://${selectedJob.company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      • Website
                    </a>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-5 space-y-5 text-sm text-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Location</span>
                  <span className="font-bold text-slate-800 text-xs">{selectedJob.location}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Work Mode</span>
                  <span className="font-bold text-slate-800 text-xs">{selectedJob.workMode || 'Hybrid'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Experience</span>
                  <span className="font-bold text-slate-800 text-xs">{selectedJob.experienceMin ? `${selectedJob.experienceMin}+ Yrs` : 'Fresher / Any'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Compensation</span>
                  <span className="font-bold text-emerald-700 text-xs">
                    {selectedJob.salaryMin && selectedJob.salaryMax
                      ? `₹${(selectedJob.salaryMin / 100000).toFixed(1)}L - ₹${(selectedJob.salaryMax / 100000).toFixed(1)}L`
                      : 'Best in Industry'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Role Overview</h4>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                  {selectedJob.description}
                </p>
              </div>

              {selectedJob.responsibilities && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Key Responsibilities</h4>
                  <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                    {selectedJob.responsibilities}
                  </p>
                </div>
              )}

              {selectedJob.requirements && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Candidate Requirements</h4>
                  <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                    {selectedJob.requirements}
                  </p>
                </div>
              )}

              {selectedJob.isExternal && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Original Employer Posting:</span>
                    <p className="text-blue-700 text-[11px] mt-0.5">
                      This opening was aggregated via Jobvetta directly from {selectedJob.company?.name}'s official career site. Clicking Apply will redirect you to their verified application page.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              {checkIsApplied(selectedJob.id) ? (
                <button
                  disabled
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 shadow-sm flex items-center gap-1.5 cursor-default"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Applied to this Job ✓</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const jobToApply = selectedJob;
                    setSelectedJob(null);
                    handleApplyClick(jobToApply);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span>{selectedJob.isExternal ? 'Apply on Company Site' : 'Submit Application'}</span>
                  {selectedJob.isExternal ? <ExternalLink className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Internal Job Application */}
      {applyModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Apply for {applyModalJob.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Direct Application to {applyModalJob.company?.name} via JoBuffer
            </p>

            {applySuccessMsg ? (
              <div className="py-8 text-center text-emerald-600 font-bold text-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                {applySuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleInternalSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={candidatePhone}
                    onChange={(e) => setCandidatePhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyModalJob(null)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isApplying ? 'Submitting...' : 'Confirm & Apply'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
