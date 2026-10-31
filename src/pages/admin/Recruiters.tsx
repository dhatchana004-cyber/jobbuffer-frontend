import { useState } from 'react';
import { 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  Briefcase, 
  ShieldCheck, 
  ShieldOff, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export default function RecruitersList() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRecruiter, setSelectedRecruiter] = useState<any | null>(null);
  const [resetPasswordModal, setResetPasswordModal] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteRecruiterModal, setDeleteRecruiterModal] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const deleteRecruiterMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/recruiters/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRecruiters'] });
      setDeleteRecruiterModal(null);
      if (selectedRecruiter) setSelectedRecruiter(null);
      setActionSuccess('Recruiter account and job postings deleted successfully.');
      setTimeout(() => setActionSuccess(''), 3000);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'Failed to delete recruiter.');
      setTimeout(() => setActionError(''), 3000);
    }
  });

  const { data: recruiters = [], isLoading, error } = useQuery({
    queryKey: ['adminRecruiters'],
    queryFn: async () => {
      const response = await api.get('/admin/recruiters');
      return response.data;
    }
  });

  // Suspend/Activate mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/admin/users/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRecruiters'] });
      setActionSuccess('Recruiter account status updated successfully.');
      setTimeout(() => setActionSuccess(''), 3000);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'Failed to update recruiter status.');
      setTimeout(() => setActionError(''), 3000);
    }
  });

  // Reset Password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      const res = await api.post(`/admin/recruiters/${id}/reset-password`, { newPassword });
      return res.data;
    },
    onSuccess: (data) => {
      setActionSuccess(data.message || 'Recruiter password updated successfully.');
      setResetPasswordModal(null);
      setNewPassword('');
      setTimeout(() => setActionSuccess(''), 4000);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'Failed to reset password.');
      setTimeout(() => setActionError(''), 4000);
    }
  });

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let generated = '';
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setShowPassword(true);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-r-transparent"></div>
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading recruiter accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-2xl">
        <p className="font-bold text-sm">Failed to load recruiter accounts</p>
        <p className="text-xs text-red-500 mt-1">Please check your connection.</p>
      </div>
    );
  }

  const recList = Array.isArray(recruiters) ? recruiters : [];

  const filteredRecruiters = recList.filter((r: any) => {
    const matchesSearch = !searchTerm ||
      (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.company && r.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = recList.length;
  const activeCount = recList.filter((r: any) => r.status === 'ACTIVE').length;
  const suspendedCount = recList.filter((r: any) => r.status === 'SUSPENDED').length;
  const totalJobsCount = recList.reduce((acc: number, r: any) => acc + (r.jobsPosted || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Organization Registry</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            Supervise hiring managers, company profiles, job requisitions, and account credentials.
          </p>
        </div>

        {/* Feedback Banners */}
        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-gray-100 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Recruiters</p>
          <p className="text-xl font-black text-gray-900 mt-1">{totalCount}</p>
          <span className="text-[10px] text-gray-400">Registered accounts</span>
        </Card>

        <Card className="p-4 border border-gray-100 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Active Recruiters</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{activeCount}</p>
          <span className="text-[10px] text-emerald-600">Can post jobs & hire</span>
        </Card>

        <Card className="p-4 border border-gray-100 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Suspended</p>
          <p className="text-xl font-black text-rose-600 mt-1">{suspendedCount}</p>
          <span className="text-[10px] text-rose-500">Access restricted</span>
        </Card>

        <Card className="p-4 border border-gray-100 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Live Job Requisitions</p>
          <p className="text-xl font-black text-blue-600 mt-1">{totalJobsCount}</p>
          <span className="text-[10px] text-blue-500">Across all organizations</span>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border border-gray-100 shadow-2xs overflow-hidden">
        {/* Search & Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recruiter name, company, or email"
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses ({totalCount})</option>
              <option value="ACTIVE">Active Recruiters ({activeCount})</option>
              <option value="SUSPENDED">Suspended Recruiters ({suspendedCount})</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-3.5">Recruiter Profile</th>
                <th className="px-6 py-3.5">Associated Company</th>
                <th className="px-6 py-3.5">Contact Channels</th>
                <th className="px-6 py-3.5 text-center">Jobs Live</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions & Security</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredRecruiters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No recruiter accounts found.
                  </td>
                </tr>
              ) : (
                filteredRecruiters.map((r: any) => {
                  const isActive = r.status === 'ACTIVE';
                  const targetUserId = r.userId || r.id;

                  return (
                    <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                            {r.name ? r.name.slice(0, 2).toUpperCase() : 'RC'}
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedRecruiter(r)}
                              className="font-bold text-gray-900 text-xs hover:text-blue-600 hover:underline text-left"
                            >
                              {r.name}
                            </button>
                            <p className="text-[11px] text-gray-500 mt-0.5">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-gray-800">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>{r.company || 'Direct Recruiter'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        <div className="space-y-0.5">
                          {r.phone && r.phone !== 'N/A' && (
                            <a href={`tel:${r.phone}`} className="flex items-center gap-1 hover:text-green-600 font-medium">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{r.phone}</span>
                            </a>
                          )}
                          <a href={`mailto:${r.email}`} className="flex items-center gap-1 hover:text-blue-600 font-medium">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{r.email}</span>
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg font-bold text-[11px]">
                          <Briefcase className="w-3 h-3" />
                          {r.jobsPosted || r.jobs?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isActive ? 'Active' : r.status || 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Full Details Button */}
                          <button
                            onClick={() => setSelectedRecruiter(r)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors"
                            title="View Full Recruiter Dossier"
                          >
                            Details
                          </button>

                          {/* Reset Password Button */}
                          <button
                            onClick={() => {
                              setResetPasswordModal(r);
                              setNewPassword('');
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                            title="Change or Reset Recruiter Password"
                          >
                            <KeyRound className="w-3 h-3 text-blue-600" />
                            <span>Password</span>
                          </button>

                          {/* Suspend / Activate Button */}
                          {isActive ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Suspend recruiter account for ${r.name}?`)) {
                                  statusMutation.mutate({ id: targetUserId, status: 'SUSPENDED' });
                                }
                              }}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                              title="Suspend Recruiter"
                            >
                              <ShieldOff className="w-3 h-3 text-amber-600" />
                              <span>Suspend</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (window.confirm(`Activate recruiter account for ${r.name}?`)) {
                                  statusMutation.mutate({ id: targetUserId, status: 'ACTIVE' });
                                }
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                              title="Activate Recruiter"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Activate</span>
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteRecruiterModal(r)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                            title="Delete Recruiter Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recruiter Full Details Dossier Modal */}
      {selectedRecruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-7 relative overflow-hidden flex-shrink-0">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg ring-2 ring-white/10">
                    {selectedRecruiter.name ? selectedRecruiter.name.slice(0, 2).toUpperCase() : 'RC'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedRecruiter.name}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedRecruiter.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {selectedRecruiter.status}
                      </span>
                    </div>
                    <p className="text-xs text-blue-200 mt-1 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-blue-300" />
                      <span>{selectedRecruiter.company}</span>
                      <span>•</span>
                      <span>{selectedRecruiter.designation}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRecruiter(null)}
                  className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Account & Contact Credentials Overview */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Account & Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Email Address</span>
                    <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{selectedRecruiter.email}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone Number</span>
                    <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{selectedRecruiter.phone || 'Not Provided'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Account Created</span>
                    <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{selectedRecruiter.applied}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Account Security</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-semibold text-emerald-600">Password Encrypted</span>
                      <button
                        onClick={() => {
                          setResetPasswordModal(selectedRecruiter);
                          setNewPassword('');
                        }}
                        className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-[10px] font-bold hover:bg-blue-700 transition"
                      >
                        Reset Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Details */}
              {selectedRecruiter.companyDetails && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Organization Profile
                  </h4>
                  <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-2xl space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Company Name</span>
                        <span className="font-bold text-slate-900 text-xs block mt-0.5">{selectedRecruiter.companyDetails.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Industry</span>
                        <span className="font-medium text-slate-800 text-xs block mt-0.5">{selectedRecruiter.companyDetails.industry || 'Technology & Software'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Company Size</span>
                        <span className="font-medium text-slate-800 text-xs block mt-0.5">{selectedRecruiter.companyDetails.size || '10-50 Employees'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Headquarters</span>
                        <span className="font-medium text-slate-800 text-xs block mt-0.5">{selectedRecruiter.companyDetails.headquarters || 'India'}</span>
                      </div>
                      {selectedRecruiter.companyDetails.website && (
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Website</span>
                          <a
                            href={selectedRecruiter.companyDetails.website.startsWith('http') ? selectedRecruiter.companyDetails.website : `https://${selectedRecruiter.companyDetails.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-blue-600 hover:underline text-xs flex items-center gap-1 mt-0.5"
                          >
                            <span>Visit Site</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                    {selectedRecruiter.companyDetails.description && (
                      <p className="text-slate-600 text-xs pt-2 border-t border-blue-100/70 leading-relaxed">
                        {selectedRecruiter.companyDetails.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Jobs Posted List */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Jobs Posted ({selectedRecruiter.jobs?.length || 0})
                </h4>
                {(!selectedRecruiter.jobs || selectedRecruiter.jobs.length === 0) ? (
                  <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl text-center text-slate-400">
                    No jobs posted yet by this recruiter.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedRecruiter.jobs.map((job: any) => (
                      <div
                        key={job.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-blue-300 transition"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{job.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>{job.location || 'Remote'}</span>
                            <span>•</span>
                            <span>{job.type || 'Full-time'}</span>
                            <span>•</span>
                            <span>Posted {job.created}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-lg text-[10px]">
                            {job.applications || 0} Applicants
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            job.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setResetPasswordModal(selectedRecruiter);
                  setNewPassword('');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Reset Recruiter Password</span>
              </button>

              <button
                onClick={() => setSelectedRecruiter(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 rounded-xl font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reset Recruiter Password Modal */}
      {resetPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Reset Recruiter Password</h3>
                  <p className="text-xs text-gray-500">For {resetPasswordModal.name} ({resetPasswordModal.email})</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setResetPasswordModal(null);
                  setNewPassword('');
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              As an Administrator, you can set a new password for this recruiter account. The recruiter can immediately sign in with this new password.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPassword || newPassword.length < 6) {
                  setActionError('Password must be at least 6 characters long');
                  return;
                }
                resetPasswordMutation.mutate({
                  id: resetPasswordModal.id,
                  newPassword
                });
              }}
              className="space-y-4 pt-1"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    New Password *
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetPasswordModal(null);
                    setNewPassword('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending || !newPassword}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Recruiter Modal */}
      {deleteRecruiterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Recruiter Account</h3>
                <p className="text-xs text-gray-500">Irreversible administrative action</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
              Are you sure you want to delete <strong className="text-gray-900 font-bold">{deleteRecruiterModal.name}</strong> from <strong className="text-blue-700 font-bold">{deleteRecruiterModal.company}</strong>? All their posted job requisitions and candidate shortlist records will be permanently removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteRecruiterModal(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteRecruiterMutation.isPending}
                onClick={() => deleteRecruiterMutation.mutate(deleteRecruiterModal.id)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {deleteRecruiterMutation.isPending ? 'Deleting...' : 'Yes, Delete Recruiter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
