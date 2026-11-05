import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Text,
  Group,
  Button,
  Badge,
  ActionIcon,
  Stack,
  Modal,
  TextInput,
  Textarea,
  Image,
  Select,
  Loader,
  Center,
  Divider,
  SimpleGrid,
  Card,
  ThemeIcon,
  NumberInput
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconPhoto,
  IconVideo,
  IconFileText,
  IconX,
  IconSearch,
  IconFilter,
  IconBuilding,
  IconLanguage,
  IconListNumbers,
  IconDeviceFloppy,
  IconMapPin,
  IconFileDescription,
  IconCheck,
  IconLayersIntersect,
  IconUpload,
  IconPlayerPlay
} from '@tabler/icons-react';
import Swal from 'sweetalert2';
import API from '../../../API/ApiAuthToken';

const GREEN = '#0A3A2A';
const GREEN_LIGHT = '#114d38';
const GOLD = '#E8B04B';

const inputStyles = {
  input: {
    borderRadius: 10,
    minHeight: 42
  },
  label: {
    fontWeight: 600,
    marginBottom: 7,
    color: '#344054'
  }
};

export function CitySections() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cities, setCities] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const [formData, setFormData] = useState({
    cityId: '',
    titleAr: '',
    titleEn: '',
    contentAr: '',
    contentEn: '',
    order: 1
  });

  const [existingImages, setExistingImages] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newVideoFiles, setNewVideoFiles] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);

  const fetchCities = async () => {
    try {
      const response = await API.get('/api/Admin/get-all-cities?langCode=ar');
      if (response.data.success) {
        setCities(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      Swal.fire({ icon: 'error', title: 'تعذر تحميل المدن', text: error.response?.data?.message || 'حدث خطأ' });
    }
  };

  const fetchCitySections = async (cityId = selectedCity) => {
    if (cities.length === 0) {
      setAllSections([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (cityId === 'all') {
        const responses = await Promise.all(cities.map(city => API.get(`/api/Admin/get-city-sections/${city.id}`)));
        const sections = [];
        responses.forEach((response, index) => {
          if (response.data.success && response.data.data) {
            const citySections = response.data.data.map(section => ({
              ...section,
              cityId: section.cityId ?? cities[index].id
            }));
            sections.push(...citySections);
          }
        });
        setAllSections(sections);
      } else {
        const response = await API.get(`/api/Admin/get-city-sections/${cityId}`);
        if (response.data.success) {
          const sections = (response.data.data || []).map(section => ({
            ...section,
            cityId: section.cityId ?? Number(cityId)
          }));
          setAllSections(sections);
        } else {
          setAllSections([]);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      Swal.fire({ icon: 'error', title: 'تعذر تحميل الأقسام', text: error.response?.data?.message || 'حدث خطأ' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchCities();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (cities.length > 0) {
      fetchCitySections(selectedCity);
    }
  }, [cities, selectedCity]);

  useEffect(() => {
    return () => {
      videoPreviews.forEach(url => {
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [videoPreviews]);

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allSections;
    return allSections.filter(section => {
      const titleAr = section.title || '';
      const titleEn = section.titleEn || '';
      const contentAr = section.content || '';
      const contentEn = section.contentEn || '';
      const cityName = getCityName(section.cityId);
      return (
        titleAr.toLowerCase().includes(query) ||
        titleEn.toLowerCase().includes(query) ||
        contentAr.toLowerCase().includes(query) ||
        contentEn.toLowerCase().includes(query) ||
        cityName.toLowerCase().includes(query)
      );
    });
  }, [allSections, searchQuery, cities]);

  const getCityName = (cityId) => {
    const city = cities.find(c => Number(c.id) === Number(cityId));
    return city?.name || 'مدينة غير معروفة';
  };

  const selectedCityName = selectedCity === 'all' ? 'جميع المدن' : getCityName(selectedCity);
  const totalImages = allSections.reduce((total, section) => total + (section.images?.length || 0), 0);
  const totalVideos = allSections.reduce((total, section) => total + (section.videos?.length || 0), 0);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const openModal = (section = null) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        cityId: section.cityId?.toString() || '',
        titleAr: section.title || '',
        titleEn: section.titleEn || '',
        contentAr: section.content || '',
        contentEn: section.contentEn || '',
        order: section.order || 1
      });
      setExistingImages(section.images || []);
      setExistingVideos(section.videos || []);
      setVideoPreviews(section.videos || []);
    } else {
      setEditingSection(null);
      setFormData({
        cityId: selectedCity === 'all' ? '' : selectedCity,
        titleAr: '', titleEn: '', contentAr: '', contentEn: '', order: allSections.length + 1
      });
      setExistingImages([]);
      setExistingVideos([]);
      setVideoPreviews([]);
    }
    setNewImageFiles([]);
    setNewVideoFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    setNewImageFiles([]);
    setNewVideoFiles([]);
    setVideoPreviews([]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingVideo = (index) => {
    setExistingVideos(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (files) => {
    videoPreviews.forEach(url => {
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    });

    const filesArray = files ? Array.from(files) : [];
    setNewVideoFiles(prev => [...prev, ...filesArray]);

    if (filesArray.length > 0) {
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setVideoPreviews(prev => [...prev, ...previews]);
    }
  };

  const handleImageChange = (files) => {
    const filesArray = files ? Array.from(files) : [];
    setNewImageFiles(prev => [...prev, ...filesArray]);
  };

  const removeNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewVideo = (index) => {
    const previewUrl = videoPreviews[index + existingVideos.length];
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setNewVideoFiles(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => {
      const newPreviews = [...prev];
      newPreviews.splice(index + existingVideos.length, 1);
      return newPreviews;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cityId) {
      Swal.fire({ icon: 'warning', title: 'اختر المدينة', text: 'يجب تحديد المدينة' });
      return;
    }
    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('CityId', formData.cityId);
      formDataToSend.append('Title', formData.titleAr);
      formDataToSend.append('TitleEn', formData.titleEn);
      formDataToSend.append('Content', formData.contentAr);
      formDataToSend.append('ContentEn', formData.contentEn);
      formDataToSend.append('Order', formData.order.toString());

      existingImages.forEach(img => formDataToSend.append('ExistingImages', img));
      existingVideos.forEach(video => formDataToSend.append('ExistingVideos', video));
      newImageFiles.forEach(file => formDataToSend.append('ImageFiles', file));
      newVideoFiles.forEach(file => formDataToSend.append('VideoFiles', file));

      let response;
      if (editingSection) {
        response = await API.put(`/api/Admin/update-city-section/${editingSection.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await API.post('/api/Admin/create-city-section', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        await Swal.fire({ icon: 'success', title: 'تم الحفظ بنجاح', timer: 1600, showConfirmButton: false });
        closeModal();
        await fetchCitySections(selectedCity);
      } else {
        Swal.fire({ icon: 'error', title: 'تعذر الحفظ', text: response.data.message });
      }
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire({ icon: 'error', title: 'حدث خطأ', text: error.response?.data?.message || error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'سيتم حذف هذا القسم نهائياً',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#868e96',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      reverseButtons: true
    });
    if (!result.isConfirmed) return;
    try {
      const response = await API.delete(`/api/Admin/delete-city-section/${id}`);
      if (response.data.success) {
        await Swal.fire({ icon: 'success', title: 'تم الحذف', timer: 1500, showConfirmButton: false });
        await fetchCitySections(selectedCity);
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'فشل الحذف', text: error.response?.data?.message || 'حدث خطأ' });
    }
  };

  const cityOptions = [{ value: 'all', label: 'جميع المدن' }, ...cities.map(city => ({ value: city.id.toString(), label: city.name }))];

  // دالة لاختصار اسم الملف الطويل
  const truncateFileName = (fileName, maxLength = 25) => {
    if (!fileName) return '';
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const name = fileName.substring(0, maxLength - 4);
    return `${name}...${extension}`;
  };

  return (
    <Box dir="rtl" style={{ background: '#f5f7f6', minHeight: 'calc(100vh - 75px)', color: '#1f2937' }}>
      {/* Header */}
      <Paper radius="xl" p={{ base: 'lg', md: 'xl' }} mb="xl" style={{ background: `linear-gradient(125deg, ${GREEN} 0%, ${GREEN_LIGHT} 65%, #176344 100%)`, position: 'relative', overflow: 'hidden', border: 'none' }}>
        <Box style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.035)', top: -130, left: -50 }} />
        <Group justify="space-between" align="center" style={{ position: 'relative', zIndex: 1 }} wrap="wrap" gap="lg">
          <Group gap="md" align="center">
            <ThemeIcon size={65} radius="xl" variant="light" color="yellow" style={{ background: 'rgba(232,176,75,0.16)', color: GOLD }}>
              <IconLayersIntersect size={34} stroke={1.7} />
            </ThemeIcon>
            <Box>
              <Text c="white" fw={800} size="xl">أقسام المدن الداخلية</Text>
              <Text c="rgba(255,255,255,0.72)" size="sm" mt={5}>إدارة المحتوى السياحي والتفصيلي للمدن الفلسطينية</Text>
            </Box>
          </Group>
          <Button size="lg" radius="md" leftSection={<IconPlus size={19} />} onClick={() => openModal()} styles={{ root: { background: GOLD, color: GREEN, fontWeight: 800, border: 'none' } }}>
            إضافة قسم جديد
          </Button>
        </Group>
      </Paper>

      {/* Statistics */}
      <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="md" mb="xl">
        <Card radius="lg" padding="lg" withBorder style={{ borderColor: '#e8eeeb' }}>
          <Group justify="space-between">
            <Box><Text size="xs" c="dimmed" fw={600}>إجمالي الأقسام</Text><Text size="2rem" fw={800} c={GREEN}>{allSections.length}</Text></Box>
            <ThemeIcon size={48} radius="md" variant="light" color="teal"><IconFileText size={25} /></ThemeIcon>
          </Group>
        </Card>
        <Card radius="lg" padding="lg" withBorder style={{ borderColor: '#e8eeeb' }}>
          <Group justify="space-between">
            <Box><Text size="xs" c="dimmed" fw={600}>المدن المسجلة</Text><Text size="2rem" fw={800} c={GREEN}>{cities.length}</Text></Box>
            <ThemeIcon size={48} radius="md" variant="light" color="blue"><IconBuilding size={25} /></ThemeIcon>
          </Group>
        </Card>
        <Card radius="lg" padding="lg" withBorder style={{ borderColor: '#e8eeeb' }}>
          <Group justify="space-between">
            <Box><Text size="xs" c="dimmed" fw={600}>الصور المرفقة</Text><Text size="2rem" fw={800} c={GREEN}>{totalImages}</Text></Box>
            <ThemeIcon size={48} radius="md" variant="light" color="orange"><IconPhoto size={25} /></ThemeIcon>
          </Group>
        </Card>
        <Card radius="lg" padding="lg" withBorder style={{ borderColor: '#e8eeeb' }}>
          <Group justify="space-between">
            <Box><Text size="xs" c="dimmed" fw={600}>الفيديوهات</Text><Text size="2rem" fw={800} c={GREEN}>{totalVideos}</Text></Box>
            <ThemeIcon size={48} radius="md" variant="light" color="red"><IconVideo size={25} /></ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Paper radius="lg" p="lg" mb="xl" withBorder style={{ borderColor: '#e8eeeb' }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Select label="تصفية حسب المدينة" data={cityOptions} value={selectedCity} onChange={setSelectedCity} searchable leftSection={<IconBuilding size={17} />} styles={inputStyles} />
          <TextInput label="البحث في الأقسام" placeholder="ابحث بالعنوان أو المحتوى..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} leftSection={<IconSearch size={17} />} styles={inputStyles} />
        </SimpleGrid>
      </Paper>

      {/* Content */}
      {loading ? (
        <Center py={100}><Loader color="teal" size="lg" /></Center>
      ) : filteredSections.length === 0 ? (
        <Paper radius="lg" p={50} withBorder style={{ textAlign: 'center' }}>
          <ThemeIcon size={75} radius="xl" variant="light" color="gray"><IconFileDescription size={37} /></ThemeIcon>
          <Text fw={700} size="lg" mt="md">لا توجد أقسام</Text>
          <Button mt="lg" color="teal" leftSection={<IconPlus size={18} />} onClick={() => openModal()}>إضافة أول قسم</Button>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {filteredSections.map((section, index) => (
            <Card key={section.id} radius="lg" padding={0} withBorder style={{ overflow: 'hidden', borderColor: '#e8eeeb' }}>
              <Box style={{ height: 4, background: `linear-gradient(90deg, ${GREEN}, ${GOLD})` }} />
              <Box p="lg">
                <Group justify="space-between" mb="md">
                  <Box style={{ flex: 1 }}>
                    <Text fw={800} size="md" lineClamp={2} style={{ color: GREEN }}>{section.title || 'بدون عنوان'}</Text>
                    <Text size="xs" c="dimmed" mt={4}>{section.titleEn}</Text>
                  </Box>
                  <Badge color="gray" variant="light">#{section.order || index + 1}</Badge>
                </Group>
                <Text size="xs" c="dimmed" mb="md"><IconMapPin size={12} style={{ marginLeft: 4 }} />{getCityName(section.cityId)}</Text>
                <Divider mb="md" />
                <Text size="sm" c="dimmed" lineClamp={3}>{section.content}</Text>
                <Group gap="xs" mt="md">
                  <Badge color="orange" variant="light">{section.images?.length || 0} صور</Badge>
                  <Badge color="red" variant="light">{section.videos?.length || 0} فيديو</Badge>
                </Group>
                <Divider my="md" />
                <Group justify="space-between">
                  <ActionIcon color="blue" variant="light" onClick={() => openModal(section)}><IconEdit size={17} /></ActionIcon>
                  <ActionIcon color="red" variant="light" onClick={() => handleDelete(section.id)}><IconTrash size={17} /></ActionIcon>
                </Group>
              </Box>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Modal - ADD/EDIT */}
      <Modal opened={isModalOpen} onClose={closeModal} title={<Text fw={800} c={GREEN}>{editingSection ? 'تعديل القسم' : 'إضافة قسم جديد'}</Text>} size="xl" centered radius="lg" styles={{ body: { padding: '22px' }, content: { maxHeight: '90vh' } }}>
        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            {/* City Selection */}
            <Select label="المدينة" data={cities.map(c => ({ value: c.id.toString(), label: c.name }))} value={formData.cityId} onChange={val => updateForm('cityId', val)} required disabled={!!editingSection} styles={inputStyles} />

            {/* Titles */}
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="العنوان بالعربية" required value={formData.titleAr} onChange={e => updateForm('titleAr', e.target.value)} styles={inputStyles} />
              <TextInput label="Title in English" required value={formData.titleEn} onChange={e => updateForm('titleEn', e.target.value)} dir="ltr" styles={inputStyles} />
            </SimpleGrid>

            {/* Content */}
            <Textarea label="المحتوى بالعربية" required minRows={4} value={formData.contentAr} onChange={e => updateForm('contentAr', e.target.value)} styles={inputStyles} />
            <Textarea label="Content in English" required minRows={4} value={formData.contentEn} onChange={e => updateForm('contentEn', e.target.value)} dir="ltr" styles={inputStyles} />

            {/* Order */}
            <NumberInput label="ترتيب العرض" min={1} value={formData.order} onChange={val => updateForm('order', val || 1)} styles={inputStyles} />

            {/* EXISTING IMAGES */}
            {existingImages.length > 0 && (
              <Box>
                <Group justify="space-between" mb="sm">
                  <Text fw={700} size="sm" c={GREEN}>الصور الحالية ({existingImages.length})</Text>
                </Group>
                <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
                  {existingImages.map((img, idx) => (
                    <Box key={idx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '2px solid #e8eeeb' }}>
                      <Image src={img} height={100} fit="cover" />
                      <ActionIcon size="sm" color="red" variant="filled" radius="xl" style={{ position: 'absolute', top: 4, right: 4 }} onClick={() => removeExistingImage(idx)}><IconX size={12} /></ActionIcon>
                    </Box>
                  ))}
                </SimpleGrid>
                <Divider my="md" />
              </Box>
            )}

            {/* NEW IMAGES - WITH ADD BUTTON */}
            <Box>
              <Group justify="space-between" mb="sm">
                <Text fw={700} size="sm" c={GREEN}>إضافة صور جديدة</Text>
                {newImageFiles.length > 0 && (
                  <Badge color="teal" variant="light">{newImageFiles.length} صورة مختارة</Badge>
                )}
              </Group>
              
              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={(e) => handleImageChange(e.target.files)}
                style={{ display: 'none' }}
                id="image-upload"
              />
              
              <Button 
                component="label" 
                htmlFor="image-upload"
                variant="outline" 
                color="teal" 
                leftSection={<IconUpload size={18} />}
                fullWidth
              >
                {newImageFiles.length > 0 ? 'إضافة المزيد من الصور' : 'اختر صوراً جديدة'}
              </Button>

              {/* Show selected images */}
              {newImageFiles.length > 0 && (
                <Box mt="md">
                  <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
                    {newImageFiles.map((file, idx) => (
                      <Box key={idx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '2px solid #d1fae5', background: '#f0fdf4' }}>
                        <Image src={URL.createObjectURL(file)} height={100} fit="cover" />
                        <Box p="xs" style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                          {truncateFileName(file.name, 15)}
                        </Box>
                        <ActionIcon size="sm" color="red" variant="filled" radius="xl" style={{ position: 'absolute', top: 4, right: 4 }} onClick={() => removeNewImage(idx)}><IconX size={12} /></ActionIcon>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </Box>

            {/* EXISTING VIDEOS */}
            {existingVideos.length > 0 && (
              <Box>
                <Group justify="space-between" mb="sm">
                  <Text fw={700} size="sm" c={GREEN}>الفيديوهات الحالية ({existingVideos.length})</Text>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  {existingVideos.map((vid, idx) => (
                    <Box key={idx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '2px solid #e8eeeb', background: '#000' }}>
                      <video src={vid} controls style={{ width: '100%', height: 140 }} />
                      <ActionIcon size="sm" color="red" variant="filled" radius="xl" style={{ position: 'absolute', top: 8, right: 8 }} onClick={() => removeExistingVideo(idx)}><IconX size={12} /></ActionIcon>
                    </Box>
                  ))}
                </SimpleGrid>
                <Divider my="md" />
              </Box>
            )}

            {/* NEW VIDEOS - WITH ADD BUTTON */}
            <Box>
              <Group justify="space-between" mb="sm">
                <Text fw={700} size="sm" c={GREEN}>إضافة فيديوهات جديدة</Text>
                {newVideoFiles.length > 0 && (
                  <Badge color="red" variant="light">{newVideoFiles.length} فيديو مختار</Badge>
                )}
              </Group>
              
              {/* Hidden File Input */}
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                multiple
                onChange={(e) => handleVideoChange(e.target.files)}
                style={{ display: 'none' }}
                id="video-upload"
              />
              
              <Button 
                component="label" 
                htmlFor="video-upload"
                variant="outline" 
                color="red" 
                leftSection={<IconUpload size={18} />}
                fullWidth
              >
                {newVideoFiles.length > 0 ? 'إضافة المزيد من الفيديوهات' : 'اختر فيديوهات جديدة'}
              </Button>

              {/* Show selected videos */}
              {newVideoFiles.length > 0 && (
                <Box mt="md">
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                    {newVideoFiles.map((file, idx) => (
                      <Box key={idx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '2px solid #fee2e2', background: '#fef2f2' }}>
                        <video src={videoPreviews[existingVideos.length + idx]} controls style={{ width: '100%', height: 140 }} />
                        <Box p="xs" style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                          {truncateFileName(file.name, 20)}
                        </Box>
                        <ActionIcon size="sm" color="red" variant="filled" radius="xl" style={{ position: 'absolute', top: 8, right: 8 }} onClick={() => removeNewVideo(idx)}><IconX size={12} /></ActionIcon>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </Box>

            {/* Actions */}
            <Divider />
            <Group justify="space-between">
              <Button variant="subtle" color="gray" onClick={closeModal} disabled={saving}>إلغاء</Button>
              <Button type="submit" loading={saving} color="teal" leftSection={<IconDeviceFloppy size={18} />}>
                {editingSection ? 'حفظ التعديلات' : 'إضافة القسم'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}