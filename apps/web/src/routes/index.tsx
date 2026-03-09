import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy load ListCustomer component
const ListCustomer = lazy(() => import('../pages/customers/ListCustomer'));
const CustomerDetail = lazy(() => import('../pages/customers/CustomerDetail'));

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
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ListCustomer />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:uuid"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <CustomerDetail />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
