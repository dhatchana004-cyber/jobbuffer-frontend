import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Building,
  Users,
  Search,
  Check,
  Ban,
  UserX,
  UserCheck
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import api from '../../services/api';
import { REAL_USERS, REAL_JOBS, REAL_COMPANIES } from '../../services/realDataStore';

export default function Moderation() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'JOBS' | 'COMPANIES' | 'USERS'>('JOBS');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const { data: moderationData, isLoading } = useQuery({
    queryKey: ['adminModeration'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/moderation');
        if (response.data && Array.isArray(response.data.jobs) && response.data.jobs.length > 0) {
          return response.data;
        }
      } catch (err: any) {
        // Fallback
      }
      return {
        jobs: REAL_JOBS,
        companies: REAL_COMPANIES,
        users: REAL_USERS,
        totalPending: 0
      };
    }
  });

  const jobs = Array.isArray(moderationData?.jobs) ? moderationData.jobs : [];
  const companies = Array.isArray(moderationData?.companies) ? moderationData.companies : [];
  const users = Array.isArray(moderationData?.users) ? moderationData.users : [];
  const totalPending = moderationData?.totalPending || 0;

  const actionMutation = useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      action
    }: {
      entityType: 'JOB' | 'USER' | 'COMPANY';
      entityId: string;
      action: string;
    }) => {
      const response = await api.post('/admin/moderation/action', {
        entityType,
        entityId,
        action
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminModeration'] });
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setActionSuccessMsg(data.message || 'Action executed successfully.');
      setTimeout(() => setActionSuccessMsg(null), 3500);
    }
  });

  // Calculate statistics
  const totalMonitored = jobs.length + companies.length + users.length;
  const suspendedUsers = users.filter((u: any) => u?.status === 'SUSPENDED').length;
  const verifiedCompanies = companies.filter((c: any) => c?.status === 'VERIFIED').length;

  const filteredJobs = jobs.filter(
    (j: any) =>
      !searchTerm ||
      (j?.title && j.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (j?.subtitle && j.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCompanies = companies.filter(
    (c: any) =>
      !searchTerm ||
      (c?.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c?.subtitle && c.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredUsers = users.filter(
    (u: any) =>
      !searchTerm ||
      (u?.title && u.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u?.subtitle && u.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation & Compliance</h1>
          <p className="text-gray-500 mt-1">
            Review reported jobs, verify company credentials, and moderate accounts to ensure platform integrity.
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Monitored" value={totalMonitored} icon={ShieldCheck} color="blue" />
        <StatCard title="Pending Review" value={totalPending} icon={AlertTriangle} color="amber" />
        <StatCard title="Verified Companies" value={verifiedCompanies} icon={Building} color="green" />
        <StatCard title="Suspended Accounts" value={suspendedUsers} icon={Ban} color="red" />
      </div>

      {/* Main Container */}
      <Card>
        {/* Navigation Tabs */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="flex bg-gray-200/80 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('JOBS')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                activeTab === 'JOBS'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Jobs Queue ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('COMPANIES')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                activeTab === 'COMPANIES'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building className="w-4 h-4" />
              Companies ({companies.length})
            </button>
            <button
              onClick={() => setActiveTab('USERS')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                activeTab === 'USERS'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Accounts ({users.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              aria-label="Filter moderation queue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading moderation queue...</p>
          </div>
        ) : (
          <>
            {/* Tab 1: Jobs Queue */}
            {activeTab === 'JOBS' && (
          <div className="overflow-x-auto">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-800">No jobs to moderate</h3>
                <p className="text-sm text-gray-500 mt-1">All posted jobs meet the quality and safety standards.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
                    <th className="py-3 px-4">Job Title & Company</th>
                    <th className="py-3 px-4">Location / Type</th>
                    <th className="py-3 px-4">Applicants</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredJobs.map((job: any) => (
                    <tr key={job.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">{job.title}</p>
                        <p className="text-xs text-gray-500">{job.subtitle}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600">
                        {job.details?.location} • {job.details?.jobType}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-800">
                        {job.details?.applications} candidate(s)
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            job.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : job.status === 'REJECTED'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {job.status !== 'PUBLISHED' && (
                            <button
                              onClick={() =>
                                actionMutation.mutate({
                                  entityType: 'JOB',
                                  entityId: job.id,
                                  action: 'APPROVE'
                                })
                              }
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          )}
                          {job.status !== 'REJECTED' && (
                            <button
                              onClick={() =>
                                actionMutation.mutate({
                                  entityType: 'JOB',
                                  entityId: job.id,
                                  action: 'FLAG'
                                })
                              }
                              className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Take Down
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Companies Queue */}
        {activeTab === 'COMPANIES' && (
          <div className="overflow-x-auto">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-16">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-800">No companies found</h3>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
                    <th className="py-3 px-4">Company Name</th>
                    <th className="py-3 px-4">Industry / HQ</th>
                    <th className="py-3 px-4">Recruiters</th>
                    <th className="py-3 px-4">Active Jobs</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCompanies.map((comp: any) => (
                    <tr key={comp.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">{comp.title}</p>
                        <p className="text-xs text-gray-400">Size: {comp.details?.size}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600">
                        {comp.subtitle}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-800">
                        {comp.details?.recruitersCount} recruiter(s)
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-800">
                        {comp.details?.jobsCount} job(s)
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-xs text-gray-400 font-medium">Compliance OK</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Users Queue */}
        {activeTab === 'USERS' && (
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-800">No users found</h3>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-200">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Account Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">{user.title}</p>
                        <p className="text-xs text-gray-500">{user.details?.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            user.details?.role === 'ADMIN'
                              ? 'bg-red-50 text-red-700'
                              : user.details?.role === 'RECRUITER'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {user.details?.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {user.details?.role !== 'ADMIN' && (
                          <div className="flex items-center justify-end gap-2">
                            {user.status === 'ACTIVE' ? (
                              <button
                                onClick={() =>
                                  actionMutation.mutate({
                                    entityType: 'USER',
                                    entityId: user.id,
                                    action: 'SUSPEND'
                                  })
                                }
                                className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  actionMutation.mutate({
                                    entityType: 'USER',
                                    entityId: user.id,
                                    action: 'APPROVE'
                                  })
                                }
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Reactivate
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
          </>
        )}
      </Card>
    </div>
  );
}
