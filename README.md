# Alma Lectora

Proyecto final para la materia **Programación de Aplicaciones Web (PAW)** - UNSa.

Esta versión del proyecto migra la tienda de **Alma Lectora** (que antes estaba separada en Express y React) a una aplicación integrada con **Laravel 12**, **Inertia.js**, **React** y **PostgreSQL**.

---

## Tecnologías usadas

- **Backend:** PHP 8.2+, Laravel 12, Eloquent ORM
- **Frontend:** React 19, TypeScript, Tailwind CSS v4
- **Conexión Backend-Frontend:** Inertia.js v2
- **Base de datos:** PostgreSQL (`alma_lectora_paw`)
- **Librerías adicionales:**
  - `maatwebsite/excel` para exportar listados a Excel.
  - `barryvdh/laravel-dompdf` para armar los remitos en PDF.
  - `recharts` y componentes de `shadcn/ui` para los gráficos del panel.
- **Gestores de paquetes:** pnpm y Composer

---

## Funcionalidades del proyecto

- **Tienda y catálogo público:**
  - Catálogo de libros, accesorios (velas, señaladores, etc.) y combos promocionales.
  - Buscador por título, autor o ISBN y filtros por género o categoría.
  - Vista de detalle para cada producto con galería de imágenes.
  - Carrito de compras y proceso de checkout en pasos. Al confirmar los datos, se valida el stock, se registra el pedido en la base de datos y redirige al cliente a WhatsApp con el resumen armado para coordinar el pago y el envío.
  - Envío automático de un mail de confirmación al cliente con el detalle de lo que pidió.

- **Panel de administración (`/admin`):**
  - Acceso restringido para usuarios con rol de administrador.
  - **Dashboard:** muestra contadores generales (libros activos, pedidos pendientes, ventas confirmadas, alertas de poco stock), gráficos con Recharts (libros por género y estado de los pedidos) y una tabla con los últimos pedidos.
  - **ABM de Libros, Accesorios y Combos:** creación, edición, cambio rápido de stock y papelera (baja lógica con opción de restaurar o borrar definitivo).
  - **Exportación a Excel:** en las tablas de libros, accesorios y combos se puede descargar el catálogo en formato `.xlsx` respetando los filtros de búsqueda que estén aplicados.
  - **Gestión de Pedidos:** listado de pedidos filtrados por estado (pendientes de WhatsApp, confirmados o cancelados), botón para abrir el chat con el cliente y opción para descargar o imprimir un **Remito en PDF** pensado para armar el paquete.
  - **Configuración:** permite abrir o cerrar la tienda temporalmente, cambiar el número de WhatsApp y administrar categorías y géneros.

- **Usuarios y sesiones:**
  - Inicio de sesión, registro y edición de datos de perfil y contraseña.

---

## Cómo levantar el proyecto en local

### Requisitos previos
- PHP 8.2 o superior.
  - *Importante:* tener activadas en el archivo `php.ini` las extensiones `pdo_pgsql`, `gd`, `zip` y `fileinfo` (son necesarias para la conexión a la base y para generar los archivos de Excel y PDF).
- Composer
- Node.js (v20+) y pnpm
- PostgreSQL corriendo en local con una base de datos creada (por ejemplo `alma_lectora_paw`).

### Pasos de instalación

1. **Clonar el repositorio:**
   ```bash
   git clone git@github.com:Santiago-Carrizo7/alma-lectora-paw.git
   cd alma-lectora-paw
   ```

2. **Instalar las dependencias:**
   ```bash
   composer install
   pnpm install
   ```

3. **Configurar el archivo `.env`:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Revisar en el `.env` los datos de conexión a PostgreSQL (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`). Para probar el envío de correos se puede dejar `MAIL_MAILER=log` (los guarda en `storage/logs/laravel.log`) o configurar una cuenta de Mailtrap / SMTP de Gmail.

4. **Ejecutar migraciones y seeders:**
   ```bash
   php artisan migrate --seed
   ```
   Esto crea todas las tablas y carga datos de prueba (libros, accesorios, combos, pedidos de ejemplo y el usuario administrador `admin@almalectora.com` con clave `admin123`).

5. **Levantar el servidor de desarrollo:**
   ```bash
   composer run dev
   ```
   *(Este comando levanta el servidor de Laravel, Vite y las colas en una misma terminal. Si se prefiere por separado, se puede usar `php artisan serve` y `pnpm dev`).*

6. **Accesos en el navegador:**
   - Tienda pública: `http://localhost:8000/`
   - Panel de administración: `http://localhost:8000/admin`
