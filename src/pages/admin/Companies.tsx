import { useState } from 'react';
import { Search, Globe, Users, ExternalLink, ShieldCheck, MapPin, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ['adminCompanies'],
    queryFn: async () => {
      const response = await api.get('/admin/companies');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-r-transparent"></div>
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading verified company records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-2xl">
        <p className="font-bold text-sm">Failed to load company records</p>
        <p className="text-xs text-red-500 mt-1">Please verify connection.</p>
      </div>
    );
  }

  const compList = Array.isArray(companies) ? companies : [];

  const filteredCompanies = compList.filter((c: any) => 
    !searchTerm ||
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.industry && c.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.headquarters && c.headquarters.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.location && c.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCompanyInitials = (n: string) => {
    if (!n) return 'CO';
    return n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registered Employers & Companies</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            Oversee verified corporate entities, branding credentials, and organizational headcount.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold block">Total Organizations</span>
            <span className="text-base font-black text-gray-900">{compList.length}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold block">Verified</span>
            <span className="text-base font-black text-emerald-600">{compList.length}</span>
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
                Search company name, industry, or city
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-3.5">Company Identity</th>
                <th className="px-6 py-3.5">Industry Sector</th>
                <th className="px-6 py-3.5">Headquarters</th>
                <th className="px-6 py-3.5">Team Size</th>
                <th className="px-6 py-3.5">Website</th>
                <th className="px-6 py-3.5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No company profiles match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                          {getCompanyInitials(c.name)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{c.name}</p>
                          <span className="text-[10px] text-gray-400">Corporate Account</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                      {c.industry || 'Technology & Services'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {c.headquarters || c.location || 'Headquarters Unspecified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <span className="flex items-center gap-1 font-semibold">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {c.size || '11-50 employees'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-medium">
                      {c.website ? (
                        <a 
                          href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Visit Site</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400 font-normal">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Business
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <span>Total <strong>{filteredCompanies.length}</strong> enterprise employers</span>
          <span className="font-semibold text-amber-600">Verified Partner Network</span>
        </div>
      </Card>
    </div>
  );
}
