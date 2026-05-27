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
            type: "string",
            description:
                'Sekcja wewnątrz kategorii (np. "O firmie", "Informacje prawne"). Artykuły z tą samą wartością są grupowane razem na liście i podpowiadane sobie nawzajem w sidebarze "Podobne tematy".',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "order",
            title: "Kolejność",
            type: "number",
            description:
                "Im niższa liczba, tym wyżej artykuł na liście wewnątrz podkategorii. Domyślnie 100.",
            initialValue: 100,
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
                                title: "Link",
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
    ],
    orderings: [
        {
            title: "Kolejność (rosnąco)",
            name: "orderAsc",
            by: [{ field: "order", direction: "asc" }],
        },
        {
            title: "Tytuł (A→Z)",
            name: "titleAsc",
            by: [{ field: "title", direction: "asc" }],
        },
        {
            title: "Podkategoria → kolejność",
            name: "subcategoryThenOrder",
            by: [
                { field: "subcategory", direction: "asc" },
                { field: "order", direction: "asc" },
            ],
        },
    ],
    preview: {
        select: {
            title: "title",
            subcategory: "subcategory",
            categoryName: "category.name",
            media: "coverImage",
        },
        prepare({ title, subcategory, categoryName, media }) {
            const subtitle = [categoryName, subcategory].filter(Boolean).join(" → ");
            return {
                title,
                subtitle,
                media,
            };
        },
    },
});
