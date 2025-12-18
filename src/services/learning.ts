export async function saveLearningSample(data: {
    userId: string;
    input: string;
    output?: string;
}) {
    const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/learning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.userId, input: data.input, output: data.output })
    });
    if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to save learning sample');
    }
    return resp.json();
}

export async function getLearningSamples(userId: string) {
    const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/${userId}`);
    if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to fetch learning samples');
    }
    return resp.json();
}
