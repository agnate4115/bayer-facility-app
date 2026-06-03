import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Landing from '@/pages/Landing';
import EmployeeApp from '@/pages/employee/EmployeeApp';
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard';
import AdminLayout from '@/pages/admin/AdminLayout';
import DashboardOverview from '@/pages/admin/DashboardOverview';
import TicketsPage from '@/pages/admin/TicketsPage';
import TicketDetail from '@/pages/admin/TicketDetail';
import AnalyticsPage from '@/pages/admin/AnalyticsPage';
import QRCodesPage from '@/pages/admin/QRCodesPage';
import FeedbackPage from '@/pages/admin/FeedbackPage';
import FeedbackManagement from '@/pages/admin/FeedbackManagement';
import FeedbackDetail from '@/pages/admin/FeedbackDetail';
import SettingsPage from '@/pages/admin/SettingsPage';
import OfficeManagement from '@/pages/admin/OfficeManagement';
import AddOffice from '@/pages/admin/AddOffice';
import PeopleManagement from '@/pages/admin/PeopleManagement';
import AuditLogs from '@/pages/admin/AuditLogs';
import MockAdminAuth from '@/pages/admin/MockAdminAuth';

function LandingLayout() {
  return (
    <>
      <Navbar />
      <Landing />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingLayout />} />
        <Route path="/app/*" element={<EmployeeApp />} />
        <Route path="/app/dashboard/*" element={<EmployeeDashboard />} />
        <Route path="/admin/auth" element={<MockAdminAuth />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="qr-codes" element={<QRCodesPage />} />
          <Route path="feedback-old" element={<FeedbackPage />} />
          <Route path="feedback" element={<FeedbackManagement />} />
          <Route path="feedback/:id" element={<FeedbackDetail />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="offices" element={<OfficeManagement />} />
          <Route path="offices/new" element={<AddOffice />} />
          <Route path="people" element={<PeopleManagement />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
