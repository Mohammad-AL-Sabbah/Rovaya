import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Text,
  Group,
  Button,
  ThemeIcon,
  ActionIcon,
  Stack,
  Divider,
  Loader,
  Center,
  Modal,
  TextInput,
  Textarea,
  FileInput,
  Image,
  SimpleGrid,
  Card,
  Badge,
  Overlay,
  Container,
  rem
} from '@mantine/core';

import {
  IconCategory,
  IconPlus,
  IconEdit,
  IconTrash,
  IconPhoto,
  IconX,
  IconBuildingStore,
  IconArrowUpRight,
  IconMapPin,
  IconSparkles,
  IconRefresh,
  IconCheck,
  IconWorld,
  IconCamera
} from '@tabler/icons-react';

import Swal from 'sweetalert2';
import API from '../../../API/ApiAuthToken';

const COLORS = {
  primary: '#0A3A2A',
  secondary: '#114d38',
  gold: '#E8B04B',
  background: '#F5F7F8',
  text: '#173C30',
  muted: '#84918D',
  border: '#E7ECE9'
};

export function TourismGuideCategories() {

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // تنظيف الصور المؤقتة من الذاكرة
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // جلب التصنيفات
  const fetchCategories = async () => {
    setLoading(true);

    try {
      const response = await API.get(
        '/api/Admin/get-tourism-categories?langCode=ar'
      );

      if (response.data.success) {
        setCategories(response.data.data || []);
      }

    } catch (error) {

      Swal.fire({
        icon: 'error',
        title: 'تعذر تحميل البيانات',
        text: 'حدث خطأ أثناء جلب تصنيفات الدليل السياحي',
        confirmButtonColor: COLORS.primary
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // تحديث بيانات النموذج
  const updateForm = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ فتح نافذة الإضافة أو التعديل - تم التصحيح
  const openModal = async (item = null) => {
    setEditingItem(item);

    if (item) {
      // ✅ جلب البيانات الإنجليزية عند التعديل
      let englishData = {};
      
      try {
        const englishResponse = await API.get(
          `/api/Admin/get-tourism-category/${item.id}?langCode=en`
        );
        
        if (englishResponse.data.success) {
          englishData = englishResponse.data.data || {};
        }
      } catch (error) {
        console.warn('English data not found:', error);
      }

      setFormData({
        nameAr: item.name || '',
        nameEn: englishData.name || item.nameEn || '',
        descriptionAr: item.description || '',
        descriptionEn: englishData.description || item.descriptionEn || ''
      });

      setImagePreview(item.imageUrl || null);

    } else {
      setFormData({
        nameAr: '',
        nameEn: '',
        descriptionAr: '',
        descriptionEn: ''
      });

      setImagePreview(null);
    }

    setImageFile(null);
    setIsModalOpen(true);
  };

  // إغلاق النافذة
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setImageFile(null);
    setImagePreview(null);
  };

  // تغيير الصورة
  const handleImageChange = (file) => {

    setImageFile(file);

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(editingItem?.imageUrl || null);
    }
  };

  // حفظ التصنيف
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (saving) return;

    setSaving(true);

    try {

      const translations = [
        {
          languageCode: 'ar',
          name: formData.nameAr,
          description: formData.descriptionAr
        },
        {
          languageCode: 'en',
          name: formData.nameEn,
          description: formData.descriptionEn
        }
      ];

      const data = new FormData();

      data.append(
        'TranslationsJson',
        JSON.stringify(translations)
      );

      if (imageFile) {
        data.append('Image', imageFile);
      }

      let response;

      if (editingItem) {

        response = await API.put(
          `/api/Admin/update-tourism-category/${editingItem.id}`,
          data
        );

      } else {

        response = await API.post(
          '/api/Admin/create-tourism-category',
          data
        );
      }

      if (response.data.success) {

        closeModal();

        Swal.fire({
          icon: 'success',
          title: editingItem ? 'تم تحديث التصنيف' : 'تم إنشاء التصنيف',
          text: 'تم حفظ البيانات بنجاح',
          timer: 1600,
          showConfirmButton: false
        });

        fetchCategories();
      }

    } catch (error) {

      Swal.fire({
        icon: 'error',
        title: 'تعذر حفظ البيانات',
        text: error.response?.data?.message || 'حدث خطأ غير متوقع',
        confirmButtonColor: COLORS.primary
      });

    } finally {
      setSaving(false);
    }
  };

  // حذف التصنيف
  const handleDelete = async (id) => {

    const result = await Swal.fire({
      title: 'حذف التصنيف؟',
      text: 'هل أنت متأكد من حذف هذا التصنيف؟ لا يمكن التراجع عن هذا الإجراء.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D64545',
      cancelButtonColor: COLORS.primary,
      confirmButtonText: 'نعم، احذف التصنيف',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
      customClass: {
        popup: 'rovaya-swal'
      }
    });

    if (!result.isConfirmed) return;

    try {

      const response = await API.delete(
        `/api/Admin/delete-tourism-category/${id}`
      );

      if (response.data.success) {

        setCategories(prev =>
          prev.filter(item => item.id !== id)
        );

        Swal.fire({
          icon: 'success',
          title: 'تم الحذف',
          text: 'تم حذف التصنيف بنجاح',
          timer: 1400,
          showConfirmButton: false
        });
      }

    } catch (error) {

      Swal.fire({
        icon: 'error',
        title: 'فشل الحذف',
        text: error.response?.data?.message || 'تعذر حذف التصنيف',
        confirmButtonColor: COLORS.primary
      });
    }
  };


useEffect(() => {
  document.title = 'التصنيفات  | ROVAYA';
}, []); 


  return (

    <Box
      className="rovaya-categories"
      style={{
        backgroundColor: COLORS.background,
        minHeight: 'calc(100vh - 75px)',
        direction: 'rtl',
        fontFamily: 'inherit'
      }}
    >

      {/* =========================
          CSS الخاص بالتصميم
      ========================= */}

      <style>{`

        .rovaya-categories * {
          box-sizing: border-box;
        }

        .rovaya-page-header {
          background: linear-gradient(
            120deg,
            #082f23 0%,
            #0A3A2A 55%,
            #15533d 100%
          );
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 30px 34px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 28px rgba(10,58,42,0.10);
        }

        .rovaya-page-header::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border: 1px solid rgba(232,176,75,0.16);
          border-radius: 50%;
          top: -190px;
          left: -60px;
          pointer-events: none;
        }

        .rovaya-page-header::after {
          content: '';
          position: absolute;
          width: 200px;
          height: 200px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 50%;
          bottom: -155px;
          left: 180px;
          pointer-events: none;
        }

        .rovaya-add-btn {
          background: #E8B04B !important;
          color: #0A3A2A !important;
          font-weight: 800 !important;
          border-radius: 10px !important;
          transition: all .25s ease !important;
          position: relative;
          z-index: 2;
        }

        .rovaya-add-btn:hover {
          background: #F2C46E !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(232,176,75,0.22);
        }

        .rovaya-section-label {
          color: #87958F;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .5px;
        }

        .rovaya-category-card {
          border: 1px solid #E6EBE8 !important;
          border-radius: 17px !important;
          overflow: hidden;
          background: #fff !important;
          transition:
            transform .3s ease,
            box-shadow .3s ease,
            border-color .3s ease !important;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .rovaya-category-card:hover {
          transform: translateY(-7px);
          border-color: rgba(232,176,75,.7) !important;
          box-shadow: 0 18px 38px rgba(10,58,42,.12) !important;
        }

        .rovaya-card-image {
          height: 205px;
          position: relative;
          overflow: hidden;
          background: #E9EFEB;
        }

        .rovaya-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .6s ease;
        }

        .rovaya-category-card:hover .rovaya-card-image img {
          transform: scale(1.06);
        }

        .rovaya-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(5,35,25,.70) 0%,
            rgba(5,35,25,.10) 45%,
            transparent 100%
          );
          pointer-events: none;
        }

        .rovaya-image-tag {
          position: absolute;
          top: 15px;
          right: 15px;
          background: #E8B04B;
          color: #0A3A2A;
          padding: 6px 13px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
          box-shadow: 0 3px 10px rgba(0,0,0,.15);
        }

        .rovaya-image-bottom {
          position: absolute;
          bottom: 15px;
          right: 17px;
          left: 17px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }

        .rovaya-image-bottom span {
          font-size: 11px;
          color: rgba(255,255,255,.85);
        }

        .rovaya-card-body {
          padding: 20px 21px 15px;
          flex: 1;
        }

        .rovaya-card-title {
          color: #0A3A2A;
          font-size: 19px;
          font-weight: 850;
          line-height: 1.5;
        }

        .rovaya-card-description {
          color: #89948F;
          font-size: 13px;
          line-height: 1.9;
          min-height: 72px;
          margin-top: 9px;
        }

        .rovaya-card-footer {
          border-top: 1px solid #EDF0EE;
          background: #FCFDFC;
          padding: 14px 19px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rovaya-id {
          font-size: 11px;
          font-weight: 700;
          color: #A0AAA5;
          direction: ltr;
        }

        .rovaya-action {
          transition: all .2s ease !important;
          border-radius: 8px !important;
        }

        .rovaya-action:hover {
          transform: translateY(-2px);
          background: #F0F4F1 !important;
        }

        .rovaya-empty-state {
          background: #fff;
          border: 1px dashed #D5DED8;
          border-radius: 18px;
          padding: 65px 20px;
          text-align: center;
        }

        .rovaya-form-section {
          background: #F7F9F7;
          border: 1px solid #E8EDE9;
          border-radius: 13px;
          padding: 17px;
        }

        .rovaya-image-preview {
          border: 2px solid #E6ECE7;
          border-radius: 12px;
          overflow: hidden;
          width: 100%;
          max-width: 270px;
          position: relative;
        }

        .rovaya-save-btn {
          background: #0A3A2A !important;
          border-radius: 9px !important;
          font-weight: 700 !important;
          padding-inline: 24px !important;
        }

        .rovaya-save-btn:hover {
          background: #15533d !important;
        }

        .rovaya-categories .mantine-Modal-content {
          border-radius: 18px;
          overflow: hidden;
        }

        .rovaya-categories .mantine-Modal-header {
          border-bottom: 1px solid #EDF0EE;
          padding: 20px 24px;
        }

        @media (max-width: 768px) {

          .rovaya-categories {
            padding: 14px !important;
          }

          .rovaya-page-header {
            padding: 23px 18px;
          }

          .rovaya-header-content {
            flex-direction: column;
            align-items: stretch !important;
          }

          .rovaya-add-btn {
            width: 100%;
          }

          .rovaya-card-image {
            height: 220px;
          }

        }

      `}</style>


      {/* =========================
          رأس الصفحة
      ========================= */}

      <Paper
        className="rovaya-page-header"
        mb={32}
        radius="lg"
      >

        <Group
          className="rovaya-header-content"
          justify="space-between"
          align="center"
          gap="xl"
        >

          <Box style={{ position: 'relative', zIndex: 2 }}>

            <Group gap="sm" mb={10}>

              <ThemeIcon
                size={48}
                radius="12px"
                variant="light"
                style={{
                  background: 'rgba(232,176,75,.15)',
                  color: COLORS.gold,
                  border: '1px solid rgba(232,176,75,.25)'
                }}
              >
                <IconBuildingStore size={27} />
              </ThemeIcon>

              <Text
                fw={850}
                size="xl"
                c="white"
                style={{ fontSize: '25px' }}
              >
                تصنيفات الدليل السياحي
              </Text>

            </Group>

            <Text
              c="rgba(255,255,255,.72)"
              size="sm"
              pr={1}
            >
              إدارة وتنظيم فئات الأماكن والمدن السياحية في منصة روفايا
            </Text>

          </Box>


          <Button
            className="rovaya-add-btn"
            size="lg"
            leftSection={<IconPlus size={20} />}
            onClick={() => openModal()}
          >
            إضافة تصنيف جديد
          </Button>

        </Group>

      </Paper>


      {/* =========================
          إحصائيات بسيطة
      ========================= */}

      <SimpleGrid
        cols={{ base: 1, xs: 2, sm: 3 }}
        spacing="md"
        mb={30}
      >

        <Paper
          p="lg"
          radius="md"
          withBorder
          style={{ borderColor: COLORS.border }}
        >
          <Group justify="space-between">

            <Box>
              <Text size="xs" c="dimmed" fw={700}>
                إجمالي التصنيفات
              </Text>

              <Text
                size="30px"
                fw={850}
                c={COLORS.primary}
                mt={5}
              >
                {loading ? '—' : categories.length}
              </Text>
            </Box>

            <ThemeIcon
              size={48}
              radius="md"
              style={{
                background: '#EAF2ED',
                color: COLORS.primary
              }}
            >
              <IconCategory size={25} />
            </ThemeIcon>

          </Group>
        </Paper>


        <Paper
          p="lg"
          radius="md"
          withBorder
          style={{ borderColor: COLORS.border }}
        >
          <Group justify="space-between">

            <Box>
              <Text size="xs" c="dimmed" fw={700}>
          كل تصنيف يمكن اضافة العديد من المدن له
              </Text>

              <Text
                size="lg"
                fw={800}
                c={COLORS.primary}
                mt={9}
              >
                وتخصيص كل مدينة وأقسامها
              </Text>
            </Box>

            <ThemeIcon
              size={48}
              radius="md"
              style={{
                background: '#EDF6F0',
                color: '#23945B'
              }}
            >
              <IconCheck size={25} />
            </ThemeIcon>

          </Group>
        </Paper>


        <Paper
          p="lg"
          radius="md"
          withBorder
          style={{ borderColor: COLORS.border }}
        >
          <Group justify="space-between">

            <Box>
              <Text size="xs" c="dimmed" fw={700}>
                إدارة المحتوى
              </Text>

              <Text
                size="lg"
                fw={800}
                c={COLORS.primary}
                mt={9}
              >
                الدليل السياحي
              </Text>
            </Box>

            <ThemeIcon
              size={48}
              radius="md"
              style={{
                background: '#FBF3E5',
                color: '#BD862B'
              }}
            >
              <IconWorld size={25} />
            </ThemeIcon>

          </Group>
        </Paper>

      </SimpleGrid>


      {/* =========================
          عنوان قسم التصنيفات
      ========================= */}

      <Group justify="space-between" mb="lg">

        <Box>

          <Group gap={8}>

            <Box
              style={{
                width: 4,
                height: 22,
                borderRadius: 4,
                background: COLORS.gold
              }}
            />

            <Text
              fw={850}
              size="lg"
              c={COLORS.primary}
            >
              التصنيفات الحالية
            </Text>

          </Group>

          <Text
            size="xs"
            c="dimmed"
            mt={6}
            mr={3}
          >
            استعرض وأدرج وعدّل التصنيفات السياحية الخاصة بمنصتك
          </Text>

        </Box>


        <Button
          variant="subtle"
          color="dark"
          size="sm"
          leftSection={<IconRefresh size={16} />}
          onClick={fetchCategories}
          loading={loading}
        >
          تحديث البيانات
        </Button>

      </Group>


      {/* =========================
          البطاقات الرئيسية
      ========================= */}

      {loading ? (

        <Center py={100}>
          <Stack align="center" gap="md">

            <Loader
              color={COLORS.primary}
              size="xl"
              type="dots"
            />

            <Text size="sm" c="dimmed">
              جارٍ تحميل التصنيفات...
            </Text>

          </Stack>
        </Center>

      ) : categories.length === 0 ? (

        <Box className="rovaya-empty-state">

          <ThemeIcon
            size={85}
            radius="xl"
            mx="auto"
            mb="lg"
            style={{
              background: '#EAF1EC',
              color: COLORS.primary
            }}
          >
            <IconBuildingStore size={40} />
          </ThemeIcon>

          <Text
            fw={850}
            size="lg"
            c={COLORS.primary}
          >
            لا توجد تصنيفات حتى الآن
          </Text>

          <Text
            size="sm"
            c="dimmed"
            mt={8}
          >
            ابدأ بتنظيم دليلك السياحي من خلال إضافة أول تصنيف
          </Text>

          <Button
            mt="xl"
            className="rovaya-add-btn"
            leftSection={<IconPlus size={18} />}
            onClick={() => openModal()}
          >
            إضافة أول تصنيف
          </Button>

        </Box>

      ) : (

        <SimpleGrid
          cols={{
            base: 1,
            sm: 2,
            lg: 3,
            xl: 3
          }}
          spacing="xl"
          verticalSpacing="xl"
        >

          {categories.map((cat) => (

            <Card
              key={cat.id}
              className="rovaya-category-card"
              padding={0}
              radius="lg"
              withBorder
            >

              {/* صورة التصنيف */}

              <Box className="rovaya-card-image">

                {cat.imageUrl ? (

                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    height="100%"
                    width="100%"
                    fit="cover"
                  />

                ) : (

                  <Center h="100%">

                    <Stack align="center" gap={5}>

                      <IconPhoto
                        size={48}
                        color="#A4B3AA"
                        stroke={1.4}
                      />

                      <Text size="xs" c="dimmed">
                        لا توجد صورة
                      </Text>

                    </Stack>

                  </Center>

                )}

                <Box className="rovaya-image-overlay" />

                <Badge className="rovaya-image-tag">
                  تصنيف سياحي
                </Badge>

                <Box className="rovaya-image-bottom">

                  <Group gap={6}>
                    <IconSparkles size={15} color={COLORS.gold} />

                    <Text
                      size="xs"
                      fw={700}
                      c="white"
                    >
                      ROVAYA GUIDE
                    </Text>
                  </Group>

                  <Text
                    size="xs"
                    c="white"
                    fw={600}
                  >
                    #{cat.id}
                  </Text>

                </Box>

              </Box>


              {/* معلومات التصنيف */}

              <Box className="rovaya-card-body">

                <Group
                  justify="space-between"
                  align="center"
                  mb={8}
                >

                  <Text
                    className="rovaya-card-title"
                    lineClamp={1}
                  >
                    {cat.name}
                  </Text>

                  <ThemeIcon
                    size={30}
                    radius="md"
                    variant="light"
                    style={{
                      background: '#F8F1E5',
                      color: '#B98531',
                      flexShrink: 0
                    }}
                  >
                    <IconMapPin size={17} />
                  </ThemeIcon>

                </Group>


                {cat.nameEn && (

                  <Text
                    size="xs"
                    c="dimmed"
                    dir="ltr"
                    ta="right"
                    fw={600}
                    mb={8}
                  >
                    {cat.nameEn}
                  </Text>

                )}


                <Text
                  className="rovaya-card-description"
                  lineClamp={3}
                >
                  {cat.description ||
                    'لا يوجد وصف متاح لهذا التصنيف حالياً.'}
                </Text>

              </Box>


              {/* أسفل البطاقة */}

              <Box className="rovaya-card-footer">

                <Text className="rovaya-id">
                  CATEGORY ID: {cat.id}
                </Text>

                <Group gap={7}>

                  <ActionIcon
                    className="rovaya-action"
                    variant="light"
                    color="blue"
                    size="lg"
                    onClick={() => openModal(cat)}
                    title="تعديل التصنيف"
                  >
                    <IconEdit size={19} />
                  </ActionIcon>

                  <ActionIcon
                    className="rovaya-action"
                    variant="light"
                    color="red"
                    size="lg"
                    onClick={() => handleDelete(cat.id)}
                    title="حذف التصنيف"
                  >
                    <IconTrash size={19} />
                  </ActionIcon>

                </Group>

              </Box>

            </Card>

          ))}

        </SimpleGrid>

      )}


      {/* =========================
          نافذة الإضافة والتعديل
      ========================= */}

      <Modal
        opened={isModalOpen}
        onClose={closeModal}
        centered
        size="xl"
        radius="lg"
        padding={0}
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3
        }}
      >

        {/* رأس النافذة */}

        <Box
          p="xl"
          style={{
            background: `linear-gradient(120deg, ${COLORS.primary}, ${COLORS.secondary})`,
            color: 'white'
          }}
        >

          <Group justify="space-between">

            <Group gap="sm">

              <ThemeIcon
                size={43}
                radius="md"
                style={{
                  background: 'rgba(232,176,75,.18)',
                  color: COLORS.gold
                }}
              >
                <IconCategory size={23} />
              </ThemeIcon>

              <Box>

                <Text fw={850} size="lg" c="white">
                  {editingItem
                    ? 'تعديل التصنيف'
                    : 'إضافة تصنيف جديد'}
                </Text>

                <Text
                  size="xs"
                  c="rgba(255,255,255,.7)"
                  mt={3}
                >
                  إدارة بيانات التصنيف السياحي
                </Text>

              </Box>

            </Group>


            <ActionIcon
              variant="subtle"
              color="white"
              size="lg"
              onClick={closeModal}
            >
              <IconX size={21} />
            </ActionIcon>

          </Group>

        </Box>


        {/* محتوى النافذة */}

        <Box p={{ base: 'md', sm: 'xl' }}>

          <form onSubmit={handleSubmit}>

            <Stack gap="lg">

              {/* البيانات الأساسية */}

              <Box>

                <Group gap={8} mb="md">

                  <IconWorld
                    size={19}
                    color={COLORS.primary}
                  />

                  <Text
                    fw={800}
                    c={COLORS.primary}
                    size="sm"
                  >
                    المعلومات الأساسية
                  </Text>

                </Group>


                <SimpleGrid cols={{ base: 1, sm: 2 }}>

                  <TextInput
                    label="اسم التصنيف بالعربية"
                    placeholder="مثال: المدن التاريخية"
                    required
                    value={formData.nameAr}
                    onChange={e =>
                      updateForm('nameAr', e.target.value)
                    }
                    radius="md"
                    size="md"
                  />

                  <TextInput
                    label="Category Name (English)"
                    placeholder="e.g. Historical Cities"
                    required
                    dir="ltr"
                    value={formData.nameEn}
                    onChange={e =>
                      updateForm('nameEn', e.target.value)
                    }
                    radius="md"
                    size="md"
                  />

                </SimpleGrid>

              </Box>


              <Divider color={COLORS.border} />


              {/* الأوصاف */}

              <Box>

                <Group gap={8} mb="md">

                  <IconCategory
                    size={19}
                    color={COLORS.primary}
                  />

                  <Text
                    fw={800}
                    c={COLORS.primary}
                    size="sm"
                  >
                    وصف التصنيف
                  </Text>

                </Group>


                <SimpleGrid cols={{ base: 1, sm: 2 }}>

                  <Textarea
                    label="الوصف بالعربية"
                    placeholder="اكتب وصفاً مختصراً للتصنيف..."
                    minRows={4}
                    autosize
                    maxRows={7}
                    value={formData.descriptionAr}
                    onChange={e =>
                      updateForm('descriptionAr', e.target.value)
                    }
                    radius="md"
                  />

                  <Textarea
                    label="Description (English)"
                    placeholder="Write a short description..."
                    minRows={4}
                    autosize
                    maxRows={7}
                    dir="ltr"
                    value={formData.descriptionEn}
                    onChange={e =>
                      updateForm('descriptionEn', e.target.value)
                    }
                    radius="md"
                  />

                </SimpleGrid>

              </Box>


              <Divider color={COLORS.border} />


              {/* الصورة */}

              <Box>

                <Group gap={8} mb="md">

                  <IconCamera
                    size={19}
                    color={COLORS.primary}
                  />

                  <Text
                    fw={800}
                    c={COLORS.primary}
                    size="sm"
                  >
                    صورة التصنيف
                  </Text>

                </Group>


                <Box className="rovaya-form-section">

                  <FileInput
                    label="اختر صورة للتصنيف"
                    description="الصيغ المدعومة: PNG, JPG, WEBP"
                    placeholder="اضغط لاختيار صورة"
                    accept="image/png,image/jpeg,image/webp"
                    value={imageFile}
                    onChange={handleImageChange}
                    leftSection={
                      <IconPhoto
                        size={18}
                        color={COLORS.primary}
                      />
                    }
                    clearable
                    radius="md"
                  />


                  {imagePreview && (

                    <Box mt="lg">

                      <Group
                        justify="space-between"
                        mb="xs"
                      >

                        <Text
                          size="xs"
                          fw={700}
                          c={COLORS.primary}
                        >
                          معاينة الصورة
                        </Text>

                        <Badge color="green" variant="light">
                          جاهزة
                        </Badge>

                      </Group>


                      <Box className="rovaya-image-preview">

                        <Image
                          src={imagePreview}
                          height={165}
                          width="100%"
                          fit="cover"
                          alt="معاينة صورة التصنيف"
                        />

                        <ActionIcon
                          size="sm"
                          color="red"
                          variant="filled"
                          radius="xl"
                          style={{
                            position: 'absolute',
                            top: 9,
                            left: 9
                          }}
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(
                              editingItem?.imageUrl || null
                            );
                          }}
                        >
                          <IconX size={14} />
                        </ActionIcon>

                      </Box>

                    </Box>

                  )}

                </Box>

              </Box>


              {/* أزرار النافذة */}

              <Group
                justify="space-between"
                mt="sm"
                pt="lg"
                style={{
                  borderTop: `1px solid ${COLORS.border}`
                }}
              >

                <Button
                  variant="subtle"
                  color="gray"
                  onClick={closeModal}
                  disabled={saving}
                >
                  إلغاء
                </Button>


                <Button
                  type="submit"
                  className="rovaya-save-btn"
                  color="dark"
                  loading={saving}
                  leftSection={
                    !saving && <IconCheck size={18} />
                  }
                >
                  {editingItem
                    ? 'حفظ التعديلات'
                    : 'إنشاء التصنيف'}
                </Button>

              </Group>

            </Stack>

          </form>

        </Box>

      </Modal>

    </Box>
  );
}