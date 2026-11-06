import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Text, Group, Button, ThemeIcon, Badge,
  ActionIcon, Stack, Modal, TextInput, Textarea, FileInput,
  Image, MultiSelect, Loader, Center, SimpleGrid, Card,
  Divider, ScrollArea, Tooltip
} from '@mantine/core';

import {
  IconBuilding, IconPlus, IconEdit, IconTrash, IconPhoto,
  IconMapPin, IconX, IconWorld, IconBuildingCommunity,
  IconMap2, IconCategory
} from '@tabler/icons-react';

import Swal from 'sweetalert2';
import API from '../../../API/ApiAuthToken';
import LocationPicker from '../../../Components/ControlPanel/LocationPicker';

const PRIMARY = '#0A3A2A';
const GOLD = '#E8B04B';

const emptyCityForm = {
  nameAr: '',
  nameEn: '',
  descriptionAr: '',
  descriptionEn: '',
  categoryIds: [],
  latitude: '',
  longitude: ''
};

export function TourismGuideCities() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddPlaceModalOpen, setIsAddPlaceModalOpen] = useState(false);

  const [selectedCity, setSelectedCity] = useState(null);
  const [cityDetails, setCityDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editingCity, setEditingCity] = useState(null);

  const [cityForm, setCityForm] = useState(emptyCityForm);
  const [cityImageFile, setCityImageFile] = useState(null);
  const [cityImagePreview, setCityImagePreview] = useState(null);

  const categoryOptions = categories.map(category => ({
    value: String(category.id),
    label: category.name
  }));

  // تحميل المدن والتصنيفات
  const fetchData = async () => {
    setLoading(true);

    try {
      const [citiesRes, categoriesRes] = await Promise.all([
        API.get('/api/Admin/get-all-cities?langCode=ar'),
        API.get('/api/Admin/get-tourism-categories?langCode=ar')
      ]);

      if (citiesRes.data.success) {
        setCities(citiesRes.data.data || []);
      }

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data || []);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'تعذر تحميل البيانات',
        text: 'حدث خطأ أثناء جلب المدن والتصنيفات'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'إدارة المدن | ROVAYA';
    fetchData();
  }, []);

  // تحميل تفاصيل المدينة
  const fetchCityDetails = async (cityId) => {
    setDetailsLoading(true);
    setCityDetails(null);

    try {
      const response = await API.get(
        `/api/Admin/get-city-details/${cityId}?langCode=ar`
      );

      if (response.data.success) {
        setCityDetails(response.data.data);
      }
    } catch (error) {
      console.error('Details Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'تعذر تحميل تفاصيل المدينة'
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleView = async (city) => {
    setSelectedCity(city);
    setIsViewModalOpen(true);
    await fetchCityDetails(city.id);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedCity(null);
    setCityDetails(null);
  };

  // فتح نموذج إضافة أو تعديل مدينة
  const handleOpenEditModal = async (city = null) => {
    setEditingCity(city);
    setCityImageFile(null);

    if (city) {
      let englishData = {};

      try {
        const englishResponse = await API.get(
          `/api/Admin/get-city-details/${city.id}?langCode=en`
        );

        if (englishResponse.data.success) {
          englishData = englishResponse.data.data || {};
        }
      } catch (error) {
        console.warn('English translation was not returned:', error);
      }

      setCityForm({
        nameAr: city.name || '',
        nameEn: englishData.name || city.nameEn || '',
        descriptionAr: city.description || '',
        descriptionEn: englishData.description || city.descriptionEn || '',
        categoryIds: (city.categoryIds || []).map(String),
        latitude: city.latitude != null ? String(city.latitude) : '',
        longitude: city.longitude != null ? String(city.longitude) : ''
      });

      setCityImagePreview(city.imageUrl || null);
    } else {
      setCityForm({ ...emptyCityForm });
      setCityImagePreview(null);
    }

    setIsEditModalOpen(true);
  };

  // حفظ المدينة
  const handleSaveCity = async (e) => {
    e.preventDefault();

    if (!cityForm.nameAr.trim() || !cityForm.nameEn.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'بيانات ناقصة',
        text: 'يرجى إدخال اسم المدينة بالعربية والإنجليزية'
      });
      return;
    }

    if (
      !cityForm.latitude ||
      !cityForm.longitude ||
      !Number.isFinite(Number(cityForm.latitude)) ||
      !Number.isFinite(Number(cityForm.longitude))
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'الموقع الجغرافي مطلوب',
        text: 'يرجى تحديد موقع المدينة على الخريطة قبل الحفظ'
      });
      return;
    }

    setSaving(true);

    try {
      const translations = [
        {
          languageCode: 'ar',
          name: cityForm.nameAr,
          description: cityForm.descriptionAr
        },
        {
          languageCode: 'en',
          name: cityForm.nameEn,
          description: cityForm.descriptionEn
        }
      ];

      const data = new FormData();

      cityForm.categoryIds.forEach(id => {
        data.append('CategoryIds', id);
      });

      data.append('Latitude', cityForm.latitude);
      data.append('Longitude', cityForm.longitude);
      data.append('TranslationsJson', JSON.stringify(translations));

      if (cityImageFile) {
        data.append('Image', cityImageFile);
      }

      const response = editingCity
        ? await API.put(`/api/Admin/update-city/${editingCity.id}`, data)
        : await API.post('/api/Admin/create-city', data);

      if (response.data.success) {
        setIsEditModalOpen(false);
        setEditingCity(null);
        setCityImageFile(null);
        setCityImagePreview(null);

        await fetchData();

        Swal.fire({
          icon: 'success',
          title: 'تم الحفظ بنجاح',
          text: editingCity
            ? 'تم تحديث بيانات المدينة'
            : 'تمت إضافة المدينة الجديدة',
          timer: 1600,
          showConfirmButton: false
        });
      } else {
        throw new Error(response.data.message || 'تعذر حفظ البيانات');
      }
    } catch (error) {
      console.error('Save City Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'فشل الحفظ',
        text: error.response?.data?.message || error.message
      });
    } finally {
      setSaving(false);
    }
  };

  // حذف مدينة
  const handleDeleteCity = async (id) => {
    const result = await Swal.fire({
      title: 'حذف المدينة؟',
      text: 'سيتم حذف المدينة والأماكن السياحية التابعة لها!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#868e96',
      confirmButtonText: 'نعم، احذف المدينة',
      cancelButtonText: 'إلغاء'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await API.delete(`/api/Admin/delete-city/${id}`);

      if (response.data.success) {
        closeViewModal();
        await fetchData();

        Swal.fire({
          icon: 'success',
          title: 'تم الحذف',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error(response.data.message || 'فشل الحذف');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: error.response?.data?.message || 'فشل حذف المدينة'
      });
    }
  };

  // حذف مكان سياحي
  const handleDeletePlace = async (placeId) => {
    const result = await Swal.fire({
      title: 'حذف المكان السياحي؟',
      text: 'لا يمكن التراجع عن هذه العملية',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await API.delete(
        `/api/Admin/delete-tourist-place/${placeId}`
      );

      if (response.data.success) {
        await fetchCityDetails(selectedCity.id);

        Swal.fire({
          icon: 'success',
          title: 'تم الحذف',
          timer: 1300,
          showConfirmButton: false
        });
      } else {
        throw new Error(response.data.message || 'فشل الحذف');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: error.response?.data?.message || 'فشل حذف المكان'
      });
    }
  };

  const updateCityForm = (key, value) => {
    setCityForm(prev => ({ ...prev, [key]: value }));
  };

  // ✅ عرض تصنيفات المدينة - يستخدم selectedCity مباشرة
  const renderCategoryBadges = (city, showAll = false, filled = false) => {
    const names = city?.categoryNames || [];

    if (!names.length) {
      return (
        <Badge color="gray" variant="light">
          غير مصنف
        </Badge>
      );
    }

    // ✅ في المودال: اعرض كل التصنيفات
    if (showAll) {
      return (
        <Group gap={8} wrap="wrap">
          {names.map((name, index) => (
            <Badge
              key={`${name}-${index}`}
              color="teal"
              variant="light"
              radius="sm"
              size="md"
              px="sm"
            >
              {name}
            </Badge>
          ))}
        </Group>
      );
    }

    // ✅ في الكاردات الخارجية: اعرض أول 3 فقط
    return (
      <Group gap={5} wrap="wrap">
        {names.slice(0, 3).map((name, index) => (
          <Badge
            key={`${name}-${index}`}
            color={filled ? 'dark' : 'teal'}
            variant={filled ? 'filled' : 'light'}
            radius="sm"
            size="sm"
          >
            {name}
          </Badge>
        ))}

        {names.length > 3 && (
          <Tooltip label={names.slice(3).join('، ')}>
            <Badge color="gray" variant="light">
              +{names.length - 3}
            </Badge>
          </Tooltip>
        )}
      </Group>
    );
  };

  return (
    <Box className="cities-page" dir="rtl">
      <style>{`
        .cities-page {
          min-height: calc(100vh - 75px);
          padding: 22px;
          background: #f5f7f6;
          color: #18352a;
        }

        .cities-header {
          position: relative;
          overflow: hidden;
          border: 0;
          border-radius: 20px;
          padding: 26px 30px;
          color: white;
          background: linear-gradient(115deg, #082e22, #0d4934);
          box-shadow: 0 12px 30px rgba(10,58,42,.13);
        }

        .cities-header::after {
          content: "";
          position: absolute;
          width: 230px;
          height: 230px;
          left: 12%;
          top: -145px;
          border: 1px solid rgba(232,176,75,.22);
          border-radius: 50%;
          box-shadow: 0 0 0 25px rgba(232,176,75,.035),
                      0 0 0 55px rgba(232,176,75,.025);
          pointer-events: none;
        }

        .city-card {
          overflow: hidden;
          border: 1px solid #e8eeea;
          border-radius: 17px;
          background: white;
          transition: transform .22s ease, box-shadow .22s ease;
        }

        .city-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(20,55,40,.12);
        }

        .city-card-image {
          position: relative;
          height: 205px;
          overflow: hidden;
          background: #e8eeea;
        }

        .city-card-image img {
          transition: transform .45s ease;
        }

        .city-card:hover .city-card-image img {
          transform: scale(1.045);
        }

        .city-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(5,28,20,.78),
            rgba(5,28,20,0) 65%
          );
          pointer-events: none;
        }

        .city-image-title {
          position: absolute;
          bottom: 16px;
          right: 17px;
          left: 17px;
          color: white;
          z-index: 1;
        }

        .city-card-body {
          padding: 17px;
        }

        .city-action {
          border-top: 1px solid #edf1ee;
          margin-top: 15px;
          padding-top: 13px;
        }

        .city-stat {
          border: 1px solid #e6ece8;
          background: #fff;
          border-radius: 14px;
          padding: 14px 16px;
        }

        .city-modal-header {
          background: linear-gradient(120deg, #0a3a2a, #15543d);
          color: white;
          padding: 24px;
        }

        .place-row {
          border: 1px solid #e8eeea;
          border-radius: 13px;
          padding: 12px;
          background: white;
          transition: background .2s ease;
        }

        .place-row:hover {
          background: #f8fbf9;
        }

        .form-section {
          padding: 15px;
          border: 1px solid #e8eeea;
          border-radius: 13px;
          background: #fbfcfb;
        }

        @media (max-width: 600px) {
          .cities-page { padding: 12px; }

          .cities-header {
            padding: 20px;
            align-items: flex-start;
            flex-direction: column;
            gap: 18px;
          }
        }
      `}</style>

      {/* Header */}
      <Paper className="cities-header" mb="xl">
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="md">
            <ThemeIcon
              size={55}
              radius="xl"
              variant="light"
              color="yellow"
              style={{
                background: 'rgba(232,176,75,.15)',
                color: GOLD
              }}
            >
              <IconBuilding size={29} />
            </ThemeIcon>

            <Box>
              <Text fw={800} size="xl">
                المدن السياحية
              </Text>

              <Text size="sm" c="rgba(255,255,255,.72)" mt={4}>
                إدارة المدن والتصنيفات والأماكن السياحية التابعة لها
              </Text>
            </Box>
          </Group>

          <Button
            leftSection={<IconPlus size={18} />}
            color="yellow"
            onClick={() => handleOpenEditModal()}
            styles={{
              root: {
                background: GOLD,
                color: PRIMARY,
                fontWeight: 800,
                height: 43
              }
            }}
          >
            إضافة مدينة جديدة
          </Button>
        </Group>
      </Paper>

      {/* Statistics */}
      <SimpleGrid cols={{ base: 2, sm: 3 }} mb="xl">
        <Paper className="city-stat">
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed" fw={600}>إجمالي المدن</Text>
              <Text size="xl" fw={800} mt={5}>{cities.length}</Text>
            </Box>

            <ThemeIcon color="teal" variant="light" size={42} radius="md">
              <IconBuilding size={22} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper className="city-stat">
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed" fw={600}>التصنيفات المتاحة</Text>
              <Text size="xl" fw={800} mt={5}>{categories.length}</Text>
            </Box>

            <ThemeIcon color="yellow" variant="light" size={42} radius="md">
              <IconCategory size={22} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper className="city-stat">
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed" fw={600}>مدن مرتبطة بتصنيفات</Text>
              <Text size="xl" fw={800} mt={5}>
                {cities.filter(city => city.categoryIds?.length > 0).length}
              </Text>
            </Box>

            <ThemeIcon color="blue" variant="light" size={42} radius="md">
              <IconMap2 size={22} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Cities */}
      {loading ? (
        <Center py={100}>
          <Stack align="center" gap="sm">
            <Loader color="teal" size="lg" />
            <Text c="dimmed" size="sm">جاري تحميل المدن...</Text>
          </Stack>
        </Center>
      ) : cities.length === 0 ? (
        <Paper
          p={55}
          radius="lg"
          withBorder
          style={{ textAlign: 'center', background: 'white' }}
        >
          <ThemeIcon size={75} radius="xl" color="gray" variant="light">
            <IconPhoto size={38} />
          </ThemeIcon>

          <Text fw={700} size="lg" mt="md">
            لا توجد مدن مضافة حتى الآن
          </Text>

          <Text c="dimmed" size="sm" mt={5} mb="lg">
            ابدأ بإضافة المدن الفلسطينية التي ستظهر في الدليل السياحي
          </Text>

          <Button
            leftSection={<IconPlus size={17} />}
            onClick={() => handleOpenEditModal()}
            style={{ background: PRIMARY }}
          >
            إضافة أول مدينة
          </Button>
        </Paper>
      ) : (
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
          spacing="lg"
        >
          {cities.map(city => (
            <Card key={city.id} className="city-card" padding={0}>
              <Box className="city-card-image">
                {city.imageUrl ? (
                  <Image
                    src={city.imageUrl}
                    h={205}
                    w="100%"
                    fit="cover"
                    alt={city.name}
                  />
                ) : (
                  <Center h={205}>
                    <ThemeIcon size={65} radius="xl" color="gray" variant="light">
                      <IconPhoto size={34} />
                    </ThemeIcon>
                  </Center>
                )}

                <Box className="city-image-overlay" />

                <Box className="city-image-title">
                  <Text fw={800} size="xl" lineClamp={1}>
                    {city.name}
                  </Text>

                  <Group gap={5} mt={6}>
                    <IconMapPin size={14} />
                    <Text size="xs">فلسطين</Text>
                  </Group>
                </Box>
              </Box>

              <Box className="city-card-body">
                <Group justify="space-between" align="center" mb="xs">
                  <Text fw={700} size="sm">تصنيفات المدينة</Text>

                  <Badge color="gray" variant="light">
                    {city.categoryIds?.length || 0} تصنيف
                  </Badge>
                </Group>

                {renderCategoryBadges(city, false)}

                <Text
                  size="sm"
                  c="dimmed"
                  mt="md"
                  lineClamp={3}
                  mih={60}
                >
                  {city.description || 'لا يوجد وصف متاح لهذه المدينة.'}
                </Text>

                <Group className="city-action" justify="space-between">
                  <Button
                    variant="subtle"
                    color="teal"
                    size="sm"
                    leftSection={<IconWorld size={16} />}
                    onClick={() => handleView(city)}
                  >
                    التفاصيل والأماكن
                  </Button>

                  <Group gap={6}>
                    <Tooltip label="تعديل المدينة">
                      <ActionIcon
                        color="orange"
                        variant="light"
                        size="lg"
                        radius="md"
                        onClick={() => handleOpenEditModal(city)}
                      >
                        <IconEdit size={17} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="حذف المدينة">
                      <ActionIcon
                        color="red"
                        variant="light"
                        size="lg"
                        radius="md"
                        onClick={() => handleDeleteCity(city.id)}
                      >
                        <IconTrash size={17} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Box>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* City details Modal - ✅ تم التصحيح لاستخدام selectedCity */}
      <Modal
        opened={isViewModalOpen}
        onClose={closeViewModal}
        size="1050px"
        centered
        padding={0}
        withCloseButton={false}
        radius="lg"
        title={null}
      >
        {detailsLoading ? (
          <Center py={100}>
            <Loader color="teal" />
          </Center>
        ) : cityDetails && selectedCity ? (
          <Box>
            <Box className="city-modal-header">
              <Group justify="space-between" align="flex-start">
                <Box>
                  <Badge
                    color="yellow"
                    variant="light"
                    mb="sm"
                    style={{ color: GOLD }}
                  >
                    دليل المدن السياحية
                  </Badge>

                  <Text size="xl" fw={800}>
                    {cityDetails.name || selectedCity.name}
                  </Text>

                  <Text size="sm" c="rgba(255,255,255,.7)" mt={5}>
                    تفاصيل المدينة والأماكن السياحية المرتبطة بها
                  </Text>
                </Box>

                <ActionIcon
                  variant="light"
                  color="white"
                  size="lg"
                  onClick={closeViewModal}
                  style={{ background: 'rgba(255,255,255,.13)' }}
                >
                  <IconX size={20} />
                </ActionIcon>
              </Group>
            </Box>

            <Box p="lg">
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                {/* City information */}
                <Stack gap="md">
                  <Group gap="xs">
                    <ThemeIcon color="teal" variant="light" radius="md">
                      <IconWorld size={18} />
                    </ThemeIcon>

                    <Text fw={800}>معلومات المدينة</Text>
                  </Group>

                  <Paper withBorder radius="md" p="md">
                    {cityDetails.imageUrl || selectedCity.imageUrl ? (
                      <Image
                        src={cityDetails.imageUrl || selectedCity.imageUrl}
                        h={190}
                        radius="md"
                        fit="cover"
                        mb="md"
                      />
                    ) : null}

                    <Text size="xs" c="dimmed" fw={700} mb={6}>
                      الوصف
                    </Text>

                    <Text size="sm" lh={1.8}>
                      {cityDetails.description || 'لا يوجد وصف متاح.'}
                    </Text>

                    <Divider my="md" />

                    {/* ✅ هنا نستخدم selectedCity بدلاً من cityDetails */}
                    <Text size="xs" c="dimmed" fw={700} mb="xs">
                      التصنيفات ({selectedCity.categoryNames?.length || 0})
                    </Text>

                    {renderCategoryBadges(selectedCity, true)}

                    <Divider my="md" />

                    <SimpleGrid cols={2}>
                      <Box>
                        <Text size="xs" c="dimmed">خط العرض</Text>
                        <Text fw={700} size="sm" mt={4}>
                          {cityDetails.latitude ?? '-'}
                        </Text>
                      </Box>

                      <Box>
                        <Text size="xs" c="dimmed">خط الطول</Text>
                        <Text fw={700} size="sm" mt={4}>
                          {cityDetails.longitude ?? '-'}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Paper>

                  <Button
                    variant="light"
                    color="orange"
                    leftSection={<IconEdit size={17} />}
                    onClick={() => handleOpenEditModal(selectedCity)}
                  >
                    تعديل بيانات المدينة
                  </Button>
                </Stack>

                {/* Places */}
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Group gap="xs">
                      <ThemeIcon color="teal" variant="light" radius="md">
                        <IconBuildingCommunity size={18} />
                      </ThemeIcon>

                      <Box>
                        <Text fw={800}>الأماكن السياحية</Text>
                        <Text size="xs" c="dimmed">
                          {cityDetails.places?.length || 0} مكان
                        </Text>
                      </Box>
                    </Group>
                  </Group>

                  {cityDetails.places?.length ? (
                    <ScrollArea h={480} offsetScrollbars>
                      <Stack gap="sm" pr={5}>
                        {cityDetails.places.map(place => (
                          <Box key={place.id} className="place-row">
                            <Group align="flex-start" wrap="nowrap">
                              {place.imageUrl ? (
                                <Image
                                  src={place.imageUrl}
                                  w={82}
                                  h={82}
                                  radius="md"
                                  fit="cover"
                                />
                              ) : (
                                <Center
                                  w={82}
                                  h={82}
                                  style={{
                                    background: '#edf2ef',
                                    borderRadius: 9,
                                    flexShrink: 0
                                  }}
                                >
                                  <IconPhoto color="#8b9c92" size={27} />
                                </Center>
                              )}

                              <Box style={{ flex: 1, minWidth: 0 }}>
                                <Group justify="space-between" wrap="nowrap">
                                  <Text fw={700} size="sm" lineClamp={1}>
                                    {place.name}
                                  </Text>

                                  <ActionIcon
                                    size="sm"
                                    color="red"
                                    variant="subtle"
                                    onClick={() => handleDeletePlace(place.id)}
                                  >
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Group>

                                <Text size="xs" c="dimmed" lineClamp={2} mt={5}>
                                  {place.description || 'لا يوجد وصف'}
                                </Text>

                                <Group gap={4} mt={7}>
                                  <IconMapPin size={13} color="#8a9a91" />
                                  <Text size="xs" c="dimmed">
                                    {place.latitude ?? '-'}, {place.longitude ?? '-'}
                                  </Text>
                                </Group>
                              </Box>
                            </Group>
                          </Box>
                        ))}
                      </Stack>
                    </ScrollArea>
                  ) : (
                    <Paper
                      p="xl"
                      radius="md"
                      withBorder
                      style={{
                        textAlign: 'center',
                        background: '#f8faf9',
                        borderStyle: 'dashed'
                      }}
                    >
                      <IconBuildingCommunity size={38} color="#aab7af" />

                      <Text size="sm" fw={600} mt="sm">
                        لا توجد أماكن سياحية بعد
                      </Text>

                      <Text size="xs" c="dimmed" mt={5}>
                        أضف أول مكان سياحي تابع لهذه المدينة
                      </Text>
                    </Paper>
                  )}
                </Stack>
              </SimpleGrid>
            </Box>
          </Box>
        ) : (
          <Center py={60}>
            <Text c="dimmed">تعذر تحميل تفاصيل المدينة</Text>
          </Center>
        )}
      </Modal>

      {/* Add / Edit City */}
      <Modal
        opened={isEditModalOpen}
        onClose={() => {
          if (!saving) {
            setIsEditModalOpen(false);
            setEditingCity(null);
          }
        }}
        title={
          <Group gap="sm">
            <ThemeIcon color="teal" variant="light" radius="md" size="lg">
              {editingCity ? <IconEdit size={19} /> : <IconPlus size={19} />}
            </ThemeIcon>

            <Box>
              <Text fw={800}>
                {editingCity ? 'تعديل بيانات المدينة' : 'إضافة مدينة جديدة'}
              </Text>

              <Text size="xs" c="dimmed">
                أدخل معلومات المدينة والتصنيفات التابعة لها
              </Text>
            </Box>
          </Group>
        }
        size="lg"
        centered
        radius="lg"
      >
        <form onSubmit={handleSaveCity}>
          <Stack gap="md">
            <Box className="form-section">
              <Group gap="xs" mb="sm">
                <IconCategory size={17} color={PRIMARY} />
                <Text fw={700} size="sm">تصنيفات المدينة</Text>
              </Group>

              <MultiSelect
                data={categoryOptions}
                value={cityForm.categoryIds}
                onChange={value => updateCityForm('categoryIds', value)}
                searchable
                clearable
                placeholder="اختر تصنيفاً أو أكثر"
                nothingFoundMessage="لا توجد تصنيفات"
                description="يمكن ربط المدينة بعدة تصنيفات في الوقت نفسه"
              />
            </Box>

            <Box className="form-section">
              <Text fw={700} size="sm" mb="sm">معلومات المدينة</Text>

              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput
                  label="اسم المدينة بالعربية"
                  placeholder="مثلاً: نابلس"
                  required
                  value={cityForm.nameAr}
                  onChange={e => updateCityForm('nameAr', e.target.value)}
                />

                <TextInput
                  label="اسم المدينة بالإنجليزية"
                  placeholder="Example: Nablus"
                  required
                  value={cityForm.nameEn}
                  onChange={e => updateCityForm('nameEn', e.target.value)}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, sm: 2 }} mt="md">
                <Textarea
                  label="الوصف بالعربية"
                  minRows={4}
                  autosize
                  value={cityForm.descriptionAr}
                  onChange={e => updateCityForm('descriptionAr', e.target.value)}
                />

                <Textarea
                  label="الوصف بالإنجليزية"
                  minRows={4}
                  autosize
                  value={cityForm.descriptionEn}
                  onChange={e => updateCityForm('descriptionEn', e.target.value)}
                />
              </SimpleGrid>
            </Box>

            {/* الموقع الجغرافي للمدينة */}
            <Box className="form-section">
              <Group gap="xs" mb="sm">
                <IconMapPin size={17} color={PRIMARY} />
                <Text fw={700} size="sm">تحديد موقع المدينة</Text>
              </Group>

              <Text size="xs" c="dimmed" mb="sm">
                اضغط على الخريطة لتحديد موقع المدينة، ويمكنك تحريك العلامة
                للوصول إلى الموقع الأدق.
              </Text>

              <LocationPicker
                latitude={cityForm.latitude}
                longitude={cityForm.longitude}
                onChange={({ latitude, longitude }) => {
                  setCityForm(prev => ({
                    ...prev,
                    latitude: String(latitude),
                    longitude: String(longitude)
                  }));
                }}
                height={350}
              />

              {cityForm.latitude && cityForm.longitude && (
                <Group gap="xs" mt="sm">
                  <Badge color="teal" variant="light">
                    تم تحديد الموقع
                  </Badge>

                  <Text size="xs" c="dimmed">
                    {Number(cityForm.latitude).toFixed(6)},
                    {' '}
                    {Number(cityForm.longitude).toFixed(6)}
                  </Text>
                </Group>
              )}

              {(!cityForm.latitude || !cityForm.longitude) && (
                <Text size="xs" c="orange" mt="sm">
                  لم يتم تحديد الموقع بعد. يجب اختيار موقع على الخريطة.
                </Text>
              )}
            </Box>

            <Box className="form-section">
              <Text fw={700} size="sm" mb="sm">صورة المدينة</Text>

              <FileInput
                placeholder="اختر صورة المدينة"
                value={cityImageFile}
                onChange={file => {
                  setCityImageFile(file);

                  setCityImagePreview(
                    file
                      ? URL.createObjectURL(file)
                      : editingCity?.imageUrl || null
                  );
                }}
                accept="image/png,image/jpeg,image/webp"
                clearable
                leftSection={<IconPhoto size={17} />}
              />

              {cityImagePreview && (
                <Image
                  src={cityImagePreview}
                  h={170}
                  radius="md"
                  fit="cover"
                  mt="md"
                />
              )}
            </Box>

            <Group justify="space-between" mt="sm">
              <Button
                variant="default"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCity(null);
                }}
                disabled={saving}
              >
                إلغاء
              </Button>

              <Button
                type="submit"
                loading={saving}
                style={{ background: PRIMARY }}
              >
                {editingCity ? 'حفظ التعديلات' : 'إضافة المدينة'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Add Tourist Place */}
      <Modal
        opened={isAddPlaceModalOpen}
        onClose={() => !saving && setIsAddPlaceModalOpen(false)}
        title={
          <Box>
            <Text fw={800}>إضافة مكان سياحي</Text>
            <Text size="xs" c="dimmed">
              المدينة: {selectedCity?.name}
            </Text>
          </Box>
        }
        size="lg"
        centered
        radius="lg"
      >
        
      </Modal>
    </Box>
  );
}