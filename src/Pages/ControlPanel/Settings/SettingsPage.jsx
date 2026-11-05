import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Text, Group, Button, ThemeIcon, Tabs,
  TextInput, PasswordInput, FileInput, Image, ActionIcon,
  Divider, Stack, Modal, Loader, Center, SimpleGrid
} from '@mantine/core';
import {
  IconUser, IconShieldLock, IconAlertTriangle,
  IconCamera, IconX, IconDeviceFloppy, IconMail, IconPhone, IconTrash 
} from '@tabler/icons-react';
import Swal from 'sweetalert2';
import API from '../../../API/ApiAuthToken';

const GREEN = '#0A3A2A';
const GREEN_LIGHT = '#114d38';
const GOLD = '#E8B04B';
const API_BASE_URL = 'https://rovayabackend.runasp.net';

const inputStyles = {
  input: { borderRadius: 10, minHeight: 42, borderColor: '#DCE7DF' },
  label: { color: GREEN, fontWeight: 600, marginBottom: 6 }
};

export function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile State
  const [profile, setProfile] = useState({
    firstName: '', lastName: '', email: '', country: '', phoneNumber: '', profileImageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmNewPassword: ''
  });

  // Delete Account Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // دالة للحصول على الرابط الكامل للصورة
  const getFullImageUrl = (relativeUrl) => {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    return `${API_BASE_URL}${relativeUrl}`;
  };

  // ==================== Fetch Data ====================
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/auth/account/profile');
      if (response.data.success) {
        const data = response.data;
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          country: data.country || '',
          phoneNumber: data.phoneNumber || '',
          profileImageUrl: data.profileImageUrl || ''
        });
        setImagePreview(getFullImageUrl(data.profileImageUrl));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Swal.fire({ icon: 'error', title: 'خطأ', text: 'فشل في جلب بيانات الملف الشخصي' });
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  document.title = 'Settings | ROVAYA';
}, []);




  useEffect(() => {
    fetchProfileData();
  }, []);

  // ==================== Handlers ====================
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        country: profile.country,
        phoneNumber: profile.phoneNumber,
        email: profile.email, // ✅ تمت إضافة البريد الإلكتروني للـ Payload
        profileImageUrl: profile.profileImageUrl
      };

      const response = await API.put('/api/auth/account/profile/basic', payload);
      if (response.data.success) {
        // ✅ تحديث البيانات في localStorage وإشعار الـ Navbar بالتغيير فوراً
        localStorage.setItem('userName', profile.firstName);
        localStorage.setItem('lastName', profile.lastName);
        localStorage.setItem('userEmail', profile.email); // ✅ حفظ البريد الجديد
        localStorage.setItem('userAvatar', profile.profileImageUrl || '');
        window.dispatchEvent(new Event('userDataUpdated'));

        Swal.fire({ 
          icon: 'success', 
          title: 'تم الحفظ', 
          text: 'تم تحديث البيانات بنجاح. إذا قمت بتغيير بريدك الإلكتروني، يرجى التحقق منه لتأكيد الحساب الجديد.', 
          timer: 2500, 
          showConfirmButton: false 
        });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'فشل الحفظ', text: error.response?.data?.message || 'حدث خطأ' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      Swal.fire({ icon: 'warning', title: 'تنبيه', text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين' });
      return;
    }
    setSaving(true);
    try {
      const response = await API.post('/api/auth/account/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword
      });
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'تم بنجاح', text: 'تم تغيير كلمة المرور بنجاح', timer: 1500, showConfirmButton: false });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'فشل التغيير', text: error.response?.data?.message || 'كلمة المرور الحالية غير صحيحة' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Swal.fire({ icon: 'warning', title: 'تنبيه', text: 'يرجى إدخال كلمة المرور لتأكيد الحذف' });
      return;
    }
    try {
      const response = await API.delete('/api/auth/account/delete-account', { data: { password: deletePassword } });
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'تم الحذف', text: 'تم حذف حسابك بنجاح. نأسف لرحيلك!' });
        // يمكنك هنا توجيه المستخدم لصفحة تسجيل الدخول
        // navigate('/login');
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'فشل الحذف', text: error.response?.data?.message || 'كلمة المرور غير صحيحة' });
    }
  };

  // دالة رفع الصورة
  const handleImageUpload = async (file) => {
    if (!file) return;
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await API.post('/api/auth/account/upload-profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        const fullUrl = getFullImageUrl(response.data.imageUrl);
        setImagePreview(fullUrl);
        setProfile({...profile, profileImageUrl: response.data.imageUrl});
        
        // ✅ تحديث البيانات في localStorage وإشعار الـ Navbar بالتغيير فوراً
        localStorage.setItem('userAvatar', response.data.imageUrl);
        window.dispatchEvent(new Event('userDataUpdated'));

        Swal.fire({ icon: 'success', title: 'تم رفع الصورة', timer: 1500, showConfirmButton: false });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'فشل رفع الصورة', text: error.response?.data?.message || 'حدث خطأ' });
    } finally {
      setSaving(false);
    }
  };

  // ==================== Render ====================
  if (loading) {
    return (
      <Center style={{ minHeight: 'calc(100vh - 75px)' }}>
        <Stack align="center"><Loader color="teal" size="lg" /><Text c="dimmed">جاري تحميل الإعدادات...</Text></Stack>
      </Center>
    );
  }





  return (
    <Box dir="rtl" style={{ background: '#f5f7f6', minHeight: 'calc(100vh - 75px)', padding: '10px' }}>
      
      {/* Header */}
      <Paper radius="xl" p="xl" mb="xl" style={{ background: `linear-gradient(125deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)`, color: '#fff', border: 'none' }}>
        <Group gap="md">
          <ThemeIcon size={60} radius="xl" variant="light" style={{ background: 'rgba(232,176,75,0.16)', color: GOLD, border: '1px solid rgba(232,176,75,0.35)' }}>
            <IconUser size={32} />
          </ThemeIcon>
          <Box>
            <Text size="xl" fw={800}>إعدادات الحساب</Text>
            <Text size="sm" c="rgba(255,255,255,0.75)">إدارة بياناتك الشخصية والأمان</Text>
          </Box>
        </Group>
      </Paper>

      <Tabs value={activeTab} onChange={setActiveTab} variant="outline" color="teal">
        <Tabs.List mb="xl" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>الملف الشخصي</Tabs.Tab>
          <Tabs.Tab value="security" leftSection={<IconShieldLock size={16} />}>الأمان</Tabs.Tab>
          <Tabs.Tab value="danger" leftSection={<IconAlertTriangle size={16} />} color="red">حذف الحساب </Tabs.Tab>
        </Tabs.List>

        {/* Tab 1: Profile */}
        <Tabs.Panel value="profile">
          <Paper p="xl" radius="lg" withBorder>
            <form onSubmit={handleProfileUpdate}>
              <Stack gap="xl">
                <Group align="flex-start" gap="xl" wrap="wrap">
                  {/* Profile Image */}
                  <Box style={{ textAlign: 'center' }}>
                    {imagePreview ? (
                      <Box style={{ position: 'relative', display: 'inline-block' }}>
                        <Image 
                          src={imagePreview} 
                          alt="Profile"
                          width={120}
                          height={120}
                          radius="xl"
                          style={{ border: '3px solid #e8eeeb', objectFit: 'cover' }}
                        />
                        <ActionIcon
                          size="sm"
                          color="red"
                          variant="filled"
                          radius="xl"
                          style={{ position: 'absolute', top: 8, right: 8 }}
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                            setProfile({...profile, profileImageUrl: ''});
                          }}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      </Box>
                    ) : (
                      <Box 
                        style={{ 
                          width: 120, 
                          height: 120, 
                          borderRadius: '50%', 
                          background: 'linear-gradient(135deg, #e8eeeb 0%, #d1e0d8 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid #e8eeeb',
                          marginBottom: '12px'
                        }}
                      >
                        <IconUser size={48} color="#94a398" />
                      </Box>
                    )}
                    
                    <FileInput
                      placeholder="تغيير الصورة"
                      accept="image/png,image/jpeg,image/webp"
                      size="xs"
                      leftSection={<IconCamera size={14} />}
                      onChange={(file) => {
                        setImageFile(file);
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      clearable
                      style={{ maxWidth: 200, margin: '0 auto' }}
                    />
                    <Text size="xs" c="dimmed" mt="xs">JPG أو PNG، بحد أقصى 2MB</Text>
                  </Box>

                  {/* Profile Fields */}
                  <Box style={{ flex: 1, minWidth: 300 }}>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <TextInput 
                        label={<Text fw={700} size="sm">الاسم الأول <Text component="span" c="red">*</Text></Text>} 
                        required 
                        value={profile.firstName} 
                        onChange={e => setProfile({...profile, firstName: e.target.value})} 
                        styles={inputStyles} 
                      />
                      <TextInput 
                        label={<Text fw={700} size="sm">اسم العائلة <Text component="span" c="red">*</Text></Text>} 
                        required 
                        value={profile.lastName} 
                        onChange={e => setProfile({...profile, lastName: e.target.value})} 
                        styles={inputStyles} 
                      />
                      
                      {/* ✅ تم إزالة disabled وإضافة required وتحديث الـ onChange */}
                      <TextInput 
                        label={<Text fw={700} size="sm">البريد الإلكتروني <Text component="span" c="red">*</Text></Text>} 
                        required 
                        value={profile.email} 
                        onChange={e => setProfile({...profile, email: e.target.value})} 
                        leftSection={<IconMail size={16} />} 
                        styles={inputStyles} 
                      />
                      
                      <TextInput 
                        label={<Text fw={700} size="sm">الدولة <Text component="span" c="red">*</Text></Text>} 
                        required 
                        value={profile.country} 
                        onChange={e => setProfile({...profile, country: e.target.value})} 
                        styles={inputStyles} 
                      />
                      <TextInput 
                        label={<Text fw={700} size="sm">رقم الهاتف</Text>} 
                        value={profile.phoneNumber} 
                        onChange={e => setProfile({...profile, phoneNumber: e.target.value})} 
                        styles={inputStyles} 
                        leftSection={<IconPhone size={16} />}
                      />
                    </SimpleGrid>
                  </Box>
                </Group>

                <Divider />
                <Group justify="flex-end">
                  <Button type="submit" loading={saving} leftSection={<IconDeviceFloppy size={18} />} style={{ background: GREEN, color: '#fff' }}>
                    حفظ التغييرات
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Tabs.Panel>

        {/* Tab 2: Security */}
        <Tabs.Panel value="security">
          <Paper p="xl" radius="lg" withBorder maw={600}>
            <Group mb="md">
              <IconShieldLock size={24} color={GREEN} />
              <Text fw={700} size="lg" c={GREEN}>تغيير كلمة المرور</Text>
            </Group>
            <form onSubmit={handleChangePassword}>
              <Stack gap="md">
                <PasswordInput 
                  label={<Text fw={600} size="sm">كلمة المرور الحالية</Text>} 
                  required 
                  value={passwordForm.currentPassword} 
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                  styles={inputStyles} 
                  placeholder="أدخل كلمة المرور الحالية"
                />
                <Divider />
                <PasswordInput 
                  label={<Text fw={600} size="sm">كلمة المرور الجديدة</Text>} 
                  required 
                  value={passwordForm.newPassword} 
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                  styles={inputStyles} 
                  placeholder="أدخل كلمة المرور الجديدة"
                />
                <PasswordInput 
                  label={<Text fw={600} size="sm">تأكيد كلمة المرور الجديدة</Text>} 
                  required 
                  value={passwordForm.confirmNewPassword} 
                  onChange={e => setPasswordForm({...passwordForm, confirmNewPassword: e.target.value})} 
                  styles={inputStyles} 
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                />
                <Group justify="flex-end" mt="md">
                  <Button type="submit" loading={saving} leftSection={<IconShieldLock size={18} />} style={{ background: GREEN, color: '#fff' }}>
                    تحديث كلمة المرور
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Tabs.Panel>

        {/* Tab 3: Danger Zone */}
        <Tabs.Panel value="danger">
          <Paper p="xl" radius="lg" withBorder style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
            <Group mb="md">
              <IconAlertTriangle size={24} color="#dc2626" />
              <Box>
                <Text fw={800} size="lg" c="#dc2626">حذف الحساب نهائياً</Text>
                <Text size="sm" c="#991b1b">هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك بشكل نهائي.</Text>
              </Box>
            </Group>
            <Button 
              color="red" 
              variant="outline" 
              leftSection={<IconTrash size={18} />}
              onClick={() => setDeleteModalOpen(true)}
            >
              طلب حذف الحساب
            </Button>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Delete Account Modal */}
      <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title={<Text fw={800} c="red">تأكيد حذف الحساب</Text>} centered>
        <Stack gap="md">
          <Text size="sm" c="dimmed">لحماية حسابك، يرجى إدخال كلمة المرور الحالية لتأكيد عملية الحذف النهائية.</Text>
          <PasswordInput 
            label="كلمة المرور الحالية" 
            required 
            value={deletePassword} 
            onChange={e => setDeletePassword(e.target.value)} 
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => setDeleteModalOpen(false)}>إلغاء</Button>
            <Button color="red" onClick={handleDeleteAccount} leftSection={<IconAlertTriangle size={18} />}>نعم، احذف حسابي نهائياً</Button>
          </Group>
        </Stack>
      </Modal>

    </Box>
  );
}