(function () {
  'use strict';

  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  function fmtDateTime(iso) {
    try { return new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)); }
    catch (_) { return iso || '—'; }
  }
  function fmtDate(iso) {
    if (!iso) return '—';
    try { return new Intl.DateTimeFormat('ar', { year:'numeric', month:'long', day:'numeric' }).format(new Date(iso)); }
    catch (_) { return iso; }
  }
  function toast(msg, ok) {
    var el = document.createElement('div');
    el.className = 'admin-toast';
    el.style.background = ok === false ? '#a73333' : '#0d4745';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function(){ el.remove(); }, 2400);
  }
  function currentAdmin() {
    var c = window.DentalStore && DentalStore.getCurrentUser();
    return c && c.role === 'admin' ? c : { id:'admin-local', name:'مدير النظام', role:'admin' };
  }
  function logAdmin(action, label, targetId, targetName, details) {
    if (!window.DentalStore) return;
    DentalStore.addLog({ category:'admin', action:action, label:label, actor:currentAdmin(), targetId:targetId || '', targetName:targetName || '', details:details || '' });
  }
  function statusBadge(status) {
    var cls = status === 'active' ? 'green' : (status === 'pending' ? 'amber' : 'red');
    return '<span class="badge-soft ' + cls + '">' + esc(DentalStore.statusLabel(status)) + '</span>';
  }
  function apptBadge(status) {
    var cls = status === 'مؤكد' ? 'green' : (status === 'انتظار' ? 'amber' : (status === 'ملغى' ? 'red' : 'gray'));
    return '<span class="badge-soft ' + cls + '">' + esc(status) + '</span>';
  }
  function initials(name) {
    return String(name || 'م').replace('د.','').trim().split(/\s+/).slice(0,2).map(function(x){return x.charAt(0);}).join('') || 'م';
  }

  function initNav() {
    var current = location.pathname.split('/').pop();
    document.querySelectorAll('.admin-nav-item').forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === current); });
  }

  function renderDashboard() {
    if (!document.querySelector('.admin-stats') || !window.DentalStore) return;
    var users = DentalStore.getUsers();
    var appts = DentalStore.getAppointments();
    var nums = document.querySelectorAll('.admin-stats .stat-num');
    if (nums[0]) nums[0].textContent = users.filter(function(u){return u.role==='patient';}).length;
    if (nums[1]) nums[1].textContent = users.filter(function(u){return u.role==='doctor';}).length;
    if (nums[2]) nums[2].textContent = users.filter(function(u){return u.role==='doctor' && u.status==='pending';}).length;
    if (nums[3]) nums[3].textContent = appts.length;

    var alertCount = users.filter(function(u){return u.role==='doctor' && u.status==='pending';}).length;
    var alertCard = document.querySelector('.action-alert .fw-bold');
    if (alertCard) alertCard.textContent = alertCount + ' حسابات أطباء بانتظار الاعتماد';

    var preview = document.querySelector('.activity-preview');
    if (preview) {
      var logs = DentalStore.getLogs().slice(0,5);
      preview.innerHTML = logs.map(logRow).join('') + '<a href="admin-activity.html" class="text-link">عرض كل النشاطات ←</a>';
    }
  }

  function logRow(l) {
    var color = l.category === 'appointments' ? 'blue' : (l.category === 'users' ? 'amber' : (l.category === 'auth' ? 'green' : (l.action && l.action.indexOf('DELETE')>-1 ? 'red' : 'blue')));
    var badge = l.category === 'auth' ? 'دخول' : (l.category === 'appointments' ? 'موعد' : (l.category === 'users' ? 'مستخدم' : (l.category === 'navigation' ? 'زيارة' : (l.category === 'admin' ? 'إدارة' : 'نظام'))));
    return '<div class="activity-row" data-log-search="' + esc((l.label+' '+l.actorName+' '+l.targetName+' '+l.details).toLowerCase()) + '" data-log-category="' + esc(l.category) + '">' +
      '<span class="activity-dot ' + color + '"></span><div><b>' + esc(l.label) + '</b><small>' + esc(l.actorName) + (l.targetName ? ' ← ' + esc(l.targetName) : '') + ' · ' + esc(fmtDateTime(l.timestamp)) + (l.details ? '<br>' + esc(l.details) : '') + '</small></div><span class="badge-soft ' + color + '">' + badge + '</span></div>';
  }

  function initUsers() {
    var list = document.getElementById('userList');
    if (!list || !window.DentalStore) return;
    var search = document.getElementById('userSearch');
    var filter = 'doctor';
    var users = DentalStore.getUsers().filter(function(u){ return u.role === 'doctor' || u.role === 'patient'; });
    document.getElementById('doctorCount').textContent = users.filter(function(u){return u.role==='doctor';}).length;
    document.getElementById('patientCount').textContent = users.filter(function(u){return u.role==='patient';}).length;

    function render() {
      var q = (search.value || '').trim().toLowerCase();
      var rows = users.filter(function(u){
        var text = [u.name,u.email,u.phone,u.specialty,u.license].join(' ').toLowerCase();
        return u.role === filter && (!q || text.indexOf(q) >= 0);
      });
      list.innerHTML = rows.length ? rows.map(function(u){
        return '<a href="admin-user-permissions.html?id=' + encodeURIComponent(u.id) + '" class="soft-card user-card">' +
          '<span class="avatar-circle' + (u.status==='pending'?' avatar-amber':'') + '">' + esc(initials(u.name)) + '</span>' +
          '<div class="flex-grow-1"><div class="fw-bold">' + esc(u.name) + '</div><div class="text-muted-2 small">' + esc(u.role==='doctor' ? (u.specialty || 'طبيب') : 'مريض') + ' · ' + esc(u.email || 'بدون بريد') + (u.phone ? ' · ' + esc(u.phone) : '') + '</div></div>' + statusBadge(u.status) + '<i class="bi bi-chevron-left text-muted-2"></i></a>';
      }).join('') : '<div class="soft-card p-4 text-center text-muted-2">لا توجد نتائج مطابقة.</div>';
    }
    document.querySelectorAll('[data-filter]').forEach(function(btn){
      btn.addEventListener('click', function(){
        filter = btn.dataset.filter;
        document.querySelectorAll('[data-filter]').forEach(function(b){ b.classList.toggle('btn-primary', b===btn); b.classList.toggle('btn-blue-soft', b!==btn); });
        render();
      });
    });
    search.addEventListener('input', render);
    render();
  }

  function initUserEditor() {
    var form = document.getElementById('adminUserEditForm');
    if (!form || !window.DentalStore) return;
    var id = new URLSearchParams(location.search).get('id');
    var user = DentalStore.getUser(id);
    if (!user || user.role === 'admin') {
      document.getElementById('adminUserEditor').classList.add('d-none');
      document.getElementById('adminUserMissing').classList.remove('d-none');
      return;
    }
    document.getElementById('adminUserName').textContent = user.name;
    document.getElementById('adminUserAvatar').textContent = initials(user.name);
    document.getElementById('adminUserMeta').textContent = DentalStore.roleLabel(user.role) + (user.specialty ? ' · ' + user.specialty : '') + ' · ' + DentalStore.statusLabel(user.status);
    document.getElementById('adminUserSince').textContent = 'عضو منذ ' + fmtDate(user.createdAt);
    var fields = {
      editFirstName:'firstName', editLastName:'lastName', editName:'name', editEmail:'email', editPhone:'phone', editRole:'role', editStatus:'status', editPassword:'password', editSpecialty:'specialty', editLicense:'license', editClinic:'clinic'
    };
    Object.keys(fields).forEach(function(fid){ var el=document.getElementById(fid); if (el) el.value=user[fields[fid]] || ''; });

    function toggleDoctorFields(){ document.querySelectorAll('.doctor-only').forEach(function(el){ el.style.display = document.getElementById('editRole').value === 'doctor' ? '' : 'none'; }); }
    document.getElementById('editRole').addEventListener('change', toggleDoctorFields); toggleDoctorFields();

    form.addEventListener('submit', function(e){
      e.preventDefault();
      try {
        var patch = {};
        Object.keys(fields).forEach(function(fid){ var el=document.getElementById(fid); if (el) patch[fields[fid]] = el.value.trim ? el.value.trim() : el.value; });
        DentalStore.updateUser(user.id, patch, { details:'قام مدير النظام بتعديل بيانات وصلاحيات/حالة الحساب.' });
        logAdmin('ADMIN_USER_EDIT','تعديل مستخدم بواسطة الأدمن',user.id,patch.name,'تم حفظ بيانات المستخدم من لوحة الإدارة.');
        toast('تم حفظ تعديلات المستخدم');
        setTimeout(function(){ location.reload(); }, 500);
      } catch (err) { toast(err.message || 'تعذر الحفظ', false); }
    });

    document.getElementById('deleteUserBtn').addEventListener('click', function(){
      if (!confirm('هل أنت متأكد من حذف حساب ' + user.name + ' نهائيًا؟ سيتم حذف مواعيده المرتبطة أيضًا.')) return;
      try { DentalStore.deleteUser(user.id); logAdmin('ADMIN_USER_DELETE','حذف حساب بواسطة الأدمن',user.id,user.name,'تم حذف الحساب نهائيًا من لوحة الإدارة.'); toast('تم حذف الحساب'); setTimeout(function(){ location.href='admin-users.html'; },700); }
      catch(err){ toast(err.message || 'تعذر الحذف', false); }
    });

    var box = document.getElementById('adminUserAppointments');
    function renderUserAppts(){
      var items = DentalStore.getAppointments().filter(function(a){ return String(a.patientId)===String(user.id) || String(a.doctorId)===String(user.id) || a.patientName===user.name || a.doctorName===user.name; });
      box.innerHTML = items.length ? items.map(function(a){ return '<div class="soft-card admin-appointment-card"><div class="flex-grow-1"><div class="fw-bold">' + esc(a.patientName) + ' مع ' + esc(a.doctorName || 'الطبيب') + '</div><div class="text-muted-2 small">' + esc(a.date) + ' · ' + esc(a.time) + ' · ' + esc(a.service) + '</div></div>' + apptBadge(a.status) + '<button class="btn btn-sm btn-red-soft" data-delete-user-appt="' + esc(a.id) + '"><i class="bi bi-trash3"></i> حذف</button></div>'; }).join('') : '<div class="soft-card p-4 text-center text-muted-2">لا توجد مواعيد مرتبطة بهذا المستخدم.</div>';
    }
    box.addEventListener('click', function(e){
      var btn=e.target.closest('[data-delete-user-appt]'); if(!btn)return;
      if(!confirm('حذف هذا الموعد نهائيًا؟'))return;
      try{ DentalStore.deleteAppointment(btn.dataset.deleteUserAppt); logAdmin('ADMIN_APPOINTMENT_DELETE','حذف موعد بواسطة الأدمن',btn.dataset.deleteUserAppt,user.name,'تم حذف الموعد من صفحة المستخدم.'); toast('تم حذف الموعد'); renderUserAppts(); }
      catch(err){ toast(err.message||'تعذر حذف الموعد',false); }
    });
    renderUserAppts();
  }

  function initAppointments() {
    var list = document.getElementById('adminAppointmentsList');
    if (!list || !window.DentalStore) return;
    var search=document.getElementById('appointmentSearch'), status=document.getElementById('appointmentStatusFilter');
    var modalEl=document.getElementById('appointmentEditModal');
    var modal=modalEl ? new bootstrap.Modal(modalEl) : null;
    function render(){
      var q=(search.value||'').trim().toLowerCase(), st=status.value;
      var items=DentalStore.getAppointments().filter(function(a){ var text=[a.patientName,a.doctorName,a.service,a.date,a.time].join(' ').toLowerCase(); return (!q||text.indexOf(q)>=0)&&(st==='all'||a.status===st); });
      items.sort(function(a,b){ return (b.date+b.time).localeCompare(a.date+a.time); });
      list.innerHTML=items.length?items.map(function(a){return '<div class="soft-card admin-appointment-card"><div class="admin-appt-date"><b>' + esc(a.date) + '</b><small>' + esc(a.time) + '</small></div><div class="flex-grow-1"><div class="fw-bold">' + esc(a.patientName) + '</div><div class="text-muted-2 small">مع ' + esc(a.doctorName||'الطبيب') + ' · ' + esc(a.service) + '</div></div>' + apptBadge(a.status) + '<div class="d-flex gap-2"><button class="btn btn-sm btn-blue-soft" data-edit-appt="' + esc(a.id) + '"><i class="bi bi-pencil-square"></i> تعديل</button><button class="btn btn-sm btn-red-soft" data-delete-appt="' + esc(a.id) + '"><i class="bi bi-trash3"></i> حذف</button></div></div>';}).join(''):'<div class="soft-card p-4 text-center text-muted-2">لا توجد مواعيد مطابقة.</div>';
    }
    search.addEventListener('input',render); status.addEventListener('change',render);
    list.addEventListener('click',function(e){
      var del=e.target.closest('[data-delete-appt]');
      if(del){ if(!confirm('هل تريد حذف هذا الموعد نهائيًا؟'))return; try{var a=DentalStore.deleteAppointment(del.dataset.deleteAppt);logAdmin('ADMIN_APPOINTMENT_DELETE','حذف موعد بواسطة الأدمن',a.id,a.patientName,'تم حذف الموعد نهائيًا.');toast('تم حذف الموعد');render();}catch(err){toast(err.message,false);}return; }
      var edit=e.target.closest('[data-edit-appt]');
      if(edit){ var a=DentalStore.getAppointments().find(function(x){return String(x.id)===String(edit.dataset.editAppt);}); if(!a)return; document.getElementById('editAppointmentId').value=a.id;document.getElementById('editAppointmentPatient').value=a.patientName||'';document.getElementById('editAppointmentDoctor').value=a.doctorName||'';document.getElementById('editAppointmentDate').value=a.date||'';document.getElementById('editAppointmentTime').value=a.time||'';document.getElementById('editAppointmentService').value=a.service||'';document.getElementById('editAppointmentStatus').value=a.status||'مؤكد';document.getElementById('editAppointmentNotes').value=a.notes||'';modal.show(); }
    });
    var form=document.getElementById('appointmentEditForm');
    if(form) form.addEventListener('submit',function(e){e.preventDefault();var id=document.getElementById('editAppointmentId').value;try{var patientName=document.getElementById('editAppointmentPatient').value.trim();var doctorName=document.getElementById('editAppointmentDoctor').value.trim();var users=DentalStore.getUsers();var patientUser=users.find(function(u){return u.role==='patient'&&u.name===patientName;});var doctorUser=users.find(function(u){return u.role==='doctor'&&u.name===doctorName;});var updated=DentalStore.updateAppointment(id,{patientName:patientName,patientId:patientUser?patientUser.id:undefined,doctorName:doctorName,doctorId:doctorUser?doctorUser.id:undefined,date:document.getElementById('editAppointmentDate').value,time:document.getElementById('editAppointmentTime').value,service:document.getElementById('editAppointmentService').value.trim(),status:document.getElementById('editAppointmentStatus').value,notes:document.getElementById('editAppointmentNotes').value.trim()},{label:'تعديل موعد بواسطة الأدمن',details:'قام مدير النظام بتعديل بيانات الموعد.'});logAdmin('ADMIN_APPOINTMENT_EDIT','تعديل موعد بواسطة الأدمن',id,updated.patientName,'تم حفظ تعديلات الموعد من لوحة الإدارة.');modal.hide();toast('تم تعديل الموعد');render();}catch(err){toast(err.message||'تعذر تعديل الموعد',false);}});
    render();
  }

  function initActivity() {
    var list=document.getElementById('activityList'); if(!list||!window.DentalStore)return;
    var search=document.getElementById('activitySearch'), cat=document.getElementById('activityCategory'), count=document.getElementById('activityCount');
    function render(){ var q=(search.value||'').trim().toLowerCase(), c=cat.value; var logs=DentalStore.getLogs().filter(function(l){var text=[l.label,l.actorName,l.targetName,l.details,l.action].join(' ').toLowerCase();return(!q||text.indexOf(q)>=0)&&(c==='all'||l.category===c);}); count.textContent='عدد السجلات: '+logs.length; list.innerHTML=logs.length?logs.map(logRow).join(''):'<div class="p-4 text-center text-muted-2">لا توجد نشاطات مطابقة.</div>'; }
    search.addEventListener('input',render);cat.addEventListener('change',render);render();
  }

  function initApprovals() {
    var container=document.getElementById('doctorApprovalList');
    if(!container){
      var pageTitle=document.querySelector('.page-title');
      if(pageTitle && location.pathname.endsWith('admin-doctor-approvals.html')){
        var cards=document.querySelectorAll('.user-card');
        if(cards.length){
          var parent=cards[0].parentElement; parent.id='doctorApprovalList'; container=parent;
        }
      }
    }
    if(!container||!window.DentalStore)return;
    function render(){var docs=DentalStore.getUsers().filter(function(u){return u.role==='doctor'&&u.status==='pending';});container.innerHTML=docs.length?docs.map(function(u){return '<a href="admin-doctor-review.html?id='+encodeURIComponent(u.id)+'" class="soft-card user-card"><span class="avatar-circle avatar-amber">'+esc(initials(u.name))+'</span><div class="flex-grow-1"><div class="fw-bold">'+esc(u.name)+'</div><div class="text-muted-2 small">'+esc(u.specialty||'طبيب')+' · '+esc(u.email)+'</div></div><span class="badge-soft amber">معلق</span><i class="bi bi-chevron-left text-muted-2"></i></a>';}).join(''):'<div class="soft-card p-4 text-center text-muted-2">لا توجد طلبات أطباء معلقة.</div>';}
    render();
  }

  function initDoctorReview() {
    if(!location.pathname.endsWith('admin-doctor-review.html')||!window.DentalStore)return;
    var id=new URLSearchParams(location.search).get('id'); var user=DentalStore.getUser(id); if(!user)return;
    var main=document.querySelector('main'); if(!main)return;
    var summary=main.querySelector('.profile-summary');
    if(summary){
      var avatar=summary.querySelector('.avatar-circle'); if(avatar) avatar.textContent=initials(user.name);
      var title=summary.querySelector('h2'); if(title) title.textContent=user.name;
      var meta=summary.querySelector('.text-muted-2'); if(meta) meta.textContent=(user.specialty||'طبيب')+' · '+DentalStore.statusLabel(user.status);
      var badge=summary.querySelector('.badge-soft'); if(badge) badge.textContent=DentalStore.statusLabel(user.status);
    }
    var details=main.querySelector('.detail-list');
    if(details) details.innerHTML='<div><span>الاسم</span><b>'+esc(user.name)+'</b></div><div><span>البريد</span><b>'+esc(user.email)+'</b></div><div><span>التخصص</span><b>'+esc(user.specialty||'—')+'</b></div><div><span>رقم الترخيص</span><b>'+esc(user.license||'—')+'</b></div><div><span>العيادة</span><b>'+esc(user.clinic||'—')+'</b></div>';
    var buttons=main.querySelectorAll('[data-toast]');
    buttons.forEach(function(btn){
      if((btn.dataset.toast||'').includes('اعتماد')) btn.addEventListener('click',function(){DentalStore.updateUser(user.id,{status:'active'},{details:'تم اعتماد حساب الطبيب.'});logAdmin('ADMIN_DOCTOR_APPROVE','اعتماد طبيب',user.id,user.name,'تم اعتماد طلب الطبيب.');setTimeout(function(){location.href='admin-doctor-approvals.html';},500);});
      if((btn.dataset.toast||'').includes('رفض')) btn.addEventListener('click',function(){DentalStore.updateUser(user.id,{status:'disabled'},{details:'تم رفض طلب الطبيب.'});logAdmin('ADMIN_DOCTOR_REJECT','رفض طبيب',user.id,user.name,'تم رفض طلب الطبيب وتعطيل الحساب.');setTimeout(function(){location.href='admin-doctor-approvals.html';},500);});
    });
  }

  function initDisableUser() {
    if(!location.pathname.endsWith('admin-disable-user.html')||!window.DentalStore)return;
    var id=new URLSearchParams(location.search).get('id'); if(!id)return;
    var btn=document.querySelector('[data-toast*="تعطيل"]'); if(!btn)return;
    btn.addEventListener('click',function(){var u=DentalStore.getUser(id);if(!u)return;DentalStore.updateUser(id,{status:'disabled'},{details:'تم تعطيل الحساب بواسطة مدير النظام.'});logAdmin('ADMIN_USER_DISABLE','تعطيل حساب',id,u.name,'تم تعطيل الحساب.');setTimeout(function(){location.href='admin-user-permissions.html?id='+encodeURIComponent(id);},500);});
  }

  function initSettings() {
    var form=document.getElementById('settingsForm'); if(!form)return;
    form.addEventListener('submit',function(e){e.preventDefault();logAdmin('ADMIN_SETTINGS_UPDATE','تحديث إعدادات النظام','','','قام مدير النظام بحفظ إعدادات النظام.');toast('تم حفظ التغييرات');});
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    if (!window.DentalStore) return;
    renderDashboard(); initUsers(); initUserEditor(); initAppointments(); initActivity(); initApprovals(); initDoctorReview(); initDisableUser(); initSettings();

    document.querySelectorAll('[data-toast]').forEach(function(btn){
      btn.addEventListener('click',function(){ toast(btn.dataset.toast); });
    });
  });
})();
