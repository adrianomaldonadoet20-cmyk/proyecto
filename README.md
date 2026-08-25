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

Todo lo visual e interactivo funciona: navegar entre locales, abrir el modal de pedido, sumar/restar cantidades, confirmar un pedido, y mover comandas entre columnas en el panel admin.

Lo que **todavía no existe** (porque es front-end puro, sin backend):
- Los locales, el menú y las comandas están escritos como datos de ejemplo en `js/main.js` (arriba de todo, en `PLACES`, `MENU` y `orders`) — no vienen de una base de datos.
- No hay login real ni cuentas guardadas.
- Los cambios no se guardan: si recargás la página, vuelve todo a los datos iniciales.

## Próximo paso técnico

Cuando quieras que esto sea una app real (con datos que se guardan, usuarios reales, y que el pedido del cliente le llegue de verdad al admin), el siguiente paso es conectar una base de datos como Supabase — tal como definimos en el stack tecnológico de la propuesta.
