// src/Routes/AppRoutes.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { WelcomePage } from '../Pages/Welcome/WelcomePage';


const router = createBrowserRouter([
  // الصفحة الرئيسية - Welcome Page
  {
    path: '/',
    element: <WelcomePage />,
  },
  
  // لوحة التحكم - Dashboard
  {
    path: '/admin',
  },
  
  // يمكن إضافة مسارات أخرى لاحقاً
  // {
  //   path: '/admin/cities',
  //   element: <CitiesManagement />,
  // },
  // {
  //   path: '/admin/places',
  //   element: <PlacesManagement />,
  // },
  // {
  //   path: '/admin/login',
  //   element: <LoginPage />,
  // },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}