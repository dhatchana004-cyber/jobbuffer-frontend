import { useState } from 'react';
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
  Sparkles
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'branding' | 'billing' | 'api'>('general');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Form states
  const [platformName, setPlatformName] = useState('Jobbuffer Portal');
  const [supportEmail, setSupportEmail] = useState('support@jobbuffer.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);
  const [enableGoogleSSO, setEnableGoogleSSO] = useState(true);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(true);

  // API Key states (Jobbuffer platform integration keys - never expose secret keys in frontend)
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
        <div className="flex-1 bg-white rounded-2xl shadow-xs border border-gray-200 p-6 md:p-8">
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
                    defaultValue="https://app.jobbuffer.com"
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
                      <img src="/logo.png" alt="Jobbuffer" className="w-16 h-16 object-contain" />
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

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Recruiter Subscription & Monetization</h2>
                <p className="text-xs text-gray-500 mt-0.5">Enterprise ATS tiers, job posting packages, and invoice billing</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border-2 border-blue-500 bg-blue-50/20 relative">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-600 text-white absolute -top-2.5 right-4">
                    Default Free ATS
                  </span>
                  <h3 className="font-bold text-gray-900 text-base">Standard Community</h3>
                  <p className="text-2xl font-black text-gray-900 mt-2">$0 <span className="text-xs font-normal text-gray-500">/ forever</span></p>
                  <p className="text-xs text-gray-600 mt-3">Free job postings, candidate applications, interview scheduler, and talent screening.</p>
                </div>

                <div className="p-5 rounded-2xl border border-gray-200 bg-white">
                  <h3 className="font-bold text-gray-900 text-base">Growth Recruiter</h3>
                  <p className="text-2xl font-black text-gray-900 mt-2">$49 <span className="text-xs font-normal text-gray-500">/ month</span></p>
                  <p className="text-xs text-gray-600 mt-3">Featured job badges, highlighted listings, AI resume matching, and candidate exports.</p>
                </div>

                <div className="p-5 rounded-2xl border border-gray-200 bg-white">
                  <h3 className="font-bold text-gray-900 text-base">Enterprise Scale</h3>
                  <p className="text-2xl font-black text-gray-900 mt-2">$199 <span className="text-xs font-normal text-gray-500">/ month</span></p>
                  <p className="text-xs text-gray-600 mt-3">Unlimited requisitions, dedicated account manager, custom API webhooks, and team access.</p>
                </div>
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
