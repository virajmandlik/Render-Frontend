import React, { useEffect, useState } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';

interface CompanyFormData {
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  location?: string;
  size?: string;
}

export default function CompaniesPage() {
  const { companies, loading, error, getCompanies, searchCompanies, addCompany } = useCompany();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    description: '',
    website: '',
    industry: '',
    location: '',
    size: '',
  });

  useEffect(() => {
    getCompanies();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const results = await searchCompanies(searchQuery);
    setSearchResults(results);
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCompany(formData);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        description: '',
        website: '',
        industry: '',
        location: '',
        size: '',
      });
      toast.success('Company added successfully');
      getCompanies(); // Refresh the companies list
    } catch (err) {
      toast.error('Failed to add company');
    }
  };

  const handleImportCompany = async (company: any) => {
    try {
      await addCompany({
        name: company.name,
        description: company.description,
        location: company.location,
        jobCount: company.jobCount,
      });
      toast.success('Company imported successfully');
      getCompanies(); // Refresh the companies list
    } catch (err) {
      toast.error('Failed to import company');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading companies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          Add Company
        </button>
      </div>

      {/* Search Section */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search companies..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleSearch}
          className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Search
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((company, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-semibold">{company.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{company.location}</p>
                <p className="text-sm text-gray-600">Jobs: {company.jobCount}</p>
                <button
                  onClick={() => handleImportCompany(company)}
                  className="mt-2 text-primary hover:text-primary/90 text-sm"
                >
                  Import Company
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Companies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.length === 0 ? (
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">No companies added yet</h3>
            <p className="text-gray-600">Start by adding your first company!</p>
          </div>
        ) : (
          companies.map((company) => (
            <div key={company._id} className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold">{company.name}</h3>
              {company.location && (
                <p className="text-sm text-gray-600 mt-1">{company.location}</p>
              )}
              {company.industry && (
                <p className="text-sm text-gray-600">{company.industry}</p>
              )}
              {company.jobCount > 0 && (
                <p className="text-sm text-gray-600">Jobs: {company.jobCount}</p>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/90 text-sm mt-2 block"
                >
                  Visit Website
                </a>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Company Modal */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Add New Company
            </Dialog.Title>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Size
                </label>
                <select
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1001+">1001+ employees</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                >
                  Add Company
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 