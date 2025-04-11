import React, { useEffect } from 'react';
import { useSavedJob } from '@/contexts/SavedJobContext';
import { toast } from 'react-hot-toast';

export default function SavedJobsPage() {
  const { savedJobs, loading, error, getSavedJobs, removeJob } = useSavedJob();

  useEffect(() => {
    getSavedJobs();
  }, []);

  const handleRemoveJob = async (id: string) => {
    try {
      await removeJob(id);
      toast.success('Job removed from saved list');
    } catch (err) {
      toast.error('Failed to remove job');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Saved Jobs</h1>
      </div>
      
      <div className="grid gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : savedJobs.length === 0 ? (
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">No saved jobs yet</h3>
            <p className="text-gray-600">Jobs you save will appear here for quick access.</p>
          </div>
        ) : (
          savedJobs.map((job) => (
            <div key={job._id} className="p-6 bg-white rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <p className="text-gray-600">{job.company}</p>
                  {job.location && (
                    <p className="text-sm text-gray-500 mt-1">{job.location}</p>
                  )}
                  {job.salary && (
                    <p className="text-sm text-gray-500">{job.salary}</p>
                  )}
                  {job.jobType && (
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mt-2">
                      {job.jobType}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveJob(job._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              {job.description && (
                <p className="text-gray-600 mt-4 text-sm line-clamp-3">
                  {job.description}
                </p>
              )}
              {job.url && (
                <div className="mt-4">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/90 text-sm"
                  >
                    View Job
                  </a>
                </div>
              )}
              <div className="mt-2 text-xs text-gray-400">
                Source: {job.source}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 