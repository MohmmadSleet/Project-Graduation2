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
      showToast('تم إلغاء الموعد بنجاح');
      setTimeout(function () { window.location.href = 'appointments.html'; }, 1300);
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


