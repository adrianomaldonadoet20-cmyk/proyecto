# Mozo — Prototipo de interfaz

Prototipo funcional en HTML, CSS y JavaScript puro (sin frameworks ni instalación de dependencias). Corre directo en el navegador, tanto en computadora como en celular.

## Estructura del proyecto

```
mozo-app/
├── index.html      → Landing: elegís si entrás como Cliente o como Admin
├── cliente.html     → Portal cliente: explorar locales, reservar, pedir
├── admin.html        → Portal admin: comandas en vivo, mesas, menú
├── css/style.css     → Todos los estilos (colores, tipografía, componentes)
└── js/main.js        → Toda la lógica (datos de ejemplo, modal, tablero de comandas)
```

## Cómo abrirlo

**Opción rápida:** hacé doble clic en `index.html` y se abre en tu navegador.

**Con VS Code (recomendado para seguir trabajando):**
1. Abrí la carpeta `mozo-app` en VS Code (`Archivo → Abrir carpeta`).
2. Instalá la extensión **Live Server** (de Ritwick Dey) desde el ícono de extensiones.
3. Click derecho sobre `index.html` → **"Open with Live Server"**.
4. Se abre en el navegador y se actualiza solo cada vez que guardás un cambio.

## Qué es real y qué es de prueba (mock)

Todo lo visual e interactivo funciona: navegar entre locales, abrir el modal de pedido, sumar/restar cantidades, confirmar un pedido, mover comandas entre columnas en el panel admin, agregar platos al menú, iniciar sesión / registrarse, y elegir una ubicación de entrega con mapa.

Lo que **todavía no existe** (porque es front-end puro, sin backend):
- Los locales, el menú y las comandas están escritos como datos de ejemplo en `js/main.js` (arriba de todo, en `PLACES`, `MENU`, `LOCATIONS` y `orders`) — no vienen de una base de datos.
- **No hay login real ni cuentas guardadas.** El login/registro del portal cliente y la contraseña de admin (`1234`) son validaciones de ejemplo del lado del cliente, pensadas para mostrar el flujo de pantallas. No hay verificación real de usuarios, ni el "código" que se envía al recuperar la contraseña se manda de verdad — solo simula el flujo con un mensaje.
- El selector de ubicación usa una lista fija de barrios de Buenos Aires con coordenadas aproximadas para el autocompletado (no hay un servicio de geocoding real conectado). El mapa en sí es real y funcional (usa OpenStreetMap vía Leaflet.js), pero necesita conexión a internet para cargar las imágenes del mapa.
- Los cambios no se guardan: si recargás la página, vuelve todo a los datos iniciales (incluida la sesión iniciada y los platos que agregaste).

## Próximo paso técnico

Cuando quieras que esto sea una app real (con datos que se guardan, usuarios reales, y que el pedido del cliente le llegue de verdad al admin), el siguiente paso es conectar una base de datos como Supabase — tal como definimos en el stack tecnológico de la propuesta. Ahí es también donde iría la autenticación real (hash de contraseñas, envío de mails de verdad) y, si se quiere, un servicio de geocoding real (Google Places, Mapbox, etc.) en vez de la lista fija de barrios.
