// src/services/canva.ts
import axios from "axios";

const CANVA_BASE_URL = "https://api.canva.com/v1";

const api = axios.create({
    baseURL: CANVA_BASE_URL,
    headers: {
        Authorization: `Bearer ${import.meta.env.VITE_CANVA_TOKEN}`,
        "Content-Type": "application/json",
    },
});

export async function getTemplates() {
    const resp = await api.get("/templates");
    return resp.data;
}

export async function createDesign(templateId: string, payload: Record<string, unknown>) {
    const resp = await api.post(`/templates/${templateId}/designs`, payload);
    return resp.data;
}

export async function exportDesign(designId: string, format: "png" | "jpg" | "pdf") {
    const resp = await api.post(`/designs/${designId}/exports`, { format });
    return resp.data; // URL for download
}

// Global error interceptor (optional)
api.interceptors.response.use(
    (r) => r,
    (err) => {
        console.error("Canva API error", err.response?.data || err.message);
        return Promise.reject(err);
    }
);
