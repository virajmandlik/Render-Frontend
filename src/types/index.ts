export type Status = "Applied" | "Interview" | "Offer" | "Rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: Status;
  dateApplied: string;
  link?: string;
  description?: string;
  notes?: string;
  location?: string;
  salary?: string;
  contactPerson?: string;
  contactEmail?: string;
}

export interface Resume {
  id: string;
  name: string;
  originalName: string;
  fileSize: number;
  contentType: string;
  uploadDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
