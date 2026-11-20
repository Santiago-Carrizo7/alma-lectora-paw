# Feature: qa-defensa-fixes

## Objective
Fix the defects found in the final E2E QA (QA-FINAL-DEFENSA.md) before the academic defense, then re-verify them in the browser.

## Problem / Why
The QA run found raw validation keys in the UI, promotions more expensive than the regular price, HTTP 500 errors on duplicate categories/roles, accent-sensitive search, letters accepted in DNI/phone, a misleading "email sent" message, and minor export/remito issues.

## Scope (authorized by the user on 2026-11-19)
- Spanish validation translations (lang/es/validation.php).
- Promo price must be cheaper than price × promo_quantity (books, accessories, combos) + seeders drop invalid promos from backup_data.json.
- Duplicate accessory category -> validation error instead of 500.
- Role names normalized (lowercase, the existing convention used by `hasRole('super-admin')`) before uniqueness validation -> no 500.
- Accent-insensitive search (with or without tildes returns the same results).
- DNI and phone accept digits only (checkout and registration); formatted values are normalized to digits.
- Checkout success screen must not claim the email was sent when sending failed.
- Executive report PDF "≤" symbol, Excel zero values shown as blank, product type shown in English in remito/admin UI.

## Out of scope
- Editing `.env` (access denied by the user's permissions; SMTP app password must be set by the user).
- Cleaning leftover demo data ("Cien años en Soledad", duplicate genres).

## Constraints
- No destructive migrations, no seeding of the demo DB (`alma_lectora_paw`). Verification uses a throwaway DB.
- Generated artifacts in English, UI copy in Spanish (existing project convention).
- Conventional Commits without AI attribution.

## Tasks
- [x] T1 Spanish validation translations + attribute names — e5d012f
- [x] T2 Promo validation (books, accessories, combos) + seeder sanitization — bc09067
- [x] T3 Duplicate category validation + role name normalization — 63de6b2
- [x] T4 Accent-insensitive search (books, accessories, combos) — 667d95b
- [x] T5 Digits-only DNI/phone (checkout + registration) + honest email message — 8ceb6f6
- [x] T6 PDF symbol, Excel zeros, Spanish product type labels — 71af731 (+ d787ee8 email template label)
- [x] T7 Full test suite green — `php artisan test`: 136 passed (819 assertions); `pnpm run build` OK; `pnpm run typecheck` OK
- [x] T8 Browser re-verification on a throwaway QA DB (dropped afterwards)

## Route
- T1–T6: delegated direct (one writer; 2+ non-trivial files -> writer trigger).
- T7: per-action verification.
- T8: parent, in-app browser.

## Acceptance criteria
Each defect from QA-FINAL-DEFENSA.md sections P1-01..P2-03 and P3-02/03/05 is reproduced as fixed in the browser or by HTTP, with focused feature tests added and the full suite passing.

## Progress / Evidence
- Branch: `fix/qa-defensa` (from `main` @ 09c0e06).
- Browser re-verification (2026-11-19, clone of the demo DB + full `db:seed`):
  - `db:seed` repairs promos: invalid book promos 7 -> 0, 7 valid promos kept.
  - Registration shows "El correo electrónico ya está en uso." / "La confirmación del campo contraseña no coincide."; letters typed in DNI/phone are discarded.
  - Non-image upload: "El campo imagen debe ser una imagen."; invalid promo: "El precio promocional debe ser menor que $4.000 (precio normal × cantidad)."
  - Duplicate category "separadores": "Ya existe una categoría con ese nombre." (no 500).
  - Roles "QA REPORTES" / "  qa   reportes " after "QA Reportes": 422 "Ya existe un rol con ese nombre."
  - Search "Rolon" = "ROLON" = "Rolón" = 11; "cafe" finds "Café".
  - Checkout stores DNI 30111229 / phone 5493870000009 from formatted input.
  - Real SMTP order to santicra12@gmail.com: accepted by SMTP, no failure logged.
  - Remito "LIBRO", admin orders "Tipo: Libro", PDF "(3 UNIDADES O MENOS)", Excel zeros shown as 0.
- Native review (RDD): consent granted; all 4 lens captures failed in preflight because the `claude` CLI executable is not on PATH (environment). Review left pending, no PASS claimed.
- Follow-ups not in scope: admin users/orders search still accent-sensitive; profile settings do not normalize DNI/phone.
