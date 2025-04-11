import React, { useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useStatistics } from '@/contexts/StatisticsContext';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

export default function StatisticsPage() {
  const { statistics, loading, error, fetchStatistics } = useStatistics();

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">No statistics available</div>
      </div>
    );
  }

  const statusChartData = {
    labels: Object.keys(statistics.statusDistribution),
    datasets: [
      {
        data: Object.values(statistics.statusDistribution),
        backgroundColor: [
          '#4F46E5', // primary
          '#10B981', // success
          '#F59E0B', // warning
          '#EF4444', // danger
          '#6B7280', // gray
        ],
      },
    ],
  };

  const trendChartData = {
    labels: statistics.monthlyTrend.map(item => item.month),
    datasets: [
      {
        label: 'Applications',
        data: statistics.monthlyTrend.map(item => item.count),
        backgroundColor: '#4F46E5',
      },
    ],
  };

  const trendOptions = {
    responsive: true,
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

  const statCards = [
    { label: 'Total Applications', value: statistics.totalApplications },
    { label: 'Applications This Month', value: statistics.monthlyApplications },
    { label: 'Interviews Scheduled', value: statistics.interviewsScheduled },
    { label: 'Response Rate', value: `${statistics.responseRate}%` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="p-6 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-4">Application Status Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <Pie data={statusChartData} />
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-4">Monthly Application Trend</h3>
          <div className="h-64">
            <Bar options={trendOptions} data={trendChartData} />
          </div>
        </div>
      </div>
    </div>
  );
} 