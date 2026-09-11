// src/components/welcome/WhyRovaya.jsx
import { Box, Container, Text } from '@mantine/core';
import { IconShield, IconCpu, IconMap, IconStar } from '@tabler/icons-react';
import classes from './WhyRovaya.module.css';

export function WhyRovaya() {
  const features = [
    { icon: IconShield, title: 'معلومات موثوقة', subtitle: '' },
    { icon: IconCpu, title: 'تقنيات الذكاء الاصطناعي', subtitle: '' },
    { icon: IconMap, title: 'خرائط تفاعلية', subtitle: 'ومواقع دقيقة' },
    { icon: IconStar, title: 'تجارب مخصصة', subtitle: 'حسب اهتماماتك' },
  ];

  // Smooth organic blob shape
  const blobPath = "M150,30 C250,10 350,30 420,80 C480,130 490,220 460,300 C430,380 380,440 300,460 C220,480 140,460 80,400 C20,340 10,250 30,170 C50,90 80,50 150,30 Z";

  // Brush stroke shape for sticker
  const brushPath = "M15,55 C25,35 50,25 90,22 C140,18 200,20 250,28 C275,32 290,40 290,50 C290,60 275,68 250,72 C200,78 140,80 90,78 C50,76 25,70 15,55 Z";

  return (
    <Box className={classes.section} id="whyRovaya">
      <Container size="xl" className={classes.container}>
        {/* Right Side - Image with Blob */}
        <Box className={classes.imageSide}>
          {/* Green Blob Background */}
          <Box className={classes.blobBackground}>
            <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d={blobPath} fill="#B8E6D0" opacity="0.7" />
            </svg>
          </Box>

          {/* Main Image with Blob Shape */}
          <Box className={classes.imageWrapper}>
            <svg className={classes.blobShape} viewBox="0 0 500 500" preserveAspectRatio="xMidYMid slice">
              <defs>
                <clipPath id="blobClip">
                  <path d={blobPath} />
                </clipPath>
              </defs>
              <image
                href="/WhyRovaya.png"
                width="500"
                height="500"
                clipPath="url(#blobClip)"
                preserveAspectRatio="xMidYMid slice"
              />
            </svg>
          </Box>

          {/* Brush Stroke Sticker */}
          <Box className={classes.sticker}>
            <svg viewBox="0 0 300 90" className={classes.brushSvg} preserveAspectRatio="none">
              {/* Main brush stroke */}
              <path d={brushPath} fill="#B8E6D0" />
              {/* Rough edges effect */}
              <path d="M10,55 C30,40 60,30 100,28 C150,25 210,28 260,35 C280,38 290,45 288,52" 
                    stroke="#A8DCC0" strokeWidth="2" fill="none" opacity="0.5"/>
              <path d="M15,58 C35,45 70,35 110,32 C160,28 220,32 270,40 C285,43 292,48 290,55" 
                    stroke="#C8ECD8" strokeWidth="1.5" fill="none" opacity="0.4"/>
              {/* Underline stroke */}
              <path d="M110,72 C140,70 180,71 220,73" 
                    stroke="#27C48E" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </svg>
            <Box className={classes.stickerContent}>
              <Text className={classes.stickerText}>
                اكتشف فلسطين
                <br />
                بطريقتك
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Left Side - Content */}
        <Box className={classes.contentSide}>
          <Box className={classes.subtitleWrapper}>
            <Box className={classes.line} />
            <Text className={classes.subtitle}>لماذا نختار Rovaya</Text>
            <Box className={classes.line} />
          </Box>

          <Text className={classes.title}>تجربة سياحية متكاملة في مكان واحد</Text>

          <Text className={classes.description}>
            نوفر لك كل ما تحتاجه لتنظيم رحلتك واستكشاف فلسطين بطريقة ذكية وسهلة.
            من المعلومات الموثوقة إلى الأدلة التفاعلية وحتى الخرائط التفاعلية في التطبيقات الحقيقية.
          </Text>

          <Box className={classes.featuresGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Box key={index} className={classes.featureCard}>
                  <Box className={classes.featureIconWrapper}>
                    <Icon size={32} color="#27C48E" />
                  </Box>
                  <Text className={classes.featureTitle}>{feature.title}</Text>
                  <Text className={classes.featureSubtitle}>{feature.subtitle}</Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}