import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

            const game = await prisma.game.findUnique({
              where: {
                id: gameId
              },
              include: {
                plays: {
                  include: {
                    playGrade: true,
                    positionGrades: {
                      include: {
                        positionGroup: true
                      }
                    }
                  },
                  orderBy: [
                    { quarter: 'asc' },
                    { time: 'asc' }
                  ]
                },
                team: true,
                opponent: true,
                season: true
              }
            });

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    const totalPlays = game.plays.length;
    const gradedPlays = game.plays.filter(play => 
      play.playGrade || play.positionGrades.length > 0
    ).length;

    const formattedGame = {
      id: game.id,
      homeTeam: game.team?.name || 'Home Team',
      awayTeam: game.opponent?.name || 'Away Team',
      date: game.date.toISOString().split('T')[0],
      score: game.score || null,
      status: 'Imported',
      playCount: totalPlays,
      playsGraded: gradedPlays,
      totalPlays: totalPlays,
      season: game.season,
      week: game.week,
      plays: game.plays.map(play => ({
        id: play.id,
        quarter: play.quarter,
        time: play.time,
        down: play.down,
        distance: play.distance,
        yardLine: play.yardLine,
        playType: play.playType,
        description: play.description,
        offense: play.offense,
        defense: play.defense,
        formation: play.formation,
        personnel: play.personnel,
        playAction: play.playAction,
        result: play.result,
        isRedZone: play.isRedZone,
        isGoalToGo: play.isGoalToGo,
        isThirdDown: play.isThirdDown,
        isFourthDown: play.isFourthDown,
        playersInvolved: play.playersInvolved,
        externalPlayId: play.externalPlayId,
        externalSource: play.externalSource,
        hasGrade: !!(play.playGrade || play.positionGrades.length > 0),
        playGrade: play.playGrade,
        positionGrades: play.positionGrades
      }))
    };

    return NextResponse.json({
      success: true,
      game: formattedGame
    });

  } catch (error) {
    console.error('Failed to load game:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load game' },
      { status: 500 }
    );
  }
}
