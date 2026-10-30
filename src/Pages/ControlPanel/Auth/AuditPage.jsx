import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Text, Group, Button, ThemeIcon, Table, Badge,
  TextInput, Select, ActionIcon, Stack, Divider, ScrollArea,
  Loader, Center, Modal, SimpleGrid, Tooltip
} from '@mantine/core';
import {
  IconSearch, IconRefresh, IconFileText, IconShieldLock,
  IconShieldOff, IconUserPlus, IconTrash, IconEdit,
  IconNews, IconEye, IconCalendar, IconFilter, IconX
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import API from '../../../API/ApiAuthToken';

// قاموس ترجمة الإجراءات
const ACTION_TRANSLATIONS = {
  'Block': { ar: 'حظر مستخدم', icon: IconShieldLock, color: 'red' },
  'Unblock': { ar: 'فك الحظر', icon: IconShieldOff, color: 'green' },
  'CreateEmployee': { ar: 'إنشاء موظف', icon: IconUserPlus, color: 'blue' },
  'DeleteUser': { ar: 'حذف مستخدم', icon: IconTrash, color: 'red' },
  'DeleteUserByAdmin': { ar: 'حذف حساب', icon: IconTrash, color: 'red' },
  'DeleteAccount': { ar: 'حذف الحساب', icon: IconTrash, color: 'red' },
  'CreateNews': { ar: 'إنشاء خبر', icon: IconNews, color: 'teal' },
  'UpdateNews': { ar: 'تعديل خبر', icon: IconEdit, color: 'orange' },
  'DeleteNews': { ar: 'حذف خبر', icon: IconTrash, color: 'red' },
  'CreateRecommendation': { ar: 'إنشاء توصية', icon: IconFileText, color: 'purple' },
  'UpdateRecommendation': { ar: 'تعديل توصية', icon: IconEdit, color: 'orange' },
  'DeleteRecommendation': { ar: 'حذف توصية', icon: IconTrash, color: 'red' },
};

// مفتاح الكاش
const CACHE_KEY = 'rovaya_audit_logs_cache';
const CACHE_TIMESTAMP_KEY = 'rovaya_audit_logs_timestamp';
const CACHE_DURATION = 5 * 60 * 1000;

export function AuditPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const [refreshing, setRefreshing] = useState(false);
  const [lastCacheTime, setLastCacheTime] = useState(null);
  
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchAuditLogs = async (bypassCache = false) => {
    if (bypassCache) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      if (!bypassCache) {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cacheTime = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        
        if (cachedData && cacheTime) {
          const age = Date.now() - parseInt(cacheTime);
          if (age < CACHE_DURATION) {
            const parsed = JSON.parse(cachedData);
            setLogs(parsed.logs || []);
            setTotalCount(parsed.totalCount || 0);
            setLastCacheTime(new Date(parseInt(cacheTime)));
            setLoading(false);
            return;
          }
        }
      }

      const response = await API.get('/api/auth/account/audit-logs', {
        params: {
          pageNumber: currentPage,
          pageSize: pageSize
        }
      });

      if (response.data.success) {
        const logsData = response.data.logs || [];
        const total = response.data.totalCount || 0;
        
        setLogs(logsData);
        setTotalCount(total);
        
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          logs: logsData,
          totalCount: total
        }));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        setLastCacheTime(new Date());
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, pageSize]);

  // فلترة السجلات
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // فلترة حسب الإجراء
      if (selectedAction !== 'all' && log.action !== selectedAction) {
        return false;
      }

      // فلترة حسب البحث
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = log.performedByUserName?.toLowerCase().includes(query);
        const matchesTarget = log.targetUserName?.toLowerCase().includes(query);
        const matchesDetails = log.details?.toLowerCase().includes(query);
        const matchesReason = log.reason?.toLowerCase().includes(query);
        
        if (!matchesName && !matchesTarget && !matchesDetails && !matchesReason) {
          return false;
        }
      }

      // فلترة حسب التاريخ (يوم واحد فقط)
      if (filterDate) {
        const logDate = new Date(log.timestamp);
        const filterDateObj = new Date(filterDate);
        
        // مقارنة اليوم فقط (بدون الوقت)
        const logDay = logDate.toDateString();
        const filterDay = filterDateObj.toDateString();
        
        if (logDay !== filterDay) {
          return false;
        }
      }

      return true;
    });
  }, [logs, searchQuery, selectedAction, filterDate]);

  const handleRefresh = () => {
    fetchAuditLogs(true);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy - HH:mm', { locale: ar });
    } catch {
      return dateString;
    }
  };

  const getActionInfo = (action) => {
    return ACTION_TRANSLATIONS[action] || { 
      ar: action, 
      icon: IconFileText, 
      color: 'gray' 
    };
  };

  // قائمة الإجراءات مع خيار "كل الإجراءات" كخيار أول
  const actionOptions = [
    { value: 'all', label: ' كل الإجراءات' },
    ...Object.entries(ACTION_TRANSLATIONS).map(([key, value]) => ({
      value: key,
      label: value.ar
    }))
  ];

  const hasActiveFilters = searchQuery || selectedAction !== 'all' || filterDate;

  return (
    <Box style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 75px)', direction: 'rtl' }}>
      
      {/* رأس الصفحة */}
      <Paper p="lg" radius="lg" withBorder mb="lg" style={{ 
        background: 'linear-gradient(135deg, #0A3A2A 0%, #114d38 100%)',
        color: '#ffffff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
      }}>
        <div>
          <Group gap="xs">
            <IconFileText size={32} color="#E8B04B" />
            <Text fw={800} size="xl">سجل الرقابة والتدقيق (Audit Log)</Text>
          </Group>
          <Text size="sm" c="rgba(255,255,255,0.8)" mt={4}>
            متابعة ومراقبة جميع الإجراءات الحساسة في النظام
          </Text>
        </div>
        <Group gap="sm">
          {lastCacheTime && (
            <Text size="sm" c="rgba(255,255,255,0.8)">
              آخر تحديث: {format(lastCacheTime, 'HH:mm:ss', { locale: ar })}
            </Text>
          )}
          <Button 
            color="teal" 
            onClick={handleRefresh}
            loading={refreshing}
            leftSection={<IconRefresh size={18} />}
          >
            تحديث البيانات
          </Button>
        </Group>
      </Paper>

      {/* البطاقات الإحصائية */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mb="lg">
        <Paper p="lg" radius="lg" withBorder style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', border: '2px solid #0A3A2A' }}>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed" fw={600}>إجمالي السجلات</Text>
              <Text size="3xl" fw={800} c="#0A3A2A" mt={4}>{totalCount}</Text>
              <Text size="xs" c="teal" mt={4}>سجل تدقيق</Text>
            </div>
            <ThemeIcon size={60} radius="xl" variant="light" color="teal" style={{ backgroundColor: 'rgba(10, 58, 42, 0.1)' }}>
              <IconFileText size={32} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="lg" radius="lg" withBorder style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fee2e2 100%)', border: '2px solid #dc2626' }}>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed" fw={600}>عمليات الحظر</Text>
              <Text size="3xl" fw={800} c="#dc2626" mt={4}>
                {logs.filter(l => l.action === 'Block').length}
              </Text>
              <Text size="xs" c="red" mt={4}>هذا الشهر</Text>
            </div>
            <ThemeIcon size={60} radius="xl" variant="light" color="red" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
              <IconShieldLock size={32} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="lg" radius="lg" withBorder style={{ background: 'linear-gradient(135deg, #ffffff 0%, #dcfce7 100%)', border: '2px solid #16a34a' }}>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed" fw={600}>فك الحظر</Text>
              <Text size="3xl" fw={800} c="#16a34a" mt={4}>
                {logs.filter(l => l.action === 'Unblock').length}
              </Text>
              <Text size="xs" c="green" mt={4}>هذا الشهر</Text>
            </div>
            <ThemeIcon size={60} radius="xl" variant="light" color="green" style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}>
              <IconShieldOff size={32} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* أدوات البحث والفلترة */}
      <Paper p="lg" radius="lg" withBorder mb="lg">
        <Group gap="md" mb="md">
          <IconFilter size={20} color="#0A3A2A" />
          <Text fw={700} size="lg" c="#0A3A2A">أدوات البحث والفلترة</Text>
        </Group>
        
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
          {/* البحث النصي */}
          <TextInput
            placeholder="ابحث بالاسم، التفاصيل، أو السبب..."
            leftSection={<IconSearch size={18} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="md"
            radius="md"
            rightSection={
              searchQuery ? (
                <ActionIcon size="sm" onClick={() => setSearchQuery('')}>
                  <IconX size={16} />
                </ActionIcon>
              ) : null
            }
          />
          
          {/* فلتر الإجراءات مع خيار "كل الإجراءات" */}
          <Select
            placeholder="اختر الإجراء"
            data={actionOptions}
            value={selectedAction}
            onChange={(value) => setSelectedAction(value || 'all')}
            clearable
            size="md"
            radius="md"
            searchable
            nothingFoundMessage="لا توجد إجراءات مطابقة"
          />
          
          {/* حقل تاريخ واحد فقط */}
          <TextInput
            type="date"
            placeholder="فلترة حسب التاريخ"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            size="md"
            radius="md"
            rightSection={
              filterDate ? (
                <ActionIcon size="sm" onClick={() => setFilterDate('')}>
                  <IconX size={16} />
                </ActionIcon>
              ) : null
            }
          />
        </SimpleGrid>

        {/* زر إعادة تعيين الفلاتر */}
        {hasActiveFilters && (
          <Group justify="space-between" mt="md">
            <Text size="sm" c="dimmed">
              تم العثور على {filteredLogs.length} سجل
            </Text>
            <Button 
              variant="subtle" 
              color="gray" 
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedAction('all');
                setFilterDate('');
              }}
              leftSection={<IconX size={14} />}
            >
              إعادة تعيين الفلاتر
            </Button>
          </Group>
        )}
      </Paper>

      {/* جدول السجلات */}
      <Paper radius="lg" withBorder style={{ overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <Center p="xl">
            <Stack gap="md" align="center">
              <Loader color="teal" size="lg" />
              <Text c="dimmed">جاري تحميل سجلات التدقيق...</Text>
            </Stack>
          </Center>
        ) : (
          <ScrollArea>
            <Table highlightOnHover style={{ minWidth: 1100 }}>
              <Table.Thead style={{ backgroundColor: '#0A3A2A' }}>
                <Table.Tr>
                  <Table.Th style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px', minWidth: '140px' }}>الإجراء</Table.Th>
                  <Table.Th style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px', minWidth: '150px' }}>من قام بالإجراء</Table.Th>
                  <Table.Th style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px', minWidth: '150px' }}>المستهدف</Table.Th>
                  <Table.Th style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px', minWidth: '200px' }}>التفاصيل</Table.Th>
                  <Table.Th style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px', minWidth: '150px' }}>السبب</Table.Th>
                  <Table.Th style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px', minWidth: '160px' }}>التوقيت</Table.Th>
                  <Table.Th style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px', width: '80px', textAlign: 'center' }}>عرض</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredLogs.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={7} style={{ textAlign: 'center', padding: '60px' }}>
                      <Stack gap="md" align="center">
                        <IconFileText size={64} color="#cbd5e1" />
                        <Text c="dimmed" size="lg">
                          {hasActiveFilters
                            ? 'لا توجد نتائج مطابقة للفلاتر' 
                            : 'لا توجد سجلات تدقيق متاحة'}
                        </Text>
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredLogs.map((log) => {
                    const actionInfo = getActionInfo(log.action);
                    const ActionIcon = actionInfo.icon;
                    
                    return (
                      <Table.Tr key={log.id} style={{ transition: 'all 0.2s' }}>
                        <Table.Td>
                          <Badge 
                            color={actionInfo.color} 
                            variant="light" 
                            leftSection={<ActionIcon size={14} />}
                          >
                            {actionInfo.ar}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={600}>{log.performedByUserName}</Text>
                        </Table.Td>
                        <Table.Td>
                          {log.targetUserName ? (
                            <Text size="sm">{log.targetUserName}</Text>
                          ) : (
                            <Text size="xs" c="dimmed">-</Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed" style={{ maxWidth: '200px' }} lineClamp={2}>
                            {log.details || '-'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed" style={{ maxWidth: '150px' }} lineClamp={1}>
                            {log.reason || '-'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                            {formatDate(log.timestamp)}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Tooltip label="عرض التفاصيل">
                            <Button
                              variant="subtle"
                              color="blue"
                              size="xs"
                              compact
                              onClick={() => {
                                setSelectedLog(log);
                                setDetailsModalOpened(true);
                              }}
                              style={{ padding: '4px 8px', minWidth: '32px' }}
                            >
                              <IconEye size={16} />
                            </Button>
                          </Tooltip>
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

      {/* التصفح */}
      {!loading && filteredLogs.length > 0 && (
        <Group justify="space-between" mt="lg">
          <Text size="sm" c="dimmed">
            عرض {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredLogs.length)} من {totalCount}
          </Text>
          <Group gap="xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              السابق
            </Button>
            <Text size="sm" fw={600}>
              صفحة {currentPage}
            </Text>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage * pageSize >= totalCount}
            >
              التالي
            </Button>
          </Group>
        </Group>
      )}

      {/* مودال التفاصيل */}
      <Modal 
        opened={detailsModalOpened} 
        onClose={() => setDetailsModalOpened(false)} 
        title={<Group gap="xs"><IconFileText size={24} color="#0A3A2A" /><Text fw={700}>تفاصيل السجل</Text></Group>} 
        size="lg" 
        centered
      >
        {selectedLog && (
          <Stack gap="md">
            {(() => {
              const actionInfo = getActionInfo(selectedLog.action);
              const ActionIcon = actionInfo.icon;
              return (
                <Group p="md" style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', border: `2px solid ${actionInfo.color}` }} gap="xs">
                  <ThemeIcon size={40} radius="xl" color={actionInfo.color} variant="light">
                    <ActionIcon size={24} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" c="dimmed" fw={600}>الإجراء المنفذ</Text>
                    <Text size="lg" fw={800} c={actionInfo.color}>{actionInfo.ar}</Text>
                  </div>
                </Group>
              );
            })()}

            <Paper p="md" radius="md" withBorder>
              <Text size="sm" c="dimmed" mb={4}>من قام بالإجراء</Text>
              <Text size="md" fw={700}>{selectedLog.performedByUserName}</Text>
            </Paper>

            {selectedLog.targetUserName && (
              <Paper p="md" radius="md" withBorder>
                <Text size="sm" c="dimmed" mb={4}>المستخدم المستهدف</Text>
                <Text size="md" fw={700}>{selectedLog.targetUserName}</Text>
              </Paper>
            )}

            <Paper p="md" radius="md" withBorder>
              <Text size="sm" c="dimmed" mb={4}>التفاصيل</Text>
              <Text size="md">{selectedLog.details || '-'}</Text>
            </Paper>

            {selectedLog.reason && (
              <Paper p="md" radius="md" withBorder>
                <Text size="sm" c="dimmed" mb={4}>السبب</Text>
                <Text size="md" c="red">{selectedLog.reason}</Text>
              </Paper>
            )}

            <Paper p="md" radius="md" withBorder>
              <Text size="sm" c="dimmed" mb={4}>توقيت التنفيذ</Text>
              <Text size="md" fw={700}>{formatDate(selectedLog.timestamp)}</Text>
              <Text size="xs" c="dimmed" mt={4}>
                ID: {selectedLog.id}
              </Text>
            </Paper>

            <Divider />

            <Button onClick={() => setDetailsModalOpened(false)} color="teal" fullWidth>
              إغلاق
            </Button>
          </Stack>
        )}
      </Modal>

    </Box>
  );
}