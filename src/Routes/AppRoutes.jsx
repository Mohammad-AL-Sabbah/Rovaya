import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { WelcomePage } from '../Pages/Welcome/WelcomePage';
import { LoginPage } from '../Pages/ControlPanel/Auth/LoginPage';
import { AdminLayout } from '../Components/ControlPanel/AdminLayout';
import { DashboardPage } from '../Pages/ControlPanel/DashboardPage';
import { ProtectedRoute } from '../Components/ControlPanel/ProtectedRoute'; 

// ✅ 1. استيراد صفحة إدارة الموظفين الجديدة
import { EmployeesPage } from '../Pages/ControlPanel/UsersAndEmployee/EmployeesPage';
import { TouristsPage } from '../Pages/ControlPanel/UsersAndEmployee/TouristsPage';
import { AuditPage } from '../Pages/ControlPanel/Auth/AuditPage';
import { RecommendationsPage } from '../Pages/ControlPanel/RecommendationsPage/RecommendationsPage';




const router = createBrowserRouter([
  {
    path: '/',
    element: <WelcomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/control-panel',
    element: <ProtectedRoute />, // حراسة المسار بالكامل
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '', // الصفحة الرئيسية للوحة التحكم
            element: <DashboardPage />,
          },
          {
            // ✅ 2. إضافة مسار صفحة الموظفين
            path: 'employees', 
            element: <EmployeesPage />,
          },
          {
            // ✅ 3. إضافة مسار صفحة المسافرين            
            path: 'tourists', 
            element: <TouristsPage />,  
          },
          {
            path: 'audit', 
            element: <AuditPage />,  
          },
          {
            path: 'recommendations', 
            element: <RecommendationsPage />,
          
          }
          // يمكنك إضافة صفحات أخرى هنا مستقبلاً
        ],
      },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}