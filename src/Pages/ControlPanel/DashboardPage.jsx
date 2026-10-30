import React, { useState, useEffect } from 'react';

import { 

  Box, Paper, Text, Group, Button, ThemeIcon,
  Skeleton, Badge, Divider, SimpleGrid, Card, Image,

  Modal, ScrollArea, TextInput, Select, ActionIcon

} from '@mantine/core';

import { 

  IconUsers, IconHeadset, IconBuilding,

  IconPlaneDeparture, IconArrowRight, IconNews, IconClock, 

  IconSun, IconCloudRain, IconWind, IconDroplets, IconCloud,

  IconMapPin, IconSearch, IconX, IconRefresh, IconThermometer, IconCheck, IconAlertCircle

} from '@tabler/icons-react';

import API from '../../API/ApiAuthToken';



// Open-Meteo provides current weather without an API key.
// Weather values are requested by fixed coordinates to avoid ambiguous city-name geocoding.
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// مدن وبلدات ومناطق فلسطينية رئيسية موزعة على محافظات الضفة الغربية وقطاع غزة.
// درجات الحرارة والظروف أدناه لا تُخزّن هنا؛ جميعها تُجلب من خدمة الطقس عند التشغيل.
const PALESTINE_CITIES = [
  { name: 'جنين', enName: 'Jenin', region: 'محافظة جنين', latitude: 32.461, longitude: 35.300 },
  { name: 'قباطية', enName: 'Qabatiya', region: 'محافظة جنين', latitude: 32.412, longitude: 35.288 },
  { name: 'عرابة', enName: 'Arraba', region: 'محافظة جنين', latitude: 32.402, longitude: 35.202 },
  { name: 'طوباس', enName: 'Tubas', region: 'محافظة طوباس والأغوار الشمالية', latitude: 32.321, longitude: 35.369 },
  { name: 'طمون', enName: 'Tammun', region: 'محافظة طوباس والأغوار الشمالية', latitude: 32.283, longitude: 35.376 },
  { name: 'طولكرم', enName: 'Tulkarm', region: 'محافظة طولكرم', latitude: 32.310, longitude: 35.028 },
  { name: 'عنبتا', enName: 'Anabta', region: 'محافظة طولكرم', latitude: 32.307, longitude: 35.114 },
  { name: 'قلقيلية', enName: 'Qalqilya', region: 'محافظة قلقيلية', latitude: 32.189, longitude: 34.970 },
  { name: 'عزون', enName: 'Azzun', region: 'محافظة قلقيلية', latitude: 32.174, longitude: 35.057 },
  { name: 'نابلس', enName: 'Nablus', region: 'محافظة نابلس', latitude: 32.222, longitude: 35.262 },
  { name: 'سبسطية', enName: 'Sebastia', region: 'محافظة نابلس', latitude: 32.276, longitude: 35.189 },
  { name: 'حوارة', enName: 'Huwara', region: 'محافظة نابلس', latitude: 32.153, longitude: 35.256 },
  { name: 'عقربا', enName: 'Aqraba', region: 'محافظة نابلس', latitude: 32.127, longitude: 35.343 },
  { name: 'سلفيت', enName: 'Salfit', region: 'محافظة سلفيت', latitude: 32.083, longitude: 35.181 },
  { name: 'بديا', enName: 'Biddya', region: 'محافظة سلفيت', latitude: 32.115, longitude: 35.080 },
  { name: 'رام الله', enName: 'Ramallah', region: 'محافظة رام الله والبيرة', latitude: 31.903, longitude: 35.203 },
  { name: 'البيرة', enName: 'Al Bireh', region: 'محافظة رام الله والبيرة', latitude: 31.910, longitude: 35.216 },
  { name: 'بيرزيت', enName: 'Birzeit', region: 'محافظة رام الله والبيرة', latitude: 31.976, longitude: 35.183 },
  { name: 'روابي', enName: 'Rawabi', region: 'محافظة رام الله والبيرة', latitude: 32.009, longitude: 35.190 },
  { name: 'أريحا', enName: 'Jericho', region: 'محافظة أريحا والأغوار', latitude: 31.861, longitude: 35.461 },
  { name: 'العوجا', enName: 'Al Auja', region: 'محافظة أريحا والأغوار', latitude: 31.950, longitude: 35.465 },
  { name: 'القدس', enName: 'Jerusalem', region: 'محافظة القدس', latitude: 31.768, longitude: 35.214 },
  { name: 'أبو ديس', enName: 'Abu Dis', region: 'محافظة القدس', latitude: 31.762, longitude: 35.267 },
  { name: 'الرام', enName: 'Al Ram', region: 'محافظة القدس', latitude: 31.850, longitude: 35.235 },
  { name: 'بيت لحم', enName: 'Bethlehem', region: 'محافظة بيت لحم', latitude: 31.705, longitude: 35.202 },
  { name: 'بيت جالا', enName: 'Beit Jala', region: 'محافظة بيت لحم', latitude: 31.715, longitude: 35.184 },
  { name: 'بيت ساحور', enName: 'Beit Sahour', region: 'محافظة بيت لحم', latitude: 31.700, longitude: 35.226 },
  { name: 'الخضر', enName: 'Al Khader', region: 'محافظة بيت لحم', latitude: 31.694, longitude: 35.167 },
  { name: 'الخليل', enName: 'Hebron', region: 'محافظة الخليل', latitude: 31.532, longitude: 35.099 },
  { name: 'حلحول', enName: 'Halhul', region: 'محافظة الخليل', latitude: 31.580, longitude: 35.102 },
  { name: 'دورا', enName: 'Dura', region: 'محافظة الخليل', latitude: 31.507, longitude: 35.028 },
  { name: 'يطا', enName: 'Yatta', region: 'محافظة الخليل', latitude: 31.446, longitude: 35.092 },
  { name: 'الظاهرية', enName: 'Adh Dhahiriya', region: 'محافظة الخليل', latitude: 31.409, longitude: 34.973 },
  { name: 'غزة', enName: 'Gaza', region: 'محافظة غزة', latitude: 31.501, longitude: 34.466 },
  { name: 'جباليا', enName: 'Jabalia', region: 'محافظة شمال غزة', latitude: 31.528, longitude: 34.484 },
  { name: 'بيت لاهيا', enName: 'Beit Lahia', region: 'محافظة شمال غزة', latitude: 31.547, longitude: 34.495 },
  { name: 'بيت حانون', enName: 'Beit Hanoun', region: 'محافظة شمال غزة', latitude: 31.535, longitude: 34.535 },
  { name: 'دير البلح', enName: 'Deir al Balah', region: 'محافظة دير البلح', latitude: 31.417, longitude: 34.350 },
  { name: 'النصيرات', enName: 'Nuseirat', region: 'محافظة دير البلح', latitude: 31.448, longitude: 34.392 },
  { name: 'البريج', enName: 'Al Bureij', region: 'محافظة دير البلح', latitude: 31.439, longitude: 34.403 },
  { name: 'خان يونس', enName: 'Khan Yunis', region: 'محافظة خان يونس', latitude: 31.346, longitude: 34.306 },
  { name: 'بني سهيلا', enName: 'Bani Suheila', region: 'محافظة خان يونس', latitude: 31.343, longitude: 34.323 },
  { name: 'رفح', enName: 'Rafah', region: 'محافظة رفح', latitude: 31.296, longitude: 34.243 },
];

const WEATHER_CODE_INFO = {
  0: { description: 'سماء صافية', icon: '01d' },
  1: { description: 'صحو غالباً', icon: '02d' },
  2: { description: 'غائم جزئياً', icon: '02d' },
  3: { description: 'غائم', icon: '04d' },
  45: { description: 'ضباب', icon: '50d' },
  48: { description: 'ضباب مع صقيع', icon: '50d' },
  51: { description: 'رذاذ خفيف', icon: '09d' },
  53: { description: 'رذاذ متوسط', icon: '09d' },
  55: { description: 'رذاذ كثيف', icon: '09d' },
  56: { description: 'رذاذ متجمد خفيف', icon: '09d' },
  57: { description: 'رذاذ متجمد كثيف', icon: '09d' },
  61: { description: 'مطر خفيف', icon: '10d' },
  63: { description: 'مطر متوسط', icon: '10d' },
  65: { description: 'مطر غزير', icon: '10d' },
  66: { description: 'مطر متجمد خفيف', icon: '13d' },
  67: { description: 'مطر متجمد غزير', icon: '13d' },
  71: { description: 'ثلوج خفيفة', icon: '13d' },
  73: { description: 'ثلوج متوسطة', icon: '13d' },
  75: { description: 'ثلوج كثيفة', icon: '13d' },
  77: { description: 'حبيبات ثلجية', icon: '13d' },
  80: { description: 'زخات مطر خفيفة', icon: '09d' },
  81: { description: 'زخات مطر متوسطة', icon: '09d' },
  82: { description: 'زخات مطر غزيرة', icon: '09d' },
  85: { description: 'زخات ثلجية خفيفة', icon: '13d' },
  86: { description: 'زخات ثلجية كثيفة', icon: '13d' },
  95: { description: 'عاصفة رعدية', icon: '11d' },
  96: { description: 'عاصفة رعدية مع برد خفيف', icon: '11d' },
  99: { description: 'عاصفة رعدية مع برد كثيف', icon: '11d' },
};

export function DashboardPage() {

  const [loading, setLoading] = useState(true);

  const [news, setNews] = useState([]);

  const [weatherData, setWeatherData] = useState([]);

  const [modalOpened, setModalOpened] = useState(false);
  const [weatherSearch, setWeatherSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [refreshingWeather, setRefreshingWeather] = useState(false);

  const [adminStats, setAdminStats] = useState({

    totalUsers: 0,

    totalRecommendations: 0,

    supportTickets: 0,

    totalEmployees: 0

  });



  const fetchDashboardData = async () => {

    try {

      setLoading(true);



      // جلب الأخبار

      const newsRes = await API.get('/api/Customer/tourism-news/latest?count=6');

      setNews(newsRes.data?.articles || []);



      // جلب بيانات الطقس

      await fetchAllCitiesWeather();



      // جلب إحصائيات الإدارة

      await fetchAdminStats();



    } catch (error) {

      console.error('Error fetching dashboard data:', error);

      setNews([]);

    } finally {

      setLoading(false);

    }

  };



  const fetchAllCitiesWeather = async () => {
    const chunkSize = 20;
    const resultsByName = new Map();

    // Open-Meteo يدعم تمرير عدة إحداثيات في الطلب الواحد، ما يقلل عدد الطلبات.
    const chunks = [];
    for (let i = 0; i < PALESTINE_CITIES.length; i += chunkSize) {
      chunks.push(PALESTINE_CITIES.slice(i, i + chunkSize));
    }

    await Promise.all(chunks.map(async (citiesChunk) => {
      try {
        const params = new URLSearchParams({
          latitude: citiesChunk.map((city) => city.latitude).join(','),
          longitude: citiesChunk.map((city) => city.longitude).join(','),
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
          timezone: 'auto',
          wind_speed_unit: 'ms',
        });
        const response = await fetch(`${WEATHER_API_URL}?${params.toString()}`);
        if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);

        const payload = await response.json();
        const locationsWeather = Array.isArray(payload) ? payload : [payload];

        citiesChunk.forEach((city, index) => {
          const current = locationsWeather[index]?.current;
          if (!current || typeof current.temperature_2m !== 'number') {
            resultsByName.set(city.name, {
              ...city, temp: null, description: 'تعذر جلب البيانات', icon: null,
              humidity: null, wind: null, feelsLike: null, unavailable: true,
            });
            return;
          }

          const weatherInfo = WEATHER_CODE_INFO[current.weather_code] || {
            description: 'حالة جوية غير معروفة', icon: '03d',
          };
          resultsByName.set(city.name, {
            ...city,
            temp: current.temperature_2m,
            description: weatherInfo.description,
            icon: weatherInfo.icon,
            humidity: current.relative_humidity_2m ?? null,
            wind: current.wind_speed_10m ?? null,
            feelsLike: current.apparent_temperature ?? null,
            unavailable: false,
            observedAt: current.time ?? null,
          });
        });
      } catch (error) {
        console.error('Error fetching weather batch:', error);
        citiesChunk.forEach((city) => {
          resultsByName.set(city.name, {
            ...city, temp: null, description: 'تعذر الاتصال بخدمة الطقس', icon: null,
            humidity: null, wind: null, feelsLike: null, unavailable: true,
          });
        });
      }
    }));

    setWeatherData(PALESTINE_CITIES.map((city) => resultsByName.get(city.name) || {
      ...city, temp: null, description: 'غير متوفر', icon: null,
      humidity: null, wind: null, feelsLike: null, unavailable: true,
    }));
  };

  const fetchAdminStats = async () => {

    try {

      const [usersRes, recommendationsRes, ticketsRes, employeesRes] = await Promise.all([

        API.get('/api/Admin/getAllUsers').catch(() => ({ data: [] })),

        API.get('/api/Recommendation/AdmingetRecommendation').catch(() => ({ data: [] })),

        API.get('/api/Support/tickets').catch(() => ({ data: [] })),

        API.get('/api/Admin/employees').catch(() => ({ data: [] }))

      ]);



      setAdminStats({

        totalUsers: usersRes.data?.length || 0,

        totalRecommendations: recommendationsRes.data?.length || 0,

        supportTickets: ticketsRes.data?.filter(t => t.status !== 'resolved').length || 0,

        totalEmployees: employeesRes.data?.length || 0

      });

    } catch (error) {

      console.log('Using default stats');

      setAdminStats({

        totalUsers: 0,

        totalRecommendations: 0,

        supportTickets: 0,

        totalEmployees: 0

      });

    }

  };



  useEffect(() => {

    fetchDashboardData();

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



  const getWeatherIcon = (iconCode) => {

    const iconMap = {

      '01d': IconSun,

      '01n': IconSun,

      '02d': IconCloud,

      '02n': IconCloud,

      '03d': IconCloud,

      '03n': IconCloud,

      '04d': IconCloud,

      '04n': IconCloud,

      '09d': IconCloudRain,

      '09n': IconCloudRain,

      '10d': IconCloudRain,

      '10n': IconCloudRain,

      '11d': IconCloudRain,

      '11n': IconCloudRain,

      '13d': IconCloud,

      '13n': IconCloud,

      '50d': IconCloud,

      '50n': IconCloud,

    };

    return iconMap[iconCode] || IconSun;

  };



  // عرض أول 5 مدن في لوحة التحكم، مع أدوات بحث وتصفية داخل نافذة جميع المدن.
  const visibleCities = weatherData.slice(0, 5);
  const hiddenCities = weatherData.slice(5);
  const weatherRegions = [...new Set(weatherData.map((city) => city.region).filter(Boolean))];
  const filteredWeatherCities = weatherData.filter((city) => {
    const search = weatherSearch.trim().toLocaleLowerCase('ar');
    const matchesSearch = !search ||
      city.name.toLocaleLowerCase('ar').includes(search) ||
      (city.enName || '').toLocaleLowerCase().includes(search) ||
      (city.region || '').toLocaleLowerCase('ar').includes(search);
    const matchesRegion = selectedRegion === 'all' || city.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });
  const availableWeatherCount = weatherData.filter((city) => !city.unavailable && city.temp !== null).length;
  const averageTemperature = weatherData.filter((city) => !city.unavailable && typeof city.temp === 'number');
  const averageTemp = averageTemperature.length
    ? Math.round(averageTemperature.reduce((sum, city) => sum + city.temp, 0) / averageTemperature.length)
    : null;

  const handleWeatherRefresh = async () => {
    setRefreshingWeather(true);
    try {
      await fetchAllCitiesWeather();
    } finally {
      setRefreshingWeather(false);
    }
  };



  return (

    <Box style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 75px)', direction: 'rtl' }}>



      {/* Banner الترحيب */}

      <Paper 

        p="xl" radius="lg" 

        style={{ 

          background: 'linear-gradient(135deg, #0A3A2A 0%, #114d38 100%)', color: '#ffffff',

          position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(10, 58, 42, 0.2)',

          marginBottom: '30px', border: '1px solid rgba(255,255,255,0.1)'

        }}

      >

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>

          <div>

            <Group gap="xs" mb={8}>

              <ThemeIcon size="sm" radius="xl" color="teal" variant="light" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>

                <IconPlaneDeparture size={14} />

              </ThemeIcon>

              <Text size="xs" fw={700} style={{ letterSpacing: '1px', textTransform: 'uppercase', color: '#cbd5e1' }}>

                ROVAYA ADMIN PANEL • 2026

              </Text>

            </Group>

            <Text size="xl" fw={800} style={{ color: '#ffffffe0', letterSpacing: '0.5px' }}>

              لوحة تحكم الإدارة - Rovaya Tourism Portal

            </Text>

            <Text size="sm" c="rgba(255,255,255,0.8)" mt={4} maw={600}>

              متابعة وإدارة النظام السياحي، المستخدمين، التوصيات، والدعم الفني

            </Text>

          </div>

          <Button variant="white" color="dark" radius="md" size="sm" rightSection={<IconArrowRight size={16} />} style={{ fontWeight: 700, color: '#0A3A2A' }}>

            عرض التقارير الشاملة

          </Button>

        </div>

      </Paper>



      {/* الإحصائيات الإدارية */}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="lg">

        {loading ? (

          <>

            <Skeleton height={120} radius="md" />

            <Skeleton height={120} radius="md" />

            <Skeleton height={120} radius="md" />

            <Skeleton height={120} radius="md" />

          </>

        ) : (

          <>

            <Card p="lg" radius="md" withBorder style={{ borderColor: '#f1f5f9' }}>

              <Group justify="space-between">

                <div>

                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">عدد المشتركين</Text>

                  <Text size="xl" fw={800} mt={4} c="#0A3A2A">{adminStats.totalUsers.toLocaleString()}</Text>

                  <Text size="xs" c="teal" mt={4}>مستخدم نشط</Text>

                </div>

                <ThemeIcon size={48} radius="md" variant="light" color="teal">

                  <IconUsers size={28} />

                </ThemeIcon>

              </Group>

            </Card>



            <Card p="lg" radius="md" withBorder style={{ borderColor: '#f1f5f9' }}>

              <Group justify="space-between">

                <div>

                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">التوصيات الحالية</Text>

                  <Text size="xl" fw={800} mt={4} c="#d97706">{adminStats.totalRecommendations}</Text>

                  <Text size="xs" c="orange" mt={4}>توصية نشطة</Text>

                </div>

                <ThemeIcon size={48} radius="md" variant="light" color="amber">

                  <IconMapPin size={28} />

                </ThemeIcon>

              </Group>

            </Card>



            <Card p="lg" radius="md" withBorder style={{ borderColor: '#f1f5f9' }}>

              <Group justify="space-between">

                <div>

                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">تذاكر الدعم الفني</Text>

                  <Text size="xl" fw={800} mt={4} c="#ef4444">{adminStats.supportTickets}</Text>

                  <Text size="xs" c="red" mt={4}>تذكرة مفتوحة</Text>

                </div>

                <ThemeIcon size={48} radius="md" variant="light" color="red">

                  <IconHeadset size={28} />

                </ThemeIcon>

              </Group>

            </Card>



            <Card p="lg" radius="md" withBorder style={{ borderColor: '#f1f5f9' }}>

              <Group justify="space-between">

                <div>

                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">الموظفون الحاليون</Text>

                  <Text size="xl" fw={800} mt={4} c="#7e22ce">{adminStats.totalEmployees}</Text>

                  <Text size="xs" c="purple" mt={4}>موظف في النظام</Text>

                </div>

                <ThemeIcon size={48} radius="md" variant="light" color="purple">

                  <IconBuilding size={28} />

                </ThemeIcon>

              </Group>

            </Card>

          </>

        )}

      </SimpleGrid>



      {/* الأرصاد الجوية */}

      <Paper p="lg" radius="lg" withBorder mb="lg">

        <Group justify="space-between" mb="lg">

          <div>

            <Group gap="xs">

              <IconSun size={24} color="#E8B04B" />

              <Text fw={700} size="lg" c="#0A3A2A">الأرصاد الجوية - فلسطين</Text>

            </Group>

            <Text size="xs" c="dimmed" mt={4}>حالة الطقس الحالية للمدن والبلدات الفلسطينية المدرجة</Text>
              <Text component="a" href="https://open-meteo.com/" target="_blank" rel="noreferrer" size="xs" c="dimmed" mt={4}>مصدر بيانات الطقس: Open-Meteo</Text>

          </div>

          <Badge variant="light" color="orange" size="sm">بيانات طقس محدثة</Badge>

        </Group>



        {loading ? (

          <SimpleGrid cols={{ base: 2, md: 3, lg: 5 }} spacing="md">

            {[...Array(5)].map((_, i) => (

              <Skeleton key={i} height={140} radius="md" />

            ))}

          </SimpleGrid>

        ) : (

          <>

            {/* عرض أول 5 مدن */}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>

              {visibleCities.map((city, index) => {

                const WeatherIcon = getWeatherIcon(city.icon || '03d');

                return (

                  <Card 

                    key={index} 

                    p="md" 

                    radius="md" 

                    withBorder

                    style={{ 

                      borderColor: '#e2e8f0',

                      flex: '1 1 calc(20% - 12px)',

                      minWidth: '180px',

                      backgroundColor: '#ffffff'

                    }}

                  >

                    <Group justify="space-between" mb="xs">

                      <Text size="sm" fw={700}>{city.name}</Text>

                      <WeatherIcon size={24} color="#d97706" />

                    </Group>



                    <Text size="2xl" fw={800} mb="xs" c="#0A3A2A">

                      {city.temp !== null ? `${Math.round(city.temp)}°C` : '--'}

                    </Text>



                    <Text size="xs" c="dimmed" mb="md">

                      {city.description || '--'}

                    </Text>



                    <Divider mb="xs" />



                    <Group justify="space-between">

                      <Group gap={4}>

                        <IconDroplets size={14} color="#64748b" />

                        <Text size="xs" c="dimmed">

                          {city.humidity !== null ? `${city.humidity}%` : '--'}

                        </Text>

                      </Group>

                      <Group gap={4}>

                        <IconWind size={14} color="#64748b" />

                        <Text size="xs" c="dimmed">

                          {city.wind !== null ? `${city.wind} م/ث` : '--'}

                        </Text>

                      </Group>

                    </Group>



                    <Text size="xs" c="#94a3b8" mt="xs" ta="center">

                      {city.region}

                    </Text>

                  </Card>

                );

              })}

            </div>



            {/* زر عرض الكل إذا كان هناك المزيد */}

            {hiddenCities.length > 0 && (

              <Button 

                variant="outline" 

                color="teal" 

                fullWidth 

                mt="lg"

                onClick={() => setModalOpened(true)}

                rightSection={<IconArrowRight size={16} />}

              >

                عرض جميع المدن ({weatherData.length} مدينة)

              </Button>

            )}

          </>

        )}

      </Paper>



      {/* نافذة الطقس الشاملة */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        withCloseButton={false}
        centered
        size="1000px"
        padding={0}
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        styles={{
          content: { borderRadius: 20, overflow: 'hidden', background: '#f8fafc' },
          body: { padding: 0 },
        }}
      >
        <div style={{ direction: 'rtl' }}>
          <div
            style={{
              padding: '24px 26px 22px',
              color: '#fff',
              background: 'linear-gradient(125deg, #0A3A2A 0%, #116149 62%, #168568 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', left: -22, top: -45, opacity: 0.09, pointerEvents: 'none' }}>
              <IconSun size={190} stroke={1.1} />
            </div>
            <Group justify="space-between" align="flex-start" wrap="nowrap" style={{ position: 'relative' }}>
              <Group gap="md" align="flex-start" wrap="nowrap">
                <ThemeIcon size={52} radius="xl" variant="light" color="white" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>
                  <IconSun size={29} />
                </ThemeIcon>
                <div>
                  <Text size="xl" fw={800} style={{ color: '#fff', letterSpacing: '-0.3px' }}>
                    الطقس في فلسطين
                  </Text>
                  <Text size="sm" mt={5} style={{ color: 'rgba(255,255,255,0.78)' }}>
                    متابعة الأحوال الجوية للمدن والبلدات حسب بيانات الطقس الحالية
                  </Text>
                  <Group gap={8} mt="md" wrap="wrap">
                    <Badge size="lg" radius="xl" variant="light" color="white" leftSection={<IconMapPin size={13} />} style={{ background: 'rgba(255,255,255,0.13)', color: '#fff' }}>
                      {weatherData.length} مدينة وبلدة
                    </Badge>
                    <Badge size="lg" radius="xl" variant="light" color="white" leftSection={<IconCheck size={13} />} style={{ background: 'rgba(255,255,255,0.13)', color: '#fff' }}>
                      بيانات متاحة: {availableWeatherCount}
                    </Badge>
                  </Group>
                </div>
              </Group>
              <ActionIcon
                variant="subtle"
                color="white"
                size="lg"
                radius="xl"
                aria-label="إغلاق نافذة الطقس"
                onClick={() => setModalOpened(false)}
                style={{ color: '#fff', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }}
              >
                <IconX size={20} />
              </ActionIcon>
            </Group>
          </div>

          <div style={{ padding: '20px 24px 24px' }}>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mb="lg">
              <Paper withBorder radius="lg" p="md" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon size={42} radius="md" variant="light" color="teal"><IconMapPin size={22} /></ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" fw={600}>إجمالي المواقع</Text>
                    <Group gap={5} align="baseline">
                      <Text size="xl" fw={800} c="#0A3A2A">{weatherData.length}</Text>
                      <Text size="xs" c="dimmed">موقع</Text>
                    </Group>
                  </div>
                </Group>
              </Paper>
              <Paper withBorder radius="lg" p="md" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon size={42} radius="md" variant="light" color="orange"><IconThermometer size={22} /></ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" fw={600}>متوسط الحرارة الحالية</Text>
                    <Group gap={5} align="baseline">
                      <Text size="xl" fw={800} c="#0A3A2A">{averageTemp !== null ? `${averageTemp}°` : '--'}</Text>
                      <Text size="xs" c="dimmed">مئوية</Text>
                    </Group>
                  </div>
                </Group>
              </Paper>
              <Paper withBorder radius="lg" p="md" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon size={42} radius="md" variant="light" color={availableWeatherCount === weatherData.length ? 'teal' : 'yellow'}>
                    {availableWeatherCount === weatherData.length ? <IconCheck size={22} /> : <IconAlertCircle size={22} />}
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" fw={600}>حالة الاتصال</Text>
                    <Text size="sm" fw={700} c={availableWeatherCount === weatherData.length ? 'teal' : 'orange'}>
                      {availableWeatherCount === weatherData.length ? 'جميع البيانات متاحة' : `تعذر جلب ${weatherData.length - availableWeatherCount} موقع`}
                    </Text>
                  </div>
                </Group>
              </Paper>
            </SimpleGrid>

            <Paper withBorder radius="lg" p="sm" mb="md" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
              <Group align="end" gap="sm" wrap="wrap">
                <TextInput
                  label="ابحث عن مدينة أو بلدة"
                  placeholder="مثال: نابلس، جنين، الخليل..."
                  value={weatherSearch}
                  onChange={(event) => setWeatherSearch(event.currentTarget.value)}
                  leftSection={<IconSearch size={17} />}
                  rightSection={weatherSearch ? (
                    <ActionIcon variant="subtle" color="gray" aria-label="مسح البحث" onClick={() => setWeatherSearch('')}>
                      <IconX size={15} />
                    </ActionIcon>
                  ) : null}
                  style={{ flex: '1 1 260px' }}
                  styles={{ input: { borderRadius: 10 }, label: { marginBottom: 5, fontWeight: 700, fontSize: 12 } }}
                />
                <Select
                  label="المحافظة / المنطقة"
                  placeholder="كل المناطق"
                  value={selectedRegion}
                  onChange={(value) => setSelectedRegion(value || 'all')}
                  data={[{ value: 'all', label: 'كل المحافظات والمناطق' }, ...weatherRegions.map((region) => ({ value: region, label: region }))]}
                  searchable
                  clearable={false}
                  style={{ flex: '1 1 240px' }}
                  styles={{ input: { borderRadius: 10 }, label: { marginBottom: 5, fontWeight: 700, fontSize: 12 } }}
                />
                <Button
                  variant="light"
                  color="teal"
                  radius="md"
                  leftSection={<IconRefresh size={16} />}
                  loading={refreshingWeather}
                  onClick={handleWeatherRefresh}
                  style={{ height: 36, flexShrink: 0 }}
                >
                  تحديث الطقس
                </Button>
              </Group>
            </Paper>

            <Group justify="space-between" mb="sm">
              <Text size="sm" fw={700} c="#334155">نتائج الطقس</Text>
              <Text size="xs" c="dimmed">عرض {filteredWeatherCities.length} من أصل {weatherData.length} موقع</Text>
            </Group>

            <ScrollArea h="min(52vh, 520px)" offsetScrollbars scrollbarSize={7}>
              {filteredWeatherCities.length ? (
                <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm" pr={4} pb="sm">
                  {filteredWeatherCities.map((city) => {
                    const WeatherIcon = city.unavailable ? IconCloud : getWeatherIcon(city.icon || '03d');
                    const hasWeather = !city.unavailable && typeof city.temp === 'number';
                    return (
                      <Card
                        key={`${city.name}-${city.region}`}
                        padding="md"
                        radius="lg"
                        withBorder
                        style={{
                          borderColor: hasWeather ? '#e2e8f0' : '#f1d6b8',
                          background: '#fff',
                          transition: 'transform 160ms ease, box-shadow 160ms ease',
                          minHeight: 190,
                        }}
                      >
                        <Group justify="space-between" align="flex-start" wrap="nowrap" mb="sm">
                          <div style={{ minWidth: 0 }}>
                            <Text fw={800} size="sm" c="#0f172a" lineClamp={1}>{city.name}</Text>
                            <Text size="xs" c="dimmed" mt={3} lineClamp={1}>{city.region}</Text>
                          </div>
                          <ThemeIcon
                            size={43}
                            radius="xl"
                            variant="light"
                            color={hasWeather ? 'orange' : 'gray'}
                            style={{ flexShrink: 0 }}
                          >
                            <WeatherIcon size={24} />
                          </ThemeIcon>
                        </Group>

                        <Group align="center" gap={8} mb={4}>
                          <Text size="2xl" fw={800} c={hasWeather ? '#0A3A2A' : '#94a3b8'} style={{ lineHeight: 1.15 }}>
                            {hasWeather ? `${Math.round(city.temp)}°` : '--'}
                          </Text>
                          <Text size="xs" c="dimmed">°م</Text>
                        </Group>
                        <Text size="sm" fw={600} c={hasWeather ? '#475569' : '#b45309'} lineClamp={1} mb="md">
                          {city.description || 'غير متوفر'}
                        </Text>

                        <Divider color="#f1f5f9" mb="sm" />
                        <Group justify="space-between" gap="xs" wrap="nowrap">
                          <Group gap={5} wrap="nowrap">
                            <IconDroplets size={15} color="#0891b2" />
                            <div>
                              <Text size="10px" c="dimmed">الرطوبة</Text>
                              <Text size="xs" fw={700}>{hasWeather && city.humidity !== null ? `${city.humidity}%` : '--'}</Text>
                            </div>
                          </Group>
                          <Group gap={5} wrap="nowrap">
                            <IconWind size={15} color="#64748b" />
                            <div>
                              <Text size="10px" c="dimmed">الرياح</Text>
                              <Text size="xs" fw={700}>{hasWeather && city.wind !== null ? `${city.wind} م/ث` : '--'}</Text>
                            </div>
                          </Group>
                        </Group>
                        {hasWeather && city.feelsLike !== null && (
                          <Text size="xs" c="dimmed" mt="sm">المحسوسة {Math.round(city.feelsLike)}°</Text>
                        )}
                      </Card>
                    );
                  })}
                </SimpleGrid>
              ) : (
                <Paper p="xl" radius="lg" ta="center" withBorder style={{ borderStyle: 'dashed', borderColor: '#cbd5e1', background: '#fff' }}>
                  <ThemeIcon size={52} radius="xl" variant="light" color="gray" mx="auto" mb="sm">
                    <IconSearch size={25} />
                  </ThemeIcon>
                  <Text fw={700} c="#334155">لم نعثر على نتائج</Text>
                  <Text size="sm" c="dimmed" mt={5}>جرّب اسم مدينة آخر أو غيّر اختيار المحافظة.</Text>
                  <Button
                    variant="subtle"
                    color="teal"
                    mt="sm"
                    onClick={() => { setWeatherSearch(''); setSelectedRegion('all'); }}
                  >
                    مسح عوامل التصفية
                  </Button>
                </Paper>
              )}
            </ScrollArea>
            <Text size="xs" c="dimmed" mt="md" ta="center">
              البيانات من Open-Meteo وقد تختلف عن القياسات المحلية لمحطات الأرصاد.
            </Text>
          </div>
        </div>
      </Modal>

      {/* الأخبار */}

      <Paper p="lg" radius="lg" withBorder>

        <Group justify="space-between" mb="lg">

          <div>

            <Group gap="xs">

              <IconNews size={24} color="#0A3A2A" />

              <Text fw={700} size="lg" c="#0A3A2A">أخبار وزارة السياحة والآثار</Text>

            </Group>

            <Text size="xs" c="dimmed" mt={4}>آخر الأخبار والفعاليات من وزارة السياحة الفلسطينية</Text>

          </div>

          <Button variant="outline" size="xs" color="teal" radius="md">

            عرض كل الأخبار

          </Button>

        </Group>



        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">

          {loading ? (

            <>

              <Skeleton height={250} radius="md" />

              <Skeleton height={250} radius="md" />

              <Skeleton height={250} radius="md" />

            </>

          ) : news.length > 0 ? (

            news.slice(0, 6).map((article) => (

              <Card 

                key={article.id} 

                padding="md" 

                radius="md" 

                withBorder

                style={{ 

                  borderColor: '#e2e8f0',

                  transition: 'all 0.3s ease',

                  cursor: 'pointer',

                  height: '100%',

                  display: 'flex',

                  flexDirection: 'column'

                }}

                onMouseEnter={(e) => {

                  e.currentTarget.style.transform = 'translateY(-4px)';

                  e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0,0,0,0.1)';

                }}

                onMouseLeave={(e) => {

                  e.currentTarget.style.transform = 'translateY(0)';

                  e.currentTarget.style.boxShadow = 'none';

                }}

              >

                {article.imageUrl && (

                  <Image

                    src={article.imageUrl}

                    alt={article.title}

                    height={140}

                    radius="md"

                    mb="md"

                    fit="cover"

                    style={{ objectFit: 'cover' }}

                  />

                )}



                <Text fw={700} size="sm" mb="xs" lineClamp={2} style={{ minHeight: '40px' }}>

                  {article.title}

                </Text>



                <Text size="xs" c="dimmed" mb="md" lineClamp={3}>

                  {stripHtml(article.summary).substring(0, 120)}...

                </Text>



                <Group justify="space-between" mt="auto">

                  <Group gap="xs">

                    <IconClock size={14} color="#64748b" />

                    <Text size="xs" c="dimmed">

                      {formatDate(article.publishedDate)}

                    </Text>

                  </Group>

                  <Button 

                    component="a" 

                    href={article.sourceLink} 

                    target="_blank"

                    variant="subtle" 

                    size="xs" 

                    color="teal"

                    rightSection={<IconArrowRight size={12} />}

                  >

                    اقرأ المزيد

                  </Button>

                </Group>

              </Card>

            ))

          ) : (

            <Card p="xl" radius="md" style={{ textAlign: 'center', gridColumn: 'span 3' }}>

              <IconNews size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />

              <Text c="dimmed">لا توجد أخبار متاحة حالياً</Text>

            </Card>

          )}

        </SimpleGrid>

      </Paper>



    </Box>

  );

}