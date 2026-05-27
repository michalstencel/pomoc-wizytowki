import { defineType, defineField, defineArrayMember } from "sanity";

export const article = defineType({
    name: "article",
    title: "Artykuł",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Tytuł",
            type: "string",
            description: "Widoczny jako H1 na stronie artykułu.",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "slug",
            title: "Slug (fragment URL)",
            type: "slug",
            description:
                'Fragment adresu — np. "kim-jestesmy" daje /o-nas/kim-jestesmy/. Auto z tytułu.',
            options: { source: "title", maxLength: 80 },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "category",
            title: "Kategoria",
            type: "reference",
            to: [{ type: "category" }],
            description: "Do której kategorii należy artykuł.",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "subcategory",
            title: "Podkategoria",
            type: "reference",
            to: [{ type: "subcategory" }],
            description:
                'Wybierz podkategorię z listy. Lista jest filtrowana — pokazuje tylko podkategorie z wybranej powyżej kategorii. Jeśli potrzebujesz nowej podkategorii, utwórz ją w "Wszystkie podkategorie".',
            options: {
                filter: ({ document }) => {
                    const categoryRef = (
                        document?.category as { _ref?: string } | undefined
                    )?._ref;
                    if (!categoryRef) {
                        return { filter: "false" };
                    }
                    return {
                        filter: "category._ref == $categoryRef",
                        params: { categoryRef },
                    };
                },
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "coverImage",
            title: "Obrazek nagłówkowy (opcjonalny)",
            type: "image",
            options: { hotspot: true },
            description: "Wyświetlany na górze artykułu, nad treścią. Można pominąć.",
            fields: [
                defineField({
                    name: "alt",
                    type: "string",
                    title: "Tekst alternatywny (a11y/SEO)",
                    description:
                        "Co pokazuje obrazek? Czytniki ekranu i Google używają tego tekstu.",
                    validation: (Rule) =>
                        Rule.custom((value, context) => {
                            const parent = context.parent as { asset?: unknown } | undefined;
                            if (parent?.asset && !value) {
                                return "Wpisz tekst alternatywny dla obrazka.";
                            }
                            return true;
                        }),
                }),
            ],
        }),
        defineField({
            name: "body",
            title: "Treść",
            type: "array",
            of: [
                defineArrayMember({
                    type: "block",
                    styles: [
                        { title: "Akapit", value: "normal" },
                        { title: "Nagłówek H2", value: "h2" },
                        { title: "Nagłówek H3", value: "h3" },
                        { title: "Nagłówek H4", value: "h4" },
                        { title: "Cytat", value: "blockquote" },
                    ],
                    lists: [
                        { title: "Punktowana", value: "bullet" },
                        { title: "Numerowana", value: "number" },
                    ],
                    marks: {
                        decorators: [
                            { title: "Pogrubienie", value: "strong" },
                            { title: "Kursywa", value: "em" },
                            { title: "Przekreślenie", value: "strike-through" },
                            { title: "Kod inline", value: "code" },
                        ],
                        annotations: [
                            {
                                name: "link",
                                type: "object",
                                title: "Link (URL)",
                                fields: [
                                    defineField({
                                        name: "href",
                                        type: "url",
                                        title: "Adres URL",
                                        validation: (Rule) =>
                                            Rule.uri({
                                                allowRelative: true,
                                                scheme: ["http", "https", "mailto", "tel"],
                                            }),
                                    }),
                                ],
                            },
                            {
                                name: "fileLink",
                                type: "object",
                                title: "Link do pliku (PDF, DOC itp.)",
                                fields: [
                                    defineField({
                                        name: "file",
                                        type: "file",
                                        title: "Plik",
                                        validation: (Rule) => Rule.required(),
                                    }),
                                ],
                            },
                        ],
                    },
                }),
                defineArrayMember({
                    type: "image",
                    title: "Obrazek w treści",
                    options: { hotspot: true },
                    fields: [
                        defineField({
                            name: "alt",
                            type: "string",
                            title: "Tekst alternatywny (a11y/SEO)",
                        }),
                        defineField({
                            name: "caption",
                            type: "string",
                            title: "Podpis pod obrazkiem (opcjonalny)",
                        }),
                    ],
                }),
            ],
        }),
        defineField({
            name: "quickLinksTitle",
            title: "Sekcja \"Przejdź dalej\" — nagłówek (opcjonalny)",
            type: "string",
            description:
                'Tekst nad listą linków. Jeśli pusty, użyjemy domyślnego: "Przejdź do konkretnej kategorii, aby dowiedzieć się więcej:".',
        }),
        defineField({
            name: "quickLinks",
            title: "Sekcja \"Przejdź dalej\" — linki do artykułów",
            description:
                "Lista innych artykułów wyświetlana na dole treści. Jeśli pusta, sekcja nie pojawia się na stronie. Sortowanie alfabetyczne automatyczne.",
            type: "array",
            of: [
                defineArrayMember({
                    type: "reference",
                    to: [{ type: "article" }],
                }),
            ],
        }),
        defineField({
            name: "relatedProductsTitle",
            title: "Sekcja \"Powiązane produkty\" — nagłówek (opcjonalny)",
            type: "string",
            description:
                'Tekst nad listą produktów. Jeśli pusty, użyjemy domyślnego: "Powiązane produkty:".',
        }),
        defineField({
            name: "relatedProducts",
            title: "Sekcja \"Powiązane produkty\" — lista produktów",
            description:
                "Lista produktów wyświetlana pod sekcją artykułów. Jeśli pusta, sekcja nie pojawia się na stronie. Sortowanie alfabetyczne automatyczne.",
            type: "array",
            of: [
                defineArrayMember({
                    type: "reference",
                    to: [{ type: "product" }],
                }),
            ],
        }),
    ],
    orderings: [
        {
            title: "Tytuł (A→Z)",
            name: "titleAsc",
            by: [{ field: "title", direction: "asc" }],
        },
        {
            title: "Podkategoria → tytuł",
            name: "subcategoryThenTitle",
            by: [
                { field: "subcategory", direction: "asc" },
                { field: "title", direction: "asc" },
            ],
        },
    ],
    preview: {
        select: {
            title: "title",
            subcategoryName: "subcategory.name",
            categoryName: "category.name",
            media: "coverImage",
        },
        prepare({ title, subcategoryName, categoryName, media }) {
            const subtitle = [categoryName, subcategoryName]
                .filter(Boolean)
                .join(" → ");
            return {
                title,
                subtitle,
                media,
            };
        },
    },
});
