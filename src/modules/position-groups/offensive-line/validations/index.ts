import { z } from 'zod'

// Grade scale validation (-2 to +2)
export const gradeScaleSchema = z.number().min(-2).max(2)

// OL Grading Data Schema
export const olGradingDataSchema = z.object({
  // Required grading fields
  passProtection: gradeScaleSchema,
  runBlocking: gradeScaleSchema,
  technique: gradeScaleSchema,
  communication: gradeScaleSchema.optional(),
  
  // Metric fields
  pressuresAllowed: z.number().min(0).max(10),
  knockdownBlocks: z.number().min(0).max(10),
  
  // Boolean fields
  blitzPickup: z.boolean(),
  stuntHandling: z.boolean(),
  doubleTeam: z.boolean(),
  chipBlock: z.boolean(),
  
  // Additional fields
  notes: z.string().optional(),
  tags: z.array(z.string())
})

// OL Form Data Schema
export const olFormDataSchema = z.object({
  playId: z.string().min(1, "Play ID is required"),
  playerNumber: z.string().min(1, "Player number is required"),
  position: z.enum(['LT', 'LG', 'C', 'RG', 'RT']),
  grading: olGradingDataSchema,
  timestamp: z.date(),
  userId: z.string().min(1, "User ID is required"),
  teamId: z.string().min(1, "Team ID is required")
})

// OL Configuration Schema
export const olConfigurationSchema = z.object({
  id: z.string().optional(),
  teamId: z.string().min(1, "Team ID is required"),
  userId: z.string().min(1, "User ID is required"),
  
  // Grading fields configuration
  gradingFields: z.object({
    passProtection: z.object({
      enabled: z.boolean(),
      required: z.boolean(),
      weight: z.number().min(1).max(5)
    }),
    runBlocking: z.object({
      enabled: z.boolean(),
      required: z.boolean(),
      weight: z.number().min(1).max(5)
    }),
    technique: z.object({
      enabled: z.boolean(),
      required: z.boolean(),
      weight: z.number().min(1).max(5)
    }),
    communication: z.object({
      enabled: z.boolean(),
      required: z.boolean(),
      weight: z.number().min(1).max(5)
    })
  }),
  
  // Metric fields configuration
  metricFields: z.object({
    pressuresAllowed: z.object({
      enabled: z.boolean(),
      maxValue: z.number().min(1).max(20),
      weight: z.number().min(1).max(5)
    }),
    knockdownBlocks: z.object({
      enabled: z.boolean(),
      maxValue: z.number().min(1).max(20),
      weight: z.number().min(1).max(5)
    })
  }),
  
  // Boolean fields configuration
  booleanFields: z.object({
    blitzPickup: z.object({
      enabled: z.boolean(),
      weight: z.number().min(1).max(5)
    }),
    stuntHandling: z.object({
      enabled: z.boolean(),
      weight: z.number().min(1).max(5)
    }),
    doubleTeam: z.object({
      enabled: z.boolean(),
      weight: z.number().min(1).max(5)
    }),
    chipBlock: z.object({
      enabled: z.boolean(),
      weight: z.number().min(1).max(5)
    })
  }),
  
  // Custom tags
  customTags: z.array(z.string()).default([]),
  
  // Settings
  settings: z.object({
    defaultGradeScale: z.enum(['5', '3', '2']),
    requireNotes: z.boolean(),
    autoSave: z.boolean(),
    quickGradeMode: z.boolean()
  })
})

// OL Quick Grade Schema
export const olQuickGradeSchema = z.object({
  playerNumber: z.string().min(1, "Player number is required"),
  position: z.enum(['LT', 'LG', 'C', 'RG', 'RT']),
  overallGrade: gradeScaleSchema,
  quickTags: z.array(z.string()).default([]),
  notes: z.string().optional()
})

// OL Play Summary Schema
export const olPlaySummarySchema = z.object({
  playId: z.string().min(1, "Play ID is required"),
  timestamp: z.date(),
  playerGrades: z.array(z.object({
    playerNumber: z.string(),
    position: z.enum(['LT', 'LG', 'C', 'RG', 'RT']),
    overallGrade: gradeScaleSchema,
    primaryIssue: z.string().optional(),
    primaryStrength: z.string().optional(),
    tags: z.array(z.string())
  })),
  teamGrade: z.number().min(-2).max(2),
  notes: z.string().optional()
})

// Export types
export type OLGradingData = z.infer<typeof olGradingDataSchema>
export type OLFormData = z.infer<typeof olFormDataSchema>
export type OLConfiguration = z.infer<typeof olConfigurationSchema>
export type OLQuickGrade = z.infer<typeof olQuickGradeSchema>
export type OLPlaySummary = z.infer<typeof olPlaySummarySchema>

// Validation functions
export function validateOLGradingData(data: unknown): OLGradingData {
  return olGradingDataSchema.parse(data)
}

export function validateOLFormData(data: unknown): OLFormData {
  return olFormDataSchema.parse(data)
}

export function validateOLConfiguration(data: unknown): OLConfiguration {
  return olConfigurationSchema.parse(data)
}

export function validateOLQuickGrade(data: unknown): OLQuickGrade {
  return olQuickGradeSchema.parse(data)
}

export function validateOLPlaySummary(data: unknown): OLPlaySummary {
  return olPlaySummarySchema.parse(data)
}
