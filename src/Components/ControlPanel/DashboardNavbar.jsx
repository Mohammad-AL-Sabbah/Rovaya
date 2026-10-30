import { useState, useEffect } from 'react';
import { Box, Group, Text } from '@mantine/core';
import { IconClock, IconCalendar, IconUser } from '@tabler/icons-react';

export function DashboardNavbar() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const userName = localStorage.getItem('userName') || 'محمد الصباح';
  const userAvatar = localStorage.getItem('userAvatar') || null; 
  
  const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  let roleTitle = 'موظف النظام';
  if (roles.includes('SuperAdmin')) {
    roleTitle = 'مدير النظام';
  } else if (roles.includes('Admin')) {
    roleTitle = 'موظف النظام';
  }

  return (
    <Box 
      style={{ 
        background: '#ffffff', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        height: 75,
        position: 'sticky', // تثبيت النافبار في الأعلى تماماً
        top: 0,             // ليبقى ملتصقاً بأعلى الشاشة أثناء التمرير
        zIndex: 100,        // لضمان ظهوره فوق جميع العناصر الأخرى
        overflow: 'hidden',
        direction: 'rtl'
      }}
    >
      {/* 1. الكتلة الخضراء اليمنى (الملاصقة للسايدبار في اليمين) */}
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
        {/* معلومات المستخدم داخل الكتلة الخضراء */}
        <Group gap="md" style={{ zIndex: 2 }}>
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt={userName}
              style={{ width: 36, height: 36, borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.3)' }}
            />
          ) : (
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <IconUser size={28} stroke={1.8} />
            </Box>
          )}

          <div style={{ textAlign: 'right' }}>
            <Text size="xs" fw={600} c="#ffffff" style={{ lineHeight: 1.3 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>الإسم: </span>
              <span style={{ fontWeight: 700, color: '#ffffff' }}>{userName}</span>
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
        {/* الوقت والتاريخ داخل الكتلة الخضراء اليسرى */}
        <Group gap="md" style={{ zIndex: 2 }}>
          <Group gap={6}>
            <IconCalendar size={17} color="#ffffff" stroke={1.8} />
            <Text size="xs" fw={600} c="#ffffff">
              {currentDateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </Group>
          <Box style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <Group gap={6}>
            <IconClock size={17} color="#ffffff" stroke={1.8} />
            <Text size="xs" fw={600} c="#ffffff">
              {currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Group>
        </Group>
      </Box>

      {/* 3. شعار Rovaya السياحي في المنتصف تماماً على الخلفية البيضاء */}
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