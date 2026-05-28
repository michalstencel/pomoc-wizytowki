import { sanityClient } from "sanity:client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { PortableTextBlock } from "@portabletext/types";

export const client = sanityClient;

const builder = imageUrlBuilder(client);

export function urlForImage(source: SanityImageSource) {
    return builder.image(source);
}

export interface SanitySlug {
    current: string;
    _type?: "slug";
}

export interface SanityImage {
    _type?: "image";
    asset?: {
        _ref: string;
        _type?: "reference";
    };
    alt?: string;
    caption?: string;
    hotspot?: { x: number; y: number; height: number; width: number };
}

export interface Category {
    _id: string;
    name: string;
    slug: SanitySlug;
    description: string;
    order: number;
}

export interface Placement {
    category: {
        _id: string;
        name: string;
        slug: SanitySlug;
    };
    subcategory: string;
    subcategoryRef: string;
}

export interface ArticleListItem {
    _id: string;
    title: string;
    slug: SanitySlug;
    placements: Placement[];
}

export interface QuickLink {
    _id: string;
    title: string;
    slug: string;
    categorySlug: string;
}

export interface RelatedProduct {
    _id: string;
    name: string;
    url: string;
    description?: string;
}

export interface Article extends ArticleListItem {
    body?: PortableTextBlock[];
    quickLinksTitle?: string;
    quickLinks?: QuickLink[];
    relatedProductsTitle?: string;
    relatedProducts?: RelatedProduct[];
}

export const QUERY_ALL_CATEGORIES = /* groq */ `
    *[_type == "category" && defined(slug.current)] | order(order asc, name asc) {
        _id,
        name,
        slug,
        description,
        order
    }
`;

export const QUERY_CATEGORY_BY_SLUG = /* groq */ `
    *[_type == "category" && slug.current == $slug][0] {
        _id,
        name,
        slug,
        description,
        order
    }
`;

export const QUERY_ARTICLES_BY_CATEGORY = /* groq */ `
    *[
        _type == "article"
        && defined(slug.current)
        && $slug in placements[].category->slug.current
    ] | order(title asc) {
        _id,
        title,
        slug,
        "placements": placements[]{
            "category": category->{ _id, name, slug },
            "subcategory": subcategory->name,
            "subcategoryRef": subcategory._ref
        }
    }
`;

export const QUERY_ARTICLE_BY_SLUG = /* groq */ `
    *[
        _type == "article"
        && slug.current == $slug
        && $category in placements[].category->slug.current
    ][0] {
        _id,
        title,
        slug,
        "placements": placements[]{
            "category": category->{ _id, name, slug },
            "subcategory": subcategory->name,
            "subcategoryRef": subcategory._ref
        },
        body[]{
            ...,
            _type == "htmlBlock" => {
                _type,
                _key,
                html
            },
            markDefs[]{
                ...,
                _type == "fileLink" => {
                    ...,
                    "fileUrl": file.asset->url,
                    "fileName": file.asset->originalFilename,
                    "fileSize": file.asset->size
                }
            }
        },
        quickLinksTitle,
        "quickLinks": quickLinks[]->{
            _id,
            title,
            "slug": slug.current,
            "categorySlug": placements[0].category->slug.current
        },
        relatedProductsTitle,
        "relatedProducts": relatedProducts[]->{
            _id,
            name,
            url,
            description
        }
    }
`;

export const QUERY_ALL_ARTICLE_PATHS = /* groq */ `
    *[
        _type == "article"
        && defined(slug.current)
    ] {
        "slug": slug.current,
        "categorySlugs": placements[].category->slug.current
    }
`;

export const QUERY_RELATED_ARTICLES = /* groq */ `
    *[
        _type == "article"
        && defined(slug.current)
        && slug.current != $currentSlug
        && count(placements[
            category->slug.current == $categorySlug
            && subcategory._ref == $subcategoryRef
        ]) > 0
    ] | order(title asc) {
        _id,
        title,
        slug,
        "placements": placements[]{
            "category": category->{ _id, name, slug },
            "subcategory": subcategory->name,
            "subcategoryRef": subcategory._ref
        }
    }
`;
