'use client';

import SetupWizard from '@/components/onboarding/SetupWizard';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();

  const handleComplete = () => {
    // Redirect to dashboard after setup
    router.push('/dashboard');
  };

  const handleSkip = () => {
    // Skip setup and go to dashboard
    router.push('/dashboard');
  };

  return (
    <SetupWizard 
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
