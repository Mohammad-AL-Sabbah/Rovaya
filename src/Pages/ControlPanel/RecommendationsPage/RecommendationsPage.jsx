import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Text, Group, Button, ThemeIcon, Table, Badge,
  TextInput, Select, ActionIcon, Stack, Divider, ScrollArea,
  Loader, Center, Modal, SimpleGrid, Tooltip, Image, FileInput,
  Switch, Textarea, NumberInput
} from '@mantine/core';
import {
  IconSearch, IconPlus, IconEdit, IconTrash, IconEye,
  IconPhoto, IconX, IconFilter, IconCheck, IconX as IconClose
} from '@tabler/icons-react';
import Swal from 'sweetalert2';
import API from '../../../API/ApiAuthToken';

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

export function RecommendationsPage() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeason, setFilterSeason] = useState('');
  const [filterActivity, setFilterActivity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const [formData, setFormData] = useState({
    titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
    occasion: '', displayOrder: 0, isActive: true, suggestedPlaceId: null
  });
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ دالة محسّنة لبناء رابط الصورة
  const getImageUrl = (imageName) => {
    if (!imageName) {
      console.log('No image name');
      return null;
    }
    
    // إذا كان الرابط كاملاً، استخدمه كما هو
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    
    // إذا كان اسم ملف فقط، أضف رابط السيرفر
    const baseUrl = 'https://rovayabackend.runasp.net';
    const fullUrl = `${baseUrl}/uploads/recommendations/${imageName}`;
    console.log('Built image URL:', fullUrl); // للـ debugging
    return fullUrl;
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('SearchName', searchQuery);
      if (filterSeason) params.append('Season', filterSeason);
      if (filterActivity) params.append('ActivityType', filterActivity);
      if (filterStatus) params.append('IsActive', filterStatus === 'active' ? 'true' : (filterStatus === 'inactive' ? 'false' : ''));
      params.append('PageNumber', 1);
      params.append('PageSize', 50);

      const response = await API.get(`/Admin/get-all-recommendations?${params.toString()}`);
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const apiData = response.data.data;
        let recs = [];
        let total = 0;
        
        if (apiData.recommendations) {
          recs = apiData.recommendations;
          total = apiData.totalCount || apiData.recommendations.length;
        } else if (Array.isArray(apiData)) {
          recs = apiData;
          total = apiData.length;
        }
        
        console.log('Recommendations:', recs);
        recs.forEach(rec => {
          console.log(`Rec ${rec.id} imageUrl:`, rec.imageUrl);
        });
        
        setRecommendations(recs);
        setTotalCount(total);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Swal.fire({ 
        icon: 'error', 
        title: 'خطأ', 
        text: `فشل في جلب التوصيات: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [searchQuery, filterSeason, filterActivity, filterStatus]);

  const openFormModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        titleAr: item.titleAr, titleEn: item.titleEn,
        descriptionAr: item.descriptionAr, descriptionEn: item.descriptionEn,
        occasion: item.occasion || '', displayOrder: item.displayOrder || 0,
        isActive: item.isActive, suggestedPlaceId: item.suggestedPlaceId
      });
      setSelectedSeason(item.season);
      setSelectedActivity(item.activityType);
      const imgUrl = getImageUrl(item.imageUrl);
      console.log('Edit mode image URL:', imgUrl);
      setImagePreview(imgUrl);
      setImageFile(null);
    } else {
      setFormData({ titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', occasion: '', displayOrder: 0, isActive: true, suggestedPlaceId: null });
      setSelectedSeason('');
      setSelectedActivity('');
      setImagePreview(null);
      setImageFile(null);
    }
    setIsFormModalOpen(true);
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
      }

      let response;
      if (editingItem) {
        data.append('Id', editingItem.id.toString());
        response = await API.put('/Admin/update-recommendation', data);
      } else {
        response = await API.post('/Admin/create-recommendation', data);
      }

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'نجاح', text: response.data.message, timer: 1500, showConfirmButton: false });
        setIsFormModalOpen(false);
        fetchRecommendations();
      } else {
        Swal.fire({ icon: 'error', title: 'فشل', text: response.data.message });
      }
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire({ 
        icon: 'error', 
        title: 'خطأ', 
        text: error.response?.data?.message || 'حدث خطأ أثناء الحفظ' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "سيتم حذف هذه التوصية نهائياً!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#0A3A2A',
      confirmButtonText: 'نعم، احذفها',
      cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
      try {
        const response = await API.delete(`/Admin/delete-recommendation/${id}`);
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

  const handleImageChange = (file) => {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(editingItem ? getImageUrl(editingItem.imageUrl) : null);
    }
  };

  // ✅ مكون صورة مع معالجة الأخطاء
  const RecommendationImage = ({ imageUrl, width = 60, height = 40 }) => {
    const [imgError, setImgError] = useState(false);
    const fullUrl = getImageUrl(imageUrl);
    
    if (!fullUrl || imgError) {
      return <ThemeIcon size={40} radius="md" color="gray" variant="light"><IconPhoto size={20} /></ThemeIcon>;
    }
    
    return (
      <Image 
        src={fullUrl} 
        alt="rec" 
        width={width} 
        height={height} 
        radius="md" 
        style={{ objectFit: 'cover' }}
        onError={() => {
          console.error('Failed to load image:', fullUrl);
          setImgError(true);
        }}
      />
    );
  };

  return (
    <Box style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 75px)', direction: 'rtl' }}>
      
      <Paper p="lg" radius="lg" withBorder mb="lg" style={{ background: 'linear-gradient(135deg, #0A3A2A 0%, #114d38 100%)', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Group gap="xs">
            <IconPhoto size={32} color="#E8B04B" />
            <Text fw={800} size="xl">إدارة التوصيات والمقترحات</Text>
          </Group>
          <Text size="sm" c="rgba(255,255,255,0.8)" mt={4}>إضافة وتعديل التوصيات السياحية الموجهة للمستخدمين</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} style={{ backgroundColor: '#E8B04B', color: '#0A3A2A', fontWeight: 700 }} onClick={() => openFormModal()}>
          إضافة توصية جديدة
        </Button>
      </Paper>

      <Paper p="lg" radius="lg" withBorder mb="lg">
        <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="md">
          <TextInput placeholder="بحث بالعنوان..." leftSection={<IconSearch size={18} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <Select placeholder="الموسم" data={SEASON_OPTIONS} value={filterSeason} onChange={setFilterSeason} clearable />
          <Select placeholder="نوع النشاط" data={ACTIVITY_OPTIONS} value={filterActivity} onChange={setFilterActivity} clearable />
          <Select 
            placeholder="الحالة" 
            data={[{ value: 'active', label: 'نشط' }, { value: 'inactive', label: 'غير نشط' }]} 
            value={filterStatus} 
            onChange={setFilterStatus} 
            clearable 
          />
        </SimpleGrid>
      </Paper>

      <Paper radius="lg" withBorder style={{ overflow: 'hidden' }}>
        {loading ? <Center p="xl"><Loader color="teal" /></Center> : (
          <ScrollArea>
            <Table highlightOnHover style={{ minWidth: 1000 }}>
              <Table.Thead style={{ backgroundColor: '#0A3A2A' }}>
                <Table.Tr>
                  {['الصورة', 'العنوان (عربي)', 'الموسم', 'النشاط', 'الحالة', 'الإجراءات'].map(h => (
                    <Table.Th key={h} style={{ color: '#fff', fontWeight: 700 }}>{h}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recommendations.length === 0 ? (
                  <Table.Tr><Table.Td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}><Text c="dimmed">لا توجد توصيات</Text></Table.Td></Table.Tr>
                ) : recommendations.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <RecommendationImage imageUrl={item.imageUrl} />
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600} size="sm">{item.titleAr}</Text>
                      <Text size="xs" c="dimmed">{item.titleEn}</Text>
                    </Table.Td>
                    <Table.Td><Badge variant="light" color="blue">{item.season}</Badge></Table.Td>
                    <Table.Td><Badge variant="light" color="teal">{item.activityType}</Badge></Table.Td>
                    <Table.Td>
                      <Badge color={item.isActive ? 'green' : 'gray'} variant="light" leftSection={item.isActive ? <IconCheck size={12} /> : <IconClose size={12} />}>
                        {item.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="عرض"><ActionIcon color="blue" variant="light" onClick={() => { setViewItem(item); setIsViewModalOpen(true); }}><IconEye size={18} /></ActionIcon></Tooltip>
                        <Tooltip label="تعديل"><ActionIcon color="orange" variant="light" onClick={() => openFormModal(item)}><IconEdit size={18} /></ActionIcon></Tooltip>
                        <Tooltip label="حذف"><ActionIcon color="red" variant="light" onClick={() => handleDelete(item.id)}><IconTrash size={18} /></ActionIcon></Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Paper>

      <Modal opened={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingItem ? 'تعديل التوصية' : 'إضافة توصية جديدة'} size="lg" centered>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <SimpleGrid cols={2}>
              <TextInput label="العنوان (عربي)" required value={formData.titleAr} onChange={e => setFormData({...formData, titleAr: e.target.value})} />
              <TextInput label="العنوان (إنجليزي)" required value={formData.titleEn} onChange={e => setFormData({...formData, titleEn: e.target.value})} />
            </SimpleGrid>
            
            <SimpleGrid cols={2}>
              <Select label="الموسم" data={SEASON_OPTIONS} required value={selectedSeason} onChange={setSelectedSeason} />
              <Select label="نوع النشاط" data={ACTIVITY_OPTIONS} required value={selectedActivity} onChange={setSelectedActivity} />
            </SimpleGrid>

            <SimpleGrid cols={2}>
              <Textarea label="الوصف (عربي)" required minRows={3} value={formData.descriptionAr} onChange={e => setFormData({...formData, descriptionAr: e.target.value})} />
              <Textarea label="الوصف (إنجليزي)" required minRows={3} value={formData.descriptionEn} onChange={e => setFormData({...formData, descriptionEn: e.target.value})} />
            </SimpleGrid>

            <SimpleGrid cols={2}>
              <TextInput label="المناسبة (اختياري)" value={formData.occasion} onChange={e => setFormData({...formData, occasion: e.target.value})} />
              <NumberInput label="ترتيب العرض" value={formData.displayOrder} onChange={val => setFormData({...formData, displayOrder: val})} />
            </SimpleGrid>

            <FileInput 
              label="صورة التوصية" 
              placeholder="اختر صورة" 
              accept="image/png,image/jpeg,image/webp"
              value={imageFile}
              onChange={handleImageChange}
              leftSection={<IconPhoto size={18} />}
            />
            {imagePreview && (
              <Box style={{ textAlign: 'center', mt: -10 }}>
                <Image src={imagePreview} alt="Preview" width={150} height={100} radius="md" style={{ objectFit: 'cover', border: '2px solid #e2e8f0' }} />
              </Box>
            )}

            <Group justify="space-between" mt="md">
              <Switch label="توصية نشطة" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.currentTarget.checked})} />
              <Group gap="xs">
                <Button variant="outline" color="gray" onClick={() => setIsFormModalOpen(false)}>إلغاء</Button>
                <Button type="submit" color="teal" loading={submitting} leftSection={<IconCheck size={18} />}>
                  {editingItem ? 'حفظ التعديلات' : 'إنشاء التوصية'}
                </Button>
              </Group>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal opened={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="تفاصيل التوصية" size="lg" centered>
        {viewItem && (
          <Stack gap="md">
            {viewItem.imageUrl && <RecommendationImage imageUrl={viewItem.imageUrl} width="100%" height={200} />}
            <SimpleGrid cols={2}>
              <div><Text fw={700} c="dimmed" size="sm">العنوان</Text><Text fw={600}>{viewItem.titleAr}</Text></div>
              <div><Text fw={700} c="dimmed" size="sm">Title</Text><Text fw={600}>{viewItem.titleEn}</Text></div>
            </SimpleGrid>
            <Divider />
            <SimpleGrid cols={2}>
              <div><Text fw={700} c="dimmed" size="sm">الموسم</Text><Badge variant="light">{viewItem.season}</Badge></div>
              <div><Text fw={700} c="dimmed" size="sm">النشاط</Text><Badge variant="light">{viewItem.activityType}</Badge></div>
            </SimpleGrid>
            <div><Text fw={700} c="dimmed" size="sm">الوصف</Text><Text size="sm" mt={4}>{viewItem.descriptionAr}</Text></div>
          </Stack>
        )}
      </Modal>

    </Box>
  );
}