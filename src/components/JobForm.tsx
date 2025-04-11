import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useJobs } from '@/contexts/JobContext';
import { useResumes } from '@/contexts/ResumeContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { JobApplication, Status } from '@/types';

const jobSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Job title is required'),
  status: z.string().min(1, 'Status is required'),
  dateApplied: z.date(),
  location: z.string().optional(),
  salary: z.string().optional(),
  link: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  notes: z.string().optional(),
  resumeId: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  onSuccess?: () => void;
}

export function JobForm({ onSuccess }: JobFormProps) {
  const { addJob } = useJobs();
  const { resumes, loading: resumesLoading } = useResumes();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      company: '',
      role: '',
      status: 'Applied',
      dateApplied: new Date(),
      location: '',
      salary: '',
      link: '',
      description: '',
      notes: '',
      resumeId: '',
    },
  });

  const dateApplied = watch('dateApplied');
  const selectedResumeId = watch('resumeId');

  const onSubmit = async (data: JobFormData) => {
    try {
      setIsSubmitting(true);
      const jobData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'> = {
        company: data.company,
        role: data.role,
        status: data.status as Status,
        dateApplied: format(data.dateApplied, 'yyyy-MM-dd'),
        location: data.location,
        salary: data.salary,
        link: data.link,
        description: data.description,
        notes: data.notes,
        resume: selectedResumeId ? {
          id: selectedResumeId,
          name: resumes.find(r => r.id === selectedResumeId)?.name || '',
          originalName: resumes.find(r => r.id === selectedResumeId)?.originalName || '',
        } : undefined,
      };

      await addJob(jobData);
      toast({
        title: 'Success',
        description: 'Job application added successfully!',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add job application',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Add New Job Application</h2>
      <p className="text-gray-500 mb-6">Enter the details of your new job application</p>

      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <div className="space-y-2">
          <label htmlFor="resumeId" className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Select Resume for Application
          </label>
          <Select
            onValueChange={(value) => setValue('resumeId', value)}
            value={selectedResumeId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a resume to attach" />
            </SelectTrigger>
            <SelectContent>
              {resumesLoading ? (
                <SelectItem value="loading" disabled>Loading resumes...</SelectItem>
              ) : resumes.length === 0 ? (
                <SelectItem value="none" disabled>No resumes available - Please upload a resume first</SelectItem>
              ) : (
                resumes.map((resume) => (
                  <SelectItem key={resume.id} value={resume.id}>
                    {resume.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium">
            Company Name *
          </label>
          <Input
            id="company"
            placeholder="e.g. Google"
            {...register('company')}
            className={cn(errors.company && 'border-red-500')}
          />
          {errors.company && (
            <p className="text-sm text-red-500">{errors.company.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium">
            Job Title / Role *
          </label>
          <Input
            id="role"
            placeholder="e.g. Frontend Developer"
            {...register('role')}
            className={cn(errors.role && 'border-red-500')}
          />
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Application Status *
          </label>
          <Select
            onValueChange={(value) => setValue('status', value)}
            defaultValue="Applied"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Offer">Offer</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="dateApplied" className="text-sm font-medium">
            Date Applied *
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateApplied && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateApplied ? format(dateApplied, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateApplied}
                onSelect={(date) => date && setValue('dateApplied', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">
            Location
          </label>
          <Input
            id="location"
            placeholder="e.g. San Francisco, CA"
            {...register('location')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="salary" className="text-sm font-medium">
            Salary (if known)
          </label>
          <Input
            id="salary"
            placeholder="e.g. $100,000/year"
            {...register('salary')}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="link" className="text-sm font-medium">
            Job Posting URL
          </label>
          <Input
            id="link"
            placeholder="https://..."
            {...register('link')}
            className={cn(errors.link && 'border-red-500')}
          />
          {errors.link && (
            <p className="text-sm text-red-500">{errors.link.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Job Description
        </label>
        <Textarea
          id="description"
          placeholder="Key responsibilities and requirements..."
          {...register('description')}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <Textarea
          id="notes"
          placeholder="Any additional notes..."
          {...register('notes')}
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Save Application'}
      </Button>
    </form>
  );
} 