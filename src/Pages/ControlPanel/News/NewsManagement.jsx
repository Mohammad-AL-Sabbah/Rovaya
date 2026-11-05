import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Text, Group, Button, Badge, 
  Image, Loader, Center, SimpleGrid, Card, ThemeIcon, Divider,
  Stack 
} from '@mantine/core';
import {
  IconNews, IconCalendar, IconLink, IconArrowUpRight, IconPhoto, IconRefresh
} from '@tabler/icons-react';
import Swal from 'sweetalert2';
import API from '../../../API/ApiAuthToken';

const GREEN = '#0A3A2A';
const GREEN_LIGHT = '#114d38';
const GOLD = '#E8B04B';

// إعدادات الكاش (5 ساعات = 5 * 60 * 60 * 1000 ميلي ثانية)
const CACHE_KEY = 'rovaya_news_cache_v1';
const CACHE_DURATION = 5 * 60 * 60 * 1000; 

// دالة لقراءة البيانات من الكاش
const getCachedNews = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // التحقق من صلاحية الكاش (أقل من 5 ساعات)
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }
    return null; // الكاش منتهي الصلاحية
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

// دالة لحفظ البيانات في الكاش
const setCachedNews = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

export function NewsManagement() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // حالة خاصة لزر التحديث
  const [newsList, setNewsList] = useState([]);

  const fetchNews = async (forceRefresh = false) => {
    // 1. إذا لم نطلب تحديثاً يدوياً، نتحقق من الكاش أولاً
    if (!forceRefresh) {
      const cachedData = getCachedNews();
      if (cachedData) {
        setNewsList(cachedData);
        setLoading(false);
        return; // الخروج مبكراً لأن البيانات موجودة وصحيحة
      }
    }

    // 2. إذا لم يوجد كاش أو طُلب تحديث يدوي، نجلب البيانات من الـ API
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await API.get('/api/Customer/tourism-news/latest?count=50');
      const articles = response.data?.articles || response.data?.data || [];
      
      setNewsList(articles);
      setCachedNews(articles); // حفظ البيانات الجديدة في الكاش

      if (forceRefresh) {
        Swal.fire({
          icon: 'success',
          title: 'تم التحديث',
          text: 'تم جلب أحدث الأخبار بنجاح',
          timer: 1500,
          showConfirmButton: false
        });
      }
      
    } catch (error) {
      console.error('Error fetching news:', error);
      Swal.fire({ 
        icon: 'error', 
        title: 'تعذر تحميل الأخبار', 
        text: 'حدث خطأ أثناء جلب الأخبار من وزارة السياحة' 
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews(false); // جلب البيانات عند فتح الصفحة (مع احترام الكاش)
  }, []);

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-PS', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Box dir="rtl" style={{ background: '#f5f7f6', minHeight: 'calc(100vh - 75px)', padding: '10px', color: '#1f2937' }}>
      
      {/* Header */}
      <Paper radius="xl" p={{ base: 'lg', md: 'xl' }} mb="xl" style={{ 
        background: `linear-gradient(125deg, ${GREEN} 0%, ${GREEN_LIGHT} 65%, #176344 100%)`, 
        position: 'relative', overflow: 'hidden', border: 'none' 
      }}>
        <Box style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.035)', top: -130, left: -50 }} />
        <Group justify="space-between" align="center" style={{ position: 'relative', zIndex: 1 }} wrap="wrap" gap="lg">
          <Group gap="md" align="center">
            <ThemeIcon size={65} radius="xl" variant="light" color="yellow" style={{ background: 'rgba(232,176,75,0.16)', color: GOLD }}>
              <IconNews size={34} stroke={1.7} />
            </ThemeIcon>
            <Box>
              <Text c="white" fw={800} size="xl">الأخبار والأحداث السياحية</Text>
              <Text c="rgba(255,255,255,0.72)" size="sm" mt={5}>آخر الأخبار والفعاليات من وزارة السياحة والآثار الفلسطينية</Text>
            </Box>
          </Group>
          
          <Group gap="sm">
            {/* ✅ زر التحديث اليدوي */}
            <Button 
              variant="white" 
              color="dark" 
              leftSection={refreshing ? null : <IconRefresh size={16} />}
              loading={refreshing}
              onClick={() => fetchNews(true)}
              style={{ fontWeight: 700 }}
            >
              تحديث الأخبار
            </Button>
            
            <Badge variant="light" color="yellow" size="lg" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              مصدر رسمي
            </Badge>
          </Group>
        </Group>
      </Paper>

      {/* Stats */}
      <Paper radius="lg" p="lg" mb="xl" withBorder style={{ borderColor: '#e8eeeb' }}>
        <Group justify="space-between">
          <Box>
            <Text size="xs" c="dimmed" fw={600}>إجمالي الأخبار المتاحة</Text>
            <Text size="2rem" fw={800} c={GREEN}>{newsList.length}</Text>
          </Box>
          <ThemeIcon size={48} radius="md" variant="light" color="teal"><IconNews size={25} /></ThemeIcon>
        </Group>
      </Paper>

      {/* News Grid */}
      {loading ? (
        <Center py={100}>
          <Stack align="center" gap="sm">
            <Loader color="teal" size="lg" />
            <Text c="dimmed">جاري تحميل الأخبار...</Text>
          </Stack>
        </Center>
      ) : newsList.length === 0 ? (
        <Paper radius="lg" p={50} withBorder style={{ textAlign: 'center' }}>
          <ThemeIcon size={75} radius="xl" variant="light" color="gray"><IconNews size={37} /></ThemeIcon>
          <Text fw={700} size="lg" mt="md">لا توجد أخبار متاحة حالياً</Text>
          <Text c="dimmed" size="sm" mt={5}>الأخبار ستظهر هنا فور نشرها من وزارة السياحة</Text>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {newsList.map((item) => (
            <Card 
              key={item.id} 
              radius="lg" 
              padding={0} 
              withBorder 
              style={{ 
                overflow: 'hidden', 
                borderColor: '#e8eeeb', 
                transition: 'all 0.3s ease',
                ':hover': { 
                  transform: 'translateY(-6px)', 
                  boxShadow: '0 12px 24px rgba(10, 58, 42, 0.15)' 
                }
              }}
            >
              {/* Top accent */}
              <Box style={{ height: 4, background: `linear-gradient(90deg, ${GREEN}, ${GOLD})` }} />
              
              {/* Image */}
              <Box style={{ position: 'relative', height: 220, background: '#e9ecef', overflow: 'hidden' }}>
                {item.imageUrl ? (
                  <Image 
                    src={item.imageUrl} 
                    height={220} 
                    fit="cover" 
                    alt={item.title || 'news'} 
                  />
                ) : (
                  <Center h={220}>
                    <IconPhoto size={50} color="#adb5bd" />
                  </Center>
                )}
                
                {/* Date Badge */}
                {item.publishedDate && (
                  <Badge 
                    color="dark" 
                    variant="filled" 
                    size="sm" 
                    style={{ 
                      position: 'absolute', 
                      bottom: 12, 
                      right: 12, 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <IconCalendar size={12} />
                    {formatDate(item.publishedDate)}
                  </Badge>
                )}
              </Box>

              {/* Content */}
              <Box p="lg">
                <Text fw={800} size="lg" lineClamp={2} style={{ color: GREEN, minHeight: 56 }}>
                  {item.title || 'بدون عنوان'}
                </Text>
                
                <Text size="sm" c="dimmed" lineClamp={4} mt="sm" style={{ lineHeight: 1.8, minHeight: 80 }}>
                  {stripHtml(item.summary || 'لا يوجد ملخص للخبر')}
                </Text>

                <Divider my="md" color="#e8eeeb" />

                {/* Source Button */}
                {item.sourceLink ? (
                  <Button 
                    component="a" 
                    href={item.sourceLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    variant="light" 
                    color="teal" 
                    fullWidth
                    rightSection={<IconArrowUpRight size={16} />}
                    style={{ fontWeight: 600 }}
                  >
                    اقرأ الخبر من المصدر
                  </Button>
                ) : (
                  <Button 
                    disabled 
                    variant="outline" 
                    color="gray" 
                    fullWidth
                    leftSection={<IconLink size={16} />}
                  >
                    لا يوجد رابط للمصدر
                  </Button>
                )}
              </Box>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Footer Info */}
      <Paper 
        mt="xl" 
        p="md" 
        radius="lg" 
        withBorder 
        style={{ 
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          borderColor: '#a7f3d0',
          textAlign: 'center'
        }}
      >
        <Group justify="center" gap="xs">
          <IconNews size={18} color={GREEN} />
          <Text size="sm" c={GREEN} fw={600}>
            الأخبار مقدمة من وزارة السياحة والآثار الفلسطينية
          </Text>
        </Group>
        <Text size="xs" c="dimmed" mt="xs">
          هذه الأخبار رسمية ولا يمكن تعديلها من لوحة التحكم
        </Text>
      </Paper>
    </Box>
  );
}