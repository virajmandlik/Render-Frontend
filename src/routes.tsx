import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import JobsList from '@/pages/JobsList';
import JobForm from '@/pages/JobForm';
import ResumesPage from '@/pages/ResumesPage';
import ProfilePage from '@/pages/ProfilePage';
import CompaniesPage from '@/pages/CompaniesPage';
import SavedJobsPage from '@/pages/SavedJobsPage';
import StatisticsPage from '@/pages/StatisticsPage';
import { useAuth } from '@/contexts/AuthContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="jobs" element={<JobsList />} />
        <Route path="jobs/new" element={<JobForm />} />
        <Route path="jobs/:id" element={<JobForm />} />
        <Route path="resumes" element={<ResumesPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="saved-jobs" element={<SavedJobsPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
} 