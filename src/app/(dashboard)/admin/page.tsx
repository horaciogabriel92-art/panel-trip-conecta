"use client";

import DashboardSummary from '@/components/dashboard/DashboardSummary';
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist';
import OnboardingDemoModal from '@/components/onboarding/OnboardingDemoModal';

export default function AdminDashboard() {
  return (
    <>
      <OnboardingDemoModal />
      <OnboardingChecklist />
      <DashboardSummary />
    </>
  );
}
