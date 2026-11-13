import { useState } from 'react';
import { Layers, Plus, Search, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { REAL_CATEGORIES } from '../../services/realDataStore';

export default function Categories() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/categories');
        if (Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
      } catch (err: any) {
        // Fallback
      }
      return REAL_CATEGORIES;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post('/admin/categories', { name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      setIsAddOpen(false);
      setNewCatName('');
      setActionSuccess('New job category added successfully.');
      setTimeout(() => setActionSuccess(''), 3000);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || 'Failed to create category.');
      setTimeout(() => setActionError(''), 3000);
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    createMutation.mutate(newCatName.trim());
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-r-transparent"></div>
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading industry categories...</p>
      </div>
    );
  }

  const catList = Array.isArray(categories) && categories.length > 0 ? categories : REAL_CATEGORIES;

  const filteredCategories = catList.filter((c: any) => 
    !searchTerm || (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalJobsInCats = catList.reduce((acc: number, curr: any) => acc + (curr._count?.jobs || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Standardized Job Categories</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            Organize recruitment fields and ensure accurate talent-to-job matching across the portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold block">Categories</span>
            <span className="text-base font-black text-gray-900">{catList.length}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold block">Assigned Jobs</span>
            <span className="text-base font-black text-blue-600">{totalJobsInCats}</span>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors ml-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
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

      {/* Search Bar */}
      <Card className="border-gray-200 shadow-xs p-4 bg-white flex items-center justify-between gap-4">
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
              Filter category titles
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 font-semibold hidden sm:inline">
          {filteredCategories.length} Categories Live
        </span>
      </Card>

      {/* Category Cards Grid */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-md mx-auto">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No categories found</h3>
          <p className="text-xs text-gray-500 mt-1">
            Click "+ Add Category" to register a new industry field.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat: any) => {
            const count = cat._count?.jobs ?? 0;
            return (
              <div 
                key={cat.id} 
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3 shadow-2xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug">{cat.name}</h3>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-medium">Requisitions</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                    {count} {count === 1 ? 'Job' : 'Jobs'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Add New Category</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">E.g., Cybersecurity, Data Science, Fintech Engineering</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !newCatName.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
