export interface GradingField {
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

export interface PositionConfiguration {
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
