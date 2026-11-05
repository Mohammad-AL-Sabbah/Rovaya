import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Text, Group, Button, Avatar, ActionIcon, UnstyledButton,
  TextInput, PasswordInput, Divider, Stack, Modal, Loader, Center,
  SimpleGrid, Grid
} from '@mantine/core';
import {
  IconUser, IconShieldLock, IconAlertTriangle, IconCamera,
  IconDeviceFloppy, IconMail, IconPhone, IconTrash, IconWorld,
  IconId, IconAddressBook, IconLock, IconChevronLeft
} from '@tabler/icons-react';
import Swal from 'sweetalert2';
import API from '../../../API/ApiAuthToken';

const GREEN = '#0A3A2A';
const GREEN_LIGHT = '#114d38';
const GOLD = '#E8B04B';
const BORDER = '#e4ece7';
const API_BASE_URL = 'https://rovayabackend.runasp.net';
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const inputStyles = {
  input: { borderRadius: 10, minHeight: 44, borderColor: '#d5e2da' },
  label: { color: GREEN, fontWeight: 600, marginBottom: 6, fontSize: 14 }
};

// ==================== Small helpers ====================
function NavItem({ icon, label, active, danger, onClick }) {
  const activeBg = danger ? '#fef2f2' : '#eef5f1';
  const color = danger ? '#b42318' : active ? GREEN : '#4b5b52';

  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '12px 14px',
        borderRadius: 10,
        background: active ? activeBg : 'transparent',
        color,
        fontWeight: active ? 700 : 500,
        borderInlineStart: `3px solid ${active ? (danger ? '#dc2626' : GOLD) : 'transparent'}`,
        transition: 'background 120ms ease'
      }}
    >
      {icon}
      <Text size="sm" fw="inherit" c="inherit" style={{ flex: 1 }}>{label}</Text>
      <IconChevronLeft size={16} style={{ opacity: active ? 0.8 : 0.3 }} />
    </UnstyledButton>
  );
}

function Section({ icon, title, hint, children }) {
  return (
    <Box>
      <Group gap="xs" mb={4}>
        <Box style={{ color: GOLD, display: 'flex' }}>{icon}</Box>
        <Text fw={700} c={GREEN}>{title}</Text>
      </Group>
      {hint && <Text size="xs" c="dimmed" mb="md">{hint}</Text>}
      {!hint && <Box mb="md" />}
      {children}
    </Box>
  );
}

function PanelHeader({ title, description, danger }) {
  return (
    <Box mb="lg">
      <Text fw={800} size="xl" c={danger ? '#b42318' : GREEN}>{title}</Text>
      <Text size="sm" c="dimmed" mt={2}>{description}</Text>
    </Box>
  );
}

// ==================== Page ====================
export function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef(null);

  // Profile State
  const [profile, setProfile] = useState({
    firstName: '', lastName: '', email: '', country: '', phoneNumber: '', profileImageUrl: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmNewPassword: ''
  });

  // Delete Account Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const getFullImageUrl = (relativeUrl) => {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    return `${API_BASE_URL}${relativeUrl}`;
  };

  const updateProfileField = (field) => (e) =>
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));

  const updatePasswordField = (field) => (e) =>
    setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));

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
        email: profile.email,
        profileImageUrl: profile.profileImageUrl
      };

      const response = await API.put('/api/auth/account/profile/basic', payload);
      if (response.data.success) {
        localStorage.setItem('userName', profile.firstName);
        localStorage.setItem('lastName', profile.lastName);
        localStorage.setItem('userEmail', profile.email);
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

  const handleImageUpload = async (file) => {
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      Swal.fire({ icon: 'warning', title: 'صيغة غير مدعومة', text: 'يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP' });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      Swal.fire({ icon: 'warning', title: 'الصورة كبيرة', text: 'الحد الأقصى لحجم الصورة 2MB' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await API.post('/api/auth/account/upload-profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setImagePreview(getFullImageUrl(response.data.imageUrl));
        setProfile((prev) => ({ ...prev, profileImageUrl: response.data.imageUrl }));

        localStorage.setItem('userAvatar', response.data.imageUrl);
        window.dispatchEvent(new Event('userDataUpdated'));

        Swal.fire({ icon: 'success', title: 'تم رفع الصورة', timer: 1500, showConfirmButton: false });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'فشل رفع الصورة', text: error.response?.data?.message || 'حدث خطأ' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setProfile((prev) => ({ ...prev, profileImageUrl: '' }));
  };

  // ==================== Render ====================
  if (loading) {
    return (
      <Center style={{ minHeight: 'calc(100vh - 75px)' }}>
        <Stack align="center"><Loader color="teal" size="lg" /><Text c="dimmed">جاري تحميل الإعدادات...</Text></Stack>
      </Center>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || 'مستخدم';

  return (
    <Box dir="rtl" style={{ background: '#f4f7f5', minHeight: 'calc(100vh - 75px)', padding: 10 }}>

      {/* Page title */}
      <Box mb="lg">
        <Text fw={800} size="xl" c={GREEN}>إعدادات الحساب</Text>
        <Text size="sm" c="dimmed">إدارة بياناتك الشخصية والأمان</Text>
      </Box>

      <Grid gutter="lg" align="flex-start">

        {/* ============ Sidebar ============ */}
        <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
          <Paper radius="lg" withBorder style={{ overflow: 'hidden', borderColor: BORDER }}>
            {/* Banner + avatar */}
            <Box style={{ background: `linear-gradient(125deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)`, height: 88 }} />
            <Stack align="center" gap={4} px="md" pb="md" style={{ marginTop: -56 }}>
              <Box style={{ position: 'relative' }}>
                <Avatar
                  src={imagePreview}
                  size={112}
                  radius="50%"
                  style={{ border: '4px solid #fff', background: '#e8eeeb' }}
                >
                  <IconUser size={48} color="#94a398" />
                </Avatar>
                <ActionIcon
                  size={34}
                  radius="xl"
                  loading={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="تغيير الصورة"
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    insetInlineEnd: 2,
                    background: GOLD,
                    color: GREEN,
                    border: '3px solid #fff'
                  }}
                >
                  <IconCamera size={16} />
                </ActionIcon>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                />
              </Box>

              <Text fw={800} size="lg" c={GREEN} mt={6} ta="center">{fullName}</Text>
              <Text size="xs" c="dimmed" ta="center" style={{ wordBreak: 'break-all' }}>{profile.email}</Text>

              {imagePreview ? (
                <UnstyledButton onClick={handleRemoveImage}>
                  <Text size="xs" c="red" td="underline">إزالة الصورة (اضغط حفظ للتأكيد)</Text>
                </UnstyledButton>
              ) : (
                <Text size="xs" c="dimmed">JPG أو PNG، بحد أقصى 2MB</Text>
              )}
            </Stack>

            <Divider color={BORDER} />

            {/* Navigation */}
            <Stack gap={4} p="sm">
              <NavItem
                icon={<IconUser size={18} />}
                label="الملف الشخصي"
                active={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
              />
              <NavItem
                icon={<IconShieldLock size={18} />}
                label="كلمة المرور"
                active={activeTab === 'security'}
                onClick={() => setActiveTab('security')}
              />
              <NavItem
                icon={<IconAlertTriangle size={18} />}
                label="حذف الحساب"
                danger
                active={activeTab === 'danger'}
                onClick={() => setActiveTab('danger')}
              />
            </Stack>
          </Paper>
        </Grid.Col>

        {/* ============ Main panel ============ */}
        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>

          {/* ----- Profile ----- */}
          {activeTab === 'profile' && (
            <Paper p="xl" radius="lg" withBorder style={{ borderColor: BORDER }}>
              <PanelHeader
                title="الملف الشخصي"
                description="حدّث بياناتك الشخصية ومعلومات التواصل من مكان واحد"
              />

              <form onSubmit={handleProfileUpdate}>
                <Stack gap="xl">
                  <Section
                    icon={<IconId size={18} />}
                    title="المعلومات الشخصية"
                  >
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <TextInput
                        label="الاسم الأول"
                        required
                        value={profile.firstName}
                        onChange={updateProfileField('firstName')}
                        styles={inputStyles}
                      />
                      <TextInput
                        label="اسم العائلة"
                        required
                        value={profile.lastName}
                        onChange={updateProfileField('lastName')}
                        styles={inputStyles}
                      />
                    </SimpleGrid>
                  </Section>

                  <Divider color={BORDER} />

                  <Section
                    icon={<IconAddressBook size={18} />}
                    title="معلومات التواصل"
                    hint="عند تغيير البريد الإلكتروني ستحتاج إلى التحقق منه لتأكيد الحساب الجديد"
                  >
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <TextInput
                        label="البريد الإلكتروني"
                        required
                        value={profile.email}
                        onChange={updateProfileField('email')}
                        leftSection={<IconMail size={16} />}
                        styles={inputStyles}
                      />
                      <TextInput
                        label="رقم الهاتف"
                        value={profile.phoneNumber}
                        onChange={updateProfileField('phoneNumber')}
                        leftSection={<IconPhone size={16} />}
                        styles={inputStyles}
                      />
                      <TextInput
                        label="الدولة"
                        required
                        value={profile.country}
                        onChange={updateProfileField('country')}
                        leftSection={<IconWorld size={16} />}
                        styles={inputStyles}
                      />
                    </SimpleGrid>
                  </Section>

                  <Divider color={BORDER} />

                  <Group justify="flex-end">
                    <Button
                      type="submit"
                      size="md"
                      loading={saving}
                      leftSection={<IconDeviceFloppy size={18} />}
                      style={{ background: GREEN, color: '#fff', borderRadius: 10 }}
                    >
                      حفظ التغييرات
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Paper>
          )}

          {/* ----- Security ----- */}
          {activeTab === 'security' && (
            <Paper p="xl" radius="lg" withBorder style={{ borderColor: BORDER }}>
              <PanelHeader
                title="كلمة المرور"
                description="اختر كلمة مرور قوية لا تستخدمها في مواقع أخرى"
              />

              <form onSubmit={handleChangePassword}>
                <Stack gap="xl">
                  <Section
                    icon={<IconLock size={18} />}
                    title="التحقق من هويتك"
                  >
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <PasswordInput
                        label="كلمة المرور الحالية"
                        required
                        value={passwordForm.currentPassword}
                        onChange={updatePasswordField('currentPassword')}
                        styles={inputStyles}
                        placeholder="أدخل كلمة المرور الحالية"
                      />
                    </SimpleGrid>
                  </Section>

                  <Divider color={BORDER} />

                  <Section
                    icon={<IconShieldLock size={18} />}
                    title="كلمة المرور الجديدة"
                  >
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <PasswordInput
                        label="كلمة المرور الجديدة"
                        required
                        value={passwordForm.newPassword}
                        onChange={updatePasswordField('newPassword')}
                        styles={inputStyles}
                        placeholder="أدخل كلمة المرور الجديدة"
                      />
                      <PasswordInput
                        label="تأكيد كلمة المرور الجديدة"
                        required
                        value={passwordForm.confirmNewPassword}
                        onChange={updatePasswordField('confirmNewPassword')}
                        styles={inputStyles}
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                      />
                    </SimpleGrid>
                  </Section>

                  <Divider color={BORDER} />

                  <Group justify="flex-end">
                    <Button
                      type="submit"
                      size="md"
                      loading={saving}
                      leftSection={<IconShieldLock size={18} />}
                      style={{ background: GREEN, color: '#fff', borderRadius: 10 }}
                    >
                      تحديث كلمة المرور
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Paper>
          )}

          {/* ----- Danger zone ----- */}
          {activeTab === 'danger' && (
            <Paper p="xl" radius="lg" withBorder style={{ borderColor: '#fecaca', background: '#fffafa' }}>
              <PanelHeader
                danger
                title="حذف الحساب نهائياً"
                description="هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك بشكل نهائي."
              />
              <Button
                color="red"
                variant="outline"
                size="md"
                leftSection={<IconTrash size={18} />}
                onClick={() => setDeleteModalOpen(true)}
                style={{ borderRadius: 10 }}
              >
                طلب حذف الحساب
              </Button>
            </Paper>
          )}
        </Grid.Col>
      </Grid>

      {/* Delete Account Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={<Text fw={800} c="red">تأكيد حذف الحساب</Text>}
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">لحماية حسابك، يرجى إدخال كلمة المرور الحالية لتأكيد عملية الحذف النهائية.</Text>
          <PasswordInput
            label="كلمة المرور الحالية"
            required
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            styles={inputStyles}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => setDeleteModalOpen(false)}>إلغاء</Button>
            <Button color="red" onClick={handleDeleteAccount} leftSection={<IconAlertTriangle size={18} />}>
              نعم، احذف حسابي نهائياً
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}