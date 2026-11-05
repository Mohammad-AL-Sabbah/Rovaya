import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Text, Group, Button, ThemeIcon, Skeleton, Badge,
  Divider, SimpleGrid, Card, Image, Modal, ScrollArea, TextInput,
  Select, ActionIcon, Loader, Center
} from '@mantine/core';
import {
  IconUsers, IconHeadset, IconBuilding, IconPlaneDeparture,
  IconArrowRight, IconNews, IconClock, IconSun, IconCloudRain,
  IconWind, IconDroplets, IconCloud, IconMapPin, IconSearch,
  IconX, IconRefresh, IconThermometer, IconCheck, IconAlertCircle
} from '@tabler/icons-react';
import API from '../../../API/ApiAuthToken';
import classes from './Dashboard.module.css';

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

const CACHE = {
  news: { key: 'rovaya_dashboard_news_v2', ttl: 30 * 60 * 1000 },
  weather: { key: 'rovaya_dashboard_weather_v2', ttl: 10 * 60 * 1000 },
  places: { key: 'rovaya_palestine_places_v1', ttl: 7 * 24 * 60 * 60 * 1000 }
};

const FALLBACK_CITIES = [
  { name: 'القدس', enName: 'Jerusalem', region: 'محافظة القدس', latitude: 31.768, longitude: 35.214 },
  { name: 'غزة', enName: 'Gaza', region: 'محافظة غزة', latitude: 31.501, longitude: 34.466 },
  { name: 'نابلس', enName: 'Nablus', region: 'محافظة نابلس', latitude: 32.222, longitude: 35.262 },
  { name: 'الخليل', enName: 'Hebron', region: 'محافظة الخليل', latitude: 31.532, longitude: 35.099 },
  { name: 'رام الله', enName: 'Ramallah', region: 'محافظة رام الله والبيرة', latitude: 31.903, longitude: 35.203 },
  { name: 'جنين', enName: 'Jenin', region: 'محافظة جنين', latitude: 32.461, longitude: 35.300 },
  { name: 'طولكرم', enName: 'Tulkarm', region: 'محافظة طولكرم', latitude: 32.310, longitude: 35.028 },
  { name: 'بيت لحم', enName: 'Bethlehem', region: 'محافظة بيت لحم', latitude: 31.705, longitude: 35.202 },
  { name: 'أريحا', enName: 'Jericho', region: 'محافظة أريحا والأغوار', latitude: 31.861, longitude: 35.461 },
  { name: 'خان يونس', enName: 'Khan Yunis', region: 'محافظة خان يونس', latitude: 31.346, longitude: 34.306 }
];

function readCache(config) {
  try {
    const value = JSON.parse(localStorage.getItem(config.key) || 'null');
    if (!value || !Array.isArray(value.data) || typeof value.savedAt !== 'number') return null;
    return { data: value.data, fresh: Date.now() - value.savedAt < config.ttl };
  } catch {
    return null;
  }
}

function writeCache(config, data) {
  try {
    localStorage.setItem(config.key, JSON.stringify({ data, savedAt: Date.now() }));
  } catch (error) {
    console.warn('تعذر حفظ الكاش:', error);
  }
}

const WEATHER_CODES = {
  0: ['سماء صافية', 'sun'], 1: ['صحو غالباً', 'sun'],
  2: ['غائم جزئياً', 'cloud'], 3: ['غائم', 'cloud'],
  45: ['ضباب', 'cloud'], 48: ['ضباب متجمد', 'cloud'],
  51: ['رذاذ خفيف', 'rain'], 53: ['رذاذ متوسط', 'rain'], 55: ['رذاذ كثيف', 'rain'],
  56: ['رذاذ متجمد', 'rain'], 57: ['رذاذ متجمد كثيف', 'rain'],
  61: ['مطر خفيف', 'rain'], 63: ['مطر متوسط', 'rain'], 65: ['مطر غزير', 'rain'],
  66: ['مطر متجمد خفيف', 'rain'], 67: ['مطر متجمد كثيف', 'rain'],
  71: ['ثلوج خفيفة', 'cloud'], 73: ['ثلوج متوسطة', 'cloud'], 75: ['ثلوج كثيفة', 'cloud'],
  77: ['حبيبات ثلجية', 'cloud'], 80: ['زخات مطر خفيفة', 'rain'],
  81: ['زخات مطر متوسطة', 'rain'], 82: ['زخات مطر شديدة', 'rain'],
  85: ['زخات ثلجية', 'cloud'], 86: ['زخات ثلجية كثيفة', 'cloud'],
  95: ['عاصفة رعدية', 'rain'], 96: ['عاصفة رعدية مع برد', 'rain'], 99: ['عاصفة رعدية مع برد كثيف', 'rain']
};

const GOVERNORATES = [
  ['محافظة جنين', 32.46, 35.30], ['محافظة طوباس', 32.32, 35.37],
  ['محافظة طولكرم', 32.31, 35.03], ['محافظة نابلس', 32.22, 35.26],
  ['محافظة قلقيلية', 32.19, 34.97], ['محافظة سلفيت', 32.08, 35.18],
  ['محافظة رام الله والبيرة', 31.90, 35.20], ['محافظة أريحا والأغوار', 31.86, 35.46],
  ['محافظة القدس', 31.78, 35.23], ['محافظة بيت لحم', 31.70, 35.20],
  ['محافظة الخليل', 31.53, 35.10], ['محافظة شمال غزة', 31.55, 34.49],
  ['محافظة غزة', 31.50, 34.47], ['محافظة دير البلح', 31.42, 34.35],
  ['محافظة خان يونس', 31.35, 34.30], ['محافظة رفح', 31.29, 34.25]
];

function getGovernorate(lat, lon) {
  let nearest = GOVERNORATES[0];
  let best = Infinity;
  for (const item of GOVERNORATES) {
    const distance = (lat - item[1]) ** 2 + (lon - item[2]) ** 2;
    if (distance < best) { best = distance; nearest = item; }
  }
  return nearest[0];
}




function normalizePlace(element) {
  const tags = element.tags || {};
  const center = element.center || element;
  const lat = Number(center.lat);
  const lon = Number(center.lon);
  const name = tags['name:ar'] || tags.name || tags['name:en'];
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    id: `${element.type}-${element.id}`,
    name,
    enName: tags['name:en'] || tags.int_name || tags.name || '',
    region: getGovernorate(lat, lon),
    latitude: lat,
    longitude: lon
  };
}

async function fetchPalestinianPlaces() {
  const query = `
    [out:json][timeout:30];
    area["ISO3166-1"="PS"]["boundary"="administrative"]->.palestine;
    (
      nwr["place"~"^(city|town|village|hamlet)$"](area.palestine);
    );
    out center tags;
  `;
  const response = await fetch(OVERPASS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: `data=${encodeURIComponent(query)}`
  });
  if (!response.ok) throw new Error(`Places API HTTP ${response.status}`);
  const json = await response.json();
  const unique = new Map();
  (json.elements || []).forEach(element => {
    const place = normalizePlace(element);
    if (place) unique.set(`${place.name}-${place.latitude.toFixed(4)}-${place.longitude.toFixed(4)}`, place);
  });
  const places = [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  if (!places.length) throw new Error('لم يعثر مصدر المواقع على تجمعات سكانية');
  return places;
}

function WeatherIcon({ type, size = 24 }) {
  if (type === 'rain') return <IconCloudRain size={size} />;
  if (type === 'cloud') return <IconCloud size={size} />;
  return <IconSun size={size} />;
}

function stripHtml(html) {
  if (!html) return '';
  const element = document.createElement('div');
  element.innerHTML = html;
  return element.textContent || element.innerText || '';
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('ar-PS', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

export function DashboardPage() {
  const navigate = useNavigate();

  const [news, setNews] = useState(() => readCache(CACHE.news)?.data || []);
  const [places, setPlaces] = useState(() => readCache(CACHE.places)?.data || []);
  const [weatherData, setWeatherData] = useState(() => readCache(CACHE.weather)?.data || []);
  const [newsLoading, setNewsLoading] = useState(() => !readCache(CACHE.news));
  const [weatherLoading, setWeatherLoading] = useState(() => !readCache(CACHE.weather));
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshingWeather, setRefreshingWeather] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [weatherSearch, setWeatherSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0, 
    totalRecommendations: 0, 
    supportTickets: 3,
    totalEmployees: 0
  });

  const fetchNews = useCallback(async (force = false) => {
    const cached = readCache(CACHE.news);
    if (!force && cached?.fresh) {
      setNews(cached.data);
      setNewsLoading(false);
      return;
    }
    try {
      const response = await API.get('/api/Customer/tourism-news/latest?count=6');
      const articles = response.data?.articles || response.data?.data || [];
      if (Array.isArray(articles) && articles.length) {
        setNews(articles);
        writeCache(CACHE.news, articles);
      }
    } catch (error) {
      console.error('News fetch error:', error);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const fetchWeather = useCallback(async (force = false) => {
    const cachedWeather = readCache(CACHE.weather);
    if (!force && cachedWeather?.fresh) {
      setWeatherData(cachedWeather.data);
      setWeatherLoading(false);
      return;
    }

    setWeatherLoading(true);
    try {
      let locations = [];
      const cachedPlaces = readCache(CACHE.places);

      if (cachedPlaces?.fresh && cachedPlaces.data.length > 0) {
        locations = cachedPlaces.data;
      } else {
        try {
          locations = await fetchPalestinianPlaces();
          setPlaces(locations);
          writeCache(CACHE.places, locations);
        } catch (err) {
          console.warn('فشل جلب البيانات من OpenStreetMap، يتم استخدام القائمة الاحتياطية:', err);
          locations = FALLBACK_CITIES;
          setPlaces(locations);
          writeCache(CACHE.places, locations);
        }
      }

      const results = [];
      const batchSize = 80;

      for (let start = 0; start < locations.length; start += batchSize) {
        const batch = locations.slice(start, start + batchSize);
        const params = new URLSearchParams({
          latitude: batch.map(place => place.latitude).join(','),
          longitude: batch.map(place => place.longitude).join(','),
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
          timezone: 'auto',
          wind_speed_unit: 'ms'
        });

        const response = await fetch(`${WEATHER_API}?${params.toString()}`);
        if (!response.ok) throw new Error(`Weather API HTTP ${response.status}`);
        const payload = await response.json();
        const records = Array.isArray(payload) ? payload : [payload];

        batch.forEach((place, index) => {
          const current = records[index]?.current;
          const weatherInfo = WEATHER_CODES[current?.weather_code] || ['حالة جوية غير معروفة', 'cloud'];
          results.push({
            ...place,
            temp: typeof current?.temperature_2m === 'number' ? current.temperature_2m : null,
            description: weatherInfo[0],
            weatherType: weatherInfo[1],
            humidity: current?.relative_humidity_2m ?? null,
            wind: current?.wind_speed_10m ?? null,
            feelsLike: current?.apparent_temperature ?? null,
            observedAt: current?.time || null,
            unavailable: typeof current?.temperature_2m !== 'number'
          });
        });
      }

      if (results.length) {
        setWeatherData(results);
        writeCache(CACHE.weather, results);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
    } finally {
      setWeatherLoading(false);
      setRefreshingWeather(false);
    }
  }, []);

  // ✅ تم تحديث هذه الدالة لتستخدم API التوصيات الجديد
  const fetchAdminStats = useCallback(async () => {
    try {
      // 1. جلب بيانات المستخدمين
      const usersResponse = await API.get('/api/auth/account/users').catch(() => null);
      
      let totalUsersCount = 0;
      let totalEmployeesCount = 0;

      if (usersResponse?.data?.success && Array.isArray(usersResponse.data.users)) {
        const users = usersResponse.data.users;
        
        // حساب المستخدمين النشطين فقط (status === 1)
        totalUsersCount = users.filter(u => u.status === 1).length;

        // حساب الموظفين (الذين يملكون دور Admin أو SuperAdmin وهم نشطين)
        totalEmployeesCount = users.filter(u => 
          u.status === 1 && u.roles && (u.roles.includes('Admin') || u.roles.includes('SuperAdmin'))
        ).length;
      }

      // 2. ✅ جلب عدد التوصيات من الـ API الجديد
      const recommendationsResponse = await API.get('/api/Customer/recommendations').catch(() => null);
      let totalRecommendationsCount = 0;
      
      if (recommendationsResponse?.data?.success) {
        // ✅ استخدام totalCount مباشرة من الـ response
        totalRecommendationsCount = recommendationsResponse.data.totalCount || 0;
      }

      setAdminStats({
        totalUsers: totalUsersCount,
        totalRecommendations: totalRecommendationsCount,
        supportTickets: 3, // قيمة شكلية كما طلبت
        totalEmployees: totalEmployeesCount
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      setAdminStats({ totalUsers: 0, totalRecommendations: 0, supportTickets: 3, totalEmployees: 0 });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    fetchWeather();
    fetchAdminStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weatherRegions = useMemo(
    () => [...new Set(weatherData.map(city => city.region).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ar')),
    [weatherData]
  );

  const filteredCities = useMemo(() => {
    const term = weatherSearch.trim().toLocaleLowerCase('ar');
    return weatherData.filter(city => {
      const matchesTerm = !term ||
        city.name.toLocaleLowerCase('ar').includes(term) ||
        (city.enName || '').toLocaleLowerCase().includes(term) ||
        (city.region || '').toLocaleLowerCase('ar').includes(term);
      return matchesTerm && (selectedRegion === 'all' || city.region === selectedRegion);
    });
  }, [weatherData, weatherSearch, selectedRegion]);

  const availableCount = weatherData.filter(city => typeof city.temp === 'number').length;
  const averageTemp = availableCount
    ? Math.round(weatherData.reduce((sum, city) => sum + (typeof city.temp === 'number' ? city.temp : 0), 0) / availableCount)
    : null;

  const handleWeatherRefresh = () => {
    setRefreshingWeather(true);
    fetchWeather(true);
  };

  const featuredCities = weatherData.slice(0, 5);


useEffect(() => {
  document.title = 'Dashboard | ROVAYA';
}, []); 



  return (
    <Box className={classes.page}>
      <Paper className={classes.hero} radius="lg" p="xl">
        <div className={classes.heroContent}>
          <div>
            <Group gap="xs" mb={8}>
              <ThemeIcon size="sm" radius="xl" color="teal" variant="light">
                <IconPlaneDeparture size={14} />
              </ThemeIcon>
              <Text size="xs" fw={700} c="gray.2">ROVAYA ADMIN PANEL • 2026</Text>
            </Group>
            <Text size="xl" fw={800} c="white">لوحة تحكم الإدارة - Rovaya Tourism Portal</Text>
            <Text size="sm" c="gray.2" mt={4}>متابعة وإدارة النظام السياحي، المستخدمين، التوصيات، والأخبار</Text>
          </div>
          <Button variant="white" color="dark" rightSection={<IconArrowRight size={16} />}
            onClick={() => navigate('/control-panel/reports')}>
            عرض التقارير الشاملة
          </Button>
        </div>
      </Paper>

      {/* ✅ قسم الإحصائيات المحدث */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="lg">
        {statsLoading ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} height={120} radius="md" />) : (
          [
            { 
              label: 'عدد المشتركين', 
              value: adminStats.totalUsers, 
              note: 'مستخدم نشط', 
              color: 'teal', 
              Icon: IconUsers 
            },
            { 
              label: 'التوصيات الحالية', 
              value: adminStats.totalRecommendations, 
              note: 'توصية في النظام', 
              color: 'orange', 
              Icon: IconMapPin 
            },
            { 
              label: 'تذاكر الدعم الفني', 
              value: adminStats.supportTickets, 
              note: 'تذكرة مفتوحة (قريباً)', 
              color: 'red', 
              Icon: IconHeadset 
            },
            { 
              label: 'الموظفون الحاليون', 
              value: adminStats.totalEmployees, 
              note: 'Admin / SuperAdmin', 
              color: 'grape', 
              Icon: IconBuilding 
            }
          ].map(item => (
            <Card key={item.label} p="lg" radius="md" withBorder className={classes.statCard}>
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" fw={700}>{item.label}</Text>
                  <Text size="xl" fw={800} mt={4}>{item.value.toLocaleString('ar')}</Text>
                  <Text size="xs" c={item.color} mt={4}>{item.note}</Text>
                </div>
                <ThemeIcon size={48} radius="md" variant="light" color={item.color}>
                  <item.Icon size={27} />
                </ThemeIcon>
              </Group>
            </Card>
          ))
        )}
      </SimpleGrid>

      <Paper p="lg" radius="lg" withBorder mb="lg" className={classes.section}>
        <Group justify="space-between" mb="lg">
          <div>
            <Group gap="xs">
              <IconSun size={24} color="#E8B04B" />
              <Text fw={700} size="lg" c="#0A3A2A">الأرصاد الجوية - فلسطين</Text>
            </Group>
            <Text size="xs" c="dimmed" mt={4}>
              المدن والبلدات المصنفة كتجمعات سكانية، والطقس من Open-Meteo
            </Text>
          </div>
          <Badge color="teal" variant="light">{weatherData.length} موقع</Badge>
        </Group>

        {weatherLoading && !weatherData.length ? (
          <Center py="xl">
            <Loader color="teal" />
            <Text size="sm" c="dimmed" mr="sm">جاري تحميل المواقع والطقس...</Text>
          </Center>
        ) : (
          <>
            <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing="md">
              {featuredCities.map(city => (
                <Card key={city.id || city.name} p="md" radius="md" withBorder className={classes.weatherCard}>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={700}>{city.name}</Text>
                    <ThemeIcon variant="light" color="orange" radius="xl">
                      <WeatherIcon type={city.weatherType} />
                    </ThemeIcon>
                  </Group>
                  <Text size="2xl" fw={800} c="#0A3A2A">
                    {typeof city.temp === 'number' ? `${Math.round(city.temp)}°C` : '--'}
                  </Text>
                  <Text size="xs" c="dimmed" mb="sm">{city.description}</Text>
                  <Divider mb="xs" />
                  <Group justify="space-between">
                    <Group gap={4}><IconDroplets size={14} color="#64748b" /><Text size="xs" c="dimmed">{city.humidity ?? '--'}%</Text></Group>
                    <Group gap={4}><IconWind size={14} color="#64748b" /><Text size="xs" c="dimmed">{city.wind ?? '--'} م/ث</Text></Group>
                  </Group>
                  <Text size="xs" c="dimmed" mt="xs" ta="center">{city.region}</Text>
                </Card>
              ))}
            </SimpleGrid>
            {weatherData.length > 5 && (
              <Button fullWidth mt="lg" variant="outline" color="teal"
                rightSection={<IconArrowRight size={16} />} onClick={() => setModalOpened(true)}>
                عرض جميع المدن والبلدات ({weatherData.length})
              </Button>
            )}
            {weatherLoading && <Text size="xs" c="dimmed" mt="sm">يتم تحديث البيانات في الخلفية...</Text>}
          </>
        )}
      </Paper>

      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} centered size="1000px"
        title={<Text fw={800} c="#0A3A2A">الأحوال الجوية في المدن والبلدات الفلسطينية</Text>}
        classNames={{ content: classes.modalContent, header: classes.modalHeader }}>
        <Group gap="sm" mb="md">
          <Badge color="teal" variant="light" size="lg">{weatherData.length} موقع</Badge>
          <Badge color="green" variant="light" size="lg">بيانات متاحة: {availableCount}</Badge>
          <Badge color="orange" variant="light" size="lg">متوسط الحرارة: {averageTemp === null ? '--' : `${averageTemp}°`}</Badge>
        </Group>
        <Group align="end" mb="md" className={classes.filters}>
          <TextInput className={classes.searchInput} label="ابحث عن مدينة أو بلدة" placeholder="اكتب اسم الموقع..."
            value={weatherSearch} onChange={event => setWeatherSearch(event.currentTarget.value)}
            leftSection={<IconSearch size={17} />}
            rightSection={weatherSearch ? <ActionIcon variant="subtle" onClick={() => setWeatherSearch('')}><IconX size={15} /></ActionIcon> : null} />
          <Select className={classes.regionSelect} label="المحافظة" placeholder="كل المحافظات"
            value={selectedRegion} onChange={value => setSelectedRegion(value || 'all')}
            data={[{ value: 'all', label: 'كل المحافظات' }, ...weatherRegions.map(region => ({ value: region, label: region }))]}
            searchable />
          <Button color="teal" variant="light" leftSection={<IconRefresh size={16} />}
            loading={refreshingWeather} onClick={handleWeatherRefresh}>تحديث الطقس</Button>
        </Group>
        <Text size="xs" c="dimmed" mb="sm">عرض {filteredCities.length} من أصل {weatherData.length} موقع</Text>
        <ScrollArea h="min(58vh, 560px)" offsetScrollbars>
          {filteredCities.length ? (
            <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm" pr="xs">
              {filteredCities.map(city => {
                const hasWeather = typeof city.temp === 'number';
                return (
                  <Card key={city.id || city.name} withBorder radius="lg" p="md" className={classes.weatherCard}>
                    <Group justify="space-between" align="flex-start">
                      <div>
                        <Text fw={800}>{city.name}</Text>
                        <Text size="xs" c="dimmed">{city.region}</Text>
                      </div>
                      <ThemeIcon color={hasWeather ? 'orange' : 'gray'} variant="light" radius="xl">
                        <WeatherIcon type={city.weatherType} />
                      </ThemeIcon>
                    </Group>
                    <Group align="baseline" gap={5} mt="sm">
                      <Text size="2xl" fw={800} c="#0A3A2A">{hasWeather ? `${Math.round(city.temp)}°` : '--'}</Text>
                      <Text size="xs" c="dimmed">مئوية</Text>
                    </Group>
                    <Text size="sm" c="dimmed" mb="sm">{city.description || 'غير متوفر'}</Text>
                    <Divider mb="sm" />
                    <Group justify="space-between">
                      <Group gap={5}><IconDroplets size={15} color="#0891b2" /><Text size="xs">الرطوبة: {city.humidity ?? '--'}%</Text></Group>
                      <Group gap={5}><IconWind size={15} color="#64748b" /><Text size="xs">الرياح: {city.wind ?? '--'}</Text></Group>
                    </Group>
                    {hasWeather && city.feelsLike !== null && <Text size="xs" c="dimmed" mt="sm">المحسوسة {Math.round(city.feelsLike)}°</Text>}
                  </Card>
                );
              })}
            </SimpleGrid>
          ) : (
            <Center py="xl">
              <div className={classes.emptyState}>
                <IconSearch size={30} />
                <Text fw={700}>لا توجد نتائج مطابقة</Text>
                <Button variant="subtle" onClick={() => { setWeatherSearch(''); setSelectedRegion('all'); }}>مسح البحث والتصفية</Button>
              </div>
            </Center>
          )}
        </ScrollArea>
        <Text size="xs" c="dimmed" ta="center" mt="md">المواقع من OpenStreetMap، والطقس من Open-Meteo. قد تختلف التوقعات عن قياسات محطات الأرصاد المحلية.</Text>
      </Modal>

      <Paper p="lg" radius="lg" withBorder className={classes.section}>
        <Group justify="space-between" mb="lg">
          <div>
            <Group gap="xs"><IconNews size={24} color="#0A3A2A" /><Text fw={700} size="lg" c="#0A3A2A">أخبار وزارة السياحة والآثار</Text></Group>
            <Text size="xs" c="dimmed" mt={4}>آخر الأخبار والفعاليات من وزارة السياحة الفلسطينية</Text>
          </div>
          <Button variant="outline" size="xs" color="teal" rightSection={<IconArrowRight size={12} />}
            onClick={() => navigate('/control-panel/news')}>عرض كل الأخبار</Button>
        </Group>
        {newsLoading && !news.length ? (
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}><Skeleton height={230} /><Skeleton height={230} /><Skeleton height={230} /></SimpleGrid>
        ) : news.length ? (
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
            {news.slice(0, 6).map((article, index) => (
              <Card key={article.id || index} padding="md" radius="md" withBorder className={classes.newsCard}>
                {article.imageUrl && <Image src={article.imageUrl} alt={article.title || 'خبر سياحي'} height={140} radius="md" mb="md" fit="cover" />}
                <Text fw={700} size="sm" mb="xs" lineClamp={2}>{article.title}</Text>
                <Text size="xs" c="dimmed" mb="md" lineClamp={3}>{stripHtml(article.summary).slice(0, 160)}</Text>
                <Group justify="space-between" mt="auto">
                  <Group gap="xs"><IconClock size={14} color="#64748b" /><Text size="xs" c="dimmed">{formatDate(article.publishedDate)}</Text></Group>
                  {article.sourceLink && <Button component="a" href={article.sourceLink} target="_blank" rel="noreferrer"
                    variant="subtle" size="xs" color="teal" rightSection={<IconArrowRight size={12} />}>اقرأ المزيد</Button>}
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        ) : <Text ta="center" c="dimmed" py="xl"><IconAlertCircle size={22} /> لا توجد أخبار متاحة حالياً</Text>}
      </Paper>
    </Box>
  );
}