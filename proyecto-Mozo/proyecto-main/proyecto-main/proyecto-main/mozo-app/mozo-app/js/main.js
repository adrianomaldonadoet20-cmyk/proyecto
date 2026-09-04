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

// La ubicación ya no depende de una lista fija de barrios.
// Se obtiene mediante geocodificación de la dirección ingresada
// y también puede seguir la ubicación actual del dispositivo.

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

function currentTimeLabel() {
  const now = new Date();
  return now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
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
    const timeInput = document.getElementById("timeInput");
    const timeValue = (timeInput && timeInput.value) ? timeInput.value : currentTimeLabel();

    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([i, qty]) => [qty + "x", MENU[i].name]);

    const order = {
      id: nextOrderId(),
      mode: currentMode,
      table: currentMode === "dine" ? "Mesa (a confirmar)" : "Retiro " + timeValue,
      time: currentMode === "dine" ? timeValue : currentTimeLabel(),
      status: "new",
      items: items.length ? items : [["", "Pedirá al llegar / sin platos elegidos"]],
    };

    const orders = loadOrders();
    orders.unshift(order);
    saveOrders(orders);

    modal.classList.remove("open");
    const msg = currentMode === "dine"
      ? `¡Mesa reservada! Tu pedido #${order.id} llegó al local.`
      : `¡Pedido #${order.id} confirmado! Te esperamos para que lo retires.`;
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
    const locationSelectedEl = document.getElementById("locationSelected");
    const useCurrentLocationBtn = document.getElementById("useCurrentLocationBtn");

    let leafletMap = null;
    let leafletMarker = null;
    let selectedLocation = null;
    let searchTimer = null;
    let geolocationWatchId = null;
    let lastGeocodedQuery = "";

    const DEFAULT_LAT = -34.6037;
    const DEFAULT_LNG = -58.3816;

    function initMap(lat, lng, zoom = 15) {
      if (typeof L === "undefined") return;

      if (!leafletMap) {
        leafletMap = L.map("locationMap", {
          zoomControl: true,
          attributionControl: true
        }).setView([lat, lng], zoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(leafletMap);

        leafletMarker = L.marker([lat, lng]).addTo(leafletMap);
      } else {
        leafletMap.setView([lat, lng], zoom);
        leafletMarker.setLatLng([lat, lng]);
      }

      setTimeout(() => leafletMap.invalidateSize(), 150);
    }

    function updateMapLocation(lat, lng, zoom = 16) {
      initMap(lat, lng, zoom);
      if (leafletMarker) leafletMarker.setLatLng([lat, lng]);
    }

    function setSelectedLocation(location) {
      selectedLocation = location;
      updateMapLocation(location.lat, location.lng, 16);
      confirmLocationBtn.disabled = false;
      locationSelectedEl.textContent = location.displayName || location.name;
      locationSelectedEl.classList.add("is-set");
      locationSuggestionsEl.innerHTML = "";
    }

    function renderSuggestions(list) {
      if (!list.length) {
        locationSuggestionsEl.innerHTML = `
          <p style="padding:10px 8px; color:var(--ink-soft); font-size:0.78rem;">
            No encontramos esa dirección. Probá agregando calle, altura y ciudad.
          </p>`;
        return;
      }

      locationSuggestionsEl.innerHTML = list.map(loc => `
        <div class="location-suggestion-item"
             data-lat="${loc.lat}"
             data-lng="${loc.lng}"
             data-name="${loc.displayName.replace(/"/g, "&quot;")}">
          <span class="pin">📍</span>
          <span>
            <div class="loc-name">${loc.shortName}</div>
            <div class="loc-detail">${loc.displayName}</div>
          </span>
        </div>
      `).join("");
    }

    async function geocodeAddress(query) {
      const trimmed = query.trim();
      if (trimmed.length < 4 || trimmed === lastGeocodedQuery) return;

      lastGeocodedQuery = trimmed;
      locationSuggestionsEl.innerHTML = `
        <p style="padding:10px 8px; color:var(--ink-soft); font-size:0.78rem;">
          Buscando dirección…
        </p>`;

      try {
        const params = new URLSearchParams({
          q: trimmed + ", Buenos Aires, Argentina",
          format: "jsonv2",
          addressdetails: "1",
          limit: "5",
          countrycodes: "ar"
        });

        const response = await fetch(
          "https://nominatim.openstreetmap.org/search?" + params.toString(),
          { headers: { "Accept": "application/json" } }
        );

        if (!response.ok) throw new Error("Geocoding error");

        const results = await response.json();
        const normalized = results.map(result => ({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name,
          shortName: [
            result.address?.road,
            result.address?.house_number
          ].filter(Boolean).join(" ") || result.display_name.split(",")[0]
        }));

        renderSuggestions(normalized);

        // La primera coincidencia mueve el mapa automáticamente,
        // aunque el usuario todavía no haya confirmado.
        if (normalized[0]) {
          updateMapLocation(normalized[0].lat, normalized[0].lng, 16);
        }
      } catch (error) {
        locationSuggestionsEl.innerHTML = `
          <p style="padding:10px 8px; color:var(--coral-dark); font-size:0.78rem;">
            No pudimos consultar la dirección. Revisá tu conexión e intentá nuevamente.
          </p>`;
      }
    }

    function stopLocationWatch() {
      if (geolocationWatchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(geolocationWatchId);
        geolocationWatchId = null;
      }
    }

    function useCurrentLocation() {
      if (!navigator.geolocation) {
        showToast("Tu navegador no permite obtener la ubicación.");
        return;
      }

      useCurrentLocationBtn.disabled = true;
      useCurrentLocationBtn.textContent = "📍 Obteniendo ubicación…";
      stopLocationWatch();

      geolocationWatchId = navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          updateMapLocation(lat, lng, 17);

          let displayName = "Ubicación actual";
          try {
            const params = new URLSearchParams({
              lat: String(lat),
              lon: String(lng),
              format: "jsonv2",
              addressdetails: "1",
              zoom: "18"
            });
            const response = await fetch(
              "https://nominatim.openstreetmap.org/reverse?" + params.toString(),
              { headers: { "Accept": "application/json" } }
            );
            if (response.ok) {
              const result = await response.json();
              displayName = result.display_name || displayName;
            }
          } catch (_) {}

          setSelectedLocation({
            name: displayName,
            displayName,
            lat,
            lng
          });

          locationSearchInput.value = displayName;
          useCurrentLocationBtn.disabled = false;
          useCurrentLocationBtn.textContent = "📍 Actualizar mi ubicación";
        },
        () => {
          useCurrentLocationBtn.disabled = false;
          useCurrentLocationBtn.textContent = "📍 Usar mi ubicación actual";
          showToast("No pudimos acceder a tu ubicación.");
          stopLocationWatch();
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }

    locationBtn.addEventListener("click", () => {
      locationModal.classList.add("open");
      locationSearchInput.value = "";
      locationSuggestionsEl.innerHTML = "";
      selectedLocation = null;
      lastGeocodedQuery = "";
      confirmLocationBtn.disabled = true;
      locationSelectedEl.textContent = "Escribí una dirección para ubicarte en el mapa.";
      locationSelectedEl.classList.remove("is-set");
      useCurrentLocationBtn.disabled = false;
      useCurrentLocationBtn.textContent = "📍 Usar mi ubicación actual";
      initMap(DEFAULT_LAT, DEFAULT_LNG, 12);
      setTimeout(() => locationSearchInput.focus(), 150);
    });

    document.getElementById("locationModalClose").addEventListener("click", () => {
      locationModal.classList.remove("open");
      stopLocationWatch();
    });

    locationModal.addEventListener("click", (e) => {
      if (e.target === locationModal) {
        locationModal.classList.remove("open");
        stopLocationWatch();
      }
    });

    locationSearchInput.addEventListener("input", () => {
      const q = locationSearchInput.value.trim();

      selectedLocation = null;
      confirmLocationBtn.disabled = true;
      locationSelectedEl.textContent = "Buscando ubicación…";
      locationSelectedEl.classList.remove("is-set");

      clearTimeout(searchTimer);
      if (q.length < 4) {
        locationSuggestionsEl.innerHTML = "";
        locationSelectedEl.textContent = "Escribí una dirección para ubicarte en el mapa.";
        return;
      }

      searchTimer = setTimeout(() => geocodeAddress(q), 550);
    });

    locationSuggestionsEl.addEventListener("click", (e) => {
      const item = e.target.closest(".location-suggestion-item");
      if (!item) return;

      const lat = parseFloat(item.dataset.lat);
      const lng = parseFloat(item.dataset.lng);
      const displayName = item.dataset.name;

      setSelectedLocation({
        name: displayName,
        displayName,
        lat,
        lng
      });

      locationSearchInput.value = displayName;
    });

    useCurrentLocationBtn.addEventListener("click", useCurrentLocation);

    confirmLocationBtn.addEventListener("click", () => {
      if (!selectedLocation) return;

      const label = selectedLocation.shortName ||
        selectedLocation.name ||
        selectedLocation.displayName ||
        "Ubicación seleccionada";

      locationLabel.textContent = label;
      locationModal.classList.remove("open");
      stopLocationWatch();
      showToast("Ubicación actualizada en el mapa ✓");
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

  const TABLES_KEY = "mozo_tables";

  function defaultTables() {
    return [
      { name: "Mesa 1", status: "free" },
      { name: "Mesa 2", status: "occupied" },
      { name: "Mesa 3", status: "reserved" },
      { name: "Mesa 4", status: "occupied" },
      { name: "Mesa 5", status: "free" },
      { name: "Mesa 6", status: "reserved" },
      { name: "Mesa 7", status: "occupied" }
    ];
  }

  function loadTables() {
    try {
      const raw = localStorage.getItem(TABLES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (_) {}
    return defaultTables();
  }

  function saveTables(tables) {
    localStorage.setItem(TABLES_KEY, JSON.stringify(tables));
  }

  let tables = loadTables();

  const STATUS_LABEL = { free: "Libre", occupied: "Ocupada", reserved: "Reservada" };

  function renderTables() {
    const el = document.getElementById("tableList");
    const countEl = document.getElementById("tableCount");
    const removeBtn = document.getElementById("removeTableBtn");

    el.innerHTML = tables.map(t => `
      <div class="table-row">
        <span class="table-name">${t.name}</span>
        <span class="table-status ${t.status}">${STATUS_LABEL[t.status]}</span>
      </div>
    `).join("");

    countEl.textContent = tables.length;
    removeBtn.disabled = tables.length <= 1;
  }

  function addTable() {
    const nextNumber = tables.length
      ? Math.max(...tables.map(t => parseInt(String(t.name).replace(/\D/g, ""), 10) || 0)) + 1
      : 1;

    tables.push({ name: "Mesa " + nextNumber, status: "free" });
    saveTables(tables);
    renderTables();
    showToast("Mesa agregada ✓");
  }

  function removeTable() {
    if (tables.length <= 1) return;

    const lastTable = tables[tables.length - 1];

    if (lastTable.status !== "free") {
      showToast(`${lastTable.name} no se puede eliminar porque está ${STATUS_LABEL[lastTable.status].toLowerCase()}.`);
      return;
    }

    tables.pop();
    saveTables(tables);
    renderTables();
    showToast("Mesa eliminada ✓");
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
    saveOrders(orders);
    renderBoard();
  });

  // Si el cliente confirma un pedido desde otra pestaña (cliente.html),
  // el navegador dispara este evento y el tablero se actualiza solo,
  // sin que haya que recargar admin.html.
  window.addEventListener("storage", (e) => {
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

  const addTableBtn = document.getElementById("addTableBtn");
  const removeTableBtn = document.getElementById("removeTableBtn");

  if (addTableBtn) addTableBtn.addEventListener("click", addTable);
  if (removeTableBtn) removeTableBtn.addEventListener("click", removeTable);

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
