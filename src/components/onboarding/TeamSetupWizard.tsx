'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowRightIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  CogIcon,
  PlayIcon,
  ArrowPathIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { PositionConfigEditor } from './PositionConfigEditor';

interface PositionGroup {
  id: string;
  name: string;
  displayName: string;
  category: string;
  positions: string[];
  isActive: boolean;
}

interface PositionConfiguration {
  id?: string;
  positionGroupId: string;
  gradingFields: Array<{
    id: string;
    name: string;
    type: string;
    min: number;
    max: number;
    weight: number;
  }>;
  metricFields: Record<string, any>;
  tags: string[];
  settings: {
    showPlayerNumbers: boolean;
    allowMultiplePositions: boolean;
    defaultView: string;
    quickGradeEnabled: boolean;
  };
}

interface SetupWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function TeamSetupWizard({ onComplete, onCancel }: SetupWizardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [positionGroups, setPositionGroups] = useState<PositionGroup[]>([]);
  const [configurations, setConfigurations] = useState<Record<string, PositionConfiguration>>({});
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [configuredGroups, setConfiguredGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useExistingData, setUseExistingData] = useState(true);

  const steps = [
    { id: 'welcome', title: 'Welcome', description: 'Choose your setup approach' },
    { id: 'select-groups', title: 'Select Position Groups', description: 'Choose which positions to configure' },
    { id: 'configure', title: 'Configure Positions', description: 'Customize grading fields and settings' },
    { id: 'review', title: 'Review & Complete', description: 'Review your configurations' }
  ];

  useEffect(() => {
    loadPositionGroups();
  }, []);

  const loadPositionGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load position groups
      const groupsResponse = await fetch('/api/position-groups');
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        const groups = groupsData.groups || [];
        setPositionGroups(groups);

        // Load existing configurations if user wants to use them
        if (user?.teamId && useExistingData && groups.length > 0) {
          // Load configurations for each position group
          const configPromises = groups.map(async (group: PositionGroup) => {
            try {
              const response = await fetch(`/api/position-config?positionGroupId=${group.id}&teamId=${user.teamId}`);
              if (response.ok) {
                const data = await response.json();
                return data.success ? { [group.id]: data.config } : {};
              }
            } catch (error) {
              console.error(`Error loading config for ${group.id}:`, error);
            }
            return {};
          });

          const configResults = await Promise.all(configPromises);
          const allConfigs = configResults.reduce((acc, config) => ({ ...acc, ...config }), {});
          
          // Filter out null configs
          const validConfigs: Record<string, PositionConfiguration> = Object.fromEntries(
            Object.entries(allConfigs).filter(([_, config]) => config !== null && config !== undefined)
          ) as Record<string, PositionConfiguration>;
          
          setConfigurations(validConfigs);
          
          // Set configured groups based on existing configurations (only non-null ones)
          const configuredGroupIds = Object.keys(validConfigs);
          setConfiguredGroups(configuredGroupIds);
        }
      }
    } catch (err) {
      console.error('Error loading position groups:', err);
      setError('Failed to load position groups');
    } finally {
      setLoading(false);
    }
  };

  const handleStepNext = () => {
    console.log('=== STEP NEXT DEBUG ===');
    console.log('Current step:', currentStep);
    console.log('Selected groups:', selectedGroups);
    console.log('Going to step:', currentStep + 1);
    console.log('======================');
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGroupToggle = (groupId: string) => {
    console.log('=== GROUP TOGGLE DEBUG ===');
    console.log('Toggling group:', groupId);
    console.log('Current selected groups:', selectedGroups);
    console.log('==========================');
    
    setSelectedGroups(prev => {
      const newSelectedGroups = prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId];
      
      console.log('New selected groups:', newSelectedGroups);
      
      // Initialize default configuration for newly selected groups
      if (!prev.includes(groupId)) {
        const group = positionGroups.find(g => g.id === groupId);
        if (group) {
          const defaultConfig: PositionConfiguration = {
            id: undefined,
            positionGroupId: groupId,
            gradingFields: [
              { id: 'execution', name: 'Execution', type: 'scale', min: 1, max: 5, weight: 1.0, description: 'How well the play was executed' },
              { id: 'technique', name: 'Technique', type: 'scale', min: 1, max: 5, weight: 1.0, description: 'Quality of technique used' },
              { id: 'assignment', name: 'Assignment', type: 'scale', min: 1, max: 5, weight: 1.0, description: 'Correctness of assignment' }
            ],
            metricFields: {},
            tags: [],
            settings: {
              showPlayerNumbers: true,
              allowMultiplePositions: true,
              defaultView: 'grid',
              quickGradeEnabled: true
            }
          };
          
          setConfigurations(prevConfigs => ({
            ...prevConfigs,
            [groupId]: defaultConfig
          }));
        }
      }
      
      return newSelectedGroups;
    });
  };

  const handleConfigurationChange = (groupId: string, config: PositionConfiguration) => {
    setConfigurations(prev => ({
      ...prev,
      [groupId]: config
    }));
  };

  const handleCompleteSetup = async () => {
    if (!user?.teamId) return;

    try {
      setSaving(true);
      setError(null);

      // Mark setup as complete without saving new configurations
      const completeResponse = await fetch('/api/team-setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: user.teamId })
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to mark setup as complete');
      }

      if (onComplete) {
        onComplete();
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Error completing setup:', err);
      setError('Failed to complete setup');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfigurations = async (completeSetup = false) => {
    if (!user?.teamId) return;

    try {
      setSaving(true);
      setError(null);

      console.log('=== SAVE DEBUG ===');
      console.log('Current step:', currentStep);
      console.log('Selected groups:', selectedGroups);
      console.log('Configured groups:', configuredGroups);
      console.log('Configurations:', configurations);
      console.log('==================');

      const configurationsToSave = Object.entries(configurations)
        .filter(([groupId, config]) => 
          config !== null && 
          config !== undefined
        );

      console.log('Configurations to save:', configurationsToSave);

      if (configurationsToSave.length === 0) {
        throw new Error('No valid configurations found to save');
      }

      const savePromises = configurationsToSave.map(([groupId, config]) => {
        console.log(`Saving config for ${groupId}:`, config);
        return fetch('/api/position-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            positionGroupId: groupId,
            teamId: user.teamId,
            userId: user.id,
            gradingFields: config.gradingFields || [],
            metricFields: config.metricFields || {},
            tags: config.tags || [],
            settings: config.settings || {
              showPlayerNumbers: true,
              allowMultiplePositions: true,
              defaultView: 'grid',
              quickGradeEnabled: true
            }
          })
        });
      });

      const responses = await Promise.all(savePromises);
      
      // Check for any failed responses
      const failedResponses = responses.filter(response => !response.ok);
      if (failedResponses.length > 0) {
        const errorTexts = await Promise.all(failedResponses.map(r => r.text()));
        throw new Error(`Failed to save some configurations: ${errorTexts.join(', ')}`);
      }

      // If completing setup, mark as complete
      if (completeSetup) {
        const completeResponse = await fetch('/api/team-setup/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamId: user.teamId })
        });

        if (!completeResponse.ok) {
          throw new Error('Failed to mark setup as complete');
        }

        if (onComplete) {
          onComplete();
        } else {
          router.push('/dashboard');
        }
      } else {
        // Just save configurations and go back to group selection
        const savedGroupIds = configurationsToSave.map(([groupId]) => groupId);
        setConfiguredGroups(prev => [...new Set([...prev, ...savedGroupIds])]);
        // Don't clear selectedGroups - keep them selected so user can see what they just configured
        setCurrentStep(1); // Go back to group selection step (step 1)
      }
    } catch (err) {
      console.error('Error saving configurations:', err);
      setError('Failed to save configurations');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSetup = async () => {
    if (!user?.teamId) return;

    try {
      setSaving(true);
      setError(null);

      await fetch('/api/team-setup/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: user.teamId })
      });

      setConfigurations({});
      setSelectedGroups([]);
      setConfiguredGroups([]);
      setUseExistingData(false);
      setCurrentStep(0);
      await loadPositionGroups();
    } catch (err) {
      console.error('Error resetting setup:', err);
      setError('Failed to reset setup');
    } finally {
      setSaving(false);
    }
  };

  const loadExistingConfigurations = async () => {
    if (!user?.teamId || !useExistingData) return;

    try {
      setLoading(true);
      setError(null);

      // Load existing configurations for each position group
      const configPromises = positionGroups.map(async (group: PositionGroup) => {
        try {
          const response = await fetch(`/api/position-config?positionGroupId=${group.id}&teamId=${user.teamId}`);
          if (response.ok) {
            const data = await response.json();
            return data.success ? { [group.id]: data.config } : {};
          }
        } catch (error) {
          console.error(`Error loading config for ${group.id}:`, error);
        }
        return {};
      });

      const configResults = await Promise.all(configPromises);
      const existingConfigs = configResults.reduce((acc, config) => ({ ...acc, ...config }), {});
      
      // Filter out null configs
      const validConfigs = Object.fromEntries(
        Object.entries(existingConfigs).filter(([_, config]) => config !== null && config !== undefined)
      );
      
      setConfigurations(validConfigs);
      
      // Set configured groups based on existing configurations (only non-null ones)
      const configuredGroupIds = Object.keys(validConfigs);
      setConfiguredGroups(configuredGroupIds);
      
      console.log('Loaded existing configurations:', validConfigs);
    } catch (err) {
      console.error('Error loading existing configurations:', err);
      setError('Failed to load existing configurations');
    } finally {
      setLoading(false);
    }
  };

  const renderWelcomeStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Team Setup Wizard</h3>
          <p className="text-muted-foreground">
            Customize your position group configurations for {user?.team?.level || 'college'} football grading.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="use-existing"
            checked={useExistingData}
            onCheckedChange={setUseExistingData}
          />
          <Label htmlFor="use-existing">
            Use existing configurations as starting point
          </Label>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {useExistingData 
            ? "We'll load your current position configurations and let you modify them."
            : "We'll start with default configurations that you can customize."
          }
        </p>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleResetSetup}
          variant="outline"
          disabled={saving}
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Start Fresh
        </Button>
        
        <Button 
          onClick={() => {
            if (useExistingData) {
              loadExistingConfigurations();
            }
            handleStepNext();
          }}
          className="flex-1"
        >
          <ArrowRightIcon className="w-4 h-4 mr-2" />
          {useExistingData ? 'Use Existing Configurations' : 'Start Fresh'}
        </Button>
      </div>
    </div>
  );

  const renderSelectGroupsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Position Groups</h3>
        <p className="text-muted-foreground">
          Choose which position groups you want to configure. You can always add more later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {positionGroups.map(group => {
          const isSelected = selectedGroups.includes(group.id);
          const isConfigured = configuredGroups.includes(group.id);
          
          return (
            <Card 
              key={group.id}
              className={`cursor-pointer transition-colors ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : isConfigured
                  ? 'ring-2 ring-green-500 bg-green-50 border-green-200'
                  : 'hover:bg-slate-50'
              }`}
              onClick={() => handleGroupToggle(group.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{group.displayName}</h4>
                      {isConfigured && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Configured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {group.positions.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {isSelected ? (
                      <CheckCircleIcon className="w-5 h-5 text-primary" />
                    ) : isConfigured ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleStepBack}
          variant="outline"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        {selectedGroups.length > 0 && (
          <Button 
            onClick={() => setSelectedGroups([])}
            variant="outline"
            className="text-muted-foreground"
          >
            Clear Selection
          </Button>
        )}
        
        {configuredGroups.length > 0 && (
          <Button 
            onClick={handleCompleteSetup}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircleIcon className="w-4 h-4 mr-2" />
            Complete Setup
          </Button>
        )}
        
        <Button 
          onClick={handleStepNext}
          disabled={selectedGroups.length === 0}
          className="flex-1"
        >
          <ArrowRightIcon className="w-4 h-4 mr-2" />
          {configuredGroups.length > 0 ? 'Configure More Groups' : `Configure ${selectedGroups.length} Groups`}
        </Button>
      </div>
    </div>
  );

  const renderConfigureStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Configure Position Groups</h3>
        <p className="text-muted-foreground">
          Customize grading fields and settings for each selected position group.
        </p>
      </div>

      <div className="space-y-4">
        {selectedGroups.map(groupId => {
          const group = positionGroups.find(g => g.id === groupId);
          const config = configurations[groupId];
          
          if (!group) return null;

          return (
            <Card key={groupId}>
              <CardHeader>
                <CardTitle className="text-lg">{group.displayName}</CardTitle>
                <CardDescription>
                  Configure grading fields for {group.positions.join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PositionConfigEditor
                  positionGroup={group}
                  config={config}
                  onChange={(newConfig) => handleConfigurationChange(groupId, newConfig)}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleStepBack}
          variant="outline"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button 
          onClick={handleStepNext}
          className="flex-1"
        >
          <ArrowRightIcon className="w-4 h-4 mr-2" />
          Review Configuration
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Configuration</h3>
        <p className="text-muted-foreground">
          Review your position group configurations before completing setup.
        </p>
      </div>

      <div className="space-y-4">
        {selectedGroups.map(groupId => {
          const group = positionGroups.find(g => g.id === groupId);
          const config = configurations[groupId];
          
          if (!group) return null;

          return (
            <Card key={groupId}>
              <CardHeader>
                <CardTitle className="text-lg">{group.displayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Grading Fields:</span>
                    <Badge variant="outline">
                      {config?.gradingFields?.length || 0} fields
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tags:</span>
                    <Badge variant="outline">
                      {config?.tags?.length || 0} tags
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Settings:</span>
                    <Badge variant="outline">
                      {config?.settings ? 'Configured' : 'Default'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleStepBack}
          variant="outline"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button 
          onClick={() => handleSaveConfigurations(false)}
          disabled={saving || selectedGroups.length === 0 || !selectedGroups.every(groupId => configurations[groupId])}
          variant="outline"
          className="flex-1"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Save & Configure More
            </>
          )}
        </Button>
        
        <Button 
          onClick={() => {
            // First save current configurations, then complete setup
            handleSaveConfigurations(false).then(() => {
              handleCompleteSetup();
            });
          }}
          disabled={saving || selectedGroups.length === 0 || !selectedGroups.every(groupId => configurations[groupId])}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Completing Setup...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Complete Setup
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-between items-start">
          <Button
            onClick={onCancel || (() => router.push('/dashboard'))}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Exit Setup
          </Button>
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold">
              Team Setup Wizard
            </CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </CardDescription>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <Progress value={(currentStep + 1) / steps.length * 100} className="w-full" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        {currentStep === 0 && renderWelcomeStep()}
        {currentStep === 1 && renderSelectGroupsStep()}
        {currentStep === 2 && renderConfigureStep()}
        {currentStep === 3 && renderReviewStep()}

        {/* Cancel Button */}
        {onCancel && (
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={onCancel}
              className="text-muted-foreground"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Cancel & Return to Dashboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}