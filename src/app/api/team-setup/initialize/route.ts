import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// Default position configurations for different team levels
const DEFAULT_CONFIGURATIONS = {
  COLLEGE: {
    OFFENSIVE_LINE: {
      gradingFields: [
        { id: 'execution', name: 'Execution', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'technique', name: 'Technique', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'assignment', name: 'Assignment', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'impact', name: 'Impact', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'communication', name: 'Communication', type: 'grade', min: 1, max: 5, weight: 0.5 }
      ],
      metricFields: {
        snapsPlayed: { name: 'Snaps Played', type: 'number', unit: 'snaps' },
        pressuresAllowed: { name: 'Pressures Allowed', type: 'number', unit: 'pressures' },
        sacksAllowed: { name: 'Sacks Allowed', type: 'number', unit: 'sacks' }
      },
      tags: ['Good Blocking', 'Poor Blocking', 'Penalty', 'Injury', 'Substitution'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: true,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    },
    QUARTERBACK: {
      gradingFields: [
        { id: 'decisionMaking', name: 'Decision Making', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'accuracy', name: 'Accuracy', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'armStrength', name: 'Arm Strength', type: 'grade', min: 1, max: 5, weight: 0.8 },
        { id: 'mobility', name: 'Mobility', type: 'grade', min: 1, max: 5, weight: 0.7 },
        { id: 'leadership', name: 'Leadership', type: 'grade', min: 1, max: 5, weight: 0.6 }
      ],
      metricFields: {
        completions: { name: 'Completions', type: 'number', unit: 'completions' },
        attempts: { name: 'Attempts', type: 'number', unit: 'attempts' },
        passingYards: { name: 'Passing Yards', type: 'number', unit: 'yards' },
        rushingYards: { name: 'Rushing Yards', type: 'number', unit: 'yards' }
      },
      tags: ['Touchdown', 'Interception', 'Fumble', 'Sack', 'Scramble'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: false,
        defaultView: 'list',
        quickGradeEnabled: true
      }
    },
    RUNNING_BACK: {
      gradingFields: [
        { id: 'vision', name: 'Vision', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'power', name: 'Power', type: 'grade', min: 1, max: 5, weight: 0.9 },
        { id: 'speed', name: 'Speed', type: 'grade', min: 1, max: 5, weight: 0.8 },
        { id: 'ballSecurity', name: 'Ball Security', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'passProtection', name: 'Pass Protection', type: 'grade', min: 1, max: 5, weight: 0.7 }
      ],
      metricFields: {
        carries: { name: 'Carries', type: 'number', unit: 'carries' },
        rushingYards: { name: 'Rushing Yards', type: 'number', unit: 'yards' },
        receptions: { name: 'Receptions', type: 'number', unit: 'receptions' },
        receivingYards: { name: 'Receiving Yards', type: 'number', unit: 'yards' }
      },
      tags: ['Breakaway Run', 'Goal Line', 'Screen Pass', 'Fumble', 'Injury'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: true,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    },
    WIDE_RECEIVER: {
      gradingFields: [
        { id: 'routeRunning', name: 'Route Running', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'hands', name: 'Hands', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'separation', name: 'Separation', type: 'grade', min: 1, max: 5, weight: 0.9 },
        { id: 'blocking', name: 'Blocking', type: 'grade', min: 1, max: 5, weight: 0.6 },
        { id: 'yardsAfterCatch', name: 'YAC', type: 'grade', min: 1, max: 5, weight: 0.8 }
      ],
      metricFields: {
        targets: { name: 'Targets', type: 'number', unit: 'targets' },
        receptions: { name: 'Receptions', type: 'number', unit: 'receptions' },
        receivingYards: { name: 'Receiving Yards', type: 'number', unit: 'yards' },
        touchdowns: { name: 'Touchdowns', type: 'number', unit: 'touchdowns' }
      },
      tags: ['Deep Ball', 'Screen', 'Red Zone', 'Drop', 'Penalty'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: true,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    },
    TIGHT_END: {
      gradingFields: [
        { id: 'blocking', name: 'Blocking', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'routeRunning', name: 'Route Running', type: 'grade', min: 1, max: 5, weight: 0.9 },
        { id: 'hands', name: 'Hands', type: 'grade', min: 1, max: 5, weight: 0.9 },
        { id: 'separation', name: 'Separation', type: 'grade', min: 1, max: 5, weight: 0.7 },
        { id: 'yardsAfterCatch', name: 'YAC', type: 'grade', min: 1, max: 5, weight: 0.6 }
      ],
      metricFields: {
        targets: { name: 'Targets', type: 'number', unit: 'targets' },
        receptions: { name: 'Receptions', type: 'number', unit: 'receptions' },
        receivingYards: { name: 'Receiving Yards', type: 'number', unit: 'yards' },
        blockingGrade: { name: 'Blocking Grade', type: 'number', unit: 'grade' }
      },
      tags: ['In-Line Block', 'Motion', 'Red Zone', 'Drop', 'Penalty'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: true,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    },
    DEFENSIVE_LINE: {
      gradingFields: [
        { id: 'passRush', name: 'Pass Rush', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'runDefense', name: 'Run Defense', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'technique', name: 'Technique', type: 'grade', min: 1, max: 5, weight: 0.9 },
        { id: 'effort', name: 'Effort', type: 'grade', min: 1, max: 5, weight: 0.8 },
        { id: 'discipline', name: 'Discipline', type: 'grade', min: 1, max: 5, weight: 0.7 }
      ],
      metricFields: {
        tackles: { name: 'Tackles', type: 'number', unit: 'tackles' },
        sacks: { name: 'Sacks', type: 'number', unit: 'sacks' },
        pressures: { name: 'Pressures', type: 'number', unit: 'pressures' },
        tacklesForLoss: { name: 'TFL', type: 'number', unit: 'tfl' }
      },
      tags: ['Sack', 'Pressure', 'TFL', 'Penalty', 'Injury'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: true,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    },
    LINEBACKER: {
      gradingFields: [
        { id: 'tackling', name: 'Tackling', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'coverage', name: 'Coverage', type: 'grade', min: 1, max: 5, weight: 0.9 },
        { id: 'runDefense', name: 'Run Defense', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'blitz', name: 'Blitz', type: 'grade', min: 1, max: 5, weight: 0.8 },
        { id: 'communication', name: 'Communication', type: 'grade', min: 1, max: 5, weight: 0.7 }
      ],
      metricFields: {
        tackles: { name: 'Tackles', type: 'number', unit: 'tackles' },
        sacks: { name: 'Sacks', type: 'number', unit: 'sacks' },
        interceptions: { name: 'Interceptions', type: 'number', unit: 'interceptions' },
        passesDefended: { name: 'PD', type: 'number', unit: 'pd' }
      },
      tags: ['Big Hit', 'TFL', 'Sack', 'Interception', 'Penalty'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: true,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    },
    DEFENSIVE_BACK: {
      gradingFields: [
        { id: 'coverage', name: 'Coverage', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'tackling', name: 'Tackling', type: 'grade', min: 1, max: 5, weight: 0.9 },
        { id: 'ballSkills', name: 'Ball Skills', type: 'grade', min: 1, max: 5, weight: 0.9 },
        { id: 'runSupport', name: 'Run Support', type: 'grade', min: 1, max: 5, weight: 0.7 },
        { id: 'communication', name: 'Communication', type: 'grade', min: 1, max: 5, weight: 0.8 }
      ],
      metricFields: {
        tackles: { name: 'Tackles', type: 'number', unit: 'tackles' },
        interceptions: { name: 'Interceptions', type: 'number', unit: 'interceptions' },
        passesDefended: { name: 'PD', type: 'number', unit: 'pd' },
        forcedFumbles: { name: 'FF', type: 'number', unit: 'ff' }
      },
      tags: ['Interception', 'PD', 'Big Hit', 'Penalty', 'Injury'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: true,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    }
  },
  NFL: {
    // NFL configurations would be more detailed/advanced
    OFFENSIVE_LINE: {
      gradingFields: [
        { id: 'execution', name: 'Execution', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'technique', name: 'Technique', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'assignment', name: 'Assignment', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'impact', name: 'Impact', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'communication', name: 'Communication', type: 'grade', min: 1, max: 5, weight: 0.8 },
        { id: 'athleticism', name: 'Athleticism', type: 'grade', min: 1, max: 5, weight: 0.7 }
      ],
      metricFields: {
        snapsPlayed: { name: 'Snaps Played', type: 'number', unit: 'snaps' },
        pressuresAllowed: { name: 'Pressures Allowed', type: 'number', unit: 'pressures' },
        sacksAllowed: { name: 'Sacks Allowed', type: 'number', unit: 'sacks' },
        penalties: { name: 'Penalties', type: 'number', unit: 'penalties' }
      },
      tags: ['Elite Block', 'Good Block', 'Poor Block', 'Penalty', 'Injury', 'Substitution'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: true,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    }
    // Add other NFL position groups as needed
  },
  HIGH_SCHOOL: {
    // Simplified configurations for high school
    OFFENSIVE_LINE: {
      gradingFields: [
        { id: 'execution', name: 'Execution', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'effort', name: 'Effort', type: 'grade', min: 1, max: 5, weight: 1 },
        { id: 'assignment', name: 'Assignment', type: 'grade', min: 1, max: 5, weight: 1 }
      ],
      metricFields: {
        snapsPlayed: { name: 'Snaps Played', type: 'number', unit: 'snaps' }
      },
      tags: ['Good Play', 'Poor Play', 'Penalty'],
      settings: {
        showPlayerNumbers: true,
        allowMultiplePositions: true,
        defaultView: 'grid',
        quickGradeEnabled: true
      }
    }
    // Add other high school position groups as needed
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, teamLevel = 'COLLEGE' } = body;

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { users: { take: 1 } }
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Get user ID (use first user from team if available)
    const userId = team.users[0]?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'No users found for this team' },
        { status: 400 }
      );
    }

    // Get all position groups
    const positionGroups = await prisma.positionGroup.findMany({
      where: { isActive: true }
    });

    // Get default configurations for the team level
    const defaultConfigs = DEFAULT_CONFIGURATIONS[teamLevel as keyof typeof DEFAULT_CONFIGURATIONS] || DEFAULT_CONFIGURATIONS.COLLEGE;

    const createdConfigs = [];

    // Create configurations for each position group
    for (const positionGroup of positionGroups) {
      const configData = defaultConfigs[positionGroup.name as keyof typeof defaultConfigs];
      
      if (configData) {
        const config = await prisma.positionConfiguration.upsert({
          where: {
            positionGroupId_teamId: {
              positionGroupId: positionGroup.id,
              teamId: teamId
            }
          },
          update: {
            gradingFields: configData.gradingFields,
            metricFields: configData.metricFields,
            tags: configData.tags,
            settings: configData.settings,
            userId: userId,
            updatedAt: new Date()
          },
          create: {
            positionGroupId: positionGroup.id,
            teamId: teamId,
            userId: userId,
            gradingFields: configData.gradingFields,
            metricFields: configData.metricFields,
            tags: configData.tags,
            settings: configData.settings
          }
        });

        createdConfigs.push({
          positionGroup: positionGroup.name,
          configId: config.id
        });
      }
    }

    // Update team setup status
    await prisma.team.update({
      where: { id: teamId },
      data: {
        setupCompleted: true,
        setupCompletedAt: new Date(),
        setupStep: 'position_configurations_completed',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Initialized ${createdConfigs.length} position configurations for ${teamLevel} team`,
      configurations: createdConfigs,
      teamLevel: teamLevel
    });

  } catch (error) {
    console.error('Error initializing team setup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize team setup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
