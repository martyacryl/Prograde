'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GradeButtonProps {
  grade: number;
  onClick: () => void;
  isSelected?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  children?: React.ReactNode;
}

const GRADE_CONFIG = {
  '2': {
    label: '+2',
    colors: {
      default: 'bg-success-500 hover:bg-success-600 text-white border-success-500',
      outline: 'bg-success-50 text-success-700 border-success-300 hover:bg-success-100',
      ghost: 'text-success-700 hover:bg-success-50'
    },
    description: 'Excellent play'
  },
  '1': {
    label: '+1',
    colors: {
      default: 'bg-success-400 hover:bg-success-500 text-white border-success-400',
      outline: 'bg-success-50 text-success-600 border-success-200 hover:bg-success-100',
      ghost: 'text-success-600 hover:bg-success-50'
    },
    description: 'Good play'
  },
  '0': {
    label: '0',
    colors: {
      default: 'bg-warning-400 hover:bg-warning-500 text-white border-warning-400',
      outline: 'bg-warning-50 text-warning-700 border-warning-200 hover:bg-warning-100',
      ghost: 'text-warning-700 hover:bg-warning-50'
    },
    description: 'Neutral play'
  },
  '-1': {
    label: '-1',
    colors: {
      default: 'bg-destructive-400 hover:bg-destructive-500 text-white border-destructive-400',
      outline: 'bg-destructive-50 text-destructive-600 border-destructive-200 hover:bg-destructive-100',
      ghost: 'text-destructive-600 hover:bg-destructive-50'
    },
    description: 'Poor play'
  },
  '-2': {
    label: '-2',
    colors: {
      default: 'bg-destructive-500 hover:bg-destructive-600 text-white border-destructive-500',
      outline: 'bg-destructive-50 text-destructive-700 border-destructive-300 hover:bg-destructive-100',
      ghost: 'text-destructive-700 hover:bg-destructive-50'
    },
    description: 'Very poor play'
  }
};

const SIZE_CONFIG = {
  sm: 'h-10 w-10 text-sm font-semibold',
  md: 'h-12 w-12 text-base font-semibold',
  lg: 'h-16 w-16 text-lg font-bold',
  xl: 'h-20 w-20 text-xl font-bold'
};

export default function GradeButton({
  grade,
  onClick,
  isSelected = false,
  disabled = false,
  size = 'lg',
  variant = 'default',
  className,
  children
}: GradeButtonProps) {
  const config = GRADE_CONFIG[grade as keyof typeof GRADE_CONFIG];
  const sizeClasses = SIZE_CONFIG[size];
  
  if (!config) {
    console.warn(`Invalid grade: ${grade}. Must be -2, -1, 0, 1, or 2.`);
    return null;
  }

  const baseClasses = cn(
    'rounded-full border-2 font-mono transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2',
    'flex items-center justify-center cursor-pointer select-none',
    'shadow-md hover:shadow-lg active:scale-95',
    sizeClasses,
    config.colors[variant],
    isSelected && 'ring-2 ring-offset-2 ring-primary-500',
    disabled && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-md',
    className
  );

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      className={baseClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={`Grade ${config.label}: ${config.description}`}
      title={`${config.label} - ${config.description}`}
    >
      {children || config.label}
    </button>
  );
}

// Quick Grade Button Row Component
interface QuickGradeRowProps {
  onGradeSelect: (grade: number) => void;
  selectedGrade?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'outline' | 'ghost';
  showLabels?: boolean;
  className?: string;
}

export function QuickGradeRow({
  onGradeSelect,
  selectedGrade,
  disabled = false,
  size = 'lg',
  variant = 'default',
  showLabels = false,
  className
}: QuickGradeRowProps) {
  const grades = [2, 1, 0, -1, -2];

  return (
    <div className={cn('flex items-center justify-center space-x-4', className)}>
      {grades.map((grade) => (
        <div key={grade} className="flex flex-col items-center space-y-2">
          <GradeButton
            grade={grade}
            onClick={() => onGradeSelect(grade)}
            isSelected={selectedGrade === grade}
            disabled={disabled}
            size={size}
            variant={variant}
          />
          {showLabels && (
            <span className="text-xs font-medium text-gray-600 text-center">
              {GRADE_CONFIG[grade as keyof typeof GRADE_CONFIG]?.description}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// Compact Grade Row for Mobile/Small Screens
export function CompactGradeRow({
  onGradeSelect,
  selectedGrade,
  disabled = false,
  className
}: Omit<QuickGradeRowProps, 'size' | 'variant' | 'showLabels'>) {
  const grades = [2, 1, 0, -1, -2];

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      {grades.map((grade) => (
        <GradeButton
          key={grade}
          grade={grade}
          onClick={() => onGradeSelect(grade)}
          isSelected={selectedGrade === grade}
          disabled={disabled}
          size="md"
          variant="default"
        />
      ))}
    </div>
  );
}

// Touch-Optimized Grade Buttons for Sideline Use
export function TouchGradeButtons({
  onGradeSelect,
  selectedGrade,
  disabled = false,
  className
}: Omit<QuickGradeRowProps, 'size' | 'variant' | 'showLabels'>) {
  const grades = [2, 1, 0, -1, -2];

  return (
    <div className={cn('grid grid-cols-5 gap-3 w-full max-w-md mx-auto', className)}>
      {grades.map((grade) => (
        <GradeButton
          key={grade}
          grade={grade}
          onClick={() => onGradeSelect(grade)}
          isSelected={selectedGrade === grade}
          disabled={disabled}
          size="xl"
          variant="default"
          className="w-full h-auto aspect-square"
        />
      ))}
    </div>
  );
}
