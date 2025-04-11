import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { useStatistics } from "@/contexts/StatisticsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart,
  Briefcase, 
  Building, 
  Calendar, 
  FileText, 
  Plus, 
  PlusCircle
} from "lucide-react";
import { Status } from "@/types";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatusCardProps {
  status: Status;
  count: number;
  color: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ status, count, color }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{status}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color }}>
          {count}
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { jobs, loading } = useJobs();
  const { statistics, fetchStatistics } = useStatistics();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Calculate stats
  const appliedCount = jobs.filter(job => job.status === "Applied").length;
  const interviewCount = jobs.filter(job => job.status === "Interview").length;
  const offerCount = jobs.filter(job => job.status === "Offer").length;
  const rejectedCount = jobs.filter(job => job.status === "Rejected").length;
  const totalCount = jobs.length;

  // Chart configuration
  const chartData = {
    labels: statistics.monthlyTrend.map(item => item.month),
    datasets: [
      {
        label: 'Applications',
        data: statistics.monthlyTrend.map(item => item.count),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Get recent applications
  const recentApplications = [...jobs]
    .sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime())
    .slice(0, 5);

  // Get jobs by company
  const companyCounts = jobs.reduce((acc, job) => {
    acc[job.company] = (acc[job.company] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's an overview of your job hunt.
          </p>
        </div>
        <Link to="/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Applications</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard status="Applied" count={appliedCount} color="#3B82F6" />
            <StatusCard status="Interview" count={interviewCount} color="#F59E0B" />
            <StatusCard status="Offer" count={offerCount} color="#10B981" />
            <StatusCard status="Rejected" count={rejectedCount} color="#EF4444" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Application Stats</CardTitle>
                <CardDescription>Your application progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks you can perform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Link to="/jobs/new">
                    <Button variant="outline" className="w-full justify-start">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Add New Application
                    </Button>
                  </Link>
                  <Link to="/resumes">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Manage Resumes
                    </Button>
                  </Link>
                  <Link to="/companies">
                    <Button variant="outline" className="w-full justify-start">
                      <Building className="mr-2 h-4 w-4" />
                      Browse Companies
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your most recent job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map(job => (
                    <div key={job.id} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <Link to={`/jobs/${job.id}`} className="font-medium text-primary hover:underline">
                          {job.role}
                        </Link>
                        <div className="text-sm text-muted-foreground">{job.company}</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(job.dateApplied).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${job.status === "Applied" ? "bg-blue-100 text-blue-800" : ""}
                          ${job.status === "Interview" ? "bg-yellow-100 text-yellow-800" : ""}
                          ${job.status === "Offer" ? "bg-green-100 text-green-800" : ""}
                          ${job.status === "Rejected" ? "bg-red-100 text-red-800" : ""}
                        `}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center text-center">
                  <Briefcase className="h-8 w-8 text-muted-foreground/80" />
                  <h3 className="mt-2 text-lg font-medium">No applications yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start tracking your job hunt by adding your first application.
                  </p>
                  <Link to="/jobs/new" className="mt-4">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Application
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Top Companies</CardTitle>
              <CardDescription>Companies you've applied to most</CardDescription>
            </CardHeader>
            <CardContent>
              {topCompanies.length > 0 ? (
                <div className="space-y-4">
                  {topCompanies.map(([company, count]) => (
                    <div key={company} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <div className="font-medium">{company}</div>
                        <div className="text-sm text-muted-foreground">
                          {count} application{count !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <Link to={`/companies?search=${encodeURIComponent(company)}`}>
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center text-center">
                  <Building className="h-8 w-8 text-muted-foreground/80" />
                  <h3 className="mt-2 text-lg font-medium">No companies yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start tracking your job hunt by adding your first application.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
