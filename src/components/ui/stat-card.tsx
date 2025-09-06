'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeValue?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  loading?: boolean;
}

const VARIANT_CONFIG = {
  default: {
    bg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600'
  },
  success: {
    bg: 'bg-white',
    border: 'border-green-200',
    text: 'text-gray-900',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  warning: {
    bg: 'bg-white',
    border: 'border-yellow-200',
    text: 'text-gray-900',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  },
  destructive: {
    bg: 'bg-white',
    border: 'border-red-200',
    text: 'text-gray-900',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600'
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-200',
    text: 'text-gray-900',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  }
};

const SIZE_CONFIG = {
  sm: {
    padding: 'p-4',
    titleSize: 'text-sm',
    valueSize: 'text-2xl',
    iconSize: 'w-8 h-8',
    iconContainerSize: 'w-10 h-10'
  },
  md: {
    padding: 'p-6',
    titleSize: 'text-sm',
    valueSize: 'text-3xl',
    iconSize: 'w-6 h-6',
    iconContainerSize: 'w-12 h-12'
  },
  lg: {
    padding: 'p-8',
    titleSize: 'text-base',
    valueSize: 'text-4xl',
    iconSize: 'w-8 h-8',
    iconContainerSize: 'w-16 h-16'
  }
};

export default function StatCard({
  title,
  value,
  change,
  changeValue,
  trend,
  icon,
  description,
  variant = 'default',
  size = 'md',
  className,
  onClick,
  loading = false
}: StatCardProps) {
  const variantConfig = VARIANT_CONFIG[variant];
  const sizeConfig = SIZE_CONFIG[size];

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-success-600" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-destructive-600" />;
      case 'neutral':
        return <MinusIcon className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600';
    
    switch (trend) {
      case 'up':
        return 'text-success-600';
      case 'down':
        return 'text-destructive-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeText = () => {
    if (change) return change;
    if (changeValue !== undefined) {
      const prefix = changeValue > 0 ? '+' : '';
      return `${prefix}${changeValue}`;
    }
    return null;
  };

  return (
    <div
      className={cn(
        'bg-white border rounded-xl shadow-soft hover:shadow-medium transition-all duration-200',
        variantConfig.bg,
        variantConfig.border,
        sizeConfig.padding,
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-medium text-gray-600 mb-2',
            sizeConfig.titleSize
          )}>
            {title}
          </p>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
            </div>
          ) : (
            <p className={cn(
              'font-bold text-gray-900 mb-2',
              sizeConfig.valueSize
            )}>
              {value}
            </p>
          )}
          
          {description && (
            <p className="text-sm text-gray-500 mb-3">{description}</p>
          )}
          
          {(change || changeValue !== undefined) && (
            <div className="flex items-center space-x-2">
              {getTrendIcon()}
              <span className={cn(
                'text-sm font-medium',
                getTrendColor()
              )}>
                {getChangeText()}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={cn(
            'rounded-xl flex items-center justify-center flex-shrink-0',
            variantConfig.iconBg,
            sizeConfig.iconContainerSize
          )}>
            <div className={cn(
              variantConfig.iconColor,
              sizeConfig.iconSize
            )}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Specialized Stat Card Variants
export function PerformanceStatCard({
  title,
  value,
  change,
  trend,
  icon,
  description,
  size = 'md',
  className,
  onClick
}: Omit<StatCardProps, 'variant'>) {
  const getVariant = () => {
    if (trend === 'up') return 'success';
    if (trend === 'down') return 'destructive';
    return 'default';
  };

  return (
    <StatCard
      title={title}
      value={value}
      change={change}
      trend={trend}
      icon={icon}
      description={description}
      variant={getVariant()}
      size={size}
      className={className}
      onClick={onClick}
    />
  );
}

export function MetricStatCard({
  title,
  value,
  subtitle,
  icon,
  size = 'md',
  className,
  onClick
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}) {
  return (
    <StatCard
      title={title}
      value={value}
      description={subtitle}
      icon={icon}
      size={size}
      className={cn('text-center', className)}
      onClick={onClick}
    />
  );
}

export function ComparisonStatCard({
  title,
  currentValue,
  previousValue,
  icon,
  size = 'md',
  className,
  onClick
}: {
  title: string;
  currentValue: string | number;
  previousValue: string | number;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}) {
  const change = Number(currentValue) - Number(previousValue);
  const trend: 'up' | 'down' | 'neutral' = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  const changeText = `${change > 0 ? '+' : ''}${change}`;

  return (
    <StatCard
      title={title}
      value={currentValue}
      change={changeText}
      trend={trend}
      icon={icon}
      description={`vs ${previousValue} (previous)`}
      variant="default"
      size={size}
      className={className}
      onClick={onClick}
    />
  );
}
