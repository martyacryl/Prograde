'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GradeSelector } from '@/modules/shared/components/GradeSelector'
import { olFormDataSchema, type OLFormData } from '../validations'
import { Shield, X, Plus, Save, RotateCcw } from 'lucide-react'

interface OLGradingFormProps {
  onSubmit: (data: OLFormData) => void
  onCancel?: () => void
  initialData?: Partial<OLFormData>
  playId: string
  teamId: string
  userId: string
}

const defaultTags = [
  'Dominant Block',
  'Pressure Allowed', 
  'Missed Assignment',
  'Great Communication',
  'Penalty',
  'Pancake Block',
  'Bad Snap',
  'Late Hands'
]

const positions = ['LT', 'LG', 'C', 'RG', 'RT']

export function OLGradingForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  playId, 
  teamId, 
  userId 
}: OLGradingFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.grading?.tags || [])
  const [customTag, setCustomTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm<OLFormData>({
    resolver: zodResolver(olFormDataSchema),
    defaultValues: {
      playId,
      teamId,
      userId,
      timestamp: new Date(),
      playerNumber: initialData?.playerNumber || '',
      position: initialData?.position || 'LT',
      grading: {
        passProtection: 0,
        runBlocking: 0,
        technique: 0,
        communication: 0,
        pressuresAllowed: 0,
        knockdownBlocks: 0,
        blitzPickup: false,
        stuntHandling: false,
        doubleTeam: false,
        chipBlock: false,
        notes: '',
        tags: selectedTags
      }
    }
  })

  const watchedGrading = watch('grading')

  const handleGradeChange = (field: keyof OLFormData['grading'], value: number) => {
    setValue(`grading.${field}`, value)
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
    setValue('grading.tags', selectedTags)
  }

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      const newTags = [...selectedTags, customTag.trim()]
      setSelectedTags(newTags)
      setValue('grading.tags', newTags)
      setCustomTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove)
    setSelectedTags(newTags)
    setValue('grading.tags', newTags)
  }

  const handleFormSubmit = async (data: OLFormData) => {
    setIsSubmitting(true)
    try {
      // Update tags before submission
      const formDataWithTags = {
        ...data,
        grading: {
          ...data.grading,
          tags: selectedTags
        }
      }
      await onSubmit(formDataWithTags)
      reset()
      setSelectedTags([])
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    reset()
    setSelectedTags([])
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Offensive Line Grading
          </CardTitle>
          <CardDescription>
            Grade the offensive line performance for this play
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Player Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="playerNumber">Player Number *</Label>
              <Input
                id="playerNumber"
                placeholder="e.g., 74"
                {...register('playerNumber')}
                className={errors.playerNumber ? 'border-red-500' : ''}
              />
              {errors.playerNumber && (
                <p className="text-sm text-red-500">{errors.playerNumber.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Select 
                value={watch('position')} 
                onValueChange={(value) => setValue('position', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grading Fields */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Grades</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GradeSelector
                label="Pass Protection"
                value={watchedGrading.passProtection}
                onChange={(value) => handleGradeChange('passProtection', value)}
                required
              />
              
              <GradeSelector
                label="Run Blocking"
                value={watchedGrading.runBlocking}
                onChange={(value) => handleGradeChange('runBlocking', value)}
                required
              />
              
              <GradeSelector
                label="Technique"
                value={watchedGrading.technique}
                onChange={(value) => handleGradeChange('technique', value)}
                required
              />
              
              <GradeSelector
                label="Communication"
                value={watchedGrading.communication}
                onChange={(value) => handleGradeChange('communication', value)}
              />
            </div>
          </div>

          {/* Metric Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Metrics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pressuresAllowed">Pressures Allowed</Label>
                <Input
                  id="pressuresAllowed"
                  type="number"
                  min="0"
                  max="10"
                  placeholder="0"
                  {...register('grading.pressuresAllowed', { valueAsNumber: true })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="knockdownBlocks">Knockdown Blocks</Label>
                <Input
                  id="knockdownBlocks"
                  type="number"
                  min="0"
                  max="10"
                  placeholder="0"
                  {...register('grading.knockdownBlocks', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Boolean Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Key Actions</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="blitzPickup"
                  checked={watchedGrading.blitzPickup}
                  onCheckedChange={(checked) => 
                    setValue('grading.blitzPickup', checked as boolean)
                  }
                />
                <Label htmlFor="blitzPickup">Blitz Pickup</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stuntHandling"
                  checked={watchedGrading.stuntHandling}
                  onCheckedChange={(checked) => 
                    setValue('grading.stuntHandling', checked as boolean)
                  }
                />
                <Label htmlFor="stuntHandling">Stunt Handling</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="doubleTeam"
                  checked={watchedGrading.doubleTeam}
                  onCheckedChange={(checked) => 
                    setValue('grading.doubleTeam', checked as boolean)
                  }
                />
                <Label htmlFor="doubleTeam">Double Team</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="chipBlock"
                  checked={watchedGrading.chipBlock}
                  onCheckedChange={(checked) => 
                    setValue('grading.chipBlock', checked as boolean)
                  }
                />
                <Label htmlFor="chipBlock">Chip Block</Label>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {defaultTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      selectedTags.includes(tag) 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom tag..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomTag}
                  disabled={!customTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {selectedTags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-blue-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional observations or context..."
              rows={3}
              {...register('grading.notes')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="min-w-[100px]"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Grade
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
