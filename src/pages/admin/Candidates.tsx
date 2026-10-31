import { useState } from 'react';
import { 
  Search, 
  ExternalLink, 
  X,
  Trash2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export default function CandidatesList() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [deleteCandidateModal, setDeleteCandidateModal] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const deleteCandidateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/candidates/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCandidates'] });
      setDeleteCandidateModal(null);
      if (selectedCandidate) setSelectedCandidate(null);
      setActionSuccess('Candidate profile and user deleted successfully.');
      setTimeout(() => setActionSuccess(''), 3000);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'Failed to delete candidate.');
      setTimeout(() => setActionError(''), 3000);
    }
  });

  const { data: candidates = [], isLoading, error } = useQuery({
    queryKey: ['adminCandidates'],
    queryFn: async () => {
      const response = await api.get('/admin/candidates');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-r-transparent"></div>
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading candidate talent directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-2xl">
        <p className="font-bold text-sm">Failed to load candidate profiles</p>
        <p className="text-xs text-red-500 mt-1">Please verify connection.</p>
      </div>
    );
  }

  const candList = Array.isArray(candidates) ? candidates : [];

  const filteredCandidates = candList.filter((c: any) => 
    !searchTerm ||
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.headline && c.headline.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.skills && Array.isArray(c.skills) && c.skills.some((s: string) => typeof s === 'string' && s.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    (c.location && c.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCount = candList.length;
  const withResumeCount = candList.filter((c: any) => !!c.resumeUrl).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Talent Directory</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            Supervise registered job seekers, verified skill sets, and application submissions.
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

        {/* Stats */}
        <div className="flex items-center gap-2.5">
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold block">Total Talent</span>
            <span className="text-base font-black text-gray-900">{totalCount}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold block">With Resume</span>
            <span className="text-base font-black text-emerald-600">{withResumeCount}</span>
          </div>
        </div>
      </div>

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
                Search candidate name, skills, or city
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-3.5">Candidate Profile</th>
                <th className="px-6 py-3.5">Skills & Specialization</th>
                <th className="px-6 py-3.5">Location & Mode</th>
                <th className="px-6 py-3.5 text-center">Applications</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No candidate profiles match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                          {c.name ? c.name.slice(0, 2).toUpperCase() : 'CD'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{c.name}</p>
                          <p className="text-[11px] text-blue-600 font-medium mt-0.5">{c.headline}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.skills && c.skills.length > 0 ? (
                          c.skills.slice(0, 3).map((sk: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700">
                              {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-gray-400">General Candidate</span>
                        )}
                        {c.skills && c.skills.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] text-gray-400 font-bold">
                            +{c.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <p className="font-semibold text-gray-800">{c.location}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{c.workMode || 'Hybrid'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg font-bold text-[11px]">
                        {c.applications || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.resumeUrl && (
                          <a
                            href={c.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
                            title="View Resume"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedCandidate(c)}
                          className="px-2.5 py-1 border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-700 font-bold text-[11px] transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => setDeleteCandidateModal(c)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                          title="Delete Candidate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <span>Total <strong>{filteredCandidates.length}</strong> qualified candidates</span>
          <span className="font-semibold text-blue-600">Verified Job Seekers</span>
        </div>
      </Card>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                  {selectedCandidate.name ? selectedCandidate.name.slice(0, 2).toUpperCase() : 'CD'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{selectedCandidate.name}</h3>
                  <p className="text-xs font-semibold text-blue-600">{selectedCandidate.headline}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <div>
                <span className="text-gray-400 block font-medium">Location</span>
                <span className="font-bold text-gray-800 mt-0.5 block">{selectedCandidate.location}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Work Preference</span>
                <span className="font-bold text-gray-800 mt-0.5 block">{selectedCandidate.workMode}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Notice Period</span>
                <span className="font-bold text-gray-800 mt-0.5 block">{selectedCandidate.noticePeriod}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Expected CTC</span>
                <span className="font-bold text-gray-800 mt-0.5 block">{selectedCandidate.expectedSalary}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Technical Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCandidate.skills?.map((sk: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-gray-100">
              <button
                onClick={() => setDeleteCandidateModal(selectedCandidate)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Candidate</span>
              </button>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Candidate Account</h3>
                <p className="text-xs text-gray-500">This action permanently removes all records</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
              Are you sure you want to delete <strong className="text-gray-900 font-bold">{deleteCandidateModal.name}</strong> ({deleteCandidateModal.email})? This will permanently remove their candidate profile, submitted applications, resumes, and platform access.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidateModal(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteCandidateMutation.isPending}
                onClick={() => deleteCandidateMutation.mutate(deleteCandidateModal.id)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {deleteCandidateMutation.isPending ? 'Deleting...' : 'Yes, Delete Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
