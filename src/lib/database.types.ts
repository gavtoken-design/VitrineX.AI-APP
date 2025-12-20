export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            ads: {
                Row: {
                    copy: string | null
                    createdAt: string | null
                    headline: string | null
                    id: string
                    media_url: string | null
                    platform: string | null
                    userId: string
                }
                Insert: {
                    copy?: string | null
                    createdAt?: string | null
                    headline?: string | null
                    id: string
                    media_url?: string | null
                    platform?: string | null
                    userId: string
                }
                Update: {
                    copy?: string | null
                    createdAt?: string | null
                    headline?: string | null
                    id?: string
                    media_url?: string | null
                    platform?: string | null
                    userId?: string
                }
                Relationships: []
            }
            campaigns: {
                Row: {
                    ads: Json | null
                    createdAt: string | null
                    id: string
                    name: string | null
                    posts: Json | null
                    timeline: string | null
                    type: string | null
                    userId: string
                    video_url: string | null
                }
                Insert: {
                    ads?: Json | null
                    createdAt?: string | null
                    id: string
                    name?: string | null
                    posts?: Json | null
                    timeline?: string | null
                    type?: string | null
                    userId: string
                    video_url?: string | null
                }
                Update: {
                    ads?: Json | null
                    createdAt?: string | null
                    id?: string
                    name?: string | null
                    posts?: Json | null
                    timeline?: string | null
                    type?: string | null
                    userId?: string
                    video_url?: string | null
                }
                Relationships: []
            }
            library_items: {
                Row: {
                    createdAt: string | null
                    file_url: string
                    id: string
                    name: string | null
                    tags: string[] | null
                    thumbnail_url: string | null
                    type: string
                    userId: string
                }
                Insert: {
                    createdAt?: string | null
                    file_url: string
                    id: string
                    name?: string | null
                    tags?: string[] | null
                    thumbnail_url?: string | null
                    type: string
                    userId: string
                }
                Update: {
                    createdAt?: string | null
                    file_url?: string
                    id?: string
                    name?: string | null
                    tags?: string[] | null
                    thumbnail_url?: string | null
                    type?: string
                    userId?: string
                }
                Relationships: []
            }
            posts: {
                Row: {
                    content_text: string | null
                    createdAt: string | null
                    id: string
                    image_url: string | null
                    tags: string[] | null
                    userId: string
                }
                Insert: {
                    content_text?: string | null
                    createdAt?: string | null
                    id: string
                    image_url?: string | null
                    tags?: string[] | null
                    userId: string
                }
                Update: {
                    content_text?: string | null
                    createdAt?: string | null
                    id?: string
                    image_url?: string | null
                    tags?: string[] | null
                    userId?: string
                }
                Relationships: []
            }
            schedule: {
                Row: {
                    createdAt: string | null
                    datetime: string | null
                    id: string
                    platform: string | null
                    status: string | null
                    title: string | null
                    userId: string
                }
                Insert: {
                    createdAt?: string | null
                    datetime?: string | null
                    id: string
                    platform?: string | null
                    status?: string | null
                    title?: string | null
                    userId: string
                }
                Update: {
                    createdAt?: string | null
                    datetime?: string | null
                    id?: string
                    platform?: string | null
                    status?: string | null
                    title?: string | null
                    userId?: string
                }
                Relationships: []
            }
            trends: {
                Row: {
                    createdAt: string | null
                    id: string
                    popularity: number | null
                    region: string | null
                    sentiment: string | null
                    topic: string | null
                    userId: string
                }
                Insert: {
                    createdAt?: string | null
                    id: string
                    popularity?: number | null
                    region?: string | null
                    sentiment?: string | null
                    topic?: string | null
                    userId: string
                }
                Update: {
                    createdAt?: string | null
                    id?: string
                    popularity?: number | null
                    region?: string | null
                    sentiment?: string | null
                    topic?: string | null
                    userId?: string
                }
                Relationships: []
            }
            users: {
                Row: {
                    businessProfile: Json | null
                    contactInfo: Json | null
                    created_at: string
                    email: string | null
                    id: string
                    name: string | null
                    phone: string | null
                    plan: string | null
                    status: string | null
                    updated_at: string
                }
                Insert: {
                    businessProfile?: Json | null
                    contactInfo?: Json | null
                    created_at?: string
                    email?: string | null
                    id: string
                    name?: string | null
                    phone?: string | null
                    plan?: string | null
                    status?: string | null
                    updated_at?: string
                }
                Update: {
                    businessProfile?: Json | null
                    contactInfo?: Json | null
                    created_at?: string
                    email?: string | null
                    id?: string
                    name?: string | null
                    phone?: string | null
                    plan?: string | null
                    status?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "users_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
