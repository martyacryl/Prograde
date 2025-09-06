import { NextRequest, NextResponse } from 'next/server';

interface NCAATeam {
  id: string;
  name: string;
  fullName: string;
  conference: string;
  division: string;
  logo?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  ranking?: number;
  record?: string;
  recentGames?: string[];
  location?: {
    city: string;
    state: string;
  };
  mascot?: string;
  established?: number;
}

// Mock team data for development/testing
const MOCK_TEAMS: NCAATeam[] = [
  {
    id: 'michigan',
    name: 'Michigan',
    fullName: 'University of Michigan',
    conference: 'Big Ten',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#00274C', secondary: '#FFCB05' },
    ranking: 1,
    record: '13-1',
    recentGames: ['Ohio State', 'Iowa', 'Penn State'],
    location: { city: 'Ann Arbor', state: 'MI' },
    mascot: 'Wolverines',
    established: 1817
  },
  {
    id: 'ohio-state',
    name: 'Ohio State',
    fullName: 'The Ohio State University',
    conference: 'Big Ten',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#BB0000', secondary: '#666666' },
    ranking: 2,
    record: '11-2',
    recentGames: ['Michigan', 'Penn State', 'Wisconsin'],
    location: { city: 'Columbus', state: 'OH' },
    mascot: 'Buckeyes',
    established: 1870
  },
  {
    id: 'alabama',
    name: 'Alabama',
    fullName: 'University of Alabama',
    conference: 'SEC',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#9E1B32', secondary: '#FFFFFF' },
    ranking: 3,
    record: '12-2',
    recentGames: ['Georgia', 'Auburn', 'LSU'],
    location: { city: 'Tuscaloosa', state: 'AL' },
    mascot: 'Crimson Tide',
    established: 1820
  },
  {
    id: 'georgia',
    name: 'Georgia',
    fullName: 'University of Georgia',
    conference: 'SEC',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#BA0C2F', secondary: '#000000' },
    ranking: 4,
    record: '13-1',
    recentGames: ['Alabama', 'Florida', 'Tennessee'],
    location: { city: 'Athens', state: 'GA' },
    mascot: 'Bulldogs',
    established: 1785
  },
  {
    id: 'texas',
    name: 'Texas',
    fullName: 'University of Texas at Austin',
    conference: 'Big 12',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#BF5700', secondary: '#FFFFFF' },
    ranking: 5,
    record: '12-2',
    recentGames: ['Oklahoma', 'TCU', 'Baylor'],
    location: { city: 'Austin', state: 'TX' },
    mascot: 'Longhorns',
    established: 1883
  },
  {
    id: 'oregon',
    name: 'Oregon',
    fullName: 'University of Oregon',
    conference: 'Pac-12',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#154733', secondary: '#FEE11A' },
    ranking: 6,
    record: '12-2',
    recentGames: ['Washington', 'USC', 'Stanford'],
    location: { city: 'Eugene', state: 'OR' },
    mascot: 'Ducks',
    established: 1876
  },
  {
    id: 'florida-state',
    name: 'Florida State',
    fullName: 'Florida State University',
    conference: 'ACC',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#782F40', secondary: '#CEB888' },
    ranking: 7,
    record: '13-1',
    recentGames: ['Florida', 'Louisville', 'Miami'],
    location: { city: 'Tallahassee', state: 'FL' },
    mascot: 'Seminoles',
    established: 1851
  },
  {
    id: 'washington',
    name: 'Washington',
    fullName: 'University of Washington',
    conference: 'Pac-12',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#4B2E83', secondary: '#B7A57A' },
    ranking: 8,
    record: '11-2',
    recentGames: ['Oregon', 'USC', 'Stanford'],
    location: { city: 'Seattle', state: 'WA' },
    mascot: 'Huskies',
    established: 1861
  },
  {
    id: 'penn-state',
    name: 'Penn State',
    fullName: 'The Pennsylvania State University',
    conference: 'Big Ten',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#041E42', secondary: '#FFFFFF' },
    ranking: 9,
    record: '10-3',
    recentGames: ['Michigan', 'Ohio State', 'Iowa'],
    location: { city: 'University Park', state: 'PA' },
    mascot: 'Nittany Lions',
    established: 1855
  },
  {
    id: 'ole-miss',
    name: 'Ole Miss',
    fullName: 'University of Mississippi',
    conference: 'SEC',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#002147', secondary: '#FFFFFF' },
    ranking: 10,
    record: '11-2',
    recentGames: ['Alabama', 'LSU', 'Auburn'],
    location: { city: 'Oxford', state: 'MS' },
    mascot: 'Rebels',
    established: 1848
  },
  {
    id: 'missouri',
    name: 'Missouri',
    fullName: 'University of Missouri',
    conference: 'SEC',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#F1B82D', secondary: '#000000' },
    ranking: 11,
    record: '11-2',
    recentGames: ['Arkansas', 'Tennessee', 'Kentucky'],
    location: { city: 'Columbia', state: 'MO' },
    mascot: 'Tigers',
    established: 1839
  },
  {
    id: 'oklahoma',
    name: 'Oklahoma',
    fullName: 'University of Oklahoma',
    conference: 'Big 12',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#841617', secondary: '#FFFFFF' },
    ranking: 12,
    record: '10-3',
    recentGames: ['Texas', 'TCU', 'Baylor'],
    location: { city: 'Norman', state: 'OK' },
    mascot: 'Sooners',
    established: 1890
  },
  {
    id: 'lsu',
    name: 'LSU',
    fullName: 'Louisiana State University',
    conference: 'SEC',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#FDBB30', secondary: '#461D7C' },
    ranking: 13,
    record: '10-3',
    recentGames: ['Alabama', 'Auburn', 'Arkansas'],
    location: { city: 'Baton Rouge', state: 'LA' },
    mascot: 'Tigers',
    established: 1860
  },
  {
    id: 'arizona',
    name: 'Arizona',
    fullName: 'University of Arizona',
    conference: 'Pac-12',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#002D62', secondary: '#CC0033' },
    ranking: 14,
    record: '10-3',
    recentGames: ['Arizona State', 'USC', 'UCLA'],
    location: { city: 'Tucson', state: 'AZ' },
    mascot: 'Wildcats',
    established: 1885
  },
  {
    id: 'notre-dame',
    name: 'Notre Dame',
    fullName: 'University of Notre Dame',
    conference: 'Independent',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#0C2340', secondary: '#C99700' },
    ranking: 15,
    record: '9-4',
    recentGames: ['USC', 'Stanford', 'Navy'],
    location: { city: 'Notre Dame', state: 'IN' },
    mascot: 'Fighting Irish',
    established: 1842
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const conference = searchParams.get('conference');
    const division = searchParams.get('division');
    const rankedOnly = searchParams.get('rankedOnly') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    // Filter teams based on search criteria
    let filteredTeams = MOCK_TEAMS.filter(team => {
      // Text search
      if (query) {
        const searchLower = query.toLowerCase();
        const matchesName = team.name.toLowerCase().includes(searchLower) ||
                           team.fullName.toLowerCase().includes(searchLower) ||
                           team.mascot?.toLowerCase().includes(searchLower) ||
                           team.location?.city.toLowerCase().includes(searchLower) ||
                           team.location?.state.toLowerCase().includes(searchLower);
        
        if (!matchesName) return false;
      }
      
      // Conference filter
      if (conference && team.conference !== conference) return false;
      
      // Division filter
      if (division && team.division !== division) return false;
      
      // Ranking filter
      if (rankedOnly && !team.ranking) return false;
      
      return true;
    });

    // Sort by ranking first, then by name
    filteredTeams.sort((a, b) => {
      if (a.ranking && b.ranking) {
        return a.ranking - b.ranking;
      }
      if (a.ranking && !b.ranking) return -1;
      if (!a.ranking && b.ranking) return 1;
      return a.name.localeCompare(b.name);
    });

    // Apply limit
    filteredTeams = filteredTeams.slice(0, limit);

    // Get conference statistics
    const conferenceStats = MOCK_TEAMS.reduce((acc, team) => {
      acc[team.conference] = (acc[team.conference] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get division statistics
    const divisionStats = MOCK_TEAMS.reduce((acc, team) => {
      acc[team.division] = (acc[team.division] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      teams: filteredTeams,
      total: filteredTeams.length,
      totalAvailable: MOCK_TEAMS.length,
      filters: {
        query,
        conference,
        division,
        rankedOnly,
        limit
      },
      statistics: {
        conferences: conferenceStats,
        divisions: divisionStats,
        rankedTeams: MOCK_TEAMS.filter(t => t.ranking).length,
        totalRanked: 25
      }
    });

  } catch (error) {
    console.error('Error searching NCAA teams:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search teams',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamIds, action = 'get' } = body;

    if (!teamIds || !Array.isArray(teamIds)) {
      return NextResponse.json(
        { error: 'Team IDs array is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'get':
        // Get detailed information for specific teams
        const teams = MOCK_TEAMS.filter(team => teamIds.includes(team.id));
        return NextResponse.json({
          success: true,
          teams,
          total: teams.length
        });

      case 'recent-games':
        // Get recent games for specific teams
        const teamsWithGames = MOCK_TEAMS.filter(team => teamIds.includes(team.id))
          .map(team => ({
            id: team.id,
            name: team.name,
            recentGames: team.recentGames || []
          }));
        
        return NextResponse.json({
          success: true,
          teams: teamsWithGames
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing team request:', error);
    return NextResponse.json(
      { error: 'Failed to process team request' },
      { status: 500 }
    );
  }
}
