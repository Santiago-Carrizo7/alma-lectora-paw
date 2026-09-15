import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AdminLayout } from '../../layouts/admin-layout';

export function Dashboard() {
  const modules = [
    {
      title: 'Gestión de Libros',
      description: 'Control de inventario, catálogo, altas, bajas lógicas, reactivación y ajuste táctil de stock.',
      href: '/admin/libros',
      active: true,
      badge: 'Fase 2 Activa',
      icon: (
        <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
    {
      title: 'Accesorios',
      description: 'Mantenimiento de catálogo de velas aromáticas, señaladores y complementos.',
      href: '#',
      active: false,
      badge: 'Próximamente',
      icon: (
        <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
        </svg>
      ),
    },
    {
      title: 'Combos Promocionales',
      description: 'Creación y edición de paquetes de libros con accesorios y promociones por volumen.',
      href: '#',
      active: false,
      badge: 'Próximamente',
      icon: (
        <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0-2.625V7.5m0 0h-3.75M12 7.5h3.75M3.75 7.5h16.5a1.5 1.5 0 0 1 1.5 1.5v1.5a1.5 1.5 0 0 1-1.5 1.5H3.75A1.5 1.5 0 0 1 2.25 10.5V9a1.5 1.5 0 0 1 1.5-1.5Z" />
        </svg>
      ),
    },
    {
      title: 'Gestión de Pedidos',
      description: 'Control de órdenes, confirmación de compras de clientes y deducción de inventario.',
      href: '#',
      active: false,
      badge: 'Próximamente',
      icon: (
        <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.75A1.125 1.125 0 0 1 2.625 17.625V4.625A1.125 1.125 0 0 1 3.75 3.5h1.625c.621 0 1.125.504 1.125 1.125v9.75c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.75M16.5 9.75V3.5m0 0h1.625a1.125 1.125 0 0 1 1.125 1.125v4.375c0 .621-.504 1.125-1.125 1.125H16.5M16.5 3.5v6.25" />
        </svg>
      ),
    },
    {
      title: 'Configuración',
      description: 'Ajustes generales del negocio, costos de envío y parámetros de contacto.',
      href: '#',
      active: false,
      badge: 'Próximamente',
      icon: (
        <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Centro de Control General"
      subtitle="Bienvenido al panel de gestión de Alma Lectora 2"
    >
      <Head title="Panel de Administración" />

      {/* Welcome Banner */}
      <div className="bg-paper-dark/40 rounded-2xl p-6 border border-paper-dark/80 text-ink space-y-2">
        <h2 className="text-xl font-bold font-serif text-ink">Arquitectura Monolítica Integral</h2>
        <p className="text-sm text-ink-muted leading-relaxed max-w-3xl">
          Este panel opera con el stack moderno de Laravel 12/13 e Inertia.js v2 sobre React 19.
          Las operaciones de inventario, bajas lógicas y validación se ejecutan de manera atómica
          en la base de datos PostgreSQL mediante Eloquent ORM.
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {modules.map((mod) => {
          const CardContent = (
            <div
              className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between h-full ${
                mod.active
                  ? 'bg-paper border-paper-dark/90 hover:border-forest/40 hover:shadow-md group cursor-pointer'
                  : 'bg-paper-dark/20 border-paper-dark/40 opacity-70 cursor-not-allowed'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3 rounded-xl border ${
                      mod.active ? 'bg-paper-dark/60 border-paper-dark group-hover:bg-forest/10' : 'bg-stone-100 border-stone-200'
                    }`}
                  >
                    {mod.icon}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      mod.active
                        ? 'bg-forest/15 text-forest border border-forest/30'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {mod.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3
                    className={`text-lg font-bold font-serif ${
                      mod.active ? 'text-ink group-hover:text-forest transition-colors' : 'text-stone-600'
                    }`}
                  >
                    {mod.title}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{mod.description}</p>
                </div>
              </div>

              {mod.active && (
                <div className="pt-4 mt-2 border-t border-paper-dark/60 flex items-center text-xs font-bold text-forest group-hover:underline">
                  Acceder al módulo &rarr;
                </div>
              )}
            </div>
          );

          return mod.active ? (
            <Link key={mod.title} href={mod.href}>
              {CardContent}
            </Link>
          ) : (
            <div key={mod.title}>{CardContent}</div>
          );
        })}
      </div>
    </AdminLayout>
  );
}

export default Dashboard;
