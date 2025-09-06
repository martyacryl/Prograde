'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckIcon,
  ArrowRightIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  TrophyIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  required: boolean;
  estimatedTime: string;
}

interface SetupWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

const SETUP_STEPS: SetupStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ProGrade',
    description: 'Get started with your football analysis platform in just a few minutes',
    icon: <SparklesIcon className="w-8 h-8" />,
    status: 'active',
    required: true,
    estimatedTime: '1 min'
  },
  {
    id: 'team-setup',
    title: 'Team Setup',
    description: 'Configure your team and basic settings',
    icon: <UsersIcon className="w-8 h-8" />,
    status: 'pending',
    required: true,
    estimatedTime: '2 min'
  },
  {
    id: 'demo-data',
    title: 'Import Demo Data',
    description: 'Get started instantly with sample games and plays',
          icon: <ArrowDownTrayIcon className="w-8 h-8" />,
    status: 'pending',
    required: false,
    estimatedTime: '30 sec'
  },
  {
    id: 'position-modules',
    title: 'Position Modules',
    description: 'Configure grading modules for different positions',
    icon: <TrophyIcon className="w-8 h-8" />,
    status: 'pending',
    required: false,
    estimatedTime: '3 min'
  },
  {
    id: 'live-game',
    title: 'Live Game Tutorial',
    description: 'Learn how to use the live grading interface',
    icon: <PlayIcon className="w-8 h-8" />,
    status: 'pending',
    required: false,
    estimatedTime: '2 min'
  },
  {
    id: 'ready',
    title: "You're Ready!",
    description: 'Start analyzing your team performance',
    icon: <RocketLaunchIcon className="w-8 h-8" />,
    status: 'pending',
    required: true,
    estimatedTime: '1 min'
  }
];

export default function SetupWizard({ onComplete, onSkip }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<SetupStep[]>(SETUP_STEPS);
  const [loading, setLoading] = useState(false);
  const [demoDataImported, setDemoDataImported] = useState(false);

  const updateStepStatus = (stepId: string, status: SetupStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      updateStepStatus(steps[currentStep].id, 'completed');
      setCurrentStep(currentStep + 1);
      updateStepStatus(steps[currentStep + 1].id, 'active');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      updateStepStatus(steps[currentStep].id, 'pending');
      setCurrentStep(currentStep - 1);
      updateStepStatus(steps[currentStep - 1].id, 'active');
    }
  };

  const skipStep = (stepId: string) => {
    updateStepStatus(stepId, 'skipped');
    goToNextStep();
  };

  const handleDemoDataImport = async () => {
    setLoading(true);
    
    try {
      // Simulate demo data import
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setDemoDataImported(true);
      updateStepStatus('demo-data', 'completed');
      
      // Auto-advance to next step
      setTimeout(() => goToNextStep(), 1000);
    } catch (error) {
      console.error('Failed to import demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    updateStepStatus('ready', 'completed');
    onComplete();
  };

  const getStepIcon = (step: SetupStep) => {
    const baseClasses = "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200";
    
    switch (step.status) {
      case 'completed':
        return (
          <div className={cn(baseClasses, "bg-success-100 text-success-600")}>
            <CheckIcon className="w-6 h-6" />
          </div>
        );
      case 'active':
        return (
          <div className={cn(baseClasses, "bg-primary-100 text-primary-600")}>
            {step.icon}
          </div>
        );
      case 'skipped':
        return (
          <div className={cn(baseClasses, "bg-gray-100 text-gray-400")}>
            {step.icon}
          </div>
        );
      default:
        return (
          <div className={cn(baseClasses, "bg-gray-100 text-gray-400")}>
            {step.icon}
          </div>
        );
    }
  };

  const getStepStatus = (step: SetupStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge variant="default" className="bg-success-100 text-success-700">Completed</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-primary-100 text-primary-700">Active</Badge>;
      case 'skipped':
        return <Badge variant="secondary">Skipped</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const completedSteps = steps.filter(step => step.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to ProGrade
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let's get your football analysis platform set up in just a few minutes. 
            We'll guide you through each step to get you analyzing plays quickly.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Setup Progress: {completedSteps} of {steps.length} steps
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-gray-200 rounded-xl shadow-soft">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  {getStepIcon(currentStepData)}
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  {currentStepData.title}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  {currentStepData.description}
                </CardDescription>
                <div className="flex items-center justify-center space-x-2 mt-4">
                  {getStepStatus(currentStepData)}
                  <span className="text-sm text-gray-500">
                    • {currentStepData.estimatedTime}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                {/* Step-specific content */}
                {currentStepData.id === 'welcome' && (
                  <div className="text-center space-y-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <TrophyIcon className="w-16 h-16 text-primary-600" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Your Football Analysis Journey Starts Here
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        ProGrade gives you the tools to analyze every play, track performance trends, 
                        and make data-driven coaching decisions. Whether you're on the sideline during 
                        a live game or reviewing film afterward, you'll have everything you need.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <PlayIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900">Live Grading</h4>
                        <p className="text-sm text-gray-600">Grade plays in real-time</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <ChartBarIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900">Analytics</h4>
                        <p className="text-sm text-gray-600">Performance insights</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <UsersIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900">Team Focus</h4>
                        <p className="text-sm text-gray-600">Position-specific analysis</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.id === 'team-setup' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Team Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Michigan Wolverines"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Conference
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                          <option>Select Conference</option>
                          <option>Big Ten</option>
                          <option>SEC</option>
                          <option>Big 12</option>
                          <option>Pac-12</option>
                          <option>ACC</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Head Coach
                      </label>
                      <input
                        type="text"
                        placeholder="Your name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                )}

                {currentStepData.id === 'demo-data' && (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-success-100 to-green-100 rounded-full flex items-center justify-center mx-auto">
                      <ArrowDownTrayIcon className="w-12 h-12 text-success-600" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Get Started Instantly
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Import our demo data to see ProGrade in action immediately. This includes:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-md mx-auto">
                        <div className="flex items-center space-x-2">
                          <CheckIcon className="w-5 h-5 text-success-600" />
                          <span className="text-sm text-gray-700">Michigan vs Ohio State game</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckIcon className="w-5 h-5 text-success-600" />
                          <span className="text-sm text-gray-700">150+ plays to analyze</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckIcon className="w-5 h-5 text-success-600" />
                          <span className="text-sm text-gray-700">OL position module</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckIcon className="w-5 h-5 text-success-600" />
                          <span className="text-sm text-gray-700">Sample analytics</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleDemoDataImport}
                      disabled={loading}
                      size="lg"
                      className="bg-success-600 hover:bg-success-700"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Importing Demo Data...
                        </>
                      ) : (
                        <>
                          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                          Import Demo Data (30 seconds)
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {currentStepData.id === 'position-modules' && (
                  <div className="space-y-6">
                    <p className="text-gray-600 text-center">
                      Configure grading modules for different positions. You can always customize these later.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['Offensive Line', 'Defensive Line', 'Linebackers', 'Secondary', 'Quarterback', 'Running Backs'].map((position) => (
                        <div key={position} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600" />
                            <span className="font-medium text-gray-900">{position}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStepData.id === 'live-game' && (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-primary-100 rounded-full flex items-center justify-center mx-auto">
                      <PlayIcon className="w-12 h-12 text-primary-600" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Live Game Grading Interface
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Learn how to use the live grading interface for real-time play analysis during games.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-6 text-left">
                        <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• One-tap grading from +2 to -2</li>
                          <li>• Quick tags for common situations</li>
                          <li>• Real-time analytics updates</li>
                          <li>• Touch-optimized for sideline use</li>
                          <li>• Offline capability with auto-sync</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.id === 'ready' && (
                  <div className="text-center space-y-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-success-100 to-green-100 rounded-full flex items-center justify-center mx-auto">
                      <RocketLaunchIcon className="w-16 h-16 text-success-600" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-gray-900">
                        You're All Set! 🎉
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        ProGrade is ready to help you analyze your team's performance. 
                        Start by exploring the dashboard or jump right into live grading.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <Button variant="outline" size="lg" className="w-full">
                        Explore Dashboard
                      </Button>
                      <Button size="lg" className="w-full">
                        Start Live Game
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-gray-200 rounded-xl shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Setup Steps</CardTitle>
                <CardDescription>
                  Track your progress through the setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
                        step.status === 'active' && "bg-primary-50 border border-primary-200",
                        step.status === 'completed' && "bg-success-50 border border-success-200",
                        step.status === 'skipped' && "bg-gray-50 border border-gray-200"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {step.status === 'completed' ? (
                          <div className="w-6 h-6 bg-success-600 rounded-full flex items-center justify-center">
                            <CheckIcon className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                            step.status === 'active' 
                              ? "bg-primary-600 text-white" 
                              : "bg-gray-300 text-gray-600"
                          )}>
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          step.status === 'active' ? "text-primary-900" :
                          step.status === 'completed' ? "text-success-900" :
                          step.status === 'skipped' ? "text-gray-500" :
                          "text-gray-700"
                        )}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500">{step.estimatedTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={loading}
              >
                ← Previous
              </Button>
            )}
            {!currentStepData.required && (
              <Button
                variant="ghost"
                onClick={() => skipStep(currentStepData.id)}
                disabled={loading}
              >
                Skip this step
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={goToNextStep}
                disabled={loading || currentStepData.status === 'pending'}
              >
                Next Step
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="bg-success-600 hover:bg-success-700"
              >
                Complete Setup
                <RocketLaunchIcon className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Skip Setup Option */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip setup for now
          </Button>
        </div>
      </div>
    </div>
  );
}

// Missing ChartBarIcon component - using a placeholder
const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
