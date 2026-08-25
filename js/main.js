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
  PLACES.forEach(place => {
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
  document.getElementById("place-count").textContent = PLACES.length + " locales";

  // Filtro chips (solo visual, para la demo)
  document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
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
}
