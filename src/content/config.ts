import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  schema: z.object({
    title: z.string(),
    category: z.string(),
    categorySlug: z.string(),
    subcategory: z.string(),
    relatedArticles: z
      .array(
        z.object({
          title: z.string(),
          slug: z.string(),
        }),
      )
      .optional(),
  }),
});

export const collections = { articles };
