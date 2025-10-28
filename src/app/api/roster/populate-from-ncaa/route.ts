import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchGamePlayByPlay } from '@/lib/data-sources/ncaa-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, teamId, seasonId } = body;

    if (!gameId || !teamId || !seasonId) {
      return NextResponse.json(
        { success: false, error: 'Game ID, Team ID, and Season ID are required' },
        { status: 400 }
      );
    }

    // Fetch play-by-play data from NCAA API
    const playByPlay = await fetchGamePlayByPlay(gameId);
    
    // Extract unique players from play-by-play data
    const players = new Map();
    
    playByPlay.plays.forEach((play: any) => {
      // Extract players from play data
      if (play.players) {
        play.players.forEach((player: any) => {
          if (player.jersey && player.name) {
            const key = `${player.jersey}-${player.name}`;
            if (!players.has(key)) {
              players.set(key, {
                jerseyNumber: player.jersey,
                firstName: player.name.split(' ')[0] || '',
                lastName: player.name.split(' ').slice(1).join(' ') || '',
                position: player.position || 'UNKNOWN',
                teamId: teamId,
                seasonId: seasonId
              });
            }
          }
        });
      }
    });

    const playersToCreate = Array.from(players.values());
    const createdPlayers = [];

    // Create players in database
    for (const playerData of playersToCreate) {
      try {
        // Check if player already exists for this team and season
        const existingPlayer = await prisma.player.findUnique({
          where: {
            teamId_seasonId_jerseyNumber: {
              teamId: playerData.teamId,
              seasonId: playerData.seasonId,
              jerseyNumber: playerData.jerseyNumber
            }
          }
        });

        if (!existingPlayer) {
          const player = await prisma.player.create({
            data: playerData,
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  abbreviation: true
                }
              },
              season: {
                select: {
                  id: true,
                  year: true
                }
              }
            }
          });
          createdPlayers.push(player);
        }
      } catch (error) {
        console.error(`Failed to create player ${playerData.jerseyNumber}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdPlayers.length} new players from NCAA data for season ${seasonId}`,
      players: createdPlayers,
      totalPlayersFound: playersToCreate.length
    });

  } catch (error) {
    console.error('Failed to populate roster from NCAA data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to populate roster from NCAA data' },
      { status: 500 }
    );
  }
}
