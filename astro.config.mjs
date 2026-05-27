// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import pagefind from "astro-pagefind";
import sanity from "@sanity/astro";

export default defineConfig({
    integrations: [
        sanity({
            projectId: "5xmnoyz1",
            dataset: "production",
            useCdn: true,
            apiVersion: "2024-01-01",
        }),
        pagefind(),
    ],
    vite: {
        plugins: [tailwindcss()],
    },
});
