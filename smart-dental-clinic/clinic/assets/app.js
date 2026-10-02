
document.addEventListener('DOMContentLoaded', () => {
  const norm = v => (v || '').toString().trim().toLowerCase();

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  function toast(message){
    const el = document.getElementById('appToast');
    if(!el) return;
    const body = el.querySelector('.toast-body');
    if(body) body.textContent = message;
    bootstrap.Toast.getOrCreateInstance(el).show();
  }

  document.querySelectorAll('[data-toast]').forEach(btn => {
    btn.addEventListener('click', () => toast(btn.dataset.toast || 'تمت العملية تجريبياً'));
  });

  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', () => toast('تم تسجيل الخروج تجريبياً'));
  });

  document.querySelectorAll('[data-language]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-language]').forEach(x => x.classList.remove('active'));
      document.querySelectorAll(`[data-language="${btn.dataset.language}"]`).forEach(x => x.classList.add('active'));
      toast(btn.dataset.language === 'en'
        ? 'تم اختيار English — سيتم ربط الترجمة الكاملة لاحقاً.'
        : 'تم اختيار العربية.');
    });
  });

  // Appointment filtering
  const appointmentSearch = document.getElementById('appointmentSearch');
  const appointmentItems = [...document.querySelectorAll('.appointment-item')];
  const appointmentButtons = [...document.querySelectorAll('[data-appointment-filter]')];
  const appointmentCount = document.getElementById('appointmentCount');
  const appointmentEmpty = document.getElementById('appointmentEmpty');
  let appointmentFilter = 'all';

  function filterAppointments(){
    if(!appointmentItems.length) return;
    const q = norm(appointmentSearch?.value);
    let visible = 0;

    appointmentItems.forEach(item => {
      const status = item.dataset.status;
      const search = norm(item.dataset.search);
      let statusMatch = false;

      if(appointmentFilter === 'all') statusMatch = true;
      else if(appointmentFilter === 'pending') statusMatch = status === 'pending';
      else if(appointmentFilter === 'confirmed') statusMatch = status === 'confirmed';
      else if(appointmentFilter === 'reschedule') statusMatch = status === 'reschedule';
      else if(appointmentFilter === 'completed') statusMatch = status === 'completed';
      else if(appointmentFilter === 'closed') statusMatch = ['cancelled','rejected'].includes(status);

      const show = statusMatch && (!q || search.includes(q));
      item.classList.toggle('d-none', !show);
      if(show) visible++;
    });

    if(appointmentCount) appointmentCount.textContent = `${visible} موعد`;
    appointmentEmpty?.classList.toggle('d-none', visible !== 0);
  }

  appointmentButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      appointmentButtons.forEach(x => {
        x.classList.remove('btn-primary','active');
        x.classList.add('btn-light');
      });
      btn.classList.remove('btn-light');
      btn.classList.add('btn-primary','active');
      appointmentFilter = btn.dataset.appointmentFilter || 'all';
      filterAppointments();
    });
  });
  appointmentSearch?.addEventListener('input', filterAppointments);

  // Doctor filtering
  const doctorSearch = document.getElementById('doctorSearch');
  const doctorSpecialty = document.getElementById('doctorSpecialty');
  const doctorAvailability = document.getElementById('doctorAvailability');
  const doctorItems = [...document.querySelectorAll('.doctor-item')];
  const doctorCount = document.getElementById('doctorCount');
  const doctorEmpty = document.getElementById('doctorEmpty');

  function filterDoctors(){
    if(!doctorItems.length) return;
    const q = norm(doctorSearch?.value);
    const specialty = doctorSpecialty?.value || 'all';
    const availability = doctorAvailability?.value || 'all';
    let visible = 0;

    doctorItems.forEach(item => {
      const show =
        (!q || norm(`${item.dataset.name} ${item.dataset.specialtyName}`).includes(q)) &&
        (specialty === 'all' || item.dataset.specialty === specialty) &&
        (availability === 'all' || item.dataset.availability === availability);

      item.classList.toggle('d-none', !show);
      if(show) visible++;
    });

    if(doctorCount) doctorCount.textContent = `${visible} طبيب`;
    doctorEmpty?.classList.toggle('d-none', visible !== 0);
  }

  doctorSearch?.addEventListener('input', filterDoctors);
  doctorSpecialty?.addEventListener('change', filterDoctors);
  doctorAvailability?.addEventListener('change', filterDoctors);
  document.getElementById('clearDoctorFilters')?.addEventListener('click', () => {
    if(doctorSearch) doctorSearch.value = '';
    if(doctorSpecialty) doctorSpecialty.value = 'all';
    if(doctorAvailability) doctorAvailability.value = 'all';
    filterDoctors();
  });

  // Services search/filter
  const serviceSearch = document.getElementById('serviceSearch');
  const serviceSpecialty = document.getElementById('serviceSpecialty');
  const serviceItems = [...document.querySelectorAll('.service-item')];

  function filterServices(){
    if(!serviceItems.length) return;
    const q = norm(serviceSearch?.value);
    const specialty = serviceSpecialty?.value || 'all';

    serviceItems.forEach(item => {
      const show =
        (!q || norm(`${item.dataset.name} ${item.dataset.specialtyName}`).includes(q)) &&
        (specialty === 'all' || item.dataset.specialty === specialty);
      item.classList.toggle('d-none', !show);
    });
  }
  serviceSearch?.addEventListener('input', filterServices);
  serviceSpecialty?.addEventListener('change', filterServices);
});


document.addEventListener('DOMContentLoaded', () => {
  // Simple invoice preview math
  const invoiceTotal = document.getElementById('newInvoiceTotal');
  const invoicePaid = document.getElementById('newInvoicePaid');
  const invoiceRemaining = document.getElementById('newInvoiceRemaining');

  function updateInvoiceRemaining(){
    if(!invoiceTotal || !invoicePaid || !invoiceRemaining) return;
    const total = parseFloat((invoiceTotal.value || '').replace(/[^\d.]/g,'')) || 0;
    const paid = parseFloat((invoicePaid.value || '').replace(/[^\d.]/g,'')) || 0;
    invoiceRemaining.value = `${Math.max(total - paid, 0)} ₪`;
  }
  invoiceTotal?.addEventListener('input', updateInvoiceRemaining);
  invoicePaid?.addEventListener('input', updateInvoiceRemaining);
  updateInvoiceRemaining();

  // Patients filtering
  const patientSearch = document.getElementById('patientSearch');
  const patientItems = [...document.querySelectorAll('.patient-item')];
  const patientCount = document.getElementById('patientCount');
  const patientEmpty = document.getElementById('patientEmpty');

  function filterPatients(){
    if(!patientItems.length) return;
    const q = (patientSearch?.value || '').trim().toLowerCase();
    let visible = 0;
    patientItems.forEach(item => {
      const hay = (item.dataset.search || '').toLowerCase();
      const show = !q || hay.includes(q);
      item.classList.toggle('d-none', !show);
      if(show) visible++;
    });
    if(patientCount) patientCount.textContent = `${visible} مريض`;
    patientEmpty?.classList.toggle('d-none', visible !== 0);
  }
  patientSearch?.addEventListener('input', filterPatients);

  // Jobs filtering
  const jobSearch = document.getElementById('jobSearch');
  const jobStatus = document.getElementById('jobStatus');
  const jobItems = [...document.querySelectorAll('.job-item')];

  function filterJobs(){
    if(!jobItems.length) return;
    const q = (jobSearch?.value || '').trim().toLowerCase();
    const status = jobStatus?.value || 'all';
    jobItems.forEach(item => {
      const hay = (item.dataset.search || '').toLowerCase();
      const show = (!q || hay.includes(q)) && (status === 'all' || item.dataset.status === status);
      item.classList.toggle('d-none', !show);
    });
  }
  jobSearch?.addEventListener('input', filterJobs);
  jobStatus?.addEventListener('change', filterJobs);
});


document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-day-row]').forEach(row => {
    const toggle = row.querySelector('.day-available');
    const times = row.querySelectorAll('.day-time');
    const label = row.querySelector('.form-check-label');

    function syncDayAvailability(){
      const enabled = !!toggle?.checked;
      times.forEach(input => input.disabled = !enabled);
      if(label) label.textContent = enabled ? 'متاح' : 'غير متاح';
    }

    toggle?.addEventListener('change', syncDayAvailability);
    syncDayAvailability();
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const total = document.getElementById('checkoutInvoiceTotal');
  const paid = document.getElementById('checkoutInvoicePaid');
  const remaining = document.getElementById('checkoutInvoiceRemaining');
  const createBtn = document.getElementById('createCheckoutInvoice');

  function syncCheckoutInvoice(){
    if(!total || !paid || !remaining) return;
    const t = parseFloat(total.value) || 0;
    const p = parseFloat(paid.value) || 0;
    remaining.value = `${Math.max(t - p, 0)} ₪`;
  }

  total?.addEventListener('input', syncCheckoutInvoice);
  paid?.addEventListener('input', syncCheckoutInvoice);
  syncCheckoutInvoice();

  createBtn?.addEventListener('click', () => {
    const t = parseFloat(total?.value) || 0;
    const p = parseFloat(paid?.value) || 0;
    const r = Math.max(t - p, 0);

    document.getElementById('checkoutInvoiceEmpty')?.classList.add('d-none');
    document.getElementById('checkoutInvoiceCreated')?.classList.remove('d-none');

    const status = document.getElementById('checkoutInvoiceStatus');
    if(status){
      status.className = 'badge text-bg-success';
      status.textContent = 'تم إنشاؤها';
    }

    const paidDisplay = document.getElementById('checkoutPaidDisplay');
    const remainingDisplay = document.getElementById('checkoutRemainingDisplay');
    if(paidDisplay) paidDisplay.textContent = `${p} ₪`;
    if(remainingDisplay) remainingDisplay.textContent = `${r} ₪`;

    const step = document.getElementById('invoiceStep');
    const stepText = document.getElementById('invoiceStepText');
    if(step){
      step.classList.remove('pending');
      step.classList.add('complete');
      const icon = step.querySelector('.checkout-step-icon');
      if(icon) icon.innerHTML = '<i class="bi bi-check-lg"></i>';
    }
    if(stepText) stepText.textContent = 'تم إنشاء الفاتورة';

    const toastEl = document.getElementById('appToast');
    if(toastEl){
      const body = toastEl.querySelector('.toast-body');
      if(body) body.textContent = 'تم إنشاء الفاتورة وربطها بالزيارة تجريبياً';
      bootstrap.Toast.getOrCreateInstance(toastEl).show();
    }
  });
});


document.addEventListener('DOMContentLoaded', () => {
  // Doctor weekly schedule availability
  document.querySelectorAll('[data-doctor-day]').forEach(row => {
    const toggle = row.querySelector('.doctor-day-toggle');
    const inputs = row.querySelectorAll('.doctor-day-input');

    function sync(){
      const enabled = !!toggle?.checked;
      inputs.forEach(input => input.disabled = !enabled);
    }
    toggle?.addEventListener('change', sync);
    sync();
  });

  // Invoice search/filter
  const invoiceSearch = document.getElementById('invoiceSearch');
  const invoiceStatus = document.getElementById('invoiceStatusFilter');
  const invoiceItems = [...document.querySelectorAll('.invoice-filter-item')];
  const invoiceCount = document.getElementById('invoiceResultCount');
  const invoiceEmpty = document.getElementById('invoiceEmptyState');

  function filterInvoices(){
    if(!invoiceItems.length) return;
    const q = (invoiceSearch?.value || '').trim().toLowerCase();
    const status = invoiceStatus?.value || 'all';
    let visible = 0;

    invoiceItems.forEach(item => {
      const hay = (item.dataset.search || '').toLowerCase();
      const show = (!q || hay.includes(q)) && (status === 'all' || item.dataset.status === status);
      item.classList.toggle('d-none', !show);
      if(show) visible++;
    });

    if(invoiceCount) invoiceCount.textContent = `${visible} ${visible === 1 ? 'فاتورة' : 'فواتير'}`;
    invoiceEmpty?.classList.toggle('d-none', visible !== 0);
  }

  invoiceSearch?.addEventListener('input', filterInvoices);
  invoiceStatus?.addEventListener('change', filterInvoices);

  // Clinic appointment slot selection
  document.querySelectorAll('.slot-grid .time-slot.available').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.slot-grid .time-slot.available').forEach(x => x.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });



  // Validate Clinic-created appointment before showing success.
  document.getElementById('saveClinicAppointmentBtn')?.addEventListener('click',()=>{
    const patient=document.getElementById('clinicBookingPatient')?.value;
    const doctor=document.getElementById('clinicBookingDoctor')?.value;
    const service=document.getElementById('clinicBookingService')?.value;
    const date=document.getElementById('clinicBookingDate')?.value;
    const slot=document.querySelector('.slot-grid .time-slot.available.selected');
    if(!patient||!doctor||!service||!date||!slot){toast('اختر المريض والطبيب والخدمة والتاريخ ووقتًا متاحًا قبل حفظ الموعد.','danger');return;}
    const result=document.getElementById('clinicBookingResult');if(result){result.classList.remove('d-none');result.innerHTML=`<i class="bi bi-check-circle ms-1"></i><strong>تم تجهيز الموعد التجريبي.</strong> ${date} • ${slot.textContent.trim()} — سيقوم Laravel بالتحقق مرة أخرى من توفر الـSlot قبل الحفظ.`;}
    toast('تم إنشاء الموعد من العيادة تجريبيًا.','success');
  });
  ['clinicBookingDoctor','clinicBookingDate'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>document.querySelectorAll('.slot-grid .time-slot.available').forEach(x=>x.classList.remove('selected'))));

  // Prefill appointment page from query params (e.g. follow-up from visit checkout)
  const bookingType = document.getElementById('clinicBookingType');
  const patientSelect = document.getElementById('clinicBookingPatient');

  if(bookingType || patientSelect){
    const params = new URLSearchParams(window.location.search);
    const patient = params.get('patient');
    const type = params.get('type');

    if(patientSelect && patient && [...patientSelect.options].some(o => o.value === patient)){
      patientSelect.value = patient;
    }
    if(bookingType && type && [...bookingType.options].some(o => o.value === type)){
      bookingType.value = type;
    }
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const recallSearch = document.getElementById('recallSearch');
  const recallStatus = document.getElementById('recallStatusFilter');
  const recallItems = [...document.querySelectorAll('.recall-item')];
  const recallEmpty = document.getElementById('recallEmptyState');

  function filterRecalls(){
    if(!recallItems.length) return;
    const q = (recallSearch?.value || '').trim().toLowerCase();
    const status = recallStatus?.value || 'all';
    let visible = 0;

    recallItems.forEach(item => {
      const hay = (item.dataset.search || '').toLowerCase();
      const matches = (!q || hay.includes(q)) && (status === 'all' || item.dataset.status === status);
      item.classList.toggle('d-none', !matches);
      if(matches) visible++;
    });

    recallEmpty?.classList.toggle('d-none', visible !== 0);
  }

  recallSearch?.addEventListener('input', filterRecalls);
  recallStatus?.addEventListener('change', filterRecalls);
});


// ===== Clinic v9 interactions =====
document.addEventListener('DOMContentLoaded', () => {
  const recallBtns=[...document.querySelectorAll('.recall-filter-btn')];
  const recallCards=[...document.querySelectorAll('.recall-card-v9')];
  const recallSearch=document.getElementById('recallSearchV9');
  const recallEmpty=document.getElementById('recallEmptyV9');
  let recallStatus='all';
  function runRecallV9(){
    if(!recallCards.length)return;
    const q=(recallSearch?.value||'').trim().toLowerCase();let count=0;
    recallCards.forEach(card=>{const show=(recallStatus==='all'||card.dataset.status===recallStatus)&&(!q||(card.dataset.search||'').toLowerCase().includes(q));card.classList.toggle('d-none',!show);if(show)count++;});
    recallEmpty?.classList.toggle('d-none',count!==0);
  }
  recallBtns.forEach(btn=>btn.addEventListener('click',()=>{recallStatus=btn.dataset.recallStatus||'all';recallBtns.forEach(x=>{x.classList.remove('btn-primary','active');x.classList.add('btn-light')});btn.classList.remove('btn-light');btn.classList.add('btn-primary','active');runRecallV9()}));
  recallSearch?.addEventListener('input',runRecallV9);

  function labBadgeClass(status){if(status==='تم الاستلام')return 'badge text-bg-success';if(status==='تم التركيب للمريض')return 'badge text-bg-primary';return 'badge text-bg-info'}
  document.querySelectorAll('[data-lab-status-select]').forEach(select=>{const badge=select.parentElement?.querySelector('[data-lab-status-badge]');const sync=()=>{if(!badge)return;badge.textContent=select.value;badge.className=labBadgeClass(select.value);badge.setAttribute('data-lab-status-badge','')};select.addEventListener('change',sync);sync()});

  const invAdd=document.getElementById('inventoryAddBtn'), invSave=document.getElementById('inventorySaveBtn');
  const invTitle=document.getElementById('inventoryModalTitle'), invId=document.getElementById('inventoryEditId'), invName=document.getElementById('inventoryName'), invCategory=document.getElementById('inventoryCategory'), invQty=document.getElementById('inventoryQty'), invUnit=document.getElementById('inventoryUnit'), invThreshold=document.getElementById('inventoryThreshold');
  function showToast(msg){const el=document.getElementById('appToast');if(!el)return;const b=el.querySelector('.toast-body');if(b)b.textContent=msg;bootstrap.Toast.getOrCreateInstance(el).show()}
  document.querySelectorAll('[data-inventory-edit]').forEach(btn=>btn.addEventListener('click',()=>{const r=btn.closest('[data-inventory-row]');if(!r)return;if(invTitle)invTitle.textContent='تعديل مادة';if(invId)invId.value=r.dataset.id||'';if(invName)invName.value=r.dataset.name||'';if(invCategory)invCategory.value=r.dataset.category||'';if(invQty)invQty.value=r.dataset.qty||'';if(invUnit)invUnit.value=r.dataset.unit||'';if(invThreshold)invThreshold.value=r.dataset.threshold||'';}));
  document.querySelectorAll('[data-inventory-delete]').forEach(btn=>btn.addEventListener('click',()=>showToast('واجهة فقط: الحذف الفعلي سيتم من Laravel ولن تُعدّل بيانات HTML الثابتة.')));
  invAdd?.addEventListener('click',()=>{if(invTitle)invTitle.textContent='إضافة مادة';if(invId)invId.value='';if(invName)invName.value='';if(invCategory)invCategory.value='';if(invQty)invQty.value=invQty.defaultValue||'';if(invUnit)invUnit.value=invUnit.defaultValue||'';if(invThreshold)invThreshold.value=invThreshold.defaultValue||'';});
  invSave?.addEventListener('click',()=>{if(!invName?.value.trim()){showToast('اسم المادة مطلوب.');return;}const modal=document.getElementById('inventoryModal');if(modal)bootstrap.Modal.getOrCreateInstance(modal).hide();showToast('تم التحقق من النموذج فقط. حفظ بيانات المخزون سيكون عبر Laravel؛ بيانات العرض موجودة في HTML ولا يغيّرها JavaScript.');});

  const applicantSearch=document.getElementById('applicantSearch'), applicantFilter=document.getElementById('applicantStatusFilter'), applicantRows=[...document.querySelectorAll('.applicant-row')];
  function filterApplicants(){const q=(applicantSearch?.value||'').trim().toLowerCase(),s=applicantFilter?.value||'all';applicantRows.forEach(r=>r.classList.toggle('d-none',!((!q||(r.dataset.search||'').toLowerCase().includes(q))&&(s==='all'||r.dataset.status===s))))}
  applicantSearch?.addEventListener('input',filterApplicants);applicantFilter?.addEventListener('change',filterApplicants);
  document.querySelectorAll('[data-applicant-save]').forEach(btn=>btn.addEventListener('click',()=>{const row=btn.closest('.applicant-row'),sel=row?.querySelector('.applicant-status-select');if(row&&sel)row.dataset.status=sel.value;showToast('تم تحديث حالة طلب التوظيف تجريبياً');filterApplicants()}));

  const appSelect=document.getElementById('applicationStatusSelect'), appSave=document.getElementById('applicationStatusSave'), appBadge=document.getElementById('applicationStatusBadge');
  appSave?.addEventListener('click',()=>{const v=appSelect?.value||'review',map={review:['قيد المراجعة','badge text-bg-warning mb-2'],accepted:['مقبول','badge text-bg-success mb-2'],rejected:['مرفوض','badge text-bg-danger mb-2']};if(appBadge){appBadge.textContent=map[v][0];appBadge.className=map[v][1]}showToast('تم تحديث حالة الطلب تجريبياً')});
});


document.addEventListener('DOMContentLoaded',()=>{
  const norm=v=>(v||'').toString().trim().toLowerCase();
  const toast=(msg)=>{const el=document.getElementById('appToast');if(!el)return;const b=el.querySelector('.toast-body');if(b)b.textContent=msg;bootstrap.Toast.getOrCreateInstance(el).show();};
  const search=document.getElementById('staffSearch'),role=document.getElementById('staffRoleFilter'),status=document.getElementById('staffStatusFilter'),empty=document.getElementById('staffEmpty');
  const rows=()=>[...document.querySelectorAll('[data-staff-row]')];
  const roleSelect=document.getElementById('staffFormRole');
  const permissionLabel=(key)=>{const input=document.querySelector(`.staff-permissions-grid input[value="${CSS.escape(key)}"]`);return input?.closest('label')?.textContent.trim()||key;};
  const roleLabel=(key)=>roleSelect?.querySelector(`option[value="${CSS.escape(key)}"]`)?.textContent.trim()||key;
  const templatePermissions=(key)=>{const opt=roleSelect?.querySelector(`option[value="${CSS.escape(key)}"]`);return (opt?.dataset.templatePermissions||'').split(',').filter(Boolean);};
  const updateStats=()=>{const all=rows(),active=all.filter(r=>r.dataset.status==='active').length,susp=all.filter(r=>r.dataset.status==='suspended').length;const t=document.getElementById('staffTotal'),a=document.getElementById('staffActive'),su=document.getElementById('staffSuspended');if(t)t.textContent=all.length;if(a)a.textContent=active;if(su)su.textContent=susp;};
  const filter=()=>{if(!empty)return;const q=norm(search?.value),r=role?.value||'all',st=status?.value||'all';let n=0;rows().forEach(row=>{const ok=(!q||norm((row.dataset.search||'')+' '+row.textContent).includes(q))&&(r==='all'||row.dataset.role===r)&&(st==='all'||row.dataset.status===st);row.classList.toggle('d-none',!ok);if(ok)n++;});empty.classList.toggle('d-none',n!==0);};
  search?.addEventListener('input',filter);role?.addEventListener('change',filter);status?.addEventListener('change',filter);
  let editing=null;
  document.querySelector('[data-staff-new]')?.addEventListener('click',()=>{editing=null;const title=document.getElementById('staffModalTitle');if(title)title.textContent='إضافة موظف';['staffFormName','staffFormEmail','staffFormPhone'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});if(roleSelect)roleSelect.selectedIndex=0;const st=document.getElementById('staffFormStatus');if(st)st.selectedIndex=0;document.querySelectorAll('.staff-permissions-grid input').forEach(c=>c.checked=false);});
  const applyTemplate=()=>{const key=roleSelect?.value||'';const allowed=templatePermissions(key);document.querySelectorAll('.staff-permissions-grid input').forEach(c=>c.checked=allowed.includes(c.value));};
  document.getElementById('applyRoleTemplate')?.addEventListener('click',applyTemplate);roleSelect?.addEventListener('change',applyTemplate);
  document.addEventListener('click',e=>{
    const view=e.target.closest('[data-staff-view]');if(view){const row=view.closest('[data-staff-row]');if(!row)return;const name=document.getElementById('staffViewName'),r=document.getElementById('staffViewRole'),email=document.getElementById('staffViewEmail'),st=document.getElementById('staffViewStatus'),perms=document.getElementById('staffViewPermissions');if(name)name.textContent=row.querySelector('[data-staff-name]')?.textContent.trim()||'';if(r)r.textContent=row.querySelector('[data-staff-role-label]')?.textContent.trim()||'';if(email)email.textContent=row.querySelector('[data-staff-email]')?.textContent.trim()||'';if(st)st.textContent=row.querySelector('[data-staff-badge]')?.textContent.trim()||'';if(perms){perms.innerHTML='';(row.dataset.permissions||'').split(',').filter(Boolean).forEach(key=>{const b=document.createElement('span');b.className='badge text-bg-light border';b.textContent=permissionLabel(key);perms.appendChild(b);});}bootstrap.Modal.getOrCreateInstance(document.getElementById('staffViewModal')).show();}
    const edit=e.target.closest('[data-staff-edit]');if(edit){editing=edit.closest('[data-staff-row]');if(!editing)return;const title=document.getElementById('staffModalTitle');if(title)title.textContent='تعديل الموظف';const name=document.getElementById('staffFormName'),email=document.getElementById('staffFormEmail'),rs=document.getElementById('staffFormRole'),ss=document.getElementById('staffFormStatus');if(name)name.value=editing.querySelector('[data-staff-name]')?.textContent.trim()||'';if(email)email.value=editing.querySelector('[data-staff-email]')?.textContent.trim()||'';if(rs)rs.value=editing.dataset.role||'';if(ss)ss.value=editing.dataset.status||'';const allowed=(editing.dataset.permissions||'').split(',').filter(Boolean);document.querySelectorAll('.staff-permissions-grid input').forEach(c=>c.checked=allowed.includes(c.value));bootstrap.Modal.getOrCreateInstance(document.getElementById('staffModal')).show();}
    const tog=e.target.closest('[data-staff-toggle]');if(tog){const row=tog.closest('[data-staff-row]');if(!row)return;const suspend=row.dataset.status==='active';row.dataset.status=suspend?'suspended':'active';const b=row.querySelector('[data-staff-badge]');if(b){b.textContent=suspend?'معلق':'فعال';b.className=`badge ${suspend?'text-bg-secondary':'text-bg-success'}`;}tog.textContent=suspend?'إعادة تفعيل':'تعليق';tog.className=`btn btn-sm ${suspend?'btn-outline-success':'btn-outline-warning'}`;toast('تم تغيير الحالة بصريًا فقط؛ القيمة الأصلية موجودة في HTML وسيحفظها Laravel لاحقًا.');updateStats();filter();}
    const arc=e.target.closest('[data-staff-archive]');if(arc){toast('واجهة فقط: الأرشفة/الحذف الفعلي سيتم من Laravel، ولم يتم حذف بيانات HTML الثابتة.');}
  });
  document.getElementById('saveStaffBtn')?.addEventListener('click',()=>{const name=document.getElementById('staffFormName')?.value.trim(),email=document.getElementById('staffFormEmail')?.value.trim();if(!name||!email){toast('الاسم والبريد مطلوبان');return;}const modal=document.getElementById('staffModal');if(modal)bootstrap.Modal.getOrCreateInstance(modal).hide();toast('تم التحقق من نموذج الموظف فقط. لن ينشئ JavaScript أو يعدّل أي سجل؛ الحفظ الحقيقي سيكون عبر Laravel.');});
  updateStats();
});


// =========================================================
// System-wide mobile table enhancement.
// Adds header labels to cells so every table becomes a card list on phones.
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('table:not([data-no-mobile-stack])').forEach((table) => {
    table.classList.add('responsive-stack-table');

    const wrapper = table.closest('.table-responsive');
    if (wrapper) wrapper.classList.add('mobile-stack-wrapper');

    let headers = [...table.querySelectorAll('thead tr:first-child th')].map((th) =>
      th.textContent.replace(/\s+/g, ' ').trim()
    );

    // Fallback for tables without a formal THEAD.
    if (!headers.length) {
      const firstRow = table.querySelector('tr');
      if (firstRow) {
        headers = [...firstRow.children]
          .filter((cell) => cell.tagName === 'TH')
          .map((th) => th.textContent.replace(/\s+/g, ' ').trim());
      }
    }

    table.querySelectorAll('tbody tr').forEach((row) => {
      [...row.children].forEach((cell, index) => {
        if (cell.tagName !== 'TD') return;
        if (cell.hasAttribute('colspan')) {
          cell.dataset.label = '';
          return;
        }
        if (!cell.dataset.label) {
          cell.dataset.label = headers[index] || '';
        }
      });
    });
  });
});


// =========================================================
// Dynamic-row mobile table observer.
// Keeps rows added by front-end demo actions responsive on phones.
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const relabel = (table) => {
    if (!table || table.hasAttribute('data-no-mobile-stack')) return;
    table.classList.add('responsive-stack-table');
    table.closest('.table-responsive')?.classList.add('mobile-stack-wrapper');

    const headers = [...table.querySelectorAll('thead tr:first-child th')].map((th) =>
      th.textContent.replace(/\s+/g, ' ').trim()
    );

    table.querySelectorAll('tbody tr').forEach((row) => {
      [...row.children].forEach((cell, index) => {
        if (cell.tagName !== 'TD') return;
        cell.dataset.label = cell.hasAttribute('colspan') ? '' : (headers[index] || '');
      });
    });
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches('table')) relabel(node);
        node.querySelectorAll?.('table').forEach(relabel);
        const parentTable = node.closest?.('table');
        if (parentTable) relabel(parentTable);
      });
    });
  });

  document.querySelectorAll('table').forEach(relabel);
  observer.observe(document.body, { childList: true, subtree: true });
});


// =========================================================
// V5 Table UI decorator — consistent tables across all roles.
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const decorateTable = (table) => {
    if (!table || table.hasAttribute('data-no-table-ui')) return;

    table.classList.add('system-data-table','responsive-stack-table');
    const wrapper = table.closest('.table-responsive');
    if (wrapper) wrapper.classList.add('table-ui-shell','mobile-stack-wrapper');

    const headers = [...table.querySelectorAll('thead tr:first-child th')].map((th, i) => {
      const value = th.textContent.replace(/\s+/g,' ').trim();
      if (!value && i === table.querySelectorAll('thead tr:first-child th').length - 1) {
        th.textContent = 'الإجراءات';
        return 'الإجراءات';
      }
      return value;
    });

    table.querySelectorAll('tbody tr').forEach((row) => {
      const cells = [...row.children].filter(c => c.tagName === 'TD');
      cells.forEach((cell, index) => {
        cell.dataset.label = cell.hasAttribute('colspan') ? '' : (headers[index] || '');
        cell.classList.toggle('table-primary-cell', index === 0 && !cell.hasAttribute('colspan'));

        const hasStatusBadge = !!cell.querySelector('.badge[class*="text-bg-"], .badge[class*="badge-soft"]');
        if (hasStatusBadge && index !== 0) cell.classList.add('table-status-cell');

        const hasActions = !!cell.querySelector('button, a.btn, .dropdown');
        if (hasActions && index === cells.length - 1) cell.classList.add('table-actions-cell');
      });
    });
  };

  document.querySelectorAll('table').forEach(decorateTable);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches?.('table')) decorateTable(node);
        node.querySelectorAll?.('table').forEach(decorateTable);
        const table = node.closest?.('table');
        if (table) decorateTable(table);
      });
    });
  });
  observer.observe(document.body,{childList:true,subtree:true});
});


// =========================================================
// V6 Global action-group decorator
// =========================================================
document.addEventListener('DOMContentLoaded',()=>{
  const decorateActions=()=>{
    document.querySelectorAll('.appointment-item .row').forEach(row=>{
      [...row.children].forEach(col=>{
        const actions=[...col.querySelectorAll(':scope > .btn, :scope > a.btn, :scope > button.btn')];
        if(actions.length>=2) col.classList.add('card-action-group');
      });
    });
    document.querySelectorAll('table.system-data-table tbody tr').forEach(row=>{
      const cells=[...row.children].filter(x=>x.tagName==='TD');
      const last=cells[cells.length-1];
      if(last && last.querySelector('button,a.btn')){
        last.classList.add('table-actions-cell');
        const wrap=last.querySelector(':scope > .d-flex');
        if(wrap) wrap.classList.add('table-action-grid');
      }
    });
  };
  decorateActions();
  new MutationObserver(decorateActions).observe(document.body,{childList:true,subtree:true});
});


// V6 appointment meta blocks
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.appointment-item .row').forEach(row=>{
   const cols=[...row.children];
   cols.forEach((col,i)=>{
     if(i>0 && !col.classList.contains('card-action-group') && !col.querySelectorAll(':scope > .btn,:scope > a.btn,:scope > button.btn').length){
       col.classList.add('entity-meta-block');
     }
   });
 });
});


// =========================================================
// V11 wide-table classifier: removes horizontal scrolling by
// switching 6/7+ column tables to responsive card grids.
// =========================================================
document.addEventListener('DOMContentLoaded',()=>{
  const classifyWideTable=(table)=>{
    if(!table||table.hasAttribute('data-no-responsive-cards'))return;
    const headers=[...table.querySelectorAll('thead tr:first-child th')];
    const count=headers.length;
    table.classList.toggle('wide-data-table',count>=7);
    table.classList.toggle('medium-data-table',count===6);
  };

  document.querySelectorAll('table').forEach(classifyWideTable);

  const observer=new MutationObserver((mutations)=>{
    mutations.forEach(m=>m.addedNodes.forEach(node=>{
      if(!(node instanceof Element))return;
      if(node.matches?.('table'))classifyWideTable(node);
      node.querySelectorAll?.('table').forEach(classifyWideTable);
      const parent=node.closest?.('table');
      if(parent)classifyWideTable(parent);
    }));
  });
  observer.observe(document.body,{childList:true,subtree:true});
});
