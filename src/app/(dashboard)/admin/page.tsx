"use client";

import DashboardSummary from '@/components/dashboard/DashboardSummary';
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist';

export default function AdminDashboard() {
  return (
    <>
      <OnboardingChecklist />
      <DashboardSummary />
    </>
  );
}
