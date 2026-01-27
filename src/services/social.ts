// src/services/social.ts
import axios from "axios";

const FB_GRAPH_BASE = "https://graph.facebook.com/v20.0";
const IG_GRAPH_BASE = "https://graph.instagram.com";

export async function getFacebookPageInfo(pageId: string, accessToken: string) {
    const resp = await axios.get(`${FB_GRAPH_BASE}/${pageId}`, {
        params: { access_token: accessToken, fields: "id,name,about,fan_count" },
    });
    return resp.data;
}

export async function getFacebookPagePosts(pageId: string, accessToken: string, limit = 5) {
    const resp = await axios.get(`${FB_GRAPH_BASE}/${pageId}/posts`, {
        params: { access_token: accessToken, limit, fields: "message,created_time,permalink_url" },
    });
    return resp.data.data;
}

export async function getInstagramMedia(userId: string, accessToken: string, limit = 10) {
    const resp = await axios.get(`${IG_GRAPH_BASE}/${userId}/media`, {
        params: { access_token: accessToken, fields: "id,caption,media_url,permalink,media_type,timestamp", limit },
    });
    return resp.data.data;
}

export async function exchangeInstagramToken(shortLivedToken: string, clientId: string, clientSecret: string) {
    const resp = await axios.get(`${IG_GRAPH_BASE}/access_token`, {
        params: {
            grant_type: "ig_exchange_token",
            client_secret: clientSecret,
            access_token: shortLivedToken,
        },
    });
    return resp.data;
}

// ---------- Publishing Functions ----------
/** Publish a text post to a Facebook Page */
export async function publishFacebookPost(pageId: string, accessToken: string, message: string) {
    const resp = await axios.post(`${FB_GRAPH_BASE}/${pageId}/feed`, null, {
        params: { message, access_token: accessToken },
    });
    return resp.data;
}

/** Create a media container on Instagram (image/video) */
export async function createInstagramMedia(userId: string, accessToken: string, imageUrl: string, caption: string) {
    const resp = await axios.post(`${IG_GRAPH_BASE}/${userId}/media`, null, {
        params: { image_url: imageUrl, caption, access_token: accessToken },
    });
    return resp.data.id;
}

/** Publish the previously created Instagram media container */
export async function publishInstagramMedia(userId: string, accessToken: string, creationId: string) {
    const resp = await axios.post(`${IG_GRAPH_BASE}/${creationId}/publish`, null, {
        params: { access_token: accessToken },
    });
    return resp.data;
}


/** Open Pinterest share dialog (Legacy/Manual) */
export function shareToPinterest(imageUrl: string, description: string) {
    const pinterestLink = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(description)}`;
    window.open(pinterestLink, '_blank', 'width=600,height=500');
}

// ---------- Pinterest API v5 Integration ----------

const PINTEREST_API_BASE = "https://api.pinterest.com/v5";

/**
 * Troca o Authorization Code pelo Access Token.
 * NOTA: Em produção, isso deve ser feito no BACKEND para não expor o Client Secret.
 */
export async function exchangePinterestCodeForToken(code: string, clientId: string, clientSecret: string, redirectUri: string) {
    // Pinterest exige cabeçalho Authorization: Basic base64(clientId:clientSecret)
    const authHeader = btoa(`${clientId}:${clientSecret}`);

    // Body params
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);

    const resp = await axios.post(`${PINTEREST_API_BASE}/oauth/token`, params, {
        headers: {
            "Authorization": `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
    return resp.data; // Retorna { access_token, refresh_token, scope, ... }
}

/**
 * Lista os Boards do usuário.
 */
export async function getPinterestBoards(accessToken: string) {
    const resp = await axios.get(`${PINTEREST_API_BASE}/boards`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        params: {
            page_size: 100
        }
    });
    // Estrutura de resposta: { items: [ { id, name, ... } ], bookmark: "..." }
    return resp.data.items;
}

/**
 * Cria um Pin em um Board específico.
 */
export async function createPinterestPin(accessToken: string, boardId: string, imageUrl: string, title: string, description: string, link: string = "") {
    const payload: any = {
        board_id: boardId,
        media_source: {
            source_type: "image_url",
            url: imageUrl
        },
        title: title.substring(0, 100), // Limite do Pinterest
        description: description.substring(0, 500) // Limite do Pinterest
    };

    if (link) {
        payload.link = link;
    }

    const resp = await axios.post(`${PINTEREST_API_BASE}/pins`, payload, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    });
    return resp.data;
}
