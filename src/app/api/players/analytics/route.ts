import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const seasonId = searchParams.get('seasonId');
    const position = searchParams.get('position');
    const gameId = searchParams.get('gameId');

    if (!teamId || !seasonId) {
      return NextResponse.json(
        { success: false, error: 'Team ID and Season ID are required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      teamId,
      seasonId,
      isActive: true
    };

    if (position) {
      where.position = position;
    }

    // Get players with comprehensive data
    const players = await prisma.player.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
            primaryColor: true,
            secondaryColor: true,
            logo: true,
            colors: true
          }
        },
        season: {
          select: {
            id: true,
            year: true
          }
        },
        playGrades: {
          include: {
            play: {
              select: {
                id: true,
                quarter: true,
                time: true,
                down: true,
                distance: true,
                playType: true,
                result: true,
                isRedZone: true,
                isThirdDown: true,
                isFourthDown: true
              }
            },
            positionGroup: {
              select: {
                id: true,
                name: true,
                displayName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        gameRosters: {
          include: {
            game: {
              select: {
                id: true,
                date: true,
                opponent: {
                  select: {
                    name: true,
                    abbreviation: true,
                    primaryColor: true,
                    secondaryColor: true
                  }
                }
              }
            }
          },
          orderBy: {
            game: {
              date: 'desc'
            }
          }
        }
      },
      orderBy: [
        { position: 'asc' },
        { jerseyNumber: 'asc' }
      ]
    });

    // Calculate analytics for each player
    const playersWithAnalytics = players.map(player => {
      const totalGrades = player.playGrades.length;
      const gradesByPosition = player.playGrades.reduce((acc, grade) => {
        const pos = grade.specificPosition;
        if (!acc[pos]) {
          acc[pos] = {
            count: 0,
            totalScore: 0,
            averageScore: 0,
            grades: []
          };
        }
        acc[pos].count++;
        
        // Extract numeric grades from JSON
        const gradeData = grade.grades as any;
        const numericGrades = Object.values(gradeData).filter(val => 
          typeof val === 'number' && val > 0
        ) as number[];
        
        if (numericGrades.length > 0) {
          const avgGrade = numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length;
          acc[pos].totalScore += avgGrade;
          acc[pos].averageScore = acc[pos].totalScore / acc[pos].count;
          acc[pos].grades.push({
            playId: grade.playId,
            grade: avgGrade,
            quarter: grade.play.quarter,
            playType: grade.play.playType,
            isRedZone: grade.play.isRedZone,
            isThirdDown: grade.play.isThirdDown,
            tags: grade.tags,
            notes: grade.notes
          });
        }
        
        return acc;
      }, {} as any);

      // Calculate overall statistics
      const allGrades = player.playGrades.map(grade => {
        const gradeData = grade.grades as any;
        const numericGrades = Object.values(gradeData).filter(val => 
          typeof val === 'number' && val > 0
        ) as number[];
        return numericGrades.length > 0 ? 
          numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length : 0;
      }).filter(grade => grade > 0);

      const overallAverage = allGrades.length > 0 ? 
        allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length : 0;

      // Game participation
      const gamesPlayed = new Set(player.gameRosters.map(roster => roster.gameId)).size;
      const totalGames = player.gameRosters.length;

      // Recent performance (last 5 games)
      const recentGrades = allGrades.slice(0, 5);
      const recentAverage = recentGrades.length > 0 ?
        recentGrades.reduce((sum, grade) => sum + grade, 0) / recentGrades.length : 0;

      // Position breakdown
      const positionBreakdown = Object.entries(gradesByPosition).map(([position, data]: [string, any]) => ({
        position,
        gamesPlayed: data.count,
        averageGrade: data.averageScore,
        totalGrades: data.grades.length,
        recentGrades: data.grades.slice(0, 3) // Last 3 grades for this position
      }));

      return {
        ...player,
        analytics: {
          totalGrades,
          overallAverage,
          recentAverage,
          gamesPlayed,
          totalGames,
          positionBreakdown,
          gradeDistribution: {
            excellent: allGrades.filter(g => g >= 4.5).length,
            good: allGrades.filter(g => g >= 3.5 && g < 4.5).length,
            average: allGrades.filter(g => g >= 2.5 && g < 3.5).length,
            belowAverage: allGrades.filter(g => g < 2.5).length
          },
          trends: {
            improving: recentAverage > overallAverage,
            declining: recentAverage < overallAverage,
            consistent: Math.abs(recentAverage - overallAverage) < 0.3
          }
        }
      };
    });

    // Filter by game if specified
    let filteredPlayers = playersWithAnalytics;
    if (gameId) {
      filteredPlayers = playersWithAnalytics.filter(player =>
        player.gameRosters.some(roster => roster.gameId === gameId)
      );
    }

    return NextResponse.json({
      success: true,
      players: filteredPlayers,
      summary: {
        totalPlayers: filteredPlayers.length,
        averageGrade: filteredPlayers.length > 0 ? 
          filteredPlayers.reduce((sum, player) => sum + player.analytics.overallAverage, 0) / filteredPlayers.length : 0,
        totalGrades: filteredPlayers.reduce((sum, player) => sum + player.analytics.totalGrades, 0)
      }
    });

  } catch (error) {
    console.error('Failed to fetch player analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch player analytics' },
      { status: 500 }
    );
  }
}
