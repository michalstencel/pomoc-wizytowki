import type { StructureBuilder } from "sanity/structure";

export const structure = (S: StructureBuilder) =>
    S.list()
        .title("Treści")
        .items([
            S.listItem()
                .title("Kategorie i artykuły")
                .child(
                    S.documentTypeList("category")
                        .title("Kategorie")
                        .defaultOrdering([{ field: "order", direction: "asc" }])
                        .child((categoryId) =>
                            S.documentList()
                                .id("articles-in-category")
                                .title("Artykuły")
                                .schemaType("article")
                                .filter(
                                    '_type == "article" && category._ref == $categoryId',
                                )
                                .params({ categoryId })
                                .defaultOrdering([
                                    { field: "title", direction: "asc" },
                                ])
                                .initialValueTemplates([
                                    S.initialValueTemplateItem(
                                        "article-by-category",
                                        { categoryId },
                                    ),
                                ])
                                .canHandleIntent(
                                    (intentName, params) =>
                                        intentName === "create" &&
                                        params.template ===
                                            "article-by-category",
                                ),
                        ),
                ),
            S.divider(),
            S.listItem()
                .title("Wszystkie artykuły")
                .child(
                    S.documentTypeList("article")
                        .title("Wszystkie artykuły")
                        .defaultOrdering([
                            { field: "title", direction: "asc" },
                        ]),
                ),
            S.listItem()
                .title("Wszystkie kategorie")
                .child(
                    S.documentTypeList("category")
                        .title("Wszystkie kategorie")
                        .defaultOrdering([
                            { field: "order", direction: "asc" },
                        ]),
                ),
        ]);
