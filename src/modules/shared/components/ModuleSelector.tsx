'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPositionModulesByCategory, PositionModuleDefinition } from '@/modules/core/position-registry';
import { Shield, Target, Zap } from 'lucide-react';

interface ModuleSelectorProps {
  onModuleSelect: (moduleId: string) => void;
  activeModule?: string;
}

export function ModuleSelector({ onModuleSelect, activeModule }: ModuleSelectorProps) {
  const offenseModules = getPositionModulesByCategory('OFFENSE');
  const defenseModules = getPositionModulesByCategory('DEFENSE');
  const specialTeamsModules = getPositionModulesByCategory('SPECIAL_TEAMS');

  const renderModuleCard = (module: PositionModuleDefinition) => (
    <Card
      key={module.id}
      className={`cursor-pointer transition-all hover:shadow-md border-2 ${
        activeModule === module.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 rounded-lg bg-gray-100">
            <module.icon className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <div>{module.displayName}</div>
            <div className="text-sm font-normal text-gray-600">{module.description}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 mb-4">
          {module.positions.map((position: string) => (
            <Badge key={position} variant="secondary" className="text-xs">
              {position}
            </Badge>
          ))}
        </div>
        <Button 
          onClick={() => onModuleSelect(module.id)}
          className="w-full"
          variant={activeModule === module.id ? "default" : "outline"}
        >
          {activeModule === module.id ? 'Selected' : 'Select Module'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Position Analysis Modules</h2>
        <p className="text-gray-600">Select a position group to configure grading criteria and analyze performance.</p>
      </div>
      
      <Tabs defaultValue="offense" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="offense" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Offense ({offenseModules.length})
          </TabsTrigger>
          <TabsTrigger value="defense" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Defense ({defenseModules.length})
          </TabsTrigger>
          <TabsTrigger value="special" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Special Teams ({specialTeamsModules.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="offense" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offenseModules.map(renderModuleCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="defense" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defenseModules.map(renderModuleCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="special" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialTeamsModules.length > 0 ? specialTeamsModules.map(renderModuleCard) : (
              <div className="col-span-full text-center py-12">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Special Teams Modules</h3>
                <p className="text-gray-600">Special teams modules coming soon.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
