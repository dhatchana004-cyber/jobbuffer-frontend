import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  User, 
  AlertCircle, 
  Trash2, 
  X,
  Sparkles,
  Link2,
  CalendarCheck2,
  PhoneCall,
  Mail,
  Award,
  Bell
} from 'lucide-react';
import api from '../../services/api';
import { formatCandidateName } from '../../utils/candidateHelper';

interface Interview {
  id: string;
  title: string;
  type: 'VIDEO' | 'PHONE' | 'IN_PERSON';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string | null;
  location: string;
  notes: string | null;
  feedback: string | null;
  candidate: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profileImage: string | null;
    location: string;
  };
  job: {
    id: string;
    title: string;
    location: string;
    type: string;
  } | null;
}

export default function RecruiterInterviews() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [feedbackModalInterview, setFeedbackModalInterview] = useState<Interview | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [interviewDecision, setInterviewDecision] = useState<'SELECTED' | 'SHORTLISTED' | 'REJECTED' | 'NONE'>('SELECTED');

  // Form State for New Discussion / Interview
  const [newCandidateId, setNewCandidateId] = useState('');
  const [newJobId, setNewJobId] = useState('');
  const [newTitle, setNewTitle] = useState('Technical Interview - Round 1');
  const [newType, setNewType] = useState<'VIDEO' | 'PHONE' | 'IN_PERSON'>('VIDEO');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('14:00');
  const [newDuration, setNewDuration] = useState('45');
  const [newMeetingLink, setNewMeetingLink] = useState('https://meet.google.com/ora-meet-call');
  const [newLocation, setNewLocation] = useState('Google Meet');
  const [newNotes, setNewNotes] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  // Fetch Interviews
  const { data: interviews = [], isLoading } = useQuery<Interview[]>({
    queryKey: ['recruiterInterviews', statusFilter, typeFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'ALL') params.append('status', statusFilter);
        if (typeFilter !== 'ALL') params.append('type', typeFilter);
        const res = await api.get(`/recruiter/interviews?${params.toString()}`);
        if (Array.isArray(res.data)) return res.data;
      } catch (err: any) {}
      return [] as Interview[];
    }
  });

  // Fetch Candidates for dropdown
  const { data: candidates = [] } = useQuery({
    queryKey: ['candidatesForInterview'],
    queryFn: async () => {
      try {
        const res = await api.get('/recruiter/candidates');
        if (Array.isArray(res.data)) return res.data;
      } catch {}
      return [];
    }
  });

  // Fetch Jobs for dropdown
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobsForInterview'],
    queryFn: async () => {
      try {
        const res = await api.get('/recruiter/jobs');
        if (Array.isArray(res.data)) return res.data;
      } catch {}
      return [];
    }
  });

  // Create Interview Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/recruiter/interviews', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterInterviews'] });
      setIsScheduleOpen(false);
      resetScheduleForm();
    },
    onError: (err: any) => {
      setScheduleError(err.response?.data?.message || 'Failed to schedule discussion');
    }
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, feedback, applicationStatus }: { id: string; status: string; feedback?: string; applicationStatus?: string }) => {
      const res = await api.patch(`/recruiter/interviews/${id}/status`, { status, feedback, applicationStatus });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] });
      setFeedbackModalInterview(null);
      setFeedbackText('');
    }
  });

  // Delete Interview Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/recruiter/interviews/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterInterviews'] });
    }
  });

  const [remindedId, setRemindedId] = useState<string | null>(null);
  const [reminderToast, setReminderToast] = useState('');

  // Send Interview Reminder Email & Notification
  const sendReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/recruiter/interviews/${id}/remind`);
      return res.data;
    },
    onSuccess: (data, id) => {
      setRemindedId(id);
      setReminderToast(data.message || 'Interview reminder sent to candidate!');
      setTimeout(() => {
        setRemindedId(null);
        setReminderToast('');
      }, 4000);
    }
  });

  const resetScheduleForm = () => {
    setNewCandidateId('');
    setNewJobId('');
    setNewTitle('Technical Interview - Round 1');
    setNewType('VIDEO');
    setNewDate('');
    setNewTime('14:00');
    setNewDuration('45');
    setNewMeetingLink('https://meet.google.com/ora-meet-call');
    setNewLocation('Google Meet');
    setNewNotes('');
    setScheduleError('');
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateId) {
      setScheduleError('Please select a candidate from your talent pool');
      return;
    }
    if (!newDate) {
      setScheduleError('Please specify the date for this discussion');
      return;
    }

    const scheduledAt = new Date(`${newDate}T${newTime}:00`);

    createMutation.mutate({
      candidateId: newCandidateId,
      jobId: newJobId || null,
      title: newTitle,
      type: newType,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: Number(newDuration),
      meetingLink: newType === 'VIDEO' ? newMeetingLink : null,
      location: newType === 'VIDEO' ? 'Google Meet' : newType === 'PHONE' ? 'Direct Phone Call' : newLocation,
      notes: newNotes
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatScheduledDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatScheduledTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const interviewList = Array.isArray(interviews) ? interviews : [];

  const filteredInterviews = interviewList.filter(i => {
    const matchSearch = 
      !searchTerm ||
      (i.candidate?.name && i.candidate.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.title && i.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.job?.title && i.job.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch;
  });

  const scheduledCount = interviewList.filter(i => i.status === 'SCHEDULED').length;
  const completedCount = interviewList.filter(i => i.status === 'COMPLETED').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">Scheduled</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700">Completed</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-3.5 h-3.5 text-blue-600" />;
      case 'PHONE':
        return <Phone className="w-3.5 h-3.5 text-emerald-600" />;
      case 'IN_PERSON':
        return <MapPin className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Video className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Interviews & Discussions</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Company Direct Pipeline
            </span>
          </div>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Coordinate candidate screenings, log evaluation feedback, and make direct hiring decisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-xs text-center">
            <span className="text-[11px] text-gray-400 font-medium block">Upcoming</span>
            <span className="text-lg font-bold text-blue-600">{scheduledCount}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-xs text-center">
            <span className="text-[11px] text-gray-400 font-medium block">Completed</span>
            <span className="text-lg font-bold text-green-600">{completedCount}</span>
          </div>
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md ml-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Discussion
          </button>
        </div>
      </div>

      {/* Reminder Action Toast */}
      {reminderToast && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
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
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="absolute right-3 top-2 text-[11px] text-gray-400 pointer-events-none">
              Search by candidate or job
            </span>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {st === 'ALL' ? 'All Discussions' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Filter className="w-3 h-3" />
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Modes</option>
              <option value="VIDEO">Video Meeting</option>
              <option value="PHONE">Phone Screening</option>
              <option value="IN_PERSON">In-Person Office</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interviews List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-xs font-semibold text-gray-500">Loading interview schedule...</p>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarCheck2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No scheduled discussions found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
              ? 'No interviews match your current search or filter filters.'
              : 'Keep track of phone calls and video meetings directly with shortlisted candidates.'}
          </p>
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Set Up Discussion
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInterviews.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Left Column: Date & Time Box */}
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-gradient-to-b from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-3 text-center min-w-[110px] flex-shrink-0">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-blue-600 uppercase">
                    {getTypeIcon(item.type)}
                    <span>{item.type}</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900 mt-1">
                    {formatScheduledDate(item.scheduledAt)}
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatScheduledTime(item.scheduledAt)}</span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-semibold block mt-1 bg-white/80 py-0.5 rounded">
                    {item.durationMinutes} mins
                  </span>
                </div>

                {/* Candidate & Interview Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-gray-900">
                      {item.title}
                    </h3>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Candidate Name & Role */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formatCandidateName(item.candidate?.name, item.candidate?.email)}</span>
                    </div>
                    {item.job && (
                      <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium">
                        Role: {item.job.title}
                      </span>
                    )}
                  </div>

                  {/* Contact Channels */}
                  <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap pt-0.5">
                    {item.candidate.phone && (
                      <a 
                        href={`tel:${item.candidate.phone}`}
                        className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                        title="Direct Call"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{item.candidate.phone}</span>
                      </a>
                    )}
                    {item.candidate.email && (
                      <a 
                        href={`mailto:${item.candidate.email}`}
                        className="flex items-center gap-1 text-blue-700 font-semibold hover:underline"
                        title="Direct Email"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{item.candidate.email}</span>
                      </a>
                    )}
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {item.location}
                    </span>
                  </div>

                  {/* Notes / Feedback */}
                  {item.notes && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-1">
                      <span className="font-bold text-gray-800">Discussion Agenda:</span> {item.notes}
                    </p>
                  )}

                  {item.feedback && (
                    <div className="text-xs bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 mt-1">
                      <span className="font-bold">Evaluation Feedback:</span> {item.feedback}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2 md:flex-col lg:flex-row justify-end flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                {/* Video Meeting Link */}
                {item.type === 'VIDEO' && item.meetingLink && (
                  <div className="flex items-center gap-1">
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Join Video
                    </a>
                    <button
                      onClick={() => copyToClipboard(item.meetingLink!, item.id)}
                      title="Copy meeting link"
                      className="p-1.5 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {/* Interview Stage Actions */}
                {item.status === 'SCHEDULED' && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => sendReminderMutation.mutate(item.id)}
                      disabled={sendReminderMutation.isPending}
                      title="Send automated email and in-app reminder to candidate"
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-600" />
                      {remindedId === item.id ? 'Sent ✓' : 'Send Reminder'}
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Select & Hire ${item.candidate.name} for the position?`)) {
                          updateStatusMutation.mutate({
                            id: item.id,
                            status: 'COMPLETED',
                            applicationStatus: 'SELECTED',
                            feedback: 'Interview cleared successfully. Candidate selected for hire.'
                          });
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Select / Hire
                    </button>

                    <button
                      onClick={() => {
                        setFeedbackModalInterview(item);
                        setFeedbackText(item.feedback || '');
                        setInterviewDecision('SELECTED');
                      }}
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      Log Notes
                    </button>
                  </div>
                )}

                {/* Cancel Action */}
                {item.status === 'SCHEDULED' && (
                  <button
                    onClick={() => {
                      if (window.confirm('Cancel this discussion?')) {
                        updateStatusMutation.mutate({ id: item.id, status: 'CANCELLED' });
                      }
                    }}
                    className="px-2.5 py-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                )}

                {/* Delete button */}
                <button
                  onClick={() => {
                    if (window.confirm('Delete this discussion record?')) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                  title="Delete record"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Schedule Candidate Discussion</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set up a phone call, Google Meet video session, or on-site meeting.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsScheduleOpen(false);
                  resetScheduleForm();
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              {scheduleError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{scheduleError}</span>
                </div>
              )}

              {/* Candidate Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Candidate *
                </label>
                <select
                  value={newCandidateId}
                  onChange={(e) => setNewCandidateId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidates.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.role} • {c.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Related Job Requisition (Optional)
                </label>
                <select
                  value={newJobId}
                  onChange={(e) => setNewJobId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- General Discussion / Any Requisition --</option>
                  {jobs.map((j: any) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Interview Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Discussion Title / Stage *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Interview Type */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'VIDEO', label: 'Video Meeting', icon: Video },
                  { id: 'PHONE', label: 'Phone Call', icon: Phone },
                  { id: 'IN_PERSON', label: 'In Person', icon: MapPin },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewType(t.id as any)}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                        newType === t.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Date, Time & Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Duration
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins</option>
                    <option value="90">90 mins</option>
                  </select>
                </div>
              </div>

              {/* Meeting Link (if Video) */}
              {newType === 'VIDEO' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5 text-blue-600" />
                    Meeting URL (Google Meet / Zoom)
                  </label>
                  <input
                    type="url"
                    value={newMeetingLink}
                    onChange={(e) => setNewMeetingLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Discussion Topics & Agenda
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsScheduleOpen(false);
                    resetScheduleForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-md"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{createMutation.isPending ? 'Saving...' : 'Confirm Schedule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete & Feedback Modal */}
      {feedbackModalInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Log Interview Outcome</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Candidate: <span className="font-bold text-gray-800">{formatCandidateName(feedbackModalInterview.candidate?.name, feedbackModalInterview.candidate?.email)}</span>
                </p>
              </div>
              <button
                onClick={() => setFeedbackModalInterview(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Candidate Pipeline Outcome
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInterviewDecision('SELECTED')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                      interviewDecision === 'SELECTED'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    🏆 Select / Hire
                  </button>

                  <button
                    type="button"
                    onClick={() => setInterviewDecision('SHORTLISTED')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                      interviewDecision === 'SHORTLISTED'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    ⭐ Keep Shortlisted
                  </button>

                  <button
                    type="button"
                    onClick={() => setInterviewDecision('REJECTED')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                      interviewDecision === 'REJECTED'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    ❌ Not Selected
                  </button>

                  <button
                    type="button"
                    onClick={() => setInterviewDecision('NONE')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                      interviewDecision === 'NONE'
                        ? 'bg-gray-700 text-white border-gray-700 shadow-xs'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Keep Current Status
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Evaluation Notes & Feedback
                </label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFeedbackModalInterview(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updateStatusMutation.isPending}
                  onClick={() => {
                    updateStatusMutation.mutate({
                      id: feedbackModalInterview.id,
                      status: 'COMPLETED',
                      feedback: feedbackText,
                      applicationStatus: interviewDecision !== 'NONE' ? interviewDecision : undefined
                    });
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{updateStatusMutation.isPending ? 'Saving...' : 'Save & Complete'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
