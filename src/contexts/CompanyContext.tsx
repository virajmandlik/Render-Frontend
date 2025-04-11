import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Company {
  _id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  logo?: string;
  location?: string;
  size?: string;
  jobCount: number;
}

interface CompanyContextType {
  companies: Company[];
  loading: boolean;
  error: string | null;
  getCompanies: () => Promise<void>;
  searchCompanies: (query: string) => Promise<Company[]>;
  addCompany: (company: Partial<Company>) => Promise<Company>;
  updateCompany: (id: string, company: Partial<Company>) => Promise<Company>;
  deleteCompany: (id: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

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

  const getCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const api = createApi();
      const response = await api.get<Company[]>('/companies');
      setCompanies(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch companies');
      }
      setCompanies([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const searchCompanies = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const api = createApi();
      const response = await api.get<Company[]>(`/companies/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to search companies');
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addCompany = async (company: Partial<Company>) => {
    try {
      setLoading(true);
      setError(null);
      const api = createApi();
      const response = await api.post<Company>('/companies', company);
      setCompanies(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to add company');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (id: string, company: Partial<Company>) => {
    try {
      setLoading(true);
      setError(null);
      const api = createApi();
      const response = await api.put<Company>(`/companies/${id}`, company);
      setCompanies(prev => prev.map(c => c._id === id ? response.data : c));
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to update company');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const api = createApi();
      await api.delete(`/companies/${id}`);
      setCompanies(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to delete company');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        companies,
        loading,
        error,
        getCompanies,
        searchCompanies,
        addCompany,
        updateCompany,
        deleteCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
} 