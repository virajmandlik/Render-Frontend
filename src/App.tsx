import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { JobProvider } from '@/contexts/JobContext';
import { ResumeProvider } from '@/contexts/ResumeContext';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { SavedJobProvider } from '@/contexts/SavedJobContext';
import { StatisticsProvider } from '@/contexts/StatisticsContext';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompanyProvider>
          <SavedJobProvider>
            <JobProvider>
              <ResumeProvider>
                <StatisticsProvider>
                  <Toaster position="top-right" />
                  <AppRoutes />
                </StatisticsProvider>
              </ResumeProvider>
            </JobProvider>
          </SavedJobProvider>
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
