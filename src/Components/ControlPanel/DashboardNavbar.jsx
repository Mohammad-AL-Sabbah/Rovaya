import { useState, useEffect } from 'react';
import { Box, Group, Text, Avatar } from '@mantine/core';
import { IconClock, IconCalendar, IconUser } from '@tabler/icons-react';
import API from '../../API/ApiAuthToken'; // تأكد من المسار الصحيح

const API_BASE_URL = 'https://rovayabackend.runasp.net';

export function DashboardNavbar() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    avatar: null
  });

  // ✅ دالة لجلب البيانات من الـ API
  const fetchUserData = async () => {
    try {
      const response = await API.get('/api/auth/account/profile');
      if (response.data.success) {
        const data = response.data;
        
        // تحويل المسار النسبي للصورة إلى رابط كامل
        let avatarUrl = null;
        if (data.profileImageUrl) {
          if (data.profileImageUrl.startsWith('http')) {
            avatarUrl = data.profileImageUrl;
          } else {
            avatarUrl = `${API_BASE_URL}${data.profileImageUrl}`;
          }
        }
        
        const userData = {
          firstName: (data.firstName || '').trim(),
          lastName: (data.lastName || '').trim(),
          avatar: avatarUrl
        };
        
        setUserData(userData);
        
        // تحديث localStorage أيضاً
        localStorage.setItem('userName', userData.firstName);
        localStorage.setItem('lastName', userData.lastName);
        localStorage.setItem('userAvatar', data.profileImageUrl || '');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // في حال فشل الطلب، نقرأ من localStorage كاحتياط
      setUserData({
        firstName: localStorage.getItem('userName') || '',
        lastName: localStorage.getItem('lastName') || '',
        avatar: localStorage.getItem('userAvatar') || null
      });
    }
  };

  useEffect(() => {
    // جلب البيانات من API عند التحميل
    fetchUserData();
    
    // تحديث الساعة
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    
    // الاستماع للتحديثات من صفحة الإعدادات
    const handleStorageChange = () => {
      fetchUserData();
    };
    
    window.addEventListener('userDataUpdated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('userDataUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  let roleTitle = 'موظف النظام';
  if (roles.includes('SuperAdmin')) {
    roleTitle = 'مدير النظام';
  } else if (roles.includes('Admin')) {
    roleTitle = 'موظف النظام';
  }

  const getFullName = () => {
    const first = userData.firstName;
    const last = userData.lastName;
    if (first && last) {
      return `${first} ${last}`;
    }
    return first || 'مستخدم';
  };

  return (
    <Box 
      style={{ 
        background: '#ffffff', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        height: 75,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        overflow: 'hidden',
        direction: 'rtl'
      }}
    >
      {/* 1. الكتلة الخضراء اليمنى */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '42%',
          height: '100%',
          backgroundColor: '#0A3A2A',
          clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          paddingRight: '30px'
        }}
      >
        <Group gap="md" style={{ zIndex: 2 }}>
          
          {/* ✅ الأفاتار */}
          <Avatar 
            src={userData.avatar} 
            size={36} 
            radius="sm"
            style={{ border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <IconUser size={20} color="#ffffff" stroke={1.8} />
          </Avatar>

          <div style={{ textAlign: 'right' }}>
            <Text size="xs" fw={600} c="#ffffff" style={{ lineHeight: 1.3 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>الإسم: </span>
              <span style={{ fontWeight: 700, color: '#ffffff' }}>{getFullName()}</span>
            </Text>
            <Text size="xs" fw={600} c="#ffffff" style={{ lineHeight: 1.3, marginTop: '2px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>المنصب: </span>
              <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{roleTitle}</span>
            </Text>
          </div>
        </Group>
      </Box>

      {/* 2. الكتلة الخضراء اليسرى */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '42%',
          height: '100%',
          backgroundColor: '#0A3A2A',
          clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingLeft: '30px'
        }}
      >
        <Group gap="md" style={{ zIndex: 2 }}>
          <Group gap={6}>
            <IconCalendar size={17} color="#ffffff" stroke={1.8} />
            <Text size="xs" fw={600} c="#ffffff">
              {currentDateTime.toLocaleDateString('ar-PS', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </Group>
          <Box style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <Group gap={6}>
            <IconClock size={17} color="#ffffff" stroke={1.8} />
            <Text size="xs" fw={600} c="#ffffff">
              {currentDateTime.toLocaleTimeString('ar-PS', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Group>
        </Group>
      </Box>

      {/* 3. شعار Rovaya */}
      <Box style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 3 }}>
        <Text 
          style={{ 
            fontFamily: "'Playfair Display', 'Georgia', serif", 
            fontSize: '24px', 
            color: '#0A3A2A', 
            letterSpacing: '4px',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
        >
          ROVAYA
        </Text>
        <Text 
          size="8px" 
          c="#64748b" 
          style={{ letterSpacing: '3px', textTransform: 'uppercase', marginTop: '-3px', fontWeight: 600 }}
        >
          Tourism & Travel
        </Text>
      </Box>
    </Box>
  );
}