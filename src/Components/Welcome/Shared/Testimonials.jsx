// src/components/welcome/Testimonials.jsx
import { Box, Container, Text, SimpleGrid } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';
import classes from './Testimonials.module.css';

export function Testimonials() {
  const testimonials = [
    {
      name: 'سارة أحمد',
      location: 'مسافرة من السعودية',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'تجربة رائعة! المنصة ساعدتني في تنظيم رحلتي إلى القدس بكل سهولة، والمعلومات كانت دقيقة ومفيدة جداً.',
    },
    {
      name: 'أحمد خالد',
      location: 'أردني',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'أفضل منصة سياحية استخدمتها على الإطلاق، مساعدة الذكاء الاصطناعي كانت مفيدة بشكل كبير في اختيار الأماكن المناسبة لي.',
    },
    {
      name: 'ليلى محمود',
      location: 'مسافرة',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'كل شيء في مكان واحد! من الفنادق والمطاعم إلى الرحلات والأنشطة، أصبح بهذا المكان بدون مساومة.',
    },
  ];

  return (
    <Box className={classes.section} id="testimonials">
      {/* Background Sketches */}
      <Box className={classes.bgSketches}>
        <svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMid slice" className={classes.sketchSvg}>
          {/* Left side buildings */}
          <rect x="50" y="220" width="40" height="60" stroke="#d8d4cc" strokeWidth="1" fill="none"/>
          <path d="M60,220 Q70,200 80,220" stroke="#d8d4cc" strokeWidth="1" fill="none"/>
          <rect x="110" y="200" width="50" height="80" stroke="#d8d4cc" strokeWidth="1" fill="none"/>
          <path d="M125,200 Q135,180 145,200" stroke="#d8d4cc" strokeWidth="1" fill="none"/>
          
          {/* Middle buildings */}
          <rect x="300" y="230" width="45" height="50" stroke="#d8d4cc" strokeWidth="1" fill="none"/>
          <rect x="380" y="210" width="55" height="70" stroke="#d8d4cc" strokeWidth="1" fill="none"/>
          
          {/* Right side buildings */}
          <rect x="1200" y="220" width="50" height="60" stroke="#d8d4cc" strokeWidth="1" fill="none"/>
          <path d="M1215,220 Q1225,200 1235,220" stroke="#d8d4cc" strokeWidth="1" fill="none"/>
          <rect x="1280" y="200" width="45" height="80" stroke="#d8d4cc" strokeWidth="1" fill="none"/>
          <rect x="1350" y="230" width="40" height="50" stroke="#d8d4cc" strokeWidth="1" fill="none"/>
          
          {/* Palm trees */}
          <path d="M200,280 L200,250 M190,260 L200,250 L210,260" stroke="#d8d4cc" strokeWidth="1" fill="none"/>
          <path d="M1100,280 L1100,250 M1090,260 L1100,250 L1110,260" stroke="#d8d4cc" strokeWidth="1" fill="none"/>
        </svg>
      </Box>

      <Container size="xl" className={classes.container}>
        {/* Header */}
        <Box className={classes.header}>
          <Box className={classes.subtitleWrapper}>
            <Box className={classes.line} />
            <Text className={classes.subtitle}>آراء المسافرين</Text>
            <Box className={classes.line} />
          </Box>
          <Text className={classes.title}>ماذا يقول زوارنا؟</Text>
        </Box>

        {/* Testimonials Grid */}
        <SimpleGrid cols={3} spacing="lg" className={classes.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <Box key={index} className={classes.testimonialCard}>
              {/* Quote Icon */}
              <Box className={classes.quoteIcon}>"</Box>

              {/* Review Text */}
              <Text className={classes.reviewText}>{testimonial.text}</Text>

              {/* User Info */}
              <Box className={classes.userInfo}>
                <Box className={classes.userDetails}>
                  <Text className={classes.userName}>{testimonial.name}</Text>
                  <Text className={classes.userLocation}>{testimonial.location}</Text>
                  
                  {/* Stars */}
                  <Box className={classes.stars}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <IconStar key={i} size={16} color="#27C48E" fill="#27C48E" />
                    ))}
                  </Box>
                </Box>
                
                {/* Profile Image */}
                <Box className={classes.userImage}>
                  <img src={testimonial.image} alt={testimonial.name} />
                </Box>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      {/* Bottom Wave */}
      <Box className={classes.bottomWave}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,60 C240,40 480,80 720,60 C960,40 1200,80 1440,60 L1440,120 L0,120 Z"
            fill="rgba(39, 196, 142, 0.1)"
          />
        </svg>
      </Box>
    </Box>
  );
}