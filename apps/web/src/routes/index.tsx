import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from '../components/ProtectedRoute';

const ListCompany = lazy(() => import('../pages/companies/ListCompany'));
const ListBranch = lazy(() => import('../pages/branches/ListBranch'));
const BusinessSettings = lazy(() => import('../pages/finance/BusinessSettings'));
const CashflowLedger = lazy(() => import('../pages/finance/CashflowLedger'));
const TaxSummary = lazy(() => import('../pages/finance/TaxSummary'));
const OrderBoard = lazy(() => import('../pages/restaurant/OrderBoard'));
const MenuManagement = lazy(() => import('../pages/restaurant/MenuManagement'));
const QrOrder = lazy(() => import('../pages/restaurant/QrOrder'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-gray-600">Đang tải...</div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/order/:token"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <QrOrder />
          </Suspense>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/companies"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ListCompany />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/branches"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ListBranch />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurant/orders"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <OrderBoard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurant/menu"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <MenuManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/business-settings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <BusinessSettings />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/cashflow"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <CashflowLedger />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/tax-summary"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <TaxSummary />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
