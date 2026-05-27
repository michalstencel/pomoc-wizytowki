import { defineType, defineField } from "sanity";

export const subcategory = defineType({
    name: "subcategory",
    title: "Podkategoria",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Nazwa",
            type: "string",
            description:
                'Nazwa sekcji wewnątrz kategorii (np. "O firmie", "Informacje prawne").',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "category",
            title: "Kategoria",
            type: "reference",
            to: [{ type: "category" }],
            description:
                "Do której kategorii należy ta podkategoria. Filtruje listę podkategorii w edytorze artykułu.",
            validation: (Rule) => Rule.required(),
        }),
    ],
    orderings: [
        {
            title: "Nazwa (A→Z)",
            name: "nameAsc",
            by: [{ field: "name", direction: "asc" }],
        },
        {
            title: "Kategoria → nazwa",
            name: "categoryThenName",
            by: [
                { field: "category.name", direction: "asc" },
                { field: "name", direction: "asc" },
            ],
        },
    ],
    preview: {
        select: {
            title: "name",
            categoryName: "category.name",
        },
        prepare({ title, categoryName }) {
            return {
                title,
                subtitle: categoryName ? `→ ${categoryName}` : "(brak kategorii)",
            };
        },
    },
});
