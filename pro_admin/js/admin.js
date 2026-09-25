
document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("userSearch");
  if (search) {
    const cards = [...document.querySelectorAll("#userList .user-card")];
    const buttons = [...document.querySelectorAll("[data-filter]")];
    let type = "doctors";
    const render = () => {
      const q = search.value.trim().toLowerCase();
      cards.forEach(card => {
        const matchType = card.dataset.type === type;
        const matchSearch = !q || (card.dataset.search || "").toLowerCase().includes(q);
        card.style.display = matchType && matchSearch ? "flex" : "none";
      });
    };
    buttons.forEach(btn => btn.addEventListener("click", () => {
      type = btn.dataset.filter;
      buttons.forEach(b => b.classList.toggle("btn-primary", b === btn));
      buttons.forEach(b => b.classList.toggle("btn-blue-soft", b !== btn));
      render();
    }));
    search.addEventListener("input", render);
    render();
  }

  document.querySelectorAll("[data-toast]").forEach(btn => {
    btn.addEventListener("click", () => {
      const msg = btn.dataset.toast;
      const toast = document.createElement("div");
      toast.className = "admin-toast";
      toast.textContent = msg;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2200);
    });
  });

  const form = document.getElementById("settingsForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const toast = document.createElement("div");
      toast.className = "admin-toast";
      toast.textContent = "تم حفظ التغييرات";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2200);
    });
  }

  const current = location.pathname.split("/").pop();
  document.querySelectorAll(".admin-nav-item").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === current);
  });
});
