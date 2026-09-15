# Alma Lectora

Reconstrucción de la plataforma **Alma Lectora** desarrollada como proyecto final para la materia **Programación de Aplicaciones Web (PAW)** de la Universidad Nacional de Salta (UNSa).

El objetivo del proyecto es migrar la arquitectura previa (basada en Express + Prisma + React SPA) hacia un monolito moderno utilizando **Laravel 12**, **Inertia.js v2**, **React 19**, **PostgreSQL** y **Tailwind CSS v4**.

---

## 🛠️ Tecnologías utilizadas

- **Backend:** PHP 8.2+, Laravel 12, Eloquent ORM
- **Frontend:** React 19, TypeScript, Tailwind CSS v4
- **Conexión / Adaptador:** Inertia.js v2
- **Base de datos:** PostgreSQL (`alma_lectora_paw`)
- **Gestor de paquetes:** pnpm (Node.js) y Composer (PHP)

---

## ✨ Funcionalidades implementadas hasta el momento

- **Catálogo público de libros:**
  - Listado de libros con portadas, precios formateados y badges destacados (novedades, más vendidos, ofertas).
  - Buscador en tiempo real con debouncing por título, ISBN o autor.
  - Filtros interactivos por género literario.
  - Ficha de detalle de cada libro con sinopsis y enlace directo de consulta a WhatsApp.
- **Panel de administración (`/admin`):**
  - Control de acceso protegido por roles mediante middleware (`admin`).
  - Dashboard central con acceso a los módulos del sistema.
  - Gestión completa de libros (alta, edición, ajuste rápido de stock e inventario).
  - Bajas lógicas (*Soft Deletes*) con pestañas de libros activos y papelera (restauración y borrado permanente).
  - Manejo dinámico de autores (asociar existentes o crear nuevos directamente desde el formulario).
- **Autenticación y usuarios:**
  - Login, registro, recuperación de contraseña y gestión de perfil.

---

## 🚀 Cómo correr el proyecto en local

### Requisitos previos
- PHP 8.2 o superior con extensiones pdo_pgsql
- Composer
- Node.js (v20+) y pnpm
- PostgreSQL corriendo localmente con una base de datos creada (ej. `alma_lectora_paw`)

### Pasos de instalación

1. **Clonar el repositorio:**
   ```bash
   git clone git@github.com:Santiago-Carrizo7/alma-lectora-paw.git
   cd alma-lectora-paw
   ```

2. **Instalar dependencias de PHP y Node:**
   ```bash
   composer install
   pnpm install
   ```

3. **Configurar las variables de entorno:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Asegurate de configurar en el archivo `.env` tus credenciales de PostgreSQL (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).*

4. **Correr las migraciones y seeders:**
   ```bash
   php artisan migrate --seed
   ```
   *Esto creará las tablas necesarias y cargará los libros iniciales y el usuario administrador (`admin@almalectora.com` / `admin123`).*

5. **Iniciar el entorno de desarrollo:**
   ```bash
   composer run dev
   ```
   *O si preferís correrlos en terminales separadas:*
   - Backend: `php artisan serve`
   - Frontend: `pnpm dev`

6. **Abrir en el navegador:**
   - Tienda / Catálogo: `http://localhost:8000/` o `http://localhost:8000/libros`
   - Panel Admin: `http://localhost:8000/admin`
