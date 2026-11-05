import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Text, Group, Button, ThemeIcon, Table, Badge,
  TextInput, Select, ActionIcon, Stack, Divider, ScrollArea,
  Loader, Center, Modal, SimpleGrid, Tooltip, Image, FileInput,
  Switch, Textarea, NumberInput, Card
} from '@mantine/core';
import {
  IconSearch, IconPlus, IconEdit, IconTrash, IconEye,
  IconPhoto, IconCheck, IconX, IconSparkles,
  IconCalendar, IconCategory, IconRefresh,
  IconMapPin, IconClipboardList, IconFilter,
  IconWorld, IconPhotoOff
} from '@tabler/icons-react';
import Swal from 'sweetalert2';
import API from '../../../API/ApiAuthToken';

const PRIMARY = '#0A3A2A';
const SECONDARY = '#114d38';
const GOLD = '#E8B04B';
const LIGHT_BG = '#F5F8F6';

const SEASON_OPTIONS = [
  { value: 'Spring', label: 'ربيع' },
  { value: 'Summer', label: 'صيف' },
  { value: 'Autumn', label: 'خريف' },
  { value: 'Winter', label: 'شتاء' },
  { value: 'AllYear', label: 'طوال العام' },
];

const ACTIVITY_OPTIONS = [
  { value: 'Cultural', label: 'ثقافي' },
  { value: 'Adventure', label: 'مغامرة' },
  { value: 'Religious', label: 'ديني' },
  { value: 'Nature', label: 'طبيعة' },
  { value: 'Food', label: 'طعام' },
];

const seasonLabel = (value) =>
  SEASON_OPTIONS.find(x => x.value === value)?.label || value || '—';

const activityLabel = (value) =>
  ACTIVITY_OPTIONS.find(x => x.value === value)?.label || value || '—';

export function RecommendationsPage() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeason, setFilterSeason] = useState(null);
  const [filterActivity, setFilterActivity] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    occasion: '',
    displayOrder: 0,
    isActive: true,
    suggestedPlaceId: null
  });

  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // ✅ حالة جديدة لتتبع ما إذا كان المستخدم قد مسح الصورة عمداً
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    const baseUrl = 'https://rovayabackend.runasp.net';
    return `${baseUrl}/uploads/recommendations/${imageName}`;
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('SearchName', searchQuery);
      if (filterSeason) params.append('Season', filterSeason);
      if (filterActivity) params.append('ActivityType', filterActivity);
      if (filterStatus) {
        params.append('IsActive', filterStatus === 'active' ? 'true' : 'false');
      }
      params.append('PageNumber', 1);
      params.append('PageSize', 50);

      const response = await API.get(`/api/Admin/get-all-recommendations?${params.toString()}`);

      if (response.data.success) {
        const apiData = response.data.data;
        let recs = [];
        let total = 0;

        if (apiData?.recommendations) {
          recs = apiData.recommendations;
          total = apiData.totalCount || recs.length;
        } else if (Array.isArray(apiData)) {
          recs = apiData;
          total = recs.length;
        }

        setRecommendations(recs);
        setTotalCount(total);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Swal.fire({ icon: 'error', title: 'خطأ', text: `فشل في جلب التوصيات: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterSeason, filterActivity, filterStatus]);

  const activeCount = recommendations.filter(x => x.isActive).length;
  const inactiveCount = recommendations.filter(x => !x.isActive).length;

  const openFormModal = (item = null) => {
    setEditingItem(item);
    setIsImageRemoved(false); // ✅ إعادة تعيين حالة المسح عند فتح الموديل

    if (item) {
      setFormData({
        titleAr: item.titleAr || '',
        titleEn: item.titleEn || '',
        descriptionAr: item.descriptionAr || '',
        descriptionEn: item.descriptionEn || '',
        occasion: item.occasion || '',
        displayOrder: item.displayOrder || 0,
        isActive: item.isActive,
        suggestedPlaceId: item.suggestedPlaceId
      });

      setSelectedSeason(item.season || null);
      setSelectedActivity(item.activityType || null);
      setImagePreview(getImageUrl(item.imageUrl));
      setImageFile(null);
    } else {
      setFormData({
        titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
        occasion: '', displayOrder: 0, isActive: true, suggestedPlaceId: null
      });
      setSelectedSeason(null);
      setSelectedActivity(null);
      setImagePreview(null);
      setImageFile(null);
    }

    setIsFormModalOpen(true);
  };

  // ✅ دالة معالجة تغيير الصورة المُحسّنة
  const handleImageChange = (file) => {
    setImageFile(file);
    if (file) {
      setIsImageRemoved(false); // المستخدم اختار صورة جديدة
      setImagePreview(URL.createObjectURL(file));
    } else {
      setIsImageRemoved(true); // المستخدم ضغط على زر المسح (X)
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();

      data.append('TitleAr', formData.titleAr);
      data.append('TitleEn', formData.titleEn);
      data.append('DescriptionAr', formData.descriptionAr);
      data.append('DescriptionEn', formData.descriptionEn);
      data.append('Season', selectedSeason);
      data.append('ActivityType', selectedActivity);

      if (formData.occasion) data.append('Occasion', formData.occasion);
      if (formData.suggestedPlaceId) data.append('SuggestedPlaceId', formData.suggestedPlaceId);

      data.append('DisplayOrder', formData.displayOrder.toString());
      data.append('IsActive', formData.isActive.toString());

      if (imageFile) {
        data.append('ImageFile', imageFile);
      } else if (isImageRemoved && editingItem) {
        // ✅ إرسال إشارة للباك إند بأن المستخدم يريد مسح الصورة
        data.append('RemoveImage', 'true'); 
      }

      let response;
      if (editingItem) {
        data.append('Id', editingItem.id.toString());
        response = await API.put('api/Admin/update-recommendation', data);
      } else {
        response = await API.post('api/Admin/create-recommendation', data);
      }

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'تم بنجاح', text: response.data.message, timer: 1500, showConfirmButton: false });
        setIsFormModalOpen(false);
        fetchRecommendations();
      } else {
        Swal.fire({ icon: 'error', title: 'فشل العملية', text: response.data.message });
      }
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire({ icon: 'error', title: 'خطأ', text: error.response?.data?.message || 'حدث خطأ أثناء الحفظ' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'سيتم حذف هذه التوصية نهائياً!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: PRIMARY,
      confirmButtonText: 'نعم، احذفها',
      cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
      try {
        const response = await API.delete(`api/Admin/delete-recommendation/${id}`);
        if (response.data.success) {
          Swal.fire({ icon: 'success', title: 'تم الحذف', timer: 1500, showConfirmButton: false });
          fetchRecommendations();
        } else {
          Swal.fire({ icon: 'error', title: 'فشل', text: response.data.message });
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'خطأ', text: 'فشل في حذف التوصية' });
      }
    }
  };

  const RecommendationImage = ({ imageUrl, width = 64, height = 48 }) => {
    const [imgError, setImgError] = useState(false);
    const fullUrl = getImageUrl(imageUrl);

    if (!fullUrl || imgError) {
      return (
        <Center w={width} h={height} style={{ background: '#EDF3EF', borderRadius: 10, border: '1px solid #E1EAE4' }}>
          <IconPhotoOff size={22} color="#779184" />
        </Center>
      );
    }

    return (
      <Image
        src={fullUrl}
        alt="Recommendation"
        w={width}
        h={height}
        radius="md"
        fit="cover"
        onError={() => setImgError(true)}
      />
    );
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card radius="lg" padding="lg" withBorder style={{ borderColor: '#E5ECE7', background: '#fff', boxShadow: '0 3px 14px rgba(10,58,42,0.035)' }}>
      <Group justify="space-between" align="center">
        <Box>
          <Text size="sm" c="dimmed" fw={600}>{title}</Text>
          <Text size="2rem" fw={800} c={PRIMARY} mt={5}>{value}</Text>
          <Text size="xs" c="dimmed" mt={3}>{subtitle}</Text>
        </Box>
        <ThemeIcon size={52} radius="xl" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );

  const inputStyles = {
    input: { borderColor: '#DCE7DF', borderRadius: 9 },
    label: { color: PRIMARY, fontWeight: 600, marginBottom: 6 }
  };


useEffect(() => {
  document.title = 'إدارة التوصيات | ROVAYA';
}, []); 

  return (
    <Box dir="rtl" style={{ background: LIGHT_BG, minHeight: 'calc(100vh - 75px)', color: PRIMARY }}>
      <Stack gap="xl">
        {/* Header */}
        <Paper radius="xl" p={{ base: 'lg', md: 'xl' }} style={{ background: `linear-gradient(115deg, ${PRIMARY}, ${SECONDARY})`, color: '#fff', position: 'relative', overflow: 'hidden', border: 'none' }}>
          <Box style={{ position: 'absolute', width: 230, height: 230, borderRadius: '50%', background: 'rgba(255,255,255,0.045)', top: -120, left: 100 }} />
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="md">
              <ThemeIcon size={58} radius="lg" style={{ background: 'rgba(232,176,75,0.17)', color: GOLD, border: '1px solid rgba(232,176,75,0.35)' }}>
                <IconSparkles size={30} />
              </ThemeIcon>
              <Box>
                <Text size="xl" fw={800}>إدارة التوصيات والمقترحات</Text>
                <Text size="sm" c="rgba(255,255,255,0.75)" mt={5}>إدارة المحتوى السياحي والتوصيات الموجهة لزوار ROVAYA</Text>
              </Box>
            </Group>
            <Button size="md" radius="md" leftSection={<IconPlus size={18} />} onClick={() => openFormModal()} style={{ background: GOLD, color: PRIMARY, fontWeight: 800 }}>
              إضافة توصية جديدة
            </Button>
          </Group>
        </Paper>

        {/* Statistics */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          <StatCard title="إجمالي التوصيات" value={totalCount} subtitle="عدد التوصيات المسجلة" color="teal" icon={<IconClipboardList size={25} />} />
          <StatCard title="التوصيات النشطة" value={activeCount} subtitle="ظاهرة للمستخدمين ضمن النتائج" color="green" icon={<IconCheck size={25} />} />
          <StatCard title="التوصيات غير النشطة" value={inactiveCount} subtitle="غير مفعّلة حالياً" color="gray" icon={<IconX size={25} />} />
        </SimpleGrid>

        {/* Filters */}
        <Paper radius="lg" p="lg" withBorder style={{ borderColor: '#E5ECE7' }}>
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <ThemeIcon color="teal" variant="light" radius="md"><IconFilter size={18} /></ThemeIcon>
              <Text fw={700} c={PRIMARY}>البحث والتصفية</Text>
            </Group>
            <Button variant="subtle" color="teal" size="xs" leftSection={<IconRefresh size={15} />} onClick={() => { setSearchQuery(''); setFilterSeason(null); setFilterActivity(null); setFilterStatus(null); }}>
              إعادة ضبط الفلاتر
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            <TextInput placeholder="ابحث بعنوان التوصية..." leftSection={<IconSearch size={17} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} styles={inputStyles} />
            <Select placeholder="جميع المواسم" data={SEASON_OPTIONS} value={filterSeason} onChange={setFilterSeason} clearable searchable styles={inputStyles} />
            <Select placeholder="جميع الأنشطة" data={ACTIVITY_OPTIONS} value={filterActivity} onChange={setFilterActivity} clearable styles={inputStyles} />
            <Select placeholder="جميع الحالات" data={[{ value: 'active', label: 'نشط' }, { value: 'inactive', label: 'غير نشط' }]} value={filterStatus} onChange={setFilterStatus} clearable styles={inputStyles} />
          </SimpleGrid>
        </Paper>

        {/* Table */}
        <Paper radius="lg" withBorder style={{ overflow: 'hidden', borderColor: '#E5ECE7', background: '#fff' }}>
          <Group justify="space-between" p="lg" style={{ borderBottom: '1px solid #E9EFEB' }}>
            <Box>
              <Text fw={800} size="lg" c={PRIMARY}>قائمة التوصيات</Text>
              <Text size="xs" c="dimmed" mt={4}>استعرض وأدرج وعدّل التوصيات السياحية</Text>
            </Box>
            <Badge size="lg" radius="md" variant="light" color="teal">{recommendations.length} نتيجة</Badge>
          </Group>

          {loading ? (
            <Center p={70}>
              <Stack align="center" gap="sm">
                <Loader color="teal" size="lg" />
                <Text size="sm" c="dimmed">جاري تحميل التوصيات...</Text>
              </Stack>
            </Center>
          ) : (
            <ScrollArea>
              <Table highlightOnHover verticalSpacing="md" horizontalSpacing="lg" style={{ minWidth: 850 }}>
                <Table.Thead>
                  <Table.Tr style={{ background: '#F5F8F6' }}>
                    {['الصورة', 'التوصية', 'الموسم', 'نوع النشاط', 'الحالة', 'الإجراءات'].map((heading) => (
                      <Table.Th key={heading} style={{ color: PRIMARY, fontWeight: 800, whiteSpace: 'nowrap', borderBottom: '1px solid #E5ECE7' }}>
                        {heading}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {recommendations.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Center py={55}>
                          <Stack align="center" gap="xs">
                            <ThemeIcon size={55} radius="xl" variant="light" color="gray"><IconPhoto size={27} /></ThemeIcon>
                            <Text fw={700} c="dimmed">لا توجد توصيات</Text>
                            <Text size="xs" c="dimmed">جرّب تغيير خيارات البحث أو أضف توصية جديدة</Text>
                          </Stack>
                        </Center>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    recommendations.map((item) => (
                      <Table.Tr key={item.id}>
                        <Table.Td><RecommendationImage imageUrl={item.imageUrl} /></Table.Td>
                        <Table.Td>
                          <Stack gap={3}>
                            <Text fw={700} size="sm" c={PRIMARY}>{item.titleAr}</Text>
                            <Text size="xs" c="dimmed">{item.titleEn}</Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td><Badge variant="light" color="blue" radius="sm">{seasonLabel(item.season)}</Badge></Table.Td>
                        <Table.Td><Badge variant="light" color="teal" radius="sm">{activityLabel(item.activityType)}</Badge></Table.Td>
                        <Table.Td>
                          <Badge color={item.isActive ? 'green' : 'gray'} variant="light" radius="sm" leftSection={item.isActive ? <IconCheck size={12} /> : <IconX size={12} />}>
                            {item.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={7} wrap="nowrap">
                            <Tooltip label="عرض التفاصيل">
                              <ActionIcon variant="light" color="blue" radius="md" size="lg" onClick={() => { setViewItem(item); setIsViewModalOpen(true); }}>
                                <IconEye size={17} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="تعديل">
                              <ActionIcon variant="light" color="orange" radius="md" size="lg" onClick={() => openFormModal(item)}>
                                <IconEdit size={17} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="حذف">
                              <ActionIcon variant="light" color="red" radius="md" size="lg" onClick={() => handleDelete(item.id)}>
                                <IconTrash size={17} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Paper>
      </Stack>

      {/* Add / Edit Modal */}
      <Modal
        opened={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={
          <Group gap="sm">
            <ThemeIcon color="teal" variant="light" radius="md" size="lg">
              {editingItem ? <IconEdit size={19} /> : <IconPlus size={19} />}
            </ThemeIcon>
            <Box>
              <Text fw={800} c={PRIMARY}>{editingItem ? 'تعديل التوصية' : 'إضافة توصية جديدة'}</Text>
              <Text size="xs" c="dimmed">أدخل معلومات التوصية السياحية</Text>
            </Box>
          </Group>
        }
        size="xl"
        centered
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            <Box>
              <Text fw={700} size="sm" c={PRIMARY} mb="sm">المعلومات الأساسية</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput label="العنوان بالعربية" placeholder="مثال: زيارة البلدة القديمة" required value={formData.titleAr} onChange={e => setFormData({ ...formData, titleAr: e.target.value })} styles={inputStyles} />
                <TextInput label="العنوان بالإنجليزية" placeholder="Recommendation title" required value={formData.titleEn} onChange={e => setFormData({ ...formData, titleEn: e.target.value })} styles={inputStyles} />
              </SimpleGrid>
            </Box>

            <Divider color="#E7EEE9" />

            <Box>
              <Text fw={700} size="sm" c={PRIMARY} mb="sm">تصنيف التوصية</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Select label="الموسم المناسب" placeholder="اختر الموسم" data={SEASON_OPTIONS} required value={selectedSeason} onChange={setSelectedSeason} styles={inputStyles} />
                <Select label="نوع النشاط" placeholder="اختر النشاط" data={ACTIVITY_OPTIONS} required value={selectedActivity} onChange={setSelectedActivity} styles={inputStyles} />
              </SimpleGrid>
            </Box>

            <Divider color="#E7EEE9" />

            <Box>
              <Text fw={700} size="sm" c={PRIMARY} mb="sm">وصف التوصية</Text>
              <Stack gap="md">
                <Textarea label="الوصف بالعربية" placeholder="اكتب وصفاً واضحاً للتوصية..." required minRows={4} autosize value={formData.descriptionAr} onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })} styles={inputStyles} />
                <Textarea label="الوصف بالإنجليزية" placeholder="Write the recommendation description..." required minRows={4} autosize value={formData.descriptionEn} onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })} styles={inputStyles} />
              </Stack>
            </Box>

            <Divider color="#E7EEE9" />

            <Box>
              <Text fw={700} size="sm" c={PRIMARY} mb="sm">معلومات إضافية</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput label="المناسبة" placeholder="اختياري" value={formData.occasion} onChange={e => setFormData({ ...formData, occasion: e.target.value })} styles={inputStyles} />
                <NumberInput label="ترتيب العرض" min={0} value={formData.displayOrder} onChange={val => setFormData({ ...formData, displayOrder: val })} styles={inputStyles} />
              </SimpleGrid>
            </Box>

            <Divider color="#E7EEE9" />

            <Box>
              <Text fw={700} size="sm" c={PRIMARY} mb="sm">صورة التوصية</Text>
              <FileInput
                placeholder="اختر صورة من جهازك"
                accept="image/png,image/jpeg,image/webp"
                value={imageFile}
                onChange={handleImageChange}
                leftSection={<IconPhoto size={18} />}
                clearable
                styles={inputStyles}
              />

              {imagePreview && (
                <Box mt="md" p="sm" style={{ background: '#F5F8F6', borderRadius: 12, border: '1px solid #E3EBE5' }}>
                  <Group justify="space-between" mb="xs">
                    <Text size="xs" fw={600} c={PRIMARY}>معاينة الصورة</Text>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => {
                        setImageFile(null);
                        setIsImageRemoved(true); // ✅ تأكيد المسح عند الضغط على X
                        setImagePreview(null);
                      }}
                    >
                      <IconX size={15} />
                    </ActionIcon>
                  </Group>
                  <Center>
                    <Image src={imagePreview} alt="Preview" w="100%" maw={340} h={180} radius="md" fit="cover" />
                  </Center>
                </Box>
              )}
            </Box>

            <Paper p="md" radius="md" style={{ background: '#F5F8F6', border: '1px solid #E3EBE5' }}>
              <Group justify="space-between" align="center">
                <Box>
                  <Text fw={700} size="sm" c={PRIMARY}>حالة التوصية</Text>
                  <Text size="xs" c="dimmed" mt={3}>تفعيل التوصية لإظهارها للمستخدمين</Text>
                </Box>
                <Switch
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.currentTarget.checked })}
                  color="teal"
                  size="md"
                  label={formData.isActive ? 'نشطة' : 'غير نشطة'}
                />
              </Group>
            </Paper>

            <Group justify="flex-end" mt="xs">
              <Button variant="light" color="gray" onClick={() => setIsFormModalOpen(false)}>إلغاء</Button>
              <Button type="submit" loading={submitting} leftSection={<IconCheck size={18} />} style={{ background: PRIMARY, color: '#fff' }}>
                {editingItem ? 'حفظ التعديلات' : 'إنشاء التوصية'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        opened={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={
          <Group gap="sm">
            <ThemeIcon color="teal" variant="light" radius="md"><IconEye size={19} /></ThemeIcon>
            <Text fw={800} c={PRIMARY}>تفاصيل التوصية</Text>
          </Group>
        }
        size="lg"
        centered
        radius="lg"
      >
        {viewItem && (
          <Stack gap="md">
            {viewItem.imageUrl && (
              <Image
                src={getImageUrl(viewItem.imageUrl)}
                alt={viewItem.titleAr}
                h={220}
                radius="lg"
                fit="cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <Box>
              <Text size="xs" fw={700} c="dimmed" mb={5}>العنوان بالعربية</Text>
              <Text fw={800} size="lg" c={PRIMARY}>{viewItem.titleAr}</Text>
            </Box>
            <Box>
              <Text size="xs" fw={700} c="dimmed" mb={5}>English Title</Text>
              <Text fw={600}>{viewItem.titleEn}</Text>
            </Box>
            <Divider color="#E7EEE9" />
            <SimpleGrid cols={2}>
              <Box>
                <Group gap={5} mb={6}><IconCalendar size={15} color={SECONDARY} /><Text size="xs" fw={700} c="dimmed">الموسم</Text></Group>
                <Badge color="blue" variant="light">{seasonLabel(viewItem.season)}</Badge>
              </Box>
              <Box>
                <Group gap={5} mb={6}><IconCategory size={15} color={SECONDARY} /><Text size="xs" fw={700} c="dimmed">نوع النشاط</Text></Group>
                <Badge color="teal" variant="light">{activityLabel(viewItem.activityType)}</Badge>
              </Box>
            </SimpleGrid>
            <Divider color="#E7EEE9" />
            <Box>
              <Text fw={700} size="sm" c={PRIMARY} mb={6}>الوصف بالعربية</Text>
              <Text size="sm" lh={1.8} c="dark.6">{viewItem.descriptionAr}</Text>
            </Box>
            <Box>
              <Text fw={700} size="sm" c={PRIMARY} mb={6}>Description in English</Text>
              <Text size="sm" lh={1.7} c="dark.6">{viewItem.descriptionEn}</Text>
            </Box>
            {viewItem.occasion && (
              <Box>
                <Text fw={700} size="sm" c={PRIMARY} mb={5}>المناسبة</Text>
                <Text size="sm">{viewItem.occasion}</Text>
              </Box>
            )}
            <Divider color="#E7EEE9" />
            <Group justify="space-between">
              <Badge color={viewItem.isActive ? 'green' : 'gray'} variant="light" size="lg">
                {viewItem.isActive ? 'توصية نشطة' : 'توصية غير نشطة'}
              </Badge>
              <Text size="xs" c="dimmed">ترتيب العرض: {viewItem.displayOrder ?? 0}</Text>
            </Group>
            <Button fullWidth variant="light" color="teal" leftSection={<IconEdit size={17} />} onClick={() => { setIsViewModalOpen(false); openFormModal(viewItem); }}>
              تعديل التوصية
            </Button>
          </Stack>
        )}
      </Modal>
    </Box>
  );
}