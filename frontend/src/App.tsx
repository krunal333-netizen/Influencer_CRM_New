import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InfluencersPage from './pages/InfluencersPage';
import CampaignsPage from './pages/CampaignsPage';
import ProductsPage from './pages/ProductsPage';
import StoresPage from './pages/StoresPage';
import FinancialPage from './pages/FinancialPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InvoicesPage from './pages/InvoicesPage';
import CourierPage from './pages/CourierPage';
import ProtectedRoute from './routes/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/influencers"
        element={
          <ProtectedRoute>
            <InfluencersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/campaigns"
        element={
          <ProtectedRoute>
            <CampaignsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/products"
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/stores"
        element={
          <ProtectedRoute>
            <StoresPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/financial"
        element={
          <ProtectedRoute>
            <FinancialPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/invoices"
        element={
          <ProtectedRoute>
            <InvoicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/courier"
        element={
          <ProtectedRoute>
            <CourierPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
