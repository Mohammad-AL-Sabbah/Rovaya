// src/components/welcome/Footer.jsx
import { Box, Container, Text, Button, Group, Divider } from '@mantine/core';
import { 
  IconMail, IconPhone, IconMapPin, 
  IconBrandFacebook, IconBrandInstagram, IconBrandTwitter,
  IconPlus, IconArrowLeft, IconBrandTiktok, IconChevronLeft
} from '@tabler/icons-react';
import classes from './Footer.module.css';

export function Footer() {
  const quickLinks = [
    { label: 'الرئيسية', link: '/' },
    { label: 'المدن', link: '/cities' },
    { label: 'الأماكن السياحية', link: '/tourist-places' },
    { label: 'المطاعم', link: '/restaurants' },
    { label: 'الفنادق', link: '/hotels' },
    { label: 'مخطط الرحلات', link: '/trip-planner' },
  ];

  const socialLinks = [
    { icon: IconBrandFacebook, label: 'Facebook' },
    { icon: IconBrandInstagram, label: 'Instagram' },
    { icon: IconBrandTwitter, label: 'Twitter' },
    { icon: IconBrandTiktok, label: 'TikTok' },
  ];

  return (
    <Box className={classes.footer}>
      {/* ===== Top Section - CTA (لا تغيره) ===== */}
      <Box className={classes.topSection}>
        <Box className={classes.bgImage}>
          <img src="/FooterImage.png" alt="Palestine" />
        </Box>
        <Box className={classes.overlay} />

        <Container size="xl" className={classes.topContent}>
          <Box className={classes.subtitleWrapper}>
            <Box className={classes.line} />
            <Text className={classes.topSubtitle}>اكتشف واحجز</Text>
            <Box className={classes.line} />
          </Box>

          <Text className={classes.topTitle}>
            اكتشف فلسطين ... بطريقة أذكى
          </Text>

          <Text className={classes.topDescription}>
    ROVAYA    لتجربة سياحية فريدة إنضم الى الاف المسافرين الذين يختارون 
          </Text>

          
        </Container>
      </Box>

      {/* ===== Bottom Section - Redesigned ===== */}
      <Box className={classes.bottomSection} id="footer">
        <Container size="xl">
          <div className={classes.bottomContent}>
            {/* Column 1: About (Right) */}
            <div className={classes.column}>
              <Text className={classes.columnTitle}>عن ROVAYA</Text>
              <Text className={classes.columnText}>
                منصة سياحية ذكية تهدف لتسهيل تجربة السائح في فلسطين من خلال تقنيات الذكاء الاصطناعي والخرائط التفاعلية.
              </Text>
              <Group gap="xs" mt="md" className={classes.socialGroup}>
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <Box key={index} className={classes.socialIcon}>
                      <Icon size={16} color="#27C48E" />
                    </Box>
                  );
                })}
              </Group>
            </div>

            {/* Column 2: Quick Links (Center) - Horizontal */}
            <div className={classes.column}>
              <Text className={classes.columnTitle}>روابط سريعة</Text>
              <div className={classes.linksGrid}>
                {quickLinks.map((link, index) => (
                  <Box key={index} className={classes.linkItem}>
                    <IconChevronLeft size={12} color="#27C48E" />
                    <Text className={classes.linkText}>{link.label}</Text>
                  </Box>
                ))}
              </div>
            </div>

            {/* Column 3: Contact (Left) */}
            <div className={classes.column}>
              <Text className={classes.columnTitle}>تواصل معنا</Text>
              <div className={classes.contactInfo}>
                <div className={classes.contactRow}>
                  <div className={classes.contactIconWrapper}>
                    <IconPhone size={16} color="#27C48E" />
                  </div>
                  <div className={classes.contactDetails}>
                    <Text className={classes.contactLabel}>اتصل بنا</Text>
                    <Text className={classes.contactValue}>+970 599 123 456</Text>
                  </div>
                </div>

                <div className={classes.contactRow}>
                  <div className={classes.contactIconWrapper}>
                    <IconMail size={16} color="#27C48E" />
                  </div>
                  <div className={classes.contactDetails}>
                    <Text className={classes.contactLabel}>البريد الإلكتروني</Text>
                    <Text className={classes.contactValue}>info@rovaya.ps</Text>
                  </div>
                </div>

                <div className={classes.contactRow}>
                  <div className={classes.contactIconWrapper}>
                    <IconMapPin size={16} color="#27C48E" />
                  </div>
                  <div className={classes.contactDetails}>
                    <Text className={classes.contactLabel}>العنوان</Text>
                    <Text className={classes.contactValue}>رام الله، فلسطين</Text>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Divider className={classes.divider} />

          {/* Copyright */}
          <div className={classes.copyright}>
            <Text className={classes.copyrightText}>
              © 2026 ROVAYA. جميع الحقوق محفوظة. تأسست في فلسطين 🇵🇸
            </Text>
            <Group gap="md">
              <Text className={classes.copyrightLink}>سياسة الخصوصية</Text>
              <Text className={classes.copyrightLink}>الشروط والأحكام</Text>
            </Group>
          </div>
        </Container>
      </Box>
    </Box>
  );
}