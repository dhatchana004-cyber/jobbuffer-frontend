import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  User,
  Building,
  Briefcase,
  ExternalLink,
  Search,
  CheckCircle2,
  CalendarCheck2,
  AlertCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import api from '../../services/api';
import { formatCandidateName } from '../../utils/candidateHelper';

export default function GlobalInterviews() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: interviews = [], isLoading, error } = useQuery({
    queryKey: ['adminInterviews'],
    queryFn: async () => {
      const response = await api.get('/admin/interviews');
      return response.data;
    }
  });

  // Safe array guard
  const interviewsList = Array.isArray(interviews) ? interviews : [];

  // Calculate statistics
  const totalCount = interviewsList.length;
  const scheduledCount = interviewsList.filter((i: any) => i.status === 'SCHEDULED').length;
  const videoCount = interviewsList.filter((i: any) => i.type === 'VIDEO').length;
  const completedCount = interviewsList.filter((i: any) => i.status === 'COMPLETED').length;

  // Filter interviews
  const filteredInterviews = interviewsList.filter((i: any) => {
    const matchesSearch =
      !searchTerm ||
      (i.candidateName && i.candidateName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.candidateEmail && i.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.jobTitle && i.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.companyName && i.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.recruiterName && i.recruiterName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Scheduled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Video className="w-3 h-3" />
            Google Meet / Video
          </span>
        );
      case 'PHONE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Phone className="w-3 h-3" />
            Phone Call
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
            <MapPin className="w-3 h-3" />
            In-Person
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Interviews</h1>
          <p className="text-gray-500 mt-1">
            Oversee and monitor all video and phone interviews scheduled between candidates and recruiters.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Interviews" value={totalCount} icon={Calendar} color="blue" />
        <StatCard title="Upcoming / Scheduled" value={scheduledCount} icon={CalendarCheck2} color="green" />
        <StatCard title="Video Meetings" value={videoCount} icon={Video} color="purple" />
        <StatCard title="Completed Rounds" value={completedCount} icon={CheckCircle2} color="amber" />
      </div>

      {/* Main Filter & Content Section */}
      <Card>
        {/* Search & Status Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              aria-label="Filter scheduled interviews"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading interviews...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-80" />
              <p className="font-medium">Failed to load interviews. Please check connection.</p>
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">No interviews match your criteria</h3>
              <p className="text-sm text-gray-500 mt-1">
                There are currently no interviews matching your search or filter selection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredInterviews.map((interview: any) => (
                <div
                  key={interview.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Date and Status */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(interview.scheduledAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>
                              {new Date(interview.scheduledAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}{' '}
                              ({interview.durationMinutes}m)
                            </span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(interview.status)}
                    </div>

                    {/* Interview Title & Type */}
                    <div className="mb-4">
                      <h4 className="text-base font-bold text-gray-900 mb-1">{interview.title}</h4>
                      <div>{getTypeBadge(interview.type)}</div>
                    </div>

                    {/* Details: Candidate, Job, Recruiter */}
                    <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-gray-900 block">
                            {formatCandidateName(interview.candidateName, interview.candidateEmail)}
                          </span>
                          <span className="text-gray-500">{interview.candidateEmail}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-purple-500 shrink-0" />
                        <span className="font-medium text-gray-800">{interview.jobTitle}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-gray-700">
                          {interview.companyName} • <span className="text-gray-500">Recruiter: {interview.recruiterName}</span>
                        </span>
                      </div>

                      {interview.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-gray-600 italic">
                          "{interview.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions / Meeting Link */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    {interview.meetingLink ? (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Meeting Link
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No external link provided</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
