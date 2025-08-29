import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Welcome back, Coach Smith. Here's what's happening with your team.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Game
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Play className="h-4 w-4 mr-2" />
            Start Grading
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays Graded</CardTitle>
            <Play className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-slate-600 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-600" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games This Season</CardTitle>
            <Calendar className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-slate-600 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-600" />
              +2 from last season
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-slate-600 flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1 text-red-600" />
              -1 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.2%</div>
            <p className="text-xs text-slate-600 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-600" />
              +3.1% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Games */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
            <CardDescription>Your team's latest performance data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { opponent: 'Michigan', date: 'Nov 30', score: '24-17', status: 'W' },
                { opponent: 'Penn State', date: 'Nov 23', score: '31-28', status: 'W' },
                { opponent: 'Wisconsin', date: 'Nov 16', score: '17-24', status: 'L' },
                { opponent: 'Iowa', date: 'Nov 9', score: '28-14', status: 'W' }
              ].map((game, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={game.status === 'W' ? 'default' : 'destructive'}>
                      {game.status}
                    </Badge>
                    <div>
                      <p className="font-medium">vs {game.opponent}</p>
                      <p className="text-sm text-slate-600">{game.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{game.score}</p>
                    <Link href={`/dashboard/games/${index}`} className="text-sm text-red-600 hover:underline">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Play className="h-4 w-4 mr-2" />
              Grade New Play
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analyze Tendencies
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Key metrics and trends for your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">73%</div>
              <p className="text-sm text-slate-600">3rd Down Conversion</p>
              <p className="text-xs text-green-600">+5% from last month</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">4.8</div>
              <p className="text-sm text-slate-600">Yards per Rush</p>
              <p className="text-xs text-blue-600">+0.3 from last month</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">62%</div>
              <p className="text-sm text-slate-600">Red Zone TD Rate</p>
              <p className="text-xs text-red-600">-2% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
