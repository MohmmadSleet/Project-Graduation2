/* =========================================================
   Smart Dental Clinic - shared demo data layer
   Static/GitHub Pages version: data is persisted in localStorage.
   ========================================================= */
(function () {
  'use strict';

  const KEYS = {
    users: 'dental_users_v1',
    appointments: 'dental_appointments_v1',
    logs: 'dental_audit_logs_v1',
    currentUser: 'dental_current_user_v1',
    bookingDraft: 'dental_booking_draft_v1'
  };

  const nowISO = () => new Date().toISOString();
  const uid = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const parse = (value, fallback) => {
    try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; }
  };
  const read = (key, fallback) => parse(localStorage.getItem(key), fallback);
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function addDays(iso, days) {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function seedUsers() {
    if (localStorage.getItem(KEYS.users)) return;
    const createdAt = '2026-03-12T08:00:00.000Z';
    const users = [
      { id: 'admin-1', role: 'admin', firstName: 'يزن', lastName: 'خنفر', name: 'يزن خنفر', email: 'admin@smartdentalclinic.ps', password: 'Admin@123', phone: '0590000000', status: 'active', createdAt },
      { id: 'doctor-1', role: 'doctor', firstName: 'محمد', lastName: 'عبد الكريم', name: 'د. محمد عبد الكريم', email: 'doctor@example.com', password: 'Doctor@123', phone: '0591111111', specialty: 'علاج لب الأسنان', license: 'PS-DEN-1001', clinic: 'نابلس - عيادة الحكيم', status: 'active', createdAt },
      { id: 'doctor-2', role: 'doctor', firstName: 'رنا', lastName: 'الشريف', name: 'د. رنا الشريف', email: 'rana@example.com', password: 'Doctor@123', phone: '0592222222', specialty: 'طب أسنان الأطفال', license: 'PS-DEN-1002', clinic: 'طولكرم', status: 'active', createdAt },
      { id: 'doctor-3', role: 'doctor', firstName: 'أسامة', lastName: 'جرار', name: 'د. أسامة جرار', email: 'osama@example.com', password: 'Doctor@123', phone: '0593333333', specialty: 'جراحة الفم والأسنان', license: 'PS-DEN-1003', clinic: 'نابلس', status: 'pending', createdAt },
      { id: 'doctor-4', role: 'doctor', firstName: 'خالد', lastName: 'ياسين', name: 'د. خالد ياسين', email: 'khaled@example.com', password: 'Doctor@123', phone: '0594444444', specialty: 'تنظيف وتجميل الأسنان', license: 'PS-DEN-1004', clinic: 'رام الله', status: 'active', createdAt },
      { id: 'patient-1', role: 'patient', firstName: 'أحمد', lastName: 'محمد', name: 'أحمد محمد', email: 'patient@example.com', password: 'Patient@123', phone: '0595555555', dob: '2002-05-10', gender: 'male', status: 'active', createdAt },
      { id: 'patient-2', role: 'patient', firstName: 'سارة', lastName: 'يوسف', name: 'سارة يوسف', email: 'sara@example.com', password: 'Patient@123', phone: '0596666666', dob: '1999-08-21', gender: 'female', status: 'active', createdAt },
      { id: 'patient-3', role: 'patient', firstName: 'ليان', lastName: 'قاسم', name: 'ليان قاسم', email: 'layan@example.com', password: 'Patient@123', phone: '0597777777', dob: '2001-01-11', gender: 'female', status: 'active', createdAt },
      { id: 'patient-4', role: 'patient', firstName: 'خالد', lastName: 'سالم', name: 'خالد سالم', email: 'khaled.patient@example.com', password: 'Patient@123', phone: '0598888888', dob: '1995-11-02', gender: 'male', status: 'active', createdAt }
    ];
    write(KEYS.users, users);
  }

  function seedAppointments() {
    if (localStorage.getItem(KEYS.appointments)) return;
    const today = todayISO();
    const appointments = [
      { id: 1, patientName: 'أحمد محمد', patientId: 'patient-1', doctorId: 'doctor-1', doctorName: 'د. محمد عبد الكريم', date: today, time: '09:00', service: 'فحص أسنان', status: 'مؤكد', notes: '', createdAt: nowISO(), createdBy: 'system' },
      { id: 2, patientName: 'سارة يوسف', patientId: 'patient-2', doctorId: 'doctor-1', doctorName: 'د. محمد عبد الكريم', date: today, time: '11:30', service: 'علاج عصب', status: 'مؤكد', notes: '', createdAt: nowISO(), createdBy: 'system' },
      { id: 3, patientName: 'ليان قاسم', patientId: 'patient-3', doctorId: 'doctor-2', doctorName: 'د. رنا الشريف', date: addDays(today, 2), time: '13:15', service: 'تنظيف أسنان', status: 'انتظار', notes: '', createdAt: nowISO(), createdBy: 'system' },
      { id: 4, patientName: 'خالد سالم', patientId: 'patient-4', doctorId: 'doctor-1', doctorName: 'د. محمد عبد الكريم', date: addDays(today, 3), time: '09:30', service: 'فحص دوري', status: 'مؤكد', notes: '', createdAt: nowISO(), createdBy: 'system' }
    ];
    write(KEYS.appointments, appointments);
  }

  function seedLogs() {
    if (localStorage.getItem(KEYS.logs)) return;
    write(KEYS.logs, [{
      id: uid('log'), timestamp: nowISO(), category: 'system', action: 'SYSTEM_INIT',
      label: 'تهيئة بيانات النظام', actorId: 'system', actorName: 'النظام', actorRole: 'system',
      targetId: '', targetName: '', details: 'تم إنشاء مخزن البيانات المحلي للنسخة التجريبية.'
    }]);
  }

  seedUsers();
  seedAppointments();
  seedLogs();

  function getUsers() { return read(KEYS.users, []); }
  function saveUsers(users) { write(KEYS.users, users); return users; }
  function getUser(id) { return getUsers().find(u => String(u.id) === String(id)) || null; }
  function findUserByEmail(email) { return getUsers().find(u => (u.email || '').toLowerCase() === String(email || '').trim().toLowerCase()) || null; }
  function getCurrentUser() {
    const value = read(KEYS.currentUser, null);
    if (!value) return null;
    return getUser(value.id) || value;
  }
  function setCurrentUser(user) {
    if (!user) localStorage.removeItem(KEYS.currentUser);
    else write(KEYS.currentUser, { id: user.id, role: user.role, name: user.name, email: user.email });
  }

  function actorFallback() {
    return getCurrentUser() || { id: 'admin-local', name: 'مدير النظام', role: 'admin' };
  }

  function addLog(entry) {
    const actor = entry.actor || actorFallback();
    const logs = read(KEYS.logs, []);
    const log = {
      id: uid('log'),
      timestamp: entry.timestamp || nowISO(),
      category: entry.category || 'system',
      action: entry.action || 'ACTION',
      label: entry.label || entry.action || 'نشاط',
      actorId: entry.actorId || actor.id || 'unknown',
      actorName: entry.actorName || actor.name || actor.email || 'مستخدم',
      actorRole: entry.actorRole || actor.role || 'unknown',
      targetId: entry.targetId == null ? '' : String(entry.targetId),
      targetName: entry.targetName || '',
      details: entry.details || '',
      meta: entry.meta || {}
    };
    logs.unshift(log);
    // Keep a generous but bounded local audit history.
    write(KEYS.logs, logs.slice(0, 2500));
    return log;
  }
  function getLogs() { return read(KEYS.logs, []); }

  function createUser(data, options) {
    const users = getUsers();
    if (users.some(u => (u.email || '').toLowerCase() === String(data.email || '').toLowerCase())) {
      throw new Error('البريد الإلكتروني مستخدم مسبقًا');
    }
    const role = data.role === 'doctor' ? 'doctor' : 'patient';
    const user = {
      id: uid(role), role,
      firstName: data.firstName || '', lastName: data.lastName || '',
      name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      email: data.email || '', password: data.password || '', phone: data.phone || '',
      dob: data.dob || '', gender: data.gender || '', specialty: data.specialty || '',
      license: data.license || '', clinic: data.clinic || '',
      status: data.status || (role === 'doctor' ? 'pending' : 'active'),
      createdAt: nowISO()
    };
    users.push(user); saveUsers(users);
    if (!options || options.log !== false) addLog({ category: 'users', action: 'USER_REGISTERED', label: role === 'doctor' ? 'تسجيل طبيب جديد' : 'تسجيل مريض جديد', actor: user, targetId: user.id, targetName: user.name, details: `تم إنشاء حساب ${role === 'doctor' ? 'طبيب' : 'مريض'} بالبريد ${user.email}` });
    return user;
  }

  function updateUser(id, patch, audit) {
    const users = getUsers();
    const index = users.findIndex(u => String(u.id) === String(id));
    if (index < 0) throw new Error('المستخدم غير موجود');
    const duplicate = patch.email && users.find((u, i) => i !== index && (u.email || '').toLowerCase() === String(patch.email).toLowerCase());
    if (duplicate) throw new Error('البريد الإلكتروني مستخدم بواسطة حساب آخر');
    const before = { ...users[index] };
    users[index] = { ...users[index], ...patch, id: users[index].id, updatedAt: nowISO() };
    saveUsers(users);
    if (before.name !== users[index].name) {
      const appointments = getAppointments().map(a => {
        const copy = { ...a };
        if (String(copy.patientId) === String(id) || copy.patientName === before.name) copy.patientName = users[index].name;
        if (String(copy.doctorId) === String(id) || copy.doctorName === before.name) copy.doctorName = users[index].name;
        return copy;
      });
      saveAppointments(appointments);
    }
    if (!audit || audit.log !== false) addLog({ category: 'users', action: 'USER_UPDATED', label: 'تعديل بيانات مستخدم', targetId: id, targetName: users[index].name, details: (audit && audit.details) || `تم تعديل بيانات ${users[index].name}`, meta: { beforeStatus: before.status, afterStatus: users[index].status } });
    return users[index];
  }

  function deleteUser(id) {
    const users = getUsers();
    const user = users.find(u => String(u.id) === String(id));
    if (!user) throw new Error('المستخدم غير موجود');
    if (user.role === 'admin') throw new Error('لا يمكن حذف حساب مدير النظام من هذه الواجهة');
    saveUsers(users.filter(u => String(u.id) !== String(id)));
    const appointments = getAppointments();
    const related = appointments.filter(a => String(a.patientId) === String(id) || String(a.doctorId) === String(id) || a.patientName === user.name || a.doctorName === user.name);
    saveAppointments(appointments.filter(a => String(a.patientId) !== String(id) && String(a.doctorId) !== String(id) && a.patientName !== user.name && a.doctorName !== user.name));
    addLog({ category: 'users', action: 'USER_DELETED', label: 'حذف حساب مستخدم', targetId: id, targetName: user.name, details: `تم حذف حساب ${user.name} وحذف ${related.length} موعد مرتبط بالحساب.` });
    return { user, deletedAppointments: related.length };
  }

  function login(email, password) {
    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      addLog({ category: 'auth', action: 'LOGIN_FAILED', label: 'محاولة تسجيل دخول فاشلة', actor: { id: 'anonymous', name: email || 'غير معروف', role: 'anonymous' }, targetName: email || '', details: 'بيانات الدخول غير صحيحة.' });
      return { ok: false, reason: 'invalid' };
    }
    if (user.status === 'pending') {
      addLog({ category: 'auth', action: 'LOGIN_BLOCKED_PENDING', label: 'محاولة دخول لحساب بانتظار الاعتماد', actor: user, targetId: user.id, targetName: user.name, details: 'الحساب بانتظار اعتماد الإدارة.' });
      return { ok: false, reason: 'pending', user };
    }
    if (user.status === 'disabled') {
      addLog({ category: 'auth', action: 'LOGIN_BLOCKED_DISABLED', label: 'محاولة دخول لحساب معطل', actor: user, targetId: user.id, targetName: user.name, details: 'تم منع تسجيل الدخول لأن الحساب معطل.' });
      return { ok: false, reason: 'disabled', user };
    }
    setCurrentUser(user);
    addLog({ category: 'auth', action: 'LOGIN_SUCCESS', label: 'تسجيل دخول ناجح', actor: user, targetId: user.id, targetName: user.name, details: `تم تسجيل الدخول كـ ${roleLabel(user.role)}.` });
    return { ok: true, user };
  }

  function logout() {
    const user = getCurrentUser();
    if (user) addLog({ category: 'auth', action: 'LOGOUT', label: 'تسجيل خروج', actor: user, targetId: user.id, targetName: user.name, details: 'تم تسجيل الخروج من الحساب.' });
    setCurrentUser(null);
  }

  function getAppointments() { return read(KEYS.appointments, []); }
  function saveAppointments(items) { write(KEYS.appointments, items); return items; }
  function nextAppointmentId(items) { return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1; }

  function createAppointment(data, audit) {
    const items = getAppointments();
    const appointment = { ...data, id: data.id || nextAppointmentId(items), createdAt: data.createdAt || nowISO() };
    items.push(appointment); saveAppointments(items);
    if (!audit || audit.log !== false) addLog({ category: 'appointments', action: 'APPOINTMENT_CREATED', label: 'حجز موعد جديد', targetId: appointment.id, targetName: appointment.patientName, details: `${appointment.patientName || 'مريض'} حجز موعدًا مع ${appointment.doctorName || 'الطبيب'} بتاريخ ${appointment.date} الساعة ${appointment.time}.` });
    return appointment;
  }

  function updateAppointment(id, patch, audit) {
    const items = getAppointments();
    const index = items.findIndex(a => String(a.id) === String(id));
    if (index < 0) throw new Error('الموعد غير موجود');
    items[index] = { ...items[index], ...patch, id: items[index].id, updatedAt: nowISO() };
    saveAppointments(items);
    if (!audit || audit.log !== false) addLog({ category: 'appointments', action: 'APPOINTMENT_UPDATED', label: (audit && audit.label) || 'تعديل موعد', targetId: id, targetName: items[index].patientName, details: (audit && audit.details) || `تم تعديل موعد ${items[index].patientName}.` });
    return items[index];
  }

  function deleteAppointment(id) {
    const items = getAppointments();
    const appointment = items.find(a => String(a.id) === String(id));
    if (!appointment) throw new Error('الموعد غير موجود');
    saveAppointments(items.filter(a => String(a.id) !== String(id)));
    addLog({ category: 'appointments', action: 'APPOINTMENT_DELETED', label: 'حذف موعد نهائيًا', targetId: id, targetName: appointment.patientName, details: `تم حذف موعد ${appointment.patientName} مع ${appointment.doctorName || 'الطبيب'} بتاريخ ${appointment.date} الساعة ${appointment.time}.` });
    return appointment;
  }

  function roleLabel(role) { return ({ admin: 'مدير النظام', doctor: 'طبيب', patient: 'مريض', system: 'النظام' })[role] || role || 'مستخدم'; }
  function statusLabel(status) { return ({ active: 'نشط', pending: 'بانتظار الاعتماد', disabled: 'معطل' })[status] || status || '—'; }

  function saveBookingDraft(draft) { write(KEYS.bookingDraft, draft); }
  function getBookingDraft() { return read(KEYS.bookingDraft, null); }
  function clearBookingDraft() { localStorage.removeItem(KEYS.bookingDraft); }

  window.DentalStore = {
    KEYS, getUsers, saveUsers, getUser, findUserByEmail, createUser, updateUser, deleteUser,
    getCurrentUser, setCurrentUser, login, logout,
    getAppointments, saveAppointments, createAppointment, updateAppointment, deleteAppointment,
    getLogs, addLog, roleLabel, statusLabel,
    saveBookingDraft, getBookingDraft, clearBookingDraft,
    todayISO, addDays
  };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-logout]').forEach(function (el) {
      el.addEventListener('click', function (event) {
        event.preventDefault();
        var target = el.getAttribute('data-logout');
        logout();
        if (target && target !== 'true') setTimeout(function () { window.location.href = target; }, 250);
      });
    });

    const current = getCurrentUser();
    if (current && !document.body.hasAttribute('data-no-page-audit')) {
      addLog({ category: 'navigation', action: 'PAGE_VIEW', label: 'زيارة صفحة', actor: current, targetName: document.title, details: `فتح صفحة: ${document.title}` });
    }
  });
})();
