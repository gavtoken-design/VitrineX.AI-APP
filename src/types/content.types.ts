// ============================================================================
// STRONG TYPED CONTENT INTERFACES
// ============================================================================

export type Platform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'pinterest' | 'tiktok';
export type ContentFormat = 'post' | 'story' | 'reel' | 'video' | 'carousel' | 'article';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface ContentMetadata {
    platform: Platform;
    format: ContentFormat;
    scheduled_for?: Date;
    published_at?: Date;
    engagement?: {
        likes?: number;
        comments?: number;
        shares?: number;
        views?: number;
    };
    ai_generated?: boolean;
    ai_model?: string;
    prompt?: string;
}

export interface StrongContent {
    // Required fields
    id: string;
    title: string;
    content: string;
    user_id: string;
    created_at: Date;

    // Strongly typed fields
    metadata: ContentMetadata;
    tags: string[];
    status: ContentStatus;

    // Optional fields
    updated_at?: Date;
    image_url?: string;
    video_url?: string;
    thumbnail_url?: string;
}

// ============================================================================
// CREATION TYPES (for new content)
// ============================================================================

export type CreateContentInput = Omit<StrongContent, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: Date;
};

// ============================================================================
// UPDATE TYPES (for partial updates)
// ============================================================================

export type UpdateContentInput = Partial<Omit<StrongContent, 'id' | 'user_id' | 'created_at'>>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const isValidPlatform = (platform: string): platform is Platform => {
    return ['instagram', 'facebook', 'twitter', 'linkedin', 'pinterest', 'tiktok'].includes(platform);
};

export const isValidFormat = (format: string): format is ContentFormat => {
    return ['post', 'story', 'reel', 'video', 'carousel', 'article'].includes(format);
};

export const isValidStatus = (status: string): status is ContentStatus => {
    return ['draft', 'scheduled', 'published', 'archived'].includes(status);
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isStrongContent = (obj: any): obj is StrongContent => {
    return (
        typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        typeof obj.title === 'string' &&
        typeof obj.content === 'string' &&
        typeof obj.user_id === 'string' &&
        obj.created_at instanceof Date &&
        typeof obj.metadata === 'object' &&
        Array.isArray(obj.tags) &&
        isValidStatus(obj.status)
    );
};
