import React from 'react';
import { JobApplication } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, MapPin, DollarSign, Link, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useJobs } from '@/contexts/JobContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface JobCardProps {
  job: JobApplication;
}

export function JobCard({ job }: JobCardProps) {
  const { deleteJob } = useJobs();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deleteJob(job.id);
      toast({
        title: 'Success',
        description: 'Job application deleted successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete job application',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'Interview':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Offer':
        return 'bg-green-500 hover:bg-green-600';
      case 'Rejected':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{job.role}</CardTitle>
            <p className="text-sm text-gray-500">{job.company}</p>
          </div>
          <Badge className={`${getStatusColor(job.status)} text-white`}>
            {job.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Applied: {format(new Date(job.dateApplied), 'MMM d, yyyy')}</span>
          </div>
          
          {job.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{job.location}</span>
            </div>
          )}
          
          {job.salary && (
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>{job.salary}</span>
            </div>
          )}
          
          {job.link && (
            <div className="flex items-center text-sm text-gray-600">
              <Link className="h-4 w-4 mr-2" />
              <a 
                href={job.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:underline"
              >
                View Job Posting
              </a>
            </div>
          )}

          {job.resume && (
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-blue-500">
                Resume: {job.resume.name}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/jobs/${job.id}`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 