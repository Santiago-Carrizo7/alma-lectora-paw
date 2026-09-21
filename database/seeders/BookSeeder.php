<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $backupFile = database_path('seeders/backup_data.json');

        if (File::exists($backupFile)) {
            $data = json_decode(File::get($backupFile), true);
            $tables = $data['tables'] ?? $data;
            $authors = $tables['authors'] ?? [];
            $books = $tables['books'] ?? [];
            $bookAuthors = $tables['bookAuthors'] ?? [];

            foreach ($authors as $author) {
                Author::updateOrCreate(
                    ['id' => $author['id']],
                    [
                        'name' => trim($author['name']),
                        'created_at' => $author['createdAt'] ?? now(),
                        'updated_at' => $author['createdAt'] ?? now(),
                    ]
                );
            }

            foreach ($books as $item) {
                Book::updateOrCreate(
                    ['id' => $item['id']],
                    [
                        'isbn' => $item['isbn'],
                        'title' => $item['title'],
                        'original_title' => $item['originalTitle'] ?? $item['title'],
                        'google_books_id' => $item['googleBooksId'] ?? null,
                        'published_date' => $item['publishedDate'] ?? null,
                        'language' => $item['language'] ?? 'es',
                        'synopsis' => $item['synopsis'] ?? null,
                        'cover_url' => $item['coverUrl'] ?? null,
                        'additional_images' => $item['additionalImages'] ?? [],
                        'price' => $item['price'] ?? 0,
                        'promo_quantity' => $item['promoQuantity'] ?? null,
                        'promo_price' => $item['promoPrice'] ?? null,
                        'stock' => $item['stock'] ?? 0,
                        'badge' => $item['badge'] ?? null,
                        'genre' => $item['genre'] ?? null,
                        'is_active' => $item['isActive'] ?? true,
                        'created_at' => $item['createdAt'] ?? now(),
                        'updated_at' => $item['updatedAt'] ?? now(),
                    ]
                );
            }

            foreach ($bookAuthors as $ba) {
                DB::table('book_authors')->updateOrInsert(
                    [
                        'book_id' => $ba['bookId'],
                        'author_id' => $ba['authorId'],
                    ]
                );
            }

            return;
        }

        // Fallback en caso de que no exista el archivo de backup
        $books = [
            [
                'title' => 'Boulevard Eterno',
                'author' => 'Flor M. Salvador',
                'isbn' => '9789807909068',
                'price' => 20000,
                'stock' => 5,
                'badge' => 'Novedad',
                'genre' => 'Romance Juvenil',
                'synopsis' => 'El cierre inolvidable de la saga Boulevard. Nuevas revelaciones y emociones profundas acompañan a los protagonistas en un viaje de superación personal y amor incondicional.',
                'promo_quantity' => 2,
                'promo_price' => 35000,
            ],
            [
                'title' => 'Boulevard 3',
                'author' => 'Flor M. Salvador',
                'isbn' => '9788418594663',
                'price' => 20000,
                'stock' => 2,
                'badge' => null,
                'genre' => 'Romance Juvenil',
                'synopsis' => 'La continuación de una historia que tocó miles de corazones. La superación del dolor y la búsqueda de esperanza frente a la adversidad.',
                'promo_quantity' => null,
                'promo_price' => null,
            ],
            [
                'title' => 'King of Pride',
                'author' => 'Ana Huang',
                'isbn' => '9786073920100',
                'price' => 25000,
                'stock' => 4,
                'badge' => null,
                'genre' => 'Romance Contemporáneo',
                'synopsis' => 'Kai Young es un hombre reservado y controlado. Isabella Valencia es caótica, vibrante e inolvidable. Entre la disciplina y la tentación, las reglas están hechas para romperse.',
                'promo_quantity' => null,
                'promo_price' => null,
            ],
            [
                'title' => 'King of Wrath',
                'author' => 'Ana Huang',
                'isbn' => '9788408288725',
                'price' => 25000,
                'stock' => 6,
                'badge' => 'Más vendido',
                'genre' => 'Romance Contemporáneo',
                'synopsis' => 'Dante Russo es despiadado y dominante. Forzado a casarse con Vivian Lau, planea destruir a quienes lo chantajearon, hasta que descubre que su mayor debilidad es la mujer con la que se casó.',
                'promo_quantity' => 2,
                'promo_price' => 42000,
            ],
            [
                'title' => 'King of Sloth',
                'author' => 'Ana Huang',
                'isbn' => '9788408303992',
                'price' => 25000,
                'stock' => 1,
                'badge' => null,
                'genre' => 'Romance Contemporáneo',
                'synopsis' => 'Xavier Castillo tiene dinero, encanto e indiferencia hacia la vida empresarial. Sloane Kensington es su publicista y la única persona inmune a su encanto.',
                'promo_quantity' => null,
                'promo_price' => null,
            ],
            [
                'title' => 'King of Greed',
                'author' => 'Ana Huang',
                'isbn' => '9788408299516',
                'price' => 25000,
                'stock' => 3,
                'badge' => null,
                'genre' => 'Romance Contemporáneo',
                'synopsis' => 'Dominic Davenport construyó un imperio financiero desde la nada. Pero en su ascenso implacable, perdió de vista lo único que verdaderamente importaba: Alessandra.',
                'promo_quantity' => null,
                'promo_price' => null,
            ],
            [
                'title' => 'El arte de ser nosotros',
                'author' => 'Inma Rubiales',
                'isbn' => '9788408267928',
                'price' => 25000,
                'stock' => 2,
                'badge' => null,
                'genre' => 'Romance Juvenil',
                'synopsis' => 'Logan y Leah son polos opuestos. Una historia tierna y luminosa sobre la música, el arte, las segundas oportunidades y aprender a querer sin máscaras.',
                'promo_quantity' => null,
                'promo_price' => null,
            ],
            [
                'title' => 'Boulevard 2',
                'author' => 'Flor M. Salvador',
                'isbn' => '9788418798238',
                'price' => 20000,
                'stock' => 2,
                'badge' => null,
                'genre' => 'Romance Juvenil',
                'synopsis' => 'Luke y Hasley continúan aprendiendo qué significa sostenerse el uno al otro en medio de las tormentas familiares y emocionales.',
                'promo_quantity' => null,
                'promo_price' => null,
            ],
            [
                'title' => 'Boulevard',
                'author' => 'Flor M. Salvador',
                'isbn' => '9788419169181',
                'price' => 20000,
                'stock' => 8,
                'badge' => null,
                'genre' => 'Romance Juvenil',
                'synopsis' => 'Luke Howland, lleno de sombras y heridas. Hasley Weigel, luz y espontaneidad. Juntos crearon su propio boulevard bajo un cielo estrellado.',
                'promo_quantity' => 2,
                'promo_price' => 35000,
            ],
            [
                'title' => 'Cuando no queden más estrellas que contar',
                'author' => 'María Martínez',
                'isbn' => '9789507325243',
                'price' => 18000,
                'stock' => 5,
                'badge' => 'Más vendido',
                'genre' => 'Romance Juvenil',
                'synopsis' => 'Desde pequeña, Maya ha sacrificado todo por el ballet clásico. Tras un accidente inesperado, emprende un viaje que la llevará a reencontrarse con su pasión y con ella misma.',
                'promo_quantity' => null,
                'promo_price' => null,
            ],
            [
                'title' => 'Tres meses',
                'author' => 'Joana Marcús',
                'isbn' => '9788418798849',
                'price' => 25000,
                'stock' => 3,
                'badge' => null,
                'genre' => 'Romance Juvenil',
                'synopsis' => 'Jack Ross nunca planeó enamorarse, pero cuando Jenna Brown llegó a su vida, tres meses fueron suficientes para cambiarlo todo.',
                'promo_quantity' => null,
                'promo_price' => null,
            ],
            [
                'title' => 'Las luces de febrero',
                'author' => 'Joana Marcús',
                'isbn' => '9788419421135',
                'price' => 25000,
                'stock' => 2,
                'badge' => null,
                'genre' => 'Romance Juvenil',
                'synopsis' => 'El broche de oro para la saga Meses a tu lado. Las decisiones de futuro ponen a prueba la solidez de los lazos compartidos.',
                'promo_quantity' => null,
                'promo_price' => null,
            ],
            [
                'title' => 'Después de diciembre',
                'author' => 'Joana Marcús',
                'isbn' => '9788490706466',
                'price' => 25000,
                'stock' => 1,
                'badge' => null,
                'genre' => 'Romance Juvenil',
                'synopsis' => 'Jenna vuelve a casa para reencontrarse con los ecos del pasado. Madurar significa elegir qué batallas librar y a quiénes sostener cerca.',
                'promo_quantity' => null,
                'promo_price' => null,
            ],
            [
                'title' => 'Todos los lugares que mantuvimos en secreto',
                'author' => 'Inma Rubiales',
                'isbn' => '9788408283461',
                'price' => 25000,
                'stock' => 4,
                'badge' => 'Más vendido',
                'genre' => 'Romance Juvenil',
                'synopsis' => 'Maeve y Connor descubren que los secretos compartidos en rincones escondidos pueden convertirse en el refugio más seguro del mundo.',
                'promo_quantity' => null,
                'promo_price' => null,
            ],
            [
                'title' => 'Todo lo que nunca fuimos',
                'author' => 'Alice Kellen',
                'isbn' => '9788408204824',
                'price' => 20000,
                'stock' => 7,
                'badge' => 'Más vendido',
                'genre' => 'Romance Contemporáneo',
                'synopsis' => 'Leah está rota desde el accidente. Axel acepta recibirla en su casa para ayudarla a encontrar los colores perdidos en medio de la tristeza.',
                'promo_quantity' => 2,
                'promo_price' => 36000,
            ],
            [
                'title' => 'Iron Flame',
                'author' => 'Rebecca Yarros',
                'isbn' => '9786073910033',
                'price' => 25000,
                'stock' => 6,
                'badge' => 'Destacado',
                'genre' => 'Fantasía',
                'synopsis' => 'Violet Sorrengail sobrevivió a su primer año en el Colegio de Guerra de Basgiath. Ahora comienza el verdadero entrenamiento, donde los secretos del reino arriesgan quemarlo todo.',
                'promo_quantity' => null,
                'promo_price' => null,
            ],
            [
                'title' => 'Culpa vuestra',
                'author' => 'Mercedes Ron',
                'isbn' => '9786316620071',
                'price' => 20000,
                'stock' => 4,
                'badge' => null,
                'genre' => 'Romance Juvenil',
                'synopsis' => 'Nicholas y Noah se enfrentan a las consecuencias de un romance clandestino. La universidad y nuevas amistades amenazan con encender viejos celos.',
                'promo_quantity' => null,
                'promo_price' => null,
            ],
        ];

        foreach ($books as $item) {
            $author = Author::firstOrCreate([
                'name' => trim($item['author']),
            ]);

            $coverUrl = "https://covers.openlibrary.org/b/isbn/{$item['isbn']}-L.jpg";

            $book = Book::updateOrCreate(
                ['isbn' => $item['isbn']],
                [
                    'title' => $item['title'],
                    'original_title' => $item['title'],
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'badge' => $item['badge'],
                    'genre' => $item['genre'],
                    'synopsis' => $item['synopsis'],
                    'cover_url' => $coverUrl,
                    'additional_images' => [],
                    'promo_quantity' => $item['promo_quantity'],
                    'promo_price' => $item['promo_price'],
                    'language' => 'es',
                    'published_date' => '2023',
                    'is_active' => true,
                ]
            );

            $book->authors()->syncWithoutDetaching([$author->id]);
        }
    }
}
