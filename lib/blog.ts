import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Locale } from '@/i18n';

export interface BlogPost {
    slug: string;
    locale: string;
    metadata: {
        title: string;
        publishDate: string;
        description: string;
        category: string;
        cover_image?: string;
        tldr?: string;
    };
    content: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content/blogs');

export function getAllBlogPosts(locale: Locale): BlogPost[] {
    const localeDir = path.join(CONTENT_DIR, locale);
    const fallbackDir = path.join(CONTENT_DIR, 'en');

    let files: string[] = [];

    // Try to get files from the requested locale directory
    if (fs.existsSync(localeDir)) {
        files = fs.readdirSync(localeDir).filter(file => file.endsWith('.mdx'));
    }

    // If no files found or directory doesn't exist, fallback to English
    if (files.length === 0 && fs.existsSync(fallbackDir)) {
        files = fs.readdirSync(fallbackDir).filter(file => file.endsWith('.mdx'));
    }

    const posts = files.map(file => {
        const slug = file.replace(/\.mdx$/, '');
        return getBlogPost(slug, locale);
    }).filter(Boolean) as BlogPost[];

    // Sort by publish date (newest first)
    return posts.sort((a, b) =>
        new Date(b.metadata.publishDate).getTime() - new Date(a.metadata.publishDate).getTime()
    );
}

export function getBlogPost(slug: string, locale: Locale): BlogPost | null {
    const localePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`);
    const fallbackPath = path.join(CONTENT_DIR, 'en', `${slug}.mdx`);

    let filePath = localePath;
    let actualLocale = locale;

    // Check if the file exists in the requested locale
    if (!fs.existsSync(localePath)) {
        // Fallback to English if the file doesn't exist in the requested locale
        if (fs.existsSync(fallbackPath)) {
            filePath = fallbackPath;
            actualLocale = 'en';
        } else {
            return null;
        }
    }

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);

        // Extract metadata from the MDX export
        const metadataMatch = content.match(/export const metadata = ({[\s\S]*?});/);
        let metadata = data;

        if (metadataMatch) {
            try {
                // Parse the metadata object from the MDX file
                const metadataStr = metadataMatch[1];
                metadata = eval(`(${metadataStr})`);
            } catch (error) {
                console.warn(`Failed to parse metadata for ${slug}:`, error);
            }
        }

        return {
            slug,
            locale: actualLocale,
            metadata: {
                title: metadata.title || 'Untitled',
                publishDate: metadata.publishDate || new Date().toISOString().split('T')[0],
                description: metadata.description || '',
                category: metadata.category || 'General',
                cover_image: metadata.cover_image,
                tldr: metadata.tldr,
            },
            content: content.replace(/export const metadata = {[\s\S]*?};/, '').trim(),
        };
    } catch (error) {
        console.error(`Error reading blog post ${slug}:`, error);
        return null;
    }
}

export function getBlogCategories(locale: Locale): string[] {
    const posts = getAllBlogPosts(locale);
    const categories = [...new Set(posts.map(post => post.metadata.category))];
    return categories.sort();
}

export function getBlogPostsByCategory(category: string, locale: Locale): BlogPost[] {
    const posts = getAllBlogPosts(locale);
    return posts.filter(post => post.metadata.category === category);
}

export function getRelatedPosts(currentSlug: string, locale: Locale, limit: number = 3): BlogPost[] {
    const currentPost = getBlogPost(currentSlug, locale);
    if (!currentPost) return [];

    const allPosts = getAllBlogPosts(locale);
    const relatedPosts = allPosts
        .filter(post => post.slug !== currentSlug)
        .filter(post => post.metadata.category === currentPost.metadata.category)
        .slice(0, limit);

    // If we don't have enough related posts from the same category, fill with other posts
    if (relatedPosts.length < limit) {
        const otherPosts = allPosts
            .filter(post => post.slug !== currentSlug)
            .filter(post => post.metadata.category !== currentPost.metadata.category)
            .slice(0, limit - relatedPosts.length);

        relatedPosts.push(...otherPosts);
    }

    return relatedPosts;
} 