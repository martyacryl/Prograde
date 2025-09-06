import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { KaggleNCAADataSource } from '@/lib/data-sources/ncaa/kaggle-ncaa';
import { ESPNNCAADataSource } from '@/lib/data-sources/ncaa/espn-api';
import { SportsReferenceDataSource } from '@/lib/data-sources/ncaa/sports-reference';
import { mapNCAAGameToExternal, mapNCAAPlayToExternal, fetchGamePlayByPlay, fetchRecentGames } from '@/lib/data-sources/ncaa-api';
import { GameMapper } from '@/lib/data-sources/parsers/game-mapper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, data, season, week } = body;

    if (!source || !data) {
      return NextResponse.json(
        { error: 'Source and data are required' },
        { status: 400 }
      );
    }

    let games = [];
    let plays = [];

    // Parse data based on source
    switch (source) {
      case 'kaggle_ncaa':
        const kaggleSource = new KaggleNCAADataSource(
          process.env.KAGGLE_USERNAME || '',
          process.env.KAGGLE_KEY || ''
        );
        
        if (data.games) {
          games = data.games.map((game: any) => kaggleSource.mapGameToExternal(game));
        }
        if (data.plays) {
          plays = data.plays.map((play: any) => kaggleSource.mapPlayToExternal(play, ''));
        }
        break;

      case 'espn':
        const espnSource = new ESPNNCAADataSource(process.env.ESPN_API_KEY || '');
        
        if (data.games) {
          games = data.games.map((game: any) => espnSource.mapGameToExternal(game));
        }
        if (data.plays) {
          plays = data.plays.map((play: any) => espnSource.mapPlayToExternal(play, ''));
        }
        break;

      case 'sports_reference':
        const srSource = new SportsReferenceDataSource(process.env.SPORTS_REFERENCE_API_KEY || '');
        
        if (data.games) {
          games = data.games.map((game: any) => srSource.mapGameToExternal(game));
        }
        if (data.plays) {
          plays = data.plays.map((play: any) => srSource.mapPlayToExternal(play, ''));
        }
        break;

      case 'ncaa_api':
        if (data.games) {
          games = data.games.map((game: any) => mapNCAAGameToExternal(game));
        }
        if (data.plays) {
          plays = data.plays.map((play: any) => mapNCAAPlayToExternal(play, ''));
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported data source' },
          { status: 400 }
        );
    }

    // Map teams using GameMapper
    const gameMapper = new GameMapper();
    const mappingResults = games.map((game: any) => 
      gameMapper.mapGameToTeams({
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        source: game.source,
        season: game.season,
      })
    );

    // Import games to database
    const importedGames = [];
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const mapping = mappingResults[i];

      try {
        const importedGame = await prisma.externalGame.create({
          data: {
            externalId: game.externalId,
            source: game.source,
            season: game.season,
            week: game.week,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            homeScore: game.homeScore,
            awayScore: game.awayScore,
            date: game.date,
            venue: game.venue,
            rawData: game.rawData,
          },
        });

        importedGames.push({
          ...importedGame,
          mapping: mapping,
        });

        // Import plays for this game if available
        if (plays.length > 0) {
          const gamePlays = plays.filter((play: any) => 
            play.externalGameId === game.externalId || 
            play.gameId === game.externalId
          );

          for (const play of gamePlays) {
            await prisma.externalPlay.create({
              data: {
                externalGameId: importedGame.id,
                externalId: play.externalId,
                source: play.source,
                quarter: play.quarter,
                time: play.time,
                down: play.down,
                distance: play.distance,
                yardLine: play.yardLine,
                playType: play.playType,
                description: play.description,
                offense: play.offense,
                defense: play.defense,
                rawData: play.rawData,
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error importing game ${game.externalId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedGames.length,
      total: games.length,
      mappingResults,
      message: `Successfully imported ${importedGames.length} NCAA games from ${source}`,
    });

  } catch (error) {
    console.error('Error importing NCAA games:', error);
    return NextResponse.json(
      { error: 'Failed to import NCAA games', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const season = searchParams.get('season');
    const week = searchParams.get('week');

    const where: any = {};
    if (source) where.source = source;
    if (season) where.season = parseInt(season);
    if (week) where.week = parseInt(week);

    const games = await prisma.externalGame.findMany({
      where,
      include: {
        externalPlays: {
          select: {
            id: true,
            externalId: true,
            quarter: true,
            time: true,
            playType: true,
            description: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      games,
      total: games.length,
    });

  } catch (error) {
    console.error('Error fetching NCAA games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NCAA games' },
      { status: 500 }
    );
  }
}
