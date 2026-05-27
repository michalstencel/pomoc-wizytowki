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
                                .title("Artykuły")
                                .filter('_type == "article" && category._ref == $categoryId')
                                .params({ categoryId })
                                .defaultOrdering([{ field: "title", direction: "asc" }]),
                        ),
                ),
            S.divider(),
            S.listItem()
                .title("Wszystkie artykuły")
                .child(
                    S.documentTypeList("article")
                        .title("Wszystkie artykuły")
                        .defaultOrdering([{ field: "title", direction: "asc" }]),
                ),
            S.listItem()
                .title("Wszystkie kategorie")
                .child(
                    S.documentTypeList("category")
                        .title("Wszystkie kategorie")
                        .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),
        ]);
