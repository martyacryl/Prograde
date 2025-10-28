'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, EyeOff, Mail, Lock, User, UserPlus, ArrowLeft, ArrowRight, Shield } from 'lucide-react'
import Link from 'next/link'

export function SignupForm() {
  const router = useRouter()
  const { signup, isLoading, error } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    teamName: '',
    teamAbbreviation: '',
    teamLevel: '',
    teamConference: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (currentStep === 1) {
      if (formData.password !== formData.confirmPassword) {
        return
      }
      setCurrentStep(2)
      return
    }
    
    if (currentStep === 2) {
      const success = await signup(
        formData.name, 
        formData.email, 
        formData.password,
        {
          name: formData.teamName,
          abbreviation: formData.teamAbbreviation,
          level: formData.teamLevel,
          conference: formData.teamConference
        }
      )
      if (success) {
        router.push('/dashboard')
      }
    }
  }

  const passwordsMatch = formData.password === formData.confirmPassword
  const isStep1Valid = formData.name && formData.email && formData.password && passwordsMatch
  const isStep2Valid = formData.teamName && formData.teamAbbreviation && formData.teamLevel

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {currentStep === 1 ? 'Create Account' : 'Team Information'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 ? 'Get started with ProGrade today' : 'Tell us about your team'}
          </CardDescription>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              <div className={`w-8 h-2 rounded ${currentStep >= 1 ? 'bg-primary' : 'bg-gray-300'}`} />
              <div className={`w-8 h-2 rounded ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: User Information */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {!passwordsMatch && formData.confirmPassword && (
                    <p className="text-sm text-destructive">Passwords do not match</p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Team Information */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="teamName"
                      type="text"
                      placeholder="e.g., Michigan Wolverines"
                      value={formData.teamName}
                      onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamAbbreviation">Team Abbreviation</Label>
                  <Input
                    id="teamAbbreviation"
                    type="text"
                    placeholder="e.g., MICH"
                    value={formData.teamAbbreviation}
                    onChange={(e) => setFormData({ ...formData, teamAbbreviation: e.target.value.toUpperCase() })}
                    disabled={isLoading}
                    required
                    maxLength={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamLevel">Team Level</Label>
                  <Select
                    value={formData.teamLevel}
                    onValueChange={(value) => setFormData({ ...formData, teamLevel: value })}
                    disabled={isLoading}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COLLEGE">College</SelectItem>
                      <SelectItem value="NFL">NFL</SelectItem>
                      <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamConference">Conference (Optional)</Label>
                  <Input
                    id="teamConference"
                    type="text"
                    placeholder="e.g., Big Ten"
                    value={formData.teamConference}
                    onChange={(e) => setFormData({ ...formData, teamConference: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {currentStep === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              
              <Button 
                type="submit" 
                className={currentStep === 2 ? "flex-1" : "w-full"} 
                disabled={isLoading || (currentStep === 1 ? !isStep1Valid : !isStep2Valid)}
              >
                {isLoading ? (
                  'Creating account...'
                ) : currentStep === 1 ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
