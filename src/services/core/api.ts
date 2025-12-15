import { getAuthToken, getActiveOrganizationId } from './auth';

const BACKEND_URL = 'http://localhost:3000';

export async function proxyFetch<T>(endpoint: string, method: string, body: any): Promise<T> {
    const organizationId = getActiveOrganizationId();
    const idToken = await getAuthToken();
    const response = await fetch(`${BACKEND_URL}/organizations/${organizationId}/ai-proxy/${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        throw new Error(errorData.message || `Backend proxy request failed with status ${response.status}`);
    }
    return response.json();
}
