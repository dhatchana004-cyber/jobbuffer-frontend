import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Trash2, 
  CheckCheck, 
  Clock, 
  Info, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export default function RecruiterNotifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('ALL');

  // Fetch Notifications
  const { data, isLoading } = useQuery({
    queryKey: ['recruiterNotifications'],
    queryFn: async () => {
      try {
        const res = await api.get('/recruiter/notifications');
        return res.data;
      } catch {
        return { notifications: [], unreadCount: 0 };
      }
    }
  });

  const notifications: NotificationItem[] = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/recruiter/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterNotifications'] });
    }
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/recruiter/notifications/mark-all-read');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterNotifications'] });
    }
  });

  // Delete notification
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/recruiter/notifications/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterNotifications'] });
    }
  });

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'APPLICATION':
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
        );
      case 'INTERVIEW':
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        );
      case 'MESSAGE':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.read) {
      markReadMutation.mutate(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
    } else if (notif.type.toUpperCase() === 'APPLICATION') {
      navigate('/recruiter/applications');
    } else if (notif.type.toUpperCase() === 'INTERVIEW') {
      navigate('/recruiter/interviews');
    } else if (notif.type.toUpperCase() === 'MESSAGE') {
      navigate('/recruiter/messages');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'UNREAD') return !n.read;
    if (filterType !== 'ALL') return n.type.toUpperCase() === filterType;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Notifications & Alerts</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Real-time candidate submissions, interview updates, messages, and platform notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-colors shadow-xs self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Alerts' },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'APPLICATION', label: 'Applications' },
          { id: 'INTERVIEW', label: 'Interviews' },
          { id: 'MESSAGE', label: 'Messages' },
          { id: 'SYSTEM', label: 'System' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Stream */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          Loading notifications...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900">All caught up!</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            {filterType === 'UNREAD'
              ? 'You have addressed all your unread recruiter notifications.'
              : 'New alerts will appear here when candidates interact with your job listings.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                notif.read
                  ? 'bg-white border-gray-200 hover:border-gray-300'
                  : 'bg-blue-50/50 border-blue-200 hover:border-blue-300 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {getNotificationIcon(notif.type)}
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-gray-900 truncate">
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                    <span className="text-blue-600 font-semibold flex items-center gap-0.5 hover:underline">
                      View details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {!notif.read && (
                  <button
                    onClick={() => markReadMutation.mutate(notif.id)}
                    title="Mark as read"
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteMutation.mutate(notif.id)}
                  title="Dismiss alert"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
