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

export interface ArticleListItem {
    _id: string;
    title: string;
    slug: SanitySlug;
    subcategory: string;
    order: number;
    category: {
        _id: string;
        name: string;
        slug: SanitySlug;
    };
}

export interface Article extends ArticleListItem {
    coverImage?: SanityImage;
    body?: PortableTextBlock[];
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
        && category->slug.current == $slug
    ] | order(order asc, title asc) {
        _id,
        title,
        slug,
        subcategory,
        order,
        "category": category->{ _id, name, slug }
    }
`;

export const QUERY_ARTICLE_BY_SLUG = /* groq */ `
    *[
        _type == "article"
        && slug.current == $slug
        && category->slug.current == $category
    ][0] {
        _id,
        title,
        slug,
        subcategory,
        order,
        coverImage,
        body,
        "category": category->{ _id, name, slug }
    }
`;

export const QUERY_ALL_ARTICLE_PATHS = /* groq */ `
    *[
        _type == "article"
        && defined(slug.current)
        && defined(category->slug.current)
    ] {
        "slug": slug.current,
        "categorySlug": category->slug.current
    }
`;

export const QUERY_RELATED_ARTICLES = /* groq */ `
    *[
        _type == "article"
        && defined(slug.current)
        && category->slug.current == $categorySlug
        && subcategory == $subcategory
        && slug.current != $currentSlug
    ] | order(order asc, title asc) {
        _id,
        title,
        slug,
        subcategory,
        order,
        "category": category->{ _id, name, slug }
    }
`;
