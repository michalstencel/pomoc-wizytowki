import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";

const envPath = resolve(process.cwd(), ".env");
try {
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = value;
    }
} catch {
    console.error("Brak pliku .env.");
    process.exit(1);
}

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
    console.error("Brakuje PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET / SANITY_WRITE_TOKEN w .env.");
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
});

async function migrate() {
    console.log("\nMigracja category/subcategory → placements\n");

    const articles = await client.fetch(`
        *[
            _type == "article"
            && (!defined(placements) || length(placements) == 0)
        ] {
            _id,
            title,
            category,
            subcategory
        }
    `);

    if (articles.length === 0) {
        console.log("Brak artykułów do migracji.");
        return;
    }

    console.log(`Znaleziono ${articles.length} artykułów do migracji:\n`);

    for (const article of articles) {
        if (!article.category?._ref || !article.subcategory?._ref) {
            console.log(`  ⊘ ${article.title} — brak category lub subcategory, pomijam`);
            continue;
        }

        await client
            .patch(article._id)
            .set({
                placements: [
                    {
                        _type: "placement",
                        _key: randomUUID(),
                        category: {
                            _type: "reference",
                            _ref: article.category._ref,
                        },
                        subcategory: {
                            _type: "reference",
                            _ref: article.subcategory._ref,
                        },
                    },
                ],
            })
            .unset(["category", "subcategory"])
            .commit();

        console.log(`  ✓ ${article.title}`);
    }

    console.log("\nDone.\n");
}

migrate().catch((err) => {
    console.error(err);
    process.exit(1);
});
