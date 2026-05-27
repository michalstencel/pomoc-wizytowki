import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Kategorie pomocy — meta każdej kategorii.
 * Slug kategorii = nazwa pliku JSON (bez rozszerzenia).
 * Dodaj nowy plik w src/content/categories/ → kategoria pojawia się automatycznie.
 */
const categories = defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/categories" }),
    schema: z.object({
        name: z.string(),
        description: z.string(),
        order: z.number().default(100),
    }),
});

/**
 * Artykuły pomocy.
 * Slug kategorii = nazwa folderu w src/content/articles/.
 * Slug artykułu = nazwa pliku .md (bez rozszerzenia).
 *
 * "Podobne tematy" w sidebarze są wyliczane AUTOMATYCZNIE — wszystkie inne artykuły
 * o tej samej (kategoria + subcategory), posortowane wg `order` i alfabetycznie.
 * Nie ma potrzeby ręcznie wpisywać `relatedArticles` w frontmatterze.
 */
const articles = defineCollection({
    // Pattern "*/*.md" wymaga dokładnie jednego poziomu zagnieżdżenia:
    // src/content/articles/[kategoria]/[artykul].md
    // Pliki bezpośrednio w articles/ są ignorowane (uniknięcie konfliktów slugów).
    loader: glob({ pattern: "*/*.md", base: "./src/content/articles" }),
    schema: z.object({
        title: z.string(),
        subcategory: z.string().default("Ogólne"),
        order: z.number().default(100),
    }),
});

export const collections = { categories, articles };
