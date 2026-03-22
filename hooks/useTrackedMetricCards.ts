'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/client';

export interface TrackedMetricCard {
  metricKey: string;
  metricName: string;
  latestValue: string | null;
  unit: string | null;
  latestDate: string | null;
  status: 'Low' | 'Normal' | 'High' | 'Unknown';
  refLow: number | null;
  refHigh: number | null;
}

interface InsightLab {
  key: string;
  name: string;
  latestValueText: string | null;
  unit: string | null;
  latestDate: string | null;
  status: 'Low' | 'Normal' | 'High' | 'Unknown';
  refLow: number | null;
  refHigh: number | null;
}

export function useTrackedMetricCards() {
  const [cards, setCards] = useState<TrackedMetricCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tracked metric keys + the full insights labs in parallel
        const [trackedRes, insightsRes] = await Promise.all([
          api.get('/insights/tracked-metrics'),
          api.get('/insights/getDetails'),
        ]);

        const tracked: { metricKey: string; metricName: string }[] =
          trackedRes.data;

        if (tracked.length === 0) {
          setCards([]);
          return;
        }

        // Build a lookup map from the insights labs array
        const labsMap = new Map<string, InsightLab>();
        for (const lab of insightsRes.data?.labs ?? []) {
          labsMap.set(lab.key, lab);
        }

        // Join tracked list with live lab data — preserve tracked order
        const result: TrackedMetricCard[] = tracked
          .slice(0, 5)
          .map((t) => {
            const lab = labsMap.get(t.metricKey);
            return {
              metricKey: t.metricKey,
              metricName: lab?.name ?? t.metricName,
              latestValue: lab?.latestValueText ?? null,
              unit: lab?.unit ?? null,
              latestDate: lab?.latestDate ?? null,
              status: lab?.status ?? 'Unknown',
              refLow: lab?.refLow ?? null,
              refHigh: lab?.refHigh ?? null,
            };
          });

        setCards(result);
      } catch {
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { cards, loading };
}