import { useEffect } from 'react';
import { Box } from '@mantine/core';
import { Outlet, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Sidebar } from './Sidebar';
import { DashboardNavbar } from './DashboardNavbar';

export function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    const isAdmin = token && (roles.includes('Admin') || roles.includes('SuperAdmin'));

    if (!isAdmin) {
      navigate('/login', { replace: true });
      return;
    }

    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);

      Swal.fire({
        title: 'هل تريد تسجيل الخروج؟',
        text: 'لقد قمت بالضغط على زر الرجوع في المتصفح. هل ترغب بإنهاء الجلسة والخروج؟',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0A3A2A',
        cancelButtonColor: '#6e7881',
        confirmButtonText: 'نعم، تسجيل الخروج',
        cancelButtonText: 'البقاء في لوحة التحكم',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.clear();
          sessionStorage.clear();
          navigate('/login', { replace: true });

          Swal.fire({
            icon: 'success',
            title: 'تم تسجيل الخروج بنجاح',
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  return (
    <Box style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa', direction: 'rtl' }}>
      
      {/* الشريط الجانبي الثابت (عرضه 280px) */}
      <Sidebar />

      {/* منطقة المحتوى والشريط العلوي - تم ضبط الـ marginRight ليكون 280px تماماً ليناسب عرض القائمة */}
      <Box style={{ flex: 1, marginRight: '280px', display: 'flex', flexDirection: 'column', width: 'calc(100% - 280px)' }}>
        
        {/* الشريط العلوي */}
        <DashboardNavbar />

        {/* عرض الصفحات المتغيرة */}
        <Box p="lg" style={{ flex: 1 }}>
          <Outlet />
        </Box>

      </Box>
    </Box>
  );
}