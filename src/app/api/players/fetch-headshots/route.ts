import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ESPN API endpoints for player data
const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football';

interface ESPNPlayer {
  id: string;
  displayName: string;
  jersey: string;
  position: {
    displayName: string;
  };
  headshot?: {
    href: string;
  };
  team: {
    id: string;
    displayName: string;
  };
}

interface ESPNTeam {
  id: string;
  displayName: string;
  abbreviation: string;
  logo: string;
  color: string;
  alternateColor: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, seasonId, espnTeamId } = body;

    if (!teamId || !seasonId || !espnTeamId) {
      return NextResponse.json(
        { success: false, error: 'Team ID, Season ID, and ESPN Team ID are required' },
        { status: 400 }
      );
    }

    // Fetch team roster from ESPN
    const rosterResponse = await fetch(`${ESPN_BASE_URL}/teams/${espnTeamId}/roster`);
    if (!rosterResponse.ok) {
      throw new Error(`Failed to fetch roster: ${rosterResponse.statusText}`);
    }

    const rosterData = await rosterResponse.json();
    const players: ESPNPlayer[] = rosterData.athletes || [];

    // Fetch team info for colors and logo
    const teamResponse = await fetch(`${ESPN_BASE_URL}/teams/${espnTeamId}`);
    if (!teamResponse.ok) {
      throw new Error(`Failed to fetch team info: ${teamResponse.statusText}`);
    }

    const teamData = await teamResponse.json();
    const teamInfo: ESPNTeam = teamData.team;

    // Update team colors and logo
    await prisma.team.update({
      where: { id: teamId },
      data: {
        logo: teamInfo.logo,
        primaryColor: teamInfo.color,
        secondaryColor: teamInfo.alternateColor,
        colors: {
          primary: teamInfo.color,
          secondary: teamInfo.alternateColor,
          accent: teamInfo.alternateColor
        }
      }
    });

    const createdPlayers = [];
    const updatedPlayers = [];

    // Process each player
    for (const player of players) {
      try {
        // Check if player already exists
        const existingPlayer = await prisma.player.findUnique({
          where: {
            teamId_seasonId_jerseyNumber: {
              teamId,
              seasonId,
              jerseyNumber: player.jersey
            }
          }
        });

        const playerData = {
          teamId,
          seasonId,
          jerseyNumber: player.jersey,
          firstName: player.displayName.split(' ')[0] || '',
          lastName: player.displayName.split(' ').slice(1).join(' ') || '',
          position: player.position.displayName,
          headshotUrl: player.headshot?.href || null
        };

        if (existingPlayer) {
          // Update existing player with headshot
          const updatedPlayer = await prisma.player.update({
            where: { id: existingPlayer.id },
            data: {
              ...playerData,
              headshotUrl: player.headshot?.href || existingPlayer.headshotUrl
            },
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  abbreviation: true,
                  primaryColor: true,
                  secondaryColor: true,
                  logo: true
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
          updatedPlayers.push(updatedPlayer);
        } else {
          // Create new player
          const newPlayer = await prisma.player.create({
            data: playerData,
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  abbreviation: true,
                  primaryColor: true,
                  secondaryColor: true,
                  logo: true
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
          createdPlayers.push(newPlayer);
        }
      } catch (error) {
        console.error(`Failed to process player ${player.displayName}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${players.length} players from ESPN roster`,
      created: createdPlayers.length,
      updated: updatedPlayers.length,
      players: [...createdPlayers, ...updatedPlayers],
      teamColors: {
        primary: teamInfo.color,
        secondary: teamInfo.alternateColor,
        logo: teamInfo.logo
      }
    });

  } catch (error) {
    console.error('Failed to fetch player headshots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch player headshots from ESPN' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch ESPN team IDs for a given team name
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamName = searchParams.get('teamName');

    if (!teamName) {
      return NextResponse.json(
        { success: false, error: 'Team name is required' },
        { status: 400 }
      );
    }

    // Search for teams matching the name
    const searchResponse = await fetch(`${ESPN_BASE_URL}/teams?search=${encodeURIComponent(teamName)}`);
    if (!searchResponse.ok) {
      throw new Error(`Failed to search teams: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    const teams = searchData.sports?.[0]?.leagues?.[0]?.teams || [];

    const matchingTeams = teams.map((team: any) => ({
      id: team.team.id,
      name: team.team.displayName,
      abbreviation: team.team.abbreviation,
      logo: team.team.logo,
      color: team.team.color,
      alternateColor: team.team.alternateColor
    }));

    return NextResponse.json({
      success: true,
      teams: matchingTeams
    });

  } catch (error) {
    console.error('Failed to search ESPN teams:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search ESPN teams' },
      { status: 500 }
    );
  }
}
