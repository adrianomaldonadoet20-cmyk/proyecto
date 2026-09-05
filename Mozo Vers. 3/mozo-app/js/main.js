// =============================================================
// MOZO — datos de ejemplo (mock data). En una versión real esto
// vendría de la base de datos (Supabase) en vez de estar escrito acá.
// =============================================================

const PLACES = [
  { id: 1, name: "La Parrilla del Barrio", cuisine: "Parrilla argentina", icon: "🥩", tip: "Pedí el bife de chorizo, no falla.", rating: "4.8", distance: "6 cuadras", bg: "#FDE4E5" },
  { id: 2, name: "Fideo Suelto", cuisine: "Pastas caseras", icon: "🍝", tip: "Los sorrentinos de jamón y queso son la estrella.", rating: "4.6", distance: "10 cuadras", bg: "#FCEFC2" },
  { id: 3, name: "Verde Manzana", cuisine: "Vegetariano", icon: "🥗", tip: "Bowl de garbanzos con salsa tahini, ideal al mediodía.", rating: "4.7", distance: "4 cuadras", bg: "#DCF3E6" },
  { id: 4, name: "Sushi Local", cuisine: "Sushi", icon: "🍣", tip: "Promo 30 piezas los martes y jueves.", rating: "4.5", distance: "8 cuadras", bg: "#E4E7F7" },
  { id: 5, name: "Café del Sur", cuisine: "Café y brunch", icon: "☕", tip: "Las tostadas con palta se piden solas.", rating: "4.9", distance: "3 cuadras", bg: "#FDE9D9" },
];

const MENU = [
  { name: "Plato principal del día", price: 6800 },
  { name: "Entrada para compartir", price: 3200 },
  { name: "Bebida sin alcohol", price: 1800 },
  { name: "Postre de la casa", price: 2600 },
];

// La ubicación de entrega ya no usa una lista fija de barrios: se busca
// con un servicio real de geocodificación (Nominatim / OpenStreetMap).
// Ver la sección "Ubicación de entrega" más abajo.

// =============================================================
// Utilidades compartidas
// =============================================================
function money(n) {
  return "$" + n.toLocaleString("es-AR");
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

// =============================================================
// Comandas — puente entre el portal cliente y el panel admin.
// Como es front-end puro (sin backend), usamos localStorage para
// que un pedido confirmado en cliente.html aparezca al instante
// en admin.html (incluso si están abiertos en pestañas distintas
// del mismo navegador). El día que haya backend (Supabase), esto
// se reemplaza por lecturas/escrituras reales a la base de datos.
// =============================================================
const ORDERS_KEY = "mozo_orders";
const ORDERS_SEQ_KEY = "mozo_orders_seq";

const TABLES_KEY = "mozo_tables";
const RESERVATION_KEY = "mozo_saved_reservation";
const DEFAULT_TABLES = [
  { name: "Mesa 1", status: "free" },
  { name: "Mesa 2", status: "occupied" },
  { name: "Mesa 3", status: "reserved" },
  { name: "Mesa 4", status: "occupied" },
  { name: "Mesa 5", status: "free" },
  { name: "Mesa 6", status: "reserved" },
  { name: "Mesa 7", status: "occupied" },
];

function loadTables() {
  try {
    const raw = localStorage.getItem(TABLES_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_TABLES.slice();
  } catch (e) {
    return DEFAULT_TABLES.slice();
  }
}

function saveTables(list) {
  localStorage.setItem(TABLES_KEY, JSON.stringify(list));
}

function generateReservationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return "MZ-" + code;
}

function saveReservationCode(order) {
  try {
    localStorage.setItem(RESERVATION_KEY, JSON.stringify({
      reservationCode: order.reservationCode,
      table: order.table,
      time: order.time,
      guests: order.guests
    }));
  } catch (e) {}
}

function loadReservationCode() {
  try {
    const raw = localStorage.getItem(RESERVATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function loadOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function nextOrderId() {
  let seq = parseInt(localStorage.getItem(ORDERS_SEQ_KEY), 10);
  if (isNaN(seq)) seq = 230;
  seq += 1;
  localStorage.setItem(ORDERS_SEQ_KEY, String(seq));
  return String(seq).padStart(4, "0");
}

// Preferencias de comida cargadas al registrarse. Igual que con los
// pedidos, es solo localStorage (mock) hasta que haya backend real.
const USER_PREFS_KEY = "mozo_user_prefs";

function saveUserPrefs(profile) {
  try {
    localStorage.setItem(USER_PREFS_KEY, JSON.stringify(profile));
  } catch (e) {
    // localStorage puede fallar en modo incógnito con espacio agotado; se ignora.
  }
}

// Usuario con sesión iniciada (mock, front-end puro). Guarda los datos
// que se muestran en el ícono de perfil: nombre, DNI y dirección.
const CURRENT_USER_KEY = "mozo_current_user";

function saveCurrentUser(user) {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (e) {
    // Se ignora si localStorage no está disponible.
  }
}

function loadCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function currentTimeLabel() {
  const now = new Date();
  return now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

// =============================================================
// "Soy un local" (menú ⋮ del portal cliente) — pide usuario y
// contraseña antes de entrar al panel admin. Por ahora, credenciales
// fijas de ejemplo (mock, sin backend): admin / 1234.
// =============================================================
const soyLocalBtn = document.getElementById("soyLocalBtn");

if (soyLocalBtn) {
  const ADMIN_USER = "admin";
  const ADMIN_PASSWORD = "1234";
  const adminLoginModal = document.getElementById("adminLoginModal");
  const adminUserInput = document.getElementById("adminUserInput");
  const adminPassInput = document.getElementById("adminPassInput");
  const adminLoginError = document.getElementById("adminLoginError");
  const adminLoginSubmit = document.getElementById("adminLoginSubmit");
  const adminLoginClose = document.getElementById("adminLoginClose");

  function openAdminLoginModal() {
    adminLoginModal.classList.add("open");
    adminLoginError.style.display = "none";
    adminUserInput.value = "";
    adminPassInput.value = "";
    setTimeout(() => adminUserInput.focus(), 100);
  }

  function closeAdminLoginModal() {
    adminLoginModal.classList.remove("open");
  }

  function tryAdminLogin() {
    const user = adminUserInput.value.trim();
    const pass = adminPassInput.value;
    if (user === ADMIN_USER && pass === ADMIN_PASSWORD) {
      window.location.href = "admin.html";
    } else {
      adminLoginError.style.display = "block";
      adminPassInput.value = "";
      adminPassInput.focus();
    }
  }

  soyLocalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const dropdown = document.getElementById("navMenuDropdown");
    const menuBtn = document.getElementById("navMenuBtn");
    if (dropdown) dropdown.classList.remove("open");
    if (menuBtn) { menuBtn.classList.remove("active"); menuBtn.setAttribute("aria-expanded", "false"); }
    openAdminLoginModal();
  });

  adminLoginClose.addEventListener("click", closeAdminLoginModal);
  adminLoginModal.addEventListener("click", (e) => { if (e.target === adminLoginModal) closeAdminLoginModal(); });
  adminLoginSubmit.addEventListener("click", tryAdminLogin);
  [adminUserInput, adminPassInput].forEach(input => {
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") tryAdminLogin(); });
  });
}

// =============================================================
// Menú "⋮" del top-nav (ej: "Soy un local" en el portal cliente)
// =============================================================
const navMenuBtn = document.getElementById("navMenuBtn");

if (navMenuBtn) {
  const navMenu = document.getElementById("navMenu");
  const navMenuDropdown = document.getElementById("navMenuDropdown");

  function closeNavMenu() {
    navMenuDropdown.classList.remove("open");
    navMenuBtn.classList.remove("active");
    navMenuBtn.setAttribute("aria-expanded", "false");
  }

  navMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = navMenuDropdown.classList.toggle("open");
    navMenuBtn.classList.toggle("active", isOpen);
    navMenuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target)) closeNavMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNavMenu();
  });
}

// =============================================================
// Ícono de perfil (arriba a la izquierda) — muestra DNI, nombre
// y dirección del usuario con sesión iniciada.
// =============================================================
const profileBtn = document.getElementById("profileBtn");
let refreshProfileDropdown = null;

if (profileBtn) {
  const profileMenu = document.getElementById("profileMenu");
  const profileDropdown = document.getElementById("profileDropdown");
  const profileDropdownBody = document.getElementById("profileDropdownBody");
  const profileEditBtn = document.getElementById("profileEditBtn");

  refreshProfileDropdown = function () {
    const user = loadCurrentUser();
    if (!user) {
      if (profileEditBtn) profileEditBtn.style.display = "none";
      profileDropdownBody.innerHTML = `
        <p class="profile-empty">Todavía no iniciaste sesión.</p>
        <button type="button" class="btn btn-navy btn-sm btn-block" id="profileLoginBtn">Iniciar sesión</button>
      `;
      const loginBtn = document.getElementById("profileLoginBtn");
      if (loginBtn) {
        loginBtn.addEventListener("click", () => {
          closeProfileDropdown();
          const loginModal = document.getElementById("loginModal");
          if (loginModal) loginModal.classList.add("open");
        });
      }
      return;
    }
    if (profileEditBtn) profileEditBtn.style.display = "flex";
    profileDropdownBody.innerHTML = `
      <div class="profile-dropdown-row"><span>NOMBRE</span><strong>${user.name}</strong></div>
      <div class="profile-dropdown-row"><span>DNI</span><strong>${user.dni}</strong></div>
      <div class="profile-dropdown-row"><span>DIRECCIÓN</span><strong>${user.address}</strong></div>
    `;
  };

  function closeProfileDropdown() {
    profileDropdown.classList.remove("open");
    profileBtn.classList.remove("active");
    profileBtn.setAttribute("aria-expanded", "false");
  }

  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    refreshProfileDropdown();
    const isOpen = profileDropdown.classList.toggle("open");
    profileBtn.classList.toggle("active", isOpen);
    profileBtn.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (e) => {
    if (!profileMenu.contains(e.target)) closeProfileDropdown();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProfileDropdown();
  });

  // ----- Editar mis datos (nombre, DNI, dirección) -----
  if (profileEditBtn) {
    const editProfileModal = document.getElementById("editProfileModal");
    const editNameInput = document.getElementById("editNameInput");
    const editDniInput = document.getElementById("editDniInput");
    const editAddressInput = document.getElementById("editAddressInput");
    const editProfileError = document.getElementById("editProfileError");
    const editProfileSubmit = document.getElementById("editProfileSubmit");
    const editProfileClose = document.getElementById("editProfileClose");

    editDniInput.addEventListener("input", () => {
      editDniInput.value = editDniInput.value.replace(/[^0-9]/g, "").slice(0, 8);
    });

    profileEditBtn.addEventListener("click", () => {
      const user = loadCurrentUser();
      if (!user) return;
      editNameInput.value = user.name || "";
      editDniInput.value = user.dni || "";
      editAddressInput.value = user.address || "";
      editProfileError.style.display = "none";
      closeProfileDropdown();
      editProfileModal.classList.add("open");
      setTimeout(() => editNameInput.focus(), 100);
    });

    editProfileClose.addEventListener("click", () => editProfileModal.classList.remove("open"));
    editProfileModal.addEventListener("click", (e) => {
      if (e.target === editProfileModal) editProfileModal.classList.remove("open");
    });

    editProfileSubmit.addEventListener("click", () => {
      const name = editNameInput.value.trim();
      const dni = editDniInput.value.trim();
      const address = editAddressInput.value.trim();

      if (!name || !dni || !address) {
        editProfileError.style.display = "block";
        return;
      }
      editProfileError.style.display = "none";

      saveCurrentUser({ name, dni, address });

      // Si además existen preferencias guardadas (mozo_user_prefs), se
      // actualizan para que ambas fuentes queden consistentes.
      try {
        const raw = localStorage.getItem(USER_PREFS_KEY);
        if (raw) {
          const prefs = JSON.parse(raw);
          saveUserPrefs({ ...prefs, name, dni, address });
        }
      } catch (e) {}

      editProfileModal.classList.remove("open");
      showToast("Datos actualizados ✓");
    });
  }
}

// =============================================================
// PORTAL CLIENTE
// =============================================================
const placeGrid = document.getElementById("place-grid");

if (placeGrid) {
  const placeCountEl = document.getElementById("place-count");

  function renderPlaceGrid(list) {
    placeGrid.innerHTML = "";

    if (list.length === 0) {
      placeGrid.innerHTML = `
        <p style="grid-column: 1 / -1; text-align: center; color: var(--ink-soft); padding: 40px 10px; font-size: 0.95rem;">
          No encontramos locales para tu búsqueda. Probá con "Parrilla argentina", "Pastas caseras", "Vegetariano", "Sushi" o "Café y brunch".
        </p>`;
    } else {
      list.forEach(place => {
        const card = document.createElement("div");
        card.className = "place-card";
        card.innerHTML = `
          <div class="place-media" style="background:${place.bg}">${place.icon}</div>
          <div class="place-body">
            <div class="place-cuisine">${place.cuisine}</div>
            <h3>${place.name}</h3>
            <p class="place-tip">${place.tip}</p>
            <div class="place-meta">
              <span>⭐ ${place.rating}</span>
              <span>${place.distance}</span>
            </div>
            <div class="place-actions">
              <button class="btn btn-ghost btn-sm" data-place="${place.id}" data-mode="dine">Reservar mesa</button>
              <button class="btn btn-coral btn-sm" data-place="${place.id}" data-mode="takeout">Pedir</button>
            </div>
          </div>
        `;
        placeGrid.appendChild(card);
      });
    }

    placeCountEl.textContent = list.length + (list.length === 1 ? " local" : " locales");
  }

  renderPlaceGrid(PLACES);

  // ----- Buscador -----
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  function applySearch() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      renderPlaceGrid(PLACES);
      return;
    }
    const filtered = PLACES.filter(place =>
      place.cuisine.toLowerCase().includes(q) || place.name.toLowerCase().includes(q)
    );
    renderPlaceGrid(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applySearch);
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); applySearch(); }
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => { e.preventDefault(); applySearch(); });
  }

  // Filtro chips
  document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      // El chip "Todos" limpia la búsqueda y muestra todo de nuevo
      if (chip.textContent.trim() === "Todos") {
        if (searchInput) searchInput.value = "";
        renderPlaceGrid(PLACES);
      }
    });
  });

  // Apartado "Filtros" plegable: el ícono de 3 rayas oculta/muestra los chips
  const filtersToggle = document.getElementById("filtersToggle");
  const filtersChips = document.getElementById("filtersChips");
  if (filtersToggle && filtersChips) {
    filtersToggle.addEventListener("click", () => {
      const isOpen = filtersToggle.getAttribute("aria-expanded") === "true";
      filtersToggle.setAttribute("aria-expanded", String(!isOpen));
      filtersChips.classList.toggle("collapsed", isOpen);
    });
  }

  // ----- Modal de reserva / pedido -----
  const modal = document.getElementById("orderModal");
  const modalPlaceName = document.getElementById("modalPlaceName");
  const modalityToggle = document.getElementById("modalityToggle");
  const dateTimeLabel = document.getElementById("dateTimeLabel");
  const menuListEl = document.getElementById("menuList");
  const modalTotal = document.getElementById("modalTotal");
  const tableInput = document.getElementById("tableInput");
  const guestsInput = document.getElementById("guestsInput");
  const tableAvailabilityHint = document.getElementById("tableAvailabilityHint");
  const reservationCodeModal = document.getElementById("reservationCodeModal");
  const reservationCodeValue = document.getElementById("reservationCodeValue");
  const reservationSummary = document.getElementById("reservationSummary");
  const reservationAccessBtn = document.getElementById("reservationAccessBtn");
  const savedReservationModal = document.getElementById("savedReservationModal");
  const savedReservationCode = document.getElementById("savedReservationCode");
  const savedReservationSummary = document.getElementById("savedReservationSummary");

  let currentMode = "dine";
  let cart = {}; // { itemIndex: qty }

  function renderMenu() {
    menuListEl.innerHTML = "";
    MENU.forEach((item, i) => {
      const qty = cart[i] || 0;
      const row = document.createElement("div");
      row.className = "menu-item";
      row.innerHTML = `
        <div>
          <div class="menu-item-name">${item.name}</div>
          <div class="menu-item-price">${money(item.price)}</div>
        </div>
        <div class="qty-control">
          <button type="button" data-action="minus" data-i="${i}">−</button>
          <span id="qty-${i}">${qty}</span>
          <button type="button" data-action="plus" data-i="${i}">+</button>
        </div>
      `;
      menuListEl.appendChild(row);
    });
  }

  function updateTotal() {
    let total = 0;
    Object.entries(cart).forEach(([i, qty]) => { total += MENU[i].price * qty; });
    modalTotal.textContent = money(total);
  }

  menuListEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const i = btn.dataset.i;
    const current = cart[i] || 0;
    if (btn.dataset.action === "plus") cart[i] = current + 1;
    if (btn.dataset.action === "minus") cart[i] = Math.max(0, current - 1);
    document.getElementById(`qty-${i}`).textContent = cart[i];
    updateTotal();
  });

  function renderAvailableTables() {
    if (!tableInput) return;
    const tables = loadTables();
    const available = tables.filter(t => t.status === "free");
    tableInput.innerHTML = `<option value="">Seleccioná una mesa</option>` +
      available.map(t => `<option value="${t.name}">${t.name}</option>`).join("");
    tableInput.disabled = available.length === 0;
    tableAvailabilityHint.textContent = available.length
      ? `${available.length} mesa${available.length === 1 ? "" : "s"} disponible${available.length === 1 ? "" : "s"} ahora.`
      : "No hay mesas disponibles en este momento.";
  }

  function openReservationCode(order) {
    if (!reservationCodeModal) return;
    reservationCodeValue.textContent = order.reservationCode;
    reservationSummary.innerHTML = `<strong>${order.table}</strong><br>${order.time} · ${order.guests}`;
    reservationCodeModal.classList.add("open");
  }

  function refreshSavedReservationAccess() {
    if (!reservationAccessBtn) return;
    reservationAccessBtn.style.display = loadReservationCode()?.reservationCode ? "inline-flex" : "none";
  }

  function openSavedReservation() {
    const reservation = loadReservationCode();
    if (!reservation || !savedReservationModal) return;
    savedReservationCode.textContent = reservation.reservationCode || "-";
    savedReservationSummary.innerHTML = reservation.table
      ? `<strong>${reservation.table}</strong><br>${reservation.time || "-"} · ${reservation.guests || "-"}`
      : "";
    savedReservationModal.classList.add("open");
  }

  refreshSavedReservationAccess();

  function openModal(placeId, mode) {
    const place = PLACES.find(p => p.id == placeId);
    modalPlaceName.textContent = place ? place.name : "Local";
    setMode(mode || "dine");
    cart = {};
    renderMenu();
    updateTotal();
    if (mode === "dine") renderAvailableTables();
    modal.classList.add("open");
  }

  function setMode(mode) {
    currentMode = mode;
    modalityToggle.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
    dateTimeLabel.textContent = mode === "dine" ? "Horario de llegada" : "Horario de retiro";
    const tableField = document.getElementById("tableField");
    if (tableField) tableField.style.display = mode === "dine" ? "" : "none";
    if (mode === "dine") renderAvailableTables();
  }

  document.body.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-place]");
    if (trigger) openModal(trigger.dataset.place, trigger.dataset.mode);
  });

  modalityToggle.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-mode]");
    if (btn) setMode(btn.dataset.mode);
  });

  document.getElementById("modalClose").addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });

  document.getElementById("confirmOrder").addEventListener("click", () => {
    const timeInput = document.getElementById("timeInput");
    const timeValue = (timeInput && timeInput.value) ? timeInput.value : currentTimeLabel();
    const guestsValue = guestsInput ? guestsInput.value : "2 personas";
    const selectedTable = tableInput ? tableInput.value : "";

    if (currentMode === "dine" && !selectedTable) {
      showToast("Elegí una mesa disponible para continuar.");
      if (tableInput) tableInput.focus();
      return;
    }

    // Volvemos a comprobar la mesa justo al confirmar para evitar
    // reservar una mesa que se ocupó desde otra pestaña.
    if (currentMode === "dine") {
      const latestTables = loadTables();
      const table = latestTables.find(t => t.name === selectedTable);
      if (!table || table.status !== "free") {
        renderAvailableTables();
        showToast("Esa mesa ya no está disponible. Elegí otra.");
        return;
      }
    }

    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([i, qty]) => [qty + "x", MENU[i].name]);

    const order = {
      id: nextOrderId(),
      mode: currentMode,
      table: currentMode === "dine" ? selectedTable : "Retiro " + timeValue,
      time: currentMode === "dine" ? timeValue : currentTimeLabel(),
      guests: currentMode === "dine" ? guestsValue : null,
      reservationCode: currentMode === "dine" ? generateReservationCode() : null,
      status: "new",
      items: items.length ? items : [["", "Pedirá al llegar / sin platos elegidos"]],
    };

    const orders = loadOrders();
    orders.unshift(order);
    saveOrders(orders);

    if (currentMode === "dine") {
      const tables = loadTables();
      const table = tables.find(t => t.name === selectedTable);
      if (table) {
        table.status = "reserved";
        saveTables(tables);
      }
    }

    modal.classList.remove("open");

    if (currentMode === "dine") {
      saveReservationCode(order);
      refreshSavedReservationAccess();
      openReservationCode(order);
    } else {
      showToast(`¡Pedido #${order.id} confirmado! Te esperamos para que lo retires.`);
    }
  });

  if (reservationCodeModal) {
    const closeReservationCode = () => reservationCodeModal.classList.remove("open");
    document.getElementById("reservationCodeClose").addEventListener("click", closeReservationCode);
    document.getElementById("reservationCodeCloseBtn").addEventListener("click", closeReservationCode);
    reservationCodeModal.addEventListener("click", (e) => {
      if (e.target === reservationCodeModal) closeReservationCode();
    });
  }

  if (reservationAccessBtn && savedReservationModal) {
    const closeSavedReservation = () => savedReservationModal.classList.remove("open");
    reservationAccessBtn.addEventListener("click", openSavedReservation);
    document.getElementById("savedReservationClose").addEventListener("click", closeSavedReservation);
    document.getElementById("savedReservationCloseBtn").addEventListener("click", closeSavedReservation);
    savedReservationModal.addEventListener("click", (e) => {
      if (e.target === savedReservationModal) closeSavedReservation();
    });
  }

  // ----- Acceso: login / registro -----
  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");
  const forgotPasswordModal = document.getElementById("forgotPasswordModal");

  function closeAllAuthModals() {
    [loginModal, registerModal, forgotPasswordModal].forEach(m => m && m.classList.remove("open"));
  }

  if (registerModal) {
    // Apenas se entra al portal cliente, va directo a la pantalla de
    // registro (antes había un paso intermedio para elegir entre
    // iniciar sesión o registrarse).
    registerModal.classList.add("open");

    document.getElementById("loginModalClose").addEventListener("click", closeAllAuthModals);
    document.getElementById("registerModalClose").addEventListener("click", closeAllAuthModals);
    document.getElementById("forgotModalClose").addEventListener("click", () => {
      forgotPasswordModal.classList.remove("open");
      loginModal.classList.add("open");
    });

    document.getElementById("goToRegisterBtn").addEventListener("click", (e) => {
      e.preventDefault();
      loginModal.classList.remove("open");
      registerModal.classList.add("open");
    });
    document.getElementById("goToLoginBtn").addEventListener("click", (e) => {
      e.preventDefault();
      registerModal.classList.remove("open");
      loginModal.classList.add("open");
    });
    document.getElementById("forgotPasswordBtn").addEventListener("click", (e) => {
      e.preventDefault();
      loginModal.classList.remove("open");
      forgotPasswordModal.classList.add("open");
    });

    // DNI: solo números
    const loginDniInput = document.getElementById("loginDniInput");
    const registerDniInput = document.getElementById("registerDniInput");
    [loginDniInput, registerDniInput].forEach(input => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^0-9]/g, "").slice(0, 8);
      });
    });

    // Preferencias de comida: el selector de "punto de la carne" solo
    // aparece si la persona marcó la opción "Carne".
    const prefCarneCheck = document.getElementById("prefCarneCheck");
    const pointFieldWrap = document.getElementById("pointFieldWrap");
    if (prefCarneCheck && pointFieldWrap) {
      prefCarneCheck.addEventListener("change", () => {
        pointFieldWrap.classList.toggle("show", prefCarneCheck.checked);
      });
    }

    document.getElementById("loginSubmitBtn").addEventListener("click", () => {
      const name = document.getElementById("loginNameInput").value.trim();
      const dni = loginDniInput.value.trim();
      const address = document.getElementById("loginAddressInput").value.trim();
      const pass = document.getElementById("loginPasswordInput").value;
      const err = document.getElementById("loginError");

      if (!name || !dni || !address || !pass) {
        err.style.display = "block";
        return;
      }
      err.style.display = "none";
      saveCurrentUser({ name, dni, address });
      if (typeof refreshProfileDropdown === "function") refreshProfileDropdown();
      closeAllAuthModals();
      showToast(`¡Hola de nuevo, ${name}! ✓`);
    });

    document.getElementById("registerSubmitBtn").addEventListener("click", () => {
      const email = document.getElementById("registerEmailInput").value.trim();
      const name = document.getElementById("registerNameInput").value.trim();
      const dni = registerDniInput.value.trim();
      const address = document.getElementById("registerAddressInput").value.trim();
      const pass = document.getElementById("registerPasswordInput").value;
      const err = document.getElementById("registerError");
      const isGmail = /^[^\s@]+@gmail\.com$/i.test(email);

      // Preferencias de comida elegidas (checkboxes, multi-selección)
      const foodPrefs = Array.from(
        document.querySelectorAll("#registerFoodPrefs input[type='checkbox']:checked")
      ).map(input => input.value);
      const carnePunto = document.getElementById("registerCarnePuntoInput").value;

      if (!isGmail || !name || !dni || !address || !pass) {
        err.textContent = !isGmail ? "Ingresá un correo de Gmail válido (@gmail.com)." : "Completá todos los campos.";
        err.style.display = "block";
        return;
      }
      err.style.display = "none";

      // Se guarda junto con el resto de los datos de la cuenta (mock,
      // front-end puro — ver saveUserPrefs()).
      saveUserPrefs({ name, email, dni, address, foodPrefs, carnePunto });
      saveCurrentUser({ name, dni, address });
      if (typeof refreshProfileDropdown === "function") refreshProfileDropdown();

      closeAllAuthModals();
      showToast(`¡Cuenta creada! Bienvenido/a, ${name} ✓`);
    });

    document.getElementById("forgotSubmitBtn").addEventListener("click", () => {
      const email = document.getElementById("forgotEmailInput").value.trim();
      const err = document.getElementById("forgotError");
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isValidEmail) {
        err.style.display = "block";
        return;
      }
      err.style.display = "none";
      forgotPasswordModal.classList.remove("open");
      loginModal.classList.add("open");
      showToast("Código enviado a tu correo ✓");
    });
  }

  // ----- Ubicación de entrega -----
  // Geocodificación real vía Nominatim (OpenStreetMap) — sin backend propio,
  // pero ya no es una lista fija: busca cualquier dirección y también puede
  // usar la ubicación actual del dispositivo (geolocalización + reverse geocoding).
  const locationBtn = document.getElementById("locationBtn");

  if (locationBtn) {
    const locationModal = document.getElementById("locationModal");
    const locationSearchInput = document.getElementById("locationSearchInput");
    const locationSuggestionsEl = document.getElementById("locationSuggestions");
    const confirmLocationBtn = document.getElementById("confirmLocationBtn");
    const locationLabel = document.getElementById("locationLabel");
    const useCurrentLocationBtn = document.getElementById("useCurrentLocationBtn");

    const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

    let leafletMap = null;
    let leafletMarker = null;
    let selectedLocation = null;
    let searchDebounce = null;
    let searchSeq = 0; // evita que una respuesta vieja pise a una más nueva

    function initMap(lat, lng, zoom) {
      if (typeof L === "undefined") return; // Sin conexión a internet no carga Leaflet
      if (!leafletMap) {
        leafletMap = L.map("locationMap", { zoomControl: false, attributionControl: false }).setView([lat, lng], zoom);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(leafletMap);
        leafletMarker = L.marker([lat, lng]).addTo(leafletMap);
      } else {
        leafletMap.setView([lat, lng], zoom);
        leafletMarker.setLatLng([lat, lng]);
      }
      setTimeout(() => leafletMap.invalidateSize(), 200);
    }

    function renderMessage(msg) {
      locationSuggestionsEl.innerHTML = `<p style="padding: 10px 8px; font-size: 0.85rem; color: var(--ink-soft);">${msg}</p>`;
    }

    function renderSuggestions(list) {
      if (!list.length) {
        renderMessage("No encontramos resultados. Probá con una dirección más completa.");
        return;
      }
      locationSuggestionsEl.innerHTML = list.map(loc => `
        <div class="location-suggestion-item" data-lat="${loc.lat}" data-lng="${loc.lng}" data-name="${loc.name.replace(/"/g, "&quot;")}">
          <span class="pin">📍</span>
          <span>
            <div class="loc-name">${loc.name}</div>
            <div class="loc-detail">${loc.detail}</div>
          </span>
        </div>
      `).join("");
    }

    // Nominatim pide un User-Agent/Referer razonable y nada de spamear
    // requests: por eso el input está debounced (ver más abajo).
    async function geocode(query) {
      const seq = ++searchSeq;
      const url = `${NOMINATIM_URL}/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=ar&q=${encodeURIComponent(query)}`;
      try {
        const res = await fetch(url, { headers: { "Accept-Language": "es-AR" } });
        if (!res.ok) throw new Error("geocoding failed");
        const data = await res.json();
        if (seq !== searchSeq) return; // llegó tarde, ya hay una búsqueda más nueva
        const results = data.map(r => ({
          name: (r.address && (r.address.road || r.address.suburb || r.address.neighbourhood))
            ? [r.address.road, r.address.house_number].filter(Boolean).join(" ") || r.display_name.split(",")[0]
            : r.display_name.split(",")[0],
          detail: r.display_name,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
        }));
        renderSuggestions(results);
      } catch (e) {
        if (seq !== searchSeq) return;
        renderMessage("No pudimos buscar direcciones ahora. Revisá tu conexión a internet.");
      }
    }

    async function reverseGeocode(lat, lng) {
      const url = `${NOMINATIM_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      try {
        const res = await fetch(url, { headers: { "Accept-Language": "es-AR" } });
        if (!res.ok) throw new Error("reverse geocoding failed");
        const r = await res.json();
        const addr = r.address || {};
        const name = [addr.road, addr.house_number].filter(Boolean).join(" ")
          || addr.suburb || addr.neighbourhood || r.display_name.split(",")[0];
        return { name, detail: r.display_name };
      } catch (e) {
        return { name: "Mi ubicación actual", detail: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
      }
    }

    function selectLocation(loc) {
      selectedLocation = loc;
      locationSearchInput.value = loc.name;
      initMap(loc.lat, loc.lng, 15);
      confirmLocationBtn.disabled = false;
    }

    locationBtn.addEventListener("click", () => {
      locationModal.classList.add("open");
      locationSearchInput.value = "";
      renderMessage("Escribí una dirección o barrio para buscar.");
      confirmLocationBtn.disabled = true;
      selectedLocation = null;
      initMap(-34.6037, -58.3816, 12); // Centro de Buenos Aires
      setTimeout(() => locationSearchInput.focus(), 150);
    });

    document.getElementById("locationModalClose").addEventListener("click", () => locationModal.classList.remove("open"));
    locationModal.addEventListener("click", (e) => { if (e.target === locationModal) locationModal.classList.remove("open"); });

    locationSearchInput.addEventListener("input", () => {
      const q = locationSearchInput.value.trim();
      confirmLocationBtn.disabled = true;
      selectedLocation = null;
      clearTimeout(searchDebounce);
      if (!q) {
        renderMessage("Escribí una dirección o barrio para buscar.");
        return;
      }
      if (q.length < 3) return;
      renderMessage("Buscando…");
      searchDebounce = setTimeout(() => geocode(q), 450);
    });

    locationSuggestionsEl.addEventListener("click", (e) => {
      const item = e.target.closest(".location-suggestion-item");
      if (!item) return;
      const lat = parseFloat(item.dataset.lat);
      const lng = parseFloat(item.dataset.lng);
      const name = item.dataset.name;
      selectLocation({ name, lat, lng });
      document.querySelectorAll(".location-suggestion-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
    });

    if (useCurrentLocationBtn) {
      useCurrentLocationBtn.addEventListener("click", () => {
        if (!("geolocation" in navigator)) {
          renderMessage("Tu navegador no soporta geolocalización.");
          return;
        }
        useCurrentLocationBtn.disabled = true;
        useCurrentLocationBtn.textContent = "Buscando tu ubicación…";
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            const info = await reverseGeocode(lat, lng);
            selectLocation({ name: info.name, lat, lng });
            renderSuggestions([{ name: info.name, detail: info.detail, lat, lng }]);
            useCurrentLocationBtn.disabled = false;
            useCurrentLocationBtn.textContent = "📍 Usar mi ubicación actual";
          },
          () => {
            renderMessage("No pudimos acceder a tu ubicación. Revisá los permisos del navegador.");
            useCurrentLocationBtn.disabled = false;
            useCurrentLocationBtn.textContent = "📍 Usar mi ubicación actual";
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }

    confirmLocationBtn.addEventListener("click", () => {
      if (!selectedLocation) return;
      locationLabel.textContent = selectedLocation.name;
      locationModal.classList.remove("open");
      showToast(`Ubicación actualizada: ${selectedLocation.name} ✓`);
    });
  }
}

// =============================================================
// PANEL ADMIN
// =============================================================
const board = document.getElementById("board");

if (board) {
  // Los pedidos ya no son datos de ejemplo: arrancan vacíos y se llenan
  // con lo que el cliente va confirmando desde cliente.html (ver ORDERS_KEY).
  let orders = loadOrders();

  // Mesas: comparten estado con el portal cliente mediante localStorage.
  let TABLES = loadTables();

  const STATUS_LABEL = { free: "Libre", occupied: "Ocupada", reserved: "Reservada" };

  function renderTables() {
    const el = document.getElementById("tableList");
    el.innerHTML = TABLES.map((t, index) => `
      <div class="table-row table-row-clickable" data-table-index="${index}" tabindex="0" aria-label="${t.name}">
        <span class="table-name">${t.name}</span>
        <button type="button" class="table-details-btn" data-table-details="${index}">Detalles</button>
        <span class="table-status ${t.status}">${STATUS_LABEL[t.status]}</span>
        <button type="button" class="table-delete-btn" data-delete-table="${index}"
          ${t.status !== "free" ? "disabled" : ""} aria-label="Eliminar ${t.name}" title="${t.status === "free" ? "Eliminar mesa" : "No se puede eliminar una mesa ocupada o reservada"}">−</button>
      </div>
    `).join("");

    const tableCountEl = document.getElementById("tableCount");
    if (tableCountEl) tableCountEl.textContent = TABLES.length;
  }

  const addTableBtn = document.getElementById("addTableBtn");

  if (addTableBtn) {
    addTableBtn.addEventListener("click", () => {
      const usedNumbers = TABLES.map(t => parseInt(String(t.name).replace(/\D/g, ""), 10)).filter(Number.isFinite);
      let nextNum = 1;
      while (usedNumbers.includes(nextNum)) nextNum++;
      TABLES.push({ name: `Mesa ${nextNum}`, status: "free" });
      saveTables(TABLES);
      renderTables();
      showToast(`Mesa ${nextNum} agregada ✓`);
    });
  }

  const tableList = document.getElementById("tableList");
  const tableDetailModal = document.getElementById("tableDetailModal");
  const tableDetailTitle = document.getElementById("tableDetailTitle");
  const tableDetailStatus = document.getElementById("tableDetailStatus");
  const tableDetailTime = document.getElementById("tableDetailTime");
  const tableDetailGuests = document.getElementById("tableDetailGuests");
  const tableDetailCode = document.getElementById("tableDetailCode");
  const tableDetailClose = document.getElementById("tableDetailClose");

  function openTableDetail(index) {
    const table = TABLES[index];
    if (!table || !tableDetailModal) return;
    const reservation = loadOrders().find(o => o.mode === "dine" && o.table === table.name && o.status !== "done");

    tableDetailTitle.textContent = table.name;
    tableDetailStatus.textContent = STATUS_LABEL[table.status];
    tableDetailStatus.className = `table-status ${table.status}`;
    tableDetailTime.textContent = reservation?.time || "-";
    tableDetailGuests.textContent = reservation?.guests || "-";
    tableDetailCode.textContent = reservation?.reservationCode || "-";
    tableDetailModal.classList.add("open");
  }

  if (tableList) {
    tableList.addEventListener("click", (e) => {
      const detailsBtn = e.target.closest("[data-table-details]");
      if (detailsBtn) {
        e.stopPropagation();
        openTableDetail(Number(detailsBtn.dataset.tableDetails));
        return;
      }

      const deleteBtn = e.target.closest("[data-delete-table]");
      if (deleteBtn) {
        e.stopPropagation();
        const index = Number(deleteBtn.dataset.deleteTable);
        const table = TABLES[index];
        if (!table) return;
        if (table.status !== "free") {
          showToast(`No podés eliminar ${table.name}: está ${STATUS_LABEL[table.status].toLowerCase()}.`);
          return;
        }
        if (TABLES.length <= 1) {
          showToast("Tiene que quedar al menos una mesa.");
          return;
        }
        TABLES.splice(index, 1);
        saveTables(TABLES);
        renderTables();
        showToast(`${table.name} eliminada ✓`);
        return;
      }

      const row = e.target.closest("[data-table-index]");
      if (row) openTableDetail(Number(row.dataset.tableIndex));
    });
    tableList.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const row = e.target.closest("[data-table-index]");
      if (!row || e.target.closest("button")) return;
      e.preventDefault();
      openTableDetail(Number(row.dataset.tableIndex));
    });
  }

  if (tableDetailClose) tableDetailClose.addEventListener("click", () => tableDetailModal.classList.remove("open"));
  if (tableDetailModal) tableDetailModal.addEventListener("click", (e) => {
    if (e.target === tableDetailModal) tableDetailModal.classList.remove("open");
  });

  function renderMenuEdit() {
    const el = document.getElementById("menuEditList");
    el.innerHTML = MENU.map(item => `
      <div class="menu-edit-row">
        <span>${item.name}</span>
        <span class="price">${money(item.price)}</span>
      </div>
    `).join("");
  }

  function ticketHTML(order) {
    const tagClass = order.mode === "dine" ? "tag-dine" : "tag-takeout";
    const tagLabel = order.mode === "dine" ? `🍽 ${order.table}` : "🛍 " + order.table;
    const itemsHTML = order.items.map(([qty, name]) => `<li><span><span class="qty">${qty}</span>${name}</span></li>`).join("");

    let actionBtn = "";
    if (order.status === "new") actionBtn = `<button class="btn btn-navy btn-sm" data-id="${order.id}" data-next="prep">Empezar preparación</button>`;
    if (order.status === "prep") actionBtn = `<button class="btn btn-coral btn-sm" data-id="${order.id}" data-next="ready">Marcar listo</button>`;
    if (order.status === "ready") actionBtn = `<button class="btn btn-ghost btn-sm" data-id="${order.id}" data-next="done">Marcar entregado</button>`;

    return `
      <div class="ticket order-ticket">
        <div class="order-ticket-head">
          <span class="order-num">#${order.id}</span>
        </div>
        <span class="tag ${tagClass}">${tagLabel}</span>
        <ul class="order-items">${itemsHTML}</ul>
        <div class="ticket-tear"></div>
        ${actionBtn}
      </div>
    `;
  }

  function renderBoard() {
    const cols = { new: [], prep: [], ready: [] };
    orders.forEach(o => { if (cols[o.status]) cols[o.status].push(o); });

    document.getElementById("colNew").innerHTML = cols.new.map(ticketHTML).join("") || emptyState();
    document.getElementById("colPrep").innerHTML = cols.prep.map(ticketHTML).join("") || emptyState();
    document.getElementById("colReady").innerHTML = cols.ready.map(ticketHTML).join("") || emptyState();

    document.getElementById("countNew").textContent = cols.new.length;
    document.getElementById("countPrep").textContent = cols.prep.length;
    document.getElementById("countReady").textContent = cols.ready.length;
    document.getElementById("statNew").textContent = cols.new.length;
    document.getElementById("statPrep").textContent = cols.prep.length;
    document.getElementById("statReady").textContent = cols.ready.length;
  }

  function emptyState() {
    return `<p style="font-size:0.82rem; color: var(--ink-soft); text-align:center; padding: 20px 8px;">Nada por acá.</p>`;
  }

  board.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-next]");
    if (!btn) return;
    const order = orders.find(o => o.id === btn.dataset.id);
    if (!order) return;
    if (btn.dataset.next === "done") {
      orders = orders.filter(o => o.id !== order.id);
      if (order.mode === "dine" && order.table) {
        const table = TABLES.find(t => t.name === order.table);
        if (table) {
          table.status = "free";
          saveTables(TABLES);
          renderTables();
        }
      }
      showToast(`Pedido #${order.id} entregado ✓`);
    } else {
      order.status = btn.dataset.next;
      showToast(`Pedido #${order.id} → ${btn.dataset.next === "prep" ? "en preparación" : "listo"}`);
    }
    saveOrders(orders);
    renderBoard();
  });

  // Si el cliente confirma un pedido desde otra pestaña (cliente.html),
  // el navegador dispara este evento y el tablero se actualiza solo,
  // sin que haya que recargar admin.html.
  window.addEventListener("storage", (e) => {
    if (e.key === TABLES_KEY) {
      TABLES = loadTables();
      renderTables();
      return;
    }
    if (e.key === ORDERS_KEY) {
      const previousIds = new Set(orders.map(o => o.id));
      orders = loadOrders();
      const isNewOrder = orders.some(o => !previousIds.has(o.id));
      renderBoard();
      if (isNewOrder) showToast("¡Llegó un pedido nuevo! 🔔");
    }
  });

  renderTables();
  renderMenuEdit();
  renderBoard();

  // ----- Agregar plato -----
  const openAddDishBtn = document.getElementById("openAddDishBtn");

  if (openAddDishBtn) {
    const addDishModal = document.getElementById("addDishModal");
    const addDishClose = document.getElementById("addDishClose");
    const dishNameInput = document.getElementById("dishNameInput");
    const dishPriceInput = document.getElementById("dishPriceInput");
    const dishNameError = document.getElementById("dishNameError");
    const dishPriceError = document.getElementById("dishPriceError");
    const addDishSubmit = document.getElementById("addDishSubmit");

    const ONLY_LETTERS = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g;
    const ONLY_NUMBERS = /[^0-9]/g;

    openAddDishBtn.addEventListener("click", () => {
      dishNameInput.value = "";
      dishPriceInput.value = "";
      dishNameError.style.display = "none";
      dishPriceError.style.display = "none";
      addDishModal.classList.add("open");
      setTimeout(() => dishNameInput.focus(), 100);
    });

    addDishClose.addEventListener("click", () => addDishModal.classList.remove("open"));
    addDishModal.addEventListener("click", (e) => { if (e.target === addDishModal) addDishModal.classList.remove("open"); });

    // Solo letras y espacios en el nombre
    dishNameInput.addEventListener("input", () => {
      dishNameInput.value = dishNameInput.value.replace(ONLY_LETTERS, "");
      dishNameError.style.display = "none";
    });

    // Solo números en el precio
    dishPriceInput.addEventListener("input", () => {
      dishPriceInput.value = dishPriceInput.value.replace(ONLY_NUMBERS, "");
      dishPriceError.style.display = "none";
    });

    addDishSubmit.addEventListener("click", () => {
      const name = dishNameInput.value.trim();
      const price = parseInt(dishPriceInput.value, 10);

      let valid = true;
      if (!name) {
        dishNameError.style.display = "block";
        valid = false;
      }
      if (!dishPriceInput.value || isNaN(price) || price <= 0) {
        dishPriceError.style.display = "block";
        valid = false;
      }
      if (!valid) return;

      MENU.push({ name, price });
      renderMenuEdit();
      addDishModal.classList.remove("open");
      showToast(`"${name}" agregado al menú ✓`);
    });
  }
}

// =============================================================
// ACCESO ADMIN: ya no se pasa por index.html con contraseña.
// El panel admin se accede directo por admin.html (ej: desde el
// menú "⋮ → Soy un local" en el top-nav del portal cliente).
// =============================================================
