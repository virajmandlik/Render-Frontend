
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useJobs } from "@/contexts/JobContext";
import { JobApplication, Status } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowUpDown,
  Calendar, 
  Edit, 
  ExternalLink, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SortConfig {
  key: keyof JobApplication;
  direction: 'asc' | 'desc';
}

const statusColors = {
  Applied: { bg: "bg-blue-100", text: "text-blue-800" },
  Interview: { bg: "bg-yellow-100", text: "text-yellow-800" },
  Offer: { bg: "bg-green-100", text: "text-green-800" },
  Rejected: { bg: "bg-red-100", text: "text-red-800" }
};

const JobsList: React.FC = () => {
  const { jobs, loading, deleteJob } = useJobs();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [filteredJobs, setFilteredJobs] = useState<JobApplication[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'dateApplied', direction: 'desc' });
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...jobs];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        job =>
          job.company.toLowerCase().includes(term) ||
          job.role.toLowerCase().includes(term) ||
          (job.location && job.location.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      result = result.filter(job => job.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'dateApplied') {
        const dateA = new Date(a[sortConfig.key]).getTime();
        const dateB = new Date(b[sortConfig.key]).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const valueA = a[sortConfig.key] || '';
        const valueB = b[sortConfig.key] || '';
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortConfig.direction === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        return 0;
      }
    });

    setFilteredJobs(result);
  }, [jobs, searchTerm, statusFilter, sortConfig]);

  const handleSort = (key: keyof JobApplication) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteJob(jobToDelete);
    } catch (error) {
      console.error("Failed to delete job", error);
    } finally {
      setIsDeleting(false);
      setJobToDelete(null);
    }
  };

  const renderTableContent = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-6 w-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-10" /></TableCell>
        </TableRow>
      ));
    }

    if (filteredJobs.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Search className="h-10 w-10 mb-2" />
              <p className="text-lg font-medium">No jobs found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return filteredJobs.map(job => (
      <TableRow key={job.id}>
        <TableCell className="font-medium">{job.company}</TableCell>
        <TableCell>
          <Link to={`/jobs/${job.id}`} className="text-primary hover:underline">
            {job.role}
          </Link>
        </TableCell>
        <TableCell>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[job.status].bg} ${statusColors[job.status].text}`}>
            {job.status}
          </span>
        </TableCell>
        <TableCell>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            {new Date(job.dateApplied).toLocaleDateString()}
          </div>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to={`/jobs/${job.id}`} className="flex items-center cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  View / Edit
                </Link>
              </DropdownMenuItem>
              {job.link && (
                <DropdownMenuItem asChild>
                  <a 
                    href={job.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center cursor-pointer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Link
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setJobToDelete(job.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
          <p className="text-muted-foreground">
            Manage and track all your job applications
          </p>
        </div>
        <Link to="/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as Status | "All")}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Offer">Offer</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('company')} className="cursor-pointer">
                  <div className="flex items-center">
                    Company
                    {sortConfig.key === 'company' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('role')} className="cursor-pointer">
                  <div className="flex items-center">
                    Position
                    {sortConfig.key === 'role' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === 'status' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('dateApplied')} className="cursor-pointer">
                  <div className="flex items-center">
                    Date Applied
                    {sortConfig.key === 'dateApplied' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableContent()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteJob} 
              disabled={isDeleting} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Trash2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobsList;
