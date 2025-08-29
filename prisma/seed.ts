import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

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

  // Create formations
  const iFormation = await prisma.formation.upsert({
    where: { name: 'I-Formation' },
    update: {},
    create: {
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
  })

  const shotgun = await prisma.formation.upsert({
    where: { name: 'Shotgun' },
    update: {},
    create: {
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
  })

  console.log('✅ Database seeded successfully!')
  console.log(`   - ${season2024.year} season created`)
  console.log(`   - ${ohioState.name} team created`)
  console.log(`   - ${michigan.name} team created`)
  console.log(`   - ${kansasCity.name} team created`)
  console.log(`   - ${game1.id} game created`)
  console.log(`   - ${game2.id} game created`)
  console.log(`   - ${iFormation.name} formation created`)
  console.log(`   - ${shotgun.name} formation created`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
