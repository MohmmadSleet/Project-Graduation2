/* ==========================================================
   مخزن المواعيد المشترك (localStorage) — تستخدمه appointments.html
   و add-appointment.html و appointment-details.html معًا
   ========================================================== */
const APPT_STORAGE_KEY = 'dental_appointments_v1';

// "اليوم" مرتبط فعليًا بتاريخ جهاز المستخدم الحقيقي (مو تاريخ ثابت بالكود)
function getTodayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// يحسب تاريخ ISO بعد إضافة عدد أيام لتاريخ ISO معطى (يُستخدم لتوليد بيانات تجريبية نسبية لـ"اليوم")
function addDaysISO(iso, days) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function defaultAppointments() {
  const today = getTodayISO();
  return [
    { id: 1, patientName: 'أحمد محمد', patientId: '1025', date: today, time: '09:00', service: 'فحص أسنان',   status: 'مؤكد',   notes: '' },
    { id: 2, patientName: 'محمد علي',   patientId: '1032', date: today, time: '11:30', service: 'علاج عصب',   status: 'مؤكد',   notes: '' },
    { id: 3, patientName: 'سارة يوسف',  patientId: '1041', date: today, time: '13:15', service: 'تنظيف أسنان', status: 'انتظار', notes: '' },
    { id: 4, patientName: 'خالد سالم',  patientId: '1052', date: addDaysISO(today, 3), time: '09:30', service: 'فحص دوري',   status: 'مؤكد',   notes: '' },
    { id: 5, patientName: 'عمر ياسين',  patientId: '1060', date: addDaysISO(today, 5), time: '09:00', service: 'علاج تسوس',  status: 'مؤكد',   notes: '' },
    { id: 6, patientName: 'ليان قاسم',  patientId: '1077', date: addDaysISO(today, 6), time: '10:30', service: 'تقويم أسنان', status: 'مؤكد',   notes: '' }
  ];
}

function getAppointments() {
  try {
    const raw = localStorage.getItem(APPT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* التخزين غير متاح — نكمل بالبيانات الافتراضية */ }
  const seeded = defaultAppointments();
  saveAppointments(seeded);
  return seeded;
}

function saveAppointments(list) {
  try {
    localStorage.setItem(APPT_STORAGE_KEY, JSON.stringify(list));
  } catch (e) { /* التخزين غير متاح بهذا المتصفح */ }
}

function nextAppointmentId(list) {
  return list.reduce((max, a) => Math.max(max, a.id), 0) + 1;
}

function statusClassOf(status) {
  if (status === 'مؤكد') return 'confirmed';
  if (status === 'انتظار') return 'waiting';
  if (status === 'مكتمل') return 'completed';
  return 'cancelled';
}

function formatDateDisplay(iso) {
  const [y, m, d] = iso.split('-');
  return `${d} / ${m} / ${y}`;
}

function formatTimeDisplay(time24) {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? 'مساءً' : 'صباحًا';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${mStr} ${period}`;
}

const AR_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
function weekdayNameAr(iso) {
  const d = new Date(iso + 'T00:00:00');
  return AR_WEEKDAYS[d.getDay()];
}

/* ==========================================================
   مخزن المرضى المشترك (localStorage) — تستخدمه patients.html
   و add-patient.html
   ========================================================== */
const PATIENTS_STORAGE_KEY = 'dental_patients_v1';

function defaultPatients() {
  return [
    { id: 1, name: 'أحمد علي',   age: 25, phone: '059xxxxxxx', lastVisit: '23/09/2026', initials: 'أع' },
    { id: 2, name: 'سارة محمود', age: 31, phone: '056xxxxxxx', lastVisit: '22/09/2026', initials: 'سم' },
    { id: 3, name: 'عمر خالد',   age: 42, phone: '059xxxxxxx', lastVisit: '20/09/2026', initials: 'عخ' },
    { id: 4, name: 'لانا يوسف',  age: 28, phone: '057xxxxxxx', lastVisit: '18/09/2026', initials: 'لي' }
  ];
}

function getPatients() {
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* التخزين غير متاح — نكمل بالبيانات الافتراضية */ }
  const seeded = defaultPatients();
  savePatients(seeded);
  return seeded;
}

function savePatients(list) {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) { /* التخزين غير متاح بهذا المتصفح */ }
}

function nextPatientId(list) {
  return list.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}

function initialsOf(name) {
  return name.trim().slice(0, 2);
}

function patientRecordId(patientId) {
  return 1000 + Number(patientId);
}

/* ==========================================================
   مخزن التقارير المشترك (localStorage) — تستخدمه reports.html
   و create-report.html و report-details.html
   ========================================================== */
const REPORTS_STORAGE_KEY = 'dental_reports_v1';

function getReports() {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* التخزين غير متاح */ }
  return [];
}

function saveReports(list) {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) { /* التخزين غير متاح بهذا المتصفح */ }
}

function nextReportId(list) {
  return list.reduce((max, r) => Math.max(max, r.id), 0) + 1;
}

/* ==========================================================
   مخزن التوفر المشترك (localStorage) — تستخدمه availability.html
   ========================================================== */
const AVAILABILITY_STORAGE_KEY = 'dental_availability_v1';
const WEEK_DAYS_ORDER = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

function defaultAvailability() {
  return {
    weeklySchedule: {
      'السبت':   { enabled: true,  slots: [{ id: 1, start: '09:00', end: '17:00' }] },
      'الأحد':   { enabled: true,  slots: [{ id: 1, start: '09:00', end: '17:00' }] },
      'الإثنين': { enabled: true,  slots: [{ id: 1, start: '09:00', end: '17:00' }] },
      'الثلاثاء': { enabled: true,  slots: [{ id: 1, start: '09:00', end: '17:00' }] },
      'الأربعاء': { enabled: true,  slots: [{ id: 1, start: '09:00', end: '17:00' }] },
      'الخميس':  { enabled: true,  slots: [{ id: 1, start: '09:00', end: '14:00' }] },
      'الجمعة':  { enabled: false, slots: [] }
    },
    exceptions: []
  };
}

function getAvailability() {
  try {
    const raw = localStorage.getItem(AVAILABILITY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* التخزين غير متاح */ }
  const seeded = defaultAvailability();
  saveAvailability(seeded);
  return seeded;
}

function saveAvailability(data) {
  try {
    localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* التخزين غير متاح بهذا المتصفح */ }
}

function nextSlotId(slots) {
  return slots.reduce((max, s) => Math.max(max, s.id), 0) + 1;
}


document.addEventListener('DOMContentLoaded', () => {

  // فتح/إغلاق قائمة الموبايل
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  menuToggle.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', isOpen);
  });

  // القائمة المنسدلة للملف الشخصي
  const profileTrigger = document.getElementById('profileTrigger');
  const profileDropdown = document.getElementById('profileDropdown');

  function closeDropdown() {
    profileDropdown.classList.remove('open');
    profileTrigger.setAttribute('aria-expanded', 'false');
  }

  profileTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = profileDropdown.classList.toggle('open');
    profileTrigger.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!profileDropdown.contains(e.target) && !profileTrigger.contains(e.target)) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown();
  });

  // تبديل حالة "متاح / غير متاح"
  const statusToggle = document.getElementById('statusToggle');
  function toggleStatus() {
    const offline = statusToggle.classList.toggle('offline');
    statusToggle.querySelector('.label').textContent = offline ? 'غير متاح' : 'متاح الآن';
    statusToggle.setAttribute('aria-pressed', String(!offline));
  }
  statusToggle.addEventListener('click', toggleStatus);
  statusToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleStatus();
    }
  });

  // زر الإشعارات — مثال بسيط لإخفاء العداد عند الفتح
  const notifBtn = document.getElementById('notifBtn');
  notifBtn.addEventListener('click', () => {
    const badge = notifBtn.querySelector('.badge');
    if (badge) badge.style.display = 'none';
  });

  // زر اللغة — تبديل شكلي بين AR/EN (اربطه بنظام i18n الفعلي عند التطوير)
  const langBtn = document.getElementById('langBtn');
  langBtn.addEventListener('click', () => {
    langBtn.textContent = langBtn.textContent === 'EN' ? 'AR' : 'EN';
  });

  // جدول المرضى (صفحة المرضى) — يُبنى ديناميكيًا من المخزن، ويُعاد بناؤه عند البحث أو الإضافة
  const patientsTableBody = document.getElementById('patientsTableBody');
  if (patientsTableBody) {
    function renderPatientsTable(filterTerm) {
      const patients = getPatients();
      const term = (filterTerm || '').trim().toLowerCase();
      const filtered = term
        ? patients.filter(p => p.name.toLowerCase().includes(term) || p.phone.toLowerCase().includes(term))
        : patients;

      patientsTableBody.innerHTML = filtered.length ? filtered.map(p => `
        <tr>
          <td>
            <div class="name-cell">
              <div class="appt-avatar">${p.initials}</div>
              ${p.name}
            </div>
          </td>
          <td>${p.age}</td>
          <td class="phone-cell">${p.phone}</td>
          <td class="date-cell">${p.lastVisit}</td>
          <td class="actions-cell">
            <button class="row-menu-btn" aria-label="إجراءات إضافية" data-row-menu data-name="${p.name}">
              <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
            </button>
          </td>
        </tr>
      `).join('') : `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--color-text-muted);">لا يوجد نتائج مطابقة</td></tr>`;

      const countEl = document.getElementById('patientsCount');
      if (countEl) countEl.textContent = `عرض ${filtered.length} من أصل ${patients.length} مريض`;
    }

    renderPatientsTable();

    const patientSearch = document.getElementById('patientSearch');
    if (patientSearch) {
      patientSearch.addEventListener('input', () => renderPatientsTable(patientSearch.value));
    }
  }

  // قائمة إجراءات الصف (تنبثق عند الضغط على ⋮ بصفحة المرضى)
  // مبنية بأسلوب Event Delegation عشان تشتغل حتى مع صفوف تُضاف ديناميكيًا لاحقًا
  const rowMenu = document.getElementById('rowActionsMenu');
  if (rowMenu) {
    let activeBtn = null;

    function closeRowMenu() {
      rowMenu.classList.remove('open');
      if (activeBtn) activeBtn.classList.remove('active');
      activeBtn = null;
    }

    function positionRowMenu(btn) {
      const rect = btn.getBoundingClientRect();
      const menuWidth = rowMenu.offsetWidth || 190;
      const menuHeight = rowMenu.offsetHeight || 300;

      let left = rect.right - menuWidth;
      left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

      let top = rect.bottom + 6;
      if (top + menuHeight > window.innerHeight - 8) {
        top = rect.top - menuHeight - 6;
      }

      rowMenu.style.left = `${left}px`;
      rowMenu.style.top = `${top}px`;
    }

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-row-menu]');
      if (trigger) {
        e.stopPropagation();
        const wasOpenForThisBtn = activeBtn === trigger && rowMenu.classList.contains('open');
        closeRowMenu();
        if (wasOpenForThisBtn) return; // ضغطة ثانية على نفس الزر تغلق القائمة

        // اضبط رابط "عرض الملف" ليشير لملف هذا المريض بالتحديد قبل إظهار القائمة
        const viewLink = document.getElementById('viewProfileLink');
        if (viewLink && trigger.dataset.name) {
          viewLink.href = `patient-profile.html?name=${encodeURIComponent(trigger.dataset.name)}`;
        }

        rowMenu.classList.add('open');
        positionRowMenu(trigger);
        trigger.classList.add('active');
        activeBtn = trigger;
        return;
      }
      if (!rowMenu.contains(e.target)) closeRowMenu();
    });

    // إجراءات القائمة
    // "عرض الملف" رابط <a> حقيقي وينتقل تلقائيًا
    // "حجز موعد" ينقلك فعليًا لصفحة إضافة موعد مع تعبئة اسم المريض تلقائيًا
    // باقي الإجراءات (تعديل، السجل الطبي...) لسه بدون صفحات — عناصر نائبة
    rowMenu.querySelectorAll('button[data-action]').forEach(item => {
      item.addEventListener('click', () => {
        const patientName = activeBtn ? activeBtn.dataset.name : '';
        if (item.dataset.action === 'book' && patientName) {
          window.location.href = `add-appointment.html?name=${encodeURIComponent(patientName)}`;
          return;
        }
        console.log(`إجراء "${item.dataset.action}" على المريض: ${patientName}`);
        closeRowMenu();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeRowMenu();
    });
    window.addEventListener('scroll', closeRowMenu, true);
    window.addEventListener('resize', closeRowMenu);
  }

  // تبويبات صفحة ملف المريض
  const tabsBar = document.getElementById('tabsBar');
  if (tabsBar) {
    const tabButtons = tabsBar.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add('active');
      });
    });
  }

  // تعبئة بيانات المريض بصفحة الملف الشخصي حسب اسمه بالرابط (?name=...)
  const patientNameEl = document.getElementById('patientName');
  if (patientNameEl) {
    const patientsData = {
      'أحمد علي':   { age: 25, phone: '059xxxxxxx', lastVisit: '23/09/2026', initials: 'أع' },
      'سارة محمود': { age: 31, phone: '056xxxxxxx', lastVisit: '22/09/2026', initials: 'سم' },
      'عمر خالد':   { age: 42, phone: '059xxxxxxx', lastVisit: '20/09/2026', initials: 'عخ' },
      'لانا يوسف':  { age: 28, phone: '057xxxxxxx', lastVisit: '18/09/2026', initials: 'لي' }
    };

    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    // إذا الاسم موجود بقائمة العرض التوضيحية نستخدم بياناته، وإلا نعرض الاسم الممرَّر
    // فعليًا مع بيانات مؤقتة (بانتظار ربط قاعدة بيانات حقيقية)
    const data = (name && patientsData[name]) ? patientsData[name]
      : { age: '—', phone: '—', lastVisit: '—', initials: name ? name.trim().slice(0, 2) : 'أع' };
    const displayName = name || 'أحمد علي';

    document.getElementById('patientAvatar').textContent = data.initials;
    patientNameEl.textContent = displayName;
    document.getElementById('patientAge').textContent = data.age;
    document.getElementById('patientPhone').textContent = data.phone;
    document.getElementById('infoName').textContent = displayName;
    document.getElementById('infoAge').textContent = `${data.age} سنة`;
    document.getElementById('infoPhone').textContent = data.phone;
    document.getElementById('infoLastVisit').textContent = data.lastVisit;
  }

  // تعبئة صفحة تفاصيل الموعد حسب رقم الموعد بالرابط (?id=...)
  const detailPatientName = document.getElementById('detailPatientName');
  if (detailPatientName) {
    const id = Number(new URLSearchParams(window.location.search).get('id'));
    const appointments = getAppointments();
    const appt = appointments.find(a => a.id === id) || appointments[0];

    detailPatientName.textContent = appt.patientName;
    document.getElementById('detailPatientId').textContent = appt.patientId;
    document.getElementById('detailDate').textContent = formatDateDisplay(appt.date);
    document.getElementById('detailTime').textContent = formatTimeDisplay(appt.time);
    document.getElementById('detailService').textContent = appt.service;

    const statusEl = document.getElementById('detailStatus');
    statusEl.textContent = appt.status;
    statusEl.classList.remove('confirmed', 'waiting', 'cancelled', 'completed');
    statusEl.classList.add(statusClassOf(appt.status));

    document.getElementById('detailViewProfile').href = `patient-profile.html?name=${encodeURIComponent(appt.patientName)}`;

    const editBtn = document.getElementById('detailEditBtn');
    const completeBtn = document.getElementById('detailCompleteBtn');
    const cancelBtn = document.getElementById('detailCancelBtn');

    // مواعيد "مكتملة" أو "ملغاة" أصبحت نهائية — إخفاء إجراءات التعديل/الإنهاء/الإلغاء عليها
    if (appt.status === 'ملغى' || appt.status === 'مكتمل') {
      editBtn.hidden = true;
      completeBtn.hidden = true;
      cancelBtn.hidden = true;
    } else {
      // "تعديل الموعد" لسه بدون صفحة فعلية — عنصر نائب لمهمة لاحقة
      editBtn.addEventListener('click', () => {
        console.log(`تعديل الموعد رقم ${appt.id}`);
      });

      // "إنهاء الزيارة" — يسجّل حالة "مكتمل" فعلية بدل الاعتماد على مقارنة الوقت فقط
      completeBtn.addEventListener('click', () => {
        if (!window.confirm('هل تريد تسجيل هذا الموعد كزيارة مكتملة؟')) return;
        appt.status = 'مكتمل';
        saveAppointments(appointments.map(a => a.id === appt.id ? appt : a));
        window.location.href = 'appointments.html';
      });

      // "إلغاء الموعد" — يحدّث الحالة فعليًا، يحفظها بالمخزن، ويرجعك لصفحة المواعيد
      // (تختفي فورًا من "مواعيد اليوم" و"مواعيد الأسبوع"، وتبقى بجدول "كل المواعيد" بحالة "ملغى")
      cancelBtn.addEventListener('click', () => {
        if (!window.confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return;
        appt.status = 'ملغى';
        saveAppointments(appointments.map(a => a.id === appt.id ? appt : a));
        window.location.href = 'appointments.html';
      });
    }
  }

  // صفحة المواعيد: عرض مواعيد اليوم + الأسبوع + كل المواعيد
  const todayList = document.getElementById('todayList');
  if (todayList) {
    const appointments = getAppointments();

    // مواعيد اليوم (الملغاة والمكتملة لا تظهران بهذا العرض — تبقيان بجدول "كل المواعيد" فقط)
    const todays = appointments
      .filter(a => a.date === getTodayISO() && a.status !== 'ملغى' && a.status !== 'مكتمل')
      .sort((a, b) => a.time.localeCompare(b.time));

    todayList.innerHTML = todays.length
      ? todays.map(a => `
        <article class="appt-card">
          <span class="appt-card-time">${formatTimeDisplay(a.time)}</span>
          <span class="appt-card-name">${a.patientName}</span>
          <span class="appt-card-service">${a.service}</span>
          <span class="appt-card-status">الحالة: <strong class="chip ${statusClassOf(a.status)}">${a.status}</strong></span>
          <div class="appt-card-footer">
            <a class="btn-details" href="appointment-details.html?id=${a.id}">تفاصيل الموعد</a>
          </div>
        </article>
      `).join('')
      : '<p class="appt-empty-note">لا توجد مواعيد اليوم</p>';

    // مواعيد الأسبوع — كل يوم يعرض أقرب موعد له (إن وجد)
    const weekGrid = document.getElementById('weekGrid');
    if (weekGrid) {
      weekGrid.querySelectorAll('.week-day').forEach(dayEl => {
        const dayName = dayEl.dataset.weekday;
        const body = dayEl.querySelector('.week-day-body');
        const dayAppts = appointments
          .filter(a => weekdayNameAr(a.date) === dayName && a.status !== 'ملغى' && a.status !== 'مكتمل')
          .sort((a, b) => a.time.localeCompare(b.time));

        if (dayAppts.length === 0) {
          body.innerHTML = '<span class="week-day-empty">لا يوجد مواعيد</span>';
          return;
        }
        const first = dayAppts[0];
        const extra = dayAppts.length > 1 ? `<span class="week-day-time">+${dayAppts.length - 1} أخرى</span>` : '';
        body.innerHTML = `
          <span class="week-day-name">${first.patientName.split(' ')[0]}</span>
          <span class="week-day-time">${first.time}</span>
          ${extra}
          <a class="btn-details" href="appointment-details.html?id=${first.id}">تفاصيل</a>
        `;
      });
    }

    // كل المواعيد
    const allBody = document.getElementById('allAppointmentsBody');
    if (allBody) {
      const sorted = [...appointments].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      allBody.innerHTML = sorted.map(a => `
        <tr>
          <td>${a.patientName}</td>
          <td class="date-cell">${formatDateDisplay(a.date)}</td>
          <td class="date-cell">${formatTimeDisplay(a.time)}</td>
          <td>${a.service}</td>
          <td><span class="chip ${statusClassOf(a.status)}">${a.status}</span></td>
          <td class="actions-cell"><a class="link-btn" href="appointment-details.html?id=${a.id}">تفاصيل</a></td>
        </tr>
      `).join('');
    }
  }

  // نموذج إضافة موعد جديد
  const addForm = document.getElementById('addAppointmentForm');
  if (addForm) {
    const apptDateInput = document.getElementById('apptDate');
    const apptTimeInput = document.getElementById('apptTime');
    const apptPatientNameInput = document.getElementById('apptPatientName');
    const apptPatientsList = document.getElementById('patientNamesList');
    const formError = document.getElementById('formError');
    if (apptDateInput && !apptDateInput.value) apptDateInput.value = getTodayISO();

    // تعبئة قائمة الاقتراحات بأسماء المرضى الفعليين المسجّلين بصفحة المرضى فقط
    const registeredPatients = getPatients();
    if (apptPatientsList) {
      apptPatientsList.innerHTML = registeredPatients.map(p => `<option value="${p.name}">`).join('');
    }

    // تعبئة اسم المريض تلقائيًا لو جاي من "حجز موعد" بصفحة المرضى (?name=...)
    const prefillName = new URLSearchParams(window.location.search).get('name');
    if (prefillName && apptPatientNameInput && !apptPatientNameInput.value) {
      apptPatientNameInput.value = prefillName;
    }

    function showFormError(message) {
      formError.textContent = message;
      formError.hidden = false;
    }
    function hideFormError() {
      formError.hidden = true;
    }

    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideFormError();

      // لازم يكون المريض مسجّل فعليًا بصفحة المرضى — نفس القاعدة المطبّقة على التقارير
      const typedName = apptPatientNameInput.value.trim();
      const matchedPatient = registeredPatients.find(p => p.name === typedName);
      if (!matchedPatient) {
        showFormError('فشل الحجز — الرجاء اختيار مريض مسجّل فعليًا من قائمة المرضى');
        return;
      }

      const appointments = getAppointments();
      const date = apptDateInput.value;
      const time = apptTimeInput.value;

      // فحص تعارض المواعيد: نفس التاريخ والوقت لموعد غير ملغى وغير مكتمل
      const conflict = appointments.find(a => a.date === date && a.time === time && a.status !== 'ملغى' && a.status !== 'مكتمل');
      if (conflict) {
        showFormError(`فشل الحجز — يوجد تعارض في المواعيد: ${conflict.patientName} لديه موعد بنفس التاريخ والوقت`);
        return;
      }

      const newAppt = {
        id: nextAppointmentId(appointments),
        patientName: matchedPatient.name,
        patientId: patientRecordId(matchedPatient.id),
        date: date,
        time: time,
        service: document.getElementById('apptService').value,
        status: 'مؤكد',
        notes: document.getElementById('apptNotes').value.trim()
      };
      appointments.push(newAppt);
      saveAppointments(appointments);
      window.location.href = 'appointments.html';
    });
  }

  // نموذج تسجيل مريض جديد
  const addPatientForm = document.getElementById('addPatientForm');
  if (addPatientForm) {
    const patientFormError = document.getElementById('formError');

    addPatientForm.addEventListener('submit', (e) => {
      e.preventDefault();
      patientFormError.hidden = true;

      const patients = getPatients();
      const name = document.getElementById('newPatientName').value.trim();
      const phone = document.getElementById('newPatientPhone').value.trim();

      // منع تسجيل نفس المريض مرتين بنفس رقم الهاتف
      const duplicate = patients.find(p => p.phone === phone);
      if (duplicate) {
        patientFormError.textContent = `فشل التسجيل — رقم الهاتف مسجّل مسبقًا للمريض: ${duplicate.name}`;
        patientFormError.hidden = false;
        return;
      }

      const newPatient = {
        id: nextPatientId(patients),
        name: name,
        age: Number(document.getElementById('newPatientAge').value),
        phone: phone,
        lastVisit: '—',
        initials: initialsOf(name)
      };
      patients.push(newPatient);
      savePatients(patients);
      window.location.href = 'patients.html';
    });
  }

  // صفحة التقارير: عرض جدول كل التقارير
  const reportsTableBody = document.getElementById('reportsTableBody');
  if (reportsTableBody) {
    const reports = getReports();
    reportsTableBody.innerHTML = reports.length
      ? [...reports].reverse().map(r => `
        <tr>
          <td>${r.patientName}</td>
          <td>${r.reportType}</td>
          <td class="date-cell">${formatDateDisplay(r.visitDate)}</td>
          <td class="actions-cell"><a class="link-btn" href="report-details.html?id=${r.id}">عرض التفاصيل</a></td>
        </tr>
      `).join('')
      : `<tr><td colspan="4" style="text-align:center; padding:34px; color:var(--color-text-muted);">لا توجد تقارير بعد — اضغط "إنشاء تقرير" لإضافة أول تقرير</td></tr>`;
  }

  // نموذج إنشاء تقرير طبي — بحث حقيقي عن مريض موجود فعليًا بصفحة المرضى
  const createReportForm = document.getElementById('createReportForm');
  if (createReportForm) {
    const reportPatientSearch = document.getElementById('reportPatientSearch');
    const reportPatientsList = document.getElementById('reportPatientsList');
    const reportPatientInfo = document.getElementById('reportPatientInfo');
    const reportFormError = document.getElementById('formError');
    const patients = getPatients();

    // تعبئة قائمة الاقتراحات بأسماء المرضى الحقيقيين
    reportPatientsList.innerHTML = patients.map(p => `<option value="${p.name}">`).join('');

    function findMatchingPatient() {
      const typed = reportPatientSearch.value.trim();
      return patients.find(p => p.name === typed) || null;
    }

    function syncPatientInfoBox() {
      const match = findMatchingPatient();
      if (match) {
        document.getElementById('infoPatientName').textContent = match.name;
        document.getElementById('infoPatientId').textContent = patientRecordId(match.id);
        document.getElementById('infoVisitDate').textContent = formatDateDisplay(getTodayISO());
        reportPatientInfo.hidden = false;
      } else {
        reportPatientInfo.hidden = true;
      }
    }

    reportPatientSearch.addEventListener('input', syncPatientInfoBox);
    reportPatientSearch.addEventListener('change', syncPatientInfoBox);

    createReportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      reportFormError.hidden = true;

      const match = findMatchingPatient();
      if (!match) {
        reportFormError.textContent = 'فشل الحفظ — الرجاء اختيار مريض مسجّل فعليًا من قائمة المرضى';
        reportFormError.hidden = false;
        return;
      }

      const reports = getReports();
      const newReport = {
        id: nextReportId(reports),
        patientName: match.name,
        patientId: patientRecordId(match.id),
        visitDate: getTodayISO(),
        reportType: document.getElementById('reportType').value,
        diagnosis: document.getElementById('reportDiagnosis').value.trim(),
        symptoms: document.getElementById('reportSymptoms').value.trim(),
        treatment: document.getElementById('reportTreatment').value.trim(),
        notes: document.getElementById('reportNotes').value.trim()
      };
      reports.push(newReport);
      saveReports(reports);
      window.location.href = 'reports.html';
    });
  }

  // صفحة تفاصيل التقرير
  const reportPatientNameEl = document.getElementById('reportPatientName');
  if (reportPatientNameEl) {
    const id = Number(new URLSearchParams(window.location.search).get('id'));
    const reports = getReports();
    const report = reports.find(r => r.id === id);

    if (report) {
      reportPatientNameEl.textContent = report.patientName;
      document.getElementById('reportPatientId').textContent = report.patientId;
      document.getElementById('reportVisitDate').textContent = formatDateDisplay(report.visitDate);
      document.getElementById('reportTypeBadge').textContent = report.reportType;
      document.getElementById('reportDiagnosisText').textContent = report.diagnosis || 'لا يوجد';
      document.getElementById('reportSymptomsText').textContent = report.symptoms || 'لا يوجد';
      document.getElementById('reportTreatmentText').textContent = report.treatment || 'لا يوجد';
      document.getElementById('reportNotesText').textContent = report.notes || 'لا يوجد';
    }

    const printBtn = document.getElementById('printReportBtn');
    if (printBtn) printBtn.addEventListener('click', () => window.print());
  }

  // ============ صفحة التوفر (Availability) ============
  const weeklyScheduleBody = document.getElementById('weeklyScheduleBody');
  if (weeklyScheduleBody) {
    const dayOptionsHtml = WEEK_DAYS_ORDER.map(d => `<option value="${d}">${d}</option>`).join('');

    function renderWeeklyTable() {
      const availability = getAvailability();
      weeklyScheduleBody.innerHTML = WEEK_DAYS_ORDER.map(day => {
        const info = availability.weeklySchedule[day];
        const statusChip = info.enabled
          ? '<span class="chip confirmed">مفعّل</span>'
          : '<span class="chip cancelled">معطّل</span>';
        const timesText = (info.enabled && info.slots.length)
          ? info.slots.map(s => `${s.start} - ${s.end}`).join('، ')
          : '—';
        const actionCell = info.enabled
          ? ''
          : `<button class="link-btn" data-enable-day="${day}">تفعيل</button>`;
        return `
          <tr>
            <td>${day}</td>
            <td>${statusChip}</td>
            <td>${timesText}</td>
            <td class="actions-cell">${actionCell}</td>
          </tr>
        `;
      }).join('');
    }

    function renderExceptionsTable() {
      const availability = getAvailability();
      const body = document.getElementById('exceptionsBody');
      body.innerHTML = availability.exceptions.length
        ? availability.exceptions.map((ex, idx) => {
            const typeChip = ex.type === 'holiday'
              ? '<span class="chip cancelled">إجازة</span>'
              : '<span class="chip waiting">ساعات مخصصة</span>';
            const details = ex.type === 'holiday' ? 'عطلة كاملة لهذا اليوم' : `${ex.start} - ${ex.end}`;
            return `
              <tr>
                <td class="date-cell">${formatDateDisplay(ex.date)}</td>
                <td>${typeChip}</td>
                <td>${details}</td>
                <td class="actions-cell"><button class="link-btn" data-remove-exception="${idx}">حذف</button></td>
              </tr>
            `;
          }).join('')
        : `<tr><td colspan="4" style="text-align:center; padding:24px; color:var(--color-text-muted);">لا توجد استثناءات مضافة</td></tr>`;
    }

    function showAvailabilityMsg(el, message, isError = true) {
      el.textContent = message;
      el.hidden = false;
      el.className = isError ? 'form-error' : 'form-success';
    }

    // تعبئة قوائم اختيار الأيام (تخص أوقات العمل الأسبوعية المتكررة فقط)
    ['addSlotDay', 'editSlotDay'].forEach(id => {
      const sel = document.getElementById(id);
      if (sel) sel.innerHTML = dayOptionsHtml;
    });

    renderWeeklyTable();
    renderExceptionsTable();

    // تفعيل يوم مباشرة من الجدول
    weeklyScheduleBody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-enable-day]');
      if (!btn) return;
      const availability = getAvailability();
      availability.weeklySchedule[btn.dataset.enableDay].enabled = true;
      saveAvailability(availability);
      renderWeeklyTable();
    });

    // حذف استثناء
    document.getElementById('exceptionsBody').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-exception]');
      if (!btn) return;
      const availability = getAvailability();
      availability.exceptions.splice(Number(btn.dataset.removeException), 1);
      saveAvailability(availability);
      renderExceptionsTable();
    });

    // فتح/إغلاق اللوحات المنبثقة تحت كل زر إجراء
    function wireToggle(btnId, panelId) {
      const btn = document.getElementById(btnId);
      const panel = document.getElementById(panelId);
      if (btn && panel) btn.addEventListener('click', () => { panel.hidden = !panel.hidden; });
    }
    wireToggle('toggleAddSlotBtn', 'addSlotPanel');
    wireToggle('toggleEditSlotBtn', 'editSlotPanel');
    wireToggle('toggleDisableDayBtn', 'disableDayPanel');
    wireToggle('toggleCustomHoursBtn', 'customHoursPanel');

    // ➕ إضافة وقت متاح
    const confirmAddSlotBtn = document.getElementById('confirmAddSlotBtn');
    confirmAddSlotBtn.addEventListener('click', () => {
      const day = document.getElementById('addSlotDay').value;
      const start = document.getElementById('addSlotStart').value;
      const end = document.getElementById('addSlotEnd').value;
      const msg = document.getElementById('addSlotMsg');

      if (!start || !end) { showAvailabilityMsg(msg, 'الرجاء تحديد وقت البداية والنهاية'); return; }
      if (start >= end) { showAvailabilityMsg(msg, 'وقت البداية يجب أن يكون قبل وقت النهاية'); return; }

      const availability = getAvailability();
      const dayInfo = availability.weeklySchedule[day];
      dayInfo.slots.push({ id: nextSlotId(dayInfo.slots), start, end });
      dayInfo.enabled = true;
      saveAvailability(availability);

      renderWeeklyTable();
      showAvailabilityMsg(msg, `تمت إضافة الوقت ${start} - ${end} ليوم ${day}`, false);
      document.getElementById('addSlotStart').value = '';
      document.getElementById('addSlotEnd').value = '';
    });

    // ✏️ تعديل أوقات العمل
    const editSlotDay = document.getElementById('editSlotDay');
    const editSlotSelect = document.getElementById('editSlotSelect');
    function refreshEditSlotOptions() {
      const availability = getAvailability();
      const slots = availability.weeklySchedule[editSlotDay.value].slots;
      editSlotSelect.innerHTML = slots.length
        ? slots.map(s => `<option value="${s.id}">${s.start} - ${s.end}</option>`).join('')
        : '<option value="">لا توجد أوقات مضافة لهذا اليوم</option>';
    }
    refreshEditSlotOptions();
    editSlotDay.addEventListener('change', refreshEditSlotOptions);

    document.getElementById('confirmEditSlotBtn').addEventListener('click', () => {
      const day = editSlotDay.value;
      const slotId = Number(editSlotSelect.value);
      const start = document.getElementById('editSlotStart').value;
      const end = document.getElementById('editSlotEnd').value;
      const msg = document.getElementById('editSlotMsg');

      if (!slotId) { showAvailabilityMsg(msg, 'لا يوجد وقت لتعديله بهذا اليوم — استخدم "إضافة وقت متاح"'); return; }
      if (!start || !end) { showAvailabilityMsg(msg, 'الرجاء تحديد وقت البداية والنهاية'); return; }
      if (start >= end) { showAvailabilityMsg(msg, 'وقت البداية يجب أن يكون قبل وقت النهاية'); return; }

      const availability = getAvailability();
      const slot = availability.weeklySchedule[day].slots.find(s => s.id === slotId);
      if (slot) { slot.start = start; slot.end = end; }
      saveAvailability(availability);

      renderWeeklyTable();
      refreshEditSlotOptions();
      showAvailabilityMsg(msg, 'تم حفظ التعديل بنجاح', false);
    });

    // 🚫 تعطيل يوم / إجازة — مرتبط بتاريخ فعلي محدد (وليس بيوم أسبوعي متكرر)
    // يلغي كل مواعيد ذلك التاريخ بالتحديد ويسجّله كاستثناء إجازة
    document.getElementById('confirmDisableDayBtn').addEventListener('click', () => {
      const dateVal = document.getElementById('disableDate').value;
      const msg = document.getElementById('disableDayMsg');
      if (!dateVal) { showAvailabilityMsg(msg, 'الرجاء اختيار تاريخ'); return; }

      const availability = getAvailability();
      if (availability.exceptions.some(ex => ex.date === dateVal)) {
        showAvailabilityMsg(msg, 'يوجد استثناء مسجّل مسبقًا لهذا التاريخ');
        return;
      }

      const weekdayName = weekdayNameAr(dateVal);
      if (!window.confirm(`هل أنت متأكد من تعطيل تاريخ ${formatDateDisplay(dateVal)} (${weekdayName})؟ سيتم إلغاء كل المواعيد بهذا التاريخ.`)) return;

      availability.exceptions.push({ date: dateVal, type: 'holiday' });
      saveAvailability(availability);

      const appointments = getAppointments();
      let cancelledCount = 0;
      appointments.forEach(a => {
        if (a.date === dateVal && a.status !== 'ملغى' && a.status !== 'مكتمل') {
          a.status = 'ملغى';
          cancelledCount++;
        }
      });
      saveAppointments(appointments);

      renderExceptionsTable();
      showAvailabilityMsg(msg, `تم تعطيل تاريخ ${formatDateDisplay(dateVal)} (${weekdayName}) وإلغاء ${cancelledCount} موعد — ستظهر ملغاة بصفحة المواعيد`, false);
      document.getElementById('disableDate').value = '';
    });

    // 📌 تغيير ساعات يوم محدد — استثناء بدون إلغاء مواعيد
    document.getElementById('confirmCustomHoursBtn').addEventListener('click', () => {
      const dateVal = document.getElementById('customHoursDate').value;
      const start = document.getElementById('customHoursStart').value;
      const end = document.getElementById('customHoursEnd').value;
      const msg = document.getElementById('customHoursMsg');

      if (!dateVal || !start || !end) { showAvailabilityMsg(msg, 'الرجاء تعبئة التاريخ ووقت البداية والنهاية'); return; }
      if (start >= end) { showAvailabilityMsg(msg, 'وقت البداية يجب أن يكون قبل وقت النهاية'); return; }

      const availability = getAvailability();
      const existingIdx = availability.exceptions.findIndex(ex => ex.date === dateVal);
      const newException = { date: dateVal, type: 'custom-hours', start, end };
      if (existingIdx > -1) availability.exceptions[existingIdx] = newException;
      else availability.exceptions.push(newException);
      saveAvailability(availability);

      renderExceptionsTable();
      showAvailabilityMsg(msg, `تم حفظ ساعات مخصصة ليوم ${formatDateDisplay(dateVal)}`, false);
    });
  }

  // الصفحة الرئيسية: إحصائيات حقيقية من مخزن المواعيد والمرضى + تاريخ اليوم الفعلي
  const statTodayAppointments = document.getElementById('statTodayAppointments');
  if (statTodayAppointments) {
    const todayDateText = document.getElementById('todayDateText');
    if (todayDateText) {
      const arDateFormatter = new Intl.DateTimeFormat('ar', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', calendar: 'gregory'
      });
      todayDateText.textContent = arDateFormatter.format(new Date());
    }

    const appointments = getAppointments();
    const patients = getPatients();
    const todayISO = getTodayISO();
    const todaysAppts = appointments.filter(a => a.date === todayISO && a.status !== 'ملغى');

    statTodayAppointments.textContent = todaysAppts.length;
    document.getElementById('statTotalPatients').textContent = patients.length;
    document.getElementById('statWaitingToday').textContent = todaysAppts.filter(a => a.status === 'انتظار').length;

    // "مكتملة اليوم" — تُحسب الآن من حالة "مكتمل" الحقيقية
    // (تُسجَّل يدويًا بزر "إنهاء الزيارة" بصفحة تفاصيل الموعد)
    document.getElementById('statCompletedToday').textContent = todaysAppts.filter(a => a.status === 'مكتمل').length;

    // لوحة "مواعيد اليوم" — مواعيد حقيقية من نفس مخزن appointments.html
    const apptList = document.getElementById('apptList');
    if (apptList) {
      // القائمة تعرض المواعيد النشطة فقط — المكتملة تختفي منها متل الملغاة تمامًا
      const sortedToday = todaysAppts
        .filter(a => a.status !== 'مكتمل')
        .sort((a, b) => a.time.localeCompare(b.time));
      apptList.innerHTML = sortedToday.length
        ? sortedToday.map(a => `
          <a class="appt-row" href="appointment-details.html?id=${a.id}">
            <span class="appt-time">${formatTimeDisplay(a.time)}</span>
            <div class="appt-avatar">${initialsOf(a.patientName)}</div>
            <div class="appt-info"><strong>${a.patientName}</strong><span>${a.service}</span></div>
            <span class="chip ${statusClassOf(a.status)}">${a.status}</span>
          </a>
        `).join('')
        : '<p class="appt-empty-note">لا توجد مواعيد اليوم</p>';
    }

    // لوحة "المرضى الأخيرون" — أحدث المرضى المسجّلين فعليًا بصفحة المرضى
    const recentPatientsList = document.getElementById('recentPatientsList');
    if (recentPatientsList) {
      const recent = [...patients].slice(-4).reverse();
      recentPatientsList.innerHTML = recent.length
        ? recent.map(p => `
          <div class="patient-row">
            <div class="appt-avatar">${p.initials}</div>
            <div class="waiting-info"><strong>${p.name}</strong><span>آخر زيارة: ${p.lastVisit === '—' ? 'لا يوجد بعد' : p.lastVisit}</span></div>
            <a href="patient-profile.html?name=${encodeURIComponent(p.name)}" class="link-btn">عرض الملف</a>
          </div>
        `).join('')
        : '<p class="empty-state">لا يوجد مرضى مسجّلون بعد</p>';
    }
  }

});
