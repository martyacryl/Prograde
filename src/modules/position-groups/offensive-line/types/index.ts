export interface OLGradingData {
  // Required grading fields (-2 to +2 scale)
  passProtection: number // -2 to +2
  runBlocking: number // -2 to +2
  technique: number // -2 to +2
  communication: number // -2 to +2 (optional)
  
  // Metric fields (numbers)
  pressuresAllowed: number // 0-10
  knockdownBlocks: number // 0-10
  
  // Boolean fields
  blitzPickup: boolean
  stuntHandling: boolean
  doubleTeam: boolean
  chipBlock: boolean
  
  // Additional fields
  notes?: string
  tags: string[]
}

export interface OLFormData {
  // Play identification
  playId: string
  playerNumber: string
  position: 'LT' | 'LG' | 'C' | 'RG' | 'RT'
  
  // Grading data
  grading: OLGradingData
  
  // Metadata
  timestamp: Date
  userId: string
  teamId: string
}

export interface OLConfiguration {
  id: string
  teamId: string
  userId: string
  
  // Customizable grading fields
  gradingFields: {
    passProtection: {
      enabled: boolean
      required: boolean
      weight: number // 1-5
    }
    runBlocking: {
      enabled: boolean
      required: boolean
      weight: number
    }
    technique: {
      enabled: boolean
      required: boolean
      weight: number
    }
    communication: {
      enabled: boolean
      required: boolean
      weight: number
    }
  }
  
  // Customizable metric fields
  metricFields: {
    pressuresAllowed: {
      enabled: boolean
      maxValue: number
      weight: number
    }
    knockdownBlocks: {
      enabled: boolean
      maxValue: number
      weight: number
    }
  }
  
  // Customizable boolean fields
  booleanFields: {
    blitzPickup: {
      enabled: boolean
      weight: number
    }
    stuntHandling: {
      enabled: boolean
      weight: number
    }
    doubleTeam: {
      enabled: boolean
      weight: number
    }
    chipBlock: {
      enabled: boolean
      weight: number
    }
  }
  
  // Custom tags
  customTags: string[]
  
  // Settings
  settings: {
    defaultGradeScale: '5' | '3' | '2' // 5-point, 3-point, or 2-point scale
    requireNotes: boolean
    autoSave: boolean
    quickGradeMode: boolean
  }
  
  createdAt: Date
  updatedAt: Date
}

export interface OLAnalytics {
  // Performance metrics
  totalPlays: number
  averageGrade: number
  gradeDistribution: {
    '-2': number
    '-1': number
    '0': number
    '+1': number
    '+2': number
  }
  
  // Position-specific stats
  positionStats: {
    LT: OLPositionStats
    LG: OLPositionStats
    C: OLPositionStats
    RG: OLPositionStats
    RT: OLPositionStats
  }
  
  // Trend analysis
  trends: {
    passProtection: TrendData
    runBlocking: TrendData
    technique: TrendData
    communication: TrendData
  }
  
  // Tag frequency
  tagFrequency: Record<string, number>
  
  // Time period
  period: {
    start: Date
    end: Date
  }
}

export interface OLPositionStats {
  totalPlays: number
  averageGrade: number
  passProtectionGrade: number
  runBlockingGrade: number
  techniqueGrade: number
  communicationGrade: number
  pressuresAllowed: number
  knockdownBlocks: number
  blitzPickupSuccess: number
  stuntHandlingSuccess: number
  doubleTeamSuccess: number
  chipBlockSuccess: number
}

export interface TrendData {
  trend: 'improving' | 'declining' | 'stable'
  change: number // percentage change
  dataPoints: Array<{
    date: Date
    value: number
  }>
}

export interface OLQuickGrade {
  playerNumber: string
  position: 'LT' | 'LG' | 'C' | 'RG' | 'RT'
  overallGrade: number // -2 to +2
  quickTags: string[]
  notes?: string
}

export interface OLPlaySummary {
  playId: string
  timestamp: Date
  playerGrades: Array<{
    playerNumber: string
    position: 'LT' | 'LG' | 'C' | 'RG' | 'RT'
    overallGrade: number
    primaryIssue?: string
    primaryStrength?: string
    tags: string[]
  }>
  teamGrade: number
  notes?: string
}
