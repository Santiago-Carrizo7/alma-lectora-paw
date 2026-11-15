# Progreso de Correcciones Postauditoría — Alma Lectora

Última actualización: 2026-11-13
Estado general: **Fases 0, 1, 2, 3, 4, 5 y 6 completadas y verificadas** (las mejoras opcionales P2/P3 de infraestructura quedan documentadas fuera de alcance académico).

---

## Fase 0 — Lectura y Verificación Inicial

### Documentación revisada
- `docs/auditoria/AUDITORIA-GENERAL.md`
- `docs/auditoria/HALLAZGOS-TECNICOS.md`
- `docs/auditoria/PLAN-CORRECCIONES.md`
- `docs/auditoria/AUDITORIA-REPORTES.md`
- `docs/auditoria/MATRIZ-PRUEBAS.md`
- `docs/auditoria/DEFENSA-ACADEMICA.md`

### Baseline al iniciar
- **Tests Laravel (`alma_lectora_paw_test`):** 83 passed, 1 failed (507 assertions) — el único fallo correspondía a **H-01** (`AdminModulesTest > admin can view accessories and create accessory`, `SQLSTATE[22P02]` por UUID inválido `'VELAS'`).
- **TypeScript (`npx tsc --noEmit`):** 5 errores preexistentes en `resources/js/components/nav-user.tsx` (líneas 21, 30) y `resources/js/pages/settings/profile.tsx` (líneas 26, 27, 78), correspondientes a **H-19** (Fase 2).
- **Cambios previos en el repositorio:** se detectaron 58 archivos modificados y 3 sin seguimiento (`AdminMediaController.php`, `2026_10_30_000001_drop_unused_columns_from_store_config_table.php`, `image-gallery-upload.tsx`) que se preservaron intactos.

### Checklist y dependencias detectadas para fases siguientes
- **Fase 1 (Completada):** H-01, H-02, H-03, H-04, H-38, H-39.
- **Fase 2 (Implementada):** H-05, H-06/H-07, H-08, H-09, H-10, H-13 (Alternativa A con roles Spatie + permisos granulares), H-19, H-21, H-25 (dependencias documentadas manteniendo modelo almacenado), H-30..H-32, H-40.
- **Fase 3 (Completada):** H-14 (`public/storage` symlink, endpoint de eliminación, límite de `additional_images`), H-43 (salto de slots en `image-gallery-upload.tsx`).
- **Fase 4 (Implementada, pendiente verificación en Fase 6):** H-11, H-12, H-15, H-16, H-17, H-18, H-34, H-35, H-36, H-45, H-47.4, H-47.5, H-47.6.
- **Fase 5 (Implementada, pendiente verificación en Fase 6):** H-24, H-26, H-33, H-37, H-41, H-42, H-44, H-46, H-47.1..H-47.3 (opcionales H-20, H-22, H-23, H-27..H-29 documentados).
- **Fase 6 (Pendiente):** Validación integral final (Laravel tests, `tsc`, build Vite, flujos end-to-end).

---

## Fase 1 — Correcciones Funcionales Críticas (COMPLETADA)

### Hallazgos corregidos

1. **H-01 — Alta y edición de accesorios con categorías**
   - **Problema:** `AdminAccessoryController` no resolvía categorías por `slug`/`label` frente a UUID y en `Form.tsx` el `<select>` no mantenía sincronizados `category_id` y `category`.
   - **Solución:** se extrajo `validateAndResolveAccessory(Request $request)` para `store()` y `update()`, validando UUID con `Str::isUuid()` antes de consultar por ID y buscando case-insensitive por `slug`/`label` en caso contrario; ante categoría faltante o inexistente lanza `ValidationException` (422) en lugar de error SQL 500 o fallback silencioso. En `Form.tsx` se actualizan `category_id` y `category` en una única llamada atómica a `form.setData(...)` y se muestra `form.errors.category_id || form.errors.category`.

2. **H-02 — Validación y cálculo de precios en el servidor**
   - **Problema:** `OrderLeadController::store()` confiaba en precios y `total_amount` enviados por el cliente.
   - **Solución:** se creó `app/Services/OrderService.php` como fuente de verdad de precios y promociones por volumen/bundle (coherente con `cart-store.ts`), recalculando `unit_price`, `list_price`, `subtotal`, `title` y `total_amount` en el servidor a partir de la base de datos. Se actualizó `Checkout/Index.tsx` para construir el enlace de WhatsApp con `data.totalAmount ?? totalAmount`, y se ajustaron vistas/reportes/remito/email para priorizar `$item['subtotal']` cuando existe antes de multiplicar `unit_price * quantity` (evitando diferencias de redondeo en promociones).

3. **H-03 — Acumulación correcta de cantidades para descontar stock**
   - **Problema:** el stock se validaba/descontaba ítem por ítem sin acumular cantidades de un mismo libro o accesorio presente en múltiples líneas ni cuando formaba parte de un combo y también individualmente.
   - **Solución:** `OrderService::buildVerifiedOrderPayload()`, `confirmOrderStock()` y `restoreOrderStock()` acumulan la demanda por clave única `type:id` (incluyendo componentes de combos), ordenan las claves y aplican `lockForUpdate()` antes de validar y descontar o reponer stock. Se contempla `withTrashed()` en reposición/verificación de componentes asociados.

4. **H-04 — Confirmación idempotente de pedidos**
   - **Problema:** confirmar un pedido dos veces descontaba stock dos veces o generaba condiciones de carrera.
   - **Solución:** `AdminOrderController::updateStatus()` ejecuta la transición dentro de `DB::transaction()` con `OrderLead::query()->lockForUpdate()->findOrFail(...)`. Si `$previousStatus === $newStatus`, retorna sin re-descontar ni re-reponer stock.

5. **H-38 — Visualización correcta de errores de confirmación**
   - **Problema:** los errores de stock al confirmar pedido desde admin se devolvían con flash `error` sin ser capturados en el modal de Inertia.
   - **Solución:** `AdminOrderController::updateStatus()` lanza `ValidationException::withMessages(['stock' => ...])` para activar `onError` en Inertia. En `Admin/Orders/Index.tsx` se agregó estado `confirmError`, se captura el mensaje en `onError`, se mantiene el modal abierto y se renderiza la alerta dentro del diálogo de confirmación.

6. **H-39 — Funcionamiento real del alta de géneros**
   - **Problema:** el alta de géneros no persistía en base de datos y las operaciones de configuración podían reportar éxito sin modificar registros.
   - **Solución:** se creó el modelo `BookGenre` y la migración `2026_11_13_000001_create_book_genres_table.php` (que crea `book_genres` e inicializa géneros existentes de `books.genre`). `AdminConfigController` combina `BookGenre` y `books.genre` (con guarda `Schema::hasTable('book_genres')` para no romper la BD de desarrollo antes de migrar), agrega `storeGenre()` en `POST /admin/configuracion/generos`, y valida existencia real en `updateGenre()` y `destroyGenre()` evitando falsos positivos. `AdminBookController` incorpora los géneros persistidos en `getGenreSuggestions()`, y `Admin/Config/Index.tsx` conecta el alta con manejo explícito de errores (`genreError` y `editGenreError`).

### Archivos creados y modificados en Fase 1
- **Creados:**
  - `app/Services/OrderService.php`
  - `app/Models/BookGenre.php`
  - `database/migrations/2026_11_13_000001_create_book_genres_table.php`
  - `PROGRESO-CORRECCIONES.md`
- **Modificados (Backend y rutas):**
  - `app/Http/Controllers/Admin/AdminAccessoryController.php`
  - `app/Http/Controllers/OrderLeadController.php`
  - `app/Http/Controllers/Admin/AdminOrderController.php`
  - `app/Http/Controllers/Admin/AdminConfigController.php`
  - `app/Http/Controllers/Admin/AdminBookController.php`
  - `app/Services/ReportService.php`
  - `routes/web.php`
- **Modificados (Frontend y vistas):**
  - `resources/js/pages/Admin/Accessories/Form.tsx`
  - `resources/js/pages/Checkout/Index.tsx`
  - `resources/js/pages/Admin/Orders/Index.tsx`
  - `resources/js/pages/Customer/Orders/Index.tsx`
  - `resources/js/pages/Admin/Config/Index.tsx`
  - `resources/views/pdf/order-remito.blade.php`
  - `resources/views/emails/order-confirmation.blade.php`
- **Modificados (Tests):**
  - `tests/Feature/CheckoutTest.php`
  - `tests/Feature/AdminModulesTest.php`

### Verificación ejecutada tras los cambios de Fase 1
- **Sintaxis PHP (`php -l`):** sin errores en los 10 archivos PHP creados/modificados.
- **Tests focalizados (`php artisan test tests/Feature/CheckoutTest.php tests/Feature/AdminModulesTest.php`):** 19 passed (186 assertions) en 5.25s.
- **Suite completa (`php artisan test` sobre `alma_lectora_paw_test`):** 91 passed (557 assertions) en 45.97s.
- **TypeScript (`npx tsc --noEmit`):** únicamente los 5 errores preexistentes de `H-19` (`nav-user.tsx` y `settings/profile.tsx`), 0 errores en archivos tocados en Fase 1.

### Riesgos / Notas abiertas de Fase 1
- **Migración pendiente en BD de desarrollo (`alma_lectora_paw`):** la migración `2026_11_13_000001_create_book_genres_table.php` corrió en la BD aislada de tests (`alma_lectora_paw_test`). Hasta que se autorice ejecutar `php artisan migrate` en desarrollo, `AdminConfigController` y `AdminBookController` operan con fallback mediante `Schema::hasTable('book_genres')` (si la tabla no existe aún en dev, `POST /admin/configuracion/generos` fallará al intentar insertar en `book_genres`).
- **Pendiente de Fase 2 relacionado:** `AdminOrderController::destroy()` aún no repone stock al eliminar un pedido confirmado (`H-05`), ni se resolvió todavía el manejo completo de productos eliminados/archivados (`H-06`, `H-07`, `H-08`).

---

## Migración en Desarrollo y Fase 2 — Integridad y Coherencia (COMPLETADA EXCEPTO H-13)

### Migración ejecutada con autorización
- `php artisan migrate --path=database/migrations/2026_11_13_000001_create_book_genres_table.php --force`: `DONE` en `alma_lectora_paw`. (`2026_10_30_000001_drop_unused_columns_from_store_config_table.php` permanece pendiente sin modificar).

### Hallazgos corregidos en Fase 2
1. **H-05 / H-44 — Protección al eliminar pedidos confirmados y cancelación segura**
   - `AdminOrderController::destroy()` rechaza la eliminación directa de pedidos en estado `CONFIRMED` indicando cancelarlos primero para reponer stock.
   - `resources/js/pages/Admin/Orders/Index.tsx` incorpora acción `"Cancelar pedido y reponer stock"` y deshabilita el botón de borrado directo cuando `status === 'CONFIRMED'`.
2. **H-06 / H-07 — Productos archivados y advertencias al reponer stock**
   - `OrderService::loadAndLockOrderRequirements()` distingue productos archivados (`withTrashed()`) de inexistentes y devuelve un error explícito (`fue archivado y ya no está disponible`) al intentar confirmar.
   - `OrderService::restoreOrderStock()` devuelve títulos eliminados definitivamente para que `AdminOrderController::updateStatus()` muestre aviso si algún ítem no pudo reponer inventario.
3. **H-08 — Integridad de combos al eliminar definitivamente libros o accesorios**
   - `AdminBookController::forceDestroy()` y `AdminAccessoryController::forceDestroy()` bloquean el borrado permanente cuando existen combos (`withTrashed()`) que los referencian, informando los nombres de los combos involucrados.
4. **H-09 — Corrección de promesa engañosa en correo de confirmación**
   - `resources/views/emails/order-confirmation.blade.php` aclara que la disponibilidad y el apartado de productos se confirman al coordinar por WhatsApp.
5. **H-10 — Bloqueo de usuarios desactivados en login y sesión activa**
   - `LoginRequest::authenticate()` cierra sesión y devuelve error de validación si `is_active === false`.
   - Nuevo middleware `EnsureUserIsActive` registrado en `bootstrap/app.php` (web) invalida sesiones activas de cuentas deshabilitadas; se actualizó `UserFactory::definition()` para incluir `'is_active' => true`.
6. **H-19 — Corrección de errores TypeScript y script `typecheck`**
   - Resueltos los errores de `auth.user` nulo en `nav-user.tsx` y `settings/profile.tsx`, más ajuste de fallback de `price` en `Customer/Orders/Index.tsx`.
   - Agregado `"typecheck": "tsc --noEmit"` en `package.json`.
7. **H-21 — Protección del último Super Administrador activo**
   - `AdminUserController::update()` y `destroy()` impiden degradar, desactivar o eliminar al último `super-admin` activo del sistema.
8. **H-30 / H-31 / H-32 — Datos históricos en pedidos e idempotencia sin sobrescritura de stock en seeders**
   - `OrderLeadSeeder.php` normaliza `unitPrice` -> `unit_price`/`subtotal` y usa UUIDs determinísticos con `updateOrCreate` (idempotente).
   - `ReportService.php`, `order-remito.blade.php`, `order-confirmation.blade.php` y `Customer/Orders/Index.tsx` soportan lectura de `unitPrice` histórico como fallback.
   - `BookSeeder.php` y `AccessorySeeder.php` preservan el `stock` existente al re-sembrar registros previos.
9. **H-40 — Ocultamiento de libros inactivos en detalle público**
   - `BookController::show()` responde `404` cuando `! $book->is_active` para usuarios no administradores.

### Análisis de dependencias H-25 (Modelo de stock de combos — Sin cambio automático)
Se verificaron todas las dependencias de `combos.stock` antes de decidir modificaciones:
- `app/Models/Combo.php`: `scopeFilter()` ordena y filtra `stock_status` (`out`, `low`, `available`) directamente sobre la columna `combos.stock`.
- `app/Http/Controllers/Admin/AdminComboController.php`: `store()`, `update()` y `updateStock()` exigen `stock` entero editable desde formulario y modal rápido.
- `app/Services/OrderService.php`: al confirmar o cancelar valida y descuenta/repone tanto `combos.stock` como el inventario de libros y accesorios componentes.
- `app/Exports/CombosExport.php`, `ComboCard`, `ComboDetailPage`, `Admin/Combos/Index.tsx` y `Admin/Combos/Form.tsx` consumen `combo.stock` para stock agotado y filtros.
- **Conclusión:** cambiar de stock almacenado a derivado puro impacta filtros SQL, exportación, formulario y edición rápida de combos; queda documentado para decisión funcional (por defecto se recomienda mantener el modelo actual almacenado + validación combinada de componentes).

### Pendiente de Fase 2 (requiere elección arquitectónica)
- **H-13 — Autorización real basada en roles y permisos gestionados:** actualmente `routes/web.php` no aplica middleware `permission:` en módulos administrativos y `EnsureUserIsAdmin` / `User::isAdmin()` solo verifican `super-admin`, `admin` o `users.role === 'admin'`. Quedan planteadas dos alternativas al usuario antes de modificar `routes/web.php`, `EnsureUserIsAdmin`, `AppServiceProvider` y tests dependientes.

---

## Fase 3 — Carga Local de Imágenes (COMPLETADA)

### Hallazgos corregidos e infraestructura configurada
- **H-14 — Enlace `public/storage`, eliminación de huérfanos y límite de galería**
  - Ejecutado `php artisan storage:link` (`public/storage` enlazado a `storage/app/public`).
  - Ampliado `AdminMediaController.php` con `destroy()`, `extractUploadPath()` (protección contra path traversal), `deleteLocalUploadIfUnused()` y `isReferencedByAnyProduct()`.
  - Agregada ruta `DELETE /admin/upload-image` (`admin.upload-image.destroy`) en `routes/web.php`.
  - Límite `'additional_images' => ['nullable', 'array', 'max:3']` aplicado en `StoreBookRequest`, `UpdateBookRequest`, `AdminAccessoryController` y `AdminComboController`, limpiando archivos locales reemplazados o al ejecutar `forceDestroy()`.
- **H-43 — Estabilidad de slots en UI, validaciones en cliente y fallback visual**
  - `resources/js/components/admin/image-gallery-upload.tsx`: slots fijos de 2 imágenes adicionales sin saltos al escribir/borrar, validación cliente de MIME/5MB, reporte real de errores (`errors.image[0]`), input URL en `type="text"` para admitir `/storage/uploads/...`, y limpieza de subidas locales de la sesión al descartar/reemplazar antes de guardar.
  - Nuevo componente `resources/js/components/ui/safe-image.tsx` y tolerancia a imágenes faltantes/rotas en `book-thumbnail.tsx`, `image-carousel.tsx`, `accessory-card.tsx`, `combo-card.tsx`, `cart-item.tsx`, `Admin/Accessories/Index.tsx` y `Admin/Combos/Index.tsx`.

### Archivos creados y modificados en Fases 2 y 3
- **Creados:**
  - `app/Http/Middleware/EnsureUserIsActive.php`
  - `resources/js/components/ui/safe-image.tsx`
- **Modificados (Backend, configuración y vistas):**
  - `app/Http/Controllers/Admin/{AdminOrderController,AdminBookController,AdminAccessoryController,AdminComboController,AdminMediaController,AdminUserController}.php`
  - `app/Http/Controllers/BookController.php`
  - `app/Http/Requests/Auth/LoginRequest.php`
  - `app/Http/Requests/Admin/{StoreBookRequest,UpdateBookRequest}.php`
  - `app/Services/{OrderService,ReportService}.php`
  - `bootstrap/app.php`, `routes/web.php`
  - `database/factories/UserFactory.php`
  - `database/seeders/{OrderLeadSeeder,BookSeeder,AccessorySeeder}.php`
  - `resources/views/{emails/order-confirmation,pdf/order-remito}.blade.php`
- **Modificados (Frontend):**
  - `package.json`
  - `resources/js/types/index.ts`
  - `resources/js/components/nav-user.tsx`
  - `resources/js/components/admin/image-gallery-upload.tsx`
  - `resources/js/components/ui/{book-thumbnail,image-carousel}.tsx`
  - `resources/js/components/catalog/{accessory-card,combo-card}.tsx`
  - `resources/js/components/cart/cart-item.tsx`
  - `resources/js/pages/settings/profile.tsx`
  - `resources/js/pages/Customer/Orders/Index.tsx`
  - `resources/js/pages/Admin/{Orders/Index,Accessories/Index,Combos/Index}.tsx`
- **Modificados (Tests):**
  - `tests/Feature/{CatalogTest,CheckoutTest,RolesAndPermissionsTest,AdminBookTest,AdminModulesTest}.php`
  - `tests/Feature/Auth/AuthenticationTest.php`

### Verificación ejecutada tras los cambios de Fases 2 y 3
- **Sintaxis PHP (`php -l`):** 0 errores en todos los archivos PHP creados/modificados (24 archivos iniciales + 4 tras ajuste final).
- **TypeScript (`npx tsc --noEmit`):** 0 errores (código de salida `0`).
- **Build Vite (`npx vite build`):** exitoso en `1m 19s` (`3309 modules transformed`, `0` errores).
- **Suite completa Laravel (`php artisan test` sobre `alma_lectora_paw_test`):** `100 passed (621 assertions)` en `61.23s`, `0` fallos, `0` omitidos.

---

## Cierre de Fase 2 — H-13 (Alternativa A: Spatie Roles + Permisos Granulares) y H-45 (IMPLEMENTADO, PENDIENTE VERIFICACIÓN EN FASE 6)

- **Gate global y roles Spatie:**
  - `app/Providers/AppServiceProvider.php`: agregado `Gate::before(...)` para otorgar bypass completo al rol `super-admin` manteniendo `UserPolicy` y `OrderLeadPolicy`.
  - `database/seeders/RolesAndPermissionsSeeder.php`: extraída `public const ADMIN_PERMISSIONS` (27 permisos administrativos) como única fuente de verdad para `'admin'`.
  - `database/factories/UserFactory.php`: `admin()` asegura la existencia y asignación del rol `'admin'` con sus permisos mediante `->afterCreating(...)`.
  - `app/Models/User.php` y `resources/js/hooks/use-auth.tsx`: `isAdmin()` / `isAdmin` evalúan `super-admin`, `admin` o roles personalizados (distintos de `client`/`guest`) con al menos un permiso asignado.
- **Protección granular de rutas (`routes/web.php`):**
  - Middleware `permission:...` por módulo sobre `/admin/upload-image`, `/admin/libros/*`, `/admin/accesorios/*`, `/admin/combos/*`, `/admin/pedidos/*`, `/admin/configuracion/*` y `/admin/reportes/*`; gestión de usuarios, roles y permisos reservada a `role:super-admin`.
- **Dashboard (`H-45` y visibilidad por permisos):**
  - `app/Http/Controllers/Admin/AdminDashboardController.php` y `resources/js/pages/Admin/Dashboard.tsx`: las métricas operativas requieren permiso `'ver dashboard'`, la ventana móvil de 30 días usa exactamente `subDays(29)->startOfDay()` con `period_total_orders` como denominador coherente, y el acceso a analítica respeta `can('ver reportes estadisticos')`.
- **Tests:** `tests/Feature/RolesAndPermissionsTest.php` incorpora verificación de roles personalizados y revocación/modificación real de permisos sobre rutas backend.

---

## Fase 4 — Reportes Gerenciales (`AUDITORIA-REPORTES.md`) (IMPLEMENTADA, PENDIENTE VERIFICACIÓN EN FASE 6)

### Indicadores, Filtros y Alcances
- **Ventanas temporales y rango personalizado (`H-12`):** `AdminReportController::resolveDateRange()` unifica `7_days` (`subDays(6)`), `30_days` (`subDays(29)`), `current_month`, `all` y `custom` (`from`/`to` validados con `after_or_equal:from`), propagando `customRange` a UI, PDF y Excel. En `ReportService::getSalesTimeline()`, el período `all` inicia en la fecha mínima real de `OrderLead`.
- **Consistencia de KPIs y catálogo activo (`H-16`, `H-18`):** `ReportService` restringe catálogo activo y alertas de stock a `Book::active()->withoutTrashed()`, desglosa unidades de libros junto a `accessory_units_sold`, `combo_units_sold` y `total_item_units_sold`, y unifica etiquetas en UI, PDF y Excel (`Ventas Confirmadas`, `Tasa de Confirmación`, `Ticket Promedio`, `Libros Vendidos`, `Total Confirmado`).

### Interfaz (`resources/js/pages/Admin/Reports/Index.tsx`), PDF y Excel
- **UI (`H-47.4`, `H-47.5`, `H-47.6`):** selector de **Rango personalizado** (`Desde`/`Hasta` con validación inline), pestaña dedicada **Menor Rotación (`least_selling_books`)** separada de **Sin Ventas (`no_sales_books`)**, tooltip del gráfico mostrando ventas y cantidad de pedidos del día, y claves estables en la tabla de clientes.
- **PDF (`resources/views/pdf/executive-report.blade.php`, `H-35`):** muestra `Período`, `Emitido` y `Generado por`, corrige etiquetas comerciales, agrega reglas CSS de paginación en tablas y elimina el corte artificial de 8 registros en `critical_stock`.
- **Excel (`H-11`, `H-15`, `H-34`, `H-36`):**
  - Nuevo trait `app/Exports/Concerns/FormulaSafeValueBinder.php` compartido por `ExecutiveSummarySheet`, `TopCustomersSheet`, `BooksPerformanceSheet`, `CriticalStockSheet`, `BooksExport`, `AccessoriesExport` y `CombosExport` para escribir strings como `DataType::TYPE_STRING` (protección contra inyección de fórmulas tipo `=SUM(...)`), conservando `DataType::TYPE_FORMULA` explícito únicamente en las filas `SUBTOTAL`.
  - Encabezado con período real en todas las hojas del reporte ejecutivo, eliminación de fórmulas `=IF(...)` sin cachear en `ExecutiveSummarySheet`, formato `d/m/Y H:i` en última compra (`TopCustomersSheet`), prefijos `Top #N`/`Rotación #N`/`Sin ventas #N` y listado completo en `BooksPerformanceSheet`, filtro `?tab=` y limpieza de tags HTML en exportaciones de catálogo.
- **Tests (`tests/Feature/AdminReportsTest.php`):** pruebas para validación de rango personalizado invertido, filtrado real de órdenes y generación efectiva de archivo `.xlsx` validando período, KPIs numéricos y neutralización `TYPE_STRING` ante `=SUM(1+1)`.

---

## Fase 5 — Correcciones Complementarias P2 / P3 (IMPLEMENTADA, PENDIENTE VERIFICACIÓN EN FASE 6)

### Hallazgos implementados (bajo riesgo y alto valor funcional/académico)
1. **H-24 (`StoreOrderLeadRequest.php`, `routes/web.php`):** límite máximo de `30` ítems distintos por pedido (`max:30`) y rate limiting (`throttle:10,1`) en `POST /pedidos/lead`.
2. **H-26 y H-44 (`AdminOrderController.php`, `Admin/Orders/Index.tsx`):** matriz explícita de transiciones permitidas (`PENDING_WHATSAPP -> CONFIRMED|CANCELLED`, `CONFIRMED -> CANCELLED|PENDING_WHATSAPP`, `CANCELLED -> PENDING_WHATSAPP`), evitando confirmar directamente órdenes canceladas; botones en UI para **Revertir a Pendiente** (en confirmados) y **Reactivar pedido** (en cancelados) con modal de confirmación.
3. **H-33 (`CustomerOrderController.php`):** descarga PDF renombrada a `remito-orden-{$shortId}.pdf` en coherencia con el concepto no fiscal de remito.
4. **H-37 (`app/Support/HtmlSanitizer.php`, `AdminBookController`, `AdminAccessoryController`, `AdminComboController`):** sanitización HTML al persistir `synopsis` y `description` (remueve `<script>`, `<iframe>`, `<svg>`, estilos y cualquier atributo/evento inline preservando formato básico).
5. **H-41 (`Admin/Accessories/Index.tsx`, `Admin/Combos/Index.tsx`, `quick-stock-modal.tsx`):** `handleSaveStock` retorna una `Promise` real ligada a `onSuccess`/`onError` de Inertia y el modal mantiene visible cualquier error sin cerrarse optimísticamente.
6. **H-42 (`Admin/Books/Form.tsx`):** agregados los controles editables de **Idioma (`language`)** y **Fecha / Año de Publicación (`published_date`)**.
7. **H-46 (`CartDrawer`, `Checkout/Index.tsx`, `step-customer.tsx`):** `CartDrawer` detiene el avance al checkout si falla `/carrito/verificar-stock`; el checkout valida longitudes mínimas de DNI/teléfono en cliente, conserva y mapea errores `422` por campo desde el servidor y retrocede al paso correspondiente para mostrarlos.
8. **H-47.1, H-47.2 y H-47.3 (`cart-store.ts`, `HomePage.tsx`, `image-carousel.tsx`):** `syncStocks` recorta cantidades que excedan el stock sincronizado (> 0); `HomePage.tsx` hace opcional `viewAllLink` en `SectionWrapper` y lo omite en *Combos Literarios*; `ImageCarousel` aplica límite seguro de índice durante el render.
- **Tests actualizados (`CustomerOrdersTest.php`, `AdminModulesTest.php`, `CheckoutTest.php`):** cobertura agregada para nombre `remito-orden-*`, transición bloqueada `CANCELLED -> CONFIRMED` y reactivación, sanitización XSS en descripción de accesorios, y rechazo con más de 30 ítems en checkout.

### Mejoras opcionales documentadas (fuera de alcance / sin implementar)
- **H-20:** política de complejidad extendida de contraseñas y expiración.
- **H-22 / H-23:** endurecimiento de infraestructura productiva (TLS/SMTP real, timeout de sesión endurecido).
- **H-25:** conversión de stock de combos de almacenado a 100% derivado (ya analizado en Fase 2; se conserva modelo actual por dependencias de filtro SQL y edición manual).
- **H-27 / H-28 / H-29:** optimizaciones de caché en Redis, índices compuestos adicionales y mejoras avanzadas de SEO/SSR.

---

## Fase 6 — Validación Final (COMPLETADA)
- **Suite completa Laravel (`php artisan test` sobre `alma_lectora_paw_test`):** `105 passed (667 assertions)` en `54.38s` (`0` fallos, `0` omitidos).
- **Verificación TypeScript (`npx tsc --noEmit`):** código de salida `0` (`0` errores).
- **Build frontend (`npx vite build`):** exitoso en `18.04s` (`3309 modules transformed`, `0` errores).
- **Rutas y enlace local:** `68` rutas `/admin/*` registradas y `public/storage` enlazado correctamente (`True`).
- **Nota de pruebas ajustadas en Fase 6:** en `AdminModulesTest`, `AdminReportsTest`, `CheckoutTest` y `CustomerOrdersTest` se corrigieron datos iniciales/aserciones de prueba (creación de `AccessoryCategory` en test de sanitización, libro con `stock > 0` al simular checkout de invitado, fila `C12` para tasa de confirmación en `ExecutiveSummarySheet` y creación explícita de libro en prueba de límite de 30 ítems).

---

## Ajustes Post-Fase 6 — UX, Normalización y Paginación (COMPLETADA)

- **Gestión de pedidos (`Admin/Orders/Index.tsx`):** eliminado el botón/modal de eliminación directa de órdenes para preservar historial y conteos comerciales; corregido el doble `++` al formatear el teléfono y reemplazado el ícono SVG de WhatsApp (también en `Checkout/Index.tsx`) por un trazo centrado y nítido. Confirmado ordenamiento descendente (`->latest()`) en `AdminOrderController::index()`.
- **Inputs de stock (`Books/Form.tsx`, `Accessories/Form.tsx`, `Combos/Form.tsx`, `quick-stock-modal.tsx`):** estado textual editable durante la escritura para permitir borrar el `0` sin bloqueo.
- **Búsqueda y guardado de géneros y autores (`app/Support/GenreNormalizer.php`, `resources/js/lib/text.ts`, `AdminBookController.php`, `AdminConfigController.php`, `Books/Form.tsx`):** filtrado sin sensibilidad a tildes ni mayúsculas; normalización canónica y Title Case al guardar géneros (evitando duplicados tipo `"FANtasía"` / `"fantasia"` junto a `"Fantasía"`) y matching de autores existente sin sensibilidad a tildes.
- **Paginación (`lang/es/pagination.php`, `resources/js/components/ui/pagination-links.tsx`):** agregadas traducciones en español y unificado el componente con flechas `<` y `>` en las 7 vistas paginadas (`Admin/{Books,Accessories,Combos,Orders,Users}/Index`, `Catalog/AccessoriesPage`, `Customer/Orders/Index`).
- **Footer y Reportes (`page-shell.tsx`, `admin-layout.tsx`, `Admin/Dashboard.tsx`, `Admin/Reports/Index.tsx`):** eliminado el subtítulo técnico del footer; renombrado el módulo/pestaña a `Reportes`, quitada la descripción bajo `Filtrar analítica por período` y estirados los filtros de período en una única fila superior de ancho completo.
- **Verificación tras los ajustes:** `npx tsc --noEmit` (`0` errores), `npx vite build` (`3311 modules transformed` en `23.40s`), `php artisan test` (`106 passed (679 assertions)` en `94.63s`).
