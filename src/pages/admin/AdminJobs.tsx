import { useState } from 'react';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Briefcase, 
  Building, 
  MapPin, 
  Users, 
  X, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export default function AdminJobs() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['adminJobs'],
    queryFn: async () => {
      const response = await api.get('/admin/jobs');
      return response.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.patch(`/admin/jobs/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setActionSuccess(`Requisition status updated to ${variables.status} successfully.`);
      setTimeout(() => setActionSuccess(''), 3000);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'Failed to update job status.');
      setTimeout(() => setActionError(''), 3000);
    }
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-r-transparent"></div>
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading platform job postings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-2xl">
        <p className="font-bold text-sm">Failed to load platform job requisitions</p>
        <p className="text-xs text-red-500 mt-1">Please verify connection.</p>
      </div>
    );
  }

  const jobList = Array.isArray(jobs) ? jobs : [];

  const filteredJobs = jobList.filter((j: any) => {
    const matchesSearch = !searchTerm ||
      (j.title && j.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (j.company && j.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (j.location && j.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = jobList.length;
  const publishedCount = jobList.filter((j: any) => j.status === 'PUBLISHED').length;
  const draftCount = jobList.filter((j: any) => j.status === 'DRAFT').length;
  const closedCount = jobList.filter((j: any) => j.status === 'CLOSED' || j.status === 'REJECTED').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Live / Published</span>;
      case 'DRAFT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Pending Review</span>;
      case 'CLOSED':
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">Closed / Offline</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Job Requisitions</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            Audit, verify compliance, approve drafts, or take down non-compliant employment postings.
          </p>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-2.5">
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold block">Total Jobs</span>
            <span className="text-base font-black text-gray-900">{totalCount}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold block">Published</span>
            <span className="text-base font-black text-emerald-600">{publishedCount}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold block">Drafts</span>
            <span className="text-base font-black text-amber-600">{draftCount}</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card className="border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-3 top-2 text-[11px] text-gray-400 pointer-events-none">
                Search job title, company, or city
              </span>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl overflow-x-auto">
            {[
              { id: 'ALL', label: `All (${totalCount})` },
              { id: 'PUBLISHED', label: `Published (${publishedCount})` },
              { id: 'DRAFT', label: `Drafts (${draftCount})` },
              { id: 'CLOSED', label: `Closed (${closedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-3.5">Requisition Title</th>
                <th className="px-6 py-3.5">Employer / Company</th>
                <th className="px-6 py-3.5">Location & Mode</th>
                <th className="px-6 py-3.5 text-center">Applicants</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Admin Governance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No job postings found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job: any) => {
                  const isPublished = job.status === 'PUBLISHED';
                  return (
                    <tr key={job.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-xs">{job.title}</p>
                            <span className="text-[10px] text-gray-400">{job.type || 'Full-time'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800">
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          {job.company || 'Enterprise Partner'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {job.location || 'Remote'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg font-bold text-[11px]">
                          <Users className="w-3 h-3" />
                          {job.applicants || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPublished ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Publish & activate "${job.title}" across the platform?`)) {
                                  updateStatusMutation.mutate({ id: job.id, status: 'PUBLISHED' });
                                }
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                              title="Publish Job"
                            >
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Publish</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (window.confirm(`Take down / close "${job.title}"?`)) {
                                  updateStatusMutation.mutate({ id: job.id, status: 'CLOSED' });
                                }
                              }}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                              title="Close Job"
                            >
                              <XCircle className="w-3 h-3 text-red-600" />
                              <span>Take Down</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <span>Total <strong>{filteredJobs.length}</strong> requisitions</span>
          <span className="font-semibold text-blue-600">Enterprise Job Board</span>
        </div>
      </Card>
    </div>
  );
}
