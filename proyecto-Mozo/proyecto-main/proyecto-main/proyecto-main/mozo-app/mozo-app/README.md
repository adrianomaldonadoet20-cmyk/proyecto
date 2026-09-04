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

**El flujo cliente → admin ya es "real" dentro del navegador:** cuando alguien confirma un pedido en `cliente.html`, ese pedido se guarda en `localStorage` y aparece automáticamente en el tablero de `admin.html` (columna "Nuevas comandas"), incluso si están abiertos en pestañas distintas. El panel admin ya no arranca con comandas de ejemplo — arranca vacío y se va llenando con los pedidos que realmente se hacen desde el portal cliente. Para probarlo: abrí `index.html` en dos pestañas, entrá como cliente en una y como admin en la otra, y confirmá un pedido desde la pestaña cliente.

Lo que **todavía no existe** (porque es front-end puro, sin backend):
- Los locales y el menú siguen escritos como datos de ejemplo en `js/main.js` (`PLACES`, `MENU`, `LOCATIONS`) — no vienen de una base de datos.
- Los pedidos (`orders`) se guardan en el `localStorage` del navegador, no en un servidor. Esto significa que solo se sincronizan entre pestañas del **mismo navegador en la misma computadora** — un cliente real, en su propio celular, no le llegaría el pedido a un admin en otra computadora. Para eso hace falta el backend.
- **No hay login real ni cuentas guardadas.** El login/registro del portal cliente y la contraseña de admin (`1234`) son validaciones de ejemplo del lado del cliente, pensadas para mostrar el flujo de pantallas. No hay verificación real de usuarios, ni el "código" que se envía al recuperar la contraseña se manda de verdad — solo simula el flujo con un mensaje.
- La ubicación del cliente ya no usa una lista fija de barrios. El usuario ingresa su dirección y la app consulta un servicio de geocodificación para mover automáticamente el mapa 2D; también puede usar la ubicación actual del dispositivo. El mapa usa OpenStreetMap vía Leaflet.js y necesita conexión a internet.
- Si borrás los datos de navegación del navegador (o usás modo incógnito), los pedidos y platos agregados se pierden.

## Próximo paso técnico

Cuando quieras que esto sea una app real (con datos que se guardan, usuarios reales, y que el pedido del cliente le llegue de verdad al admin), el siguiente paso es conectar una base de datos como Supabase — tal como definimos en el stack tecnológico de la propuesta. Ahí es también donde iría la autenticación real (hash de contraseñas, envío de mails de verdad) y, si se quiere, un servicio de geocoding real (Google Places, Mapbox, etc.) en vez de la lista fija de barrios.


## Mejoras implementadas

- **Inicio:** el mensaje debajo de “Mozo.” ahora tiene una jerarquía visual coherente con la paleta y las tipografías del proyecto.
- **Ubicación:** se eliminaron las opciones fijas de barrios. La dirección se busca mediante geocodificación y el mapa 2D se mueve automáticamente; también se agregó seguimiento de la ubicación actual del dispositivo.
- **Mesas:** el admin puede aumentar o reducir la cantidad de mesas con `+` y `−`. La configuración queda guardada en `localStorage` y no permite borrar una mesa ocupada o reservada.
