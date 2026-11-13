import { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Save, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  Check, 
  Receipt,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useRecruiterPlan } from '../../hooks/useRecruiterPlan';

export default function RecruiterSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'security' | 'notifications'>('profile');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const {
    plan,
    isPro,
    maxJobs,
    maxProfiles,
    hasAts,
    subscription,
    pricing,
    openUpgradeModal,
    activatePlan,
    isActivating
  } = useRecruiterPlan();

  // Recruiter payment receipts query
  const { data: paymentsData } = useQuery({
    queryKey: ['recruiterSubscriptionPayments'],
    queryFn: async () => {
      try {
        const res = await api.get('/recruiter/subscription/payments');
        return res.data?.payments || [];
      } catch {
        return [];
      }
    }
  });
  const payments = Array.isArray(paymentsData) ? paymentsData : [];
  
  // Profile state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me');
        return res.data;
      } catch {
        return { name: 'Harish', email: 'harishselva1305@gmail.com', phone: '+91 9444123456' };
      }
    }
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) => {
      const res = await api.put('/auth/me', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setSaveSuccess('Profile information updated successfully!');
      setSaveError('');
      setTimeout(() => setSaveSuccess(''), 3000);
    },
    onError: (err: any) => {
      setSaveError(err.response?.data?.message || 'Failed to update profile.');
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/auth/me', { currentPassword, newPassword });
      return res.data;
    },
    onSuccess: () => {
      setPasswordSuccess('Password changed successfully!');
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3500);
    },
    onError: (err: any) => {
      setPasswordError(err.response?.data?.message || 'Failed to update password. Check your current password.');
    }
  });

  const getInitials = (n: string) => {
    if (!n) return 'RC';
    return n.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, phone });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    updatePasswordMutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account & Security Settings</h1>
        <p className="text-gray-500 text-xs md:text-sm mt-1">Manage your recruiter profile, authentication credentials, and notifications.</p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden h-fit">
          <nav className="flex flex-col p-2 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center px-4 py-3 text-xs font-bold rounded-xl transition-colors ${
                activeTab === 'profile' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4 mr-3" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl transition-colors ${
                activeTab === 'subscription' 
                  ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <Crown className="w-4 h-4 mr-3 text-amber-500" />
                Plan & Limits
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                isPro ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {plan}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center px-4 py-3 text-xs font-bold rounded-xl transition-colors ${
                activeTab === 'security' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Lock className="w-4 h-4 mr-3" />
              Password & Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center px-4 py-3 text-xs font-bold rounded-xl transition-colors ${
                activeTab === 'notifications' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-4 h-4 mr-3" />
              Preferences
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900">Personal Details</h2>
                <p className="text-xs text-gray-500 mt-0.5">Your official recruiter credentials visible to job seekers.</p>
              </div>

              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {getInitials(name || user?.name)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{user?.name || 'Recruiter'}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email || ''}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Enterprise Recruiter
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-xs font-semibold outline-none transition-all" 
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Displayed on messages sent to applicants.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Account Email Address
                  </label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold outline-none cursor-not-allowed" 
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Primary identifier used to log in and receive platform notifications.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Contact Phone Number
                  </label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-xs font-semibold outline-none transition-all" 
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Candidates can reach you on this number for scheduling confirmations.</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-gray-100">
                <button 
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    Recruiter Plan & Usage Limits
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Choose between Free Version and PRO Version to adjust job postings, profile views, and ATS capabilities.
                  </p>
                </div>
                <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isPro 
                    ? 'bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white shadow-xs' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}>
                  Current Plan: {plan}
                </span>
              </div>

              {/* Live Quota Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Monthly Job Postings
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-gray-900">
                      {subscription?.usage?.monthlyJobsPosted ?? 0}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      / {maxJobs} jobs
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (((subscription?.usage?.monthlyJobsPosted ?? 0) / maxJobs) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Candidate Profile Views
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-gray-900">
                      {subscription?.usage?.viewedProfilesCount ?? 0}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      / {maxProfiles} max
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (((subscription?.usage?.viewedProfilesCount ?? 0) / maxProfiles) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Applicant ATS Engine
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    {hasAts ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Unlocked & Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-rose-600" /> Locked on Free
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">
                    {hasAts ? 'AI Match Scores & Bulk ATS Scanner active' : 'Upgrade to PRO to unlock ATS features'}
                  </p>
                </div>
              </div>

              {/* Plan Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* FREE VERSION CARD */}
                <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  !isPro ? 'border-blue-500 bg-blue-50/20 shadow-xs' : 'border-gray-200 bg-white'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">FREE VERSION</h3>
                        <p className="text-xs text-gray-500">Starter package for small hiring</p>
                      </div>
                      {!isPro && (
                        <span className="px-2.5 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase">
                          Active Plan
                        </span>
                      )}
                    </div>

                    <div className="py-3 border-y border-gray-100 space-y-2.5">
                      <div className="flex items-start gap-2 text-xs font-semibold text-gray-800">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>10 limited jobs monthly posting</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs font-semibold text-gray-800">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Only view 50 candidates profiles</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs font-semibold text-gray-800">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Applicant management (basic review)</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-rose-500 font-semibold bg-rose-50/70 p-2 rounded-lg">
                        <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                        <span>ATS Match scoring & bulk scanner locked</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3">
                    <button
                      type="button"
                      disabled={!isPro || isActivating}
                      onClick={() => activatePlan('FREE')}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                        !isPro 
                          ? 'bg-gray-100 text-gray-500 cursor-default' 
                          : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 cursor-pointer shadow-xs'
                      }`}
                    >
                      {!isPro ? 'Current Active Plan' : 'Downgrade to Free Version'}
                    </button>
                  </div>
                </div>

                {/* PRO VERSION CARD */}
                <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                  isPro 
                    ? 'border-indigo-600 bg-gradient-to-b from-indigo-50/40 to-white shadow-md' 
                    : 'border-amber-400 bg-gradient-to-b from-amber-50/30 to-white'
                }`}>
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-xs">
                    RECOMMENDED
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-black text-gray-900 text-base flex items-center gap-1.5">
                          PRO VERSION
                          <Crown className="w-4 h-4 text-amber-500" />
                        </h3>
                        <p className="text-xs text-gray-500">Full power talent acquisition & ATS suite</p>
                      </div>
                      {isPro && (
                        <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-[10px] font-black uppercase shadow-xs">
                          Active Plan
                        </span>
                      )}
                    </div>

                    {/* Dynamic Pricing Display Set By Admin */}
                    <div className="my-2.5 p-3 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-gray-900">
                            {pricing?.currencySymbol || '₹'}{pricing?.proPrice?.toLocaleString() || '1,999'}
                          </span>
                          {pricing?.proOriginalPrice && pricing.proOriginalPrice > pricing.proPrice && (
                            <span className="text-xs line-through text-gray-400 font-semibold">
                              {pricing.currencySymbol}{pricing.proOriginalPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-gray-500"> / month</span>
                        </div>
                        <p className="text-[11px] text-indigo-700 font-medium mt-0.5">
                          Instant access to 50 jobs & ATS candidate scoring
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-extrabold rounded-lg shadow-2xs">
                          SAVE {pricing?.proOriginalPrice && pricing.proOriginalPrice > pricing.proPrice ? Math.round(((pricing.proOriginalPrice - pricing.proPrice) / pricing.proOriginalPrice) * 100) : 60}%
                        </span>
                      </div>
                    </div>

                    <div className="py-3 border-y border-amber-100 space-y-2.5">
                      <div className="flex items-start gap-2 text-xs font-bold text-gray-900">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Monthly {pricing?.monthlyJobLimit || 50} jobs posting ({pricing?.monthlyJobLimit ? Math.round(pricing.monthlyJobLimit / 10) : 5}x Free limit)</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs font-bold text-gray-900">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>View up to {pricing?.candidateProfileLimit || 100} candidates profiles</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs font-bold text-gray-900 bg-indigo-50/80 p-2 rounded-lg border border-indigo-100">
                        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span>Applicant management with ATS (AI scoring, bulk scan & filters)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3">
                    <button
                      type="button"
                      disabled={isActivating}
                      onClick={() => {
                        if (isPro) {
                          openUpgradeModal('general');
                        } else {
                          openUpgradeModal('general');
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md ${
                        isPro 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs' 
                          : 'bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white cursor-pointer hover:shadow-lg'
                      }`}
                    >
                      {isActivating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing Plan...</span>
                        </>
                      ) : isPro ? (
                        <>
                          <Receipt className="w-4 h-4" />
                          <span>Manage Subscription / View Receipt</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Pay {pricing?.currencySymbol || '₹'}{pricing?.proPrice?.toLocaleString() || '1,999'} & Activate PRO</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Recruiter Invoices & Payment History */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-indigo-600" />
                      Subscription Payment Receipts & Invoices
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Official transaction receipts for your monthly subscription charges
                    </p>
                  </div>
                  {isPro && (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Membership
                    </span>
                  )}
                </div>

                {payments.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                    <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-600">No subscription payments yet</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      When you upgrade to the PRO plan, your tax invoices and receipts will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3">Invoice #</th>
                          <th className="px-4 py-3">Plan / Description</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Payment Method</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {payments.map((p: any) => (
                          <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                              {p.invoiceNumber}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-gray-900">{p.plan} Version Subscription</span>
                              <span className="text-[10px] text-gray-400 block">{p.transactionId}</span>
                            </td>
                            <td className="px-4 py-3 font-extrabold text-gray-900">
                              {p.currency === 'INR' ? '₹' : '$'}{Number(p.amount).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-gray-600 font-semibold uppercase text-[11px]">
                              {p.paymentMethod}
                            </td>
                            <td className="px-4 py-3 text-gray-500 font-medium">
                              {new Date(p.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => setSelectedReceipt(p)}
                                className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-[11px] transition inline-flex items-center gap-1"
                              >
                                <span>View</span>
                                <ExternalLink className="w-3 h-3 text-gray-500" />
                              </button>
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

          {activeTab === 'security' && (
            <form onSubmit={handleSavePassword} className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900">Change Account Password</h2>
                <p className="text-xs text-gray-500 mt-0.5">Protect your recruiter account with a strong, secure password.</p>
              </div>

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Current Password *
                  </label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-xs outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    New Password *
                  </label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-xs outline-none" 
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Must be at least 6 characters long.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Confirm New Password *
                  </label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 text-xs outline-none" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-gray-100">
                <button 
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                  className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {updatePasswordMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 mr-2" />
                  )}
                  <span>{updatePasswordMutation.isPending ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900">Notification Preferences</h2>
                <p className="text-xs text-gray-500 mt-0.5">Control how and when you receive candidate updates.</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Inbound Applications Alert</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Receive immediate notification whenever a candidate submits an application.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Candidate Direct Messages</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Get notified when a candidate replies to your messages or interview invitations.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Weekly Talent Digest</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Receive weekly summary reports of candidate activity and job views.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recruiter Invoice Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
            >
              ✕
            </button>

            <div className="text-center pb-4 border-b border-dashed border-gray-200">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-2">
                <Receipt className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-black text-gray-900">Subscription Tax Invoice</h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedReceipt.invoiceNumber}</p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Billed To</span>
                <span className="font-bold text-gray-900">{selectedReceipt.recruiterEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Plan Activated</span>
                <span className="font-bold text-gray-900">{selectedReceipt.plan} Version Plan</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Transaction ID</span>
                <span className="font-mono text-gray-700 font-semibold">{selectedReceipt.transactionId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Payment Mode</span>
                <span className="font-bold text-gray-800 uppercase">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Date & Time</span>
                <span className="text-gray-700 font-semibold">
                  {new Date(selectedReceipt.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded-xl border border-emerald-100">
                <span className="text-emerald-900 font-bold">Total Paid</span>
                <span className="text-emerald-900 font-black text-base">
                  {selectedReceipt.currency === 'INR' ? '₹' : '$'}{Number(selectedReceipt.amount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
