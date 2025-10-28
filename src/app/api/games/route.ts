import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    const where: any = {};
    if (teamId) {
      where.OR = [
        { teamId: teamId },
        { opponentId: teamId }
      ];
    }

    const games = await prisma.game.findMany({
      where,
      include: {
        plays: {
          include: {
            playGrade: true,
            positionGrades: true
          }
        },
        team: true,
        opponent: true,
        season: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    const formattedGames = games.map(game => {
      const totalPlays = game.plays.length;
      const gradedPlays = game.plays.filter(play => play.playGrade || play.positionGrades.length > 0).length;
      const gradingProgress = totalPlays > 0 ? Math.round((gradedPlays / totalPlays) * 100) : 0;
      
      // Determine opponent info
      const isHomeTeam = game.teamId === teamId;
      const opponent = isHomeTeam ? game.opponent : game.team;
      const opponentAbbreviation = opponent?.abbreviation || opponent?.name?.substring(0, 3).toUpperCase() || 'OPP';
      
      return {
        id: game.id,
        date: game.date.toISOString().split('T')[0],
        opponent: opponent?.name || 'Unknown Opponent',
        opponentAbbreviation,
        season: game.season?.year?.toString() || 'Unknown',
        week: game.week || 1,
        gameType: 'regular' as const, // TODO: Add game type to schema
        status: 'completed' as const, // TODO: Add status to schema
        playsCount: totalPlays,
        gradedPlaysCount: gradedPlays,
        gradingProgress
      };
    });

    return NextResponse.json({ 
      success: true, 
      games: formattedGames 
    });

  } catch (error) {
    console.error('Failed to load games:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to load games',
      games: [] 
    });
  }
}


