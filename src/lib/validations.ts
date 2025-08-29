import { z } from "zod"

// User validation
export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["HEAD_COACH", "COORDINATOR", "ANALYST", "SCOUT"]),
  teamId: z.string().optional(),
})

// Team validation
export const teamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  abbreviation: z.string().min(2).max(4),
  conference: z.string().optional(),
  division: z.string().optional(),
  level: z.enum(["NFL", "COLLEGE", "HIGH_SCHOOL"]),
  logo: z.string().url().optional(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string().optional(),
  }).optional(),
})

// Game validation
export const gameSchema = z.object({
  date: z.date(),
  week: z.number().min(1).max(18),
  seasonId: z.string(),
  teamId: z.string(),
  opponentId: z.string(),
  homeAway: z.enum(["HOME", "AWAY", "NEUTRAL"]),
  score: z.object({
    team: z.number(),
    opponent: z.number(),
    quarter: z.number().min(1).max(4),
  }).optional(),
  weather: z.object({
    temperature: z.number().optional(),
    wind: z.number().optional(),
    conditions: z.string().optional(),
  }).optional(),
  attendance: z.number().optional(),
})

// Play validation
export const playSchema = z.object({
  gameId: z.string(),
  quarter: z.number().min(1).max(4),
  time: z.string().regex(/^\d{1,2}:\d{2}$/, "Time must be in MM:SS format"),
  down: z.number().min(1).max(4),
  distance: z.number().min(1),
  yardLine: z.number().min(0).max(100),
  playType: z.enum([
    "RUSH", "PASS", "PUNT", "FIELD_GOAL", "KICKOFF", 
    "EXTRA_POINT", "SAFETY", "PENALTY", "TIMEOUT", "CHALLENGE"
  ]),
  formation: z.string().optional(),
  personnel: z.string().optional(),
  playAction: z.boolean().default(false),
  result: z.object({
    yards: z.number().optional(),
    touchdown: z.boolean().default(false),
    turnover: z.boolean().default(false),
    firstDown: z.boolean().default(false),
    incomplete: z.boolean().default(false),
  }),
  description: z.string().optional(),
  isRedZone: z.boolean().default(false),
  isGoalToGo: z.boolean().default(false),
  isThirdDown: z.boolean().default(false),
  isFourthDown: z.boolean().default(false),
  externalPlayId: z.string().optional(),
  externalSource: z.string().optional(),
  playersInvolved: z.array(z.object({
    playerId: z.string(),
    role: z.string(),
  })).optional(),
})

// Play Grade validation
export const playGradeSchema = z.object({
  playId: z.string(),
  userId: z.string(),
  teamId: z.string(),
  gameId: z.string(),
  execution: z.number().min(1).max(5).optional(),
  technique: z.number().min(1).max(5).optional(),
  assignment: z.number().min(1).max(5).optional(),
  impact: z.number().min(1).max(5).optional(),
  blitzType: z.string().optional(),
  coverage: z.string().optional(),
  pressure: z.boolean().optional(),
  turnover: z.boolean().optional(),
  tags: z.array(z.string()),
  notes: z.string().optional(),
  situational: z.object({
    downTendency: z.string().optional(),
    redZone: z.boolean().optional(),
    goalToGo: z.boolean().optional(),
  }).optional(),
})

export type PlayGradeFormData = z.infer<typeof playGradeSchema>

// Play Input Form validation (for the complete form)
export const playInputFormSchema = z.object({
  // Play information
  gameId: z.string(),
  playId: z.string().optional(),
  userId: z.string(),
  teamId: z.string(),
  quarter: z.number().min(1).max(4),
  time: z.string().regex(/^\d{1,2}:\d{2}$/, "Time must be in MM:SS format"),
  down: z.number().min(1).max(4),
  distance: z.number().min(1),
  yardLine: z.number().min(0).max(100),
  playType: z.enum([
    "RUSH", "PASS", "PUNT", "FIELD_GOAL", "KICKOFF", 
    "EXTRA_POINT", "SAFETY", "PENALTY", "TIMEOUT", "CHALLENGE"
  ]),
  formation: z.string().optional(),
  personnel: z.string().optional(),
  playAction: z.boolean(),
  result: z.object({
    yards: z.number().optional(),
    touchdown: z.boolean(),
    turnover: z.boolean(),
    firstDown: z.boolean(),
    incomplete: z.boolean(),
  }),
  description: z.string().optional(),
  
  // Grading
  execution: z.number().min(1).max(5).optional(),
  technique: z.number().min(1).max(5).optional(),
  assignment: z.number().min(1).max(5).optional(),
  impact: z.number().min(1).max(5).optional(),
  blitzType: z.string().optional(),
  coverage: z.string().optional(),
  pressure: z.boolean().optional(),
  turnover: z.boolean().optional(),
  tags: z.array(z.string()),
  notes: z.string().optional(),
  situational: z.object({
    downTendency: z.string().optional(),
    redZone: z.boolean().optional(),
    goalToGo: z.boolean().optional(),
  }).optional(),
})

export type PlayInputFormData = z.infer<typeof playInputFormSchema>

// Formation validation
export const formationSchema = z.object({
  name: z.string().min(1, "Formation name is required"),
  category: z.string().min(1, "Category is required"),
  personnel: z.string().min(1, "Personnel is required"),
  description: z.string().optional(),
  diagram: z.object({
    positions: z.record(z.string(), z.object({
      x: z.number(),
      y: z.number(),
    })),
  }).optional(),
  isOffensive: z.boolean().default(true),
})

// Report validation
export const reportSchema = z.object({
  title: z.string().min(1, "Report title is required"),
  type: z.enum([
    "GAME_SUMMARY", "TENDENCY_ANALYSIS", "PLAYER_GRADES", 
    "SCOUTING_REPORT", "COMPARATIVE_ANALYSIS", "FORMATION_ANALYSIS",
    "DOWN_DISTANCE_ANALYSIS", "RED_ZONE_ANALYSIS"
  ]),
  gameIds: z.array(z.string()).min(1, "At least one game is required"),
  filters: z.record(z.string(), z.any()),
  data: z.record(z.string(), z.any()),
  userId: z.string(),
  teamId: z.string(),
  isPublic: z.boolean().default(false),
})

// Tendency Analysis validation
export const tendencyAnalysisSchema = z.object({
  teamId: z.string(),
  opponentId: z.string().optional(),
  gameId: z.string().optional(),
  seasonId: z.string().optional(),
  downDistanceTendencies: z.record(z.string(), z.record(z.string(), z.number())),
  formationTendencies: z.record(z.string(), z.any()),
  personnelTendencies: z.record(z.string(), z.any()),
  blitzTendencies: z.record(z.string(), z.any()),
})
