import { Team, Game, Play, Formation, PlayGrade } from '@prisma/client'

export const mockTeams: Partial<Team>[] = [
  {
    id: 'team-1',
    name: 'Ohio State Buckeyes',
    abbreviation: 'OSU',
    conference: 'Big Ten',
    division: 'East',
    level: 'COLLEGE',
    logo: 'https://example.com/osu-logo.png',
    colors: { primary: '#BB0000', secondary: '#666666' }
  },
  {
    id: 'team-2',
    name: 'Michigan Wolverines',
    abbreviation: 'MICH',
    conference: 'Big Ten',
    division: 'East',
    level: 'COLLEGE',
    logo: 'https://example.com/mich-logo.png',
    colors: { primary: '#00274C', secondary: '#FFCB05' }
  },
  {
    id: 'team-3',
    name: 'Kansas City Chiefs',
    abbreviation: 'KC',
    conference: 'AFC',
    division: 'West',
    level: 'NFL',
    logo: 'https://example.com/kc-logo.png',
    colors: { primary: '#E31837', secondary: '#FFB81C' }
  }
]

export const mockGames: Partial<Game>[] = [
  {
    id: 'game-1',
    date: new Date('2024-11-30'),
    week: 13,
    seasonId: 'season-2024',
    teamId: 'team-1',
    opponentId: 'team-2',
    homeAway: 'HOME',
    score: { team: 24, opponent: 17, quarter: 4 },
    weather: { temperature: 45, wind: 8, conditions: 'Partly Cloudy' },
    attendance: 104000
  },
  {
    id: 'game-2',
    date: new Date('2024-12-07'),
    week: 14,
    seasonId: 'season-2024',
    teamId: 'team-1',
    opponentId: 'team-3',
    homeAway: 'AWAY',
    score: { team: 31, opponent: 28, quarter: 4 },
    weather: { temperature: 38, wind: 12, conditions: 'Light Snow' },
    attendance: 76500
  }
]

export const mockPlays: Partial<Play>[] = [
  {
    id: 'play-1',
    gameId: 'game-1',
    quarter: 1,
    time: '15:00',
    down: 1,
    distance: 10,
    playType: 'RUSH',
    formation: 'I-Formation',
    personnel: '21 Personnel',
    playAction: null,
    result: { yards: 7, touchdown: false, turnover: false, firstDown: false },
    isRedZone: false,
    isGoalToGo: false,
    isThirdDown: false,
    isFourthDown: false
  },
  {
    id: 'play-2',
    gameId: 'game-1',
    quarter: 1,
    time: '14:15',
    down: 2,
    distance: 3,
    playType: 'PASS',
    formation: 'Shotgun',
    personnel: '11 Personnel',
    playAction: 'Yes',
    result: { yards: 12, touchdown: false, turnover: false, firstDown: true },
    isRedZone: false,
    isGoalToGo: false,
    isThirdDown: false,
    isFourthDown: false
  },
  {
    id: 'play-3',
    gameId: 'game-1',
    quarter: 1,
    time: '13:30',
    down: 1,
    distance: 10,
    playType: 'RUSH',
    formation: 'Pistol',
    personnel: '12 Personnel',
    playAction: null,
    result: { yards: 2, touchdown: false, turnover: false, firstDown: false },
    isRedZone: false,
    isGoalToGo: false,
    isThirdDown: false,
    isFourthDown: false
  }
]

export const mockFormations: Partial<Formation>[] = [
  {
    id: 'formation-1',
    name: 'I-Formation',
    category: 'Pro Style',
    personnel: '21',
    description: 'Traditional I-Formation with fullback and tailback',
    isOffensive: true,
    diagram: {
      positions: {
        QB: { x: 50, y: 40 },
        RB: { x: 50, y: 60 },
        FB: { x: 50, y: 55 },
        LT: { x: 35, y: 30 },
        LG: { x: 40, y: 30 },
        C: { x: 50, y: 30 },
        RG: { x: 60, y: 30 },
        RT: { x: 65, y: 30 },
        TE: { x: 70, y: 30 },
        WR1: { x: 25, y: 20 },
        WR2: { x: 75, y: 20 }
      }
    }
  },
  {
    id: 'formation-2',
    name: 'Shotgun',
    category: 'Spread',
    personnel: '11',
    description: 'Shotgun formation with single back',
    isOffensive: true,
    diagram: {
      positions: {
        QB: { x: 50, y: 45 },
        RB: { x: 50, y: 55 },
        LT: { x: 35, y: 30 },
        LG: { x: 40, y: 30 },
        C: { x: 50, y: 30 },
        RG: { x: 60, y: 30 },
        RT: { x: 65, y: 30 },
        TE: { x: 70, y: 30 },
        WR1: { x: 25, y: 20 },
        WR2: { x: 75, y: 20 },
        WR3: { x: 50, y: 15 }
      }
    }
  },
  {
    id: 'formation-3',
    name: 'Pistol',
    category: 'Spread',
    personnel: '12',
    description: 'Pistol formation with two backs',
    isOffensive: true,
    diagram: {
      positions: {
        QB: { x: 50, y: 45 },
        RB: { x: 50, y: 60 },
        FB: { x: 50, y: 55 },
        LT: { x: 35, y: 30 },
        LG: { x: 40, y: 30 },
        C: { x: 50, y: 30 },
        RG: { x: 60, y: 30 },
        RT: { x: 65, y: 30 },
        TE1: { x: 70, y: 30 },
        TE2: { x: 30, y: 30 },
        WR1: { x: 25, y: 20 },
        WR2: { x: 75, y: 20 }
      }
    }
  }
]

export const mockPlayGrades: Partial<PlayGrade>[] = [
  {
    id: 'grade-1',
    playId: 'play-1',
    userId: 'user-1',
    teamId: 'team-1',
    gameId: 'game-1',
    execution: 4,
    technique: 4,
    assignment: 5,
    impact: 3,
    blitzType: 'No Blitz',
    coverage: 'Cover-2',
    pressure: false,
    turnover: false,
    tags: ['Good Blocking', 'Positive Yards'],
    notes: 'Excellent blocking by the offensive line, RB hit the hole hard'
  },
  {
    id: 'grade-2',
    playId: 'play-2',
    userId: 'user-1',
    teamId: 'team-1',
    gameId: 'game-1',
    execution: 5,
    technique: 5,
    assignment: 5,
    impact: 5,
    blitzType: 'Zone Blitz',
    coverage: 'Cover-3',
    pressure: false,
    turnover: false,
    tags: ['Big Play', 'First Down', 'Play Action'],
    notes: 'Perfect execution of play action, defense bit hard on the run'
  }
]

export const mockPersonnelPackages = [
  '11 Personnel (1 RB, 1 TE)',
  '12 Personnel (1 RB, 2 TE)',
  '21 Personnel (2 RB, 1 TE)',
  '22 Personnel (2 RB, 2 TE)',
  '10 Personnel (1 RB, 0 TE)',
  '20 Personnel (2 RB, 0 TE)',
  '13 Personnel (1 RB, 3 TE)',
  '23 Personnel (2 RB, 3 TE)'
]

export const mockBlitzTypes = [
  'No Blitz',
  'A-Gap Blitz',
  'B-Gap Blitz',
  'C-Gap Blitz',
  'Corner Blitz',
  'Safety Blitz',
  'Zone Blitz',
  'Delayed Blitz',
  'Stunt',
  'Twist'
]

export const mockCoverages = [
  'Cover-0',
  'Cover-1',
  'Cover-2',
  'Cover-3',
  'Cover-4',
  'Cover-6',
  'Man Coverage',
  'Zone Coverage',
  'Quarters',
  'Tampa-2'
]

export const mockTags = [
  'Big Play',
  'Missed Assignment',
  'Penalty',
  'Incomplete',
  'Sack',
  'Interception',
  'Fumble',
  'Touchdown',
  'Field Goal',
  'Punt',
  'Kickoff',
  'Extra Point',
  'Safety',
  'Timeout',
  'Challenge',
  'Good Blocking',
  'Poor Blocking',
  'Pressure',
  'No Pressure',
  'First Down',
  'Fourth Down Stop'
]
