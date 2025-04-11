import React, { createContext, useContext, useState, useEffect } from "react";
import { Resume } from "@/types";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface ResumeContextType {
  resumes: Resume[];
  loading: boolean;
  addResume: (name: string, file: File) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  getResumeById: (id: string) => Resume | undefined;
  downloadResume: (id: string) => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// API Base URL
const API_URL = "http://localhost:5000/api";

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchResumes();
    } else {
      setResumes([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Fetch resumes from API
  const fetchResumes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(`${API_URL}/resumes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch resumes");
      }

      const resumesData = await response.json();
      
      // Transform API data to match frontend format
      const transformedResumes = resumesData.map((resume: any) => ({
        id: resume._id,
        name: resume.name,
        originalName: resume.originalName,
        fileSize: resume.fileSize,
        contentType: resume.contentType,
        uploadDate: resume.uploadDate,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      }));
      
      setResumes(transformedResumes);
    } catch (error) {
      console.error("Failed to load resumes", error);
      toast({
        title: "Error loading data",
        description: "Failed to load your resume files",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addResume = async (name: string, file: File) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      // Convert file to base64
      const fileData = await fileToBase64(file);

      const response = await fetch(`${API_URL}/resumes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          fileName: file.name,
          fileData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add resume");
      }

      const newResume = await response.json();
      
      // Transform API response to match frontend format
      const transformedResume = {
        id: newResume._id,
        name: newResume.name,
        originalName: newResume.originalName,
        fileSize: newResume.fileSize,
        contentType: newResume.contentType,
        uploadDate: newResume.uploadDate,
        createdAt: newResume.createdAt,
        updatedAt: newResume.updatedAt,
      };
      
      setResumes([...resumes, transformedResume]);
      
      toast({
        title: "Resume added",
        description: `${newResume.name} added successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error adding resume",
        description: error instanceof Error ? error.message : "Failed to add your resume file",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const resume = resumes.find(r => r.id === id);
      if (!resume) {
        throw new Error("Resume not found");
      }

      const response = await fetch(`${API_URL}/resumes/${id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download resume");
      }

      // Create a blob from the PDF stream
      const blob = await response.blob();
      
      // Create a link element and trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = resume.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL object
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 100);
      
      toast({
        title: "Download started",
        description: `${resume.name} is downloading...`,
      });
    } catch (error) {
      toast({
        title: "Error downloading resume",
        description: error instanceof Error ? error.message : "Failed to download your resume file",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteResume = async (id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const resumeToDelete = resumes.find(resume => resume.id === id);
      if (!resumeToDelete) {
        throw new Error("Resume not found");
      }

      const response = await fetch(`${API_URL}/resumes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete resume");
      }
      
      setResumes(resumes.filter(resume => resume.id !== id));
      
      toast({
        title: "Resume deleted",
        description: `${resumeToDelete.name} deleted successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error deleting resume",
        description: error instanceof Error ? error.message : "Failed to delete your resume file",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getResumeById = (id: string) => {
    return resumes.find(resume => resume.id === id);
  };

  return (
    <ResumeContext.Provider value={{
      resumes,
      loading,
      addResume,
      deleteResume,
      getResumeById,
      downloadResume
    }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResumes = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResumes must be used within a ResumeProvider");
  }
  return context;
};
