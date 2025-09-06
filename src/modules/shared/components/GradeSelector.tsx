'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface GradeSelectorProps {
  value: number
  onChange: (grade: number) => void
  label?: string
  required?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const gradeOptions = [
  { value: -2, label: '-2', color: 'bg-red-500 hover:bg-red-600', textColor: 'text-white' },
  { value: -1, label: '-1', color: 'bg-orange-500 hover:bg-orange-600', textColor: 'text-white' },
  { value: 0, label: '0', color: 'bg-gray-500 hover:bg-gray-600', textColor: 'text-white' },
  { value: 1, label: '+1', color: 'bg-green-500 hover:bg-green-600', textColor: 'text-white' },
  { value: 2, label: '+2', color: 'bg-emerald-600 hover:bg-emerald-700', textColor: 'text-white' },
]

const sizeClasses = {
  sm: 'h-8 px-2 text-sm',
  md: 'h-10 px-3 text-base',
  lg: 'h-12 px-4 text-lg'
}

export function GradeSelector({ 
  value, 
  onChange, 
  label, 
  required = false, 
  className,
  size = 'md'
}: GradeSelectorProps) {
  const getGradeDescription = (grade: number): string => {
    switch (grade) {
      case -2: return 'Poor'
      case -1: return 'Below Average'
      case 0: return 'Average'
      case 1: return 'Above Average'
      case 2: return 'Excellent'
      default: return 'Not Graded'
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
          {required && <Badge variant="destructive" className="text-xs">Required</Badge>}
        </div>
      )}
      
      <div className="flex gap-1">
        {gradeOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? 'default' : 'outline'}
            className={cn(
              sizeClasses[size],
              'flex-1 transition-all duration-200',
              value === option.value 
                ? option.color + ' ' + option.textColor
                : 'hover:bg-gray-50'
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      
      {value !== undefined && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Current Grade: <span className="font-semibold">{value}</span>
          </span>
          <Badge 
            variant="secondary" 
            className={cn(
              'text-xs',
              value >= 1 ? 'bg-green-100 text-green-800' :
              value <= -1 ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            )}
          >
            {getGradeDescription(value)}
          </Badge>
        </div>
      )}
    </div>
  )
}

// Quick Grade Selector for rapid grading
interface QuickGradeSelectorProps {
  onGradeSelect: (grade: number) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function QuickGradeSelector({ onGradeSelect, size = 'md', className }: QuickGradeSelectorProps) {
  return (
    <div className={cn('flex gap-1', className)}>
      {gradeOptions.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="outline"
          size={size}
          className={cn(
            'flex-1 transition-all duration-200',
            option.color.replace('bg-', 'hover:bg-').replace('hover:bg-', 'hover:bg-'),
            option.textColor.replace('text-', 'hover:text-').replace('hover:text-', 'hover:text-')
          )}
          onClick={() => onGradeSelect(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
