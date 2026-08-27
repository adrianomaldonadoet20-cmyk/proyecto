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

// Barrios de Buenos Aires con coordenadas aproximadas, usados para el
// autocompletado del selector de ubicación (mock — no hay geocoding real).
const LOCATIONS = [
  { name: "Palermo", detail: "CABA", lat: -34.5877, lng: -58.4276 },
  { name: "Recoleta", detail: "CABA", lat: -34.5875, lng: -58.3974 },
  { name: "Belgrano", detail: "CABA", lat: -34.5623, lng: -58.4566 },
  { name: "Núñez", detail: "CABA", lat: -34.5453, lng: -58.4638 },
  { name: "Caballito", detail: "CABA", lat: -34.6187, lng: -58.4407 },
  { name: "Villa Crespo", detail: "CABA", lat: -34.5993, lng: -58.4392 },
  { name: "San Telmo", detail: "CABA", lat: -34.6212, lng: -58.3731 },
  { name: "Almagro", detail: "CABA", lat: -34.6082, lng: -58.4205 },
  { name: "Boedo", detail: "CABA", lat: -34.6288, lng: -58.4176 },
  { name: "Flores", detail: "CABA", lat: -34.6289, lng: -58.4633 },
  { name: "Villa Urquiza", detail: "CABA", lat: -34.5723, lng: -58.4890 },
  { name: "Colegiales", detail: "CABA", lat: -34.5744, lng: -58.4487 },
  { name: "Chacarita", detail: "CABA", lat: -34.5866, lng: -58.4534 },
  { name: "Puerto Madero", detail: "CABA", lat: -34.6083, lng: -58.3629 },
  { name: "Barracas", detail: "CABA", lat: -34.6389, lng: -58.3833 },
  { name: "Once (Balvanera)", detail: "CABA", lat: -34.6089, lng: -58.4055 },
  { name: "Retiro", detail: "CABA", lat: -34.5924, lng: -58.3746 },
  { name: "Congreso", detail: "CABA", lat: -34.6095, lng: -58.3925 },
  { name: "Monserrat", detail: "CABA", lat: -34.6118, lng: -58.3812 },
  { name: "Liniers", detail: "CABA", lat: -34.6435, lng: -58.5227 },
];

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

  // ----- Modal de reserva / pedido -----
  const modal = document.getElementById("orderModal");
  const modalPlaceName = document.getElementById("modalPlaceName");
  const modalityToggle = document.getElementById("modalityToggle");
  const dateTimeLabel = document.getElementById("dateTimeLabel");
  const menuListEl = document.getElementById("menuList");
  const modalTotal = document.getElementById("modalTotal");

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

  function openModal(placeId, mode) {
    const place = PLACES.find(p => p.id == placeId);
    modalPlaceName.textContent = place ? place.name : "Local";
    setMode(mode || "dine");
    cart = {};
    renderMenu();
    updateTotal();
    modal.classList.add("open");
  }

  function setMode(mode) {
    currentMode = mode;
    modalityToggle.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
    dateTimeLabel.textContent = mode === "dine" ? "Horario de llegada" : "Horario de retiro";
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
    modal.classList.remove("open");
    const msg = currentMode === "dine"
      ? "¡Mesa reservada! Tu comida estará lista cuando llegues."
      : "¡Pedido confirmado! Te esperamos para que lo retires.";
    showToast(msg);
  });

  // ----- Acceso: login / registro -----
  const authGateModal = document.getElementById("authGateModal");
  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");
  const forgotPasswordModal = document.getElementById("forgotPasswordModal");

  function closeAllAuthModals() {
    [authGateModal, loginModal, registerModal, forgotPasswordModal].forEach(m => m && m.classList.remove("open"));
  }

  if (authGateModal) {
    // Se muestra apenas se entra al portal cliente
    authGateModal.classList.add("open");

    document.getElementById("showLoginBtn").addEventListener("click", () => {
      closeAllAuthModals();
      loginModal.classList.add("open");
    });
    document.getElementById("showRegisterBtn").addEventListener("click", () => {
      closeAllAuthModals();
      registerModal.classList.add("open");
    });
    document.getElementById("skipAuthBtn").addEventListener("click", (e) => {
      e.preventDefault();
      closeAllAuthModals();
    });

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

    document.getElementById("loginSubmitBtn").addEventListener("click", () => {
      const name = document.getElementById("loginNameInput").value.trim();
      const dni = loginDniInput.value.trim();
      const pass = document.getElementById("loginPasswordInput").value;
      const err = document.getElementById("loginError");

      if (!name || !dni || !pass) {
        err.style.display = "block";
        return;
      }
      err.style.display = "none";
      closeAllAuthModals();
      showToast(`¡Hola de nuevo, ${name}! ✓`);
    });

    document.getElementById("registerSubmitBtn").addEventListener("click", () => {
      const email = document.getElementById("registerEmailInput").value.trim();
      const name = document.getElementById("registerNameInput").value.trim();
      const dni = registerDniInput.value.trim();
      const pass = document.getElementById("registerPasswordInput").value;
      const err = document.getElementById("registerError");
      const isGmail = /^[^\s@]+@gmail\.com$/i.test(email);

      if (!isGmail || !name || !dni || !pass) {
        err.textContent = !isGmail ? "Ingresá un correo de Gmail válido (@gmail.com)." : "Completá todos los campos.";
        err.style.display = "block";
        return;
      }
      err.style.display = "none";
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
  const locationBtn = document.getElementById("locationBtn");

  if (locationBtn) {
    const locationModal = document.getElementById("locationModal");
    const locationSearchInput = document.getElementById("locationSearchInput");
    const locationSuggestionsEl = document.getElementById("locationSuggestions");
    const confirmLocationBtn = document.getElementById("confirmLocationBtn");
    const locationLabel = document.getElementById("locationLabel");

    let leafletMap = null;
    let leafletMarker = null;
    let selectedLocation = null;

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

    function renderSuggestions(list) {
      locationSuggestionsEl.innerHTML = list.map(loc => `
        <div class="location-suggestion-item" data-lat="${loc.lat}" data-lng="${loc.lng}" data-name="${loc.name}">
          <span class="pin">📍</span>
          <span>
            <div class="loc-name">${loc.name}</div>
            <div class="loc-detail">${loc.detail}</div>
          </span>
        </div>
      `).join("");
    }

    locationBtn.addEventListener("click", () => {
      locationModal.classList.add("open");
      locationSearchInput.value = "";
      renderSuggestions(LOCATIONS.slice(0, 6));
      confirmLocationBtn.disabled = true;
      initMap(-34.6037, -58.3816, 12); // Centro de Buenos Aires
      setTimeout(() => locationSearchInput.focus(), 150);
    });

    document.getElementById("locationModalClose").addEventListener("click", () => locationModal.classList.remove("open"));
    locationModal.addEventListener("click", (e) => { if (e.target === locationModal) locationModal.classList.remove("open"); });

    locationSearchInput.addEventListener("input", () => {
      const q = locationSearchInput.value.trim().toLowerCase();
      const filtered = q ? LOCATIONS.filter(l => l.name.toLowerCase().includes(q)) : LOCATIONS.slice(0, 6);
      renderSuggestions(filtered);
      confirmLocationBtn.disabled = true;
      selectedLocation = null;
    });

    locationSuggestionsEl.addEventListener("click", (e) => {
      const item = e.target.closest(".location-suggestion-item");
      if (!item) return;
      const lat = parseFloat(item.dataset.lat);
      const lng = parseFloat(item.dataset.lng);
      const name = item.dataset.name;
      selectedLocation = { name, lat, lng };
      locationSearchInput.value = name;
      initMap(lat, lng, 14);
      confirmLocationBtn.disabled = false;
      document.querySelectorAll(".location-suggestion-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
    });

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
  let orders = [
    { id: "0231", mode: "dine", table: "Mesa 4", time: "21:00", status: "new", items: [["1x", "Bife de chorizo"], ["1x", "Ensalada mixta"], ["2x", "Agua con gas"]] },
    { id: "0232", mode: "takeout", table: "Retiro 21:15", time: "21:15", status: "new", items: [["2x", "Milanesa napolitana"], ["1x", "Papas fritas"]] },
    { id: "0229", mode: "dine", table: "Mesa 2", time: "20:40", status: "prep", items: [["1x", "Sorrentinos"], ["1x", "Copa de vino"]] },
    { id: "0227", mode: "takeout", table: "Retiro 20:50", time: "20:50", status: "prep", items: [["1x", "Sushi 20 piezas"]] },
    { id: "0224", mode: "dine", table: "Mesa 7", time: "20:15", status: "ready", items: [["3x", "Empanadas", ], ["1x", "Provoleta"]] },
  ];

  const TABLES = [
    { name: "Mesa 1", status: "free" },
    { name: "Mesa 2", status: "occupied" },
    { name: "Mesa 3", status: "reserved" },
    { name: "Mesa 4", status: "occupied" },
    { name: "Mesa 5", status: "free" },
    { name: "Mesa 6", status: "reserved" },
    { name: "Mesa 7", status: "occupied" },
  ];

  const STATUS_LABEL = { free: "Libre", occupied: "Ocupada", reserved: "Reservada" };

  function renderTables() {
    const el = document.getElementById("tableList");
    el.innerHTML = TABLES.map(t => `
      <div class="table-row">
        <span class="table-name">${t.name}</span>
        <span class="table-status ${t.status}">${STATUS_LABEL[t.status]}</span>
      </div>
    `).join("");
  }

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
    const tagLabel = order.mode === "dine" ? "🍽 " + order.table : "🛍 " + order.table;
    const itemsHTML = order.items.map(([qty, name]) => `<li><span><span class="qty">${qty}</span>${name}</span></li>`).join("");

    let actionBtn = "";
    if (order.status === "new") actionBtn = `<button class="btn btn-navy btn-sm" data-id="${order.id}" data-next="prep">Empezar preparación</button>`;
    if (order.status === "prep") actionBtn = `<button class="btn btn-coral btn-sm" data-id="${order.id}" data-next="ready">Marcar listo</button>`;
    if (order.status === "ready") actionBtn = `<button class="btn btn-ghost btn-sm" data-id="${order.id}" data-next="done">Marcar entregado</button>`;

    return `
      <div class="ticket order-ticket">
        <div class="order-ticket-head">
          <span class="order-num">#${order.id}</span>
          <span class="order-time">${order.time}</span>
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
      showToast(`Pedido #${order.id} entregado ✓`);
    } else {
      order.status = btn.dataset.next;
      showToast(`Pedido #${order.id} → ${btn.dataset.next === "prep" ? "en preparación" : "listo"}`);
    }
    renderBoard();
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
// ACCESO ADMIN (contraseña) — solo en index.html
// =============================================================
const adminEntryBtn = document.getElementById("adminEntryBtn");

if (adminEntryBtn) {
  const ADMIN_PASSWORD = "1234";
  const adminModal = document.getElementById("adminPasswordModal");
  const adminInput = document.getElementById("adminPasswordInput");
  const adminError = document.getElementById("adminPasswordError");
  const adminSubmit = document.getElementById("adminPasswordSubmit");
  const adminClose = document.getElementById("adminModalClose");

  function openAdminModal() {
    adminModal.classList.add("open");
    adminError.style.display = "none";
    adminInput.value = "";
    setTimeout(() => adminInput.focus(), 100);
  }

  function closeAdminModal() {
    adminModal.classList.remove("open");
  }

  function tryAdminLogin() {
    if (adminInput.value === ADMIN_PASSWORD) {
      window.location.href = "admin.html";
    } else {
      adminError.style.display = "block";
      adminInput.value = "";
      adminInput.focus();
    }
  }

  adminEntryBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openAdminModal();
  });

  adminClose.addEventListener("click", closeAdminModal);
  adminModal.addEventListener("click", (e) => { if (e.target === adminModal) closeAdminModal(); });
  adminSubmit.addEventListener("click", tryAdminLogin);
  adminInput.addEventListener("keydown", (e) => { if (e.key === "Enter") tryAdminLogin(); });
}
