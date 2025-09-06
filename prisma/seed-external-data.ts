import { PrismaClient } from '@prisma/client';
import { fetchTestGameData, TEST_GAMES } from '../src/lib/data-sources/ncaa-api';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding external data...');

  try {
    // Check if NCAA API is available
    console.log('📡 Checking NCAA API availability...');
    let testGamesData = [];
    
    try {
      testGamesData = await fetchTestGameData();
      console.log(`✅ NCAA API connected. Found ${testGamesData.length} test games.`);
    } catch (error) {
      console.log('⚠️  NCAA API not available, using mock data...');
      testGamesData = await createMockTestData();
    }

    // Import test games
    for (const testGame of testGamesData) {
      console.log(`📊 Importing ${testGame.game.description || testGame.key}...`);
      
      try {
        // Create external game
        const externalGame = await prisma.externalGame.create({
          data: {
            externalId: testGame.game.id || `mock_${Date.now()}`,
            source: 'ncaa_api',
            season: testGame.game.season || 2023,
            week: testGame.game.week || 13,
            homeTeam: testGame.game.home_team || 'Michigan',
            awayTeam: testGame.game.away_team || 'Ohio State',
            homeScore: testGame.game.home_score || 30,
            awayScore: testGame.game.away_score || 24,
            date: new Date(testGame.game.date || '2023-11-25'),
            venue: testGame.game.venue || 'Michigan Stadium',
            rawData: testGame.game,
          },
        });

        console.log(`  ✅ Created external game: ${externalGame.id}`);

        // Import plays
        if (testGame.plays && testGame.plays.length > 0) {
          console.log(`  📝 Importing ${testGame.plays.length} plays...`);
          
          for (const play of testGame.plays) {
            try {
              await prisma.externalPlay.create({
                data: {
                  externalGameId: externalGame.id,
                  externalId: play.id || `play_${Date.now()}_${Math.random()}`,
                  source: 'ncaa_api',
                  quarter: play.quarter || 1,
                  time: play.time || '15:00',
                  down: play.down || 1,
                  distance: play.distance || 10,
                  yardLine: play.yard_line || 25,
                  playType: play.play_type || 'RUSH',
                  description: play.description || 'Sample play description',
                  offense: play.offense || 'Michigan',
                  defense: play.defense || 'Ohio State',
                  rawData: play,
                },
              });
            } catch (playError) {
              console.error(`    ❌ Error importing play:`, playError);
            }
          }
          
          console.log(`  ✅ Successfully imported plays for game ${externalGame.id}`);
        }

      } catch (gameError) {
        console.error(`❌ Error importing game ${testGame.key}:`, gameError);
      }
    }

    // Create sample teams if they don't exist
    console.log('🏈 Creating sample teams...');
    
    const teams = [
      { name: 'Michigan Wolverines', abbreviation: 'MICH', conference: 'Big Ten', level: 'COLLEGE' },
      { name: 'Ohio State Buckeyes', abbreviation: 'OSU', conference: 'Big Ten', level: 'COLLEGE' },
      { name: 'Alabama Crimson Tide', abbreviation: 'ALA', conference: 'SEC', level: 'COLLEGE' },
      { name: 'Georgia Bulldogs', abbreviation: 'UGA', conference: 'SEC', level: 'COLLEGE' },
      { name: 'TCU Horned Frogs', abbreviation: 'TCU', conference: 'Big 12', level: 'COLLEGE' },
    ];

    for (const teamData of teams) {
      try {
        await prisma.team.upsert({
          where: { abbreviation: teamData.abbreviation },
          update: {},
          create: teamData,
        });
        console.log(`  ✅ Team: ${teamData.name}`);
      } catch (error) {
        console.error(`  ❌ Error creating team ${teamData.name}:`, error);
      }
    }

    // Create sample season
    console.log('📅 Creating sample season...');
    
    try {
      await prisma.season.upsert({
        where: { year: 2023 },
        update: {},
        create: {
          year: 2023,
          isActive: false,
          startDate: new Date('2023-08-26'),
          endDate: new Date('2024-01-08'),
        },
      });
      console.log('  ✅ Season 2023 created');
    } catch (error) {
      console.error('  ❌ Error creating season:', error);
    }

    console.log('🎉 External data seeding completed!');
    
    // Display summary
    const gameCount = await prisma.externalGame.count();
    const playCount = await prisma.externalPlay.count();
    const teamCount = await prisma.team.count();
    
    console.log('\n📊 Seeding Summary:');
    console.log(`  Games: ${gameCount}`);
    console.log(`  Plays: ${playCount}`);
    console.log(`  Teams: ${teamCount}`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

async function createMockTestData() {
  console.log('🔄 Creating mock test data...');
  
  return [
    {
      key: 'MICHIGAN_OHIO_STATE_2023',
      game: {
        id: '3146430',
        season: 2023,
        week: 13,
        home_team: 'Michigan',
        away_team: 'Ohio State',
        home_score: 30,
        away_score: 24,
        date: '2023-11-25',
        venue: 'Michigan Stadium',
        status: 'Final',
        quarter: 4,
        time: '00:00',
      },
      plays: generateMockPlays(150, 'Michigan', 'Ohio State'),
      playCount: 150,
      expectedPlays: 150,
    },
    {
      key: 'ALABAMA_GEORGIA_SEC_2023',
      game: {
        id: '3146431',
        season: 2023,
        week: 15,
        home_team: 'Alabama',
        away_team: 'Georgia',
        home_score: 27,
        away_score: 24,
        date: '2023-12-02',
        venue: 'Mercedes-Benz Stadium',
        status: 'Final',
        quarter: 4,
        time: '00:00',
      },
      plays: generateMockPlays(140, 'Alabama', 'Georgia'),
      playCount: 140,
      expectedPlays: 140,
    },
    {
      key: 'CFP_SEMIFINAL_2023',
      game: {
        id: '3146432',
        season: 2023,
        week: 16,
        home_team: 'TCU',
        away_team: 'Michigan',
        home_score: 51,
        away_score: 45,
        date: '2023-12-30',
        venue: 'State Farm Stadium',
        status: 'Final',
        quarter: 4,
        time: '00:00',
      },
      plays: generateMockPlays(160, 'TCU', 'Michigan'),
      playCount: 160,
      expectedPlays: 160,
    },
  ];
}

function generateMockPlays(count: number, offense: string, defense: string) {
  const plays = [];
  const playTypes = ['RUSH', 'PASS', 'PUNT', 'FIELD_GOAL', 'KICKOFF', 'EXTRA_POINT'];
  const formations = ['Shotgun', 'I-Formation', 'Pistol', 'Spread', 'Wildcat'];
  
  for (let i = 0; i < count; i++) {
    const quarter = Math.floor(i / (count / 4)) + 1;
    const time = `${Math.floor(Math.random() * 15)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
    const down = Math.floor(Math.random() * 4) + 1;
    const distance = Math.floor(Math.random() * 20) + 1;
    const yardLine = Math.floor(Math.random() * 100) + 1;
    
    plays.push({
      id: `play_${i}`,
      game_id: 'mock_game',
      quarter,
      time,
      down,
      distance,
      yard_line: yardLine,
      play_type: playTypes[Math.floor(Math.random() * playTypes.length)],
      description: `Mock play ${i + 1} - ${offense} vs ${defense}`,
      offense,
      defense,
      result: {
        yards: Math.floor(Math.random() * 20),
        success: Math.random() > 0.5,
        points: Math.random() > 0.9 ? 6 : 0,
        turnover: Math.random() > 0.95,
      },
      formation: formations[Math.floor(Math.random() * formations.length)],
      personnel: '11',
    });
  }
  
  return plays;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
