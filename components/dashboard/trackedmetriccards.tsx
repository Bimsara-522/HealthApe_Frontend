//TrackedMetricCards Component
//Small metric cards shown on dashboard for user-tracked lab values

import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TrackedMetricCard } from '@/hooks/useTrackedMetricCards';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

//Status colour config
function statusConfig(status: TrackedMetricCard['status']) {
  switch (status) {
    case 'High':
      return {
        bg: 'bg-red-50',
        border: 'border-red-100',
        badge: 'bg-red-100 text-red-700',
        value: 'text-red-600',
        icon: <TrendingUp className="w-3.5 h-3.5" />,
      };
    case 'Low':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        badge: 'bg-amber-100 text-amber-700',
        value: 'text-amber-600',
        icon: <TrendingDown className="w-3.5 h-3.5" />,
      };
    case 'Normal':
      return {
        bg: 'bg-white',
        border: 'border-gray-100',
        badge: 'bg-green-100 text-green-700',
        value: 'text-green-600',
        icon: <Minus className="w-3.5 h-3.5" />,
      };
    default:
      return {
        bg: 'bg-white',
        border: 'border-gray-100',
        badge: 'bg-gray-100 text-gray-500',
        value: 'text-gray-400',
        icon: <Minus className="w-3.5 h-3.5" />,
      };
  }
}

function MetricCard({ card }: { card: TrackedMetricCard }) {
  const cfg = statusConfig(card.status);

  return (
    <Link
      href="/insights"
      className={`
        ${cfg.bg} ${cfg.border}
        border rounded-2xl p-4 flex flex-col gap-2
        hover:shadow-md transition-shadow min-w-0
      `}
    >
      {/* Metric name */}
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
        {card.metricName}
      </p>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        {card.latestValue ? (
          <>
            <span className={`text-2xl font-bold ${cfg.value}`}>
              {card.latestValue}
            </span>
            {card.unit && (
              <span className="text-xs text-gray-400">{card.unit}</span>
            )}
          </>
        ) : (
          <span className="text-lg font-semibold text-gray-300">No data</span>
        )}
      </div>

      {/* Status badge + date */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}
        >
          {cfg.icon}
          {card.status}
        </span>
        <span className="text-xs text-gray-400 truncate">
          {formatDate(card.latestDate)}
        </span>
      </div>

      {/* Ref range — only if available */}
      {(card.refLow != null || card.refHigh != null) && (
        <p className="text-xs text-gray-400">
          Ref:{' '}
          {card.refLow != null ? card.refLow : '—'}
          {' – '}
          {card.refHigh != null ? card.refHigh : '—'}
          {card.unit ? ` ${card.unit}` : ''}
        </p>
      )}
    </Link>
  );
}

//Skeleton card
function MetricCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse space-y-2">
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-7 bg-gray-100 rounded w-1/2" />
      <div className="flex justify-between">
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
    </div>
  );
}

interface TrackedMetricCardsProps {
  cards: TrackedMetricCard[];
  loading?: boolean;
}

export function TrackedMetricCards({
  cards,
  loading = false,
}: TrackedMetricCardsProps) {
  //Don't render anything if not loading and no cards
  if (!loading && cards.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Tracked Lab Values
        </h2>
        <Link
          href="/insights"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Manage in Insights →
        </Link>
      </div>

      <div
        className={`grid gap-4 ${
          loading
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            : cards.length === 1
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : cards.length === 2
            ? 'grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
        }`}
      >
        {loading ? (
          //Show 3 skeleton cards while loading
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          cards.map((card) => (
            <MetricCard key={card.metricKey} card={card} />
          ))
        )}
      </div>
    </section>
  );
}