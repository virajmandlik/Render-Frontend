export type Status = "Applied" | "Interview" | "Offer" | "Rejected";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: Status;
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