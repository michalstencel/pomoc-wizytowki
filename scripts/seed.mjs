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

const categories = [
    { _id: "category-o-nas", name: "O nas", slug: "o-nas", description: "Wszystkie mniej lub bardziej interesujące sprawy.", order: 10 },
    { _id: "category-produkty", name: "Nasze produkty", slug: "produkty", description: "Materiały, techniki wykonania i ciekawostki.", order: 20 },
    { _id: "category-zamawianie", name: "Jak zamówić", slug: "zamawianie", description: "Przewodnik krok po kroku jak złożyć zamówienie.", order: 30 },
    { _id: "category-przygotowanie", name: "Przygotowanie", slug: "przygotowanie", description: "Wskazówki dotyczące przygotowania projektów.", order: 40 },
    { _id: "category-dostawa", name: "Czas realizacji", slug: "dostawa", description: "Terminy oraz dostępne metody dostawy.", order: 50 },
    { _id: "category-reklamacje", name: "Reklamacje i zwroty", slug: "reklamacje", description: "Mamy nadzieję, że ten dział to tylko zbędna formalność.", order: 60 },
    { _id: "category-dla-firm", name: "Dla firm", slug: "dla-firm", description: "Program partnerski i wsparcie B2B.", order: 70 },
    { _id: "category-wsparcie", name: "Kontakt i wsparcie", slug: "wsparcie", description: "Godziny pracy i formularz kontaktowy.", order: 80 },
];

const kimJestesmyBody = [
    {
        _type: "block", _key: "intro", style: "normal", markDefs: [],
        children: [{ _type: "span", _key: "introSpan", text: "Jesteśmy wizytowki.co – firmą z bogatą historią sięgającą 2015 roku. Nasza droga rozpoczęła się od studia graficznego oraz Pracowni Wizytówek, które z czasem ewoluowały w markę, którą mają Państwo okazję poznać dzisiaj.", marks: [] }],
    },
    {
        _type: "block", _key: "experience", style: "normal", markDefs: [],
        children: [{ _type: "span", _key: "experienceSpan", text: "Przez lata zdobyliśmy doświadczenie w tworzeniu wysokiej jakości produktów poligraficznych, stawiając zawsze na indywidualne podejście do każdego klienta. Specjalizujemy się w projektowaniu i produkcji wizytówek, które nie tylko przekazują niezbędne informacje, ale również budują profesjonalny wizerunek każdej firmy.", marks: [] }],
    },
    {
        _type: "block", _key: "mission", style: "normal", markDefs: [],
        children: [{ _type: "span", _key: "missionSpan", text: "Łączymy tradycyjne rzemiosło z nowoczesnymi technologiami, aby dostarczać produkty odpowiadające najwyższym standardom. Naszą misją jest wspieranie rozwoju Państwa biznesu poprzez tworzenie materiałów, które wyróżniają się na tle konkurencji.", marks: [] }],
    },
    {
        _type: "block", _key: "outro", style: "normal", markDefs: [],
        children: [{ _type: "span", _key: "outroSpan", text: "Zapraszamy do współpracy!", marks: [] }],
    },
];

const subcategories = [
    { _id: "subcategory-o-firmie-o-nas", name: "O firmie", categoryRef: "category-o-nas" },
];

const articles = [
    { _id: "article-kim-jestesmy", title: "Kim jesteśmy", slug: "kim-jestesmy", categoryRef: "category-o-nas", subcategoryRef: "subcategory-o-firmie-o-nas", body: kimJestesmyBody },
];

async function seed() {
    console.log(`\nSeeding ${projectId}/${dataset}\n`);

    console.log("Kategorie:");
    for (const cat of categories) {
        await client.createOrReplace({
            _id: cat._id,
            _type: "category",
            name: cat.name,
            slug: { _type: "slug", current: cat.slug },
            description: cat.description,
            order: cat.order,
        });
        console.log(`  ${cat.name}`);
    }

    console.log("\nPodkategorie:");
    for (const sub of subcategories) {
        await client.createOrReplace({
            _id: sub._id,
            _type: "subcategory",
            name: sub.name,
            category: { _type: "reference", _ref: sub.categoryRef },
        });
        console.log(`  ${sub.name}`);
    }

    console.log("\nArtykuły:");
    for (const art of articles) {
        await client.createOrReplace({
            _id: art._id,
            _type: "article",
            title: art.title,
            slug: { _type: "slug", current: art.slug },
            placements: [
                {
                    _type: "placement",
                    _key: randomUUID(),
                    category: { _type: "reference", _ref: art.categoryRef },
                    subcategory: {
                        _type: "reference",
                        _ref: art.subcategoryRef,
                    },
                },
            ],
            body: art.body,
        });
        console.log(`  ${art.title}`);
    }

    console.log("\nDone.\n");
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
