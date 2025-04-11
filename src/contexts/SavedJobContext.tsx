import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface SavedJob {
  _id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  salary?: string;
  jobType?: string;
  url?: string;
  source: string;
}

interface SavedJobContextType {
  savedJobs: SavedJob[];
  loading: boolean;
  error: string | null;
  getSavedJobs: () => Promise<void>;
  saveJob: (job: Omit<SavedJob, '_id'>) => Promise<SavedJob>;
  removeJob: (id: string) => Promise<void>;
}

const SavedJobContext = createContext<SavedJobContextType | undefined>(undefined);

export function SavedJobProvider({ children }: { children: React.ReactNode }) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const api = axios.create({
    baseURL: '/api',
    headers: { Authorization: `Bearer ${token}` },
  });

  const getSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/saved-jobs');
      setSavedJobs(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch saved jobs');
      setSavedJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const saveJob = async (job: Omit<SavedJob, '_id'>) => {
    try {
      setLoading(true);
      const response = await api.post('/saved-jobs', job);
      setSavedJobs([...savedJobs, response.data]);
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save job');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeJob = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/saved-jobs/${id}`);
      setSavedJobs(savedJobs.filter(job => job._id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove saved job');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SavedJobContext.Provider value={{
      savedJobs,
      loading,
      error,
      getSavedJobs,
      saveJob,
      removeJob,
    }}>
      {children}
    </SavedJobContext.Provider>
  );
}

export function useSavedJob() {
  const context = useContext(SavedJobContext);
  if (context === undefined) {
    throw new Error('useSavedJob must be used within a SavedJobProvider');
  }
  return context;
} 