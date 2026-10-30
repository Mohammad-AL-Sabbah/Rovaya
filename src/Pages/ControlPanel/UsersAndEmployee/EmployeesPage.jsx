import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Text, Group, Button, ThemeIcon, Table, Badge,
  Modal, TextInput, Select, Textarea, Stack, Divider, ActionIcon,
  ScrollArea, Loader, Center, SimpleGrid, RingProgress
} from '@mantine/core';
import {
  IconUsers, IconUserPlus, IconShieldLock, IconShieldOff,
  IconAlertTriangle, IconCheck, IconUserShield, IconBriefcase,
  IconEye, IconTrash
} from '@tabler/icons-react';
import Swal from 'sweetalert2';
import API from '../../../API/ApiAuthToken';

export function EmployeesPage() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [blockModalOpened, setBlockModalOpened] = useState(false);
  const [unblockModalOpened, setUnblockModalOpened] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [addFormData, setAddFormData] = useState({
    firstName: '', lastName: '', email: '', temporaryPassword: '', country: 'فلسطين'
  });
  const [blockFormData, setBlockFormData] = useState({
    reason: '', durationUnit: 'Days', durationValue: ''
  });

  const currentUserRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  const isSuperAdmin = currentUserRoles.includes('SuperAdmin');

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const total = employees.length;
    const superAdmins = employees.filter(e => e.roles.includes('SuperAdmin')).length;
    const admins = employees.filter(e => e.roles.includes('Admin') && !e.roles.includes('SuperAdmin')).length;
    const blocked = employees.filter(e => e.status === 2 || e.status === 3).length;
    const active = total - blocked;

    return { total, superAdmins, admins, blocked, active };
  }, [employees]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/Admin/get-all-employees');
      if (response.data.success) {
        setEmployees(response.data.data);
      } else {
        Swal.fire({ icon: 'error', title: 'خطأ', text: response.data.message });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'خطأ', text: 'فشل في جلب بيانات الموظفين' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/api/auth/account/create-employee', addFormData);
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'نجاح', text: response.data.message, timer: 2000, showConfirmButton: false });
        setAddModalOpened(false);
        setAddFormData({ firstName: '', lastName: '', email: '', temporaryPassword: '', country: 'فلسطين' });
        fetchEmployees();
      } else {
        Swal.fire({ icon: 'error', title: 'فشل', text: response.data.message });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'خطأ', text: error.response?.data?.message || 'حدث خطأ أثناء إنشاء الموظف' });
    }
  };

  const handleBlockEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      const payload = {
        targetUserId: selectedEmployee.id,
        reason: blockFormData.reason,
      };

      if (blockFormData.durationUnit !== 'Permanent') {
        payload.durationValue = parseInt(blockFormData.durationValue);
        payload.durationUnit = blockFormData.durationUnit;
      }

      const response = await API.post('/api/auth/account/block-user', payload);
      
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'نجاح', text: response.data.message, timer: 2000, showConfirmButton: false });
        setBlockModalOpened(false);
        setBlockFormData({ reason: '', durationUnit: 'Days', durationValue: '' });
        fetchEmployees();
      } else {
        Swal.fire({ icon: 'error', title: 'فشل', text: response.data.message });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'خطأ', text: error.response?.data?.message || 'حدث خطأ أثناء حظر الموظف' });
    }
  };

  const handleUnblockEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      const response = await API.post('/api/auth/account/unblock-user', `"${selectedEmployee.id}"`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'نجاح', text: response.data.message, timer: 2000, showConfirmButton: false });
        setUnblockModalOpened(false);
        setSelectedEmployee(null);
        fetchEmployees();
      } else {
        Swal.fire({ icon: 'error', title: 'فشل', text: response.data.message });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'خطأ', text: error.response?.data?.message || 'حدث خطأ أثناء فك الحظر' });
    }
  };

  // ✅ دالة حذف الموظف نهائياً
  const handleDeleteEmployee = async (employeeId, employeeName, empRoles) => {
    // تحقق أمني إضافي في الواجهة الأمامية
    const isTargetAdminOrSuper = empRoles.includes('Admin') || empRoles.includes('SuperAdmin');
    if (!isSuperAdmin && isTargetAdminOrSuper) {
      Swal.fire({
        icon: 'warning',
        title: 'غير مصرح',
        text: 'لا يحق للموظف حذف حساب موظف آخر أو مدير نظام. هذه الصلاحية محجوزة للمدير الفائق (SuperAdmin) فقط.'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'هل أنت متأكد تماماً؟',
      text: `سيتم حذف حساب "${employeeName}" بشكل نهائي ولا يمكن التراجع عن هذا الإجراء!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#0A3A2A',
      confirmButtonText: 'نعم، احذف الحساب نهائياً',
      cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
      try {
        // إرسال الـ ID كـ JSON String مباشرة
        const response = await API.post('/api/auth/account/delete-user-account', `"${employeeId}"`, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.data.success) {
          Swal.fire({ 
            icon: 'success', 
            title: 'تم الحذف', 
            text: response.data.message, 
            timer: 2000, 
            showConfirmButton: false 
          });
          fetchEmployees();
        } else {
          Swal.fire({ icon: 'error', title: 'فشل', text: response.data.message });
        }
      } catch (error) {
        Swal.fire({ 
          icon: 'error', 
          title: 'خطأ', 
          text: error.response?.data?.message || 'حدث خطأ أثناء حذف الحساب' 
        });
      }
    }
  };

  const canManageEmployee = (empRoles) => {
    const isTargetAdminOrSuper = empRoles.includes('Admin') || empRoles.includes('SuperAdmin');
    return isSuperAdmin || !isTargetAdminOrSuper;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-PS', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

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
            <IconUsers size={32} color="#E8B04B" />
            <Text fw={800} size="xl">إدارة الموظفين والإداريين</Text>
          </Group>
          <Text size="sm" c="rgba(255,255,255,0.8)" mt={4}>عرض وإدارة صلاحيات وحالة حسابات فريق العمل</Text>
        </div>
        <Button 
          leftSection={<IconUserPlus size={18} />} 
          style={{ backgroundColor: '#E8B04B', color: '#0A3A2A', fontWeight: 700 }}
          onClick={() => setAddModalOpened(true)}
        >
          إضافة موظف جديد
        </Button>
      </Paper>

      {/* البطاقات الإحصائية */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="lg">
        <Paper p="lg" radius="lg" withBorder style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', border: '2px solid #0A3A2A' }}>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed" fw={600}>إجمالي الموظفين</Text>
              <Text size="3xl" fw={800} c="#0A3A2A" mt={4}>{stats.total}</Text>
              <Text size="xs" c="teal" mt={4}>في النظام</Text>
            </div>
            <ThemeIcon size={60} radius="xl" variant="light" color="teal" style={{ backgroundColor: 'rgba(10, 58, 42, 0.1)' }}>
              <IconUsers size={32} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="lg" radius="lg" withBorder style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)', border: '2px solid #7e22ce' }}>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed" fw={600}> مدراء النظام</Text>
              <Text size="3xl" fw={800} c="#7e22ce" mt={4}>{stats.superAdmins}</Text>
              <Text size="xs" c="purple" mt={4}>Super Admin</Text>
            </div>
            <ThemeIcon size={60} radius="xl" variant="light" color="purple" style={{ backgroundColor: 'rgba(126, 34, 206, 0.1)' }}>
              <IconUserShield size={32} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="lg" radius="lg" withBorder style={{ background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', border: '2px solid #1d4ed8' }}>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed" fw={600}>الموظفون</Text>
              <Text size="3xl" fw={800} c="#1d4ed8" mt={4}>{stats.admins}</Text>
              <Text size="xs" c="blue" mt={4}>Admin</Text>
            </div>
            <ThemeIcon size={60} radius="xl" variant="light" color="blue" style={{ backgroundColor: 'rgba(29, 78, 216, 0.1)' }}>
              <IconBriefcase size={32} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="lg" radius="lg" withBorder style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)', border: '2px solid #d97706' }}>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed" fw={600}>نشط / محظور</Text>
              <Text size="3xl" fw={800} c="#d97706" mt={4}>{stats.active}<Text size="lg" c="dimmed"> / {stats.blocked}</Text></Text>
              <Text size="xs" c="orange" mt={4}>الحالة</Text>
            </div>
            <RingProgress
              size={60}
              thickness={6}
              sections={[
                { value: (stats.active / (stats.total || 1)) * 100, color: 'teal' },
                { value: (stats.blocked / (stats.total || 1)) * 100, color: 'red' }
              ]}
              label={<Text ta="center" size="xs" fw={700}>{stats.total}</Text>}
            />
          </Group>
        </Paper>
      </SimpleGrid>

      {/* جدول الموظفين */}
      <Paper radius="lg" withBorder style={{ overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <Center p="xl"><Loader color="teal" /></Center>
        ) : (
          <ScrollArea>
            <Table highlightOnHover style={{ minWidth: 900 }}>
              <Table.Thead style={{ backgroundColor: '#0A3A2A' }}>
                <Table.Tr>
                  {['الموظف', 'البريد الإلكتروني', 'الصلاحية', 'الحالة', 'تاريخ الانضمام', 'الإجراءات'].map((header) => (
                    <Table.Th key={header} style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px' }}>{header}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {employees.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                      <Group justify="center" gap="md">
                        <IconUsers size={48} color="#cbd5e1" />
                        <Text c="dimmed" size="lg">لا يوجد موظفين مسجلين حالياً</Text>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  employees.map((emp) => {
                    const isBlocked = emp.status === 2 || emp.status === 3;
                    const canManage = canManageEmployee(emp.roles);

                    return (
                      <Table.Tr key={emp.id} style={{ transition: 'all 0.2s' }}>
                        <Table.Td>
                          <Group gap="sm">
                            <ThemeIcon size="lg" radius="xl" color={isBlocked ? 'gray' : 'teal'} variant="light">
                              {emp.firstName.charAt(0)}
                            </ThemeIcon>
                            <div>
                              <Text fw={600} size="sm">{emp.firstName} {emp.lastName}</Text>
                              <Text size="xs" c="dimmed">{emp.phoneNumber || 'لا يوجد رقم'}</Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td><Text size="sm">{emp.email}</Text></Table.Td>
                        <Table.Td>
                          {emp.roles.includes('SuperAdmin') ? (
                            <Badge color="purple" variant="light" leftSection={<IconShieldLock size={12} />}>مدير نظام / Super Admin</Badge>
                          ) : (
                            <Badge color="blue" variant="light" leftSection={<IconUsers size={12} />}>موظف / Admin</Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {isBlocked ? (
                            <Badge color="red" variant="light" leftSection={<IconShieldLock size={12} />}>محظور</Badge>
                          ) : (
                            <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>نشط</Badge>
                          )}
                        </Table.Td>
                        <Table.Td><Text size="sm" c="dimmed">{formatDate(emp.createdAt)}</Text></Table.Td>
                        <Table.Td>
                          <Group justify="center" gap="xs">
                            {canManage ? (
                              <>
                                {/* زر الحذف النهائي */}
                                <ActionIcon 
                                  size="lg"
                                  color="red" 
                                  variant="light" 
                                  title="حذف الحساب نهائياً"
                                  style={{ ':hover': { backgroundColor: '#fee2e2' } }}
                                  onClick={() => handleDeleteEmployee(emp.id, `${emp.firstName} ${emp.lastName}`, emp.roles)}
                                >
                                  <IconTrash size={18} />
                                </ActionIcon>

                                {/* أزرار الحظر وفك الحظر */}
                                {isBlocked ? (
                                  <ActionIcon 
                                    size="lg"
                                    color="green" 
                                    variant="light" 
                                    title="فك الحظر"
                                    style={{ ':hover': { backgroundColor: '#dcfce7' } }}
                                    onClick={() => { setSelectedEmployee(emp); setUnblockModalOpened(true); }}
                                  >
                                    <IconShieldOff size={18} />
                                  </ActionIcon>
                                ) : (
                                  <ActionIcon 
                                    size="lg"
                                    color="red" 
                                    variant="light" 
                                    title="حظر"
                                    style={{ ':hover': { backgroundColor: '#fee2e2' } }}
                                    onClick={() => { setSelectedEmployee(emp); setBlockModalOpened(true); }}
                                  >
                                    <IconShieldLock size={18} />
                                  </ActionIcon>
                                )}
                                
                                {/* زر عرض التفاصيل */}
                                <ActionIcon 
                                  size="lg"
                                  color="blue" 
                                  variant="light" 
                                  title="عرض التفاصيل"
                                  style={{ ':hover': { backgroundColor: '#dbeafe' } }}
                                  onClick={() => Swal.fire({
                                    title: `${emp.firstName} ${emp.lastName}`,
                                    html: `
                                      <div style="text-align: right; direction: rtl; font-family: sans-serif;">
                                        <p><strong>البريد:</strong> ${emp.email}</p>
                                        <p><strong>الهاتف:</strong> ${emp.phoneNumber || 'غير متوفر'}</p>
                                        <p><strong>الدولة:</strong> ${emp.country || 'فلسطين'}</p>
                                        <p><strong>الصلاحية:</strong> ${emp.roles.join(' - ')}</p>
                                        <p><strong>الحالة:</strong> ${isBlocked ? 'محظور' : 'نشط'}</p>
                                        <p><strong>تاريخ الانضمام:</strong> ${formatDate(emp.createdAt)}</p>
                                      </div>
                                    `,
                                    confirmButtonText: 'إغلاق',
                                    confirmButtonColor: '#0A3A2A'
                                  })}
                                >
                                  <IconEye size={18} />
                                </ActionIcon>
                              </>
                            ) : (
                              <Badge size="sm" color="gray" variant="outline">لا تملك الصلاحية</Badge>
                            )}
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

      {/* مودال إضافة موظف جديد */}
      <Modal opened={addModalOpened} onClose={() => setAddModalOpened(false)} title={<Group gap="xs"><IconUserPlus size={24} color="#0A3A2A" /><Text fw={700}>إضافة موظف جديد</Text></Group>} size="md" centered>
        <form onSubmit={handleAddEmployee}>
          <Stack gap="md">
            <Group grow>
              <TextInput label="الاسم الأول" required value={addFormData.firstName} onChange={(e) => setAddFormData({...addFormData, firstName: e.target.value})} />
              <TextInput label="اسم العائلة" required value={addFormData.lastName} onChange={(e) => setAddFormData({...addFormData, lastName: e.target.value})} />
            </Group>
            <TextInput label="البريد الإلكتروني" type="email" required value={addFormData.email} onChange={(e) => setAddFormData({...addFormData, email: e.target.value})} />
            <TextInput label="كلمة المرور المبدئية" required type="password" value={addFormData.temporaryPassword} onChange={(e) => setAddFormData({...addFormData, temporaryPassword: e.target.value})} description="سيتم إرسالها للموظف عبر البريد الإلكتروني" />
            <TextInput label="الدولة" value={addFormData.country} onChange={(e) => setAddFormData({...addFormData, country: e.target.value})} />
            <Button type="submit" color="teal" fullWidth mt="md" leftSection={<IconCheck size={18} />}>إنشاء الحساب وإرسال البريد</Button>
          </Stack>
        </form>
      </Modal>

      {/* مودال حظر موظف */}
      <Modal opened={blockModalOpened} onClose={() => setBlockModalOpened(false)} title={<Group gap="xs"><IconShieldLock size={24} color="red" /><Text fw={700}>حظر موظف</Text></Group>} size="md" centered>
        {selectedEmployee && (
          <Stack gap="md">
            <Group p="md" style={{ backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }} gap="xs">
              <IconAlertTriangle size={24} color="#856404" />
              <div>
                <Text size="sm" c="#856404" fw={700}>تحذير: أنت على وشك حظر</Text>
                <Text size="lg" c="#856404" fw={800}>{selectedEmployee.firstName} {selectedEmployee.lastName}</Text>
              </div>
            </Group>

            <Select
              label="مدة الحظر"
              required
              value={blockFormData.durationUnit}
              onChange={(value) => setBlockFormData({...blockFormData, durationUnit: value})}
              data={[
                { value: 'Permanent', label: 'حظر دائم' },
                { value: 'Minutes', label: 'دقائق' },
                { value: 'Hours', label: 'ساعات' },
                { value: 'Days', label: 'أيام' },
              ]}
            />

            {blockFormData.durationUnit !== 'Permanent' && (
              <TextInput
                label="القيمة (عدد الأيام/الساعات/الدقائق)"
                type="number"
                required
                min="1"
                value={blockFormData.durationValue}
                onChange={(e) => setBlockFormData({...blockFormData, durationValue: e.target.value})}
                placeholder="أدخل الرقم"
              />
            )}

            <Textarea
              label="سبب الحظر"
              required
              placeholder="اكتب سبباً واضحاً للحظر..."
              minRows={3}
              value={blockFormData.reason}
              onChange={(e) => setBlockFormData({...blockFormData, reason: e.target.value})}
            />

            <Divider />

            <Group justify="space-between">
              <Button variant="outline" color="gray" onClick={() => setBlockModalOpened(false)}>إلغاء</Button>
              <Button color="red" onClick={handleBlockEmployee} leftSection={<IconShieldLock size={16} />}>تأكيد الحظر</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* مودال تأكيد فك الحظر */}
      <Modal opened={unblockModalOpened} onClose={() => setUnblockModalOpened(false)} title={<Group gap="xs"><IconShieldOff size={24} color="green" /><Text fw={700}>فك الحظر</Text></Group>} size="md" centered>
        {selectedEmployee && (
          <Stack gap="md" align="center">
            <ThemeIcon size={80} radius="xl" color="green" variant="light" style={{ backgroundColor: '#dcfce7' }}>
              <IconShieldOff size={40} />
            </ThemeIcon>
            
            <Text ta="center" size="lg" fw={700}>
              هل أنت متأكد من فك الحظر عن:
            </Text>
            
            <Text ta="center" size="xl" fw={800} c="#0A3A2A">
              {selectedEmployee.firstName} {selectedEmployee.lastName}
            </Text>

            <Text ta="center" size="sm" c="dimmed">
              سيتم إعادة تفعيل حساب المستخدم والسماح له بالدخول للنظام
            </Text>

            <Divider />

            <Group justify="space-between" w="100%">
              <Button variant="outline" color="gray" onClick={() => setUnblockModalOpened(false)} flex={1}>إلغاء</Button>
              <Button color="green" onClick={handleUnblockEmployee} leftSection={<IconCheck size={16} />} flex={1}>تأكيد فك الحظر</Button>
            </Group>
          </Stack>
        )}
      </Modal>

    </Box>
  );
}