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
            name: "placements",
            title: "Pojawienia w kategoriach",
            description:
                "Artykuł może pojawiać się w wielu kategoriach jednocześnie. Każde pojawienie ma własną podkategorię. Dla każdej kategorii generowany jest osobny URL prowadzący do tej samej treści, z odpowiednimi breadcrumbami i powiązanymi tematami.",
            type: "array",
            of: [
                defineArrayMember({
                    type: "object",
                    name: "placement",
                    title: "Pojawienie",
                    fields: [
                        defineField({
                            name: "category",
                            title: "Kategoria",
                            type: "reference",
                            to: [{ type: "category" }],
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "subcategory",
                            title: "Podkategoria",
                            type: "reference",
                            to: [{ type: "subcategory" }],
                            description:
                                'Lista filtrowana — pokazuje tylko podkategorie z wybranej powyżej kategorii.',
                            options: {
                                filter: ({ parent }) => {
                                    const categoryRef = (
                                        parent as
                                            | {
                                                  category?: { _ref?: string };
                                              }
                                            | undefined
                                    )?.category?._ref;
                                    if (!categoryRef) {
                                        return { filter: "false" };
                                    }
                                    return {
                                        filter:
                                            "category._ref == $categoryRef",
                                        params: { categoryRef },
                                    };
                                },
                            },
                            validation: (Rule) => Rule.required(),
                        }),
                    ],
                    preview: {
                        select: {
                            categoryName: "category.name",
                            subcategoryName: "subcategory.name",
                        },
                        prepare({ categoryName, subcategoryName }) {
                            return {
                                title:
                                    categoryName ?? "(brak kategorii)",
                                subtitle:
                                    subcategoryName ??
                                    "(brak podkategorii)",
                            };
                        },
                    },
                }),
            ],
            validation: (Rule) =>
                Rule.required()
                    .min(1)
                    .error(
                        "Artykuł musi mieć co najmniej jedno pojawienie (kategoria + podkategoria).",
                    ),
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
                defineArrayMember({
                    type: "table",
                }),
                defineArrayMember({
                    type: "object",
                    name: "htmlBlock",
                    title: "Tabela / blok HTML",
                    description:
                        "Wklej tabelę lub dowolny inny fragment HTML. Najwygodniej skopiować gotową tabelę z Google Docs / Word / Excela — przeglądarka przeklei ją jako HTML automatycznie.",
                    fields: [
                        defineField({
                            name: "html",
                            type: "text",
                            title: "Kod HTML",
                            rows: 10,
                            description:
                                "Zostanie wstawiony bez zmian na stronie. Wszystkie tagi <table>, <a>, <strong>, <ul> itp. działają.",
                            validation: (Rule) => Rule.required(),
                        }),
                    ],
                    preview: {
                        select: { html: "html" },
                        prepare({ html }) {
                            const stripped =
                                typeof html === "string"
                                    ? html.replace(/<[^>]+>/g, " ").slice(0, 80)
                                    : "";
                            return {
                                title: "Tabela / HTML",
                                subtitle: stripped || "(pusty)",
                            };
                        },
                    },
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
    ],
    preview: {
        select: {
            title: "title",
            firstCategoryName: "placements.0.category.name",
            firstSubcategoryName: "placements.0.subcategory.name",
            placementsCount: "placements",
        },
        prepare({
            title,
            firstCategoryName,
            firstSubcategoryName,
            placementsCount,
        }) {
            const count = Array.isArray(placementsCount)
                ? placementsCount.length
                : 0;
            const parts = [firstCategoryName, firstSubcategoryName].filter(
                Boolean,
            );
            const extra = count > 1 ? ` (+${count - 1})` : "";
            return {
                title,
                subtitle: parts.length ? parts.join(" → ") + extra : "",
            };
        },
    },
});
