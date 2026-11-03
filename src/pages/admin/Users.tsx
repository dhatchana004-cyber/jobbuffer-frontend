import { useState } from 'react';
import { 
  Search, 
  ShieldOff, 
  Trash2, 
  CheckCircle, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { formatCandidateName } from '../../utils/candidateHelper';

export default function UsersList() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data;
    }
  });

  // Status mutation (Activate / Suspend)
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/admin/users/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setActionSuccess(`User status changed to ${variables.status} successfully.`);
      setTimeout(() => setActionSuccess(''), 3000);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'Failed to update user status.');
      setTimeout(() => setActionError(''), 3000);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setActionSuccess('User account removed permanently.');
      setTimeout(() => setActionSuccess(''), 3000);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'Failed to delete user.');
      setTimeout(() => setActionError(''), 3000);
    }
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-r-transparent"></div>
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading user registry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-2xl">
        <p className="font-bold text-sm">Failed to load platform user accounts</p>
        <p className="text-xs text-red-500 mt-1">Please verify connection.</p>
      </div>
    );
  }

  const userList = Array.isArray(users) ? users : [];

  const totalCount = userList.length;
  const recruiterCount = userList.filter((u: any) => u.role === 'RECRUITER').length;
  const candidateCount = userList.filter((u: any) => u.role === 'CANDIDATE').length;
  const adminCount = userList.filter((u: any) => u.role === 'ADMIN').length;
  const suspendedCount = userList.filter((u: any) => u.status === 'SUSPENDED').length;

  // Filter users based on search, role, and status
  const filteredUsers = userList.filter((u: any) => {
    const matchesSearch = !searchTerm ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">Administrator</span>;
      case 'RECRUITER':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">Recruiter</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Candidate</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Active</span>;
      case 'SUSPENDED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">Suspended</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Account Directory</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            Audit, verify, and moderate all recruiter, candidate, and staff credentials.
          </p>
        </div>

        {/* Quick Counters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold block">Total Users</span>
            <span className="text-base font-black text-gray-900">{totalCount}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold block">Recruiters</span>
            <span className="text-base font-black text-purple-600">{recruiterCount}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold block">Candidates</span>
            <span className="text-base font-black text-blue-600">{candidateCount}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold block">Admins</span>
            <span className="text-base font-black text-emerald-600">{adminCount}</span>
          </div>
          {suspendedCount > 0 && (
            <div className="bg-white border border-red-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
              <span className="text-[10px] text-red-500 font-bold block">Suspended</span>
              <span className="text-base font-black text-red-600">{suspendedCount}</span>
            </div>
          )}
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

      {/* Search & Filters */}
      <Card className="border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
          {/* Search Input without placeholder */}
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
                Search by name or email
              </span>
            )}
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              {[
                { id: 'ALL', label: 'All Roles' },
                { id: 'RECRUITER', label: 'Recruiters' },
                { id: 'CANDIDATE', label: 'Candidates' },
                { id: 'ADMIN', label: 'Admins' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    roleFilter === tab.id
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-3.5">User Identity</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Registered</th>
                <th className="px-6 py-3.5">Last Login</th>
                <th className="px-6 py-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No users match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: any) => {
                  const isActive = u.status === 'ACTIVE';
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                            {formatCandidateName(u.name, u.email).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-xs">{formatCandidateName(u.name, u.email)}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(u.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                        {u.joined}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {u.lastActive}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isActive ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Suspend account for ${u.name}?`)) {
                                  statusMutation.mutate({ id: u.id, status: 'SUSPENDED' });
                                }
                              }}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold flex items-center gap-1 transition-colors"
                              title="Suspend User"
                            >
                              <ShieldOff className="w-3 h-3 text-amber-600" />
                              <span>Suspend</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (window.confirm(`Re-activate account for ${u.name}?`)) {
                                  statusMutation.mutate({ id: u.id, status: 'ACTIVE' });
                                }
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold flex items-center gap-1 transition-colors"
                              title="Activate User"
                            >
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Activate</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete user ${u.name} permanently? This cannot be undone.`)) {
                                deleteMutation.mutate(u.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete user record"
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

        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <span>Showing <strong>{filteredUsers.length}</strong> of <strong>{totalCount}</strong> platform accounts</span>
          <span className="font-semibold text-blue-600">Enterprise Registry</span>
        </div>
      </Card>
    </div>
  );
}
