// IDE Refresh Trigger
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RecruiterLayout from './layouts/RecruiterLayout';
import AdminLayout from './layouts/AdminLayout';

import RecruiterDashboard from './pages/recruiter/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import JobsList from './pages/recruiter/Jobs';
import CreateJob from './pages/recruiter/CreateJob';
import ApplicationsPipeline from './pages/recruiter/Applications';
import CandidatesDiscovery from './pages/recruiter/CandidatesDiscovery';
import Messages from './pages/recruiter/Messages';
import CompanyProfile from './pages/recruiter/CompanyProfile';
import RecruiterNotifications from './pages/recruiter/RecruiterNotifications';
import RecruiterSettings from './pages/recruiter/RecruiterSettings';
import RecruiterAnalytics from './pages/recruiter/Analytics';
import RecruiterEmailTemplates from './pages/recruiter/RecruiterEmailTemplates';

import UsersList from './pages/admin/Users';
import RecruitersList from './pages/admin/Recruiters';
import CandidatesList from './pages/admin/Candidates';
import Companies from './pages/admin/Companies';
import AdminJobs from './pages/admin/AdminJobs';
import GlobalApplications from './pages/admin/GlobalApplications';
import Reports from './pages/admin/Reports';

import Categories from './pages/admin/Categories';
import Moderation from './pages/admin/Moderation';
import Notifications from './pages/admin/Notifications';
import Settings from './pages/admin/Settings';
import { authService } from './services/auth';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

// Smart Root Redirect based on active authentication and role
function RootRedirect() {
  const token = localStorage.getItem('token');
  const user = authService.getCurrentUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || '').toUpperCase();
  if (role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/recruiter/dashboard" replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Navigate to="/login" replace />} />
          <Route path="/candidate/jobs" element={<Navigate to="/login" replace />} />
          <Route path="/explore-jobs" element={<Navigate to="/login" replace />} />
          
          {/* Recruiter Routes */}
          <Route path="/recruiter" element={<RecruiterLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="jobs" element={<JobsList />} />
            <Route path="jobs/create" element={<CreateJob />} />
            <Route path="applications" element={<ApplicationsPipeline />} />
            
            {/* Pending Recruiter Routes */}
            <Route path="candidates" element={<CandidatesDiscovery />} />
            <Route path="interviews" element={<Navigate to="applications" replace />} />
            <Route path="messages" element={<Messages />} />
            <Route path="company" element={<CompanyProfile />} />
            <Route path="templates" element={<RecruiterEmailTemplates />} />
            <Route path="analytics" element={<RecruiterAnalytics />} />
            <Route path="notifications" element={<RecruiterNotifications />} />
            <Route path="settings" element={<RecruiterSettings />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            
            {/* Admin Modules */}
            <Route path="users" element={<UsersList />} />
            <Route path="recruiters" element={<RecruitersList />} />
            <Route path="candidates" element={<CandidatesList />} />
            <Route path="companies" element={<Companies />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="applications" element={<GlobalApplications />} />
            <Route path="interviews" element={<Navigate to="applications" replace />} />
            <Route path="reports" element={<Reports />} />
            <Route path="categories" element={<Categories />} />
            <Route path="moderation" element={<Moderation />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  </ErrorBoundary>
);
}

export default App;
