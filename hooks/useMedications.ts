'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/client';

export interface DashboardMedication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  times: string[];          // ["08:00", "14:00"]
  instructions: string | null;
  isOngoing: boolean;
  endDate: string | null;
  instructionsVerified: boolean;
}

export function useDashboardMedications() {
  const [medications, setMedications] = useState<DashboardMedication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/medication');
        const all: DashboardMedication[] = res.data;

        // Filter to only active medications (not ended)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const active = all.filter((m) => {
          if (m.isOngoing) return true;
          if (!m.endDate) return true;
          return new Date(m.endDate) >= today;
        });

        // Show up to 4 on the dashboard
        setMedications(active.slice(0, 4));
      } catch {
        setMedications([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { medications, loading };
}