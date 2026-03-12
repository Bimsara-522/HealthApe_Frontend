'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/api';

//Types

export interface MedicalRecord {
  id: string;
  title: string;
  category: string;
  date: string | null;
  doctorName: string | null;
  hospital: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  extractedText: string | null;
  tags: string[];
  details: Record<string, unknown>;
  createdAt: string;
}

export type SortOption = 'createdAt' | 'date';
export type SortOrder = 'asc' | 'desc';

//Hook

export function useMedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //Filter/search state — managed here so the whole page reacts to changes
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      //Build query string from current filters
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

      const response = await api.get(`/medical-record?${params.toString()}`);
      setRecords(response.data);
    } catch (err) {
      console.error('Failed to fetch records:', err);
      setError('Could not load your records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, sortBy, sortOrder]);

  //Re-fetch whenever filters change
  useEffect(() => {
    //Small debounce for search so we don't fire on every keystroke
    const timer = setTimeout(() => {
      fetchRecords();
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [fetchRecords, search]);

  const deleteRecord = async (id: string) => {
    try {
      await api.delete(`/medical-record/${id}`);
      //Remove from local state immediately (no need to refetch)
      setRecords((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete record:', err);
      return false;
    }
  };

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
    deleteRecord,
    //Filter state and setters
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  };
}

//Single record hook

export function useMedicalRecord(id: string) {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/medical-record/${id}`);
        setRecord(response.data);
      } catch (err) {
        console.error('Failed to fetch record:', err);
        setError('Record not found.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRecord();
  }, [id]);

  return { record, loading, error };
}

//Fetches only the 5 most recent records for the dashboard
export function useRecentRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoading(true);
        const response = await api.get('/medical-record?sortBy=createdAt&sortOrder=desc');
        setRecords((response.data as MedicalRecord[]).slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch recent records:', err);
        setError('Could not load records.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, []);

  return { records, loading, error };
}