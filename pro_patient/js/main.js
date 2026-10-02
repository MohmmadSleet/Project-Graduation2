/* =========================================================
   Shared JavaScript - all pages
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {

  /* ---- back buttons ---- */
  document.querySelectorAll('[data-back]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (document.referrer) { history.back(); }
      else { window.location.href = 'index.html'; }
    });
  });

  /* ---- selectable groups (days / slots / chips / cards) ---- */
  document.querySelectorAll('[data-select-group]').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var item = e.target.closest('[data-select]');
      if (!item || item.classList.contains('disabled')) return;
      group.querySelectorAll('[data-select]').forEach(function (i) {
        i.classList.remove('active', 'selected');
      });
      item.classList.add('active', 'selected');
      document.dispatchEvent(new CustomEvent('selection:changed'));
    });
  });

  /* ---- tabs (e.g. my appointments) ---- */
  document.querySelectorAll('[data-tab-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.dataset.tabTarget;
      document.querySelectorAll('[data-tab-target]').forEach(function (b) {
        var on = (b === btn);
        b.classList.toggle('btn-primary', on);
        b.classList.toggle('btn-blue-soft', !on);
      });
      document.querySelectorAll('[data-tab-pane]').forEach(function (pane) {
        pane.classList.toggle('d-none', pane.dataset.tabPane !== target);
      });
    });
  });

  /* ---- booking page: live summary button ---- */
  var summaryBtn = document.querySelector('[data-summary]');
  if (summaryBtn) {
    var updateSummary = function () {
      var day = document.querySelector('[data-days] .day-item.selected');
      var slot = document.querySelector('[data-slots] .slot.selected');
      if (day && slot) {
        summaryBtn.textContent = 'متابعة - ' + day.dataset.dayFull + '، ' + slot.textContent.trim();
      }
    };
    document.addEventListener('selection:changed', updateSummary);
    updateSummary();
  }

  /* ---- search page: live filter + empty state ---- */
  var searchInput = document.querySelector('[data-search-input]');
  if (searchInput) {
    var items = document.querySelectorAll('[data-doctor-item]');
    var empty = document.querySelector('[data-empty-state]');
    var countEl = document.querySelector('[data-results-count]');
    var run = function () {
      var q = searchInput.value.trim();
      var n = 0;
      items.forEach(function (it) {
        var show = !q || it.dataset.name.indexOf(q) !== -1;
        it.classList.toggle('d-none', !show);
        if (show) n++;
      });
      if (empty) empty.classList.toggle('d-none', n > 0);
      if (countEl) countEl.textContent = q ? n + ' نتيجة مطابقة لـ «' + q + '»' : '';
    };
    searchInput.addEventListener('input', run);
    run();
  }

  /* ---- toast helper ---- */
  var toastWrap = document.createElement('div');
  toastWrap.className = 'toast-container position-fixed bottom-0 start-50 translate-middle-x p-3';
  toastWrap.style.zIndex = 1080;
  document.body.appendChild(toastWrap);

  window.showToast = function (msg, ok) {
    var el = document.createElement('div');
    el.className = 'toast align-items-center text-white border-0';
    el.style.background = ok === false ? '#d64545' : '#1e6fe8';
    el.innerHTML = '<div class="d-flex"><div class="toast-body fw-bold">' + msg +
      '</div><button type="button" class="btn-close btn-close-white me-auto m-auto" data-bs-dismiss="toast"></button></div>';
    toastWrap.appendChild(el);
    var t = new bootstrap.Toast(el, { delay: 2200 });
    el.addEventListener('hidden.bs.toast', function () { el.remove(); });
    t.show();
  };

  document.querySelectorAll('[data-toast]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showToast(btn.dataset.toast, btn.dataset.toastOk !== 'false');
    });
  });

  /* ---- cancel appointment flow ---- */
  document.querySelectorAll('[data-cancel-confirm]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = new URLSearchParams(window.location.search).get('id') || btn.dataset.appointmentId;
      if (window.DentalStore && id) {
        try {
          DentalStore.updateAppointment(id, { status: 'ملغى' }, {
            label: 'إلغاء موعد',
            details: 'تم إلغاء الموعد رقم ' + id + ' من واجهة المريض.'
          });
        } catch (e) {
          showToast(e.message || 'تعذر إلغاء الموعد', false);
          return;
        }
      }
      showToast('تم إلغاء الموعد بنجاح');
      setTimeout(function () { window.location.href = 'appointments.html'; }, 900);
    });
  });
});



  // Mobile Menu Toggle
  const navbar = document.getElementById('navbar');
  const menuBtn = document.getElementById('menuBtn');

  if (menuBtn) {
    menuBtn.addEventListener('click', function() {
      navbar.classList.toggle('active');
    });
  }

  // <!--   لتفعيل التفاعل بالشرائح في صفحة الاطباء -->

    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', function() {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
      });
    });




/* =========================================================
   Shared patient data integration (booking + appointments)
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
  if (!window.DentalStore) return;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function currentPatient() {
    var current = DentalStore.getCurrentUser();
    if (current && current.role === 'patient') return current;
    return DentalStore.getUser('patient-1');
  }

  // Keep the booking calendar relative to the real current date.
  var daysWrap = document.querySelector('[data-days]');
  if (daysWrap) {
    var dayItems = daysWrap.querySelectorAll('.day-item');
    dayItems.forEach(function (item, index) {
      var d = new Date();
      d.setDate(d.getDate() + index);
      var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      var weekday = new Intl.DateTimeFormat('ar', { weekday: 'long' }).format(d);
      var full = new Intl.DateTimeFormat('ar', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
      item.dataset.date = iso;
      item.dataset.dayFull = full;
      var nameEl = item.querySelector('.d-name');
      var numEl = item.querySelector('.d-num');
      if (nameEl) nameEl.textContent = weekday;
      if (numEl) numEl.textContent = new Intl.NumberFormat('ar').format(d.getDate());
    });
  }

  // Save the selected day/time before moving to the confirmation page.
  var summaryLink = document.querySelector('[data-summary]');
  if (summaryLink) {
    var ensureSlot = function () {
      var selected = document.querySelector('.slot.selected:not(.disabled)');
      if (!selected) {
        selected = document.querySelector('.slot:not(.disabled)');
        if (selected) selected.classList.add('selected', 'active');
      }
      return selected;
    };
    var initialSlot = ensureSlot();
    var initialDay = document.querySelector('[data-days] .day-item.selected');
    if (initialSlot && initialDay) summaryLink.textContent = 'متابعة - ' + initialDay.dataset.dayFull + '، ' + initialSlot.textContent.trim();
    summaryLink.addEventListener('click', function () {
      var day = document.querySelector('[data-days] .day-item.selected');
      var slot = ensureSlot();
      if (!day || !slot) return;
      DentalStore.saveBookingDraft({
        date: day.dataset.date,
        dateLabel: day.dataset.dayFull,
        time: slot.textContent.trim(),
        doctorId: 'doctor-1',
        doctorName: 'د. محمد عبد الكريم',
        service: 'علاج لب الأسنان',
        clinic: 'نابلس - عيادة الحكيم'
      });
    });
  }

  // Confirmation page reads the booking draft and creates a real appointment record.
  var confirmBookingBtn = document.getElementById('confirmBookingBtn');
  if (confirmBookingBtn) {
    var draft = DentalStore.getBookingDraft() || {
      date: '2026-06-16', dateLabel: 'الثلاثاء ١٦ يونيو', time: '10:30',
      doctorId: 'doctor-1', doctorName: 'د. محمد عبد الكريم', service: 'علاج لب الأسنان'
    };
    var dateEl = document.getElementById('confirmBookingDate');
    var timeEl = document.getElementById('confirmBookingTime');
    if (dateEl) dateEl.textContent = draft.dateLabel + (draft.dateLabel.indexOf('٢٠٢٦') === -1 ? ' ٢٠٢٦' : '');
    if (timeEl) timeEl.textContent = draft.time;

    confirmBookingBtn.addEventListener('click', function () {
      var patient = currentPatient();
      if (!patient) { showToast('تعذر تحديد حساب المريض', false); return; }
      var conflict = DentalStore.getAppointments().find(function (a) {
        return a.doctorId === draft.doctorId && a.date === draft.date && a.time === draft.time && a.status !== 'ملغى';
      });
      if (conflict) { showToast('هذا الوقت محجوز مسبقًا، اختر وقتًا آخر', false); return; }
      DentalStore.createAppointment({
        patientId: patient.id,
        patientName: patient.name,
        doctorId: draft.doctorId,
        doctorName: draft.doctorName,
        date: draft.date,
        time: draft.time,
        service: draft.service,
        status: 'انتظار',
        notes: (document.getElementById('bookingNotes') || {}).value || '',
        createdBy: patient.id
      });
      DentalStore.clearBookingDraft();
      window.location.href = 'booking-success.html';
    });
  }

  // Patient appointments page is now generated from the shared appointments store.
  var upcomingList = document.getElementById('patientUpcomingAppointments');
  var pastList = document.getElementById('patientPastAppointments');
  if (upcomingList && pastList) {
    var patient = currentPatient();
    var today = DentalStore.todayISO();
    var all = DentalStore.getAppointments().filter(function (a) {
      return patient && (String(a.patientId) === String(patient.id) || a.patientName === patient.name);
    });
    var upcoming = all.filter(function (a) { return a.status !== 'ملغى' && a.status !== 'مكتمل' && a.date >= today; });
    var past = all.filter(function (a) { return a.status === 'ملغى' || a.status === 'مكتمل' || a.date < today; });

    function card(a) {
      var badge = a.status === 'مؤكد' ? 'green' : (a.status === 'انتظار' ? 'amber' : 'gray');
      return '<a href="appointment-details.html?id=' + encodeURIComponent(a.id) + '" class="soft-card d-flex align-items-center gap-3 p-3 text-decoration-none">' +
        '<span class="avatar-circle">' + esc((a.doctorName || 'طبيب').replace('د. ', '').slice(0,2)) + '</span>' +
        '<div class="flex-grow-1"><div class="fw-bold text-dark">' + esc(a.doctorName || 'الطبيب') + '</div>' +
        '<div class="text-muted-2 small">' + esc(a.service || 'موعد') + ' · ' + esc(a.date) + ' · ' + esc(a.time) + '</div></div>' +
        '<span class="badge-soft ' + badge + '">' + esc(a.status) + '</span></a>';
    }
    upcomingList.innerHTML = upcoming.length ? upcoming.map(card).join('') : '<div class="soft-card p-4 text-center text-muted-2">لا توجد مواعيد قادمة.</div>';
    pastList.innerHTML = past.length ? past.map(card).join('') : '<div class="soft-card p-4 text-center text-muted-2">لا يوجد سجل مواعيد سابق.</div>';

    var tabButtons = document.querySelectorAll('[data-tab-target]');
    if (tabButtons[0]) tabButtons[0].textContent = 'القادمة (' + upcoming.length + ')';
    if (tabButtons[1]) tabButtons[1].textContent = 'السجل (' + past.length + ')';
  }


  var cancelConfirmBtn = document.querySelector('[data-cancel-confirm]');
  if (cancelConfirmBtn) {
    var cancelId = new URLSearchParams(window.location.search).get('id');
    var cancelAppt = DentalStore.getAppointments().find(function (a) { return String(a.id) === String(cancelId); });
    var cancelText = document.querySelector('.text-center.py-5 .text-muted-2');
    if (cancelAppt && cancelText) cancelText.textContent = 'سيتم إلغاء موعدك مع ' + (cancelAppt.doctorName || 'الطبيب') + ' بتاريخ ' + cancelAppt.date + ' الساعة ' + cancelAppt.time + '، وسيظهر الإلغاء فورًا لدى الإدارة.';
  }

  // Patient appointment details page.
  var detailsBox = document.getElementById('patientAppointmentDetails');
  if (detailsBox) {
    var id = new URLSearchParams(window.location.search).get('id');
    var appt = DentalStore.getAppointments().find(function (a) { return String(a.id) === String(id); });
    if (!appt) {
      detailsBox.innerHTML = '<div class="text-center text-muted-2">الموعد غير موجود.</div>';
    } else {
      detailsBox.innerHTML = '<div class="d-flex flex-column gap-3">' +
        '<div><span class="text-muted-2">الطبيب</span><div class="fw-bold">' + esc(appt.doctorName || '—') + '</div></div>' +
        '<div><span class="text-muted-2">الخدمة</span><div class="fw-bold">' + esc(appt.service || '—') + '</div></div>' +
        '<div><span class="text-muted-2">التاريخ والوقت</span><div class="fw-bold">' + esc(appt.date) + ' · ' + esc(appt.time) + '</div></div>' +
        '<div><span class="text-muted-2">الحالة</span><div class="fw-bold">' + esc(appt.status) + '</div></div>' +
        (appt.status !== 'ملغى' && appt.status !== 'مكتمل' ? '<a class="btn btn-red-soft w-100 py-3 mt-2" href="cancel-appointment.html?id=' + encodeURIComponent(appt.id) + '">إلغاء الموعد</a>' : '') +
        '</div>';
    }
  }
});
