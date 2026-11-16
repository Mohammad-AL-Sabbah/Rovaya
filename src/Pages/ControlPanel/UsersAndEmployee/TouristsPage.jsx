import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Text, Group, Button, ThemeIcon, Table, Badge,
  Modal, TextInput, Select, Textarea, Stack, Divider, ActionIcon,
  ScrollArea, Loader, Center, SimpleGrid, RingProgress,
  Avatar, Image // ✅ جديد
} from '@mantine/core';
import {
  IconUsers, IconShieldLock, IconShieldOff,
  IconAlertTriangle, IconCheck, IconBriefcase,
  IconEye, IconTrash, IconSearch,
  IconMail, IconPhone, IconMapPin, IconHeartbeat,
  IconUserShield, IconAlertCircle, IconPill,
  IconCalendar, IconPlus, IconPhotoOff // ✅ جديد
} from '@tabler/icons-react';
import Swal from 'sweetalert2';
import API from '../../../API/ApiAuthToken';

// ✅ helper لبناء رابط الصورة الكامل من المسار النسبي
const buildFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = 'https://rovayabackend.runasp.net';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

// ✅ أنماط ثابتة لصورة الملف الشخصي (خارج المكون لتجنب إعادة الإنشاء)
const PROFILE_AVATAR_STYLES = {
  wrapper: {
    width: 120,
    height: 120,
    minWidth: 120,
    minHeight: 120,
    flexShrink: 0,
    borderRadius: 16,
    overflow: 'hidden',
    border: '3px solid #0A3A2A',
    boxShadow: '0 4px 12px rgba(10, 58, 42, 0.15)',
    backgroundColor: '#EAF1EC',
  },
  image: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
};

export function TouristsPage() {
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [blockModalOpened, setBlockModalOpened] = useState(false);
  const [unblockModalOpened, setUnblockModalOpened] = useState(false);
  const [selectedTourist, setSelectedTourist] = useState(null);

  // ✅ حالات مودال التفاصيل
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [touristDetails, setTouristDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [blockFormData, setBlockFormData] = useState({
    reason: '', durationUnit: 'Days', durationValue: ''
  });

  const currentUserRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  const isSuperAdmin = currentUserRoles.includes('SuperAdmin');
  const isAdmin = currentUserRoles.includes('Admin');

  // جلب جميع المستخدمين
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/auth/account/users');
      if (response.data.success) {
        setAllUsers(response.data.users || []);
      } else {
        Swal.fire({ icon: 'error', title: 'خطأ', text: response.data.message });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'خطأ', text: 'فشل في جلب بيانات المستخدمين' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // ✅ جلب التفاصيل الكاملة - المسار الصحيح من الباك إند
  const fetchTouristDetails = async (id) => {
    setLoadingDetails(true);
    setTouristDetails(null);
    try {
      const response = await API.get(`/api/auth/account/users/${id}/profile`);
      if (response.data.success) {
        setTouristDetails(response.data);
      } else {
        Swal.fire({ icon: 'error', title: 'خطأ', text: response.data.message || 'فشل في جلب التفاصيل' });
      }
    } catch (error) {
      Swal.fire({ 
        icon: 'error', 
        title: 'خطأ', 
        text: error.response?.data?.message || 'فشل في جلب تفاصيل السائح' 
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // ✅ فتح مودال التفاصيل
  const handleOpenDetails = (tourist) => {
    setSelectedTourist(tourist);
    setDetailsModalOpened(true);
    fetchTouristDetails(tourist.id);
  };

  // فلترة السياح فقط (Customer)
  const tourists = useMemo(() => {
    return allUsers.filter(user => user.roles.includes('Customer'));
  }, [allUsers]);

  // البحث
  const filteredTourists = useMemo(() => {
    if (!searchQuery.trim()) return tourists;
    const query = searchQuery.toLowerCase();
    return tourists.filter(tourist => 
      tourist.firstName.toLowerCase().includes(query) ||
      tourist.lastName.toLowerCase().includes(query) ||
      tourist.email.toLowerCase().includes(query) ||
      tourist.phoneNumber?.includes(query)
    );
  }, [tourists, searchQuery]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const total = tourists.length;
    const blocked = tourists.filter(t => t.status === 2 || t.status === 3).length;
    const active = total - blocked;
    const byCountry = {};
    tourists.forEach(t => {
      byCountry[t.country] = (byCountry[t.country] || 0) + 1;
    });

    return { total, blocked, active, byCountry };
  }, [tourists]);

  const handleBlockTourist = async () => {
    if (!selectedTourist) return;
    
    try {
      const payload = {
        targetUserId: selectedTourist.id,
        reason: blockFormData.reason,
      };

      if (blockFormData.durationUnit !== 'Permanent') {
        payload.durationValue = parseInt(blockFormData.durationValue);
        payload.durationUnit = blockFormData.durationUnit;
      }

      const response = await API.post('/api/auth/account/block-user', payload);
      
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'نجاح', text: response.data.message, timer: 2000, showConfirmButton: false });
        setBlockModalOpened(false);
        setBlockFormData({ reason: '', durationUnit: 'Days', durationValue: '' });
        fetchAllUsers();
      } else {
        Swal.fire({ icon: 'error', title: 'فشل', text: response.data.message });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'خطأ', text: error.response?.data?.message || 'حدث خطأ أثناء حظر السائح' });
    }
  };

  const handleUnblockTourist = async () => {
    if (!selectedTourist) return;
    
    try {
      const response = await API.post('/api/auth/account/unblock-user', `"${selectedTourist.id}"`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'نجاح', text: response.data.message, timer: 2000, showConfirmButton: false });
        setUnblockModalOpened(false);
        setSelectedTourist(null);
        fetchAllUsers();
      } else {
        Swal.fire({ icon: 'error', title: 'فشل', text: response.data.message });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'خطأ', text: error.response?.data?.message || 'حدث خطأ أثناء فك الحظر' });
    }
  };

  const handleDeleteTourist = async (touristId, touristName) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد تماماً؟',
      text: `سيتم حذف حساب السائح "${touristName}" بشكل نهائي ولا يمكن التراجع عن هذا الإجراء!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#0A3A2A',
      confirmButtonText: 'نعم، احذف الحساب نهائياً',
      cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
      try {
        const response = await API.post('/api/Admin/delete-user-account', `"${touristId}"`, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.data.success) {
          Swal.fire({ 
            icon: 'success', 
            title: 'تم الحذف', 
            text: response.data.message, 
            timer: 2000, 
            showConfirmButton: false 
          });
          fetchAllUsers();
        } else {
          Swal.fire({ icon: 'error', title: 'فشل', text: response.data.message });
        }
      } catch (error) {
        Swal.fire({ 
          icon: 'error', 
          title: 'خطأ', 
          text: error.response?.data?.message || 'حدث خطأ أثناء حذف الحساب' 
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-PS', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ar-PS', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  useEffect(() => {
    document.title = 'إدارة السياح | ROVAYA';
  }, []); 

  return (
    <Box style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 75px)', direction: 'rtl'}}>
      
      {/* رأس الصفحة */}
      <Paper p="lg" radius="lg" withBorder mb="lg" style={{ 
        background: 'linear-gradient(135deg, #0A3A2A 0%, #114d38 100%)',
        color: '#ffffff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
      }}>
        <div>
          <Group gap="xs">
            <IconUsers size={32} color="#E8B04B" />
            <Text fw={800} size="xl">إدارة السياح</Text>
          </Group>
          <Text size="sm" c="rgba(255,255,255,0.8)" mt={4}>عرض وإدارة حسابات السياح والزوار</Text>
        </div>
      </Paper>

      {/* البطاقات الإحصائية */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="lg">
        <Paper p="lg" radius="lg" withBorder style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', border: '2px solid #0A3A2A' }}>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed" fw={600}>إجمالي السياح</Text>
              <Text size="3xl" fw={800} c="#0A3A2A" mt={4}>{stats.total}</Text>
              <Text size="xs" c="teal" mt={4}>سائح مسجل</Text>
            </div>
            <ThemeIcon size={60} radius="xl" variant="light" color="teal" style={{ backgroundColor: 'rgba(10, 58, 42, 0.1)' }}>
              <IconUsers size={32} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="lg" radius="lg" withBorder style={{ background: 'linear-gradient(135deg, #ffffff 0%, #dcfce7 100%)', border: '2px solid #16a34a' }}>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed" fw={600}>نشط</Text>
              <Text size="3xl" fw={800} c="#16a34a" mt={4}>{stats.active}</Text>
              <Text size="xs" c="green" mt={4}>حساب نشط</Text>
            </div>
            <ThemeIcon size={60} radius="xl" variant="light" color="green" style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}>
              <IconCheck size={32} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="lg" radius="lg" withBorder style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fee2e2 100%)', border: '2px solid #dc2626' }}>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed" fw={600}>محظور</Text>
              <Text size="3xl" fw={800} c="#dc2626" mt={4}>{stats.blocked}</Text>
              <Text size="xs" c="red" mt={4}>ممنوع</Text>
            </div>
            <ThemeIcon size={60} radius="xl" variant="light" color="red" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
              <IconShieldLock size={32} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="lg" radius="lg" withBorder style={{ background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', border: '2px solid #1d4ed8' }}>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed" fw={600}>الجنسيات</Text>
              <Text size="3xl" fw={800} c="#1d4ed8" mt={4}>{Object.keys(stats.byCountry).length}</Text>
              <Text size="xs" c="blue" mt={4}>دولة مختلفة</Text>
            </div>
            <ThemeIcon size={60} radius="xl" variant="light" color="blue" style={{ backgroundColor: 'rgba(29, 78, 216, 0.1)' }}>
              <IconBriefcase size={32} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* شريط البحث */}
      <Paper p="md" radius="lg" withBorder mb="lg">
        <TextInput
          placeholder="ابحث عن سائح بالاسم، البريد، أو رقم الهاتف..."
          leftSection={<IconSearch size={18} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="md"
          radius="md"
        />
      </Paper>

      {/* جدول السياح */}
      <Paper radius="lg" withBorder style={{ overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <Center p="xl"><Loader color="teal" /></Center>
        ) : (
          <ScrollArea>
            <Table highlightOnHover style={{ minWidth: 900 }}>
              <Table.Thead style={{ backgroundColor: '#0A3A2A' }}>
                <Table.Tr>
                  {['السائح', 'البريد الإلكتروني', 'الدولة', 'رقم الهاتف', 'الحالة', 'تاريخ التسجيل', 'الإجراءات'].map((header) => (
                    <Table.Th key={header} style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px' }}>{header}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredTourists.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                      <Group justify="center" gap="md">
                        <IconUsers size={48} color="#cbd5e1" />
                        <Text c="dimmed" size="lg">
                          {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد سياح مسجلين حالياً'}
                        </Text>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredTourists.map((tourist) => {
                    const isBlocked = tourist.status === 2 || tourist.status === 3;

                    return (
                      <Table.Tr key={tourist.id} style={{ transition: 'all 0.2s' }}>
                        <Table.Td>
                          <Group gap="sm">
                            <ThemeIcon size="lg" radius="xl" color={isBlocked ? 'gray' : 'teal'} variant="light">
                              {tourist.firstName.charAt(0)}
                            </ThemeIcon>
                            <div>
                              <Text fw={600} size="sm">{tourist.firstName} {tourist.lastName}</Text>
                              <Text size="xs" c="dimmed">ID: {tourist.id.slice(0, 8)}...</Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td><Text size="sm">{tourist.email}</Text></Table.Td>
                        <Table.Td>
                          <Badge color="blue" variant="light" leftSection={<IconBriefcase size={12} />}>
                            {tourist.country || 'غير محدد'}
                          </Badge>
                        </Table.Td>
                        <Table.Td><Text size="sm">{tourist.phoneNumber || '-'}</Text></Table.Td>
                        <Table.Td>
                          {isBlocked ? (
                            <Badge color="red" variant="light" leftSection={<IconShieldLock size={12} />}>محظور</Badge>
                          ) : (
                            <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>نشط</Badge>
                          )}
                        </Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{formatDate(tourist.createdAt)}</Text></Table.Td>
                        <Table.Td>
                          <Group justify="center" gap="xs">
                            {/* زر الحذف النهائي */}
                            <ActionIcon 
                              size="lg"
                              color="red" 
                              variant="light" 
                              title="حذف الحساب نهائياً"
                              style={{ ':hover': { backgroundColor: '#fee2e2' } }}
                              onClick={() => handleDeleteTourist(tourist.id, `${tourist.firstName} ${tourist.lastName}`)}
                            >
                              <IconTrash size={18} />
                            </ActionIcon>

                            {/* أزرار الحظر وفك الحظر */}
                            {isBlocked ? (
                              <ActionIcon 
                                size="lg"
                                color="green" 
                                variant="light" 
                                title="فك الحظر"
                                style={{ ':hover': { backgroundColor: '#dcfce7' } }}
                                onClick={() => { setSelectedTourist(tourist); setUnblockModalOpened(true); }}
                              >
                                <IconShieldOff size={18} />
                              </ActionIcon>
                            ) : (
                              <ActionIcon 
                                size="lg"
                                color="red" 
                                variant="light" 
                                title="حظر"
                                style={{ ':hover': { backgroundColor: '#fee2e2' } }}
                                onClick={() => { setSelectedTourist(tourist); setBlockModalOpened(true); }}
                              >
                                <IconShieldLock size={18} />
                              </ActionIcon>
                            )}
                            
                            {/* ✅ زر عرض الملف الكامل - يفتح المودال */}
                            <ActionIcon 
                              size="lg"
                              color="blue" 
                              variant="light" 
                              title="عرض الملف الكامل"
                              style={{ ':hover': { backgroundColor: '#dbeafe' } }}
                              onClick={() => handleOpenDetails(tourist)}
                            >
                              <IconEye size={18} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Paper>

      {/* مودال حظر سائح */}
      <Modal opened={blockModalOpened} onClose={() => setBlockModalOpened(false)} title={<Group gap="xs"><IconShieldLock size={24} color="red" /><Text fw={700}>حظر سائح</Text></Group>} size="md" centered>
        {selectedTourist && (
          <Stack gap="md">
            <Group p="md" style={{ backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }} gap="xs">
              <IconAlertTriangle size={24} color="#856404" />
              <div>
                <Text size="sm" c="#856404" fw={700}>تحذير: أنت على وشك حظر</Text>
                <Text size="lg" c="#856404" fw={800}>{selectedTourist.firstName} {selectedTourist.lastName}</Text>
              </div>
            </Group>

            <Select
              label="مدة الحظر"
              required
              value={blockFormData.durationUnit}
              onChange={(value) => setBlockFormData({...blockFormData, durationUnit: value})}
              data={[
                { value: 'Permanent', label: 'حظر دائم' },
                { value: 'Minutes', label: 'دقائق' },
                { value: 'Hours', label: 'ساعات' },
                { value: 'Days', label: 'أيام' },
              ]}
            />

            {blockFormData.durationUnit !== 'Permanent' && (
              <TextInput
                label="القيمة (عدد الأيام/الساعات/الدقائق)"
                type="number"
                required
                min="1"
                value={blockFormData.durationValue}
                onChange={(e) => setBlockFormData({...blockFormData, durationValue: e.target.value})}
                placeholder="أدخل الرقم"
              />
            )}

            <Textarea
              label="سبب الحظر"
              required
              placeholder="اكتب سبباً واضحاً للحظر..."
              minRows={3}
              value={blockFormData.reason}
              onChange={(e) => setBlockFormData({...blockFormData, reason: e.target.value})}
            />

            <Divider />

            <Group justify="space-between">
              <Button variant="outline" color="gray" onClick={() => setBlockModalOpened(false)}>إلغاء</Button>
              <Button color="red" onClick={handleBlockTourist} leftSection={<IconShieldLock size={16} />}>تأكيد الحظر</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* مودال تأكيد فك الحظر */}
      <Modal opened={unblockModalOpened} onClose={() => setUnblockModalOpened(false)} title={<Group gap="xs"><IconShieldOff size={24} color="green" /><Text fw={700}>فك الحظر</Text></Group>} size="md" centered>
        {selectedTourist && (
          <Stack gap="md" align="center">
            <ThemeIcon size={80} radius="xl" color="green" variant="light" style={{ backgroundColor: '#dcfce7' }}>
              <IconShieldOff size={40} />
            </ThemeIcon>
            
            <Text ta="center" size="lg" fw={700}>
              هل أنت متأكد من فك الحظر عن:
            </Text>
            
            <Text ta="center" size="xl" fw={800} c="#0A3A2A">
              {selectedTourist.firstName} {selectedTourist.lastName}
            </Text>

            <Text ta="center" size="sm" c="dimmed">
              سيتم إعادة تفعيل حساب السائح والسماح له بالدخول للنظام
            </Text>

            <Divider />

            <Group justify="space-between" w="100%">
              <Button variant="outline" color="gray" onClick={() => setUnblockModalOpened(false)} flex={1}>إلغاء</Button>
              <Button color="green" onClick={handleUnblockTourist} leftSection={<IconCheck size={16} />} flex={1}>تأكيد فك الحظر</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* ✅ ✅ ✅ مودال الملف الكامل ✅ ✅ ✅ */}
      <Modal
        opened={detailsModalOpened}
        onClose={() => { setDetailsModalOpened(false); setTouristDetails(null); }}
        title={
          <Group gap="xs">
            <IconUserShield size={24} color="#0A3A2A" />
            <Text fw={800} size="lg">الملف الشخصي الكامل للسائح</Text>
          </Group>
        }
        size="xl"
        centered
        radius="lg"
      >
        {loadingDetails ? (
          <Center p="xl">
            <Stack gap="md" align="center">
              <Loader color="teal" size="lg" />
              <Text c="dimmed">جاري تحميل الملف الكامل...</Text>
            </Stack>
          </Center>
        ) : touristDetails ? (
          <Stack gap="lg">
            {/* ✅ 1. رأس الملف: صورة مربعة في الزاوية + المعلومات بجانبها */}
            <Paper p="lg" radius="lg" withBorder style={{ 
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', 
              border: '2px solid #0A3A2A' 
            }}>
              <Group align="flex-start" gap="lg" wrap="nowrap">
                {/* ✅ حاوية الصورة: مربع ثابت 120x120 في الزاوية */}
                <Box style={PROFILE_AVATAR_STYLES.wrapper}>
                  {touristDetails.profileImageUrl ? (
                    <Image
                      src={buildFullImageUrl(touristDetails.profileImageUrl)}
                      alt={`${touristDetails.firstName} ${touristDetails.lastName}`}
                      style={PROFILE_AVATAR_STYLES.image}
                      fit="cover"
                      withPlaceholder
                    />
                  ) : (
                    <Center w="100%" h="100%" style={{ backgroundColor: '#0A3A2A' }}>
                      <Text size="xl" fw={800} c="#ffffff" style={{ fontSize: 42 }}>
                        {touristDetails.firstName?.charAt(0) || '?'}
                      </Text>
                    </Center>
                  )}
                </Box>

                {/* ✅ المعلومات بجانب الصورة */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text size="xl" fw={800} c="#0A3A2A">
                    {touristDetails.firstName} {touristDetails.lastName}
                  </Text>
                  <Group gap="xs" mt={6}>
                    <Badge 
                      color={selectedTourist?.status === 1 ? 'green' : 'red'} 
                      variant="light"
                      leftSection={selectedTourist?.status === 1 ? <IconCheck size={12}/> : <IconShieldLock size={12}/>}
                    >
                      {selectedTourist?.status === 1 ? 'نشط' : 'محظور'}
                    </Badge>
                    <Badge color="blue" variant="light">سائح (Customer)</Badge>
                  </Group>
                  <Group gap="xs" mt={10}>
                    <IconMail size={14} color="#65756D" />
                    <Text size="sm" c="#65756D" style={{ wordBreak: 'break-all' }}>
                      {touristDetails.email}
                    </Text>
                  </Group>
                  <Group gap="xs" mt={4}>
                    <IconCalendar size={14} color="#65756D" />
                    <Text size="sm" c="dimmed">
                      تاريخ التسجيل: {formatDateTime(touristDetails.createdAt)}
                    </Text>
                  </Group>
                </div>
              </Group>
            </Paper>

            {/* 2. المعلومات الأساسية */}
            <Paper p="lg" radius="lg" withBorder>
              <Group gap="xs" mb="md">
                <IconUsers size={20} color="#0A3A2A" />
                <Text fw={700} c="#0A3A2A">المعلومات الأساسية</Text>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Group gap="sm">
                  <IconMail size={18} color="#65756D" />
                  <div>
                    <Text size="xs" c="dimmed">البريد الإلكتروني</Text>
                    <Text size="sm" fw={600}>{touristDetails.email}</Text>
                  </div>
                </Group>
                <Group gap="sm">
                  <IconPhone size={18} color="#65756D" />
                  <div>
                    <Text size="xs" c="dimmed">رقم الهاتف الرئيسي</Text>
                    <Text size="sm" fw={600} dir="ltr" style={{ textAlign: 'right' }}>
                      {touristDetails.phoneNumber || 'غير متوفر'}
                    </Text>
                  </div>
                </Group>
                <Group gap="sm">
                  <IconMapPin size={18} color="#65756D" />
                  <div>
                    <Text size="xs" c="dimmed">الدولة / الجنسية</Text>
                    <Text size="sm" fw={600}>{touristDetails.country || 'غير محدد'}</Text>
                  </div>
                </Group>
                <Group gap="sm">
                  <IconUserShield size={18} color="#65756D" />
                  <div>
                    <Text size="xs" c="dimmed">المعرف (ID)</Text>
                    <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                      {touristDetails.userId}
                    </Text>
                  </div>
                </Group>
              </SimpleGrid>

              {/* الأرقام الإضافية */}
              {touristDetails.additionalPhoneNumbers && touristDetails.additionalPhoneNumbers.length > 0 && (
                <>
                  <Divider my="md" />
                  <Group gap="xs" mb="sm">
                    <IconPlus size={16} color="#1d4ed8" />
                    <Text fw={700} c="#1d4ed8" size="sm">أرقام هاتف إضافية ({touristDetails.additionalPhoneNumbers.length})</Text>
                  </Group>
                  <Group gap="xs" wrap="wrap">
                    {touristDetails.additionalPhoneNumbers.map((num, idx) => (
                      <Badge key={idx} color="blue" variant="light" size="lg" dir="ltr">
                        {num}
                      </Badge>
                    ))}
                  </Group>
                </>
              )}
            </Paper>

            {/* 3. أرقام الطوارئ */}
            <Paper p="lg" radius="lg" withBorder style={{ backgroundColor: '#fffbeb', borderColor: '#f59e0b' }}>
              <Group gap="xs" mb="md">
                <IconAlertCircle size={20} color="#d97706" />
                <Text fw={700} c="#92400e">أرقام الطوارئ</Text>
              </Group>
              {touristDetails.emergencyNumbers && touristDetails.emergencyNumbers.length > 0 ? (
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {touristDetails.emergencyNumbers.map((num, idx) => (
                    <Group key={idx} gap="sm" p="sm" style={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '8px', 
                      border: '1px solid #fde68a' 
                    }}>
                      <ThemeIcon size="md" radius="md" color="orange" variant="light">
                        <IconPhone size={16} />
                      </ThemeIcon>
                      <Text size="sm" fw={700} c="#78350f" dir="ltr">
                        {num}
                      </Text>
                    </Group>
                  ))}
                </SimpleGrid>
              ) : (
                <Text size="sm" c="#92400e" ta="center" py="md">
                  لم يتم إضافة أرقام طوارئ من قبل السائح
                </Text>
              )}
            </Paper>

            {/* 4. الملف الطبي */}
            <Paper p="lg" radius="lg" withBorder style={{ backgroundColor: '#fef2f2', borderColor: '#f87171' }}>
              <Group gap="xs" mb="md">
                <IconHeartbeat size={20} color="#dc2626" />
                <Text fw={700} c="#991b1b">الملف الطبي</Text>
              </Group>
              {touristDetails.medicalProfile ? (
                <>
                  <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                    <Box p="md" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #fecaca' }}>
                      <Text size="xs" c="dimmed" fw={600} mb={4}>الأمراض المزمنة</Text>
                      <Text size="sm" c="#7f1d1d" fw={500}>
                        {touristDetails.medicalProfile.chronicDiseases || 'لا يوجد'}
                      </Text>
                    </Box>
                    <Box p="md" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #fecaca' }}>
                      <Group gap={4} mb={4}>
                        <IconAlertCircle size={12} color="#dc2626" />
                        <Text size="xs" c="dimmed" fw={600}>الحساسية</Text>
                      </Group>
                      <Text size="sm" c="#7f1d1d" fw={500}>
                        {touristDetails.medicalProfile.allergies || 'لا يوجد'}
                      </Text>
                    </Box>
                    <Box p="md" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #fecaca' }}>
                      <Group gap={4} mb={4}>
                        <IconPill size={12} color="#dc2626" />
                        <Text size="xs" c="dimmed" fw={600}>الأدوية الحالية</Text>
                      </Group>
                      <Text size="sm" c="#7f1d1d" fw={500}>
                        {touristDetails.medicalProfile.currentMedications || 'لا يوجد'}
                      </Text>
                    </Box>
                  </SimpleGrid>
                  {touristDetails.medicalProfile.lastUpdated && (
                    <Group gap="xs" mt="md">
                      <IconCalendar size={12} color="#991b1b" />
                      <Text size="xs" c="#991b1b">
                        آخر تحديث للملف الطبي: {formatDateTime(touristDetails.medicalProfile.lastUpdated)}
                      </Text>
                    </Group>
                  )}
                </>
              ) : (
                <Text size="sm" c="#991b1b" ta="center" py="md">
                  لم يتم تعبئة الملف الطبي من قبل السائح
                </Text>
              )}
            </Paper>

            <Divider />
            
            <Group justify="flex-end">
              <Button variant="outline" color="gray" onClick={() => { setDetailsModalOpened(false); setTouristDetails(null); }}>
                إغلاق
              </Button>
            </Group>
          </Stack>
        ) : (
          <Center p="xl">
            <Stack gap="md" align="center">
              <IconAlertTriangle size={48} color="#cbd5e1" />
              <Text c="dimmed">فشل في تحميل البيانات</Text>
            </Stack>
          </Center>
        )}
      </Modal>

    </Box>
  );
}