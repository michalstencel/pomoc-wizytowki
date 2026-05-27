import { defineType, defineField } from "sanity";

export const product = defineType({
    name: "product",
    title: "Produkt",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "Nazwa",
            type: "string",
            description: "Nazwa produktu wyświetlana jako tekst linku.",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "url",
            title: "Adres URL",
            type: "url",
            description:
                "Pełny adres do produktu (np. https://wizytowki.co/wizytowki/classic).",
            validation: (Rule) =>
                Rule.required().uri({
                    scheme: ["http", "https"],
                }),
        }),
        defineField({
            name: "description",
            title: "Krótki opis (opcjonalny)",
            type: "string",
            description: "Wyświetlany pod nazwą produktu na liście (opcjonalny).",
        }),
    ],
    orderings: [
        {
            title: "Nazwa (A→Z)",
            name: "nameAsc",
            by: [{ field: "name", direction: "asc" }],
        },
    ],
    preview: {
        select: {
            title: "name",
            subtitle: "url",
        },
    },
});
