import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');

  const isAdmin = token && (roles.includes('Admin') || roles.includes('SuperAdmin'));

  if (!isAdmin) {
    // استخدام replace: true لكي تُستبدل صفحة لوحة التحكم في تاريخ المتصفح تماماً
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}