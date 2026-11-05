import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import API from '../../../API/ApiAuthToken';
import { 
  Box, Container, TextInput, Button, Text, Group, 
  Stepper, Paper, PasswordInput, Alert
} from '@mantine/core';
import { 
  IconMail, IconLock, IconArrowRight, IconCheck, 
  IconKey, IconShieldCheck 
} from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // الخطوة 1: إرسال الكود
  const handleSendCode = async (data) => {
    setLoading(true);
    try {
      const response = await API.post('/api/auth/account/SendCode', {
        email: data.email
      });

      if (response.data.success) {
        setEmail(data.email);
        setActiveStep(1);
        Swal.fire({
          icon: 'success',
          title: 'تم إرسال الكود',
          text: 'تم إرسال كود التحقق إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد والبريد العشوائي.',
          confirmButtonColor: '#0A3A2A',
          timer: 3000
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: response.data.message || 'حدث خطأ أثناء إرسال الكود',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: error.response?.data?.message || 'تأكد من صحة البريد الإلكتروني',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  // الخطوة 2: التحقق من الكود
  const handleVerifyCode = async () => {
    if (!code || code.length < 4) {
      Swal.fire({
        icon: 'warning',
        title: 'كود غير صحيح',
        text: 'يرجى إدخال الكود المكون من 4 أرقام',
        confirmButtonColor: '#d33'
      });
      return;
    }
    setActiveStep(2);
  };

  // الخطوة 3: تغيير كلمة المرور
  const handleResetPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'كلمات المرور غير متطابقة',
        text: 'يرجى التأكد من تطابق كلمات المرور',
        confirmButtonColor: '#d33'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await API.patch('/api/auth/account/ResetPassword', {
        email: email,
        code: code,
        newPassword: data.newPassword
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'تم بنجاح!',
          text: 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
          confirmButtonColor: '#0A3A2A',
          confirmButtonText: 'الذهاب لتسجيل الدخول'
        }).then(() => {
          navigate('/login');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'فشل التغيير',
          text: response.data.message || 'الكود غير صحيح أو منتهي الصلاحية',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Box className={classes.forgotPasswordPage}>
      {/* Left Side - Form */}
      <Box className={classes.formSide}>
        <Container size="sm" className={classes.formContainer}>
          {/* Back Button */}
          <Box className={classes.backButton} onClick={handleBackToLogin}>
            <IconArrowRight size={18} />
            <Text className={classes.backText}>العودة لتسجيل الدخول</Text>
          </Box>

          {/* Form Header */}
          <Box className={classes.formHeader}>
            <Text className={classes.formTitle}>إعادة تعيين كلمة المرور</Text>
            <Text className={classes.formSubtitle}>
              اتبع الخطوات التالية لاستعادة حسابك
            </Text>
          </Box>

          {/* Stepper */}
          <Stepper 
            active={activeStep} 
            onStepClick={setActiveStep} 
            breakpoint="sm"
            className={classes.stepper}
          >
            <Stepper.Step 
              label="البريد الإلكتروني" 
              description="أدخل بريدك"
              icon={<IconMail size={18} />}
            >
              <Paper p="xl" radius="lg" withBorder className={classes.stepPaper}>
                <Alert 
                  icon={<IconMail size={20} />} 
                  title="ملاحظة مهمة" 
                  color="blue" 
                  mb="md"
                >
                  سيتم إرسال كود التحقق المكون من 4 أرقام إلى بريدك الإلكتروني
                </Alert>
                
                <form onSubmit={handleSubmit(handleSendCode)}>
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
                  
                  <Button
                    type="submit"
                    className={classes.submitButton}
                    loading={loading}
                    fullWidth
                    mt="xl"
                    leftSection={<IconMail size={18} />}
                  >
                    إرسال كود التحقق
                  </Button>
                </form>
              </Paper>
            </Stepper.Step>

            <Stepper.Step 
              label="كود التحقق" 
              description="أدخل الكود"
              icon={<IconKey size={18} />}
            >
              <Paper p="xl" radius="lg" withBorder className={classes.stepPaper}>
                <Alert 
                  icon={<IconCheck size={20} />} 
                  title="تم إرسال الكود" 
                  color="green" 
                  mb="md"
                >
                  تم إرسال كود التحقق إلى: <strong>{email}</strong>
                </Alert>

                <TextInput
                  label="كود التحقق (4 أرقام)"
                  placeholder="1234"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  leftSection={<IconKey size={20} stroke={1.5} />}
                  className={classes.inputField}
                  maxLength={4}
                  description="تحقق من صندوق الوارد والبريد العشوائي (Spam)"
                />

                <Group justify="space-between" mt="xl">
                  <Button
                    variant="outline"
                    color="gray"
                    onClick={() => setActiveStep(0)}
                  >
                    رجوع
                  </Button>
                  <Button
                    className={classes.submitButton}
                    loading={loading}
                    onClick={handleVerifyCode}
                    disabled={!code || code.length < 4}
                    leftSection={<IconCheck size={18} />}
                  >
                    التالي
                  </Button>
                </Group>
              </Paper>
            </Stepper.Step>

            <Stepper.Step 
              label="كلمة المرور الجديدة" 
              description="عيّن كلمة مرور"
              icon={<IconLock size={18} />}
            >
              <Paper p="xl" radius="lg" withBorder className={classes.stepPaper}>
                <Alert 
                  icon={<IconShieldCheck size={20} />} 
                  title="أدخل كلمة المرور الجديدة" 
                  color="teal" 
                  mb="md"
                >
                  يجب أن تكون كلمة المرور قوية وتحتوي على 6 أحرف على الأقل
                </Alert>

                <form onSubmit={handleSubmit(handleResetPassword)}>
                  <PasswordInput
                    label="كلمة المرور الجديدة"
                    placeholder="••••••••"
                    leftSection={<IconLock size={20} stroke={1.5} />}
                    className={classes.inputField}
                    error={errors.newPassword?.message}
                    {...register('newPassword', { 
                      required: 'كلمة المرور الجديدة مطلوبة',
                      minLength: {
                        value: 6,
                        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
                      }
                    })}
                  />

                  <PasswordInput
                    label="تأكيد كلمة المرور الجديدة"
                    placeholder="••••••••"
                    leftSection={<IconLock size={20} stroke={1.5} />}
                    className={classes.inputField}
                    mt="md"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword', { 
                      required: 'يرجى تأكيد كلمة المرور'
                    })}
                  />

                  <Group justify="space-between" mt="xl">
                    <Button
                      variant="outline"
                      color="gray"
                      onClick={() => setActiveStep(1)}
                    >
                      رجوع
                    </Button>
                    <Button
                      type="submit"
                      className={classes.submitButton}
                      loading={loading}
                      leftSection={<IconCheck size={18} />}
                    >
                      تغيير كلمة المرور
                    </Button>
                  </Group>
                </form>
              </Paper>
            </Stepper.Step>

            <Stepper.Completed>
              <Paper p="xl" radius="lg" withBorder className={classes.stepPaper} ta="center">
                <IconCheck size={64} color="#10b981" style={{ marginBottom: '20px' }} />
                <Text size="xl" fw={700} c="#0A3A2A" mb="md">
                  تم بنجاح!
                </Text>
                <Text c="dimmed" mb="xl">
                  تم تغيير كلمة المرور بنجاح
                </Text>
                <Button
                  onClick={handleBackToLogin}
                  leftSection={<IconArrowRight size={18} />}
                  style={{ backgroundColor: '#0A3A2A', color: '#fff' }}
                >
                  العودة لتسجيل الدخول
                </Button>
              </Paper>
            </Stepper.Completed>
          </Stepper>
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
            <Text className={classes.brandingTitle}>
              استعادة الحساب
            </Text>
            <Text className={classes.brandingDescription}>
              إذا نسيت كلمة المرور، لا تقلق!<br />
              يمكنك إعادة تعيينها بسهولة في بضع خطوات.
            </Text>
          </Box>

          <Box className={classes.featuresList}>
            <Box className={classes.featureItem}>
              <Box className={classes.featureIcon}>
                <IconMail size={18} />
              </Box>
              <Text className={classes.featureText}>إرسال كود التحقق للبريد</Text>
            </Box>
            <Box className={classes.featureItem}>
              <Box className={classes.featureIcon}>
                <IconKey size={18} />
              </Box>
              <Text className={classes.featureText}>التحقق من الهوية بأمان</Text>
            </Box>
            <Box className={classes.featureItem}>
              <Box className={classes.featureIcon}>
                <IconLock size={18} />
              </Box>
              <Text className={classes.featureText}>تعيين كلمة مرور جديدة</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}