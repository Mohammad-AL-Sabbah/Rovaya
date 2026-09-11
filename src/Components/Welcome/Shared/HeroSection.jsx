// src/components/welcome/HeroSection.jsx
import { useState } from 'react';
import { 
  Box, 
  Container, 
  Group, 
  Button, 
  Text,
  Burger,
  Drawer,
  Stack,
  useMantineTheme 
} from '@mantine/core';
import { 
  IconMapPin, 
  IconCalendar, 
  IconUsers, 
  IconWallet,
  IconSparkles,
  IconDownload
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import classes from './HeroSection.module.css';

export function HeroSection() {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const theme = useMantineTheme();
  const navigate = useNavigate();

  // تم تحديث الروابط لتستخدم IDs للتنقل داخل الصفحة
  const navLinks = [
{ label: 'التقييمات', link: '#testimonials' },
    { label: 'المدن', link: '#cities' },
    { label: 'تواصل معنا', link: '#footer' },
    { label: 'مخطط الرحلات', link: '#planner' },
    { label: 'لماذا نحن ؟', link: '#whyRovaya' },
    { label: 'الرئيسية', link: '/' },
  ];

  const fields = [
    { label: 'المدينة', placeholder: 'اختر المدينة', icon: IconMapPin },
    { label: 'عدد الأشخاص', placeholder: '1 شخص', icon: IconUsers },
    { label: 'مدة الرحلة', placeholder: 'اختر المدة', icon: IconCalendar },
    { label: 'الميزانية', placeholder: 'اختر الميزانية', icon: IconWallet },
  ];

  // دالة للتعامل مع النقر على الروابط (تمرير سلس للـ IDs أو تنقل للروابط العادية)
  const handleLinkClick = (link) => {
    if (link.startsWith('#')) {
      const element = document.querySelector(link);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(link);
    }
    setDrawerOpened(false); // إغلاق القائمة في الموبايل بعد النقر
  };

  return (
    <Box className={classes.hero}>
      <Box className={classes.overlay} />

      {/* Navbar */}
      <Box className={classes.nav}>
        {/* Logo */}
        <Group gap="xs" visibleFrom="sm">
          <Box className={classes.logoIcon}>
            <IconMapPin size={22} color="white" />
          </Box>
          <div>
            <Text className={classes.brandName}>ROVAYA</Text>
            <Text className={classes.brandSubtext}>Discover Palestine</Text>
          </div>
        </Group>

        {/* Desktop Navigation */}
        <Group gap={32} visibleFrom="md">
          {navLinks.map((link) => (
            <Box
              key={link.label}
              onClick={() => handleLinkClick(link.link)}
              className={classes.navLink}
            >
              <Text>{link.label}</Text>
            </Box>
          ))}
        </Group>

        {/* Desktop Auth Button */}
        <Group gap="sm" visibleFrom="md">
          <Button
            variant="outline"
            color="white"
            size="sm"
            radius="xl"
            onClick={() => navigate('/login')}
            className={classes.loginButton}
          >
            دخول الموظفين
          </Button>
        </Group>

        {/* Burger Menu */}
        <Burger
          opened={drawerOpened}
          onClick={() => setDrawerOpened(!drawerOpened)}
          size="sm"
          color="white"
          hiddenFrom="md"
        />

        {/* Drawer */}
        <Drawer
          opened={drawerOpened}
          onClose={() => setDrawerOpened(false)}
          size="100%"
          padding="md"
          position="left"
          title={
            <Group gap="sm">
              <IconMapPin size={24} color="#27C48E" />
              <Text fw={700}>ROVAYA</Text>
            </Group>
          }
          hiddenFrom="md"
        >
          <Stack gap="sm" mt="xl">
            {navLinks.map((link) => (
              <Button
                key={link.label}
                variant="subtle"
                size="lg"
                justify="flex-start"
                onClick={() => handleLinkClick(link.link)}
              >
                {link.label}
              </Button>
            ))}
            <Button
              variant="outline"
              color="teal"
              size="md"
              mt="md"
              onClick={() => handleLinkClick('/login')}
            >
              دخول الموظفين
            </Button>
          </Stack>
        </Drawer>
      </Box>

      {/* Hero Content */}
      <Container size="xl" className={classes.content}>
        <Text className={classes.welcomeText}>مرحباً بك في</Text>

        <Text className={classes.brandTitle}>ROVAYA</Text>

        <Text className={classes.mainTitle}>
          اكتشف فلسطين <span className={classes.highlight}>... بطريقتك</span>
        </Text>

        <Text className={classes.description}>
          من التخطيط إلى التجربة، نقدم لك كل ما تحتاجه لاستكشاف أجمل الأماكن
          <br />
          في فلسطين، بمساعدة الذكاء الاصطناعي.
        </Text>

        {/* Search Box */}
        <Box className={classes.searchBox}>
          {/* Four Fields */}
          <Group gap={12} className={classes.fieldsRow}>
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <Box key={field.label} className={classes.fieldCard}>
                  <Group justify="center" gap={6} mb={4} align="center">
                    <Icon size={20} color="white" opacity={0.9} />
                    <Text className={classes.fieldLabel}>{field.label}</Text>
                  </Group>
                  <Text className={classes.fieldPlaceholder}>
                    {field.placeholder}
                  </Text>
                </Box>
              );
            })}
          </Group>

          {/* AI Text */}
          <Group justify="center" mt={20} gap={8}>
            <IconSparkles size={16} color="white" />
            <Text className={classes.aiText}>
              استخدم الذكاء الاصطناعي لتخطيط رحلتك
            </Text>
          </Group>

          {/* Download App Button */}
          <Group justify="center" mt={24}>
            <Button
              component="a"
              href="#" // سيتم استبدال هذا برابط ملف الـ APK لاحقاً
              className={classes.downloadBtn}
              leftSection={<IconDownload size={18} />}
            >
              حمّل تطبيقنا من هنا
            </Button>
          </Group>
        </Box>
      </Container>

      {/* Wave */}
      <Box className={classes.wave}>
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className={classes.waveSvg}
        >
          <path
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
            fill="white"
          />
        </svg>
      </Box>
    </Box>
  );
}