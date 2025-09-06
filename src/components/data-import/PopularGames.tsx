'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Trophy, 
  Flame, 
  Users, 
  Clock, 
  Download,
  Play,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';

interface PopularGamesProps {
  onQuickImport: (gameIds: string[], category: string) => void;
  onGameSelect?: (gameId: string) => void;
}

interface QuickImportOption {
  id: string;
  title: string;
  description: string;
  gameIds: string[];
  estimatedTime: string;
  totalPlays: number;
  category: 'rivalry' | 'playoff' | 'championship' | 'featured';
  icon: React.ReactNode;
  color: string;
}

const QUICK_IMPORT_OPTIONS: QuickImportOption[] = [
  {
    id: 'rivalry-2023',
    title: 'Rivalry Games 2023',
    description: 'The biggest rivalry matchups with intense competition',
    gameIds: ['3146430', 'IRON_BOWL_2023', 'RED_RIVER_2023', 'ARMY_NAVY_2023'],
    estimatedTime: '5-8 minutes',
    totalPlays: 580,
    category: 'rivalry',
    icon: <Flame className="h-5 w-5" />,
    color: 'bg-red-500'
  },
  {
    id: 'cfp-2023',
    title: 'College Football Playoff 2023',
    description: 'All CFP games with championship-level play analysis',
    gameIds: ['CFP_SF1_2023', 'CFP_SF2_2023', 'CFP_FINAL_2023'],
    estimatedTime: '8-12 minutes',
    totalPlays: 450,
    category: 'playoff',
    icon: <Trophy className="h-5 w-5" />,
    color: 'bg-yellow-500'
  },
  {
    id: 'conference-champs-2023',
    title: 'Conference Championships 2023',
    description: 'SEC, Big Ten, Pac-12, and ACC title games',
    gameIds: ['SEC_CHAMP_2023', 'B1G_CHAMP_2023', 'PAC12_CHAMP_2023', 'ACC_CHAMP_2023'],
    estimatedTime: '6-10 minutes',
    totalPlays: 520,
    category: 'championship',
    icon: <Star className="h-5 w-5" />,
    color: 'bg-blue-500'
  },
  {
    id: 'top-25-showdowns',
    title: 'Top 25 Showdowns',
    description: 'Ranked vs ranked matchups throughout the season',
    gameIds: ['MICH_OSU_2023', 'BAMA_GA_2023', 'TEXAS_OU_2023', 'OREGON_WASH_2023'],
    estimatedTime: '7-11 minutes',
    totalPlays: 600,
    category: 'featured',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'bg-green-500'
  },
  {
    id: 'bowl-games-2023',
    title: 'Major Bowl Games 2023',
    description: 'Rose Bowl, Sugar Bowl, Orange Bowl, and more',
    gameIds: ['ROSE_BOWL_2023', 'SUGAR_BOWL_2023', 'ORANGE_BOWL_2023', 'COTTON_BOWL_2023'],
    estimatedTime: '9-14 minutes',
    totalPlays: 680,
    category: 'featured',
    icon: <Target className="h-5 w-5" />,
    color: 'bg-purple-500'
  },
  {
    id: 'week-13-rivalries',
    title: 'Week 13 Rivalries',
    description: 'Traditional rivalry week matchups',
    gameIds: ['MICH_OSU_2023', 'AUBURN_ALABAMA_2023', 'FLORIDA_FSU_2023', 'USC_UCLA_2023'],
    estimatedTime: '6-9 minutes',
    totalPlays: 540,
    category: 'rivalry',
    icon: <Zap className="h-5 w-5" />,
    color: 'bg-orange-500'
  }
];

const CATEGORY_COLORS = {
  rivalry: 'border-red-200 bg-red-50',
  playoff: 'border-yellow-200 bg-yellow-50',
  championship: 'border-blue-200 bg-blue-50',
  featured: 'border-green-200 bg-green-50'
};

const CATEGORY_LABELS = {
  rivalry: 'Rivalry',
  playoff: 'Playoff',
  championship: 'Championship',
  featured: 'Featured'
};

export default function PopularGames({ onQuickImport, onGameSelect }: PopularGamesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [importing, setImporting] = useState<string | null>(null);

  const handleQuickImport = async (option: QuickImportOption) => {
    setImporting(option.id);
    
    try {
      // Simulate import delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onQuickImport(option.gameIds, option.category);
      
      // Show success feedback
      console.log(`Successfully imported ${option.title}`);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setImporting(null);
    }
  };

  const filteredOptions = selectedCategory === 'all' 
    ? QUICK_IMPORT_OPTIONS 
    : QUICK_IMPORT_OPTIONS.filter(option => option.category === selectedCategory);

  const getCategoryStats = () => {
    const stats = {
      total: QUICK_IMPORT_OPTIONS.length,
      rivalry: QUICK_IMPORT_OPTIONS.filter(o => o.category === 'rivalry').length,
      playoff: QUICK_IMPORT_OPTIONS.filter(o => o.category === 'playoff').length,
      championship: QUICK_IMPORT_OPTIONS.filter(o => o.category === 'championship').length,
      featured: QUICK_IMPORT_OPTIONS.filter(o => o.category === 'featured').length
    };
    return stats;
  };

  const stats = getCategoryStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Quick Import Options</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get started quickly with pre-curated game collections. These popular matchups are perfect 
          for testing your grading system and analyzing high-level competition.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All ({stats.total})
          </Button>
          <Button
            variant={selectedCategory === 'rivalry' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('rivalry')}
          >
            Rivalries ({stats.rivalry})
          </Button>
          <Button
            variant={selectedCategory === 'playoff' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('playoff')}
          >
            Playoffs ({stats.playoff})
          </Button>
          <Button
            variant={selectedCategory === 'championship' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('championship')}
          >
            Championships ({stats.championship})
          </Button>
          <Button
            variant={selectedCategory === 'featured' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('featured')}
          >
            Featured ({stats.featured})
          </Button>
        </div>
      </div>

      {/* Quick Import Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOptions.map((option) => (
          <Card 
            key={option.id} 
            className={`transition-all hover:shadow-lg cursor-pointer ${
              CATEGORY_COLORS[option.category]
            }`}
            onClick={() => onGameSelect && onGameSelect(option.gameIds[0])}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${option.color} text-white`}>
                    {option.icon}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {CATEGORY_LABELS[option.category]}
                  </Badge>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {option.totalPlays} plays
                </div>
              </div>
              <CardTitle className="text-lg">{option.title}</CardTitle>
              <CardDescription className="text-sm">
                {option.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Game IDs Preview */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Games included:</div>
                  <div className="flex flex-wrap gap-1">
                    {option.gameIds.slice(0, 3).map((gameId, index) => (
                      <Badge key={gameId} variant="secondary" className="text-xs">
                        {gameId}
                      </Badge>
                    ))}
                    {option.gameIds.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{option.gameIds.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-background/50 rounded">
                    <div className="font-medium text-primary">{option.totalPlays}</div>
                    <div className="text-xs text-muted-foreground">Total Plays</div>
                  </div>
                  <div className="text-center p-2 bg-background/50 rounded">
                    <div className="font-medium text-primary">{option.estimatedTime}</div>
                    <div className="text-xs text-muted-foreground">Import Time</div>
                  </div>
                </div>

                {/* Import Button */}
                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickImport(option);
                  }}
                  disabled={importing === option.id}
                >
                  {importing === option.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Quick Import
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Import Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Import Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {QUICK_IMPORT_OPTIONS.reduce((sum, option) => sum + option.totalPlays, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Plays Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {QUICK_IMPORT_OPTIONS.length}
              </div>
              <div className="text-sm text-muted-foreground">Game Collections</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {QUICK_IMPORT_OPTIONS.reduce((sum, option) => sum + option.gameIds.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Individual Games</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                ~45-75 min
              </div>
              <div className="text-sm text-muted-foreground">Total Import Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Target className="h-5 w-5" />
            Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div className="space-y-2">
              <div className="font-medium">Start with Rivalry Games</div>
              <p>These high-stakes matchups provide excellent examples of competitive play and are perfect for testing your grading system.</p>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Use Playoff Games for Analysis</div>
              <p>Championship-level games offer the highest quality plays and are ideal for advanced position module testing.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
