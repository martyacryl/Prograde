import { Shield, Target, Users, Zap, Crown, Wind, UserCheck, Eye } from 'lucide-react';

export interface PositionModuleDefinition {
  id: string;
  name: string;
  displayName: string;
  category: 'OFFENSE' | 'DEFENSE' | 'SPECIAL_TEAMS';
  positions: string[];
  defaultConfig: PositionConfiguration;
  icon: any;
  description: string;
}

export interface PositionConfiguration {
  gradingFields: GradingField[];
  metricFields: MetricField[];
  tags: string[];
  settings: {
    showPlayerNumbers: boolean;
    allowMultiplePositions: boolean;
    defaultView: 'grid' | 'list';
    quickGradeEnabled: boolean;
  };
}

export interface GradingField {
  id: string;
  label: string;
  type: 'grade' | 'boolean' | 'select' | 'number' | 'text' | 'multiselect';
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  placeholder?: string;
  helpText?: string;
}

export interface MetricField {
  id: string;
  label: string;
  type: 'counter' | 'percentage' | 'average' | 'boolean_count';
  aggregation: 'sum' | 'avg' | 'max' | 'min' | 'count';
  dependsOn?: string[];
}

export const POSITION_MODULES: Record<string, PositionModuleDefinition> = {
  OFFENSIVE_LINE: {
    id: 'OFFENSIVE_LINE',
    name: 'offensive-line',
    displayName: 'Offensive Line',
    category: 'OFFENSE',
    positions: ['LT', 'LG', 'C', 'RG', 'RT'], // Core 5 positions
    icon: Shield,
    description: 'Individual lineman grading: LT, LG, C, RG, RT',
    defaultConfig: {
      gradingFields: [
        {
          id: 'passProtection',
          label: 'Pass Protection',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Quality of pass protection for this specific lineman'
        },
        {
          id: 'runBlocking',
          label: 'Run Blocking',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Run blocking effectiveness for this lineman'
        },
        {
          id: 'technique',
          label: 'Technique',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Stance, hand placement, footwork for this position'
        },
        {
          id: 'assignment',
          label: 'Assignment',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Correctly executed assignment'
        },
        {
          id: 'pressureAllowed',
          label: 'Pressure Allowed',
          type: 'boolean',
          required: false,
          helpText: 'Did this lineman allow pressure?'
        },
        {
          id: 'pancakeBlock',
          label: 'Pancake Block',
          type: 'boolean',
          required: false,
          helpText: 'Dominant block that put defender on ground'
        },
        {
          id: 'penaltyCommitted',
          label: 'Penalty',
          type: 'boolean',
          required: false,
          helpText: 'Did this lineman commit a penalty?'
        }
      ],
      metricFields: [
        {
          id: 'passProtectionSuccess',
          label: 'Pass Pro Success Rate',
          type: 'percentage',
          aggregation: 'avg',
          dependsOn: ['passProtection']
        },
        {
          id: 'pressureRate',
          label: 'Pressure Rate',
          type: 'percentage', 
          aggregation: 'avg',
          dependsOn: ['pressureAllowed']
        }
      ],
      tags: [
        'Dominant Rep', 'Beaten Clean', 'Late Hands', 'Lost Leverage', 
        'Great Technique', 'Communication Leader', 'Penalty', 'Pancake'
      ],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: true, // Allow adding 6th OL, etc.
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    }
  },
  
  QUARTERBACK: {
    id: 'QUARTERBACK',
    name: 'quarterback',
    displayName: 'Quarterback',
    category: 'OFFENSE',
    positions: ['QB'],
    icon: Target,
    description: 'Accuracy, decision making, pocket presence',
    defaultConfig: {
      gradingFields: [
        {
          id: 'accuracy',
          label: 'Accuracy',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Ball placement and accuracy'
        },
        {
          id: 'decisionMaking',
          label: 'Decision Making',
          type: 'grade', 
          required: true,
          min: -2,
          max: 2,
          helpText: 'Read progression and decision quality'
        },
        {
          id: 'pocketPresence',
          label: 'Pocket Presence',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Pocket movement and pressure handling'
        },
        {
          id: 'preSnapRead',
          label: 'Pre-Snap Read',
          type: 'boolean',
          required: false,
          helpText: 'Correctly identified defensive coverage'
        }
      ],
      metricFields: [
        {
          id: 'completionRate',
          label: 'Completion Percentage',
          type: 'percentage',
          aggregation: 'avg',
          dependsOn: ['accuracy']
        }
      ],
      tags: ['Perfect Throw', 'Bad Read', 'Great Escape', 'Sacked', 'Touchdown', 'Interception'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: false,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    }
  },

  RUNNING_BACK: {
    id: 'RUNNING_BACK',
    name: 'running-back',
    displayName: 'Running Back',
    category: 'OFFENSE',
    positions: ['RB', 'FB'],
    icon: Wind,
    description: 'Vision, power, receiving, pass protection',
    defaultConfig: {
      gradingFields: [
        {
          id: 'vision',
          label: 'Vision',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Ability to find and hit running lanes'
        },
        {
          id: 'power',
          label: 'Power/Contact',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Power through contact and tackle breaking'
        },
        {
          id: 'receiving',
          label: 'Receiving',
          type: 'grade',
          required: false,
          min: -2,
          max: 2,
          helpText: 'Catching and route running on pass plays'
        },
        {
          id: 'passProtection',
          label: 'Pass Protection',
          type: 'grade',
          required: false,
          min: -2,
          max: 2,
          helpText: 'Blitz pickup and pass protection'
        }
      ],
      metricFields: [
        {
          id: 'yardsAfterContact',
          label: 'Avg Yards After Contact',
          type: 'average',
          aggregation: 'avg',
          dependsOn: ['power']
        }
      ],
      tags: ['Big Run', 'Missed Hole', 'Broken Tackle', 'Fumble', 'Touchdown', 'Goal Line'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: false,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    }
  },

  WIDE_RECEIVER: {
    id: 'WIDE_RECEIVER',
    name: 'wide-receiver',
    displayName: 'Wide Receiver',
    category: 'OFFENSE',
    positions: ['WR', 'SL'],
    icon: Users,
    description: 'Route running, catching, YAC, blocking',
    defaultConfig: {
      gradingFields: [
        {
          id: 'routeRunning',
          label: 'Route Running',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Precision and technique of route'
        },
        {
          id: 'catching',
          label: 'Catching',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Hands and catch technique'
        },
        {
          id: 'separation',
          label: 'Separation',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Ability to create separation from coverage'
        },
        {
          id: 'blocking',
          label: 'Blocking',
          type: 'grade',
          required: false,
          min: -2,
          max: 2,
          helpText: 'Downfield and perimeter blocking'
        }
      ],
      metricFields: [
        {
          id: 'catchRate',
          label: 'Catch Rate',
          type: 'percentage',
          aggregation: 'avg',
          dependsOn: ['catching']
        }
      ],
      tags: ['Perfect Route', 'Dropped Pass', 'Big Play', 'YAC', 'Touchdown', 'Great Block'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: true,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    }
  },

  TIGHT_END: {
    id: 'TIGHT_END',
    name: 'tight-end',
    displayName: 'Tight End',
    category: 'OFFENSE',
    positions: ['TE'],
    icon: UserCheck,
    description: 'Receiving, blocking, versatility',
    defaultConfig: {
      gradingFields: [
        {
          id: 'receiving',
          label: 'Receiving',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Route running and catching ability'
        },
        {
          id: 'runBlocking',
          label: 'Run Blocking',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Inline and lead blocking'
        },
        {
          id: 'passBlocking',
          label: 'Pass Blocking',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Pass protection and chip blocks'
        }
      ],
      metricFields: [],
      tags: ['Great Catch', 'Dominant Block', 'Missed Block', 'Seam Route', 'Red Zone'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: false,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    }
  },

  DEFENSIVE_LINE: {
    id: 'DEFENSIVE_LINE',
    name: 'defensive-line',
    displayName: 'Defensive Line',
    category: 'DEFENSE',
    positions: ['DE', 'DT', 'NT'],
    icon: Shield,
    description: 'Pass rush, run defense, technique',
    defaultConfig: {
      gradingFields: [
        {
          id: 'passRush',
          label: 'Pass Rush',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Pass rush effectiveness and technique'
        },
        {
          id: 'runDefense',
          label: 'Run Defense',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Run stopping and gap integrity'
        },
        {
          id: 'technique',
          label: 'Technique',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Hand placement, leverage, footwork'
        }
      ],
      metricFields: [
        {
          id: 'pressureRate',
          label: 'Pressure Rate',
          type: 'percentage',
          aggregation: 'avg',
          dependsOn: ['passRush']
        }
      ],
      tags: ['Sack', 'Pressure', 'TFL', 'Stuff', 'Beaten', 'Great Rush'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: false,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    }
  },

  LINEBACKER: {
    id: 'LINEBACKER',
    name: 'linebacker',
    displayName: 'Linebacker',
    category: 'DEFENSE',
    positions: ['LB', 'MLB', 'OLB'],
    icon: Users,
    description: 'Run defense, coverage, pass rush',
    defaultConfig: {
      gradingFields: [
        {
          id: 'runDefense',
          label: 'Run Defense',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Run fit and tackling'
        },
        {
          id: 'coverage',
          label: 'Coverage',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Pass coverage and awareness'
        },
        {
          id: 'passRush',
          label: 'Pass Rush',
          type: 'grade',
          required: false,
          min: -2,
          max: 2,
          helpText: 'Blitz effectiveness'
        }
      ],
      metricFields: [],
      tags: ['Great Tackle', 'Missed Tackle', 'Pass Breakup', 'Sack', 'TFL', 'Coverage'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: false,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    }
  },

  CORNERBACK: {
    id: 'CORNERBACK',
    name: 'cornerback',
    displayName: 'Cornerback',
    category: 'DEFENSE',
    positions: ['CB', 'NB'],
    icon: Eye,
    description: 'Coverage, tackling, ball skills',
    defaultConfig: {
      gradingFields: [
        {
          id: 'coverage',
          label: 'Coverage',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Coverage technique and positioning'
        },
        {
          id: 'tackling',
          label: 'Tackling',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Open field tackling'
        },
        {
          id: 'ballSkills',
          label: 'Ball Skills',
          type: 'grade',
          required: false,
          min: -2,
          max: 2,
          helpText: 'Interceptions and pass breakups'
        }
      ],
      metricFields: [],
      tags: ['Interception', 'Pass Breakup', 'Burned', 'Great Coverage', 'Missed Tackle'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: false,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    }
  },

  SAFETY: {
    id: 'SAFETY',
    name: 'safety',
    displayName: 'Safety',
    category: 'DEFENSE',
    positions: ['FS', 'SS'],
    icon: Crown,
    description: 'Coverage, run support, communication',
    defaultConfig: {
      gradingFields: [
        {
          id: 'coverage',
          label: 'Coverage',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Deep coverage and zone responsibility'
        },
        {
          id: 'runSupport',
          label: 'Run Support',
          type: 'grade',
          required: true,
          min: -2,
          max: 2,
          helpText: 'Run support and alley tackling'
        },
        {
          id: 'communication',
          label: 'Communication',
          type: 'grade',
          required: false,
          min: -2,
          max: 2,
          helpText: 'Pre-snap communication and adjustments'
        }
      ],
      metricFields: [],
      tags: ['Interception', 'Pass Breakup', 'Big Hit', 'Missed Tackle', 'Great Communication'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: false,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    }
  }
};

export function getPositionModule(moduleId: string): PositionModuleDefinition | null {
  return POSITION_MODULES[moduleId] || null;
}

export function getPositionModulesByCategory(category: string): PositionModuleDefinition[] {
  return Object.values(POSITION_MODULES).filter(module => module.category === category);
}

export function getAllPositionModules(): PositionModuleDefinition[] {
  return Object.values(POSITION_MODULES);
}
