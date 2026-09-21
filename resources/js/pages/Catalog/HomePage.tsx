import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { AccessoryCard } from '../../components/catalog/accessory-card';
import { BookCard } from '../../components/catalog/book-card';
import { ComboCard } from '../../components/catalog/combo-card';
import { HorizontalScrollCarousel } from '../../components/catalog/horizontal-scroll-carousel';
import { ButtonEditorial } from '../../components/ui/button-editorial';
import { PageShell } from '../../layouts/page-shell';
import type { Accessory, Book, Combo } from '../../types/alma';

interface HomePageProps {
    bestSellers: Book[];
    novelties: Book[];
    combos?: Combo[];
    featuredAccessories: Accessory[];
}

interface SectionWrapperProps {
    title: string;
    subtitle: string;
    viewAllLink: string;
    mobileGrid: React.ReactNode;
    desktopCarousel: React.ReactNode;
}

function SectionWrapper({ title, subtitle, viewAllLink, mobileGrid, desktopCarousel }: SectionWrapperProps) {
    return (
        <section className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h2 className="text-ink font-serif text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
                    <p className="mt-0.5 text-xs text-stone-500 sm:mt-1">{subtitle}</p>
                </div>
                <Link
                    href={viewAllLink}
                    className="text-forest hover:text-forest-light shrink-0 pt-1 text-xs font-semibold tracking-wider uppercase underline whitespace-nowrap"
                >
                    Ver Todos
                </Link>
            </div>

            <div className="block sm:hidden">
                {mobileGrid}
            </div>

            <div className="hidden sm:block">
                {desktopCarousel}
            </div>
        </section>
    );
}

export function HomePage({ bestSellers = [], novelties = [], combos = [], featuredAccessories = [] }: HomePageProps) {
    return (
        <PageShell>
            <Head title="Inicio" />

            <div className="animate-fade-in space-y-16">
                <section className="bg-paper-dark border-paper-dark relative overflow-hidden rounded-xl border px-6 py-14 text-center shadow-xs sm:px-12 sm:text-left">
                    <div className="max-w-2xl space-y-4">
                        <span className="text-forest/70 font-sans text-xs font-bold tracking-widest uppercase">
                            Catálogo Alma Lectora
                        </span>
                        <h1 className="text-ink font-serif text-3xl leading-tight font-black sm:text-5xl">
                            Libros que inspiran, <br />
                            historias que perduran.
                        </h1>
                        <p className="text-ink-muted max-w-lg font-sans text-sm leading-relaxed sm:text-base">
                            Explorá nuestra selección curada de libros y accesorios premium. Armá tu pedido, ingresá tus datos de entrega y finalizá la compra directamente con nosotros por WhatsApp.
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
                                    className="border border-stone-400 px-5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                                >
                                    🕯️ Accesorios
                                </ButtonEditorial>
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="space-y-16">
                    {bestSellers.length > 0 && (
                        <SectionWrapper
                            title="Lo Más Vendido"
                            subtitle="Los favoritos indiscutidos de nuestra comunidad."
                            viewAllLink="/libros"
                            mobileGrid={
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    {bestSellers.slice(0, 4).map((book) => (
                                        <BookCard key={book.id} book={book} />
                                    ))}
                                </div>
                            }
                            desktopCarousel={
                                <HorizontalScrollCarousel>
                                    {bestSellers.map((book) => (
                                        <div key={book.id} className="w-52 min-w-0 shrink-0 snap-start sm:w-60">
                                            <BookCard book={book} />
                                        </div>
                                    ))}
                                </HorizontalScrollCarousel>
                            }
                        />
                    )}

                    {novelties.length > 0 && (
                        <SectionWrapper
                            title="Novedades"
                            subtitle="Los últimos títulos incorporados a nuestra biblioteca."
                            viewAllLink="/libros"
                            mobileGrid={
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    {novelties.slice(0, 4).map((book) => (
                                        <BookCard key={book.id} book={book} />
                                    ))}
                                </div>
                            }
                            desktopCarousel={
                                <HorizontalScrollCarousel>
                                    {novelties.map((book) => (
                                        <div key={book.id} className="w-52 min-w-0 shrink-0 snap-start sm:w-60">
                                            <BookCard book={book} />
                                        </div>
                                    ))}
                                </HorizontalScrollCarousel>
                            }
                        />
                    )}

                    {combos.length > 0 && (
                        <SectionWrapper
                            title="Combos Literarios"
                            subtitle="Ahorrá llevando paquetes combinados con ofertas únicas."
                            viewAllLink="/"
                            mobileGrid={
                                <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
                                    {combos.slice(0, 4).map((combo) => (
                                        <ComboCard key={combo.id} combo={combo} />
                                    ))}
                                </div>
                            }
                            desktopCarousel={
                                <HorizontalScrollCarousel>
                                    {combos.map((combo) => (
                                        <div key={combo.id} className="w-72 min-w-0 shrink-0 snap-start sm:w-80">
                                            <ComboCard combo={combo} />
                                        </div>
                                    ))}
                                </HorizontalScrollCarousel>
                            }
                        />
                    )}

                    {featuredAccessories.length > 0 && (
                        <SectionWrapper
                            title="Accesorios Literarios"
                            subtitle="Accesorios artesanales y objetos especiales para acompañar tu lectura."
                            viewAllLink="/accesorios"
                            mobileGrid={
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    {featuredAccessories.slice(0, 4).map((accessory) => (
                                        <AccessoryCard key={accessory.id} accessory={accessory} />
                                    ))}
                                </div>
                            }
                            desktopCarousel={
                                <HorizontalScrollCarousel>
                                    {featuredAccessories.map((accessory) => (
                                        <div key={accessory.id} className="w-48 min-w-0 shrink-0 snap-start sm:w-56">
                                            <AccessoryCard accessory={accessory} />
                                        </div>
                                    ))}
                                </HorizontalScrollCarousel>
                            }
                        />
                    )}
                </div>
            </div>
        </PageShell>
    );
}

export default HomePage;
