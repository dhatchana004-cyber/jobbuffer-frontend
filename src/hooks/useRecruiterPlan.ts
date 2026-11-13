import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export interface SubscriptionPricing {
  proPrice: number;
  proOriginalPrice: number;
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
}

export interface RecruiterSubscriptionData {
  plan: 'FREE' | 'PRO';
  isPro: boolean;
  planActivatedAt?: string;
  pricing?: SubscriptionPricing;
  limits: {
    jobsMonthly: number;
    candidateProfiles: number;
    applicantManagementAts: boolean;
  };
  usage: {
    monthlyJobsPosted: number;
    totalActiveJobs: number;
    viewedProfilesCount: number;
    jobsRemaining: number;
    profilesRemaining: number;
  };
  features: {
    jobPostingText: string;
    candidateProfilesText: string;
    atsText: string;
  };
}

export function useRecruiterPlan(options?: { enabled?: boolean }) {
  const isEnabled = options?.enabled ?? true;
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFeature, setModalFeature] = useState<string>('ats');

  const { data: subscription, isLoading, refetch } = useQuery<RecruiterSubscriptionData>({
    queryKey: ['recruiterSubscription'],
    enabled: isEnabled,
    queryFn: async () => {
      try {
        const res = await api.get('/recruiter/subscription');
        if (res.data && res.data.plan) {
          // Sync with localStorage for offline/client fallback
          localStorage.setItem('recruiter_plan', res.data.plan);
          return res.data;
        }
      } catch (e) {
        // Fallback to localStorage if offline
      }
      
      const localPlan = (localStorage.getItem('recruiter_plan') || 'FREE').toUpperCase() as 'FREE' | 'PRO';
      const isPro = localPlan === 'PRO';
      return {
        plan: localPlan,
        isPro,
        planActivatedAt: new Date().toISOString(),
        limits: {
          jobsMonthly: isPro ? 50 : 10,
          candidateProfiles: isPro ? 100 : 50,
          applicantManagementAts: isPro
        },
        usage: {
          monthlyJobsPosted: 0,
          totalActiveJobs: 3,
          viewedProfilesCount: 0,
          jobsRemaining: isPro ? 50 : 10,
          profilesRemaining: isPro ? 100 : 50
        },
        features: {
          jobPostingText: isPro ? 'Up to 50 jobs monthly' : '10 limited jobs monthly posting',
          candidateProfilesText: isPro ? 'View up to 100 candidate profiles' : 'Only view 50 candidate profiles',
          atsText: isPro ? 'Applicant management with ATS' : 'Applicant management (Basic - ATS Locked)'
        }
      };
    },
    staleTime: 1000 * 30
  });

  const activateMutation = useMutation({
    mutationFn: async (payload: { plan: 'FREE' | 'PRO'; duration?: string; paymentDetails?: any } | 'FREE' | 'PRO') => {
      const targetPlan = typeof payload === 'string' ? payload : payload.plan;
      const paymentDetails = typeof payload === 'string' ? undefined : payload.paymentDetails;
      const duration = typeof payload === 'string' ? undefined : (payload.duration || paymentDetails?.duration);
      try {
        const res = await api.post('/recruiter/subscription/activate', { plan: targetPlan, duration, paymentDetails });
        localStorage.setItem('recruiter_plan', targetPlan);
        return res.data;
      } catch (e) {
        localStorage.setItem('recruiter_plan', targetPlan);
        return { success: true, plan: targetPlan, isPro: targetPlan === 'PRO' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] });
      queryClient.invalidateQueries({ queryKey: ['candidatesDiscovery'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterSubscriptionPayments'] });
      setIsModalOpen(false);
    }
  });

  const trackViewMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await api.post('/recruiter/subscription/view-candidate');
        return res.data;
      } catch (err: any) {
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterSubscription'] });
    }
  });

  const isPro = subscription?.isPro ?? (localStorage.getItem('recruiter_plan') === 'PRO');
  const plan: 'FREE' | 'PRO' = isPro ? 'PRO' : 'FREE';

  const openUpgradeModal = (feature = 'ats') => {
    setModalFeature(feature);
    setIsModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsModalOpen(false);
  };

  const defaultPricing: SubscriptionPricing = {
    proPrice: 1999,
    proOriginalPrice: 4999,
    currency: 'INR',
    currencySymbol: '₹',
    billingCycle: 'Monthly',
    monthlyJobLimit: 50,
    candidateProfileLimit: 100,
    atsFeatureEnabled: true,
    upiId: 'jobbuffer@upi',
    accountName: 'JoBuffer Talent Network'
  };

  const pricing = subscription?.pricing || defaultPricing;

  return {
    subscription,
    plan,
    isPro,
    isLoading,
    refetch,
    pricing,
    maxJobs: isPro ? (pricing.monthlyJobLimit || 50) : 10,
    maxProfiles: isPro ? (pricing.candidateProfileLimit || 100) : 50,
    hasAts: isPro,
    isModalOpen,
    modalFeature,
    openUpgradeModal,
    closeUpgradeModal,
    activatePlan: activateMutation.mutate,
    activatePlanAsync: activateMutation.mutateAsync,
    isActivating: activateMutation.isPending,
    trackProfileView: trackViewMutation.mutate
  };
}
