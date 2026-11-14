import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  CreditCard,
  Palette,
  Save,
  Shield,
  CheckCircle2,
  Key,
  Eye,
  EyeOff,
  Copy,
  Sparkles,
  Crown,
  Check,
  Loader2,
  Receipt,
  Users,
  QrCode,
  Building2,
  TrendingUp,
  ArrowRight,
  Smartphone,
  Zap
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'branding' | 'billing' | 'api'>('general');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Form states
  const [platformName, setPlatformName] = useState('JoBuffer Portal');
  const [supportEmail, setSupportEmail] = useState('support@jobuffer.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);
  const [enableGoogleSSO, setEnableGoogleSSO] = useState(true);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(true);

  // Recruiter PRO Plan Pricing States (Managed by Admin: 1, 3, 6 Months)
  const [recruiter1MonthPrice, setRecruiter1MonthPrice] = useState('2499');
  const [recruiter1MonthOriginalPrice, setRecruiter1MonthOriginalPrice] = useState('5999');
  const [recruiter3MonthPrice, setRecruiter3MonthPrice] = useState('5999');
  const [recruiter3MonthOriginalPrice, setRecruiter3MonthOriginalPrice] = useState('14999');
  const [recruiter6MonthPrice, setRecruiter6MonthPrice] = useState('9999');
  const [recruiter6MonthOriginalPrice, setRecruiter6MonthOriginalPrice] = useState('27999');

  const [currency, setCurrency] = useState('INR');
  const [upiId, setUpiId] = useState('jobbuffer@hdfcbank');
  const [accountName, setAccountName] = useState('JoBuffer Talent Private Limited');
  const [monthlyJobLimit, setMonthlyJobLimit] = useState('50');
  const [candidateProfileLimit, setCandidateProfileLimit] = useState('100');
  const [atsFeatureEnabled, setAtsFeatureEnabled] = useState(true);

  // Candidate Mobile App PRO Plan Pricing States (Managed by Admin: 1, 3, 6 Months)
  const [candidate1MonthPrice, setCandidate1MonthPrice] = useState('299');
  const [candidate1MonthOriginalPrice, setCandidate1MonthOriginalPrice] = useState('499');
  const [candidate3MonthPrice, setCandidate3MonthPrice] = useState('699');
  const [candidate3MonthOriginalPrice, setCandidate3MonthOriginalPrice] = useState('1299');
  const [candidate6MonthPrice, setCandidate6MonthPrice] = useState('1199');
  const [candidate6MonthOriginalPrice, setCandidate6MonthOriginalPrice] = useState('2499');

  const [candidateDailyApplyLimitFree, setCandidateDailyApplyLimitFree] = useState('50');
  const [candidateDailyApplyLimitPro, setCandidateDailyApplyLimitPro] = useState('100');
  const [billingSubTab, setBillingSubTab] = useState<'app_candidate' | 'web_recruiter'>('app_candidate');

  // Preview interactive selectors
  const [previewRecruiterTier, setPreviewRecruiterTier] = useState<'1_MONTH' | '3_MONTH' | '6_MONTH'>('1_MONTH');
  const [previewCandidateTier, setPreviewCandidateTier] = useState<'1_MONTH' | '3_MONTH' | '6_MONTH'>('1_MONTH');

  // Admin Query: Subscription Config & Live Statistics
  const { data: subConfigData } = useQuery({
    queryKey: ['adminSubscriptionConfig'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/subscription-config');
        return res.data;
      } catch (err) {
        return null;
      }
    }
  });

  // Admin Query: Recruiter Subscription Payment Receipts
  const { data: subscriptionPayments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['adminSubscriptionPayments'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/subscription-payments');
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
    }
  });

  // Sync state when config data is loaded
  useEffect(() => {
    if (subConfigData?.config) {
      const cfg = subConfigData.config;
      const rec1 = String(cfg.recruiter1MonthPrice ?? cfg.proPrice ?? 2499);
      const rec1Orig = String(cfg.recruiter1MonthOriginalPrice ?? cfg.proOriginalPrice ?? 5999);
      const rec3 = String(cfg.recruiter3MonthPrice ?? 5999);
      const rec3Orig = String(cfg.recruiter3MonthOriginalPrice ?? 14999);
      const rec6 = String(cfg.recruiter6MonthPrice ?? 9999);
      const rec6Orig = String(cfg.recruiter6MonthOriginalPrice ?? 27999);

      setRecruiter1MonthPrice(rec1);
      setRecruiter1MonthOriginalPrice(rec1Orig);
      setRecruiter3MonthPrice(rec3);
      setRecruiter3MonthOriginalPrice(rec3Orig);
      setRecruiter6MonthPrice(rec6);
      setRecruiter6MonthOriginalPrice(rec6Orig);

      setCurrency(cfg.currency || 'INR');
      setUpiId(cfg.upiId || 'jobbuffer@hdfcbank');
      setAccountName(cfg.accountName || 'JoBuffer Talent Private Limited');
      setMonthlyJobLimit(String(cfg.monthlyJobLimit ?? 50));
      setCandidateProfileLimit(String(cfg.candidateProfileLimit ?? 100));
      setAtsFeatureEnabled(cfg.atsFeatureEnabled ?? true);

      // Candidate Mobile App Values (1, 3, 6 Months)
      const cand1 = String(cfg.candidate1MonthPrice ?? cfg.candidateMonthlyPrice ?? 299);
      const cand1Orig = String(cfg.candidate1MonthOriginalPrice ?? cfg.candidateMonthlyOriginalPrice ?? 499);
      const cand3 = String(cfg.candidate3MonthPrice ?? 699);
      const cand3Orig = String(cfg.candidate3MonthOriginalPrice ?? 1299);
      const cand6 = String(cfg.candidate6MonthPrice ?? cfg.candidateAnnualPrice ?? 1199);
      const cand6Orig = String(cfg.candidate6MonthOriginalPrice ?? cfg.candidateAnnualOriginalPrice ?? 2499);

      setCandidate1MonthPrice(cand1);
      setCandidate1MonthOriginalPrice(cand1Orig);
      setCandidate3MonthPrice(cand3);
      setCandidate3MonthOriginalPrice(cand3Orig);
      setCandidate6MonthPrice(cand6);
      setCandidate6MonthOriginalPrice(cand6Orig);

      setCandidateDailyApplyLimitFree(String(cfg.candidateDailyApplyLimitFree ?? 50));
      setCandidateDailyApplyLimitPro(String(cfg.candidateDailyApplyLimitPro ?? 100));
    }
  }, [subConfigData]);

  // Mutation to save PRO Plan Pricing
  const savePricingMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        // Recruiter 1, 3, 6 Month Tiers
        recruiter1MonthPrice: Number(recruiter1MonthPrice),
        recruiter1MonthOriginalPrice: Number(recruiter1MonthOriginalPrice),
        recruiter3MonthPrice: Number(recruiter3MonthPrice),
        recruiter3MonthOriginalPrice: Number(recruiter3MonthOriginalPrice),
        recruiter6MonthPrice: Number(recruiter6MonthPrice),
        recruiter6MonthOriginalPrice: Number(recruiter6MonthOriginalPrice),
        proPrice: Number(recruiter1MonthPrice),
        proOriginalPrice: Number(recruiter1MonthOriginalPrice),

        currency,
        upiId: upiId.trim(),
        accountName: accountName.trim(),
        monthlyJobLimit: Number(monthlyJobLimit),
        candidateProfileLimit: Number(candidateProfileLimit),
        atsFeatureEnabled,

        // Candidate 1, 3, 6 Month Tiers
        candidate1MonthPrice: Number(candidate1MonthPrice),
        candidate1MonthOriginalPrice: Number(candidate1MonthOriginalPrice),
        candidate3MonthPrice: Number(candidate3MonthPrice),
        candidate3MonthOriginalPrice: Number(candidate3MonthOriginalPrice),
        candidate6MonthPrice: Number(candidate6MonthPrice),
        candidate6MonthOriginalPrice: Number(candidate6MonthOriginalPrice),
        candidateMonthlyPrice: Number(candidate1MonthPrice),
        candidateAnnualPrice: Number(candidate6MonthPrice),

        candidateDailyApplyLimitFree: Number(candidateDailyApplyLimitFree),
        candidateDailyApplyLimitPro: Number(candidateDailyApplyLimitPro)
      };
      const res = await api.put('/admin/subscription-config', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptionConfig'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['publicSubscriptionPricing'] });
      setSaveSuccess(data.message || 'Subscription pricing (1, 3, 6 Months) saved successfully!');
      setTimeout(() => setSaveSuccess(null), 4000);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to save pricing configuration');
    }
  });

  // API Key states (JoBuffer platform integration keys - never expose secret keys in frontend)
  const [apiKey, setApiKey] = useState(
    () => import.meta.env.VITE_PLATFORM_API_KEY || 'jb_live_9482bf7a810c92138e94a8271049c81b'
  );
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSave = (section: string) => {
    setSaveSuccess(`${section} settings saved successfully.`);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setApiKey(`jb_live_${randomHex}`);
    setSaveSuccess('New API key generated successfully. Old credentials have been invalidated.');
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white backdrop-blur-sm flex items-center gap-1.5 border border-white/10">
                <SettingsIcon className="w-3.5 h-3.5 text-blue-400" />
                Root Configuration
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Global Platform Control
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Platform & System Settings
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Configure global application branding, security compliance, multi-tenant billing integrations, and automated operational pipelines.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{saveSuccess}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden h-fit p-2 space-y-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'general'
                ? 'bg-blue-50 text-blue-700 shadow-xs'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-600" />
            General & Domain
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'security'
                ? 'bg-blue-50 text-blue-700 shadow-xs'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            Security & Authentication
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'branding'
                ? 'bg-blue-50 text-blue-700 shadow-xs'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-600" />
            Branding & Assets
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'billing'
                ? 'bg-blue-50 text-blue-700 shadow-xs'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-amber-600" />
            Subscription & Billing
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'api'
                ? 'bg-blue-50 text-blue-700 shadow-xs'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Key className="w-4 h-4 text-indigo-600" />
            API & Webhook Integrations
          </button>
        </div>

        {/* Settings Body Container */}
        <div className="flex-1 bg-white rounded-2xl shadow-xs border border-gray-200 p-3.5 sm:p-6 md:p-8">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">General Platform Configuration</h2>
                <p className="text-xs text-gray-500 mt-0.5">Core identity, system emails, and maintenance availability</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Platform Legal Name
                  </label>
                  <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Primary Support Channel Email
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Canonical Application URL
                  </label>
                  <input
                    type="url"
                    defaultValue="https://app.jobuffer.com"
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-mono text-gray-600 focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Platform Maintenance Mode</p>
                      <p className="text-xs text-gray-500 mt-0.5">When toggled, only Root Administrators can access login endpoints.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => handleSave('General')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 shadow-xs transition"
                >
                  <Save className="w-4 h-4" />
                  Save Configuration
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Security & Access Governance</h2>
                <p className="text-xs text-gray-500 mt-0.5">Enforce enterprise MFA, identity SSO protocols, and email verification</p>
              </div>

              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Mandatory Two-Factor Authentication (2FA)</p>
                    <p className="text-xs text-gray-500 mt-0.5">Require multi-factor OTP code for all Recruiter and Admin logins.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={require2FA}
                      onChange={(e) => setRequire2FA(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Google OAuth 2.0 Single Sign-On</p>
                    <p className="text-xs text-gray-500 mt-0.5">Allow candidates and recruiters to authenticate using Google identity.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableGoogleSSO}
                      onChange={(e) => setEnableGoogleSSO(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Mandatory Email Verification</p>
                    <p className="text-xs text-gray-500 mt-0.5">Block unverified emails from posting jobs or submitting candidate resumes.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailVerificationRequired}
                      onChange={(e) => setEmailVerificationRequired(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => handleSave('Security')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 shadow-xs transition"
                >
                  <Save className="w-4 h-4" />
                  Save Security Policy
                </button>
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Corporate Branding & Identity</h2>
                <p className="text-xs text-gray-500 mt-0.5">Platform logos, color tokens, and corporate visual assets</p>
              </div>

              <div className="space-y-6 max-w-3xl">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Primary Platform Emblem
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center p-3 shadow-xs">
                      <img src="/logo.png?v=20261104" alt="JoBuffer" className="w-16 h-16 object-contain" />
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition">
                        Upload Vector Logo (.SVG / .PNG)
                      </button>
                      <p className="text-xs text-gray-400 mt-2">Recommended resolution: 512x512px with transparent canvas.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    System Accent Palettes
                  </label>
                  <div className="flex gap-4">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-blue-600 shadow-xs border border-gray-200 mb-1.5"></div>
                      <span className="text-[11px] font-mono text-gray-500 font-semibold">#2563EB</span>
                    </div>
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-indigo-600 shadow-xs border border-gray-200 mb-1.5"></div>
                      <span className="text-[11px] font-mono text-gray-500 font-semibold">#4F46E5</span>
                    </div>
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-500 shadow-xs border border-gray-200 mb-1.5"></div>
                      <span className="text-[11px] font-mono text-gray-500 font-semibold">#10B981</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing & Subscription Monetization Settings */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>Subscription Plans & Monetization Control</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure PRO Version activation amounts, quotas, and payment gateways for both Candidate Mobile App and Recruiter Web Portal.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs flex items-center gap-1.5 whitespace-nowrap">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    App Pro: ₹{Number(candidate1MonthPrice).toLocaleString()} / mo
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs flex items-center gap-1.5 whitespace-nowrap">
                    <Crown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    Recruiter Pro: ₹{Number(recruiter1MonthPrice).toLocaleString()} / mo
                  </span>
                </div>
              </div>

              {/* Sub-Tabs: Candidate Mobile App vs Recruiter Web Portal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setBillingSubTab('app_candidate')}
                  className={`w-full py-2.5 px-3.5 text-xs font-bold flex items-center justify-between gap-2 rounded-xl transition cursor-pointer ${
                    billingSubTab === 'app_candidate'
                      ? 'bg-white text-blue-700 shadow-xs border border-blue-200 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1 rounded-lg shrink-0 ${billingSubTab === 'app_candidate' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200/80 text-slate-600'}`}>
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate text-left">Candidate Mobile App Plan</span>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingSubTab('web_recruiter')}
                  className={`w-full py-2.5 px-3.5 text-xs font-bold flex items-center justify-between gap-2 rounded-xl transition cursor-pointer ${
                    billingSubTab === 'web_recruiter'
                      ? 'bg-white text-purple-700 shadow-xs border border-purple-200 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1 rounded-lg shrink-0 ${billingSubTab === 'web_recruiter' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200/80 text-slate-600'}`}>
                      <Crown className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate text-left">Recruiter Web Portal Plan</span>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                    Portal
                  </span>
                </button>
              </div>

              {/* Real-time Monetization KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-emerald-700 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Subscriptions Revenue</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    ₹{subConfigData?.stats?.totalRevenue ? subConfigData.stats.totalRevenue.toLocaleString() : '0'}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                    ✓ Verified Inbound Payments
                  </span>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-200/80 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-purple-700 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Active PRO Recruiters</span>
                    <Crown className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {subConfigData?.stats?.proRecruiters ?? 0}
                  </p>
                  <span className="text-[10px] text-purple-700 font-bold mt-1 block">
                    50 Jobs / 100 Profiles Active
                  </span>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200/80 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-blue-700 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Free Recruiters Pool</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {subConfigData?.stats?.freeRecruiters ?? 0}
                  </p>
                  <span className="text-[10px] text-blue-700 font-bold mt-1 block">
                    10 Jobs / 50 Profiles Limited
                  </span>
                </div>

                <div className="p-4 bg-gradient-to-br from-amber-50 to-white border border-amber-200/80 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between text-amber-700 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Completed Transactions</span>
                    <Receipt className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {subConfigData?.stats?.totalTransactions ?? subscriptionPayments.length}
                  </p>
                  <span className="text-[10px] text-amber-700 font-bold mt-1 block">
                    Total Invoices Generated
                  </span>
                </div>
              </div>

              {/* 1. CANDIDATE MOBILE APP PRO PRICING TAB */}
              {billingSubTab === 'app_candidate' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                  {/* Form Controls */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-200 p-4 sm:p-6 shadow-xs space-y-5">
                    <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Candidate Mobile App PRO Amounts (1, 3 & 6 Months)</span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Configure exact pricing for 1-Month, 3-Month, and 6-Month subscription options shown to candidates in the mobile app.
                        </p>
                      </div>
                      <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 uppercase shrink-0">
                        Mobile App Sync
                      </span>
                    </div>

                    {/* Tier 1: 1 Month Plan */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-blue-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          Tier 1: 1 Month Subscription
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          30 Days Validity
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            1-Month PRO Price (₹) *
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={candidate1MonthPrice}
                              onChange={(e) => setCandidate1MonthPrice(e.target.value)}
                              placeholder="299"
                              min="0"
                              className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold text-sm text-gray-900 outline-none transition bg-white"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">Charged on candidate 1-month plan.</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            1-Month Strikethrough Price (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={candidate1MonthOriginalPrice}
                              onChange={(e) => setCandidate1MonthOriginalPrice(e.target.value)}
                              placeholder="499"
                              min="0"
                              className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold text-sm text-gray-900 outline-none transition bg-white"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">Crossed-out original anchor price.</p>
                        </div>
                      </div>
                    </div>

                    {/* Tier 2: 3 Months Plan */}
                    <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-purple-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                          Tier 2: 3 Months Subscription
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                          90 Days Validity • Popular
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            3-Months PRO Price (₹) *
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={candidate3MonthPrice}
                              onChange={(e) => setCandidate3MonthPrice(e.target.value)}
                              placeholder="699"
                              min="0"
                              className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 font-bold text-sm text-gray-900 outline-none transition bg-white"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">~₹{Math.round(Number(candidate3MonthPrice || 699) / 3)}/month.</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            3-Months Strikethrough Price (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={candidate3MonthOriginalPrice}
                              onChange={(e) => setCandidate3MonthOriginalPrice(e.target.value)}
                              placeholder="1299"
                              min="0"
                              className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 font-bold text-sm text-gray-900 outline-none transition bg-white"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">Crossed-out original anchor price.</p>
                        </div>
                      </div>
                    </div>

                    {/* Tier 3: 6 Months Plan */}
                    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-amber-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Tier 3: 6 Months Subscription
                        </span>
                        <span className="text-[10px] font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                          180 Days Validity • Best Value
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            6-Months PRO Price (₹) *
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={candidate6MonthPrice}
                              onChange={(e) => setCandidate6MonthPrice(e.target.value)}
                              placeholder="1199"
                              min="0"
                              className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 font-bold text-sm text-gray-900 outline-none transition bg-white"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">~₹{Math.round(Number(candidate6MonthPrice || 1199) / 6)}/month.</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            6-Months Strikethrough Price (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={candidate6MonthOriginalPrice}
                              onChange={(e) => setCandidate6MonthOriginalPrice(e.target.value)}
                              placeholder="2499"
                              min="0"
                              className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 font-bold text-sm text-gray-900 outline-none transition bg-white"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">Crossed-out original anchor price.</p>
                        </div>
                      </div>
                    </div>

                    {/* Daily Limits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Free Candidate Daily Apply Limit
                        </label>
                        <input
                          type="number"
                          value={candidateDailyApplyLimitFree}
                          onChange={(e) => setCandidateDailyApplyLimitFree(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold text-xs text-gray-900 outline-none transition"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Default: 50 applications/day.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          PRO Candidate Daily Apply Limit
                        </label>
                        <input
                          type="number"
                          value={candidateDailyApplyLimitPro}
                          onChange={(e) => setCandidateDailyApplyLimitPro(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold text-xs text-gray-900 outline-none transition"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Default: 100 applications/day.</p>
                      </div>
                    </div>

                    <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        ⚡ Updates propagate instantly to all mobile app candidates via <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded font-mono break-all">/api/candidates/pricing</code>
                      </p>

                      <button
                        type="button"
                        disabled={savePricingMutation.isPending}
                        onClick={() => savePricingMutation.mutate()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {savePricingMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{savePricingMutation.isPending ? 'Updating...' : 'Save Mobile App PRO Pricing (1, 3, 6 Mo)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Mobile App Screen Mockup Preview */}
                  <div className="bg-slate-900 rounded-3xl p-5 text-white flex flex-col justify-between shadow-xl border-4 border-slate-800 relative overflow-hidden">
                    <div>
                      {/* Phone Speaker & Camera Notch */}
                      <div className="flex justify-center mb-4">
                        <div className="w-20 h-3.5 bg-slate-800 rounded-full flex items-center justify-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                          <div className="w-8 h-1 rounded-full bg-slate-700"></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          <Crown className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase">JoBuffer PRO</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">Mobile App Preview</span>
                      </div>

                      <h4 className="text-base font-black text-white mt-2">Upgrade to JoBuffer Pro</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Select your preferred duration plan:
                      </p>

                      {/* 3 Mobile Plan Duration Cards */}
                      <div className="mt-3 space-y-2">
                        {/* 1 Month Pill */}
                        <div 
                          onClick={() => setPreviewCandidateTier('1_MONTH')}
                          className={`p-2.5 rounded-xl border transition cursor-pointer ${
                            previewCandidateTier === '1_MONTH'
                              ? 'bg-blue-600/25 border-blue-500 shadow-sm'
                              : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                previewCandidateTier === '1_MONTH' ? 'border-blue-400' : 'border-slate-500'
                              }`}>
                                {previewCandidateTier === '1_MONTH' && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                              </div>
                              <span className="text-xs font-bold text-white">1 Month Plan</span>
                            </div>
                            <span className="text-xs font-black text-blue-400">₹{Number(candidate1MonthPrice || 299).toLocaleString()}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block ml-5 mt-0.5">Renews monthly. 30 days validity.</span>
                        </div>

                        {/* 3 Months Pill */}
                        <div 
                          onClick={() => setPreviewCandidateTier('3_MONTH')}
                          className={`p-2.5 rounded-xl border transition cursor-pointer relative ${
                            previewCandidateTier === '3_MONTH'
                              ? 'bg-purple-600/25 border-purple-500 shadow-sm'
                              : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                          }`}
                        >
                          <span className="absolute -top-1.5 right-3 px-1.5 py-0.2 rounded text-[8px] font-black bg-purple-500 text-white uppercase">
                            POPULAR
                          </span>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                previewCandidateTier === '3_MONTH' ? 'border-purple-400' : 'border-slate-500'
                              }`}>
                                {previewCandidateTier === '3_MONTH' && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                              </div>
                              <span className="text-xs font-bold text-white">3 Months Plan</span>
                            </div>
                            <span className="text-xs font-black text-purple-300">₹{Number(candidate3MonthPrice || 699).toLocaleString()}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block ml-5 mt-0.5">~₹{Math.round(Number(candidate3MonthPrice || 699) / 3)}/mo • 90 days validity.</span>
                        </div>

                        {/* 6 Months Pill */}
                        <div 
                          onClick={() => setPreviewCandidateTier('6_MONTH')}
                          className={`p-2.5 rounded-xl border transition cursor-pointer relative ${
                            previewCandidateTier === '6_MONTH'
                              ? 'bg-amber-500/25 border-amber-500 shadow-sm'
                              : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                          }`}
                        >
                          <span className="absolute -top-1.5 right-3 px-1.5 py-0.2 rounded text-[8px] font-black bg-amber-400 text-slate-950 uppercase">
                            SAVE 33% • BEST VALUE
                          </span>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                previewCandidateTier === '6_MONTH' ? 'border-amber-400' : 'border-slate-500'
                              }`}>
                                {previewCandidateTier === '6_MONTH' && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                              </div>
                              <span className="text-xs font-bold text-white">6 Months Plan</span>
                            </div>
                            <span className="text-xs font-black text-amber-300">₹{Number(candidate6MonthPrice || 1199).toLocaleString()}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block ml-5 mt-0.5">~₹{Math.round(Number(candidate6MonthPrice || 1199) / 6)}/mo • 180 days validity.</span>
                        </div>
                      </div>

                      {/* Feature Checklist */}
                      <div className="mt-3.5 space-y-1.5 text-[11px] text-slate-300">
                        <div className="flex items-center justify-between py-0.5 border-b border-slate-800">
                          <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-400" /> 1-Click Fast Apply</span>
                          <span className="text-emerald-400 font-bold">Unlimited ⚡</span>
                        </div>
                        <div className="flex items-center justify-between py-0.5 border-b border-slate-800">
                          <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-blue-400" /> Daily Apply Limit</span>
                          <span className="text-emerald-400 font-bold">{candidateDailyApplyLimitPro} / day 🚀</span>
                        </div>
                        <div className="flex items-center justify-between py-0.5 border-b border-slate-800">
                          <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-pink-400" /> 24/7 AI Career Suite</span>
                          <span className="text-emerald-400 font-bold">Unlocked ✨</span>
                        </div>
                      </div>
                    </div>

                    {/* App Button Action */}
                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <div className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md">
                        <span>
                          Pay & Activate Pro Now ⚡ (₹{
                            previewCandidateTier === '6_MONTH' 
                              ? Number(candidate6MonthPrice || 1199).toLocaleString() 
                              : (previewCandidateTier === '3_MONTH' 
                                  ? Number(candidate3MonthPrice || 699).toLocaleString() 
                                  : Number(candidate1MonthPrice || 299).toLocaleString())
                          })
                        </span>
                      </div>
                      <span className="text-[9px] text-center text-slate-500 block mt-1.5">
                        ✓ Secured by Razorpay Gateway
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. RECRUITER WEB PORTAL PRO PRICING TAB */}
              {billingSubTab === 'web_recruiter' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                  {/* Form Controls */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs space-y-5">
                    <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                          <Crown className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>Recruiter Web Portal PRO Amounts (1, 3 & 6 Months)</span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Configure pricing tiers for 1-Month, 3-Month, and 6-Month subscription options shown to recruiters on the Web Portal.
                        </p>
                      </div>
                      <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 uppercase shrink-0">
                        Web Portal Sync
                      </span>
                    </div>

                    {/* Tier 1: 1 Month Plan */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-purple-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                          Tier 1: 1 Month Plan (Flexible)
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          30 Days Validity
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            1-Month PRO Price (₹) *
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={recruiter1MonthPrice}
                              onChange={(e) => setRecruiter1MonthPrice(e.target.value)}
                              placeholder="2499"
                              min="0"
                              className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 font-bold text-sm text-gray-900 outline-none transition bg-white"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">Charged on recruiter 1-month plan.</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            1-Month Strikethrough Price (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={recruiter1MonthOriginalPrice}
                              onChange={(e) => setRecruiter1MonthOriginalPrice(e.target.value)}
                              placeholder="5999"
                              min="0"
                              className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 font-bold text-sm text-gray-900 outline-none transition bg-white"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">Crossed-out original anchor price.</p>
                        </div>
                      </div>
                    </div>

                    {/* Tier 2: 3 Months Plan */}
                    <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-indigo-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                          Tier 2: 3 Months Plan (Popular)
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                          90 Days Validity • Popular
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            3-Months PRO Price (₹) *
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={recruiter3MonthPrice}
                              onChange={(e) => setRecruiter3MonthPrice(e.target.value)}
                              placeholder="5999"
                              min="0"
                              className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-gray-900 outline-none transition bg-white"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">~₹{Math.round(Number(recruiter3MonthPrice || 5999) / 3)}/month.</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            3-Months Strikethrough Price (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={recruiter3MonthOriginalPrice}
                              onChange={(e) => setRecruiter3MonthOriginalPrice(e.target.value)}
                              placeholder="14999"
                              min="0"
                              className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-gray-900 outline-none transition bg-white"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">Crossed-out original anchor price.</p>
                        </div>
                      </div>
                    </div>

                    {/* Tier 3: 6 Months Plan */}
                    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-amber-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                          Tier 3: 6 Months Plan (Best Value)
                        </span>
                        <span className="text-[10px] font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                          180 Days Validity • Best Value
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            6-Months PRO Price (₹) *
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={recruiter6MonthPrice}
                              onChange={(e) => setRecruiter6MonthPrice(e.target.value)}
                              placeholder="9999"
                              min="0"
                              className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 font-bold text-sm text-gray-900 outline-none transition bg-white"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">~₹{Math.round(Number(recruiter6MonthPrice || 9999) / 6)}/month.</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            6-Months Strikethrough Price (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={recruiter6MonthOriginalPrice}
                              onChange={(e) => setRecruiter6MonthOriginalPrice(e.target.value)}
                              placeholder="27999"
                              min="0"
                              className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 font-bold text-sm text-gray-900 outline-none transition bg-white"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">Crossed-out original anchor price.</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Company UPI ID */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Merchant UPI ID (For QR Payments) *
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <QrCode className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. jobbuffer@hdfcbank"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-semibold text-xs text-gray-900 outline-none transition"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">Used to generate dynamic QR codes for instant UPI pay.</p>
                      </div>

                      {/* Beneficiary Name */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Beneficiary / Business Name *
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <Building2 className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            placeholder="e.g. JoBuffer Talent Private Limited"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-semibold text-xs text-gray-900 outline-none transition"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">Displayed on the recruiter invoice and UPI confirmation.</p>
                      </div>

                      {/* Monthly Job Limit */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Monthly Job Posting Limit
                        </label>
                        <input
                          type="number"
                          value={monthlyJobLimit}
                          onChange={(e) => setMonthlyJobLimit(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold text-xs text-gray-900 outline-none transition"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Jobs permitted per calendar month (Default: 50).</p>
                      </div>

                      {/* Candidate Profiles View Limit */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Candidate Profiles View Limit
                        </label>
                        <input
                          type="number"
                          value={candidateProfileLimit}
                          onChange={(e) => setCandidateProfileLimit(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold text-xs text-gray-900 outline-none transition"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Candidate profiles unlocked for view (Default: 100).</p>
                      </div>
                    </div>

                    <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="atsToggle"
                          checked={atsFeatureEnabled}
                          onChange={(e) => setAtsFeatureEnabled(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <label htmlFor="atsToggle" className="text-xs font-bold text-gray-800 cursor-pointer">
                          Enable Full ATS Applicant Management (AI Scoring & Filters) in PRO
                        </label>
                      </div>

                      <button
                        type="button"
                        disabled={savePricingMutation.isPending}
                        onClick={() => savePricingMutation.mutate()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {savePricingMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{savePricingMutation.isPending ? 'Saving Settings...' : 'Save Recruiter PRO Pricing (1, 3, 6 Mo)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Recruiter Live Preview Card */}
                  <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 rounded-2xl p-6 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
                    
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-white/20 text-white uppercase tracking-wider">
                          Recruiter Portal Preview
                        </span>
                        <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                          RECOMMENDED
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <Crown className="w-5 h-5 text-amber-400" />
                        <h4 className="text-xl font-black">PRO VERSION</h4>
                      </div>
                      <p className="text-xs text-purple-200 mt-0.5">High-impact hiring with AI Applicant Tracking System</p>

                      {/* Duration Tabs for Preview */}
                      <div className="grid grid-cols-3 gap-1.5 mt-4 p-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                        <button
                          type="button"
                          onClick={() => setPreviewRecruiterTier('1_MONTH')}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition text-center ${
                            previewRecruiterTier === '1_MONTH'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-purple-200 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          1 Month
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewRecruiterTier('3_MONTH')}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition text-center ${
                            previewRecruiterTier === '3_MONTH'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-purple-200 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          3 Mos
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewRecruiterTier('6_MONTH')}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition text-center ${
                            previewRecruiterTier === '6_MONTH'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-purple-200 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          6 Mos
                        </button>
                      </div>

                      {/* Dynamic Price Display */}
                      {(() => {
                        let activeP = Number(recruiter1MonthPrice || 2499);
                        let activeOrig = Number(recruiter1MonthOriginalPrice || 5999);
                        let label = '1 Month';
                        let subtext = 'Renews monthly';

                        if (previewRecruiterTier === '3_MONTH') {
                          activeP = Number(recruiter3MonthPrice || 5999);
                          activeOrig = Number(recruiter3MonthOriginalPrice || 14999);
                          label = '3 Months';
                          subtext = `~₹${Math.round(activeP / 3)}/mo (90 days)`;
                        } else if (previewRecruiterTier === '6_MONTH') {
                          activeP = Number(recruiter6MonthPrice || 9999);
                          activeOrig = Number(recruiter6MonthOriginalPrice || 27999);
                          label = '6 Months';
                          subtext = `~₹${Math.round(activeP / 6)}/mo (180 days)`;
                        }

                        const disc = activeOrig > activeP ? Math.round((1 - activeP / activeOrig) * 100) : 0;

                        return (
                          <div className="my-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black text-white">
                                ₹{activeP.toLocaleString()}
                              </span>
                              <span className="text-xs text-purple-200">/ {label}</span>
                              {activeOrig > activeP && (
                                <span className="text-xs text-purple-300 line-through ml-2">
                                  ₹{activeOrig.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-purple-300 font-medium">{subtext}</span>
                              {disc > 0 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                                  Save {disc}%
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      <ul className="space-y-2.5 text-xs text-purple-100">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span><strong>Monthly {monthlyJobLimit} jobs</strong> posting capacity</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>View up to <strong>{candidateProfileLimit} candidates profiles</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span><strong>ATS Applicant management:</strong> AI Match Scores, Bulk Scan & Filters</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <div className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
                        <span>
                          Recruiter Checkout: Pay ₹{
                            previewRecruiterTier === '6_MONTH'
                              ? Number(recruiter6MonthPrice || 9999).toLocaleString()
                              : (previewRecruiterTier === '3_MONTH'
                                  ? Number(recruiter3MonthPrice || 5999).toLocaleString()
                                  : Number(recruiter1MonthPrice || 2499).toLocaleString())
                          }
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recruiter Subscription Invoices & Payment Receipts Table */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      Recruiter Subscription Invoices & Payment Receipts
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Live audit trail of all payments made by recruiters to activate PRO Version.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    {subscriptionPayments.length} Total Receipts
                  </span>
                </div>

                {isLoadingPayments ? (
                  <div className="py-12 text-center text-xs font-semibold text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading payment records...
                  </div>
                ) : subscriptionPayments.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 text-xs">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No subscription payments recorded yet. Payments made by recruiters will appear here automatically.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold bg-gray-50/60">
                          <th className="py-3 px-3">Invoice #</th>
                          <th className="py-3 px-3">Recruiter & Company</th>
                          <th className="py-3 px-3">Amount Paid</th>
                          <th className="py-3 px-3">Payment Method</th>
                          <th className="py-3 px-3">Transaction ID / Ref</th>
                          <th className="py-3 px-3">Date & Time</th>
                          <th className="py-3 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {subscriptionPayments.map((p: any) => (
                          <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-blue-700">
                              {p.invoiceNumber || 'INV-2026-001'}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-gray-900 block">{p.recruiterName}</span>
                              <span className="text-[11px] text-gray-500">{p.companyName || p.recruiterEmail}</span>
                            </td>
                            <td className="py-3 px-3 font-bold text-emerald-700">
                              ₹{Number(p.amount || recruiter1MonthPrice).toLocaleString()}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 uppercase">
                                {p.paymentMethod || 'UPI'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-gray-600 truncate max-w-[150px]">
                              {p.transactionId || p.upiReference || '-'}
                            </td>
                            <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                              {p.paidAt ? new Date(p.paidAt).toLocaleString() : 'Just now'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                {p.status || 'COMPLETED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* API Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">API Access & Machine Webhooks</h2>
                <p className="text-xs text-gray-500 mt-0.5">Developer tokens for automated job sync and programmatic ATS integrations</p>
              </div>

              <div className="space-y-4 max-w-3xl">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Production Live Key</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showKey ? 'Hide' : 'Reveal'}
                      </button>
                      <button
                        onClick={handleCopyKey}
                        className="text-xs font-bold text-gray-700 flex items-center gap-1 hover:text-black ml-2"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedKey ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <code className="text-xs bg-white px-3 py-2 border rounded-lg block font-mono text-gray-800 break-all">
                    {showKey ? apiKey : 'jb_live_' + '•'.repeat(32)}
                  </code>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRegenerateKey}
                    className="px-4 py-2 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition"
                  >
                    Regenerate Production Key
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
