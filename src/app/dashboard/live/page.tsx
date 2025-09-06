'use client'

import { useState } from 'react'
import { PlayInputForm } from '@/components/forms/PlayInputForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft,
  Plus,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { mockGames, mockPlays } from '@/data/mockData'

export default function LiveGradingPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [isGrading, setIsGrading] = useState(false)
  const [currentPlay, setCurrentPlay] = useState<any>(null)

  const handleStartGrading = (gameId: string) => {
    setSelectedGame(gameId)
    setIsGrading(true)
  }

  const handlePlaySubmit = (data: any) => {
    console.log('Play submitted:', data)
    // Here you would save the play grade to the database
    // For now, we'll just log it
  }

  const handleCancelGrading = () => {
    setIsGrading(false)
    setSelectedGame(null)
    setCurrentPlay(null)
  }

  if (isGrading && selectedGame) {
    const game = mockGames.find(g => g.id === selectedGame)
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/live">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Live Grading</h1>
            <p className="text-slate-600">
              Ohio State vs Michigan - {game?.date?.toLocaleDateString()}
            </p>
          </div>
        </div>

        <PlayInputForm
          gameId={selectedGame}
          mode="live"
          onSubmit={handlePlaySubmit}
          onCancel={handleCancelGrading}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Live Grading</h1>
          <p className="text-slate-600">Grade plays in real-time during live games</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Schedule New Game
        </Button>
      </div>

      {/* Active Games */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Play className="h-5 w-5 mr-2" />
            Active Games
          </CardTitle>
          <CardDescription>Select a game to start live grading</CardDescription>
        </CardHeader>
        <CardContent>
          {mockGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockGames.map((game) => (
                <Card key={game.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {game.homeAway}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        Week {game.week}
                      </span>
                    </div>
                    
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-lg mb-1">
                        Ohio State
                      </h3>
                      <p className="text-slate-600 text-sm">vs</p>
                      <h3 className="font-semibold text-lg mt-1">
                        Michigan
                      </h3>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Date:</span>
                        <span>{game.date?.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Score:</span>
                        <span className="font-medium">
                          {game.score ? '24-17' : 'TBD'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Quarter:</span>
                        <span>4</span>
                      </div>
                    </div>

                    <Link href={`/games/${game.id}`}>
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        <Play className="h-4 w-4 mr-2" />
                        Grade This Game
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Play className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Games</h3>
              <p className="text-slate-600 mb-4">
                You don't have any active games scheduled for live grading.
              </p>
              <Link href="/dashboard/data-import">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Import Your First Game
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Today</CardTitle>
            <Calendar className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGames.length}</div>
            <p className="text-xs text-slate-600">
              {mockGames.length > 0 ? 'Active games available' : 'No games scheduled'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plays Graded Today</CardTitle>
            <Play className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-slate-600">Start grading to see progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Graders</CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-slate-600">No active grading sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Grading Activity</CardTitle>
          <CardDescription>Your latest play grading sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Play className="h-8 w-8 mx-auto mb-2" />
            <p>No recent grading activity</p>
            <p className="text-sm">Start grading plays to see your activity here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
