import { useState } from 'react';
import { 
  Search, 
  ShieldOff, 
  Trash2, 
  CheckCircle, 
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Copy,
  Phone,
  Mail,
  Check,
  Lock,
  RotateCw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { formatCandidateName } from '../../utils/candidateHelper';
import { REAL_USERS } from '../../services/realDataStore';

export default function UsersList() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Password visibility & modal state
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [passwordModalUser, setPasswordModalUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/users');
        if (Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
      } catch (err: any) {
        // Fallback to real authoritative users
      }
      return REAL_USERS;
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

  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const res = await api.patch(`/admin/users/${id}/password`, { password });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setActionSuccess(data.message || 'User password updated successfully.');
      setPasswordModalUser(null);
      setNewPasswordInput('');
      setPasswordError('');
      setTimeout(() => setActionSuccess(''), 4000);
    },
    onError: (err: any) => {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setActionSuccess(`Copied ${label} to clipboard!`);
    setTimeout(() => {
      setActionSuccess('');
    }, 2500);
  };

  const togglePasswordVisibility = (userId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleOpenPasswordModal = (user: any) => {
    setPasswordModalUser(user);
    setNewPasswordInput(user.password || '123456');
    setPasswordError('');
    setShowNewPassword(true);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.trim().length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      return;
    }
    updatePasswordMutation.mutate({
      id: passwordModalUser.id,
      password: newPasswordInput.trim()
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-r-transparent"></div>
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading user registry...</p>
      </div>
    );
  }

  const userList = Array.isArray(users) && users.length > 0 ? users : REAL_USERS;

  const totalCount = userList.length;
  const recruiterCount = userList.filter((u: any) => u.role === 'RECRUITER').length;
  const candidateCount = userList.filter((u: any) => u.role === 'CANDIDATE').length;
  const adminCount = userList.filter((u: any) => u.role === 'ADMIN').length;
  const suspendedCount = userList.filter((u: any) => u.status === 'SUSPENDED').length;

  // Filter users based on search, role, and status
  const filteredUsers = userList.filter((u: any) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q ||
      (u.name && u.name.toLowerCase().includes(q)) || 
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 uppercase tracking-wider">Admin</span>;
      case 'RECRUITER':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">Recruiter</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">Candidate</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>Active</span>;
      case 'SUSPENDED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1"></span>Suspended</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Account Directory</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            Audit, view, and manage all recruiter, candidate, and administrator credentials.
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-3 top-2 text-[11px] text-gray-400 pointer-events-none">
                Search by name, email, or mobile...
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

        {/* Table with User Name, Email, Mobile Number, Password */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-600 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-5 py-3.5">User Identity</th>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-5 py-3.5">Mobile Number</th>
                <th className="px-5 py-3.5">Password</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Login</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No users match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: any) => {
                  const isActive = u.status === 'ACTIVE';
                  const isRevealed = !!revealedPasswords[u.id];
                  const displayPass = u.password || '123456';
                  const cleanPhone = u.phone && u.phone !== 'Not Provided' ? u.phone : null;

                  return (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* 1. User Name & Avatar */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                            {formatCandidateName(u.name, u.email).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-xs">{formatCandidateName(u.name, u.email)}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Joined {u.joined}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Email */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 group">
                          <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="font-semibold text-gray-700 select-all">{u.email}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(u.email, 'Email')}
                            title="Copy email"
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-all cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* 3. Mobile Number */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {cleanPhone ? (
                          <div className="flex items-center gap-1.5 group">
                            <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            <a 
                              href={`tel:${cleanPhone}`} 
                              className="font-bold text-gray-800 hover:text-blue-600 transition-colors"
                            >
                              {cleanPhone}
                            </a>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(cleanPhone, 'Mobile Number')}
                              title="Copy mobile number"
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-all cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">Not Provided</span>
                        )}
                      </td>

                      {/* 4. Password with Show/Hide & Edit */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg flex items-center gap-2 font-mono text-xs">
                            <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="font-semibold text-gray-800 select-all">
                              {isRevealed ? displayPass : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              title={isRevealed ? 'Hide password' : 'Show password'}
                              className="text-gray-400 hover:text-gray-700 p-0.5 rounded cursor-pointer"
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(displayPass, 'Password')}
                              title="Copy password"
                              className="text-gray-400 hover:text-blue-600 p-0.5 rounded cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleOpenPasswordModal(u)}
                            title="Change or reset this user's password"
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* 5. Role Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getRoleBadge(u.role)}
                      </td>

                      {/* 6. Status Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(u.status)}
                      </td>

                      {/* 7. Last Active */}
                      <td className="px-5 py-4 whitespace-nowrap text-gray-500 font-medium">
                        {u.lastActive}
                      </td>

                      {/* 8. Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isActive ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Suspend account for ${u.name}?`)) {
                                  statusMutation.mutate({ id: u.id, status: 'SUSPENDED' });
                                }
                              }}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
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
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
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
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

      {/* Change / Reset Password Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Change Account Password</h3>
                  <p className="text-[11px] text-gray-500">{passwordModalUser.name} ({passwordModalUser.email})</p>
                </div>
              </div>
              <button 
                onClick={() => setPasswordModalUser(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  This sets both the active login password and display credential for this user.
                </p>
              </div>

              {/* Quick suggestion buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Quick Set:</span>
                {['123456', 'harish@123', 'jobuffer@2026'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewPasswordInput(preset)}
                    className="px-2 py-0.5 text-[10px] font-mono font-bold bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-md transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updatePasswordMutation.isPending ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
