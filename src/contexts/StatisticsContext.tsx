import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Statistics {
  totalApplications: number;
  monthlyApplications: number;
  interviewsScheduled: number;
  responseRate: number;
  statusDistribution: {
    [key: string]: number;
  };
  monthlyTrend: {
    month: string;
    count: number;
  }[];
}

interface StatisticsContextType {
  statistics: Statistics;
  loading: boolean;
  error: string | null;
  fetchStatistics: () => Promise<void>;
}

const defaultStatistics: Statistics = {
  totalApplications: 0,
  monthlyApplications: 0,
  interviewsScheduled: 0,
  responseRate: 0,
  statusDistribution: {},
  monthlyTrend: [],
};

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

export function StatisticsProvider({ children }: { children: React.ReactNode }) {
  const [statistics, setStatistics] = useState<Statistics>(defaultStatistics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create API instance with current configuration
  const createApi = () => {
    const currentToken = localStorage.getItem('token');
    return axios.create({
      baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '/api',
      headers: { 
        Authorization: `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      },
    });
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = createApi();
      const response = await api.get<Statistics>('/statistics');
      
      // Ensure we have all required properties with fallbacks
      const processedData: Statistics = {
        ...defaultStatistics,
        ...response.data,
        statusDistribution: response.data.statusDistribution || {},
        monthlyTrend: Array.isArray(response.data.monthlyTrend) ? response.data.monthlyTrend : []
      };
      
      setStatistics(processedData);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch statistics');
      }
      setStatistics(defaultStatistics);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StatisticsContext.Provider
      value={{
        statistics,
        loading,
        error,
        fetchStatistics,
      }}
    >
      {children}
    </StatisticsContext.Provider>
  );
}

export function useStatistics() {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
} 