import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

export default defineConfig({
    name: "default",
    title: "Pomoc — wizytowki.co",
    projectId: "5xmnoyz1",
    dataset: "production",
    plugins: [
        structureTool({ structure }),
        visionTool({ defaultApiVersion: "2024-01-01" }),
    ],
    schema: {
        types: schemaTypes,
        templates: (prev) => [
            ...prev,
            {
                id: "article-by-category",
                title: "Artykuł w kategorii",
                schemaType: "article",
                parameters: [
                    {
                        name: "categoryId",
                        type: "string",
                    },
                ],
                value: ({ categoryId }: { categoryId: string }) => ({
                    category: {
                        _type: "reference",
                        _ref: categoryId,
                    },
                }),
            },
        ],
    },
});
