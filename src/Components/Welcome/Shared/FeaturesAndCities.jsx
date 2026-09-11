// src/components/welcome/FeaturesAndCities.jsx
import { Box, Container, Text, SimpleGrid, Card } from '@mantine/core';
import { IconMap, IconRoute, IconMessage, IconLocation } from '@tabler/icons-react';
import classes from './FeaturesAndCities.module.css';

export function FeaturesAndCities() {
  const features = [
    {
      icon: IconMap,
      title: 'اكتشف المدن والأماكن',
      description: 'استعرض أجمل المدن والأماكن السياحية والمعالم التاريخية في فلسطين',
    },
    {
      icon: IconRoute,
      title: 'خطط رحلتك مع الذكاء الاصطناعي',
      description: 'احصل على برنامج رحلة مخصص حسب اهتماماتك وميزانيتك',
    },
    {
      icon: IconMessage,
      title: 'مساعد سياحي ذكي',
      description: 'اسأل أي شيء عن فلسطين واحصل على إجابات فورية ومفيدة',
    },
    {
      icon: IconLocation,
      title: 'خرائط ومواقع قريبة',
      description: 'اكتشف المواقع على الخريطة واستكشف الأماكن القريبة منك',
    },
  ];

  const cities = [
    {
      name: 'القدس',
      image: 'https://www.aljazeera.net/wp-content/uploads/2024/04/shutterstock_1322533958-1713173341.jpg?w=770&resize=770%2C511&quality=80',
      description: 'قبلة المسلمين الأولى وبوابة السماء',
    },
    {
      name: 'بيت لحم',
      image: 'https://cdn.eremnews.io/media/ae3335ed-3022-428b-84ca-34a02f31f8bf',
      description: 'مهد السلام وبوابة البشارة للعالم',
    },
    {
      name: 'نابلس',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHZQZUs88VcNuKMwMV4vwjxpZTPRKVjcvloAL2lBV2ebiqjyH5ePeRbNE&s=10',
      description: 'جبل النار وحارسة التراث ودمشق الصغرى',
    },
    {
      name: 'الخليل',
      image: 'https://info.wafa.ps/image/NewsContentImg/64eec42a-8f15-4d28-894f-56f28f14e301.png',
      description: 'حارسة الحرم وموطن الصناعات العريقة',
    },
    {
      name: 'حيفا',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSahzzE4-HXBbVDKw-XEls2RTwFwFDSTDglbgRBauNlGhcM1AwLqALjn4z0&s=10',
      description: 'عروس المتوسط وسيدة الجبل والبحر',
    },
  ];

  return (
    <>
      {/* ===== Features Section ===== */}
      <Box className={classes.featuresSection}>
        <Box className={classes.waveTop}>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              d="M0,60 C240,0 480,120 720,60 C960,0 1200,120 1440,60 L1440,120 L0,120 Z"
              fill="white"
            />
          </svg>
        </Box>

        <Container size="xl" className={classes.featuresContainer}>
          {/* Side Text */}
          <Box className={classes.sideText}>
            <Text className={classes.sideTextMain}>فلسطين...</Text>
            <Text className={classes.sideTextSub}>أكثر من مجرد وجهة</Text>
          </Box>

          {/* Feature Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" className={classes.featuresGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className={classes.featureCard} padding="xl">
                  <Box className={classes.iconWrapper}>
                    <Icon size={36} color="#27C48E" />
                  </Box>
                  <Text className={classes.featureTitle}>{feature.title}</Text>
                  <Text className={classes.featureDescription}>{feature.description}</Text>
                </Card>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ===== Cities Section ===== */}
      <Box className={classes.citiesSection}  id='cities'>
        <Container size="xl">
          <Box className={classes.citiesHeader}>
            <Text className={classes.citiesSubtitle}>استكشف بعض المدن</Text>
            <Text className={classes.citiesMainTitle}>مدن فلسطينية تنتظرك</Text>
          </Box>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="md" className={classes.citiesGrid}>
            {cities.map((city, index) => (
              <Card key={index} className={classes.cityCard} padding={0}>
                <Box className={classes.cityImage}>
                  <img src={city.image} alt={city.name} />
                  <Box className={classes.cityOverlay} />
                </Box>
                <Box className={classes.cityContent}>
                  <Text className={classes.cityName}>{city.name}</Text>
                  <Text className={classes.cityDescription}>{city.description}</Text>
                </Box>
              </Card>
            ))}
          </SimpleGrid>
        </Container>

        {/* Map Decoration */}
        <Box className={classes.mapDecoration}>
          <svg viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100,50 Q120,80 110,120 Q130,150 120,190 Q140,220 130,260 Q120,300 100,330 Q80,300 90,260 Q80,220 100,190 Q90,150 110,120 Q100,80 100,50"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </Box>
      </Box>
    </>
  );
}