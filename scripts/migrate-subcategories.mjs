import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

function slugify(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/ł/g, "l")
        .replace(/Ł/g, "l")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function migrate() {
    console.log("\nMigracja podkategorii (string → reference)\n");

    const articles = await client.fetch(`
        *[_type == "article" && defined(subcategory) && !(subcategory._ref match "*")] {
            _id,
            title,
            subcategory,
            "categoryRef": category._ref
        }
    `);

    if (articles.length === 0) {
        console.log("Brak artykułów do migracji (wszystkie podkategorie są już referencjami).");
        return;
    }

    console.log(`Znaleziono ${articles.length} artykułów do migracji:\n`);

    const subcategoryMap = new Map();

    for (const article of articles) {
        const subName = typeof article.subcategory === "string" ? article.subcategory : null;
        if (!subName || !article.categoryRef) {
            console.log(`  ⊘ ${article.title} — brak danych do migracji, pomijam`);
            continue;
        }

        const mapKey = `${article.categoryRef}::${subName}`;
        let subcategoryId = subcategoryMap.get(mapKey);

        if (!subcategoryId) {
            const stableId = `subcategory-${slugify(subName)}-${article.categoryRef.replace("category-", "")}`;
            await client.createOrReplace({
                _id: stableId,
                _type: "subcategory",
                name: subName,
                category: { _type: "reference", _ref: article.categoryRef },
            });
            subcategoryMap.set(mapKey, stableId);
            subcategoryId = stableId;
            console.log(`  + utworzono podkategorię "${subName}"`);
        }

        await client
            .patch(article._id)
            .set({
                subcategory: { _type: "reference", _ref: subcategoryId },
            })
            .commit();

        console.log(`  ✓ ${article.title} → "${subName}"`);
    }

    console.log("\nDone.\n");
}

migrate().catch((err) => {
    console.error(err);
    process.exit(1);
});
