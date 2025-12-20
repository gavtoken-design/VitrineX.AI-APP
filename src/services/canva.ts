// src/services/canva.ts
// Canva Connect API Integration for Content Publishing
import axios, { AxiosInstance, AxiosError } from "axios";

// Canva Connect API - Versão 2024
const CANVA_CONNECT_API_URL = "https://api.canva.com/rest/v1";
const API_VERSION = "2024-01-31"; // Date-based versioning

// Types
export interface CanvaUser {
    id: string;
    display_name: string;
    profile_picture_url?: string;
}

export interface CanvaAsset {
    id: string;
    name: string;
    type: "image" | "video" | "audio";
    thumbnail_url?: string;
    created_at: string;
    updated_at: string;
}

export interface CanvaDesign {
    id: string;
    title: string;
    owner: CanvaUser;
    thumbnail?: {
        url: string;
        width: number;
        height: number;
    };
    urls: {
        edit_url: string;
        view_url: string;
    };
    created_at: string;
    updated_at: string;
}

export interface CanvaTemplate {
    id: string;
    name: string;
    description?: string;
    thumbnail_url: string;
    category: string;
}

export interface ExportOptions {
    format: "png" | "jpg" | "pdf" | "mp4" | "gif";
    quality?: "low" | "medium" | "high";
    width?: number;
    height?: number;
    pages?: number[]; // For multi-page designs
}

export interface ExportJob {
    id: string;
    status: "in_progress" | "completed" | "failed";
    urls?: string[];
    error?: string;
}

export interface UploadOptions {
    name: string;
    file: File | Blob;
    folder_id?: string;
    tags?: string[];
}

export interface PublishResult {
    success: boolean;
    asset_id?: string;
    design_id?: string;
    export_urls?: string[];
    error?: string;
}

// Canva Connect API Service Class
class CanvaConnectService {
    private api: AxiosInstance;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        this.api = axios.create({
            baseURL: CANVA_CONNECT_API_URL,
            headers: {
                "Content-Type": "application/json",
                "Api-Version": API_VERSION,
            },
        });

        // Request interceptor to add auth token
        this.api.interceptors.request.use((config) => {
            if (this.accessToken) {
                config.headers.Authorization = `Bearer ${this.accessToken}`;
            }
            return config;
        });

        // Response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (error.response?.status === 401 && this.refreshToken) {
                    // Token expired, try to refresh
                    try {
                        await this.refreshAccessToken();
                        // Retry the failed request
                        if (error.config) {
                            error.config.headers.Authorization = `Bearer ${this.accessToken}`;
                            return this.api.request(error.config);
                        }
                    } catch (refreshError) {
                        console.error("Failed to refresh token:", refreshError);
                        this.logout();
                    }
                }
                console.error("Canva API Error:", error.response?.data || error.message);
                return Promise.reject(error);
            }
        );

        // Load tokens from storage
        this.loadTokens();
    }

    // ============ Authentication ============

    /**
     * Initialize OAuth flow - returns the authorization URL
     */
    getAuthorizationUrl(clientId: string, redirectUri: string, scopes: string[] = []): string {
        const defaultScopes = [
            "design:content:read",
            "design:content:write",
            "asset:read",
            "asset:write",
            "profile:read",
        ];
        const allScopes = [...new Set([...defaultScopes, ...scopes])];

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: allScopes.join(" "),
            state: this.generateState(),
        });

        return `https://www.canva.com/api/oauth/authorize?${params.toString()}`;
    }

    /**
     * Exchange authorization code for access token
     */
    async exchangeCodeForToken(
        code: string,
        clientId: string,
        clientSecret: string,
        redirectUri: string
    ): Promise<boolean> {
        try {
            const response = await axios.post("https://api.canva.com/rest/v1/oauth/token", {
                grant_type: "authorization_code",
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
            });

            this.accessToken = response.data.access_token;
            this.refreshToken = response.data.refresh_token;
            this.saveTokens();
            return true;
        } catch (error) {
            console.error("Failed to exchange code for token:", error);
            return false;
        }
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(): Promise<boolean> {
        if (!this.refreshToken) return false;

        const clientId = import.meta.env.VITE_CANVA_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_CANVA_CLIENT_SECRET;

        try {
            const response = await axios.post("https://api.canva.com/rest/v1/oauth/token", {
                grant_type: "refresh_token",
                refresh_token: this.refreshToken,
                client_id: clientId,
                client_secret: clientSecret,
            });

            this.accessToken = response.data.access_token;
            if (response.data.refresh_token) {
                this.refreshToken = response.data.refresh_token;
            }
            this.saveTokens();
            return true;
        } catch (error) {
            console.error("Failed to refresh token:", error);
            return false;
        }
    }

    /**
     * Set access token directly (for testing or manual token management)
     */
    setAccessToken(token: string): void {
        this.accessToken = token;
        this.saveTokens();
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.accessToken;
    }

    /**
     * Logout - clear tokens
     */
    logout(): void {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem("canva_tokens");
    }

    // ============ User & Profile ============

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<CanvaUser | null> {
        try {
            const response = await this.api.get("/users/me");
            return response.data.user;
        } catch (error) {
            console.error("Failed to get current user:", error);
            return null;
        }
    }

    // ============ Assets ============

    /**
     * Upload an asset to Canva
     */
    async uploadAsset(options: UploadOptions): Promise<CanvaAsset | null> {
        try {
            const formData = new FormData();
            formData.append("file", options.file);
            formData.append("name", options.name);
            if (options.folder_id) {
                formData.append("folder_id", options.folder_id);
            }
            if (options.tags) {
                formData.append("tags", JSON.stringify(options.tags));
            }

            const response = await this.api.post("/assets/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data.asset;
        } catch (error) {
            console.error("Failed to upload asset:", error);
            return null;
        }
    }

    /**
     * Upload asset from URL
     */
    async uploadAssetFromUrl(url: string, name: string): Promise<CanvaAsset | null> {
        try {
            const response = await this.api.post("/assets/upload", {
                asset_upload_url: url,
                name,
            });

            return response.data.asset;
        } catch (error) {
            console.error("Failed to upload asset from URL:", error);
            return null;
        }
    }

    /**
     * List user's assets
     */
    async listAssets(limit: number = 50, continuation?: string): Promise<{
        assets: CanvaAsset[];
        continuation?: string;
    }> {
        try {
            const params: Record<string, string | number> = { limit };
            if (continuation) {
                params.continuation = continuation;
            }

            const response = await this.api.get("/assets", { params });
            return {
                assets: response.data.assets,
                continuation: response.data.continuation,
            };
        } catch (error) {
            console.error("Failed to list assets:", error);
            return { assets: [] };
        }
    }

    /**
     * Delete an asset
     */
    async deleteAsset(assetId: string): Promise<boolean> {
        try {
            await this.api.delete(`/assets/${assetId}`);
            return true;
        } catch (error) {
            console.error("Failed to delete asset:", error);
            return false;
        }
    }

    // ============ Designs ============

    /**
     * List user's designs
     */
    async listDesigns(limit: number = 50, continuation?: string): Promise<{
        designs: CanvaDesign[];
        continuation?: string;
    }> {
        try {
            const params: Record<string, string | number> = { limit };
            if (continuation) {
                params.continuation = continuation;
            }

            const response = await this.api.get("/designs", { params });
            return {
                designs: response.data.items,
                continuation: response.data.continuation,
            };
        } catch (error) {
            console.error("Failed to list designs:", error);
            return { designs: [] };
        }
    }

    /**
     * Get a specific design
     */
    async getDesign(designId: string): Promise<CanvaDesign | null> {
        try {
            const response = await this.api.get(`/designs/${designId}`);
            return response.data.design;
        } catch (error) {
            console.error("Failed to get design:", error);
            return null;
        }
    }

    /**
     * Create a new design from a template
     */
    async createDesignFromTemplate(
        templateId: string,
        title: string,
        data?: Record<string, unknown>
    ): Promise<CanvaDesign | null> {
        try {
            const response = await this.api.post("/designs", {
                design_type: "template",
                template_id: templateId,
                title,
                autofill_data: data,
            });

            return response.data.design;
        } catch (error) {
            console.error("Failed to create design from template:", error);
            return null;
        }
    }

    // ============ Export & Publish ============

    /**
     * Export a design to a specific format
     */
    async exportDesign(designId: string, options: ExportOptions): Promise<ExportJob | null> {
        try {
            const response = await this.api.post(`/designs/${designId}/exports`, {
                format: options.format,
                quality: options.quality || "high",
                width: options.width,
                height: options.height,
                pages: options.pages,
            });

            return response.data.job;
        } catch (error) {
            console.error("Failed to start export:", error);
            return null;
        }
    }

    /**
     * Check export job status
     */
    async getExportStatus(designId: string, exportId: string): Promise<ExportJob | null> {
        try {
            const response = await this.api.get(`/designs/${designId}/exports/${exportId}`);
            return response.data.job;
        } catch (error) {
            console.error("Failed to get export status:", error);
            return null;
        }
    }

    /**
     * Wait for export to complete (with polling)
     */
    async waitForExport(
        designId: string,
        exportId: string,
        maxWaitMs: number = 60000,
        pollIntervalMs: number = 2000
    ): Promise<ExportJob | null> {
        const startTime = Date.now();

        while (Date.now() - startTime < maxWaitMs) {
            const job = await this.getExportStatus(designId, exportId);

            if (!job) return null;

            if (job.status === "completed" || job.status === "failed") {
                return job;
            }

            await this.sleep(pollIntervalMs);
        }

        console.error("Export timeout");
        return null;
    }

    /**
     * Full publish flow: Export and return download URLs
     */
    async publishDesign(designId: string, format: ExportOptions["format"] = "png"): Promise<PublishResult> {
        try {
            // Start export
            const exportJob = await this.exportDesign(designId, { format, quality: "high" });
            if (!exportJob) {
                return { success: false, error: "Failed to start export" };
            }

            // Wait for completion
            const completedJob = await this.waitForExport(designId, exportJob.id);
            if (!completedJob) {
                return { success: false, error: "Export timed out" };
            }

            if (completedJob.status === "failed") {
                return { success: false, error: completedJob.error || "Export failed" };
            }

            return {
                success: true,
                design_id: designId,
                export_urls: completedJob.urls,
            };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    // ============ Templates ============

    /**
     * Search templates
     */
    async searchTemplates(query: string, limit: number = 20): Promise<CanvaTemplate[]> {
        try {
            const response = await this.api.get("/templates", {
                params: { query, limit },
            });
            return response.data.templates || [];
        } catch (error) {
            console.error("Failed to search templates:", error);
            return [];
        }
    }

    // ============ Utility Methods ============

    private generateState(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private saveTokens(): void {
        if (this.accessToken) {
            localStorage.setItem("canva_tokens", JSON.stringify({
                access_token: this.accessToken,
                refresh_token: this.refreshToken,
            }));
        }
    }

    private loadTokens(): void {
        try {
            const stored = localStorage.getItem("canva_tokens");
            if (stored) {
                const tokens = JSON.parse(stored);
                this.accessToken = tokens.access_token;
                this.refreshToken = tokens.refresh_token;
            }
        } catch (error) {
            console.error("Failed to load tokens:", error);
        }
    }
}

// Export singleton instance
export const canvaService = new CanvaConnectService();

// Legacy exports for backward compatibility
export async function getTemplates() {
    return canvaService.searchTemplates("");
}

export async function createDesign(templateId: string, payload: Record<string, unknown>) {
    return canvaService.createDesignFromTemplate(templateId, "New Design", payload);
}

export async function exportDesign(designId: string, format: "png" | "jpg" | "pdf") {
    return canvaService.publishDesign(designId, format);
}

export default canvaService;
