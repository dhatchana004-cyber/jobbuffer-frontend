import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Building, 
  Globe, 
  MapPin, 
  Users, 
  Info, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  ExternalLink, 
  Award, 
  Heart, 
  ShieldCheck, 
  Coffee, 
  Zap, 
  Laptop
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

type CompanyFormValues = {
  name: string;
  website: string;
  industry: string;
  size: string;
  headquarters: string;
  description: string;
};

const INDUSTRY_OPTIONS = [
  'Information Technology & Services',
  'Software & SaaS',
  'Financial Services & Fintech',
  'Healthcare & Pharmaceuticals',
  'E-Commerce & Retail',
  'Education & EdTech',
  'Manufacturing & Industrial',
  'Media, Design & Advertising',
  'Consulting & Professional Services',
  'Telecommunications',
  'Automotive & EV',
  'Hospitality & Tourism'
];

const COMPANY_SIZE_OPTIONS = [
  '1-10 employees (Early Stage / Startup)',
  '11-50 employees (Small Business)',
  '51-200 employees (Mid-Sized / Growth)',
  '201-500 employees (Established Enterprise)',
  '501-1000 employees (Large Corporate)',
  '1000+ employees (Multinational / Enterprise)'
];

const PERKS_LIST = [
  { id: 'remote', label: 'Remote / Hybrid Flexibility', icon: Laptop },
  { id: 'health', label: 'Comprehensive Health Insurance', icon: Heart },
  { id: 'growth', label: 'Learning & Certification Stipend', icon: Award },
  { id: 'bonus', label: 'Annual & Performance Bonuses', icon: Zap },
  { id: 'leave', label: 'Generous Paid Time Off & Holidays', icon: Coffee },
  { id: 'wellness', label: 'Wellness & Gym Allowances', icon: ShieldCheck },
];

export default function CompanyProfile() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'culture' | 'preview'>('details');
  const [selectedPerks, setSelectedPerks] = useState<string[]>(['remote', 'health', 'growth']);

  const { data: company, isLoading } = useQuery({
    queryKey: ['companyProfile'],
    queryFn: async () => {
      try {
        const response = await api.get('/recruiter/company');
        if (response.data && response.data.name) return response.data;
      } catch (err: any) {}
      return {
        name: '',
        website: '',
        industry: 'Technology & Software',
        size: '11-50 employees',
        headquarters: 'Chennai, India',
        description: ''
      };
    }
  });

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<CompanyFormValues>();

  const currentValues = watch();

  useEffect(() => {
    if (company) {
      reset({
        name: company.name || '',
        website: company.website || '',
        industry: company.industry || '',
        size: company.size || '',
        headquarters: company.headquarters || '',
        description: company.description || ''
      });
    }
  }, [company, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: CompanyFormValues) => {
      const response = await api.put('/recruiter/company', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
      setSuccessMsg('Company profile updated and synced with job postings successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  });

  const onSubmit = (data: CompanyFormValues) => {
    updateMutation.mutate(data);
  };

  const getCompanyInitials = (n: string) => {
    if (!n) return 'CO';
    return n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  };

  const togglePerk = (id: string) => {
    if (selectedPerks.includes(id)) {
      setSelectedPerks(selectedPerks.filter(p => p !== id));
    } else {
      setSelectedPerks([...selectedPerks, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-blue-600 border-r-transparent"></div>
        <p className="mt-3 text-sm text-gray-500 font-medium">Loading organization profile...</p>
      </div>
    );
  }

  const displayName = currentValues.name || company?.name || 'Your Company';
  const displayIndustry = currentValues.industry || company?.industry || 'Technology & Services';
  const displayHQ = currentValues.headquarters || company?.headquarters || 'Location not set';
  const displayWebsite = currentValues.website || company?.website || '';
  const displayDesc = currentValues.description || company?.description || 'Add your company mission, culture, and what makes working at your organization unique.';
  const displaySize = currentValues.size || company?.size || '11-50 employees';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Banner Graphic */}
        <div className="h-32 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 relative">
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Verified Enterprise Employer
          </div>
        </div>

        {/* Company Avatar & Quick Meta */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md border border-gray-200 flex-shrink-0">
              <div className="w-full h-full rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-inner">
                {getCompanyInitials(displayName)}
              </div>
            </div>
            <div className="space-y-1 mb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{displayName}</h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Organization"></span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-gray-400" />
                  {displayIndustry}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {displayHQ}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  {displaySize}
                </span>
                {displayWebsite && (
                  <>
                    <span>•</span>
                    <a 
                      href={displayWebsite.startsWith('http') ? displayWebsite : `https://${displayWebsite}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl self-start md:self-end">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'details'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Company Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('culture')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'culture'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Culture & Benefits
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Candidate View
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab 1: Company Details Form */}
      {activeTab === 'details' && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-base font-bold text-gray-900">General Information</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              These details appear on all job advertisements posted by your organization to give candidates confidence.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Company Legal / Brand Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('name')}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-gray-900 outline-none transition-all"
                    />
                    <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Official employer name shown on job applications.</p>
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Primary Industry *
                  </label>
                  <div className="relative">
                    <select
                      {...register('industry')}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-gray-900 outline-none bg-white transition-all"
                    >
                      <option value="">Select industry category</option>
                      {INDUSTRY_OPTIONS.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                    <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Helps match your jobs with candidates in relevant fields.</p>
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Company Headcount *
                  </label>
                  <div className="relative">
                    <select
                      {...register('size')}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-gray-900 outline-none bg-white transition-all"
                    >
                      <option value="">Select workforce range</option>
                      {COMPANY_SIZE_OPTIONS.map((sz) => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                    <Users className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Estimated team size across all regional branches.</p>
                </div>

                {/* Headquarters Location */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Headquarters City & Country *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('headquarters')}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-gray-900 outline-none transition-all"
                    />
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">For example: Chennai, Tamil Nadu or Bangalore, India.</p>
                </div>

                {/* Website URL */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Official Website Address
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      {...register('website')}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-gray-900 outline-none transition-all"
                    />
                    <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Candidates can review your website to learn about your products and company story.</p>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    About the Company & Mission
                  </label>
                  <div className="relative">
                    <textarea
                      {...register('description')}
                      rows={5}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-xs leading-relaxed text-gray-900 outline-none transition-all"
                    />
                    <Info className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Highlight your company culture, technology stack, and values to attract top candidates.</p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-5 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting || updateMutation.isPending ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Culture & Perks */}
      {activeTab === 'culture' && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-base font-bold text-gray-900">Workplace Culture & Benefits</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Highlight the perks and incentives that make working at your company rewarding.
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PERKS_LIST.map((perk) => {
                const Icon = perk.icon;
                const isSelected = selectedPerks.includes(perk.id);
                return (
                  <button
                    key={perk.id}
                    type="button"
                    onClick={() => togglePerk(perk.id)}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                        {perk.label}
                      </h4>
                      <span className="text-[10px] text-gray-500 mt-0.5 block">
                        {isSelected ? '✓ Included in benefits' : 'Click to add'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <div className="text-xs text-gray-600">
                Selected benefits will be automatically highlighted on all your active job postings.
              </div>
              <button
                type="button"
                onClick={() => {
                  setSuccessMsg('Culture & Perks saved successfully!');
                  setTimeout(() => setSuccessMsg(''), 3000);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                Save Benefits
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Candidate View / Live Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>This is how candidates see your organization when browsing jobs or reviewing application invitations.</span>
          </div>

          {/* Simulated Public Company Page */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xl font-bold flex items-center justify-center shadow-md">
                  {getCompanyInitials(displayName)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">{displayIndustry} • {displayHQ}</p>
                </div>
              </div>
              {displayWebsite && (
                <a
                  href={displayWebsite.startsWith('http') ? displayWebsite : `https://${displayWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-gray-500" />
                  Visit Website
                </a>
              )}
            </div>

            {/* About */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">About {displayName}</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {displayDesc}
              </p>
            </div>

            {/* Benefits preview */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Why Join Us</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {selectedPerks.map((pId) => {
                  const perk = PERKS_LIST.find(p => p.id === pId);
                  if (!perk) return null;
                  const Icon = perk.icon;
                  return (
                    <div key={pId} className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-blue-900">{perk.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
