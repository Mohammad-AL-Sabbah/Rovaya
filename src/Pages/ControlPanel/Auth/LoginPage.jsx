// src/pages/LoginPage.jsx
import { useState } from 'react';
import { 
  Box, 
  Container, 
  TextInput, 
  PasswordInput, 
  Button, 
  Text, 
  Group, 
  Anchor,
  Checkbox,
  Title,
  Paper,
  Alert
} from '@mantine/core';
import { 
  IconMail, 
  IconLock, 
  IconArrowRight,
  IconShieldCheck,
  IconDashboard,
  IconUsers,
  IconMapPin,
  IconInfoCircle,
  IconCheck
} from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import classes from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    console.log('Login data:', data);
    
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/control-panel');
      }, 1500);
    }, 1200);
  };

  return (
    <Box className={classes.loginPage}>
      {/* Left Side - Login Form */}
      <Box className={classes.formSide}>
        <Container size="sm" className={classes.formContainer}>
          {/* Back Button */}
          <Box className={classes.backButton} onClick={() => navigate('/')}>
            <IconArrowRight size={18} />
            <Text className={classes.backText}>العودة للرئيسية</Text>
          </Box>

          {/* Form Header */}
          <Box className={classes.formHeader}>
            <Text className={classes.formTitle}>تسجيل الدخول</Text>
            <Text className={classes.formSubtitle}>
              أدخل بياناتك للوصول إلى لوحة التحكم
            </Text>
          </Box>

          {/* Success Alert */}
          {showSuccess && (
            <Alert 
              icon={<IconCheck size={18} />} 
              title="تم بنجاح!" 
              color="green" 
              className={classes.successAlert}
            >
              جاري تحويلك إلى لوحة التحكم...
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className={classes.loginForm}>
            {/* Email Field */}
            <TextInput
              label="البريد الإلكتروني"
              placeholder="employee@rovaya.ps"
              type="email"
              leftSection={<IconMail size={20} stroke={1.5} />}
              className={classes.inputField}
              error={errors.email?.message}
              {...register('email', { 
                required: 'البريد الإلكتروني مطلوب',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'البريد الإلكتروني غير صالح'
                }
              })}
            />

            {/* Password Field */}
            <PasswordInput
              label="كلمة المرور"
              placeholder="••••••••"
              leftSection={<IconLock size={20} stroke={1.5} />}
              className={classes.inputField}
              error={errors.password?.message}
              {...register('password', { 
                required: 'كلمة المرور مطلوبة',
                minLength: {
                  value: 6,
                  message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
                }
              })}
            />

            {/* Remember Me & Forgot Password */}
            <Group justify="space-between" className={classes.formOptions}>
              <Checkbox
                label="تذكرني"
                className={classes.rememberCheckbox}
                {...register('rememberMe')}
              />
              <Anchor className={classes.forgotLink}>
                نسيت كلمة المرور؟
              </Anchor>
            </Group>

            {/* Submit Button */}
            <Button
              type="submit"
              className={classes.submitButton}
              loading={loading}
              fullWidth
              mt="xs"
            >
              دخول
            </Button>

          
          </form>
        </Container>
      </Box>

      {/* Right Side - Branding */}
      <Box className={classes.imageSide}>
        <Box className={classes.imageOverlay} />
        
        <Box className={classes.brandingContent}>
          <Box className={classes.logoBox}>
            <Box className={classes.logoIcon}>
              <IconShieldCheck size={32} color="white" />
            </Box>
            <Box>
              <Text className={classes.brandName}>ROVAYA</Text>
              <Text className={classes.brandSubtext}>Discover Palestine</Text>
            </Box>
          </Box>

          <Box className={classes.brandingText}>
            <Title className={classes.brandingTitle}>
              بوابة الموظفين
            </Title>
            <Text className={classes.brandingDescription}>
              مرحباً بك في لوحة تحكم ROVAYA.
              <br />
              سجّل دخولك لإدارة المحتوى والبيانات السياحية.
            </Text>
          </Box>

          <Box className={classes.featuresList}>
            <Box className={classes.featureItem}>
              <Box className={classes.featureIcon}>
                <IconDashboard size={18} />
              </Box>
              <Text className={classes.featureText}>إدارة الحجوزات والطلبات</Text>
            </Box>
            <Box className={classes.featureItem}>
              <Box className={classes.featureIcon}>
                <IconMapPin size={18} />
              </Box>
              <Text className={classes.featureText}>تحديث الأماكن السياحية</Text>
            </Box>
            <Box className={classes.featureItem}>
              <Box className={classes.featureIcon}>
                <IconUsers size={18} />
              </Box>
              <Text className={classes.featureText}>متابعة تقارير المستخدمين</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}