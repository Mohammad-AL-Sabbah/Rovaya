import { useState } from 'react';
import { Box, NavLink, Text } from '@mantine/core';
import { 
  IconDashboard, 
  IconMapPin, 
  IconUsers, 
  IconTicket, 
  IconLogout, 
  IconChevronDown, 
  IconChevronLeft,
  IconStar,
  IconBook,
  IconSettings,
  IconNews,
  IconUserShield,
  IconUser,
  IconFileAnalytics // ✅ أيقونة سجل الرقابة والتدقيق
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // حالة فتح وإغلاق قائمة المستخدمين المنسدلة
  const [usersOpened, setUsersOpened] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: 'هل تريد تسجيل الخروج؟',
      text: 'سيتم إنهاء الجلسة الحالية وإرجاعك للصفحة الرئيسية.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0A3A2A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'نعم، قم بالخروج',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login', { replace: true });
        Swal.fire({
          icon: 'success',
          title: 'تم تسجيل الخروج بنجاح',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  };

  // ستايل موحد لعناصر القائمة لضمان المسافات والشكل الجمالي
  const navLinkStyle = (isActive) => ({
    borderRadius: '12px',
    marginBottom: '6px',
    fontWeight: isActive ? 600 : 500,
    backgroundColor: isActive ? '#0A3A2A' : 'transparent',
    color: isActive ? '#ffffff' : '#334155',
    '&:hover': {
      backgroundColor: isActive ? '#0A3A2A' : '#f1f5f9',
    },
  });

  return (
    <Box 
      style={{ 
        width: 280, 
        height: '100vh', 
        background: '#ffffff', 
        borderLeft: '1px solid #e2e8f0', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'fixed', 
        right: 0, 
        top: 0,
        boxShadow: '-4px 0 15px rgba(0,0,0,0.03)',
        direction: 'rtl',
        zIndex: 100
      }}
    >
      {/* رأس القائمة والشعار */}
      <Box 
        px="lg" 
        style={{ 
          height: 75,
          backgroundColor: '#0A3A2A', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          borderBottom: '1px solid #06241A'
        }}
      >
        <Text fw={900} size="md" c="white" style={{ letterSpacing: '1px' }}>ROVAYA ADMIN</Text>
        <Text size="14px" c="rgba(255,255,255,0.75)">لوحة التحكم والإدارة لروڤايا</Text>
      </Box>

      {/* محتوى القائمة مع التمرير والأقسام المقسمة */}
      <Box style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        
        {/* --- 1. القائمة العامة --- */}
        <Text size="xs" fw={700} c="dimmed" mb="xs" px="sm" tt="uppercase">القائمة العامة</Text>
        <NavLink
          label="الرئيسية (الإحصائيات)"
          leftSection={<IconDashboard size={20} stroke={1.5} />}
          active={location.pathname === '/control-panel'}
          onClick={() => navigate('/control-panel')}
          color="teal"
          style={navLinkStyle(location.pathname === '/control-panel')}
        />

        <div style={{ margin: '12px 0', borderTop: '1px solid #f1f5f9' }} />

        {/* --- 2. الإدارة التشغيلية --- */}
        <Text size="xs" fw={700} c="dimmed" mb="xs" px="sm" tt="uppercase">الإدارة التشغيلية</Text>
        
        {/* قسم المستخدمين (Collapse) */}
        <NavLink
          label="المستخدمين"
          leftSection={<IconUsers size={20} stroke={1.5} />}
          rightSection={
            usersOpened ? <IconChevronDown size={16} stroke={1.5} /> : <IconChevronLeft size={16} stroke={1.5} />
          }
          opened={usersOpened}
          onChange={() => setUsersOpened(!usersOpened)}
          style={{
            borderRadius: '12px',
            marginBottom: '6px',
            fontWeight: 500,
            color: '#334155',
            '&:hover': { backgroundColor: '#f1f5f9' }
          }}
        >
          <Box pt={4} pb={4} pr="md">
            <NavLink
              label="إدارة الموظفين"
              leftSection={<IconUserShield size={16} stroke={1.5} />}
              active={location.pathname === '/control-panel/employees'}
              onClick={() => navigate('/control-panel/employees')}
              style={navLinkStyle(location.pathname === '/control-panel/employees')}
            />
            <NavLink
              label="السياح"
              leftSection={<IconUser size={16} stroke={1.5} />}
              active={location.pathname === '/control-panel/tourists'}
              onClick={() => navigate('/control-panel/tourists')}
              style={navLinkStyle(location.pathname === '/control-panel/tourists')}
            />
          </Box>
        </NavLink>

      

        <NavLink
          label="التوصيات (Recommendations)"
          leftSection={<IconStar size={20} stroke={1.5} />}
          active={location.pathname === '/control-panel/recommendations'}
          onClick={() => navigate('/control-panel/recommendations')}
          style={navLinkStyle(location.pathname === '/control-panel/recommendations')}
        />

        <div style={{ margin: '12px 0', borderTop: '1px solid #f1f5f9' }} />

        {/* --- 3. المحتوى والدليل --- */}
        <Text size="xs" fw={700} c="dimmed" mb="xs" px="sm" tt="uppercase">المحتوى والنشر</Text>
        
        <NavLink
          label="الدليل السياحي"
          leftSection={<IconBook size={20} stroke={1.5} />}
          active={location.pathname === '/control-panel/guide'}
          onClick={() => navigate('/control-panel/guide')}
          style={navLinkStyle(location.pathname === '/control-panel/guide')}
        />

        <NavLink
          label="الأخبار والأحداث"
          leftSection={<IconNews size={20} stroke={1.5} />}
          active={location.pathname === '/control-panel/news'}
          onClick={() => navigate('/control-panel/news')}
          style={navLinkStyle(location.pathname === '/control-panel/news')}
        />

        <div style={{ margin: '12px 0', borderTop: '1px solid #f1f5f9' }} />

        {/* --- 4. الدعم والنظام --- */}
        <Text size="xs" fw={700} c="dimmed" mb="xs" px="sm" tt="uppercase">النظام</Text>
        
        {/* ✅ رابط سجل الرقابة الجديد */}
        <NavLink
          label="سجل الرقابة (Audit)"
          leftSection={<IconFileAnalytics size={20} stroke={1.5} />}
          active={location.pathname === '/control-panel/audit'}
          onClick={() => navigate('/control-panel/audit')}
          style={navLinkStyle(location.pathname === '/control-panel/audit')}
        />

        <NavLink
          label="الإعدادات"
          leftSection={<IconSettings size={20} stroke={1.5} />}
          active={location.pathname === '/control-panel/settings'}
          onClick={() => navigate('/control-panel/settings')}
          style={navLinkStyle(location.pathname === '/control-panel/settings')}
        />

      </Box>

      {/* زر تسجيل الخروج السفلي */}
      <Box p="md" style={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
        <NavLink
          label="تسجيل الخروج"
          leftSection={<IconLogout size={20} stroke={1.5} />}
          onClick={handleLogout}
          style={{
            borderRadius: '10px',
            color: '#fa5252',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#fff5f5' }
          }}
        />
      </Box>
    </Box>
  );
}