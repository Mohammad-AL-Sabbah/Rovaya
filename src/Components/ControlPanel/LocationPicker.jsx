import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import { Box, Paper, Text, Button, Group, Loader, Center } from '@mantine/core';
import { IconMapPin, IconCurrentLocation, IconSearch } from '@tabler/icons-react';

// إصلاح أيقونة Marker الافتراضية في Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

const DEFAULT_POSITION = [31.9, 35.2]; // مركز فلسطين

// مكون لإصلاح مشكلة تقطع الخريطة داخل الـ Modal
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    // ننتظر قليلاً حتى ينتهي تأثير ظهور الـ Modal ثم نعيد حساب أبعاد الخريطة
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// مكون لإضافة شريط البحث للخريطة
function SearchControl({ onLocationSelect }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        'accept-language': 'ar', // تفضيل النتائج باللغة العربية
      }
    });

    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      showMarker: false, // نحن سنتعامل مع الـ Marker يدوياً
      retainZoomLevel: false,
      animateZoom: true,
      searchLabel: 'ابحث عن مدينة أو موقع...',
    });

    map.addControl(searchControl);

    // عند اختيار نتيجة من البحث
    map.on('geosearch/showlocation', (result) => {
      const { x: lng, y: lat } = result.location;
      onLocationSelect({ latitude: lat, longitude: lng });
      map.flyTo([lat, lng], 16, { duration: 1 });
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onLocationSelect]);

  return null;
}

function MapClickHandler({ onChange }) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng
      });
    }
  });
  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  height = 400
}) {
  const [isLocating, setIsLocating] = useState(false);

  const hasPosition =
    latitude !== '' &&
    longitude !== '' &&
    latitude != null &&
    longitude != null &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude));

  const position = hasPosition
    ? [Number(latitude), Number(longitude)]
    : null;

  const initialCenter = position || DEFAULT_POSITION;

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم تحديد الموقع');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (result) => {
        onChange({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude
        });
        setIsLocating(false);
      },
      () => {
        alert('تعذر تحديد موقعك. تأكد من السماح للمتصفح بالوصول للموقع.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <Box dir="rtl">
      <Group justify="space-between" mb="xs">
        <Group gap={7}>
          <IconMapPin size={18} color="#0A3A2A" />
          <Text fw={700} size="sm">حدد الموقع على الخريطة</Text>
        </Group>

        
      </Group>

      <Paper
        radius="md"
        withBorder
        style={{ 
          overflow: 'hidden', 
          height: `${height}px`, 
          position: 'relative',
          border: '2px solid #e2e8f0'
        }}
      >
        <MapContainer
          center={initialCenter}
          zoom={position ? 16 : 8}
          scrollWheelZoom
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          {/* طبقة الخريطة بتصميم نظيف */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* المكونات المخصصة */}
          <MapResizer />
          <SearchControl onLocationSelect={onChange} />
          <MapClickHandler onChange={onChange} />

          {position && (
            <Marker
              position={position}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const marker = event.target;
                  const point = marker.getLatLng();
                  onChange({
                    latitude: point.lat,
                    longitude: point.lng
                  });
                }
              }}
            />
          )}
        </MapContainer>

        {/* تخصيص شكل شريط البحث ليتناسق مع التصميم */}
        <style>{`
          .leaflet-control-geosearch form {
            background: #ffffff !important;
            border: 2px solid #0A3A2A !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          }
          .leaflet-control-geosearch form input {
            color: #0A3A2A !important;
            font-weight: 600 !important;
            text-align: right !important;
            direction: rtl !important;
          }
          .leaflet-control-geosearch .reset {
            background: #E8B04B !important;
          }
          .leaflet-control-geosearch .reset:hover {
            background: #d49a35 !important;
          }
        `}</style>
      </Paper>

      <Text size="xs" c="dimmed" mt="xs">
        💡 اضغط على الموقع المطلوب في الخريطة، أو استخدم شريط البحث في الأعلى، ويمكنك سحب العلامة لتعديل موقعها بدقة.
      </Text>

      {position ? (
        <Paper
          p="sm"
          mt="sm"
          radius="md"
          style={{ background: '#f0f7f3', border: '1px solid #d1e7dd' }}
        >
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed">تم تحديد الموقع بنجاح</Text>
              <Text size="sm" fw={700} c="#0A3A2A">
                {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
              </Text>
            </Box>

            <Button
              size="xs"
              variant="subtle"
              color="red"
              onClick={() => onChange({ latitude: '', longitude: '' })}
            >
              إزالة الموقع
            </Button>
          </Group>
        </Paper>
      ) : (
        <Text size="xs" c="orange" mt="xs">
          ⚠️ لم يتم تحديد الموقع بعد.
        </Text>
      )}
    </Box>
  );
}