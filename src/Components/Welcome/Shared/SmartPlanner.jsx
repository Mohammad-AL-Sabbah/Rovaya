// src/components/welcome/SmartPlanner.jsx
import { Box, Container, Text, Button } from '@mantine/core';
import {
  IconMapPin, IconUsers, IconCalendar, IconWallet, IconHeart,
  IconCheck, IconChevronDown
} from '@tabler/icons-react';
import { useInView } from './useInView';
import classes from './SmartPlanner.module.css';

export function SmartPlanner() {
  const [sectionRef, inView] = useInView();

  const plannerFields = [
    { icon: IconMapPin, label: 'الوجهة', value: 'أين؟', dark: false },
    { icon: IconUsers, label: 'عدد الأشخاص', value: 'واحد واحد', dark: false },
    { icon: IconCalendar, label: 'مدة الرحلة', value: 'تحدد واحدة', dark: false },
    { icon: IconWallet, label: 'الميزانية', value: 'متوسطة', dark: false },
    { icon: IconHeart, label: 'اهتماماتك', value: 'تاريخية، ثقافية، مطاعم شعبية', dark: true },
  ];

  const advantages = [
    'الأماكن المقترحة للزيارة',
    'ترتيب الزيارات حسب الوقت',
    'المطاعم المناسبة',
    'التكلفة التقديرية',
    'المسار على الخريطة',
  ];

  return (
    <Box
      ref={sectionRef}
      className={`${classes.section} ${inView ? classes.inView : classes.pending}`}
    >
      <Container size="xl" className={classes.container} id="planner">
        {/* Right Side - Text Content */}
        <Box className={classes.textSide}>
          {/* Subtitle with lines */}
          <Box className={classes.subtitleWrapper}>
            <Box className={classes.line} />
            <Text
              className={`${classes.subtitle} ${classes.reveal}`}
              style={{ '--d': '0.15s' }}
            >
              ميزة أساسية في منصتنا
            </Text>
            <Box className={classes.line} />
          </Box>

          {/* Main Title */}
          <Text
            className={`${classes.title} ${classes.reveal}`}
            style={{ '--d': '0.25s' }}
          >
            مخطط الرحلات الذكي
          </Text>

          {/* Description */}
          <Text
            className={`${classes.description} ${classes.reveal}`}
            style={{ '--d': '0.4s' }}
          >
            بناء على ميزانيتك واهتماماتك ، يساعدك المخطط الذكي في تجميع الزيارات وتحديد المواقع والوجهات المناسبة لك.
          </Text>

          {/* Advantages List */}
          <Box className={classes.advantagesList}>
            {advantages.map((item, index) => (
              <Box
                key={index}
                className={`${classes.advantageItem} ${classes.reveal} ${classes.slideIn}`}
                style={{ '--i': index, '--d': '0.55s' }}
              >
                <Text className={classes.advantageText}>{item}</Text>
                <Box className={classes.checkIcon}>
                  <IconCheck size={14} color="white" />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Left Side - Image with Floating Card */}
        <Box className={classes.imageSide}>
          <Box className={classes.imageWrapper}>
            <img src="/SmartPlanner.png" alt="Smart Planner" className={classes.mainImage} />

            {/* Floating Planner Card */}
            <Box className={classes.floatingCard}>
              <Box className={classes.fieldsList}>
                {plannerFields.map((field, index) => {
                  const Icon = field.icon;
                  return (
                    <Box
                      key={index}
                      className={`${classes.fieldRow} ${classes.reveal} ${classes.rowIn}`}
                      style={{ '--i': index, '--d': '1.05s' }}
                    >
                      <Box className={classes.fieldRight}>
                        <Box className={`${classes.fieldIcon} ${field.dark ? classes.fieldIconDark : ''}`}>
                          <Icon size={16} color={field.dark ? 'white' : '#27C48E'} />
                        </Box>
                        <Box className={classes.fieldContent}>
                          <Text className={classes.fieldLabel}>{field.label}</Text>
                          <Text className={classes.fieldValue}>{field.value}</Text>
                        </Box>
                      </Box>
                      <IconChevronDown size={16} color="#999" />
                    </Box>
                  );
                })}
              </Box>

              <Button
                className={`${classes.createPlanBtn} ${classes.reveal}`}
                style={{ '--d': '1.7s' }}
                radius="xl"
              >
                إنشاء خطة الرحلة من خلال تطبيقنا
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}