
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-toggle-password]').forEach(btn=>btn.addEventListener('click',()=>{
    const input=document.querySelector(btn.dataset.togglePassword);
    if(!input)return;
    input.type=input.type==='password'?'text':'password';
    btn.querySelector('i').className=input.type==='password'?'bi bi-eye':'bi bi-eye-slash';
  }));
  document.querySelectorAll('.role-option').forEach(opt=>opt.addEventListener('click',()=>{
    document.querySelectorAll('.role-option').forEach(o=>o.classList.remove('active'));
    opt.classList.add('active');
    const input=document.getElementById('accountType');
    if(input)input.value=opt.dataset.role||'';
    const next=document.getElementById('roleNext');
    if(next)next.href=opt.dataset.href||'#';
  }));
  const pass=document.getElementById('doctorPassword')||document.getElementById('patientPassword');
  const confirm=document.getElementById('confirmPassword');
  const updateRules=()=>{
    if(!pass)return;
    const v=pass.value;
    document.querySelectorAll('[data-rule]').forEach(el=>{
      const r=el.dataset.rule;let ok=false;
      if(r==='length')ok=v.length>=8;
      if(r==='upper')ok=/[A-Z]/.test(v);
      if(r==='lower')ok=/[a-z]/.test(v);
      if(r==='number')ok=/\d/.test(v);
      el.classList.toggle('valid',ok);
      el.querySelector('i').className=ok?'bi bi-check-circle-fill':'bi bi-circle';
    });
    if(confirm)confirm.classList.toggle('is-invalid',!!confirm.value&&confirm.value!==v);
  };
  pass?.addEventListener('input',updateRules);confirm?.addEventListener('input',updateRules);
  document.querySelectorAll('[data-demo-submit]').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault();
    const formPass=form.querySelector('#doctorPassword,#patientPassword');
    const formConfirm=form.querySelector('#confirmPassword');
    if(formPass){
      const v=formPass.value;const rules=v.length>=8&&/[A-Z]/.test(v)&&/[a-z]/.test(v)&&/\d/.test(v);const matches=formConfirm&&formConfirm.value===v;
      let box=form.querySelector('.registration-submit-error');
      if(!rules||!matches){if(!box){box=document.createElement('div');box.className='alert alert-danger registration-submit-error mt-3 mb-0';form.querySelector('button[type="submit"]')?.insertAdjacentElement('beforebegin',box);}box.textContent=!rules?'كلمة المرور يجب أن تحقق جميع القواعد الظاهرة أعلاه.':'تأكيد كلمة المرور غير مطابق.';formPass.classList.toggle('is-invalid',!rules);formConfirm?.classList.toggle('is-invalid',!matches);return;}
      box?.remove();formPass.classList.remove('is-invalid');formConfirm?.classList.remove('is-invalid');
    }
    const target=form.dataset.demoSubmit;if(target)location.href=target;
  }));
});

document.addEventListener('DOMContentLoaded',()=>{
  let selectedDemoButton=null;
  document.querySelectorAll('[data-demo-login]').forEach(btn=>btn.addEventListener('click',()=>{
    selectedDemoButton=btn;
    const email=document.getElementById('loginEmail'),pass=document.getElementById('loginPassword');
    if(email)email.value=btn.dataset.demoLogin||'';
    if(pass)pass.value=document.getElementById('loginForm')?.dataset.demoPassword||'';
  }));
  document.getElementById('loginForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const email=(document.getElementById('loginEmail')?.value||'').toLowerCase();
    const projectRoot=document.body.dataset.projectRoot||'';
    const buttons=[...document.querySelectorAll('[data-demo-login][data-demo-route]')];
    const matched=buttons.find(b=>(b.dataset.demoLogin||'').toLowerCase()===email) || selectedDemoButton || buttons.find(b=>(b.dataset.demoLogin||'').includes('patient'));
    const label=matched?.dataset.demoLabel||'واجهة المريض';
    const href=projectRoot+(matched?.dataset.demoRoute||'patient/index.html');
    const text=document.getElementById('loginRouteText'),link=document.getElementById('loginRouteLink');
    if(text){text.textContent='تم التعرف على نوع الحساب تجريبيًا: ';const strong=document.createElement('strong');strong.textContent=label;text.appendChild(strong);}
    if(link)link.href=href;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('loginRouteModal')).show();
  });
});


document.addEventListener('DOMContentLoaded',()=>{
  const norm=v=>(v||'').toString().trim().toLowerCase();
  const search=document.getElementById('availableJobSearch');
  const city=document.getElementById('availableJobCity');
  const specialty=document.getElementById('availableJobSpecialty');
  const type=document.getElementById('availableJobType');
  const items=[...document.querySelectorAll('.available-job-item')];
  const count=document.getElementById('availableJobCount');
  const empty=document.getElementById('availableJobsEmpty');
  const filter=()=>{
    if(!items.length)return;
    const q=norm(search?.value),c=city?.value||'all',sp=specialty?.value||'all',ty=type?.value||'all';let n=0;
    items.forEach(item=>{const show=(!q||norm(item.dataset.search).includes(q))&&(c==='all'||item.dataset.city===c)&&(sp==='all'||item.dataset.specialty===sp)&&(ty==='all'||item.dataset.type===ty);item.classList.toggle('d-none',!show);if(show)n++;});
    if(count)count.textContent=`${n} ${n===1?'وظيفة':'وظائف'}`;empty?.classList.toggle('d-none',n!==0);
  };
  search?.addEventListener('input',filter);city?.addEventListener('change',filter);specialty?.addEventListener('change',filter);type?.addEventListener('change',filter);
  document.getElementById('clearAvailableJobFilters')?.addEventListener('click',()=>{if(search)search.value='';if(city)city.value='all';if(specialty)specialty.value='all';if(type)type.value='all';filter();});

  if(document.getElementById('jobDetailTitle')){
    const required=document.body.dataset.jobRequiredSpecialty||'';
    const applicant=document.body.dataset.applicantSpecialty||'';
    const licenseStatus=document.body.dataset.applicantLicenseStatus||'';
    const eligibility=document.getElementById('jobEligibilityNotice');
    const applyBtn=document.getElementById('openJobApply');
    const eligible=!required||!applicant||required===applicant;
    if(eligibility){
      eligibility.className=`alert ${eligible?'alert-success':'alert-warning'} border-0 rounded-4 small mt-3 mb-0`;
      eligibility.textContent=eligible
        ? `التخصص متوافق (${applicant||required}) والترخيص ${licenseStatus||'verified'}. يمكن إرسال الطلب.`
        : `لا يمكن تقديم هذا الحساب تجريبيًا: تخصص الطبيب (${applicant}) لا يطابق التخصص المطلوب (${required}).`;
    }
    if(applyBtn)applyBtn.disabled=!eligible;
    if(location.hash==='#apply'&&eligible)setTimeout(()=>bootstrap.Modal.getOrCreateInstance(document.getElementById('jobApplyModal')).show(),100);
  }
  document.getElementById('doctorJobApplicationForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const exp=Number(document.getElementById('applicantExperience')?.value||0);const cv=document.getElementById('applicantCv');
    if(exp<0||!cv?.files?.length)return;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('jobApplyModal')).hide();
    setTimeout(()=>bootstrap.Modal.getOrCreateInstance(document.getElementById('applicationSuccessModal')).show(),180);
  });
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
