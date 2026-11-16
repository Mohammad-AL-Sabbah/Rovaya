import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Text, Group, Button, ThemeIcon, Table, Badge,
  Modal, TextInput, Select, Textarea, Stack, Divider, ActionIcon,
  ScrollArea, Loader, Center, SimpleGrid, Image, Tooltip,
  Pagination, Mark
} from '@mantine/core';
import {
  IconLifebuoy, IconSearch, IconRefresh, IconEye, IconTrash,
  IconCheck, IconX, IconClock, IconAlertTriangle, IconPhone,
  IconUser, IconCalendar, IconPhoto, IconSend, IconLoader,
  IconCircleCheck, IconCircleOff, IconFilter
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Swal from 'sweetalert2';
import API from '../../../API/ApiAuthToken';

// ✅ قاموس حالات التذاكر (متطابق مع TicketStatus enum في الباك إند)
const STATUS_CONFIG = {
  0: {
    key: 'Sent',
    ar: 'جديدة',
    en: 'Sent',
    color: 'yellow',
    icon: IconSend,
    bg: '#fffbeb',
    border: '#d97706',
    text: '#92400e',
    desc: 'بانتظار الاستلام من الدعم الفني'
  },
  1: {
    key: 'Received',
    ar: 'تم الاستلام',
    en: 'Received',
    color: 'blue',
    icon: IconCheck,
    bg: '#eff6ff',
    border: '#1d4ed8',
    text: '#1e40af',
    desc: 'تم فتح التذكرة من قبل الدعم الفني'
  },
  2: {
    key: 'InProgress',
    ar: 'قيد المعالجة',
    en: 'In Progress',
    color: 'orange',
    icon: IconLoader,
    bg: '#fff7ed',
    border: '#ea580c',
    text: '#9a3412',
    desc: 'الدعم الفني يعمل على حل المشكلة'
  },
  3: {
    key: 'Resolved',
    ar: 'تم الحل',
    en: 'Resolved',
    color: 'green',
    icon: IconCircleCheck,
    bg: '#f0fdf4',
    border: '#16a34a',
    text: '#166534',
    desc: 'تم حل المشكلة بنجاح'
  },
  4: {
    key: 'Rejected',
    ar: 'مرفوضة',
    en: 'Rejected',
    color: 'red',
    icon: IconCircleOff,
    bg: '#fef2f2',
    border: '#dc2626',
    text: '#991b1b',
    desc: 'بلاغ غير صحيح أو لا تنطبق عليه الشروط'
  },
};

// ✅ خيارات تغيير الحالة (بدون Sent لأنها حالة البداية)
const STATUS_OPTIONS = [
  { value: '1', label: '🔵 تم الاستلام (Received)' },
  { value: '2', label: '🟠 قيد المعالجة (In Progress)' },
  { value: '3', label: '🟢 تم الحل (Resolved)' },
  { value: '4', label: '🔴 مرفوضة (Rejected)' },
];

export function SupportTicketsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState([]);

  // الفلاتر
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // المودالات
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [statusModalOpened, setStatusModalOpened] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // نموذج تغيير الحالة
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // التصفح
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ✅ جلب التذاكر
  const fetchTickets = async (bypassCache = false) => {
    if (bypassCache) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await API.get('/api/auth/account/support/all-tickets');
      if (response.data.success) {
        setTickets(response.data.data || []);
      } else {
        Swal.fire({ icon: 'error', title: 'خطأ', text: response.data.message });
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: error.response?.data?.message || 'فشل في جلب التذاكر'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    document.title = 'تذاكر الدعم الفني | ROVAYA';
  }, []);

  // ✅ الإحصائيات
  const stats = useMemo(() => {
    const total = tickets.length;
    const byStatus = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    tickets.forEach(t => {
      if (byStatus[t.status] !== undefined) byStatus[t.status]++;
    });

    return {
      total,
      sent: byStatus[0],
      received: byStatus[1],
      inProgress: byStatus[2],
      resolved: byStatus[3],
      rejected: byStatus[4],
      open: byStatus[0] + byStatus[1] + byStatus[2],
      closed: byStatus[3] + byStatus[4],
    };
  }, [tickets]);

  // ✅ الفلترة
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // فلترة حسب الحالة
      if (filterStatus !== 'all' && ticket.status !== parseInt(filterStatus)) {
        return false;
      }

      // البحث النصي
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ticket.title?.toLowerCase().includes(q);
        const matchesDesc = ticket.description?.toLowerCase().includes(q);
        const matchesUser = ticket.userName?.toLowerCase().includes(q);
        const matchesPhone = ticket.userPhone?.includes(q);

        if (!matchesTitle && !matchesDesc && !matchesUser && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, searchQuery, filterStatus]);

  // ✅ التصفح
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // ✅ فتح مودال التفاصيل
  const openDetailsModal = (ticket) => {
    setSelectedTicket(ticket);
    setDetailsModalOpened(true);
  };

  // ✅ فتح مودال تغيير الحالة
  const openStatusModal = (ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(String(ticket.status));
    setAdminNotes(ticket.adminNotes || '');
    setStatusModalOpened(true);
  };

  // ✅ تنفيذ تغيير الحالة
  const handleUpdateStatus = async () => {
    if (!selectedTicket || !newStatus) return;

    // منع إرسال نفس الحالة
    if (parseInt(newStatus) === selectedTicket.status) {
      Swal.fire({
        icon: 'info',
        title: 'ملاحظة',
        text: 'الحالة المختارة هي نفس الحالة الحالية.',
      });
      return;
    }

    setUpdating(true);
    try {
      const response = await API.post('/api/auth/account/support/update-status', {
        ticketId: selectedTicket.id,
        newStatus: parseInt(newStatus),
        adminNotes: adminNotes,
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'تم بنجاح',
          text: response.data.message || 'تم تحديث حالة التذكرة',
          timer: 1800,
          showConfirmButton: false,
        });
        setStatusModalOpened(false);
        setSelectedTicket(null);
        setNewStatus('');
        setAdminNotes('');
        fetchTickets(true);
      } else {
        Swal.fire({ icon: 'error', title: 'فشل', text: response.data.message });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: error.response?.data?.message || 'حدث خطأ أثناء تحديث الحالة'
      });
    } finally {
      setUpdating(false);
    }
  };

  // ✅ حذف تذكرة
  const handleDeleteTicket = async (ticket) => {
    const result = await Swal.fire({
      title: 'تأكيد الحذف',
      text: `سيتم حذف التذكرة "${ticket.title}" نهائياً مع جميع الصور المرفقة.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#0A3A2A',
      confirmButtonText: 'نعم، احذف نهائياً',
      cancelButtonText: 'إلغاء',
    });

    if (!result.isConfirmed) return;

    setDeleting(true);
    try {
      const response = await API.delete(`/api/auth/account/support/delete/${ticket.id}`);

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'تم الحذف',
          text: response.data.message,
          timer: 1800,
          showConfirmButton: false,
        });
        setDetailsModalOpened(false);
        setSelectedTicket(null);
        fetchTickets(true);
      } else {
        Swal.fire({ icon: 'error', title: 'فشل', text: response.data.message });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: error.response?.data?.message || 'حدث خطأ أثناء الحذف'
      });
    } finally {
      setDeleting(false);
    }
  };

  // ✅ تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy - HH:mm', { locale: ar });
    } catch {
      return dateString;
    }
  };

  // ✅ تمييز النص المطابق للبحث
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <Mark key={i} color="yellow">{part}</Mark>
        : part
    );
  };

  const hasActiveFilters = searchQuery || filterStatus !== 'all';

  return (
    <Box style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 75px)', direction: 'rtl' }}>

      {/* ==================== رأس الصفحة ==================== */}
      <Paper p="lg" radius="lg" withBorder mb="lg" style={{
        background: 'linear-gradient(135deg, #0A3A2A 0%, #114d38 100%)',
        color: '#ffffff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px'
      }}>
        <div>
          <Group gap="xs">
            <IconLifebuoy size={32} color="#E8B04B" />
            <Text fw={800} size="xl">تذاكر الدعم الفني</Text>
          </Group>
          <Text size="sm" c="rgba(255,255,255,0.8)" mt={4}>
            إدارة ومتابعة بلاغات المستخدمين واستفساراتهم
          </Text>
        </div>
        <Button
          color="teal"
          variant="white"
          onClick={() => fetchTickets(true)}
          loading={refreshing}
          leftSection={<IconRefresh size={18} />}
          style={{ backgroundColor: '#E8B04B', color: '#0A3A2A', fontWeight: 700 }}
        >
          تحديث البيانات
        </Button>
      </Paper>

      {/* ==================== البطاقات الإحصائية ==================== */}
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="md" mb="lg">
        <Paper p="md" radius="lg" withBorder
          style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', border: '2px solid #0A3A2A' }}>
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" fw={600}>الإجمالي</Text>
              <ThemeIcon size={32} radius="md" variant="light" color="teal">
                <IconLifebuoy size={18} />
              </ThemeIcon>
            </Group>
            <Text size="2xl" fw={800} c="#0A3A2A">{stats.total}</Text>
            <Text size="xs" c="teal">تذكرة</Text>
          </Stack>
        </Paper>

        <Paper p="md" radius="lg" withBorder
          style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)', border: '2px solid #d97706' }}>
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" fw={600}>جديدة</Text>
              <ThemeIcon size={32} radius="md" variant="light" color="yellow">
                <IconSend size={18} />
              </ThemeIcon>
            </Group>
            <Text size="2xl" fw={800} c="#d97706">{stats.sent}</Text>
            <Text size="xs" c="orange">بانتظار الاستلام</Text>
          </Stack>
        </Paper>

        <Paper p="md" radius="lg" withBorder
          style={{ background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', border: '2px solid #1d4ed8' }}>
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" fw={600}>مستلمة</Text>
              <ThemeIcon size={32} radius="md" variant="light" color="blue">
                <IconCheck size={18} />
              </ThemeIcon>
            </Group>
            <Text size="2xl" fw={800} c="#1d4ed8">{stats.received}</Text>
            <Text size="xs" c="blue">تم فتحها</Text>
          </Stack>
        </Paper>

        <Paper p="md" radius="lg" withBorder
          style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)', border: '2px solid #ea580c' }}>
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" fw={600}>قيد المعالجة</Text>
              <ThemeIcon size={32} radius="md" variant="light" color="orange">
                <IconClock size={18} />
              </ThemeIcon>
            </Group>
            <Text size="2xl" fw={800} c="#ea580c">{stats.inProgress}</Text>
            <Text size="xs" c="orange">يتم العمل عليها</Text>
          </Stack>
        </Paper>

        <Paper p="md" radius="lg" withBorder
          style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', border: '2px solid #16a34a' }}>
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" fw={600}>تم الحل</Text>
              <ThemeIcon size={32} radius="md" variant="light" color="green">
                <IconCircleCheck size={18} />
              </ThemeIcon>
            </Group>
            <Text size="2xl" fw={800} c="#16a34a">{stats.resolved}</Text>
            <Text size="xs" c="green">مغلقة بنجاح</Text>
          </Stack>
        </Paper>

        <Paper p="md" radius="lg" withBorder
          style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)', border: '2px solid #dc2626' }}>
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" fw={600}>مرفوضة</Text>
              <ThemeIcon size={32} radius="md" variant="light" color="red">
                <IconCircleOff size={18} />
              </ThemeIcon>
            </Group>
            <Text size="2xl" fw={800} c="#dc2626">{stats.rejected}</Text>
            <Text size="xs" c="red">بلاغات غير صحيحة</Text>
          </Stack>
        </Paper>
      </SimpleGrid>

      {/* ==================== أدوات البحث والفلترة ==================== */}
      <Paper p="lg" radius="lg" withBorder mb="lg">
        <Group gap="md" mb="md">
          <IconFilter size={20} color="#0A3A2A" />
          <Text fw={700} size="lg" c="#0A3A2A">أدوات البحث والفلترة</Text>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <TextInput
            placeholder="ابحث بالعنوان، الوصف، اسم المستخدم، أو الهاتف..."
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

          <Select
            placeholder="جميع الحالات"
            data={[
              { value: 'all', label: '📋 جميع الحالات' },
              { value: '0', label: '🟡 جديدة (Sent)' },
              { value: '1', label: '🔵 تم الاستلام (Received)' },
              { value: '2', label: '🟠 قيد المعالجة (In Progress)' },
              { value: '3', label: '🟢 تم الحل (Resolved)' },
              { value: '4', label: '🔴 مرفوضة (Rejected)' },
            ]}
            value={filterStatus}
            onChange={(v) => setFilterStatus(v || 'all')}
            size="md"
            radius="md"
          />
        </SimpleGrid>

        {hasActiveFilters && (
          <Group justify="space-between" mt="md">
            <Text size="sm" c="dimmed">
              تم العثور على <Text component="span" fw={700} c="#0A3A2A">{filteredTickets.length}</Text> تذكرة
            </Text>
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
              leftSection={<IconX size={14} />}
            >
              إعادة تعيين الفلاتر
            </Button>
          </Group>
        )}
      </Paper>

      {/* ==================== الجدول ==================== */}
      <Paper radius="lg" withBorder style={{ overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <Center p="xl">
            <Stack gap="md" align="center">
              <Loader color="teal" size="lg" />
              <Text c="dimmed">جاري تحميل التذاكر...</Text>
            </Stack>
          </Center>
        ) : (
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="md" style={{ minWidth: 1100 }}>
              <Table.Thead style={{ backgroundColor: '#0A3A2A' }}>
                <Table.Tr>
                  <Table.Th style={{ color: '#fff', fontWeight: 700, fontSize: '14px', minWidth: '60px' }}>#</Table.Th>
                  <Table.Th style={{ color: '#fff', fontWeight: 700, fontSize: '14px', minWidth: '180px' }}>المستخدم</Table.Th>
                  <Table.Th style={{ color: '#fff', fontWeight: 700, fontSize: '14px', minWidth: '220px' }}>العنوان</Table.Th>
                  <Table.Th style={{ color: '#fff', fontWeight: 700, fontSize: '14px', minWidth: '100px', textAlign: 'center' }}>الصور</Table.Th>
                  <Table.Th style={{ color: '#fff', fontWeight: 700, fontSize: '14px', minWidth: '140px' }}>الحالة</Table.Th>
                  <Table.Th style={{ color: '#fff', fontWeight: 700, fontSize: '14px', minWidth: '160px' }}>تاريخ الإنشاء</Table.Th>
                  <Table.Th style={{ color: '#fff', fontWeight: 700, fontSize: '14px', minWidth: '180px', textAlign: 'center' }}>الإجراءات</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedTickets.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={7} style={{ textAlign: 'center', padding: '60px' }}>
                      <Stack gap="md" align="center">
                        <IconLifebuoy size={64} color="#cbd5e1" />
                        <Text c="dimmed" size="lg">
                          {hasActiveFilters ? 'لا توجد تذاكر مطابقة للفلاتر' : 'لا توجد تذاكر دعم فني حالياً'}
                        </Text>
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  paginatedTickets.map((ticket) => {
                    const config = STATUS_CONFIG[ticket.status] || STATUS_CONFIG[0];
                    const StatusIcon = config.icon;

                    return (
                      <Table.Tr key={ticket.id} style={{ transition: 'all 0.2s' }}>
                        <Table.Td>
                          <Text size="sm" fw={700} c="dimmed">#{ticket.id}</Text>
                        </Table.Td>

                        <Table.Td>
                          <Group gap="sm">
                            <ThemeIcon size="lg" radius="xl" color={config.color} variant="light">
                              {ticket.userName?.charAt(0) || '?'}
                            </ThemeIcon>
                            <div>
                              <Text fw={600} size="sm">
                                {highlightText(ticket.userName, searchQuery)}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {ticket.userPhone}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>

                        <Table.Td>
                          <Text size="sm" fw={600} lineClamp={2} style={{ maxWidth: '220px' }}>
                            {highlightText(ticket.title, searchQuery)}
                          </Text>
                          <Text size="xs" c="dimmed" lineClamp={1} mt={2}>
                            {ticket.description}
                          </Text>
                        </Table.Td>

                        <Table.Td style={{ textAlign: 'center' }}>
                          {ticket.imageUrls && ticket.imageUrls.length > 0 ? (
                            <Tooltip label={`${ticket.imageUrls.length} صورة مرفقة`}>
                              <Badge color="blue" variant="light" leftSection={<IconPhoto size={12} />}>
                                {ticket.imageUrls.length}
                              </Badge>
                            </Tooltip>
                          ) : (
                            <Text size="xs" c="dimmed">-</Text>
                          )}
                        </Table.Td>

                        <Table.Td>
                          <Badge
                            color={config.color}
                            variant="light"
                            leftSection={<StatusIcon size={12} />}
                          >
                            {config.ar}
                          </Badge>
                        </Table.Td>

                        <Table.Td>
                          <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                            {formatDate(ticket.createdAt)}
                          </Text>
                        </Table.Td>

                        <Table.Td>
                          <Group justify="center" gap="xs">
                            <ActionIcon
                              size="lg"
                              color="blue"
                              variant="light"
                              title="عرض التفاصيل"
                              style={{ ':hover': { backgroundColor: '#dbeafe' } }}
                              onClick={() => openDetailsModal(ticket)}
                            >
                              <IconEye size={18} />
                            </ActionIcon>

                            <ActionIcon
                              size="lg"
                              color="orange"
                              variant="light"
                              title="تغيير الحالة"
                              style={{ ':hover': { backgroundColor: '#ffedd5' } }}
                              onClick={() => openStatusModal(ticket)}
                            >
                              <IconCheck size={18} />
                            </ActionIcon>

                            <ActionIcon
                              size="lg"
                              color="red"
                              variant="light"
                              title="حذف التذكرة"
                              style={{ ':hover': { backgroundColor: '#fee2e2' } }}
                              onClick={() => handleDeleteTicket(ticket)}
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                          </Group>
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

      {/* ==================== التصفح ==================== */}
      {!loading && filteredTickets.length > pageSize && (
        <Group justify="space-between" mt="lg">
          <Text size="sm" c="dimmed">
            عرض {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredTickets.length)} من {filteredTickets.length}
          </Text>
          <Pagination
            total={Math.ceil(filteredTickets.length / pageSize)}
            value={currentPage}
            onChange={setCurrentPage}
            color="teal"
            size="sm"
          />
        </Group>
      )}

      {/* ==================== مودال التفاصيل ==================== */}
      <Modal
        opened={detailsModalOpened}
        onClose={() => { setDetailsModalOpened(false); setSelectedTicket(null); }}
        title={
          <Group gap="xs">
            <IconLifebuoy size={24} color="#0A3A2A" />
            <Text fw={700}>تفاصيل التذكرة</Text>
          </Group>
        }
        size="xl"
        centered
        radius="lg"
      >
        {selectedTicket && (() => {
          const config = STATUS_CONFIG[selectedTicket.status] || STATUS_CONFIG[0];
          const StatusIcon = config.icon;

          return (
            <Stack gap="md">
              {/* حالة التذكرة */}
              <Group p="md" style={{ backgroundColor: config.bg, borderRadius: '10px', border: `2px solid ${config.border}` }} gap="xs">
                <ThemeIcon size={40} radius="xl" color={config.color} variant="light">
                  <StatusIcon size={22} />
                </ThemeIcon>
                <div>
                  <Text size="sm" c={config.text} fw={600}>الحالة الحالية</Text>
                  <Text size="lg" c={config.text} fw={800}>{config.ar} ({config.en})</Text>
                </div>
              </Group>

              {/* معلومات المستخدم */}
              <Paper p="md" radius="md" withBorder>
                <Group gap="md" mb="xs">
                  <IconUser size={20} color="#0A3A2A" />
                  <Text fw={700} c="#0A3A2A">معلومات المستخدم</Text>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <div>
                    <Text size="xs" c="dimmed" mb={2}>الاسم</Text>
                    <Text size="sm" fw={600}>{selectedTicket.userName}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed" mb={2}>رقم الهاتف</Text>
                    <Group gap={4}>
                      <IconPhone size={14} color="#0A3A2A" />
                      <Text size="sm" fw={600}>{selectedTicket.userPhone}</Text>
                    </Group>
                  </div>
                </SimpleGrid>
              </Paper>

              {/* تفاصيل البلاغ */}
              <Paper p="md" radius="md" withBorder>
                <Text size="xs" c="dimmed" mb={4}>عنوان المشكلة</Text>
                <Text size="md" fw={700} mb="md">{selectedTicket.title}</Text>

                <Text size="xs" c="dimmed" mb={4}>الوصف التفصيلي</Text>
                <Text size="sm" lh={1.8} style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedTicket.description}
                </Text>
              </Paper>

              {/* الصور المرفقة */}
              {selectedTicket.imageUrls && selectedTicket.imageUrls.length > 0 && (
                <Paper p="md" radius="md" withBorder>
                  <Group gap="xs" mb="md">
                    <IconPhoto size={18} color="#0A3A2A" />
                    <Text fw={700} size="sm">الصور المرفقة ({selectedTicket.imageUrls.length})</Text>
                  </Group>
                  <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
                    {selectedTicket.imageUrls.map((url, idx) => (
                      <Image
                        key={idx}
                        src={url}
                        alt={`مرفق ${idx + 1}`}
                        radius="md"
                        h={140}
                        fit="cover"
                        withPlaceholder
                      />
                    ))}
                  </SimpleGrid>
                </Paper>
              )}

              {/* ملاحظات الدعم الفني */}
              {selectedTicket.adminNotes && (
                <Paper p="md" radius="md" withBorder style={{ backgroundColor: '#fffbeb', borderColor: '#d97706' }}>
                  <Text size="xs" c="dimmed" mb={4}>ملاحظات الدعم الفني</Text>
                  <Text size="sm" lh={1.7}>{selectedTicket.adminNotes}</Text>
                </Paper>
              )}

              {/* التواريخ */}
              <Group grow>
                <Paper p="md" radius="md" withBorder>
                  <Group gap="xs" mb={4}>
                    <IconCalendar size={14} color="#0A3A2A" />
                    <Text size="xs" c="dimmed">تاريخ الإنشاء</Text>
                  </Group>
                  <Text size="sm" fw={600}>{formatDate(selectedTicket.createdAt)}</Text>
                </Paper>
                <Paper p="md" radius="md" withBorder>
                  <Group gap="xs" mb={4}>
                    <IconRefresh size={14} color="#0A3A2A" />
                    <Text size="xs" c="dimmed">آخر تحديث</Text>
                  </Group>
                  <Text size="sm" fw={600}>{formatDate(selectedTicket.updatedAt)}</Text>
                </Paper>
              </Group>

              <Divider />

              {/* الأزرار */}
              <Group justify="space-between">
                <Button
                  variant="outline"
                  color="gray"
                  onClick={() => { setDetailsModalOpened(false); setSelectedTicket(null); }}
                >
                  إغلاق
                </Button>
                <Group gap="xs">
                  <Button
                    color="orange"
                    leftSection={<IconCheck size={16} />}
                    onClick={() => {
                      setDetailsModalOpened(false);
                      openStatusModal(selectedTicket);
                    }}
                  >
                    تغيير الحالة
                  </Button>
                  <Button
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size={16} />}
                    loading={deleting}
                    onClick={() => handleDeleteTicket(selectedTicket)}
                  >
                    حذف
                  </Button>
                </Group>
              </Group>
            </Stack>
          );
        })()}
      </Modal>

      {/* ==================== مودال تغيير الحالة ==================== */}
      <Modal
        opened={statusModalOpened}
        onClose={() => {
          setStatusModalOpened(false);
          setSelectedTicket(null);
          setNewStatus('');
          setAdminNotes('');
        }}
        title={
          <Group gap="xs">
            <IconCheck size={24} color="#ea580c" />
            <Text fw={700}>تغيير حالة التذكرة</Text>
          </Group>
        }
        size="md"
        centered
        radius="lg"
      >
        {selectedTicket && (
          <Stack gap="md">
            {/* معلومات التذكرة المختارة */}
            <Group p="md" style={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }} gap="xs">
              <IconAlertTriangle size={22} color="#0A3A2A" />
              <div style={{ flex: 1 }}>
                <Text size="xs" c="dimmed">التذكرة رقم</Text>
                <Text size="md" fw={800} c="#0A3A2A">#{selectedTicket.id} - {selectedTicket.title}</Text>
                <Text size="xs" c="dimmed" mt={4}>
                  الحالة الحالية: {STATUS_CONFIG[selectedTicket.status]?.ar}
                </Text>
              </div>
            </Group>

            <Select
              label="الحالة الجديدة"
              required
              value={newStatus}
              onChange={setNewStatus}
              data={STATUS_OPTIONS}
              placeholder="اختر الحالة الجديدة"
              description="سيتم إشعار المستخدم بتغيير الحالة"
            />

            <Textarea
              label="ملاحظات الدعم الفني"
              placeholder="اكتب ملاحظاتك حول الإجراء المتخذ (اختياري)..."
              minRows={3}
              maxLength={1000}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              description="هذه الملاحظات ستظهر للمستخدم في التطبيق"
            />

            {/* معاينة سريعة */}
            {newStatus && STATUS_CONFIG[newStatus] && (
              <Group p="sm" style={{
                backgroundColor: STATUS_CONFIG[newStatus].bg,
                borderRadius: '8px',
                border: `1px dashed ${STATUS_CONFIG[newStatus].border}`
              }} gap="xs">
                <IconSend size={16} color={STATUS_CONFIG[newStatus].text} />
                <Text size="xs" c={STATUS_CONFIG[newStatus].text}>
                  {STATUS_CONFIG[newStatus].desc}
                </Text>
              </Group>
            )}

            <Divider />

            <Group justify="space-between">
              <Button
                variant="outline"
                color="gray"
                onClick={() => {
                  setStatusModalOpened(false);
                  setSelectedTicket(null);
                  setNewStatus('');
                  setAdminNotes('');
                }}
              >
                إلغاء
              </Button>
              <Button
                color="orange"
                onClick={handleUpdateStatus}
                loading={updating}
                leftSection={<IconCheck size={16} />}
              >
                حفظ التغييرات
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

    </Box>
  );
}