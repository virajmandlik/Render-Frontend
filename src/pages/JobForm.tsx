import React from 'react';
import { useNavigate } from 'react-router-dom';
import { JobForm as JobFormComponent } from '@/components/JobForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function JobForm() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/jobs');
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Job Application</CardTitle>
        </CardHeader>
        <CardContent>
          <JobFormComponent onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
