'use client';

import { useState } from 'react';
import { ModuleSelector } from '@/modules/shared/components/ModuleSelector';
import { getPositionModule } from '@/modules/core/position-registry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings, Play, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function PositionModulesPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  
  const selectedModuleData = selectedModule ? getPositionModule(selectedModule) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        
        {/* Module Selector */}
        <ModuleSelector 
          onModuleSelect={setSelectedModule}
          activeModule={selectedModule || undefined}
        />

        {/* Selected Module Actions */}
        {selectedModuleData && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <selectedModuleData.icon className="h-6 w-6 text-blue-600" />
                {selectedModuleData.displayName} Selected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{selectedModuleData.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href={`/position-modules/${selectedModuleData.name}/configure`}>
                  <Button className="w-full h-16 flex items-center gap-3" variant="outline">
                    <Settings className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Configure</div>
                      <div className="text-sm text-gray-600">Set up grading fields</div>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>

                <Link href={`/position-modules/${selectedModuleData.name}/grade`}>
                  <Button className="w-full h-16 flex items-center gap-3">
                    <Play className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Start Grading</div>
                      <div className="text-sm opacity-90">Grade plays</div>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>

                <Link href={`/position-modules/${selectedModuleData.name}/analytics`}>
                  <Button className="w-full h-16 flex items-center gap-3" variant="outline">
                    <BarChart3 className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Analytics</div>
                      <div className="text-sm text-gray-600">View performance</div>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Getting Started Guide */}
        {!selectedModule && (
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with Position Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold">Select a Position Group</h4>
                    <p className="text-gray-600">Choose the position group you want to analyze (e.g., Offensive Line, Quarterback).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold">Configure Grading Criteria</h4>
                    <p className="text-gray-600">Set up the specific grading fields and metrics you want to track for that position.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold">Start Grading</h4>
                    <p className="text-gray-600">Import game data and begin grading plays to build your analytics database.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


