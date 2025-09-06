import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  fetchGamePlayByPlay, 
  fetchRecentGames, 
  fetchGameDetails,
  mapNCAAGameToExternal, 
  mapNCAAPlayToExternal,
  TEST_GAMES 
} from '@/lib/data-sources/ncaa-api';
import { GameMapper } from '@/lib/data-sources/parsers/game-mapper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, gameId, season, week, importToDatabase = true } = body;

    let result: any = {};

    switch (action) {
      case 'fetch_game':
        if (!gameId) {
          return NextResponse.json(
            { error: 'Game ID is required for fetch_game action' },
            { status: 400 }
          );
        }
        
        const playByPlay = await fetchGamePlayByPlay(gameId);
        result = {
          action: 'fetch_game',
          gameId,
          game: playByPlay.game,
          plays: playByPlay.plays,
          playCount: playByPlay.plays.length,
        };
        break;

      case 'fetch_scoreboard':
        if (!season || !week) {
          return NextResponse.json(
            { error: 'Season and week are required for fetch_scoreboard action' },
            { status: 400 }
          );
        }
        
        const scoreboard = await fetchRecentGames(season, week);
        result = {
          action: 'fetch_scoreboard',
          season,
          week,
          games: scoreboard.games,
          gameCount: scoreboard.games.length,
          lastUpdated: scoreboard.last_updated,
        };
        break;

      case 'import_test_games':
        result = await importTestGames();
        break;

      case 'import_specific_game':
        if (!gameId) {
          return NextResponse.json(
            { error: 'Game ID is required for import_specific_game action' },
            { status: 400 }
          );
        }
        
        result = await importSpecificGame(gameId, importToDatabase);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: fetch_game, fetch_scoreboard, import_test_games, import_specific_game' },
          { status: 400 }
        );
    }

    // Import to database if requested
    if (importToDatabase && (action === 'import_test_games' || action === 'import_specific_game')) {
      // Data is already imported in the respective functions
    }

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error('Error in NCAA API route:', error);
    return NextResponse.json(
      { error: 'Failed to process NCAA API request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Import test games for development
 */
async function importTestGames() {
  const results = [];
  
  for (const [key, testGame] of Object.entries(TEST_GAMES)) {
    try {
      console.log(`Importing test game: ${testGame.description}`);
      const result = await importSpecificGame(testGame.id, true);
      results.push({
        key,
        description: testGame.description,
        ...result,
      });
    } catch (error) {
      console.error(`Failed to import test game ${key}:`, error);
      results.push({
        key,
        description: testGame.description,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  return {
    action: 'import_test_games',
    results,
    total: results.length,
    successful: results.filter(r => r.success).length,
  };
}

/**
 * Import a specific game from NCAA API
 */
async function importSpecificGame(gameId: string, importToDatabase: boolean) {
  try {
    // Fetch game data from NCAA API
    const playByPlay = await fetchGamePlayByPlay(gameId);
    
    if (!importToDatabase) {
      return {
        action: 'import_specific_game',
        gameId,
        game: playByPlay.game,
        plays: playByPlay.plays,
        playCount: playByPlay.plays.length,
        imported: false,
        message: 'Data fetched but not imported to database',
      };
    }

    // Map data to internal schema
    const externalGame = mapNCAAGameToExternal(playByPlay.game);
    const externalPlays = playByPlay.plays.map(play => mapNCAAPlayToExternal(play, ''));

    // Map teams using GameMapper
    const gameMapper = new GameMapper();
    const mappingResult = gameMapper.mapGameToTeams({
      homeTeam: externalGame.homeTeam,
      awayTeam: externalGame.awayTeam,
      source: externalGame.source,
      season: externalGame.season,
    });

    // Import to database
    const importedGame = await prisma.externalGame.create({
      data: {
        externalId: externalGame.externalId,
        source: externalGame.source,
        season: externalGame.season,
        week: externalGame.week,
        homeTeam: externalGame.homeTeam,
        awayTeam: externalGame.awayTeam,
        homeScore: externalGame.homeScore,
        awayScore: externalGame.awayScore,
        date: externalGame.date,
        venue: externalGame.venue,
        rawData: externalGame.rawData,
      },
    });

    // Import plays
    const importedPlays = [];
    for (const play of externalPlays) {
      try {
        const importedPlay = await prisma.externalPlay.create({
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
        importedPlays.push(importedPlay);
      } catch (error) {
        console.error(`Error importing play ${play.externalId}:`, error);
      }
    }

    return {
      action: 'import_specific_game',
      gameId,
      externalGameId: importedGame.id,
      game: playByPlay.game,
      plays: playByPlay.plays,
      playCount: playByPlay.plays.length,
      importedPlays: importedPlays.length,
      mappingResult,
      imported: true,
      message: `Successfully imported game ${gameId} with ${importedPlays.length} plays`,
    };

  } catch (error) {
    console.error(`Error importing game ${gameId}:`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const gameId = searchParams.get('gameId');
    const season = searchParams.get('season');
    const week = searchParams.get('week');

    if (action === 'fetch_game' && gameId) {
      const playByPlay = await fetchGamePlayByPlay(gameId);
      return NextResponse.json({
        success: true,
        action: 'fetch_game',
        gameId,
        game: playByPlay.game,
        plays: playByPlay.plays,
        playCount: playByPlay.plays.length,
      });
    }

    if (action === 'fetch_scoreboard' && season && week) {
      const scoreboard = await fetchRecentGames(season, week);
      return NextResponse.json({
        success: true,
        action: 'fetch_scoreboard',
        season,
        week,
        games: scoreboard.games,
        gameCount: scoreboard.games.length,
        lastUpdated: scoreboard.last_updated,
      });
    }

    if (action === 'test_games') {
      return NextResponse.json({
        success: true,
        action: 'test_games',
        testGames: TEST_GAMES,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'NCAA API endpoint. Use POST for data import or GET with specific actions.',
      supportedActions: ['fetch_game', 'fetch_scoreboard', 'test_games'],
      exampleUsage: {
        fetch_game: 'GET /api/data-import/ncaa-api?action=fetch_game&gameId=3146430',
        fetch_scoreboard: 'GET /api/data-import/ncaa-api?action=fetch_scoreboard&season=2024&week=13',
        test_games: 'GET /api/data-import/ncaa-api?action=test_games',
      },
    });

  } catch (error) {
    console.error('Error in NCAA API GET route:', error);
    return NextResponse.json(
      { error: 'Failed to process NCAA API GET request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
