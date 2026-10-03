document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  function showToast(message) {
    const toastEl = document.getElementById("appToast");
    if (!toastEl) return;
    const body = toastEl.querySelector(".toast-body");
    if (body) body.textContent = message;
    bootstrap.Toast.getOrCreateInstance(toastEl).show();
  }
  document
    .querySelectorAll("[data-toast]")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        showToast(btn.getAttribute("data-toast") || "تمت العملية بنجاح"),
      ),
    );
  document
    .querySelectorAll("[data-logout]")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        showToast("تم تسجيل الخروج تجريبياً"),
      ),
    );

  // Booking page: all mock data is read from hidden HTML elements.
  const dateInput = document.getElementById("bookingDate");
  const serviceSelect = document.getElementById("serviceSelect");
  const slotsContainer = document.getElementById("timeSlots");
  const bookingState = document.getElementById("bookingState");
  const confirmBooking = document.getElementById("confirmBooking");
  const htmlData = document.getElementById("bookingHtmlData");

  if (
    dateInput &&
    serviceSelect &&
    slotsContainer &&
    confirmBooking &&
    htmlData
  ) {
    const params = new URLSearchParams(window.location.search);
    const defaultDoctor =
      htmlData.dataset.defaultDoctor ||
      htmlData.querySelector("[data-doctor-key]")?.dataset.doctorKey ||
      "";
    const requestedDoctor = params.get("doctor");
    const doctorRecord =
      htmlData.querySelector(
        `[data-doctor-key="${CSS.escape(requestedDoctor || defaultDoctor)}"]`,
      ) || htmlData.querySelector("[data-doctor-key]");
    const doctorKey = doctorRecord?.dataset.doctorKey || defaultDoctor;
    const clinicKey =
      params.get("clinic") || doctorRecord?.dataset.clinicKey || "";
    const wantedService = params.get("service");
    const wantedDate = params.get("date");
    const wantedTime = params.get("time");
    const isFollowup = params.get("followup") === "1";
    const isAiBooking = params.get("source") === "ai";
    const aiRecommendationId = params.get("recommendation") || "";
    const aiRiskLevel = params.get("risk") || "";
    const aiDistance = params.get("distance") || "";
    const aiSymptomSummary = params.get("symptom_summary") || "";

    document
      .getElementById("followupBookingContext")
      ?.classList.toggle("d-none", !isFollowup);
    document
      .getElementById("aiBookingContext")
      ?.classList.toggle("d-none", !isAiBooking);
    const bookingNotes = document.getElementById("bookingNotes");
    if (isAiBooking && bookingNotes && aiSymptomSummary) {
      bookingNotes.value = aiSymptomSummary;
      bookingNotes.dataset.source = "ai";
      bookingNotes.dataset.aiRecommendationId = aiRecommendationId;
    }
    const aiBookingMeta = document.getElementById("aiBookingMeta");
    if (isAiBooking && aiBookingMeta) {
      const riskLabel =
        aiRiskLevel === "high"
          ? "عالية"
          : aiRiskLevel === "medium"
            ? "متوسطة"
            : aiRiskLevel === "normal"
              ? "عادية"
              : "—";
      aiBookingMeta.textContent = `الاقتراح: ${aiRecommendationId || "—"} • الخطورة: ${riskLabel}${aiDistance ? ` • المسافة: ${aiDistance} كم` : ""}`;
    }

    const clinicName =
      htmlData
        .querySelector(`[data-clinic-key="${CSS.escape(clinicKey)}"]`)
        ?.textContent.trim() || "";
    const clinicNameEl = document.getElementById("selectedClinicName");
    const doctorNameEl = document.getElementById("selectedDoctorName");
    if (clinicNameEl) clinicNameEl.textContent = clinicName;
    if (doctorNameEl)
      doctorNameEl.textContent = doctorRecord?.dataset.doctorName || "";

    [...serviceSelect.options].forEach((opt) => {
      const match = opt.dataset.doctorKey === doctorKey;
      opt.hidden = !match;
      opt.disabled = !match;
    });
    const firstService = [...serviceSelect.options].find((o) => !o.disabled);
    if (firstService) serviceSelect.value = firstService.value;
    if (wantedService) {
      const wanted = [...serviceSelect.options].find(
        (o) => !o.disabled && o.value === wantedService,
      );
      if (wanted) serviceSelect.value = wanted.value;
    }
    if (wantedDate) dateInput.value = wantedDate;

    const workingDays = (doctorRecord?.dataset.workingDays || "")
      .split(",")
      .filter(Boolean)
      .map(Number);
    const absences = (doctorRecord?.dataset.absences || "")
      .split(",")
      .filter(Boolean);
    let selectedTime = null;

    function formatTime(slot) {
      const [hour, minute] = slot.split(":").map(Number);
      const suffix = hour >= 12 ? "م" : "ص";
      const hour12 = ((hour + 11) % 12) + 1;
      return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
    }

    function availableSlotsFor(date) {
      const parsedDate = date ? new Date(`${date}T12:00:00`) : null;
      const weekday = parsedDate ? parsedDate.getDay() : null;
      const isAbsent = absences.includes(date);
      const worksThatDay = weekday !== null && workingDays.includes(weekday);
      if (isAbsent || !worksThatDay)
        return { slots: [], isAbsent, worksThatDay };
      const exact = doctorRecord?.querySelector(
        `[data-date="${CSS.escape(date)}"]`,
      );
      const byDay = doctorRecord?.querySelector(`[data-day="${weekday}"]`);
      const source = exact || byDay;
      const slots = (source?.dataset.slots || "").split(",").filter(Boolean);
      return { slots, isAbsent, worksThatDay };
    }

    function renderSlots() {
      const date = dateInput.value || "";
      const state = availableSlotsFor(date);
      const available = new Set(state.slots);
      selectedTime = null;
      confirmBooking.disabled = true;

      slotsContainer.querySelectorAll("[data-slot]").forEach((btn) => {
        const slot = btn.dataset.slot;
        const ok = available.has(slot);
        btn.classList.toggle("available", ok);
        btn.classList.toggle("unavailable", !ok);
        btn.classList.toggle("btn-light", ok);
        btn.disabled = !ok;
        btn.setAttribute("aria-disabled", String(!ok));
        btn.title = ok ? "متاح" : "غير متاح";
        btn.onclick = ok
          ? () => {
              slotsContainer
                .querySelectorAll(".time-slot.available")
                .forEach((x) => x.classList.remove("selected"));
              btn.classList.add("selected");
              selectedTime = slot;
              confirmBooking.disabled = false;
              if (bookingState)
                bookingState.textContent = `تم اختيار ${formatTime(slot)}.`;
            }
          : null;
      });

      if (bookingState) {
        if (state.isAbsent)
          bookingState.textContent =
            "الطبيب غير متاح في هذا التاريخ حسب جدول العيادة؛ لذلك تظهر جميع الأوقات مشطوبة.";
        else if (!state.worksThatDay)
          bookingState.textContent =
            "هذا اليوم خارج أيام دوام الطبيب؛ لذلك تظهر جميع الأوقات مشطوبة. اختر تاريخاً آخر.";
        else
          bookingState.textContent =
            "جميع الأوقات معروضة. اختر وقتاً غير مشطوب؛ الأوقات المشطوبة محجوزة أو خارج ساعات دوام الطبيب.";
      }

      if (wantedTime && available.has(wantedTime))
        slotsContainer
          .querySelector(`[data-slot="${CSS.escape(wantedTime)}"]`)
          ?.click();
    }

    renderSlots();
    dateInput.addEventListener("change", renderSlots);
    confirmBooking.addEventListener("click", () => {
      if (!selectedTime) return;
      const successText = document.getElementById("bookingSuccessText");
      if (successText)
        successText.textContent = `${clinicName} — ${doctorRecord?.dataset.doctorName || ""} — ${dateInput.value} — ${formatTime(selectedTime)}${isAiBooking ? ` • AI Recommendation: ${aiRecommendationId || "مرتبط"}` : ""}`;
      const modalEl = document.getElementById("bookingSuccess");
      if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
    });
  }

  // AI diagnosis chat: suggestion content is stored as HTML templates in the page.
  const chatBody = document.getElementById("chatBody");
  const chatInput = document.getElementById("chatMessage");
  const sendChat = document.getElementById("sendChat");
  const clearChat = document.getElementById("clearChat");
  const aiHtmlData = document.getElementById("aiHtmlData");

  if (chatBody && chatInput && sendChat && aiHtmlData) {
    const introHtml = chatBody.innerHTML;
    const assessmentId = aiHtmlData.dataset.assessmentId || "";
    const symptomSummary = aiHtmlData.dataset.symptomSummary || "";
    const riskLevel =
      aiHtmlData.dataset.riskLabel || aiHtmlData.dataset.riskLevel || "";
    const recommendedSpecialty = aiHtmlData.dataset.recommendedSpecialty || "";
    const aiLocationStatus = document.getElementById("aiLocationStatus");

    function appendMessage(type, content, asHtml = false) {
      const row = document.createElement("div");
      row.className = `chat-row ${type}`;
      const bubble = document.createElement("div");
      bubble.className = "chat-bubble";
      if (asHtml) bubble.innerHTML = content;
      else bubble.textContent = content;
      row.appendChild(bubble);
      chatBody.appendChild(row);
      chatBody.scrollTop = chatBody.scrollHeight;
    }
    function suggestionHtml(key) {
      const source =
        aiHtmlData.querySelector(`[data-ai-suggestion="${CSS.escape(key)}"]`) ||
        aiHtmlData.querySelector('[data-ai-suggestion="all"]');
      return source
        ? source.innerHTML
        : '<div class="alert alert-light border mb-0">لا يوجد اقتراح تجريبي.</div>';
    }
    function answerFor(text) {
      const value = text.trim();
      if (!value) return;
      appendMessage("user", value);
      chatInput.value = "";
      const bookingIntent = /(احجز|حجز|ثبّت|ثبت|book|appointment)/i.test(value);
      const dentalIntent =
        /(سن|أسنان|ضرس|لثة|فم|تقويم|جذور|حشوة|حشو|ألم|وجع|تورم|نزف|خلع|زراعة|تاج|فك|حساسية|مضغ|tooth|teeth|dental|gum|mouth)/i.test(
          value,
        );
      if (bookingIntent) {
        setTimeout(() => {
          appendMessage(
            "ai",
            `ممتاز. هذا هو الاقتراح الحالي المرتبط بالتقييم ${assessmentId}. اضغط «احجز هذا الاقتراح» لإكمال الحجز.`,
          );
          appendMessage("ai", suggestionHtml("all"), true);
        }, 140);
        return;
      }
      if (!dentalIntent) {
        setTimeout(
          () =>
            appendMessage(
              "ai",
              "أنا مساعد Smart Dental ومخصص لمشاكل الأسنان والفم واللثة والحجز المرتبط بها. اكتب لي الأعراض المتعلقة بالأسنان مثل مكان الألم، مدته، وجود تورم أو حساسية، وسأساعدك بتوجيه أولي.",
            ),
          140,
        );
        return;
      }
      setTimeout(() => {
        appendMessage(
          "ai",
          `هذا توجيه أولي وليس تشخيصاً نهائياً أو تقريراً طبياً. ملخص الأعراض التجريبي: ${symptomSummary}. درجة الخطورة: ${riskLevel}. التخصص المقترح: ${recommendedSpecialty || "يحدده التحليل"}. الترتيب يوازن بين ملاءمة التخصص والطبيب، قرب العيادة، وتوقيت الموعد حسب الخطورة.`,
        );
        setTimeout(() => appendMessage("ai", suggestionHtml("all"), true), 220);
      }, 180);
    }
    sendChat.addEventListener("click", () => answerFor(chatInput.value));
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        answerFor(chatInput.value);
      }
    });
    document.addEventListener("click", (e) => {
      const quick = e.target.closest("[data-chat-prompt]");
      if (quick && document.body.contains(quick)) {
        answerFor(quick.getAttribute("data-chat-prompt") || "");
        return;
      }
      const alt = e.target.closest("[data-ai-alt]");
      if (alt && chatBody.contains(alt)) {
        appendMessage("user", alt.textContent.trim());
        setTimeout(
          () =>
            appendMessage(
              "ai",
              suggestionHtml(alt.getAttribute("data-ai-alt")),
              true,
            ),
          160,
        );
      }
    });
    clearChat?.addEventListener("click", () => {
      chatBody.innerHTML = introHtml;
      chatInput.value = "";
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const norm = (value) => (value || "").toString().trim().toLowerCase();

  // Clinic search/filter
  const clinicSearch = document.getElementById("clinicSearch");
  const clinicSpecialty = document.getElementById("clinicSpecialtyFilter");
  const clinicStatus = document.getElementById("clinicStatusFilter");
  const clinicItems = [...document.querySelectorAll(".clinic-filter-item")];
  const clinicCount = document.getElementById("clinicResultCount");
  const clinicEmpty = document.getElementById("clinicEmptyState");

  function filterClinics() {
    if (!clinicItems.length) return;
    const q = norm(clinicSearch?.value);
    const specialty = clinicSpecialty?.value || "all";
    const status = clinicStatus?.value || "all";
    let visible = 0;

    clinicItems.forEach((item) => {
      const haystack = norm(
        `${item.dataset.name} ${item.dataset.location} ${item.dataset.specialties}`,
      );
      const matchSearch = !q || haystack.includes(q);
      const matchSpecialty =
        specialty === "all" ||
        norm(item.dataset.specialties).split(" ").includes(specialty);
      const matchStatus = status === "all" || item.dataset.status === status;
      const show = matchSearch && matchSpecialty && matchStatus;
      item.classList.toggle("d-none", !show);
      if (show) visible++;
    });

    if (clinicCount)
      clinicCount.textContent = `${visible} ${visible === 1 ? "عيادة" : "عيادات"}`;
    clinicEmpty?.classList.toggle("d-none", visible !== 0);
  }

  clinicSearch?.addEventListener("input", filterClinics);
  clinicSpecialty?.addEventListener("change", filterClinics);
  clinicStatus?.addEventListener("change", filterClinics);
  document
    .getElementById("clearClinicFilters")
    ?.addEventListener("click", () => {
      if (clinicSearch) clinicSearch.value = "";
      if (clinicSpecialty) clinicSpecialty.value = "all";
      if (clinicStatus) clinicStatus.value = "all";
      filterClinics();
    });

  const useClinicLocation = document.getElementById("useClinicLocation");
  const clinicLocationStatus = document.getElementById("clinicLocationStatus");
  const clinicSort = document.getElementById("clinicSort");
  useClinicLocation?.addEventListener("click", () => {
    const done = (label) => {
      if (clinicLocationStatus)
        clinicLocationStatus.textContent = `تم استخدام الموقع: ${label}. أصبحت المسافات والترتيب حسب القرب مفعلة.`;
      useClinicLocation.innerHTML =
        '<i class="bi bi-check-circle ms-1"></i>تم استخدام الموقع';
      useClinicLocation.classList.replace("btn-outline-primary", "btn-success");
      if (clinicSort) {
        clinicSort.value = "nearest";
        clinicSort.dispatchEvent(new Event("change"));
      }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () =>
          done(
            document.getElementById("clinicLocationCard")?.dataset
              .demoLocation || "موقعك الحالي",
          ),
        () =>
          done(
            document.getElementById("clinicLocationCard")?.dataset
              .demoLocation || "الموقع التجريبي",
          ),
      );
    } else
      done(
        document.getElementById("clinicLocationCard")?.dataset.demoLocation ||
          "الموقع التجريبي",
      );
  });
  clinicSort?.addEventListener("change", () => {
    const grid = document.getElementById("clinicsGrid");
    if (!grid) return;
    const sorted = [...clinicItems].sort((a, b) =>
      clinicSort.value === "nearest"
        ? Number(a.dataset.distance || 999) - Number(b.dataset.distance || 999)
        : clinicSort.value === "rating"
          ? Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0)
          : 0,
    );
    sorted.forEach((x) => grid.appendChild(x));
  });

  const useAiLocation = document.getElementById("useAiLocation");
  useAiLocation?.addEventListener("click", () => {
    const finish = (label) => {
      if (aiLocationStatus)
        aiLocationStatus.textContent = `تم استخدام الموقع: ${label}. سيأخذ النظام مسافة العيادة بعين الاعتبار.`;
      useAiLocation.innerHTML =
        '<i class="bi bi-check-circle ms-1"></i>تم استخدام الموقع';
      useAiLocation.classList.replace("btn-outline-primary", "btn-success");
    };
    const label = aiHtmlData?.dataset.demoLocation || "موقعك الحالي";
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        () => finish(label),
        () => finish(label),
      );
    else finish(label);
  });

  // Global doctor search/filter
  const doctorSearch = document.getElementById("doctorSearch");
  const doctorSpecialty = document.getElementById("doctorSpecialtyFilter");
  const doctorClinic = document.getElementById("doctorClinicFilter");
  const doctorAvailability = document.getElementById(
    "doctorAvailabilityFilter",
  );
  const doctorItems = [...document.querySelectorAll(".doctor-filter-item")];
  const doctorCount = document.getElementById("doctorResultCount");
  const doctorEmpty = document.getElementById("doctorEmptyState");

  function filterDoctors() {
    if (!doctorItems.length) return;
    const q = norm(doctorSearch?.value);
    const specialty = doctorSpecialty?.value || "all";
    const clinic = doctorClinic?.value || "all";
    const availability = doctorAvailability?.value || "all";
    let visible = 0;

    doctorItems.forEach((item) => {
      const haystack = norm(
        `${item.dataset.name} ${item.dataset.clinicName} ${item.dataset.specialty}`,
      );
      const show =
        (!q || haystack.includes(q)) &&
        (specialty === "all" || item.dataset.specialty === specialty) &&
        (clinic === "all" || item.dataset.clinic === clinic) &&
        (availability === "all" || item.dataset.availability === availability);

      item.classList.toggle("d-none", !show);
      if (show) visible++;
    });

    if (doctorCount)
      doctorCount.textContent = `${visible} ${visible === 1 ? "طبيب" : "أطباء"}`;
    doctorEmpty?.classList.toggle("d-none", visible !== 0);
  }

  doctorSearch?.addEventListener("input", filterDoctors);
  doctorSpecialty?.addEventListener("change", filterDoctors);
  doctorClinic?.addEventListener("change", filterDoctors);
  doctorAvailability?.addEventListener("change", filterDoctors);
  document
    .getElementById("clearDoctorFilters")
    ?.addEventListener("click", () => {
      if (doctorSearch) doctorSearch.value = "";
      if (doctorSpecialty) doctorSpecialty.value = "all";
      if (doctorClinic) doctorClinic.value = "all";
      if (doctorAvailability) doctorAvailability.value = "all";
      filterDoctors();
    });

  // Doctors inside a clinic
  const clinicDoctorSearch = document.getElementById("clinicDoctorSearch");
  const clinicDoctorSpecialty = document.getElementById(
    "clinicDoctorSpecialtyFilter",
  );
  const clinicDoctorAvailability = document.getElementById(
    "clinicDoctorAvailabilityFilter",
  );
  const clinicDoctorItems = [
    ...document.querySelectorAll(".clinic-doctor-item"),
  ];

  function filterClinicDoctors() {
    if (!clinicDoctorItems.length) return;
    const q = norm(clinicDoctorSearch?.value);
    const specialty = clinicDoctorSpecialty?.value || "all";
    const availability = clinicDoctorAvailability?.value || "all";

    clinicDoctorItems.forEach((item) => {
      const show =
        (!q || norm(item.dataset.name).includes(q)) &&
        (specialty === "all" || item.dataset.specialty === specialty) &&
        (availability === "all" || item.dataset.availability === availability);
      item.classList.toggle("d-none", !show);
    });
  }

  clinicDoctorSearch?.addEventListener("input", filterClinicDoctors);
  clinicDoctorSpecialty?.addEventListener("change", filterClinicDoctors);
  clinicDoctorAvailability?.addEventListener("change", filterClinicDoctors);

  // Appointments filters + search
  const appointmentSearch = document.getElementById("appointmentSearch");
  const appointmentItems = [
    ...document.querySelectorAll(".appointment-filter-item"),
  ];
  const appointmentCount = document.getElementById("appointmentResultCount");
  const appointmentEmpty = document.getElementById("appointmentEmptyState");
  const appointmentButtons = [
    ...document.querySelectorAll("[data-appointment-filter]"),
  ];
  let appointmentFilter = "all";

  function filterAppointments() {
    if (!appointmentItems.length) return;
    const q = norm(appointmentSearch?.value);
    let visible = 0;

    appointmentItems.forEach((item) => {
      const status = item.dataset.status;
      let matchStatus = false;

      if (appointmentFilter === "all") matchStatus = true;
      else if (appointmentFilter === "pending")
        matchStatus = status === "pending";
      else if (appointmentFilter === "upcoming")
        matchStatus = ["upcoming", "reschedule"].includes(status);
      else if (appointmentFilter === "reschedule")
        matchStatus = status === "reschedule";
      else if (appointmentFilter === "completed")
        matchStatus = status === "completed";
      else if (appointmentFilter === "noshow")
        matchStatus = status === "noshow";
      else if (appointmentFilter === "closed")
        matchStatus = ["cancelled", "rejected"].includes(status);

      const matchSearch = !q || norm(item.dataset.search).includes(q);
      const show = matchStatus && matchSearch;
      item.classList.toggle("d-none", !show);
      if (show) visible++;
    });

    if (appointmentCount)
      appointmentCount.textContent = `${visible} ${visible === 1 ? "موعد" : "مواعيد"}`;
    appointmentEmpty?.classList.toggle("d-none", visible !== 0);
  }

  appointmentButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      appointmentButtons.forEach((b) => {
        b.classList.remove("btn-primary", "active");
        b.classList.add("btn-light");
      });
      btn.classList.remove("btn-light");
      btn.classList.add("btn-primary", "active");
      appointmentFilter = btn.dataset.appointmentFilter || "all";
      filterAppointments();
    });
  });

  appointmentSearch?.addEventListener("input", filterAppointments);
});

document.addEventListener("DOMContentLoaded", () => {
  const languageButtons = [...document.querySelectorAll("[data-language]")];

  function setLanguageUI(lang) {
    document.querySelectorAll(".language-current").forEach((el) => {
      el.textContent = lang === "en" ? "EN" : "AR";
    });

    document
      .querySelectorAll(".language-menu [data-language]")
      .forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.language === lang);
      });

    document
      .querySelectorAll(".mobile-language-switch [data-language]")
      .forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.language === lang);
      });

    const toastEl = document.getElementById("appToast");
    if (toastEl) {
      const body = toastEl.querySelector(".toast-body");
      if (body) {
        body.textContent =
          lang === "en"
            ? "تم اختيار English — الترجمة الكاملة ستُربط لاحقاً."
            : "تم اختيار العربية.";
      }
      bootstrap.Toast.getOrCreateInstance(toastEl).show();
    }
  }

  languageButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setLanguageUI(btn.dataset.language || "ar");
    });
  });

  // Close mobile offcanvas when navigating through a link.
  const mobileOffcanvas = document.getElementById("mobilePatientNav");
  if (mobileOffcanvas) {
    mobileOffcanvas.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener("click", () => {
        const instance = bootstrap.Offcanvas.getInstance(mobileOffcanvas);
        if (instance) instance.hide();
      });
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const langButtons = [...document.querySelectorAll("[data-language]")];

  function updateLanguageSelection(lang) {
    document.querySelectorAll(".language-current").forEach((el) => {
      el.textContent = lang === "en" ? "EN" : "AR";
    });

    document.querySelectorAll(".language-option").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.language === lang);
    });

    document
      .querySelectorAll(".drawer-language-switch [data-language]")
      .forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.language === lang);
      });
  }

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      updateLanguageSelection(btn.dataset.language || "ar");
    });
  });
});

// =========================================================
// System-wide mobile table enhancement.
// Adds header labels to cells so every table becomes a card list on phones.
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("table:not([data-no-mobile-stack])")
    .forEach((table) => {
      table.classList.add("responsive-stack-table");

      const wrapper = table.closest(".table-responsive");
      if (wrapper) wrapper.classList.add("mobile-stack-wrapper");

      let headers = [...table.querySelectorAll("thead tr:first-child th")].map(
        (th) => th.textContent.replace(/\s+/g, " ").trim(),
      );

      // Fallback for tables without a formal THEAD.
      if (!headers.length) {
        const firstRow = table.querySelector("tr");
        if (firstRow) {
          headers = [...firstRow.children]
            .filter((cell) => cell.tagName === "TH")
            .map((th) => th.textContent.replace(/\s+/g, " ").trim());
        }
      }

      table.querySelectorAll("tbody tr").forEach((row) => {
        [...row.children].forEach((cell, index) => {
          if (cell.tagName !== "TD") return;
          if (cell.hasAttribute("colspan")) {
            cell.dataset.label = "";
            return;
          }
          if (!cell.dataset.label) {
            cell.dataset.label = headers[index] || "";
          }
        });
      });
    });
});

// =========================================================
// Dynamic-row mobile table observer.
// Keeps rows added by front-end demo actions responsive on phones.
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const relabel = (table) => {
    if (!table || table.hasAttribute("data-no-mobile-stack")) return;
    table.classList.add("responsive-stack-table");
    table.closest(".table-responsive")?.classList.add("mobile-stack-wrapper");

    const headers = [...table.querySelectorAll("thead tr:first-child th")].map(
      (th) => th.textContent.replace(/\s+/g, " ").trim(),
    );

    table.querySelectorAll("tbody tr").forEach((row) => {
      [...row.children].forEach((cell, index) => {
        if (cell.tagName !== "TD") return;
        cell.dataset.label = cell.hasAttribute("colspan")
          ? ""
          : headers[index] || "";
      });
    });
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches("table")) relabel(node);
        node.querySelectorAll?.("table").forEach(relabel);
        const parentTable = node.closest?.("table");
        if (parentTable) relabel(parentTable);
      });
    });
  });

  document.querySelectorAll("table").forEach(relabel);
  observer.observe(document.body, { childList: true, subtree: true });
});

// =========================================================
// V5 Table UI decorator — consistent tables across all roles.
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const decorateTable = (table) => {
    if (!table || table.hasAttribute("data-no-table-ui")) return;

    table.classList.add("system-data-table", "responsive-stack-table");
    const wrapper = table.closest(".table-responsive");
    if (wrapper)
      wrapper.classList.add("table-ui-shell", "mobile-stack-wrapper");

    const headers = [...table.querySelectorAll("thead tr:first-child th")].map(
      (th, i) => {
        const value = th.textContent.replace(/\s+/g, " ").trim();
        if (
          !value &&
          i === table.querySelectorAll("thead tr:first-child th").length - 1
        ) {
          th.textContent = "الإجراءات";
          return "الإجراءات";
        }
        return value;
      },
    );

    table.querySelectorAll("tbody tr").forEach((row) => {
      const cells = [...row.children].filter((c) => c.tagName === "TD");
      cells.forEach((cell, index) => {
        cell.dataset.label = cell.hasAttribute("colspan")
          ? ""
          : headers[index] || "";
        cell.classList.toggle(
          "table-primary-cell",
          index === 0 && !cell.hasAttribute("colspan"),
        );

        const hasStatusBadge = !!cell.querySelector(
          '.badge[class*="text-bg-"], .badge[class*="badge-soft"]',
        );
        if (hasStatusBadge && index !== 0)
          cell.classList.add("table-status-cell");

        const hasActions = !!cell.querySelector("button, a.btn, .dropdown");
        if (hasActions && index === cells.length - 1)
          cell.classList.add("table-actions-cell");
      });
    });
  };

  document.querySelectorAll("table").forEach(decorateTable);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches?.("table")) decorateTable(node);
        node.querySelectorAll?.("table").forEach(decorateTable);
        const table = node.closest?.("table");
        if (table) decorateTable(table);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
});

// =========================================================
// V6 Global action-group decorator
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const decorateActions = () => {
    document.querySelectorAll(".appointment-item .row").forEach((row) => {
      [...row.children].forEach((col) => {
        const actions = [
          ...col.querySelectorAll(
            ":scope > .btn, :scope > a.btn, :scope > button.btn",
          ),
        ];
        if (actions.length >= 2) col.classList.add("card-action-group");
      });
    });
    document
      .querySelectorAll("table.system-data-table tbody tr")
      .forEach((row) => {
        const cells = [...row.children].filter((x) => x.tagName === "TD");
        const last = cells[cells.length - 1];
        if (last && last.querySelector("button,a.btn")) {
          last.classList.add("table-actions-cell");
          const wrap = last.querySelector(":scope > .d-flex");
          if (wrap) wrap.classList.add("table-action-grid");
        }
      });
  };
  decorateActions();
  new MutationObserver(decorateActions).observe(document.body, {
    childList: true,
    subtree: true,
  });
});

// V6 appointment meta blocks
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".appointment-item .row").forEach((row) => {
    const cols = [...row.children];
    cols.forEach((col, i) => {
      if (
        i > 0 &&
        !col.classList.contains("card-action-group") &&
        !col.querySelectorAll(
          ":scope > .btn,:scope > a.btn,:scope > button.btn",
        ).length
      ) {
        col.classList.add("entity-meta-block");
      }
    });
  });
});

// =========================================================
// V11 wide-table classifier: removes horizontal scrolling by
// switching 6/7+ column tables to responsive card grids.
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const classifyWideTable = (table) => {
    if (!table || table.hasAttribute("data-no-responsive-cards")) return;
    const headers = [...table.querySelectorAll("thead tr:first-child th")];
    const count = headers.length;
    table.classList.toggle("wide-data-table", count >= 7);
    table.classList.toggle("medium-data-table", count === 6);
  };

  document.querySelectorAll("table").forEach(classifyWideTable);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) =>
      m.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches?.("table")) classifyWideTable(node);
        node.querySelectorAll?.("table").forEach(classifyWideTable);
        const parent = node.closest?.("table");
        if (parent) classifyWideTable(parent);
      }),
    );
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
