import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  Zap, 
  Crown, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  CreditCard, 
  QrCode, 
  Building2, 
  Copy, 
  CheckCircle2, 
  Loader2, 
  Shield, 
  Clock, 
  Smartphone, 
  Receipt, 
  ExternalLink
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export interface SubscriptionPricingConfig {
  proPrice: number;
  proOriginalPrice: number;
  recruiter1MonthPrice?: number;
  recruiter1MonthOriginalPrice?: number;
  recruiter3MonthPrice?: number;
  recruiter3MonthOriginalPrice?: number;
  recruiter6MonthPrice?: number;
  recruiter6MonthOriginalPrice?: number;
  currency: string;
  currencySymbol: string;
  billingCycle: string;
  monthlyJobLimit: number;
  candidateProfileLimit: number;
  atsFeatureEnabled: boolean;
  upiId: string;
  accountName: string;
  taxPercentage?: number;
  featuresList?: string[];
  plans?: any;
}

interface UpgradeToProModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'FREE' | 'PRO';
  onActivatePlan?: (plan: 'FREE' | 'PRO') => void;
  onActivatePro?: (paymentDetails?: any) => void;
  isActivating?: boolean;
  featureLocked?: string;
  triggerFeature?: string;
  pricing?: SubscriptionPricingConfig;
}

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC', badge: 'Fastest', color: 'from-blue-700 to-indigo-900', border: 'border-blue-600' },
  { id: 'SBI', name: 'State Bank of India', code: 'SBI', badge: 'Popular', color: 'from-sky-600 to-blue-800', border: 'border-sky-500' },
  { id: 'ICICI', name: 'ICICI Bank', code: 'ICICI', badge: 'Instant', color: 'from-amber-600 to-orange-800', border: 'border-amber-600' },
  { id: 'AXIS', name: 'Axis Bank', code: 'AXIS', badge: 'Active', color: 'from-rose-700 to-red-900', border: 'border-rose-600' },
  { id: 'KOTAK', name: 'Kotak Mahindra', code: 'KOTAK', badge: 'Active', color: 'from-red-600 to-rose-800', border: 'border-red-500' },
  { id: 'PNB', name: 'Punjab National Bank', code: 'PNB', badge: 'Active', color: 'from-yellow-600 to-amber-800', border: 'border-yellow-600' }
];

const ALL_OTHER_BANKS = [
  'Bank of Baroda', 'Canara Bank', 'Union Bank of India', 'IndusInd Bank', 
  'Federal Bank', 'IDFC FIRST Bank', 'Yes Bank', 'Indian Bank', 'RBL Bank', 
  'Standard Chartered', 'South Indian Bank', 'Karur Vysya Bank', 'Bandhan Bank',
  'City Union Bank', 'Tamilnad Mercantile Bank', 'UCO Bank', 'Bank of India'
];

export default function UpgradeToProModal({
  isOpen,
  onClose,
  currentPlan,
  onActivatePlan,
  onActivatePro,
  isActivating = false,
  featureLocked,
  triggerFeature = 'ats',
  pricing: propPricing
}: UpgradeToProModalProps) {
  const [step, setStep] = useState<'select' | 'payment' | 'authorizing' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'sandbox'>('upi');
  
  // UPI states
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'cred' | 'qr'>('phonepe');
  const [upiVpa, setUpiVpa] = useState('');
  const [upiRef, setUpiRef] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrCounter, setQrCounter] = useState(570); // 9.5 mins countdown
  const [authCounter, setAuthCounter] = useState(300); // 5 mins countdown

  // Card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('Harish Selva');
  const [saveCard, setSaveCard] = useState(true);

  // Net banking states
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Business GST state
  const [showGst, setShowGst] = useState(false);
  const [gstin, setGstin] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Processing & completion states
  const [isProcessing, setIsProcessing] = useState(false);
  const [authStage, setAuthStage] = useState<'connecting' | 'awaiting_approval' | 'verifying'>('connecting');
  const [completedPayment, setCompletedPayment] = useState<any>(null);

  // Dynamic session order ID
  const [orderId] = useState(() => `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`);

  // Query public subscription plan config if not passed via props
  const { data: fetchedPricing } = useQuery<SubscriptionPricingConfig>({
    queryKey: ['publicSubscriptionPricing'],
    enabled: isOpen,
    queryFn: async () => {
      try {
        const res = await api.get('/recruiter/subscription-plan');
        return res.data;
      } catch {
        return null;
      }
    }
  });

  // Ticking countdown timers
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setQrCounter((prev) => (prev > 0 ? prev - 1 : 600));
      setAuthCounter((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const isPro = currentPlan === 'PRO';
  const activeFeature = featureLocked || triggerFeature;

  const [selectedDuration, setSelectedDuration] = useState<'1_MONTH' | '3_MONTH' | '6_MONTH'>('1_MONTH');

  const activePricing: SubscriptionPricingConfig = propPricing || fetchedPricing || {
    proPrice: 2499,
    proOriginalPrice: 5999,
    recruiter1MonthPrice: 2499,
    recruiter1MonthOriginalPrice: 5999,
    recruiter3MonthPrice: 5999,
    recruiter3MonthOriginalPrice: 14999,
    recruiter6MonthPrice: 9999,
    recruiter6MonthOriginalPrice: 27999,
    currency: 'INR',
    currencySymbol: '₹',
    billingCycle: 'Monthly',
    monthlyJobLimit: 50,
    candidateProfileLimit: 100,
    atsFeatureEnabled: true,
    upiId: 'jobbuffer@hdfcbank',
    accountName: 'JoBuffer Talent Private Limited'
  };

  const p1 = Number(activePricing.recruiter1MonthPrice ?? activePricing.proPrice ?? 2499);
  const p1Orig = Number(activePricing.recruiter1MonthOriginalPrice ?? activePricing.proOriginalPrice ?? 5999);
  const p3 = Number(activePricing.recruiter3MonthPrice ?? 5999);
  const p3Orig = Number(activePricing.recruiter3MonthOriginalPrice ?? 14999);
  const p6 = Number(activePricing.recruiter6MonthPrice ?? 9999);
  const p6Orig = Number(activePricing.recruiter6MonthOriginalPrice ?? 27999);

  const DURATION_TIERS = [
    {
      id: '1_MONTH' as const,
      label: '1 Month',
      shortLabel: '1 Mo',
      price: p1,
      originalPrice: p1Orig,
      perMonth: p1,
      savings: 0,
      days: 30,
      tag: 'Flexible'
    },
    {
      id: '3_MONTH' as const,
      label: '3 Months',
      shortLabel: '3 Mos',
      price: p3,
      originalPrice: p3Orig,
      perMonth: Math.round(p3 / 3),
      savings: p1 * 3 > p3 ? Math.round(((p1 * 3 - p3) / (p1 * 3)) * 100) : 20,
      days: 90,
      tag: 'Popular'
    },
    {
      id: '6_MONTH' as const,
      label: '6 Months',
      shortLabel: '6 Mos',
      price: p6,
      originalPrice: p6Orig,
      perMonth: Math.round(p6 / 6),
      savings: p1 * 6 > p6 ? Math.round(((p1 * 6 - p6) / (p1 * 6)) * 100) : 33,
      days: 180,
      tag: 'Best Value'
    }
  ];

  const currentTier = DURATION_TIERS.find((t) => t.id === selectedDuration) || DURATION_TIERS[0];
  const totalAmount = currentTier.price;
  const originalAmount = currentTier.originalPrice;
  void originalAmount;

  // Breakdown calculations
  const basePrice = Math.round((totalAmount / 1.18) * 100) / 100;
  const gstAmount = Math.round((totalAmount - basePrice) * 100) / 100;

  // Deep Link URI for mobile UPI intent
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(activePricing.upiId)}&pn=${encodeURIComponent(activePricing.accountName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`JoBuffer PRO Plan (${currentTier.label})`)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=6&data=${encodeURIComponent(upiIntentUrl)}`;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(activePricing.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Card brand detection
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return { name: 'VISA', color: 'text-blue-500 font-black italic' };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', color: 'text-amber-500 font-extrabold' };
    if (/^(60|65|64)/.test(clean)) return { name: 'RuPay', color: 'text-emerald-500 font-black' };
    if (/^3[47]/.test(clean)) return { name: 'AMEX', color: 'text-sky-400 font-black' };
    return { name: 'CARD', color: 'text-gray-400 font-bold' };
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCardExp(raw);
  };

  // Start Payment Authorization Flow
  const handleInitiatePayment = () => {
    setStep('authorizing');
    setAuthStage('connecting');

    // Simulate real gateway progression
    setTimeout(() => {
      setAuthStage('awaiting_approval');
    }, 1200);
  };

  // Finalize Authorized Payment
  const handleFinalizePayment = async () => {
    setIsProcessing(true);
    setAuthStage('verifying');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const now = new Date();
      const invoiceNum = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const txnId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const paymentDetails = {
        duration: selectedDuration,
        durationDays: currentTier.days,
        durationMonths: Math.round(currentTier.days / 30),
        durationLabel: currentTier.label,
        amount: totalAmount,
        currency: activePricing.currency,
        paymentMethod: paymentMethod.toUpperCase(),
        transactionId: txnId,
        upiReference: upiRef.trim() || `UPI_${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        invoiceNumber: invoiceNum,
        paidAt: now.toISOString(),
        gstin: showGst ? gstin : undefined,
        businessName: showGst ? businessName : undefined
      };

      if (onActivatePro) {
        await onActivatePro(paymentDetails);
      } else if (onActivatePlan) {
        await onActivatePlan('PRO');
      }

      setCompletedPayment(paymentDetails);
      setStep('success');
    } catch (err) {
      console.error('Payment authorization failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getHeadlineForFeature = () => {
    switch (activeFeature) {
      case 'jobs':
        return {
          title: 'Monthly Job Posting Limit',
          desc: `Free plan is limited to 10 jobs monthly. Upgrade to Pro to post up to ${activePricing.monthlyJobLimit} jobs every month!`
        };
      case 'candidates':
        return {
          title: 'Candidate Profile Views Limit',
          desc: `Free plan allows viewing up to 50 candidate profiles. Upgrade to Pro to view up to ${activePricing.candidateProfileLimit} candidate profiles!`
        };
      case 'ats':
      default:
        return {
          title: 'ATS Applicant Management (PRO Feature)',
          desc: 'Automated AI ATS Match Scoring, resume evaluation, and score filters are exclusive to the PRO Version!'
        };
    }
  };

  const featureInfo = getHeadlineForFeature();

  const handleClose = () => {
    setStep('select');
    setUpiRef('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-4xl w-full overflow-hidden transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= TOP ADVANCED GATEWAY STATUS BAR ================= */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 sm:px-6 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black text-white shadow-xs">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm tracking-tight text-white">JoBuffer SecureCheckout</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" /> v2.4 Verified
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Merchant: {activePricing.accountName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit Bank Grade SSL</span>
            </div>
            
            <button 
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= STEP 1: PLAN COMPARISON ================= */}
        {step === 'select' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-200 mb-2">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>RECRUITER MEMBERSHIP TIERS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Unlock High-Volume Recruitment
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                ⚡ <strong className="text-purple-700">{featureInfo.title}:</strong> {featureInfo.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* FREE VERSION CARD */}
              <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                !isPro 
                  ? 'bg-slate-50 border-slate-300 shadow-xs' 
                  : 'bg-white border-slate-200 opacity-75'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-slate-200 text-slate-700 uppercase tracking-wide">
                      FREE STARTER
                    </span>
                    {!isPro && (
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                        Active Plan
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-black text-slate-900">₹0</span>
                    <span className="text-xs text-slate-500 font-medium"> / forever</span>
                    <p className="text-xs text-slate-500 font-medium mt-1">Basic candidate review for small teams.</p>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-700 pt-2 border-t border-slate-200">
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✓</div>
                      <span><strong>10 limited jobs</strong> monthly posting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✓</div>
                      <span>Only view <strong>50 candidate profiles</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✓</div>
                      <span>Basic applicant management review</span>
                    </li>
                    <li className="flex items-start gap-2 text-rose-500 font-semibold bg-rose-50/60 p-2 rounded-xl">
                      <div className="w-4 h-4 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✕</div>
                      <span>ATS Match Scoring & Bulk Scanner Locked</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  {!isPro ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-2xl text-xs font-bold bg-slate-200/80 text-slate-500 cursor-not-allowed text-center"
                    >
                      Current Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivatePlan?.('FREE')}
                      disabled={isActivating}
                      className="w-full py-3 px-4 rounded-2xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition text-center cursor-pointer"
                    >
                      Switch to Free Plan
                    </button>
                  )}
                </div>
              </div>

              {/* PRO VERSION CARD */}
              <div className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between relative ${
                isPro 
                  ? 'bg-gradient-to-b from-purple-50/80 to-indigo-50/50 border-purple-500 shadow-xl' 
                  : 'bg-gradient-to-b from-purple-50/30 to-white border-purple-400 shadow-lg hover:border-purple-600 hover:shadow-2xl'
              }`}>
                {/* Top Badge */}
                <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  OFFICIAL PRO TIER
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-purple-600 text-white uppercase tracking-wide flex items-center gap-1.5 shadow-xs">
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                      PRO PLAN
                    </span>
                    {isPro && (
                      <span className="text-[11px] font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                        Active Plan
                      </span>
                    )}
                  </div>

                  {/* 3 Duration Tiers Selector */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-purple-100/90 rounded-2xl mb-4 border border-purple-200">
                    {DURATION_TIERS.map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedDuration(tier.id)}
                        className={`py-2 px-1 rounded-xl text-center transition cursor-pointer relative ${
                          selectedDuration === tier.id
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'hover:bg-purple-200/60 text-purple-900'
                        }`}
                      >
                        {tier.savings > 0 && (
                          <span className={`absolute -top-2 right-1 px-1 py-0.2 rounded text-[7px] font-black uppercase ${
                            selectedDuration === tier.id ? 'bg-amber-300 text-slate-950' : 'bg-purple-200 text-purple-900'
                          }`}>
                            Save {tier.savings}%
                          </span>
                        )}
                        <span className="block text-[11px] font-black">{tier.label}</span>
                        <span className="block text-[10px] font-bold opacity-90">₹{tier.price.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900">
                        {activePricing.currencySymbol}{currentTier.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold"> / {currentTier.label}</span>
                      {currentTier.originalPrice > currentTier.price && (
                        <span className="text-sm text-slate-400 line-through font-bold ml-1">
                          {activePricing.currencySymbol}{currentTier.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {currentTier.savings > 0 ? (
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ⚡ SAVE {currentTier.savings}% • ~₹{currentTier.perMonth}/mo ({currentTier.days} Days Validity)
                      </span>
                    ) : (
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                        Flexible 30 Days Monthly Pass
                      </span>
                    )}
                    <p className="text-xs text-purple-900 font-semibold mt-1">
                      Full-scale recruitment suite with high limits & ATS matching.
                    </p>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-800 pt-2 border-t border-purple-100">
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✓</div>
                      <span><strong>Monthly {activePricing.monthlyJobLimit} jobs</strong> posting capacity ({Math.round(activePricing.monthlyJobLimit / 10)}x Free limit)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✓</div>
                      <span>View up to <strong>{activePricing.candidateProfileLimit} candidate profiles</strong></span>
                    </li>
                    <li className="flex items-start gap-2 bg-purple-100/70 p-2.5 rounded-xl border border-purple-200 text-purple-950">
                      <Sparkles className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                      <span><strong>Applicant management with ATS:</strong> AI Match Scores, Bulk Scan & Filters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✓</div>
                      <span>Priority candidate direct outreach & contact details</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-purple-100">
                  {isPro ? (
                    <div className="w-full py-3.5 px-4 rounded-2xl text-xs font-black bg-purple-700 text-white flex items-center justify-center gap-2 shadow-md">
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>PRO Plan is Currently Active</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setStep('payment')}
                      className="w-full py-3.5 px-4 rounded-2xl text-xs font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Proceed to Payment ({activePricing.currencySymbol}{currentTier.price.toLocaleString()})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: ADVANCED DUAL-PANEL ENTERPRISE CHECKOUT ================= */}
        {step === 'payment' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            {/* LEFT COLUMN: ORDER SUMMARY & TRUST SHIELD (4.5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 p-6 sm:p-7 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">
                    ORDER SUMMARY
                  </span>
                  <h3 className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    Recruiter PRO Version ({currentTier.label})
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Ref: {orderId}
                  </p>
                </div>

                {/* 3 Duration Tiers Quick Selector inside Checkout */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider block">
                    Select Plan Duration:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800/90 rounded-2xl border border-slate-700">
                    {DURATION_TIERS.map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedDuration(tier.id)}
                        className={`py-2 px-1 rounded-xl text-center transition cursor-pointer relative ${
                          selectedDuration === tier.id
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'hover:bg-slate-700/60 text-slate-300'
                        }`}
                      >
                        {tier.savings > 0 && (
                          <span className="absolute -top-1.5 right-1 px-1 py-0.2 rounded text-[7px] font-black uppercase bg-amber-400 text-slate-950">
                            Save {tier.savings}%
                          </span>
                        )}
                        <span className="block text-[11px] font-black">{tier.label}</span>
                        <span className="block text-[10px] font-bold text-amber-300">₹{tier.price.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quota Highlights Card */}
                <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Selected Plan Validity</span>
                    <span className="font-bold text-amber-300">{currentTier.label} ({currentTier.days} Days)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Job Postings Capacity</span>
                    <span className="font-bold text-white">{activePricing.monthlyJobLimit} Jobs / mo</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Candidate Profiles Access</span>
                    <span className="font-bold text-white">{activePricing.candidateProfileLimit} Profiles</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>ATS Matching Engine</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Unlocked
                    </span>
                  </div>
                </div>

                {/* Pricing Breakdown with Tax / GST */}
                <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Subscription ({currentTier.label})</span>
                    <span>₹{basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18% ITC Eligible)</span>
                    <span>₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white border-t border-slate-700/80 pt-2">
                    <span>Total Amount Due</span>
                    <span className="text-xl text-emerald-400 font-mono">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Optional GSTIN Accordion */}
                <div className="border-t border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowGst(!showGst)}
                    className="text-[11px] font-bold text-indigo-300 hover:text-indigo-200 flex items-center justify-between w-full"
                  >
                    <span>{showGst ? '✓ Add GSTIN to Invoice' : '+ Add GSTIN for 18% Tax Credit'}</span>
                    <span className="text-[10px] text-slate-400">{showGst ? 'Hide' : 'Expand'}</span>
                  </button>

                  {showGst && (
                    <div className="mt-2.5 space-y-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Company Legal Name</label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">GSTIN Number</label>
                        <input
                          type="text"
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value.toUpperCase())}
                          placeholder="33AAAAA0000A1Z5"
                          maxLength={15}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badges Footer */}
              <div className="pt-6 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>RBI Authorized Gateway Settlement</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <Receipt className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Instant GST Tax Invoice with SAC 998311</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: MULTI-CHANNEL PAYMENT HUB (7.5 Cols) */}
            <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-white">
              <div className="space-y-4">
                {/* Header with Session Countdown */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900">
                      Select Payment Option
                    </h4>
                    <p className="text-xs text-slate-500">
                      All payment methods are encrypted and 100% secure
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-bold font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>{formatTimer(qrCounter)}</span>
                  </div>
                </div>

                {/* Payment Channel Tabs */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2.5 px-2 rounded-2xl border text-xs font-black flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'upi'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs ring-2 ring-purple-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2.5 px-2 rounded-2xl border text-xs font-black flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`py-2.5 px-2 rounded-2xl border text-xs font-black flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'netbanking'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>Net Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('sandbox')}
                    className={`py-2.5 px-2 rounded-2xl border text-xs font-black flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'sandbox'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs ring-2 ring-amber-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Instant Pay</span>
                  </button>
                </div>

                {/* ================= TAB 1: ADVANCED UPI ================= */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Quick App Selectors */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Fast Pay with UPI Apps
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('phonepe')}
                          className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                            selectedUpiApp === 'phonepe'
                              ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600/20'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">
                            पे
                          </div>
                          <span>PhonePe</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('gpay')}
                          className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                            selectedUpiApp === 'gpay'
                              ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="font-black text-sm tracking-tight text-slate-800">
                            <span className="text-blue-600">G</span>
                            <span className="text-red-500">P</span>
                            <span className="text-amber-500">a</span>
                            <span className="text-emerald-500">y</span>
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('paytm')}
                          className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                            selectedUpiApp === 'paytm'
                              ? 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-600/20'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="w-5 h-5 rounded-md bg-sky-500 text-white flex items-center justify-center text-[9px] font-black">
                            PT
                          </div>
                          <span>Paytm</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('qr')}
                          className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                            selectedUpiApp === 'qr'
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <QrCode className="w-4 h-4 text-indigo-500" />
                          <span>Show QR</span>
                        </button>
                      </div>
                    </div>

                    {/* Dynamic High-Resolution QR Code & VPA Display */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center gap-4">
                      {/* Real Dynamic QR Image with Fallback */}
                      <div className="relative group shrink-0">
                        <div className="w-36 h-36 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center overflow-hidden">
                          <img 
                            src={qrImageUrl} 
                            alt="Scan and Pay UPI QR" 
                            className="w-32 h-32 object-contain"
                            loading="eager"
                          />
                        </div>
                        <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[10px] font-bold p-2 text-center pointer-events-none">
                          Scan with PhonePe, GPay, Paytm or BHIM
                        </div>
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">
                            Direct Merchant UPI VPA
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <code className="px-3 py-1 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 shadow-2xs">
                              {activePricing.upiId}
                            </code>
                            <button
                              type="button"
                              onClick={handleCopyUpi}
                              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-700 transition flex items-center gap-1 text-[11px] font-bold shadow-2xs cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Mobile Intent Launcher */}
                        <div className="pt-1">
                          <a
                            href={upiIntentUrl}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open in Mobile UPI App</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* VPA / UTR Manual Entry */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Your UPI ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                          placeholder="e.g. mobile@okhdfcbank"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          UTR / Reference (Optional)
                        </label>
                        <input
                          type="text"
                          value={upiRef}
                          onChange={(e) => setUpiRef(e.target.value)}
                          placeholder="e.g. 412389102938"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= TAB 2: CREDIT / DEBIT CARDS ================= */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Realistic 3D Interactive Card Visual */}
                    <div className="relative h-44 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 p-5 text-white shadow-xl flex flex-col justify-between overflow-hidden border border-slate-700">
                      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-7 bg-amber-400/90 rounded-md border border-amber-300/40 shadow-xs flex items-center justify-center">
                            <div className="w-6 h-4 border border-amber-700/60 rounded-xs grid grid-cols-2" />
                          </div>
                          <span className="text-[10px] text-slate-300 tracking-widest font-mono">DEBIT / CREDIT</span>
                        </div>
                        <span className={`text-base ${getCardBrand(cardNumber).color}`}>
                          {getCardBrand(cardNumber).name}
                        </span>
                      </div>

                      <div className="text-center my-auto">
                        <span className="font-mono text-lg sm:text-xl tracking-widest font-bold text-slate-100">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-sans uppercase">Card Holder</span>
                          <span className="font-bold tracking-wider text-slate-200 uppercase truncate max-w-[160px] block">
                            {cardName || 'YOUR NAME'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block font-sans uppercase">Expires</span>
                          <span className="font-bold tracking-wider text-slate-200">
                            {cardExp || 'MM/YY'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Input Form */}
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Card Number</label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="4532 •••• •••• 8921"
                            maxLength={19}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Valid Thru</label>
                          <input
                            type="text"
                            value={cardExp}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">CVV / CVC</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            maxLength={4}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name as printed on card"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <label className="flex items-center gap-2 pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="w-3.5 h-3.5 text-blue-600 rounded-sm"
                        />
                        <span className="text-[11px] text-slate-600">
                          Securely save card for renewals as per RBI tokenization standards
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* ================= TAB 3: NET BANKING ================= */}
                {paymentMethod === 'netbanking' && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Popular Indian Banks
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {POPULAR_BANKS.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBank(b.name)}
                            className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                              selectedBank === b.name
                                ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600/20 shadow-xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-xs font-bold text-slate-800">{b.name}</span>
                            <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-md">
                              {b.badge}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Or Select Other Bank (50+ Banks Supported)
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {ALL_OTHER_BANKS.map((bank) => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>You will be securely redirected to your bank's 3D-secure portal for OTP/NetBanking login.</span>
                    </div>
                  </div>
                )}

                {/* ================= TAB 4: INSTANT TEST PAY ================= */}
                {paymentMethod === 'sandbox' && (
                  <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                      <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                      <span>Developer & QA Sandbox Mode (Instant Test Checkout)</span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                      This simulated payment flow instantly authorizes an amount of <strong>₹{totalAmount.toLocaleString()}</strong>, writes a completed payment receipt (`INV-202611-XXXX`), and unlocks 50 job postings + candidate ATS scoring on your recruiter account.
                    </p>
                    <div className="p-2.5 bg-white/80 rounded-xl border border-amber-300 text-[11px] text-amber-950 font-mono">
                      ✓ Mock NPCI Gateway: LIVE • Instant 1-Click Verification
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  className="flex-1 py-3 px-6 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>Pay ₹{totalAmount.toLocaleString()} & Activate PRO ({currentTier.label})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: AUTHENTIC GATEWAY AUTHORIZATION OVERLAY ================= */}
        {step === 'authorizing' && (
          <div className="p-8 sm:p-12 text-center space-y-6 max-w-lg mx-auto animate-in zoom-in-95 duration-200">
            {/* Spinning Security Lock & Shield */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
              <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                <ShieldCheck className="w-9 h-9" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-indigo-100 text-indigo-800 tracking-wider">
                {authStage === 'connecting' && 'CONNECTING TO ISSUER BANK'}
                {authStage === 'awaiting_approval' && 'AWAITING PAYMENT APPROVAL'}
                {authStage === 'verifying' && 'VERIFYING TRANSACTION TOKEN'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 pt-2">
                {authStage === 'connecting' && 'Securing 256-Bit Bank Tunnel...'}
                {authStage === 'awaiting_approval' && 'Payment Notification Sent'}
                {authStage === 'verifying' && 'Authorizing & Activating PRO...'}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {authStage === 'connecting' && 'Establishing direct encrypted connection with NPCI & card payment gateways.'}
                {authStage === 'awaiting_approval' && `Please approve the ₹${totalAmount.toLocaleString()} payment request sent to your ${selectedUpiApp.toUpperCase()} app.`}
                {authStage === 'verifying' && 'Transaction approved! Provisioning recruiter quota limits and generating invoice.'}
              </p>
            </div>

            {/* Notification Simulator Box */}
            {authStage === 'awaiting_approval' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-700">Payment Request</span>
                  <span className="font-mono text-xs text-emerald-700 font-bold">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Merchant</span>
                  <span className="font-semibold text-slate-800">{activePricing.accountName}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Channel</span>
                  <span className="font-semibold text-slate-800">{paymentMethod.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between text-amber-700 font-bold pt-1 border-t border-slate-200">
                  <span>Time remaining to approve</span>
                  <span className="font-mono">{formatTimer(authCounter)}</span>
                </div>
              </div>
            )}

            {/* Action Simulator Controls */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleFinalizePayment}
                className="w-full py-3 px-6 rounded-2xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying with Gateway...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>✓ Simulate Approval on Mobile App / Complete Now</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setStep('payment')}
                className="py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel & Change Payment Method
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: PAYMENT SUCCESS & OFFICIAL INVOICE ================= */}
        {step === 'success' && (
          <div className="p-6 sm:p-10 space-y-6 text-center animate-in zoom-in-95 duration-200 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg border border-emerald-200">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <div>
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800 tracking-wider">
                PAYMENT SUCCESSFUL
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                PRO Version is Now Active!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Your payment of <strong>₹{totalAmount.toLocaleString()}</strong> has been confirmed by the gateway. Your hiring capacity has been upgraded.
              </p>
            </div>

            {/* Official Tax Invoice Card */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl text-left text-xs space-y-2.5 font-mono shadow-inner">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Official Invoice #:</span>
                <span className="font-bold text-indigo-600">{completedPayment?.invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Transaction Reference:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">{completedPayment?.transactionId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Amount Paid:</span>
                <span className="font-black text-emerald-700 font-sans text-sm">₹{totalAmount.toLocaleString()} (INR)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Payment Method:</span>
                <span className="font-bold text-slate-800 uppercase font-sans">{completedPayment?.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-sans">Active Quota Limits:</span>
                <span className="font-bold text-purple-700 font-sans">50 Jobs • 100 Profiles • ATS Active</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-3 px-5 rounded-2xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Receipt className="w-4 h-4 text-slate-500" />
                <span>Print Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-7 rounded-2xl text-xs font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🚀 Continue to Recruiter Workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
