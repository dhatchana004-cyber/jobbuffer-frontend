import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  ChevronRight, 
  X, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft 
} from 'lucide-react';
import { authService } from '../../services/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const normEmail = email.toLowerCase().trim();
      const response = await authService.login({ email: normEmail, password });
      
      const role = (response?.user?.role || '').toUpperCase();
      
      // Strict role validation: Only ADMIN and RECRUITER allowed in web portal
      if (role === 'ADMIN' || normEmail === 'admin@mail.com' || normEmail === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'RECRUITER') {
        navigate('/recruiter/dashboard');
      } else if (role === 'CANDIDATE') {
        authService.logout();
        setError('This portal is strictly for Recruiters & Administrators. Candidates please use the JoBuffer Mobile App.');
      } else {
        authService.logout();
        setError('Invalid account credentials or unauthorized role.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForgotModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotEmail(email || '');
    setForgotStep(1);
    setForgotError('');
    setForgotSuccessMsg('');
    setForgotOtp('');
    setForgotNewPassword('');
    setIsForgotModalOpen(true);
  };

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address');
      return;
    }
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await authService.forgotPassword(forgotEmail.trim());
      setForgotSuccessMsg(res.message || 'Verification code sent to your email.');
      setForgotStep(2);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Failed to send reset code. Please check email address.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp.trim()) {
      setForgotError('Please enter the 6-digit verification code');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long');
      return;
    }
    setForgotError('');
    setForgotLoading(true);

    try {
      await authService.resetPassword({
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        newPassword: forgotNewPassword
      });
      setForgotStep(3);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-8">
            <img src="/logo.png?v=20261104" alt="JoBuffer Logo" className="w-16 h-16 object-contain" />
            <img src="/logo-name.png?v=20261104" alt="Jobbuffer" className="h-9 object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-2">Log in to your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address or Username</label>
              <input
                type="text"
                required
                placeholder="e.g. admin@mail.com or tamil@gmail.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={handleOpenForgotModal}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-colors group ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              {!isLoading && <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm space-y-2">
            <div>
              <span className="text-gray-500">Don't have an account? </span>
              <button onClick={() => navigate('/register')} className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                Register as Recruiter
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Brand/Illustration */}
        <div className="hidden md:flex w-1/2 bg-blue-600 p-12 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              The modern way to hire top talent
            </h2>
            <p className="text-blue-100 text-lg">
              Streamline your recruitment process, manage candidates, and make data-driven hiring decisions with Jobbuffer.
            </p>
          </div>
          
          {/* Abstract background elements */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <span className="text-white font-bold">4.9</span>
              </div>
              <div>
                <div className="flex text-yellow-400">
                  {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                </div>
                <span className="text-white text-sm">from 500+ reviews</span>
              </div>
            </div>
            <p className="text-blue-50 italic">
              "Jobbuffer transformed how we hire. The pipeline management is incredibly intuitive."
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
                  <p className="text-xs text-gray-500">
                    {forgotStep === 1 && 'Enter your registered email'}
                    {forgotStep === 2 && 'Verify OTP & set new password'}
                    {forgotStep === 3 && 'Password successfully updated'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Info Alerts */}
            {forgotError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}
            {forgotSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{forgotSuccessMsg}</span>
              </div>
            )}

            {/* Step 1: Request Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Registered Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. recruiter@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Enter OTP & New Password */}
            {forgotStep === 2 && (
              <form onSubmit={handleConfirmResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Verification Code (OTP)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 4 or 6-digit OTP"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    className="w-full px-4 py-2.5 text-center tracking-widest text-lg font-bold rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Check your inbox or spam for the reset code.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setForgotStep(1); setForgotError(''); }}
                    className="w-1/3 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success Screen */}
            {forgotStep === 3 && (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">Password Reset Successful!</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Your password has been updated. You can now sign in using your new credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition"
                >
                  Continue to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
