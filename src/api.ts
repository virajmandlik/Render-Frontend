// API utility functions

const API_URL = 'https://render-backend-2664.onrender.com/api';

// Generic fetch function with error handling
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  console.log(`Making API request to: ${API_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Auth API functions
export const authApi = {
  register: (name: string, email: string, password: string) => 
    apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  
  login: (email: string, password: string) => 
    apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  getProfile: (token: string) => 
    apiFetch('/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  
  updateProfile: (token: string, userData: any) => 
    apiFetch('/users/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    }),
};

// Job API functions
export const jobApi = {
  getAll: (token: string) => 
    apiFetch('/jobs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  
  create: (token: string, jobData: any) => 
    apiFetch('/jobs', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    }),
  
  update: (token: string, id: string, jobData: any) => 
    apiFetch(`/jobs/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    }),
  
  delete: (token: string, id: string) => 
    apiFetch(`/jobs/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

// Resume API functions
export const resumeApi = {
  getAll: (token: string) => 
    apiFetch('/resumes', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  
  create: (token: string, resumeData: any) => 
    apiFetch('/resumes', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(resumeData),
    }),
  
  download: (token: string, id: string) => 
    apiFetch(`/resumes/${id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  
  delete: (token: string, id: string) => 
    apiFetch(`/resumes/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
}; 