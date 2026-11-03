import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Shield,
  FileText,
  Search,
  Activity,
  AlertCircle,
  Megaphone,
  Send,
  CheckCircle2,
  Trash2,
  RotateCw,
  CheckCheck
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import api from '../../services/api';

interface DeliveryLog {
  id: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  bodySnippet?: string;
  templateCode?: string;
  companyId?: string | null;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  channel: 'EMAIL' | 'IN_APP' | 'BOTH';
  error?: string;
  sentAt: string;
}

export default function Notifications() {
  const queryClient = useQueryClient();

  // Primary Tab: 'BROADCAST' | 'LOGS' | 'AUDIT'
  const [activeTab, setActiveTab] = useState<'BROADCAST' | 'LOGS' | 'AUDIT'>('BROADCAST');

  // ==========================================
  // DELIVERY LOGS STATE & QUERY
  // ==========================================
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('ALL');

  const { data: deliveryLogs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery<DeliveryLog[]>({
    queryKey: ['adminEmailDeliveryLogs', logStatusFilter],
    queryFn: async () => {
      const res = await api.get(`/admin/email-delivery-logs?status=${logStatusFilter}`);
      return res.data;
    }
  });

  const deleteLogMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/email-delivery-logs/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEmailDeliveryLogs'] });
    }
  });

  const filteredLogs = deliveryLogs.filter((log) => {
    if (!logSearch) return true;
    const s = logSearch.toLowerCase();
    return (
      log.recipientEmail.toLowerCase().includes(s) ||
      (log.recipientName && log.recipientName.toLowerCase().includes(s)) ||
      log.subject.toLowerCase().includes(s) ||
      (log.templateCode && log.templateCode.toLowerCase().includes(s))
    );
  });

  // ==========================================
  // IN-APP NOTIFICATIONS & BROADCASTS STATE
  // ==========================================
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetRole, setTargetRole] = useState<'ALL' | 'RECRUITER' | 'CANDIDATE'>('ALL');
  const [broadcastChannel, setBroadcastChannel] = useState<'BOTH' | 'EMAIL' | 'IN_APP'>('BOTH');
  const [adminReplyTo, setAdminReplyTo] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  const { data: notifications = [], isLoading: notifsLoading } = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: async () => {
      const response = await api.get('/admin/notifications');
      return response.data;
    }
  });

  const broadcastMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/email-announcements/dispatch', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['adminEmailDeliveryLogs'] });
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastSuccess(data.message || 'Announcement broadcast successfully dispatched!');
      setTimeout(() => setBroadcastSuccess(''), 5000);
    }
  });

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    broadcastMutation.mutate({
      subject: broadcastTitle.trim(),
      body: broadcastMessage.trim(),
      targetRole,
      channel: broadcastChannel,
      customReplyTo: adminReplyTo.trim() || undefined
    });
  };

  // Helper stats
  const totalLogs = deliveryLogs.length;
  const deliveredCount = deliveryLogs.filter((l) => l.status === 'DELIVERED').length;
  const failedCount = deliveryLogs.filter((l) => l.status === 'FAILED').length;

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white backdrop-blur-sm flex items-center gap-1.5 border border-white/10">
                <Megaphone className="w-3.5 h-3.5 text-blue-400" />
                Admin Communications & Broadcasts
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                ZeptoMail SMTP Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Platform Broadcasts & Delivery Center
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Broadcast announcements to registered candidates and recruiters, track real-time delivery logs, and monitor system notification stream. (Company recruitment templates are managed individually by employers in their Recruiter portal).
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('BROADCAST')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-2 ${
                activeTab === 'BROADCAST'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              New Broadcast
            </button>
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-2 ${
                activeTab === 'LOGS'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <FileText className="w-4 h-4" />
              Delivery Logs ({totalLogs})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Delivery Logs" value={totalLogs} icon={FileText} color="blue" />
        <StatCard title="Delivered Successfully" value={deliveredCount} icon={CheckCircle2} color="green" />
        <StatCard title="Delivery Failures" value={failedCount} icon={AlertCircle} color="red" />
        <StatCard title="Platform Alerts" value={Array.isArray(notifications) ? notifications.length : 0} icon={Bell} color="amber" />
      </div>

      {/* Feedback Messages */}
      {broadcastSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{broadcastSuccess}</span>
        </div>
      )}

      {/* Main Container / Sub-Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="border-b border-gray-200 bg-gray-50/70 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('BROADCAST')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'BROADCAST'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              Announcement Broadcast
            </button>

            <button
              onClick={() => setActiveTab('LOGS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'LOGS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              Delivery Logs & History
            </button>

            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'AUDIT'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              System Audit Stream
            </button>
          </div>

          {activeTab === 'LOGS' && (
            <button
              onClick={() => refetchLogs()}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Refresh Logs
            </button>
          )}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ANNOUNCEMENT BROADCAST                            */}
        {/* ======================================================== */}
        {activeTab === 'BROADCAST' && (
          <div className="p-6 md:p-8 max-w-4xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                Dispatch System Announcement
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Send an immediate announcement, platform notice, or scheduled maintenance alert to candidates, recruiters, or both.
              </p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e: any) => setTargetRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="ALL">All Platform Users (Candidates + Recruiters)</option>
                    <option value="CANDIDATE">Candidates Only</option>
                    <option value="RECRUITER">Employers & Recruiters Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Dispatch Channel
                  </label>
                  <select
                    value={broadcastChannel}
                    onChange={(e: any) => setBroadcastChannel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="BOTH">Both (Email Dispatch & In-App Notification)</option>
                    <option value="EMAIL">Email Only (SMTP Delivery)</option>
                    <option value="IN_APP">In-App Notification Center Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Announcement Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 📢 Important Platform Maintenance Notice: Sunday 2:00 AM"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Announcement Body *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Type the message to be communicated to users across the platform..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Optional Reply-To Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. support@jobuffer.com (Leave empty to use system default)"
                  value={adminReplyTo}
                  onChange={(e) => setAdminReplyTo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <span className="text-[11px] text-gray-500">
                  Broadcasts are delivered with high priority and logged automatically to the delivery history.
                </span>
                <button
                  type="submit"
                  disabled={broadcastMutation.isPending || !broadcastTitle.trim() || !broadcastMessage.trim()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {broadcastMutation.isPending ? 'Broadcasting...' : 'Send Broadcast Now'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: DELIVERY LOGS & EMAIL HISTORY                     */}
        {/* ======================================================== */}
        {activeTab === 'LOGS' && (
          <div className="p-6 space-y-6">
            {/* Search & Filter Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
              <div className="relative max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search by recipient email, candidate, or subject..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                {['ALL', 'DELIVERED', 'SENT', 'FAILED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setLogStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      logStatusFilter === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Subject & Details</th>
                    <th className="py-3 px-4">Trigger / Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Dispatched At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {logsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        Loading delivery logs...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No delivery logs recorded matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          <div>{log.recipientName || 'Candidate'}</div>
                          <div className="text-[11px] font-normal text-gray-500 font-mono">
                            {log.recipientEmail}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-gray-800 truncate">{log.subject}</div>
                          {log.bodySnippet && (
                            <div className="text-[11px] text-gray-400 truncate">{log.bodySnippet}</div>
                          )}
                          {log.error && (
                            <div className="text-[10px] text-rose-500 font-mono mt-0.5">{log.error}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 font-mono">
                            {log.templateCode || 'MANUAL_DISPATCH'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              log.status === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : log.status === 'SENT'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {log.status === 'DELIVERED' && <CheckCheck className="w-3 h-3" />}
                            {log.status === 'FAILED' && <AlertCircle className="w-3 h-3" />}
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500">
                          {log.channel || 'EMAIL'}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(log.sentAt).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => deleteLogMutation.mutate(log.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete log record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: AUDIT STREAM                                      */}
        {/* ======================================================== */}
        {activeTab === 'AUDIT' && (
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Security & Notification Audit Stream
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Real-time operational records of all communications sent through the platform.
              </p>
            </div>

            <div className="space-y-3">
              {notifsLoading ? (
                <div className="py-8 text-center text-xs text-gray-400">Loading audit records...</div>
              ) : Array.isArray(notifications) && notifications.length > 0 ? (
                notifications.slice(0, 20).map((n: any) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{n.title}</h4>
                        <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                          <span>User ID: {n.userId || 'Broadcast'}</span>
                          <span>&bull;</span>
                          <span>Type: {n.type || 'SYSTEM'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-gray-200">
                  No automated audit logs recorded yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
