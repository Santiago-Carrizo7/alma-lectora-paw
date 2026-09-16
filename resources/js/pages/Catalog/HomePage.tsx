import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { AccessoryCard } from '../../components/catalog/accessory-card';
import { BookCard } from '../../components/catalog/book-card';
import { HorizontalScrollCarousel } from '../../components/catalog/horizontal-scroll-carousel';
import { ButtonEditorial } from '../../components/ui/button-editorial';
import { PageShell } from '../../layouts/page-shell';
import type { Accessory, Book } from '../../types/alma';

interface HomePageProps {
    bestSellers: Book[];
    novelties: Book[];
    featuredAccessories: Accessory[];
}

interface SectionProps {
    title: string;
    subtitle: string;
    viewAllHref: string;
    children: React.ReactNode;
}

function Section({ title, subtitle, viewAllHref, children }: SectionProps) {
    return (
        <section className="space-y-4">
            <div className="flex items-end justify-between px-1">
                <div>
                    <h2 className="text-ink font-serif text-2xl font-bold tracking-tight">{title}</h2>
                    <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p>
                </div>
                <Link href={viewAllHref} className="text-forest shrink-0 text-xs font-semibold tracking-wider uppercase hover:underline">
                    Ver Todos
                </Link>
            </div>
            {children}
        </section>
    );
}

export function HomePage({ bestSellers, novelties, featuredAccessories }: HomePageProps) {
    return (
        <PageShell>
            <Head title="Inicio" />

            <div className="animate-fade-in space-y-16">
                <section className="bg-paper-dark/60 border-paper-dark relative overflow-hidden rounded-xl border px-6 py-12 text-center shadow-xs sm:px-12 sm:text-left">
                    <div className="max-w-2xl space-y-4">
                        <span className="text-forest font-sans text-xs font-bold tracking-widest uppercase">Catálogo Alma Lectora</span>
                        <h1 className="text-ink font-serif text-3xl leading-tight font-black sm:text-5xl">
                            Libros que inspiran, <br />
                            historias que perduran.
                        </h1>
                        <p className="text-ink-muted max-w-lg font-sans text-sm leading-relaxed sm:text-base">
                            Explorá nuestra selección curada de libros y accesorios premium. Armá tu biblioteca ideal con títulos destacados y objetos
                            literarios hechos con pasión.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 pt-2 sm:justify-start">
                            <Link href="/libros">
                                <ButtonEditorial size="md" className="px-5 py-2.5 text-xs font-semibold">
                                    📚 Explorar Libros
                                </ButtonEditorial>
                            </Link>
                            <Link href="/accesorios">
                                <ButtonEditorial
                                    variant="ghost"
                                    size="md"
                                    className="border-stone-300 px-5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                                >
                                    🕯️ Accesorios
                                </ButtonEditorial>
                            </Link>
                        </div>
                    </div>
                </section>

                {bestSellers.length > 0 && (
                    <Section title="Lo Más Vendido" subtitle="Los favoritos indiscutidos de nuestra comunidad." viewAllHref="/libros">
                        <HorizontalScrollCarousel>
                            {bestSellers.map((book) => (
                                <div key={book.id} className="w-52 min-w-0 shrink-0 snap-start sm:w-60">
                                    <BookCard book={book} />
                                </div>
                            ))}
                        </HorizontalScrollCarousel>
                    </Section>
                )}

                {novelties.length > 0 && (
                    <Section title="Novedades" subtitle="Los últimos títulos incorporados a nuestra biblioteca." viewAllHref="/libros">
                        <HorizontalScrollCarousel>
                            {novelties.map((book) => (
                                <div key={book.id} className="w-52 min-w-0 shrink-0 snap-start sm:w-60">
                                    <BookCard book={book} />
                                </div>
                            ))}
                        </HorizontalScrollCarousel>
                    </Section>
                )}

                {featuredAccessories.length > 0 && (
                    <Section
                        title="Accesorios Literarios"
                        subtitle="Accesorios artesanales y objetos especiales para acompañar tu lectura."
                        viewAllHref="/accesorios"
                    >
                        <HorizontalScrollCarousel>
                            {featuredAccessories.map((accessory) => (
                                <div key={accessory.id} className="w-48 min-w-0 shrink-0 snap-start sm:w-56">
                                    <AccessoryCard accessory={accessory} />
                                </div>
                            ))}
                        </HorizontalScrollCarousel>
                    </Section>
                )}
            </div>
        </PageShell>
    );
}

export default HomePage;
