import React, { createContext, useContext, useState, useEffect } from "react";
import { JobApplication, Status } from "@/types";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Job {
  id: string;
  company: string;
  role: string;
  status: string;
  dateApplied: string;
  location?: string;
  salary?: string;
  link?: string;
  description?: string;
  notes?: string;
  resume?: {
    id: string;
    name: string;
    originalName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface JobContextType {
  jobs: JobApplication[];
  loading: boolean;
  addJob: (job: Omit<JobApplication, "id">) => Promise<void>;
  updateJob: (id: string, job: Partial<JobApplication>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJobById: (id: string) => JobApplication | undefined;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

// API Base URL
const API_URL = "http://localhost:5000/api";

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchJobs();
    } else {
      setJobs([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch jobs from API
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(`${API_URL}/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const jobsData = await response.json();
      
      // Transform API data to match frontend format
      const transformedJobs = jobsData.map((job: any) => ({
        id: job._id,
        company: job.company,
        role: job.role,
        status: job.status,
        dateApplied: new Date(job.dateApplied).toISOString().split('T')[0],
        link: job.link || "",
        description: job.description || "",
        notes: job.notes || "",
        location: job.location || "",
        salary: job.salary || "",
        contactPerson: job.contactPerson || "",
        contactEmail: job.contactEmail || "",
      }));
      
      setJobs(transformedJobs);
    } catch (error) {
      console.error("Failed to load jobs", error);
      toast({
        title: "Error loading data",
        description: "Failed to load your job applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...jobData,
          resumeId: jobData.resume?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add job');
      }

      const newJob = await response.json();
      
      // Transform API response to match frontend format
      const transformedJob = {
        id: newJob._id,
        company: newJob.company,
        role: newJob.role,
        status: newJob.status,
        dateApplied: newJob.dateApplied,
        location: newJob.location,
        salary: newJob.salary,
        link: newJob.link,
        description: newJob.description,
        notes: newJob.notes,
        resume: newJob.resume ? {
          id: newJob.resume._id,
          name: newJob.resume.name,
          originalName: newJob.resume.originalName,
        } : undefined,
        createdAt: newJob.createdAt,
        updatedAt: newJob.updatedAt,
      };

      setJobs([...jobs, transformedJob]);
      return transformedJob;
    } catch (error) {
      console.error('Error adding job:', error);
      throw error;
    }
  };

  const updateJob = async (id: string, jobData: Partial<JobApplication>) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      // Format date if it exists
      const apiJobData = { ...jobData };
      if (apiJobData.dateApplied) {
        apiJobData.dateApplied = new Date(apiJobData.dateApplied).toISOString();
      }

      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiJobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update job");
      }

      const updatedJob = await response.json();
      
      // Transform API response to match frontend format
      const transformedJob = {
        id: updatedJob._id,
        company: updatedJob.company,
        role: updatedJob.role,
        status: updatedJob.status as Status,
        dateApplied: new Date(updatedJob.dateApplied).toISOString().split('T')[0],
        link: updatedJob.link || "",
        description: updatedJob.description || "",
        notes: updatedJob.notes || "",
        location: updatedJob.location || "",
        salary: updatedJob.salary || "",
        contactPerson: updatedJob.contactPerson || "",
        contactEmail: updatedJob.contactEmail || "",
      };
      
      setJobs(jobs.map(job => job.id === id ? transformedJob : job));
      
      toast({
        title: "Job updated",
        description: `Application for ${updatedJob.role} updated successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error updating job",
        description: error instanceof Error ? error.message : "Failed to update your job application",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const jobToDelete = jobs.find(job => job.id === id);
      if (!jobToDelete) {
        throw new Error("Job not found");
      }

      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete job");
      }
      
      setJobs(jobs.filter(job => job.id !== id));
      
      toast({
        title: "Job deleted",
        description: `Application for ${jobToDelete.role} at ${jobToDelete.company} deleted successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error deleting job",
        description: error instanceof Error ? error.message : "Failed to delete your job application",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  return (
    <JobContext.Provider value={{
      jobs,
      loading,
      addJob,
      updateJob,
      deleteJob,
      getJobById
    }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error("useJobs must be used within a JobProvider");
  }
  return context;
};
