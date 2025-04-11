import React, { useState, useRef } from "react";
import { useResumes } from "@/contexts/ResumeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, FileText, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ResumesPage: React.FC = () => {
  const { resumes, loading, addResume, deleteResume, downloadResume } = useResumes();
  const [resumeName, setResumeName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAddingResume, setIsAddingResume] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        setSelectedFile(null);
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('File size should be less than 5MB');
        setSelectedFile(null);
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleAddResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }
    if (!resumeName.trim()) {
      setError('Please enter a resume name');
      return;
    }

    setIsAddingResume(true);
    setError("");

    try {
      await addResume(resumeName.trim(), selectedFile);
      setResumeName("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setDialogOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add resume");
    } finally {
      setIsAddingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!resumeToDelete) return;
    
    try {
      await deleteResume(resumeToDelete);
      setResumeToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete resume", error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setResumeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDownload = async (id: string) => {
    try {
      await downloadResume(id);
    } catch (error) {
      console.error("Failed to download resume", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resumes</h1>
          <p className="text-muted-foreground">
            Manage your resume files and track different versions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Resume
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Resume</DialogTitle>
              <DialogDescription>
                Upload your resume in PDF format (max 5MB)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddResume}>
              {error && (
                <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="resumeName">Resume Name</Label>
                  <Input
                    id="resumeName"
                    placeholder="e.g. Software Engineer Resume"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resumeFile">PDF File</Label>
                  <Input
                    id="resumeFile"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Only PDF files are allowed (max 5MB)
                  </p>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={isAddingResume}>
                  {isAddingResume && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isAddingResume ? "Adding..." : "Add Resume"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[150px] w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {resumes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <FileText className="h-12 w-12 text-muted-foreground/60" />
                <h3 className="mt-4 text-xl font-semibold">No resumes yet</h3>
                <p className="mt-2 text-center text-muted-foreground">
                  Upload your first resume to start tracking different versions
                </p>
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Add Resume
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {resumes.map((resume) => (
                <Card key={resume.id}>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{resume.name}</CardTitle>
                    <CardDescription>
                      Added on {new Date(resume.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="h-16 w-16 text-primary/60" />
                      <div className="text-sm text-muted-foreground">
                        <p>{resume.originalName}</p>
                        <p>{formatFileSize(resume.fileSize)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => handleDownload(resume.id)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(resume.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the resume file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResumeToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteResume}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResumesPage;
