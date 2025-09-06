'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Edit, Save, X } from 'lucide-react';
import { getPositionModule, PositionConfiguration, GradingField } from '@/modules/core/position-registry';

interface EditingField extends GradingField {
  isNew?: boolean;
}

export default function PositionConfigurationPage() {
  const params = useParams();
  const positionName = params.position as string;
  
  const [moduleData, setModuleData] = useState<any>(null);
  const [config, setConfig] = useState<PositionConfiguration | null>(null);
  const [newTag, setNewTag] = useState('');
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [showFieldDialog, setShowFieldDialog] = useState(false);

  useEffect(() => {
    const moduleId = Object.keys(require('@/modules/core/position-registry').POSITION_MODULES)
      .find(key => require('@/modules/core/position-registry').POSITION_MODULES[key].name === positionName);
    
    if (moduleId) {
      const module = getPositionModule(moduleId);
      setModuleData(module);
      setConfig(module?.defaultConfig || null);
    }
  }, [positionName]);

  // Field Management Functions
  const createNewField = () => {
    const newField: EditingField = {
      id: `custom_${Date.now()}`,
      label: '',
      type: 'grade',
      required: false,
      helpText: '',
      isNew: true
    };
    setEditingField(newField);
    setShowFieldDialog(true);
  };

  const editField = (field: GradingField) => {
    setEditingField({ ...field });
    setShowFieldDialog(true);
  };

  const saveField = () => {
    if (!config || !editingField) return;

    const updatedFields = editingField.isNew
      ? [...config.gradingFields, { ...editingField, isNew: undefined }]
      : config.gradingFields.map(field => 
          field.id === editingField.id ? { ...editingField, isNew: undefined } : field
        );

    setConfig({
      ...config,
      gradingFields: updatedFields
    });

    setEditingField(null);
    setShowFieldDialog(false);
  };

  const deleteField = (fieldId: string) => {
    if (!config) return;
    
    if (confirm('Are you sure you want to delete this grading field?')) {
      setConfig({
        ...config,
        gradingFields: config.gradingFields.filter(field => field.id !== fieldId)
      });
    }
  };

  const updateFieldProperty = (property: keyof EditingField, value: any) => {
    if (!editingField) return;
    
    setEditingField({
      ...editingField,
      [property]: value
    });
  };

  // Tag Management
  const addTag = () => {
    if (!config || !newTag.trim()) return;
    
    setConfig({
      ...config,
      tags: [...config.tags, newTag.trim()]
    });
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    if (!config) return;
    
    setConfig({
      ...config,
      tags: config.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const saveConfiguration = async () => {
    console.log('Saving configuration:', config);
    alert('Configuration saved! (TODO: Implement API call)');
  };

  if (!moduleData || !config) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <moduleData.icon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{moduleData.displayName} Configuration</h1>
              <p className="text-gray-600">{moduleData.description}</p>
            </div>
          </div>
        </div>

        {/* Grading Fields Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Grading Fields</CardTitle>
            <Button onClick={createNewField}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.gradingFields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No grading fields configured.</p>
                <Button onClick={createNewField} className="mt-2">
                  Add your first grading field
                </Button>
              </div>
            ) : (
              config.gradingFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{field.label}</h4>
                      {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{field.helpText}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{field.type}</Badge>
                      {field.type === 'grade' && field.min !== undefined && field.max !== undefined && (
                        <Badge variant="outline" className="text-xs">Range: {field.min} to {field.max}</Badge>
                      )}
                      {field.options && (
                        <Badge variant="outline" className="text-xs">
                          {field.options.length} options
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editField(field)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteField(field.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Field Editor Dialog */}
        <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingField?.isNew ? 'Add New Grading Field' : 'Edit Grading Field'}
              </DialogTitle>
            </DialogHeader>
            
            {editingField && (
              <div className="space-y-6 py-4">
                {/* Field Label */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Field Label *</label>
                  <Input
                    value={editingField.label}
                    onChange={(e) => updateFieldProperty('label', e.target.value)}
                    placeholder="e.g., Pass Protection, Decision Making"
                  />
                </div>

                {/* Field Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Field Type *</label>
                  <Select
                    value={editingField.type}
                    onValueChange={(value) => updateFieldProperty('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grade">Grade (-2 to +2)</SelectItem>
                      <SelectItem value="boolean">Yes/No</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="select">Dropdown</SelectItem>
                      <SelectItem value="multiselect">Multiple Choice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Grade Range (for grade type) */}
                {editingField.type === 'grade' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Min Value</label>
                      <Input
                        type="number"
                        value={editingField.min || -2}
                        onChange={(e) => updateFieldProperty('min', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Value</label>
                      <Input
                        type="number"
                        value={editingField.max || 2}
                        onChange={(e) => updateFieldProperty('max', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                {/* Number Range (for number type) */}
                {editingField.type === 'number' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Min Value</label>
                      <Input
                        type="number"
                        value={editingField.min || 0}
                        onChange={(e) => updateFieldProperty('min', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Value</label>
                      <Input
                        type="number"
                        value={editingField.max || 100}
                        onChange={(e) => updateFieldProperty('max', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                {/* Options (for select/multiselect) */}
                {(editingField.type === 'select' || editingField.type === 'multiselect') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Options (one per line)</label>
                    <Textarea
                      value={editingField.options?.join('\n') || ''}
                      onChange={(e) => updateFieldProperty('options', e.target.value.split('\n').filter(opt => opt.trim()))}
                      placeholder={`Option 1\nOption 2\nOption 3`}
                      rows={4}
                    />
                  </div>
                )}

                {/* Placeholder (for text/number) */}
                {(editingField.type === 'text' || editingField.type === 'number') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Placeholder</label>
                    <Input
                      value={editingField.placeholder || ''}
                      onChange={(e) => updateFieldProperty('placeholder', e.target.value)}
                      placeholder="Placeholder text..."
                    />
                  </div>
                )}

                {/* Help Text */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Help Text</label>
                  <Textarea
                    value={editingField.helpText || ''}
                    onChange={(e) => updateFieldProperty('helpText', e.target.value)}
                    placeholder="Brief description of what this field measures..."
                    rows={2}
                  />
                </div>

                {/* Required Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Required Field</h4>
                    <p className="text-sm text-gray-600">Must be filled out during grading</p>
                  </div>
                  <Switch
                    checked={editingField.required}
                    onCheckedChange={(checked) => updateFieldProperty('required', checked)}
                  />
                </div>

                {/* Dialog Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingField(null);
                      setShowFieldDialog(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveField}
                    disabled={!editingField.label.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingField.isNew ? 'Add Field' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Tags Management */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag..."
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {config.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer flex items-center gap-1 hover:bg-red-100"
                >
                  {tag}
                  <Trash2 
                    className="h-3 w-3 hover:text-red-500" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Show Player Numbers</h4>
                <p className="text-sm text-gray-600">Display jersey numbers in grading interface</p>
              </div>
              <Switch
                checked={config.settings.showPlayerNumbers}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    settings: { ...config.settings, showPlayerNumbers: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Quick Grade Mode</h4>
                <p className="text-sm text-gray-600">Enable rapid grading with shortcuts</p>
              </div>
              <Switch
                checked={config.settings.quickGradeEnabled}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    settings: { ...config.settings, quickGradeEnabled: checked }
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={saveConfiguration} size="lg" className="px-8">
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
