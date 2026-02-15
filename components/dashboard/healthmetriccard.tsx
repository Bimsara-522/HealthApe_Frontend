// components/dashboard/HealthMetricCard.tsx
// ============================================
// HEALTH METRIC CARD COMPONENT
// ============================================
// Shows vital statistics like:
// - Heart Rate: 72 bpm (Normal)
// - Blood Pressure: 120/80 (Normal)
// - Glucose: 95 mg/dL (Optimal)
// - Weight: 78 kg (-2 kg)

import React from 'react';
import { Activity } from 'lucide-react';
import { Badge } from '@/components/UI/badge';

// ============================================
// TYPE DEFINITION
// ============================================
// Defines the shape of health metric data
export interface HealthMetric {
  id: string;
  label: string;      // "Heart Rate"
  value: string;      // "72"
  unit?: string;      // "bpm" (optional)
  status: 'normal' | 'optimal' | 'warning' | 'critical';
  change?: string;    // "-2 kg" (optional - for weight changes)
}

// ============================================
// SINGLE METRIC CARD
// ============================================
interface HealthMetricCardProps {
  metric: HealthMetric;
}

export function HealthMetricCard({ metric }: HealthMetricCardProps) {
  // Map status to badge variant and label
  const statusConfig = {
    normal: { label: 'Normal', variant: 'info' as const },
    optimal: { label: 'Optimal', variant: 'success' as const },
    warning: { label: 'Warning', variant: 'warning' as const },
    critical: { label: 'Critical', variant: 'error' as const },
  };

  const { label: statusLabel, variant } = statusConfig[metric.status];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 min-w-[160px] flex-shrink-0 hover:shadow-md transition-shadow">
      {/* Top row - Label and pulse icon */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-gray-500">{metric.label}</span>
        <Activity className="w-5 h-5 text-red-400" />
      </div>

      {/* Value */}
      <div className="mb-3">
        <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
        {metric.unit && (
          <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
        )}
      </div>

      {/* Status badge OR change indicator */}
      {metric.change ? (
        // Show change (like "-2 kg")
        <Badge variant="success">{metric.change}</Badge>
      ) : (
        // Show status (like "Normal")
        <Badge variant={variant}>{statusLabel}</Badge>
      )}
    </div>
  );
}

// ============================================
// METRICS GRID - Horizontal row of cards
// ============================================
interface HealthMetricsGridProps {
  metrics: HealthMetric[];
}

export function HealthMetricsGrid({ metrics }: HealthMetricsGridProps) {
  return (
    // Horizontal scroll container
    // scrollbar-hide hides the scrollbar but keeps scroll functionality
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {metrics.map((metric) => (
        <HealthMetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}
