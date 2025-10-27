import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth-utils'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with new position-specific schema...')

  // Create seasons
  const season2024 = await prisma.season.upsert({
    where: { year: 2024 },
    update: {},
    create: {
      year: 2024,
      isActive: true,
      startDate: new Date('2024-08-24'),
      endDate: new Date('2025-01-13'),
    },
  })

  // Create teams
  const ohioState = await prisma.team.upsert({
    where: { abbreviation: 'OSU' },
    update: {},
    create: {
      name: 'Ohio State Buckeyes',
      abbreviation: 'OSU',
      conference: 'Big Ten',
      division: 'East',
      level: 'COLLEGE',
      logo: 'https://example.com/osu-logo.png',
      colors: { primary: '#BB0000', secondary: '#666666' }
    },
  })

  const michigan = await prisma.team.upsert({
    where: { abbreviation: 'MICH' },
    update: {},
    create: {
      name: 'Michigan Wolverines',
      abbreviation: 'MICH',
      conference: 'Big Ten',
      division: 'East',
      level: 'COLLEGE',
      logo: 'https://example.com/mich-logo.png',
      colors: { primary: '#00274C', secondary: '#FFCB05' }
    },
  })

  const kansasCity = await prisma.team.upsert({
    where: { abbreviation: 'KC' },
    update: {},
    create: {
      name: 'Kansas City Chiefs',
      abbreviation: 'KC',
      conference: 'AFC',
      division: 'West',
      level: 'NFL',
      logo: 'https://example.com/kc-logo.png',
      colors: { primary: '#E31837', secondary: '#FFB81C' }
    },
  })

  // Create position groups
  const offensiveLine = await prisma.positionGroup.upsert({
    where: { name: 'offensive-line' },
    update: {},
    create: {
      name: 'offensive-line',
      displayName: 'Offensive Line',
      category: 'OFFENSE',
      positions: ['LT', 'LG', 'C', 'RG', 'RT'],
      isActive: true,
    },
  })

  const quarterback = await prisma.positionGroup.upsert({
    where: { name: 'quarterback' },
    update: {},
    create: {
      name: 'quarterback',
      displayName: 'Quarterback',
      category: 'OFFENSE',
      positions: ['QB'],
      isActive: true,
    },
  })

  const runningBack = await prisma.positionGroup.upsert({
    where: { name: 'running-back' },
    update: {},
    create: {
      name: 'running-back',
      displayName: 'Running Back',
      category: 'OFFENSE',
      positions: ['RB', 'FB'],
      isActive: true,
    },
  })

  const wideReceivers = await prisma.positionGroup.upsert({
    where: { name: 'wide-receivers' },
    update: {},
    create: {
      name: 'wide-receivers',
      displayName: 'Wide Receivers',
      category: 'OFFENSE',
      positions: ['WR1', 'WR2', 'WR3', 'WR4'],
      isActive: true,
    },
  })

  const defensiveLine = await prisma.positionGroup.upsert({
    where: { name: 'defensive-line' },
    update: {},
    create: {
      name: 'defensive-line',
      displayName: 'Defensive Line',
      category: 'DEFENSE',
      positions: ['DE', 'DT', 'NT'],
      isActive: true,
    },
  })

  const linebackers = await prisma.positionGroup.upsert({
    where: { name: 'linebackers' },
    update: {},
    create: {
      name: 'linebackers',
      displayName: 'Linebackers',
      category: 'DEFENSE',
      positions: ['OLB', 'ILB', 'MLB'],
      isActive: true,
    },
  })

  const defensiveBacks = await prisma.positionGroup.upsert({
    where: { name: 'defensive-backs' },
    update: {},
    create: {
      name: 'defensive-backs',
      displayName: 'Defensive Backs',
      category: 'DEFENSE',
      positions: ['CB1', 'CB2', 'CB3', 'S1', 'S2', 'NB'],
      isActive: true,
    },
  })

  const specialTeams = await prisma.positionGroup.upsert({
    where: { name: 'special-teams' },
    update: {},
    create: {
      name: 'special-teams',
      displayName: 'Special Teams',
      category: 'SPECIAL_TEAMS',
      positions: ['K', 'P', 'LS', 'KR', 'PR'],
      isActive: true,
    },
  })

  // Hash passwords for test users
  const testPassword = await hashPassword('password123')
  
  // Create test users with hashed passwords
  const sampleUser = await prisma.user.upsert({
    where: { email: 'coach@example.com' },
    update: { password: testPassword, isActive: true },
    create: {
      email: 'coach@example.com',
      name: 'Coach Smith',
      password: testPassword,
      role: 'HEAD_COACH',
      teamId: ohioState.id,
      isActive: true,
    },
  })

  // Create additional test users
  const testUser2 = await prisma.user.upsert({
    where: { email: 'coordinator@example.com' },
    update: { password: testPassword, isActive: true },
    create: {
      email: 'coordinator@example.com',
      name: 'Coach Coordinator',
      password: testPassword,
      role: 'COORDINATOR',
      teamId: michigan.id,
      isActive: true,
    },
  })

  const testUser3 = await prisma.user.upsert({
    where: { email: 'analyst@example.com' },
    update: { password: testPassword, isActive: true },
    create: {
      email: 'analyst@example.com',
      name: 'Coach Analyst',
      password: testPassword,
      role: 'ANALYST',
      teamId: ohioState.id,
      isActive: true,
    },
  })

  // Create games
  const game1 = await prisma.game.upsert({
    where: { id: 'game-1' },
    update: {},
    create: {
      id: 'game-1',
      date: new Date('2024-11-30'),
      week: 13,
      seasonId: season2024.id,
      teamId: ohioState.id,
      opponentId: michigan.id,
      homeAway: 'HOME',
      score: { team: 24, opponent: 17, quarter: 4 },
      weather: { temperature: 45, wind: 8, conditions: 'Partly Cloudy' },
      attendance: 104000
    },
  })

  const game2 = await prisma.game.upsert({
    where: { id: 'game-2' },
    update: {},
    create: {
      id: 'game-2',
      date: new Date('2024-12-07'),
      week: 14,
      seasonId: season2024.id,
      teamId: ohioState.id,
      opponentId: kansasCity.id,
      homeAway: 'AWAY',
      score: { team: 31, opponent: 28, quarter: 4 },
      weather: { temperature: 38, wind: 12, conditions: 'Light Snow' },
      attendance: 76500
    },
  })

  // Create sample plays
  const play1 = await prisma.play.upsert({
    where: { id: 'play-1' },
    update: {},
    create: {
      id: 'play-1',
      gameId: game1.id,
      quarter: 1,
      time: '14:30',
      down: 1,
      distance: 10,
      playType: 'RUSH',
      formation: 'I-Formation',
      personnel: '21',
      playAction: 'Inside Zone',
      result: { yards: 4, firstDown: false, touchdown: false },
      isRedZone: false,
      isGoalToGo: false,
      isThirdDown: false,
      isFourthDown: false,
    },
  })

  const play2 = await prisma.play.upsert({
    where: { id: 'play-2' },
    update: {},
    create: {
      id: 'play-2',
      gameId: game1.id,
      quarter: 1,
      time: '13:45',
      down: 2,
      distance: 6,
      playType: 'PASS',
      formation: 'Shotgun',
      personnel: '11',
      playAction: 'Quick Slant',
      result: { yards: 8, firstDown: true, touchdown: false },
      isRedZone: false,
      isGoalToGo: false,
      isThirdDown: false,
      isFourthDown: false,
    },
  })

  // Create sample play grades
  const playGrade1 = await prisma.playGrade.upsert({
    where: { id: 'pg-1' },
    update: {},
    create: {
      id: 'pg-1',
      playId: play1.id,
      teamId: ohioState.id,
      gameId: game1.id,
      userId: sampleUser.id,
      execution: 3,
      technique: 4,
      assignment: 5,
      impact: 3,
      notes: 'Good blocking execution, RB found the hole',
      tags: ['Good Blocking', 'Inside Zone'],
    },
  })

  const playGrade2 = await prisma.playGrade.upsert({
    where: { id: 'pg-2' },
    update: {},
    create: {
      id: 'pg-2',
      playId: play2.id,
      teamId: ohioState.id,
      gameId: game1.id,
      userId: sampleUser.id,
      execution: 4,
      technique: 4,
      assignment: 5,
      impact: 4,
      notes: 'Excellent protection, QB had time to throw',
      tags: ['Great Protection', 'Quick Release'],
    },
  })

  // Create sample position play grades for Offensive Line
  const olPlayGrade1 = await prisma.positionPlayGrade.upsert({
    where: { id: 'olpg-1' },
    update: {},
    create: {
      id: 'olpg-1',
      playId: play1.id,
      playGradeId: playGrade1.id,
      positionGroupId: offensiveLine.id,
      playerNumber: '74',
      position: 'LT',
      grades: {
        passProtection: 0,
        runBlocking: 1,
        technique: 1,
        communication: 1
      },
      metrics: {
        pressuresAllowed: 0,
        knockdownBlocks: 1
      },
      notes: 'Good seal block on the edge',
      tags: ['Dominant Block', 'Great Communication'],
    },
  })

  const olPlayGrade2 = await prisma.positionPlayGrade.upsert({
    where: { id: 'olpg-2' },
    update: {},
    create: {
      id: 'olpg-2',
      playId: play1.id,
      playGradeId: playGrade1.id,
      positionGroupId: offensiveLine.id,
      playerNumber: '65',
      position: 'LG',
      grades: {
        passProtection: 0,
        runBlocking: 2,
        technique: 1,
        communication: 1
      },
      metrics: {
        pressuresAllowed: 0,
        knockdownBlocks: 1
      },
      notes: 'Excellent pull and lead block',
      tags: ['Dominant Block', 'Pancake Block'],
    },
  })

  console.log('✅ Database seeded successfully with new position-specific schema!')
  console.log(`   - ${season2024.year} season created`)
  console.log(`   - ${ohioState.name} team created`)
  console.log(`   - ${michigan.name} team created`)
  console.log(`   - ${kansasCity.name} team created`)
  console.log(`   - ${offensiveLine.displayName} position group created`)
  console.log(`   - ${quarterback.displayName} position group created`)
  console.log(`   - ${runningBack.displayName} position group created`)
  console.log(`   - ${wideReceivers.displayName} position group created`)
  console.log(`   - ${defensiveLine.displayName} position group created`)
  console.log(`   - ${linebackers.displayName} position group created`)
  console.log(`   - ${defensiveBacks.displayName} position group created`)
  console.log(`   - ${specialTeams.displayName} position group created`)
  console.log(`   - ${game1.id} game created`)
  console.log(`   - ${game2.id} game created`)
  console.log(`   - ${play1.id} play created`)
  console.log(`   - ${play2.id} play created`)
  console.log(`   - ${playGrade1.id} play grade created`)
  console.log(`   - ${playGrade2.id} play grade created`)
  console.log(`   - ${olPlayGrade1.id} OL position play grade created`)
  console.log(`   - ${olPlayGrade2.id} OL position play grade created`)
  console.log(`\n📋 Test Users Created (password: password123):`)
  console.log(`   - coach@example.com (HEAD_COACH)`)
  console.log(`   - coordinator@example.com (COORDINATOR)`)
  console.log(`   - analyst@example.com (ANALYST)`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
