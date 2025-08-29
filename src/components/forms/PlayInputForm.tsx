'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { playInputFormSchema, PlayInputFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Clock, 
  MapPin, 
  Target, 
  Star,
  Plus,
  X
} from 'lucide-react'
import { mockFormations, mockPersonnelPackages, mockBlitzTypes, mockCoverages, mockTags } from '@/data/mockData'

interface PlayInputFormProps {
  gameId: string
  playId?: string
  mode: 'live' | 'film'
  onSubmit: (data: PlayInputFormData) => void
  onCancel: () => void
}

export function PlayInputForm({ gameId, playId, mode, onSubmit, onCancel }: PlayInputFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<PlayInputFormData>({
    resolver: zodResolver(playInputFormSchema),
    defaultValues: {
      gameId,
      playId: playId || '',
      userId: 'user-1', // This would come from auth context
      teamId: 'team-1', // This would come from user's team
      execution: undefined,
      technique: undefined,
      assignment: undefined,
      impact: undefined,
      tags: [],
      notes: ''
    }
  })

  const watchedValues = watch()

  const handleGradeChange = (field: 'execution' | 'technique' | 'assignment' | 'impact', value: number) => {
    setValue(field, value)
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
    setValue('tags', selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    )
  }

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      const newTags = [...selectedTags, customTag.trim()]
      setSelectedTags(newTags)
      setValue('tags', newTags)
      setCustomTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove)
    setSelectedTags(newTags)
    setValue('tags', newTags)
  }

  const onFormSubmit = (data: PlayInputFormData) => {
    data.tags = selectedTags
    onSubmit(data)
    reset()
    setSelectedTags([])
  }

  const GradeButton = ({ field, value, label }: { field: 'execution' | 'technique' | 'assignment' | 'impact', value: number, label: string }) => (
    <Button
      type="button"
      variant={watchedValues[field] === value ? "default" : "outline"}
      size="sm"
      onClick={() => handleGradeChange(field, value)}
      className="w-12 h-12 text-sm font-bold"
    >
      {value}
    </Button>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'live' ? 'Live Play Grading' : 'Film Study Grading'}
          </h1>
          <p className="text-slate-600">
            {mode === 'live' ? 'Grade plays in real-time during the game' : 'Analyze plays from film study'}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="play-form"
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? 'Saving...' : 'Save Play'}
          </Button>
        </div>
      </div>

      <form id="play-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Play Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Play Information
            </CardTitle>
            <CardDescription>Basic details about the play</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="quarter">Quarter</Label>
              <Select onValueChange={(value) => setValue('quarter', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(q => (
                    <SelectItem key={q} value={q.toString()}>{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                {...register('time')}
                placeholder="12:34"
                className="font-mono"
              />
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
            </div>

            <div>
              <Label htmlFor="down">Down</Label>
              <Select onValueChange={(value) => setValue('down', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select down" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(d => (
                    <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="distance">Distance</Label>
              <Input
                {...register('distance')}
                type="number"
                placeholder="10"
                min="1"
              />
              {errors.distance && <p className="text-red-500 text-sm mt-1">{errors.distance.message}</p>}
            </div>

            <div>
              <Label htmlFor="yardLine">Yard Line</Label>
              <Input
                {...register('yardLine')}
                type="number"
                placeholder="25"
                min="0"
                max="100"
              />
              {errors.yardLine && <p className="text-red-500 text-sm mt-1">{errors.yardLine.message}</p>}
            </div>

            <div>
              <Label htmlFor="playType">Play Type</Label>
              <Select onValueChange={(value) => setValue('playType', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select play type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUSH">Rush</SelectItem>
                  <SelectItem value="PASS">Pass</SelectItem>
                  <SelectItem value="PUNT">Punt</SelectItem>
                  <SelectItem value="FIELD_GOAL">Field Goal</SelectItem>
                  <SelectItem value="KICKOFF">Kickoff</SelectItem>
                  <SelectItem value="EXTRA_POINT">Extra Point</SelectItem>
                  <SelectItem value="SAFETY">Safety</SelectItem>
                  <SelectItem value="PENALTY">Penalty</SelectItem>
                  <SelectItem value="TIMEOUT">Timeout</SelectItem>
                  <SelectItem value="CHALLENGE">Challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="formation">Formation</Label>
              <Select onValueChange={(value) => setValue('formation', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select formation" />
                </SelectTrigger>
                <SelectContent>
                  {mockFormations.map(formation => (
                    <SelectItem key={formation.id} value={formation.name || ''}>
                      {formation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="personnel">Personnel</Label>
              <Select onValueChange={(value) => setValue('personnel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select personnel" />
                </SelectTrigger>
                <SelectContent>
                  {mockPersonnelPackages.map(pkg => (
                    <SelectItem key={pkg} value={pkg}>
                      {pkg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Grading Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Play Grading
            </CardTitle>
            <CardDescription>Rate the execution, technique, assignment, and impact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { field: 'execution', label: 'Execution', description: 'Overall execution of the play' },
              { field: 'technique', label: 'Technique', description: 'Individual technique and fundamentals' },
              { field: 'assignment', label: 'Assignment', description: 'Correctness of assignments' },
              { field: 'impact', label: 'Impact', description: 'Impact on the game situation' }
            ].map(({ field, label, description }) => (
              <div key={field} className="space-y-3">
                <div>
                  <Label className="text-base font-medium">{label}</Label>
                  <p className="text-sm text-slate-600">{description}</p>
                </div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(value => (
                    <GradeButton
                      key={value}
                      field={field as 'execution' | 'technique' | 'assignment' | 'impact'}
                      value={value}
                      label={value.toString()}
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Analysis Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Analysis & Notes
            </CardTitle>
            <CardDescription>Additional analysis and situational context</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blitzType">Blitz Type</Label>
                <Select onValueChange={(value) => setValue('blitzType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blitz type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBlitzTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="coverage">Coverage</Label>
                <Select onValueChange={(value) => setValue('coverage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select coverage" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCoverages.map(coverage => (
                      <SelectItem key={coverage} value={coverage}>
                        {coverage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                {...register('notes')}
                placeholder="Add any additional notes about the play..."
                rows={3}
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Add custom tag"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addCustomTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {mockTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-slate-100"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
