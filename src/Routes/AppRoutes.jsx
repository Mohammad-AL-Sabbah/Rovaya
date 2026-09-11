// src/Routes/AppRoutes.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { WelcomePage } from '../Pages/Welcome/WelcomePage';
import { LoginPage } from '../Pages/ControlPanel/Auth/LoginPage'; // تأكد من المسار الصحيح لملف LoginPage

const router = createBrowserRouter([
  // الصفحة الرئيسية - Welcome Page
  {
    path: '/',
    element: <WelcomePage />,
  },
  
  // صفحة دخول الموظفين
  {
    path: '/login',
    element: <LoginPage />,
  },
  
  // لوحة التحكم (يمكن تفعيلها لاحقاً عند إنشاء مكوناتها)
  // {
  //   path: '/admin',
  //   element: <AdminLayout />,
  //   children: [
  //     {
  //       path: '',
  //       element: <DashboardPage />,
  //     },
  //     {
  //       path: 'cities',
  //       element: <CitiesManagement />,
  //     },
  //   ],
  // },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}