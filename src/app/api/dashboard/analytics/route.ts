import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Get team info
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        games: {
          include: {
            team: true,
            opponent: true,
            plays: {
              include: {
                playGrade: true,
                positionGrades: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Calculate analytics
    const totalGames = team.games.length;
    const totalPlays = team.games.reduce((sum, game) => sum + game.plays.length, 0);
    const gradedPlays = team.games.reduce((sum, game) => {
      return sum + game.plays.filter(play => 
        play.playGrade || play.positionGrades.length > 0
      ).length;
    }, 0);

    // Calculate success rate from graded plays
    let totalGradePoints = 0;
    let totalGradeCount = 0;
    
    team.games.forEach(game => {
      game.plays.forEach(play => {
        if (play.playGrade) {
          // Calculate average from individual grade fields
          const grades = [
            play.playGrade.execution,
            play.playGrade.technique,
            play.playGrade.assignment,
            play.playGrade.impact
          ].filter(grade => grade !== null) as number[];
          
          if (grades.length > 0) {
            const avgGrade = grades.reduce((sum, val) => sum + val, 0) / grades.length;
            totalGradePoints += avgGrade;
            totalGradeCount++;
          }
        }
        
        play.positionGrades.forEach(positionGrade => {
          if (positionGrade.grades) {
            const gradeValues = Object.values(positionGrade.grades as Record<string, number>);
            if (gradeValues.length > 0) {
              const avgGrade = gradeValues.reduce((sum, val) => sum + val, 0) / gradeValues.length;
              totalGradePoints += avgGrade;
              totalGradeCount++;
            }
          }
        });
      });
    });

    const averageGrade = totalGradeCount > 0 ? totalGradePoints / totalGradeCount : 0;
    const successRate = ((averageGrade - 1) / 4) * 100; // Convert 1-5 scale to percentage

    // Get recent activity (last 10 games with grading activity)
    const recentGames = team.games
      .filter(game => game.plays.some(play => play.playGrade || play.positionGrades.length > 0))
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    const recentActivity = recentGames.map(game => {
      const gradedPlaysInGame = game.plays.filter(play => 
        play.playGrade || play.positionGrades.length > 0
      ).length;
      
      return {
        type: 'game' as const,
        title: `${game.team?.name || 'Home'} vs ${game.opponent?.name || 'Away'}`,
        description: `${gradedPlaysInGame} plays graded`,
        time: game.date ? formatTimeAgo(game.date) : 'Unknown',
        status: 'success' as const
      };
    });

    // Get upcoming games (games with no grading activity yet)
    const upcomingGames = team.games
      .filter(game => !game.plays.some(play => play.playGrade || play.positionGrades.length > 0))
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
      })
      .slice(0, 3)
      .map(game => ({
        team: game.team?.name || 'Home',
        opponent: game.opponent?.name || 'Away',
        date: game.date ? game.date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }) : 'TBD',
        time: game.date ? game.date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }) : 'TBD',
        venue: 'TBD' // We don't have venue data in the schema yet
      }));

    // Calculate trends (comparing last 7 days vs previous 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentGamesCount = team.games.filter(game => 
      game.date && new Date(game.date) >= sevenDaysAgo
    ).length;

    const previousGamesCount = team.games.filter(game => 
      game.date && new Date(game.date) >= fourteenDaysAgo && new Date(game.date) < sevenDaysAgo
    ).length;

    const gamesTrend = recentGamesCount - previousGamesCount;

    const analytics = {
      stats: {
        totalGames,
        totalPlays,
        gradedPlays,
        successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
        averageGrade: Math.round(averageGrade * 10) / 10,
        gamesTrend,
        gradedPlaysToday: 0, // We don't have timestamp data for individual grades yet
        activeGraders: 1 // For now, just the current user
      },
      recentActivity,
      upcomingGames,
      team: {
        name: team.name,
        abbreviation: team.abbreviation
      }
    };

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}
