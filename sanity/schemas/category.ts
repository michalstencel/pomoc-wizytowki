import { defineType, defineField } from "sanity";

export const category = defineType({
    name: "category",
    title: "Kategoria",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Nazwa",
            type: "string",
            description:
                'Nazwa kategorii widoczna w nagłówku strony i na kafelku (np. "O nas").',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "slug",
            title: "Slug (fragment URL)",
            type: "slug",
            description:
                'Fragment adresu strony — np. "o-nas" daje URL /o-nas/. Generuje się automatycznie z nazwy.',
            options: { source: "name", maxLength: 50 },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "description",
            title: "Opis",
            type: "text",
            rows: 2,
            description: "Krótki opis pod nazwą kategorii (widoczny na kafelku na stronie głównej).",
            validation: (Rule) => Rule.required().max(160),
        }),
        defineField({
            name: "order",
            title: "Kolejność",
            type: "number",
            description:
                "Im niższa liczba, tym wyżej kategoria pojawia się na liście. Domyślnie 100.",
            initialValue: 100,
        }),
    ],
    orderings: [
        {
            title: "Kolejność (rosnąco)",
            name: "orderAsc",
            by: [{ field: "order", direction: "asc" }],
        },
        {
            title: "Nazwa (A→Z)",
            name: "nameAsc",
            by: [{ field: "name", direction: "asc" }],
        },
    ],
    preview: {
        select: {
            title: "name",
            subtitle: "description",
        },
    },
});
