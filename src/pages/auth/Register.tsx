import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronLeft, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Globe, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  Users2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';

const INDUSTRIES = [
  'Information Technology & Software',
  'Banking, Financial Services & Insurance (BFSI)',
  'E-Commerce & Retail',
  'Healthcare & Pharmaceuticals',
  'Manufacturing & Production',
  'Telecommunications',
  'Media, Advertising & Entertainment',
  'Education & EdTech',
  'Management & Business Consulting',
  'Logistics & Supply Chain',
  'Other'
];

const COMPANY_SIZES = [
  '1-10 Employees (Startup / Seed)',
  '11-50 Employees (Growing Team)',
  '51-200 Employees (Mid-size)',
  '201-500 Employees (Scale-up)',
  '500+ Employees (Enterprise)'
];

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Personal & Credential Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Company Profile Fields
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [companySize, setCompanySize] = useState(COMPANY_SIZES[1]);
  const [headquarters, setHeadquarters] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validation
  const validateStep1 = () => {
    if (!name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid work email address');
      return false;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!designation.trim()) {
      setError('Please enter your designation / role at the company');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      setError('Please enter your company / organization name');
      return;
    }
    if (!headquarters.trim()) {
      setError('Please enter company city / location');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.post('/auth/register', {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password,
        role: 'RECRUITER',
        company: company.trim(),
        designation: designation.trim(),
        website: website.trim(),
        industry,
        companySize,
        headquarters: headquarters.trim()
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side - Interactive Multi-Step Form */}
        <div className="w-full lg:w-7/12 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Logo & Portal Badge */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <img src="/logo.png?v=20261104" alt="JoBuffer Logo" className="w-12 h-12 object-contain" />
                <img src="/logo-name.png?v=20261104" alt="JoBuffer" className="h-7 object-contain" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Recruiter Portal
              </span>
            </div>

            {/* Stepper Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create Recruiter Account
              </h1>
              <p className="text-slate-500 text-sm mt-1.5">
                Set up your company hiring profile and connect directly with verified candidates.
              </p>

              {/* Step Indicators */}
              <div className="flex items-center gap-3 mt-6">
                <div 
                  onClick={() => currentStep === 2 && setCurrentStep(1)}
                  className={`flex-1 flex items-center gap-2 pb-2.5 border-b-2 transition-all cursor-pointer ${
                    currentStep === 1 
                      ? 'border-blue-600 text-blue-600 font-semibold' 
                      : 'border-emerald-500 text-emerald-600 font-medium'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep === 1 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {currentStep === 2 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                  </div>
                  <span className="text-xs sm:text-sm">Recruiter Profile</span>
                </div>

                <div 
                  className={`flex-1 flex items-center gap-2 pb-2.5 border-b-2 transition-all ${
                    currentStep === 2 
                      ? 'border-blue-600 text-blue-600 font-semibold' 
                      : 'border-slate-200 text-slate-400 font-medium'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep === 2 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    2
                  </div>
                  <span className="text-xs sm:text-sm">Company Details</span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Account created! Verification code (OTP) has been dispatched to your email. Redirecting to login...</span>
              </div>
            )}

            {/* Step 1 Form: Recruiter Personal & Credentials */}
            {currentStep === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Official Work Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Official Work Email *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Mobile / WhatsApp Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Designation / Role */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Your Designation / Role *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Password (min. 6 characters) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Next Button */}
                <button
                  type="submit"
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Continue to Company Details
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}

            {/* Step 2 Form: Company Information */}
            {currentStep === 2 && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Company / Organization Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Company Website */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Company Website URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Industry */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Industry Sector *
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    >
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  {/* Company Size */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Company Size *
                    </label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    >
                      {COMPANY_SIZES.map((sz) => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Headquarters / City */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Headquarters / Office City *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      value={headquarters}
                      onChange={(e) => setHeadquarters(e.target.value)}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="py-3 px-4 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-medium text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || success}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? 'Creating Recruiter Account...' : 'Complete Registration'}
                    {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Link to Login */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">Already have an account?</span>
            <button 
              onClick={() => navigate('/login')} 
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer"
            >
              Sign In Instead
            </button>
          </div>
        </div>

        {/* Right Side - Professional Enterprise Branding & Trust Signals */}
        <div className="w-full lg:w-5/12 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Light Gradients */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Trusted by 500+ Hiring Teams
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
              Hire Top Talent Directly & Efficiently
            </h2>
            <p className="text-blue-100/90 text-sm leading-relaxed mb-8">
              Experience modern recruitment built for founders, HR leaders, and hiring managers. Streamline applicant review with direct contact access.
            </p>

            {/* Feature Highlights Grid */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center flex-shrink-0 text-blue-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Instant Applicant Access</h4>
                  <p className="text-xs text-blue-200/80 mt-0.5">
                    Review incoming candidate applications in real-time with comprehensive resumes and skill profiles.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center flex-shrink-0 text-blue-200">
                  <Users2 className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">1-Click Shortlisting</h4>
                  <p className="text-xs text-blue-200/80 mt-0.5">
                    Easily Shortlist or Reject applicants with a single click, keeping your hiring pipeline organized.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center flex-shrink-0 text-blue-200">
                  <ShieldCheck className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Direct Company Communication</h4>
                  <p className="text-xs text-blue-200/80 mt-0.5">
                    Get candidate phone numbers and verified email to schedule calls and interviews directly on your terms.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof / Stats Box */}
          <div className="relative z-10 pt-6 border-t border-white/15">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-xl sm:text-2xl font-black text-white block">10,000+</span>
                <span className="text-[11px] text-blue-200/80 block uppercase tracking-wider mt-0.5">Candidates</span>
              </div>
              <div className="border-x border-white/15">
                <span className="text-xl sm:text-2xl font-black text-white block">&lt; 24h</span>
                <span className="text-[11px] text-blue-200/80 block uppercase tracking-wider mt-0.5">First Response</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 block">100%</span>
                <span className="text-[11px] text-blue-200/80 block uppercase tracking-wider mt-0.5">Free Direct ATS</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
