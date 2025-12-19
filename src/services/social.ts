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
