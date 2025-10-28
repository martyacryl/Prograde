import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { externalGameId, homeTeam, awayTeam, date, plays, source, teamId } = body;

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'Team ID is required' },
        { status: 400 }
      );
    }

    console.log(`Importing game: ${homeTeam} vs ${awayTeam} for team ${teamId}`);

    // Get or create season
    const year = new Date(date).getFullYear();
    let season = await prisma.season.findUnique({
      where: { year }
    });
    
    if (!season) {
      season = await prisma.season.create({
        data: {
          year,
          isActive: true,
          startDate: new Date(year, 0, 1), // January 1st
          endDate: new Date(year, 11, 31), // December 31st
        }
      });
    }

    // Get or create opponent team
    let opponentTeam = await prisma.team.findFirst({
      where: {
        OR: [
          { name: { contains: awayTeam, mode: 'insensitive' } },
          { abbreviation: { contains: awayTeam, mode: 'insensitive' } }
        ]
      }
    });

    if (!opponentTeam) {
      // Create opponent team if it doesn't exist
      opponentTeam = await prisma.team.create({
        data: {
          name: awayTeam,
          abbreviation: awayTeam.substring(0, 3).toUpperCase(),
          conference: 'Unknown',
          level: 'COLLEGE'
        }
      });
      console.log(`Created opponent team: ${opponentTeam.name}`);
    }

    // Determine if the importing team is home or away
    const isHomeTeam = homeTeam.toLowerCase().includes(teamId.toLowerCase()) || 
                      homeTeam.toLowerCase().includes('home') ||
                      Math.random() > 0.5; // Fallback to random if unclear

    const game = await prisma.game.create({
      data: {
        date: new Date(date),
        week: Math.ceil(new Date(date).getDate() / 7), // Simple week calculation
        seasonId: season.id,
        teamId: teamId,
        opponentId: opponentTeam.id,
        homeAway: isHomeTeam ? 'HOME' : 'AWAY',
        score: {
          team: Math.floor(Math.random() * 50) + 10, // Mock score for now
          opponent: Math.floor(Math.random() * 50) + 10
        },
        venue: 'Unknown Stadium', // TODO: Get from NCAA API
        status: 'final' // TODO: Get from NCAA API
      }
    });

    console.log(`Created game: ${game.id}`);

    // Create play records
    let playCount = 0;
    if (plays && plays.length > 0) {
      const playRecords = plays.map((play: any, index: number) => ({
        gameId: game.id,
        quarter: play.quarter || Math.ceil((index + 1) / 40),
        time: play.time || '15:00',
        down: play.down || 1,
        distance: play.distance || 10,
        yardLine: play.yard_line || play.yardLine || 25,
        playType: play.play_type || play.playType || 'RUSH',
        description: play.description || `Play ${index + 1}`,
        offense: play.offense || 'Unknown',
        defense: play.defense || 'Unknown',
        formation: play.formation || 'Shotgun',
        personnel: play.personnel || '11',
        playAction: play.playAction || play.description || `Play ${index + 1}`,
        result: play.result || {},
        isRedZone: (play.yard_line || play.yardLine || 25) <= 20,
        isGoalToGo: (play.distance || 10) <= 3,
        isThirdDown: (play.down || 1) === 3,
        isFourthDown: (play.down || 1) === 4,
        playersInvolved: play.playersInvolved || {},
        externalPlayId: play.id?.toString(),
        externalSource: source
      }));

      await prisma.play.createMany({
        data: playRecords
      });
      playCount = plays.length;
      console.log(`Created ${playCount} plays for game ${game.id}`);
    }

    // Create external game record for tracking
    await prisma.externalGame.create({
      data: {
        externalId: externalGameId,
        source: source,
        season: year,
        week: Math.ceil(new Date(date).getDate() / 7),
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        date: new Date(date),
        rawData: { homeTeam, awayTeam, plays: playCount },
        mappedGameId: game.id
      }
    });

    return NextResponse.json({ 
      success: true, 
      gameId: game.id,
      playCount: playCount,
      message: `Successfully imported ${playCount} plays for ${homeTeam} vs ${awayTeam}`
    });

  } catch (error) {
    console.error('Game import error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to import game: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}


