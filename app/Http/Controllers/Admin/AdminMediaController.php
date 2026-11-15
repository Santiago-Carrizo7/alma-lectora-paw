<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Accessory;
use App\Models\Book;
use App\Models\Combo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminMediaController extends Controller
{
    /**
     * Upload an image file for products (books, accessories, combos) and return its public storage URL.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'image', 'mimes:jpeg,jpg,png,webp,gif', 'max:5120'],
        ]);

        $file = $request->file('image');
        $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
        $filename = Str::uuid()->toString().'.'.$extension;

        $path = $file->storeAs('uploads', $filename, 'public');

        return response()->json([
            'url' => '/storage/'.$path,
            'filename' => $filename,
        ]);
    }

    /**
     * Delete a locally uploaded product image if its path points inside /storage/uploads/.
     */
    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'url' => ['required', 'string', 'max:1000'],
        ]);

        $relativePath = self::extractUploadPath($validated['url']);

        if ($relativePath === null) {
            return response()->json([
                'message' => 'Ruta de archivo inválida o fuera del directorio permitido.',
            ], 422);
        }

        if (self::isReferencedByAnyProduct('/storage/'.$relativePath)) {
            return response()->json([
                'deleted' => false,
                'message' => 'La imagen sigue asociada a un producto guardado.',
            ]);
        }

        $deleted = Storage::disk('public')->delete($relativePath);

        return response()->json([
            'deleted' => $deleted,
        ]);
    }

    /**
     * Extract a safe relative path (`uploads/<filename>`) from a managed upload URL, or null if invalid/external.
     */
    public static function extractUploadPath(?string $url): ?string
    {
        if (! is_string($url)) {
            return null;
        }

        $trimmed = trim($url);
        if ($trimmed === '' || str_contains($trimmed, '..') || str_contains($trimmed, '\\')) {
            return null;
        }

        $path = parse_url($trimmed, PHP_URL_PATH) ?: $trimmed;

        if (preg_match('/^\/?storage\/(uploads\/[A-Za-z0-9._-]+)$/', $path, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Delete an old local upload file when replaced or removed, as long as no other product still uses it.
     */
    public static function deleteLocalUploadIfUnused(?string $url): bool
    {
        $relativePath = self::extractUploadPath($url);
        if ($relativePath === null) {
            return false;
        }

        $canonicalUrl = '/storage/'.$relativePath;
        if (self::isReferencedByAnyProduct($canonicalUrl)) {
            return false;
        }

        if (! Storage::disk('public')->exists($relativePath)) {
            return false;
        }

        return Storage::disk('public')->delete($relativePath);
    }

    protected static function isReferencedByAnyProduct(string $canonicalUrl): bool
    {
        foreach ([Book::class, Accessory::class, Combo::class] as $modelClass) {
            $exists = $modelClass::withTrashed()
                ->where('cover_url', $canonicalUrl)
                ->orWhereJsonContains('additional_images', $canonicalUrl)
                ->exists();

            if ($exists) {
                return true;
            }
        }

        return false;
    }
}
