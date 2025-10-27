import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Play, 
  Users, 
  Target, 
  TrendingUp, 
  Shield,
  Zap,
  Database
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-600 text-white p-3 rounded-full">
                <Play className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              ProGrade
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Professional football play analysis platform for coaches and analysts. 
              Grade plays, track tendencies, and generate actionable insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need for Football Analysis
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              From live game grading to comprehensive film study, ProGrade provides the tools 
              coaches need to make data-driven decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-700/50 border-slate-600 text-white">
              <CardHeader>
                <div className="bg-blue-600 p-3 rounded-lg w-fit mb-4">
                  <Play className="h-6 w-6" />
                </div>
                <CardTitle>Live Play Grading</CardTitle>
                <CardDescription className="text-slate-300">
                  Grade plays in real-time during games with our intuitive interface
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-700/50 border-slate-600 text-white">
              <CardHeader>
                <div className="bg-green-600 p-3 rounded-lg w-fit mb-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription className="text-slate-300">
                  Track tendencies, formation effectiveness, and situational success rates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-700/50 border-slate-600 text-white">
              <CardHeader>
                <div className="bg-purple-600 p-3 rounded-lg w-fit mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription className="text-slate-300">
                  Work together with your coaching staff in real-time
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-700/50 border-slate-600 text-white">
              <CardHeader>
                <div className="bg-orange-600 p-3 rounded-lg w-fit mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle>Formation Builder</CardTitle>
                <CardDescription className="text-slate-300">
                  Create and analyze custom formations with visual diagrams
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-700/50 border-slate-600 text-white">
              <CardHeader>
                <div className="bg-red-600 p-3 rounded-lg w-fit mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle>Tendency Analysis</CardTitle>
                <CardDescription className="text-slate-300">
                  AI-powered pattern recognition for opponent scouting
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-700/50 border-slate-600 text-white">
              <CardHeader>
                <div className="bg-indigo-600 p-3 rounded-lg w-fit mb-4">
                  <Database className="h-6 w-6" />
                </div>
                <CardTitle>Data Integration</CardTitle>
                <CardDescription className="text-slate-300">
                  Seamlessly integrate with NFL and NCAA official data
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">100+</div>
              <div className="text-slate-300">Teams Using ProGrade</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">50K+</div>
              <div className="text-slate-300">Plays Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">95%</div>
              <div className="text-slate-300">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">24/7</div>
              <div className="text-slate-300">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-slate-800/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Football Analysis?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Join hundreds of coaches who are already using ProGrade to gain a competitive edge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-400">
            <p>&copy; 2024 ProGrade. All rights reserved.</p>
            <div className="flex justify-center space-x-6 mt-4">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/support" className="hover:text-white">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
