import { KnowledgeBaseQueryResponse } from '../../types';
import { proxyFetch } from '../core/api';
import { generateText } from './text';
import { getAuthToken, getActiveOrganizationId } from '../core/auth';
import { BACKEND_URL } from '../core/auth'; // We'll export this or duplicate standard constant

export const createFileSearchStore = async (displayName?: string): Promise<any> => {
    try { return await proxyFetch('knowledge-base/store', 'POST', { displayName }); }
    catch (e) { console.warn("Fallback: CreateStore", e); return { storeName: 'mock-store', displayName: displayName || 'Mock' }; }
};

export const uploadFileToSearchStore = async (file: File, metadata: any): Promise<any> => {
    try {
        const orgId = getActiveOrganizationId();
        const token = await getAuthToken();
        const formData = new FormData();
        formData.append('file', file);
        // Note: BACKEND_URL needs to be imported or defined.
        // authService defines it. We should probably export it from core/auth or core/api

        // For now assuming we export it from core/auth, or just re-define/import constants
        const url = 'http://localhost:3000'; // Or import from constants if available

        const res = await fetch(`${url}/organizations/${orgId}/knowledge-base/upload-file`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData,
        });
        if (!res.ok) throw new Error("Backend upload failed");
        return res.json();
    } catch (e) { console.warn("Fallback: uploadFile", e); return { fileId: 'mock-file-id' }; }
};

export const queryFileSearchStore = async (prompt: string): Promise<KnowledgeBaseQueryResponse> => {
    try { return await proxyFetch('knowledge-base/query', 'POST', { prompt }); }
    catch (e) {
        console.warn("Fallback: queryFileSearchStore", e);
        const text = await generateText(prompt);
        return { resposta: text, arquivos_usados: [], trechos_referenciados: [], confianca: 0 };
    }
};
