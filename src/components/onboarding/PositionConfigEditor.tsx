'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface GradingField {
  id: string;
  name: string;
  type: 'scale' | 'boolean' | 'text' | 'number' | 'select' | 'percentage';
  min?: number;
  max?: number;
  weight: number;
  description?: string;
  options?: string[]; // For select fields
  unit?: string; // For number fields (e.g., 'yards', 'seconds')
  step?: number; // For number fields
}

interface PositionConfiguration {
  id?: string;
  positionGroupId: string;
  gradingFields: GradingField[];
  metricFields: Record<string, any>;
  tags: string[];
  settings: {
    showPlayerNumbers: boolean;
    allowMultiplePositions: boolean;
    defaultView: 'grid' | 'list';
    quickGradeEnabled: boolean;
  };
}

interface PositionConfigEditorProps {
  positionGroup: {
    id: string;
    name: string;
    displayName: string;
    category: string;
    positions: string[];
  };
  config: PositionConfiguration | null;
  onChange: (config: PositionConfiguration) => void;
}

export function PositionConfigEditor({ positionGroup, config, onChange }: PositionConfigEditorProps) {
  const [gradingFields, setGradingFields] = useState<GradingField[]>(
    config?.gradingFields || [
      { id: 'execution', name: 'Execution', type: 'scale', min: 1, max: 5, weight: 1.0, description: 'How well the play was executed' },
      { id: 'technique', name: 'Technique', type: 'scale', min: 1, max: 5, weight: 1.0, description: 'Quality of technique used' },
      { id: 'assignment', name: 'Assignment', type: 'scale', min: 1, max: 5, weight: 1.0, description: 'Correctness of assignment' }
    ]
  );
  const [tags, setTags] = useState<string[]>(config?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [settings, setSettings] = useState(config?.settings || {
    showPlayerNumbers: true,
    allowMultiplePositions: true,
    defaultView: 'grid' as const,
    quickGradeEnabled: true
  });
  const [editingField, setEditingField] = useState<string | null>(null);

  const updateConfig = () => {
    const newConfig = {
      id: config?.id,
      positionGroupId: positionGroup.id,
      gradingFields: gradingFields || [],
      metricFields: config?.metricFields || {},
      tags: tags || [],
      settings: settings || {
        showPlayerNumbers: true,
        allowMultiplePositions: true,
        defaultView: 'grid' as const,
        quickGradeEnabled: true
      }
    };
    onChange(newConfig);
  };

  const addGradingField = () => {
    const newField: GradingField = {
      id: `field_${Date.now()}`,
      name: 'New Field',
      type: 'scale',
      min: 1,
      max: 5,
      weight: 1.0,
      description: ''
    };
    setGradingFields([...gradingFields, newField]);
    setEditingField(newField.id);
  };

  const updateGradingField = (id: string, updates: Partial<GradingField>) => {
    setGradingFields(fields => 
      fields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeGradingField = (id: string) => {
    setGradingFields(fields => fields.filter(field => field.id !== id));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSettingsChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  // Update config whenever state changes
  React.useEffect(() => {
    updateConfig();
  }, [gradingFields, tags, settings]);

  return (
    <div className="space-y-6">
      {/* Grading Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Grading Fields</span>
            <Button onClick={addGradingField} size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </CardTitle>
          <CardDescription>
            Define the criteria for grading {positionGroup.displayName} performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gradingFields.map((field) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-3">
              {editingField === field.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`${field.id}-name`}>Field Name</Label>
                      <Input
                        id={`${field.id}-name`}
                        value={field.name}
                        onChange={(e) => updateGradingField(field.id, { name: e.target.value })}
                        placeholder="e.g., Execution, Technique"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${field.id}-type`}>Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value: any) => updateGradingField(field.id, { type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scale">Scale (1-5)</SelectItem>
                          <SelectItem value="boolean">Yes/No</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="select">Select Options</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {field.type === 'scale' && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`${field.id}-min`}>Min Value</Label>
                        <Input
                          id={`${field.id}-min`}
                          type="number"
                          value={field.min || 1}
                          onChange={(e) => updateGradingField(field.id, { min: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${field.id}-max`}>Max Value</Label>
                        <Input
                          id={`${field.id}-max`}
                          type="number"
                          value={field.max || 5}
                          onChange={(e) => updateGradingField(field.id, { max: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${field.id}-weight`}>Weight</Label>
                        <Input
                          id={`${field.id}-weight`}
                          type="number"
                          step="0.1"
                          value={field.weight}
                          onChange={(e) => updateGradingField(field.id, { weight: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  {field.type === 'number' && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`${field.id}-min`}>Min Value</Label>
                        <Input
                          id={`${field.id}-min`}
                          type="number"
                          value={field.min || 0}
                          onChange={(e) => updateGradingField(field.id, { min: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${field.id}-max`}>Max Value</Label>
                        <Input
                          id={`${field.id}-max`}
                          type="number"
                          value={field.max || 100}
                          onChange={(e) => updateGradingField(field.id, { max: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${field.id}-step`}>Step</Label>
                        <Input
                          id={`${field.id}-step`}
                          type="number"
                          step="0.1"
                          value={field.step || 1}
                          onChange={(e) => updateGradingField(field.id, { step: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  {field.type === 'select' && (
                    <div className="space-y-2">
                      <Label>Options (one per line)</Label>
                      <Textarea
                        value={field.options?.join('\n') || ''}
                        onChange={(e) => updateGradingField(field.id, { 
                          options: e.target.value.split('\n').filter(opt => opt.trim()) 
                        })}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                        rows={3}
                      />
                    </div>
                  )}

                  {field.type === 'percentage' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`${field.id}-min`}>Min %</Label>
                        <Input
                          id={`${field.id}-min`}
                          type="number"
                          min="0"
                          max="100"
                          value={field.min || 0}
                          onChange={(e) => updateGradingField(field.id, { min: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${field.id}-max`}>Max %</Label>
                        <Input
                          id={`${field.id}-max`}
                          type="number"
                          min="0"
                          max="100"
                          value={field.max || 100}
                          onChange={(e) => updateGradingField(field.id, { max: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  {(field.type === 'number' || field.type === 'percentage') && (
                    <div>
                      <Label htmlFor={`${field.id}-unit`}>Unit (optional)</Label>
                      <Input
                        id={`${field.id}-unit`}
                        value={field.unit || ''}
                        onChange={(e) => updateGradingField(field.id, { unit: e.target.value })}
                        placeholder="e.g., yards, seconds, points"
                      />
                    </div>
                  )}

                  {field.type !== 'scale' && field.type !== 'number' && field.type !== 'percentage' && (
                    <div>
                      <Label htmlFor={`${field.id}-weight`}>Weight</Label>
                      <Input
                        id={`${field.id}-weight`}
                        type="number"
                        step="0.1"
                        value={field.weight}
                        onChange={(e) => updateGradingField(field.id, { weight: parseFloat(e.target.value) })}
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor={`${field.id}-description`}>Description</Label>
                    <Input
                      id={`${field.id}-description`}
                      value={field.description || ''}
                      onChange={(e) => updateGradingField(field.id, { description: e.target.value })}
                      placeholder="Optional description of this grading field"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => setEditingField(null)} size="sm">
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      onClick={() => removeGradingField(field.id)} 
                      variant="destructive" 
                      size="sm"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{field.name}</h4>
                      <Badge variant="outline">{field.type}</Badge>
                      {field.type === 'scale' && (
                        <Badge variant="secondary">{field.min}-{field.max}</Badge>
                      )}
                      <Badge variant="outline">Weight: {field.weight}</Badge>
                    </div>
                    {field.description && (
                      <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                    )}
                  </div>
                  <Button 
                    onClick={() => setEditingField(field.id)} 
                    variant="outline" 
                    size="sm"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {gradingFields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CogIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No grading fields configured yet.</p>
              <p className="text-sm">Click "Add Field" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>
            Add tags for quick categorization and filtering of grades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a new tag..."
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button onClick={addTag} disabled={!newTag.trim()}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          {tags.length === 0 && (
            <p className="text-sm text-muted-foreground">No tags added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Configure how grading works for {positionGroup.displayName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-player-numbers">Show Player Numbers</Label>
              <p className="text-sm text-muted-foreground">Display jersey numbers during grading</p>
            </div>
            <Switch
              id="show-player-numbers"
              checked={settings.showPlayerNumbers}
              onCheckedChange={(checked) => handleSettingsChange('showPlayerNumbers', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow-multiple-positions">Allow Multiple Positions</Label>
              <p className="text-sm text-muted-foreground">Allow players to be assigned to multiple positions</p>
            </div>
            <Switch
              id="allow-multiple-positions"
              checked={settings.allowMultiplePositions}
              onCheckedChange={(checked) => handleSettingsChange('allowMultiplePositions', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="quick-grade-enabled">Quick Grade Enabled</Label>
              <p className="text-sm text-muted-foreground">Enable quick grading shortcuts</p>
            </div>
            <Switch
              id="quick-grade-enabled"
              checked={settings.quickGradeEnabled}
              onCheckedChange={(checked) => handleSettingsChange('quickGradeEnabled', checked)}
            />
          </div>
          
          <div>
            <Label htmlFor="default-view">Default View</Label>
            <Select
              value={settings.defaultView}
              onValueChange={(value: any) => handleSettingsChange('defaultView', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
