// src/pages/LoginPage.jsx
import { useState ,   useEffect } from 'react';
import Swal from 'sweetalert2';
import API from '../../../API/ApiAuthToken';
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

// src/pages/LoginPage.jsx

// ... (الكود السابق)

const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await API.post('/api/auth/account/login', {
        email: data.email,
        password: data.password
      });

      const token = response.data.accessToken;
      const roles = response.data.roles || []; 

      // التحقق من الصلاحيات
      if (roles.includes('Customer') && !roles.includes('Admin') && !roles.includes('SuperAdmin')) {
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'غير مسموح بالدخول',
          text: 'عذراً، حسابك لا يملك صلاحية الدخول الى لوحة التحكم.',
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#10b981'
        });
        return; 
      }

      // ✅ تخزين بيانات المشرف/الموظف بشكل كامل وصحيح
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('userRoles', JSON.stringify(roles));
        
        // ✅ استخدام trim() لإزالة المسافات الزائدة من البداية والنهاية
        localStorage.setItem('userName', (response.data.firstName || '').trim());
        localStorage.setItem('lastName', (response.data.lastName || '').trim()); // ✅ إضافة lastName
        localStorage.setItem('userEmail', (response.data.email || '').trim());
        
        // إذا كان الـ Backend يرجع صورة البروفايل في الـ Login Response، احفظها هنا
        if (response.data.profileImageUrl) {
            localStorage.setItem('userAvatar', response.data.profileImageUrl);
        }
      }

      setLoading(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/control-panel', { replace: true });
      }, 1500);

    } catch (err) {
      setLoading(false);
      console.error('Login error:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'خطأ في تسجيل الدخول',
        text: err.response?.data?.message || 'تأكد من صحة البريد الإلكتروني أو كلمة المرور',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#d33'
      });
    }
  };


useEffect(() => {
    document.title = "تسجيل الدخول | Rovaya";
    
    // إذا كان المستخدم مسجلاً من قبل ولديه توكن، امنعه من الدخول لصفحة الـ Login وأعحه للوحة التحكم فوراً
    const token = localStorage.getItem('token');
    const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    if (token && (roles.includes('Admin') || roles.includes('SuperAdmin'))) {
      navigate('/control-panel', { replace: true });
    }
  }, [navigate]);

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
  {/* Remember Me & Forgot Password */}
<Group justify="space-between" className={classes.formOptions}>
  <Checkbox
    label="تذكرني"
    className={classes.rememberCheckbox}
    {...register('rememberMe')}
  />
  <Anchor 
    className={classes.forgotLink}
    onClick={() => navigate('/forgot-password')} // ✅ أضف هذا السطر
  >
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