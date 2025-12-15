import { LibraryItem } from '../../types';
import { MOCK_API_DELAY } from '../../constants';

// In a real application, this would interact with a backend service (e.g., Cloud Functions)
// which then interacts with Google Cloud Storage.
// For this frontend-only app, these are mock functions.

const mockStorage: { [key: string]: string } = {}; // Simulates stored file URLs

export const uploadFile = async (file: File, userId: string, type: LibraryItem['type']): Promise<LibraryItem> => {
    console.log(`Simulating upload of file: ${file.name} for user ${userId}, type: ${type}`);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY)); // Simulate network delay

    const fileUrl = `https://picsum.photos/400/300?random=${Date.now()}`; // Placeholder image URL
    // For audio, use a different placeholder or a base64 representation if playing in browser is intended
    if (type === 'audio') {
        // A mock URL for audio that would typically serve an actual audio file
        // For now, using a general placeholder or a dummy URL
        const audioPlaceholderUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3?random=${Date.now()}`;
        // Or if direct base64 is desired for in-browser playback (more complex setup needed)
        // const audioBase64 = "data:audio/wav;base64,...";
        return {
            id: `lib-${Date.now()}`,
            userId: userId,
            type: type,
            file_url: audioPlaceholderUrl,
            thumbnail_url: undefined, // Audio usually doesn't have a visual thumbnail
            tags: [],
            name: file.name,
            createdAt: new Date().toISOString(),
        };
    }

    const itemId = `lib-${Date.now()}`;
    mockStorage[itemId] = fileUrl;

    const newItem: LibraryItem = {
        id: itemId,
        userId: userId,
        type: type,
        file_url: fileUrl,
        thumbnail_url: type === 'image' || type === 'video' ? fileUrl : undefined,
        tags: [],
        name: file.name,
        createdAt: new Date().toISOString(),
    };

    console.log('File uploaded (mock):', newItem);
    return newItem;
};

export const getFileUrl = async (itemId: string): Promise<string | null> => {
    console.log(`Simulating fetching file URL for item: ${itemId}`);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY / 2)); // Simulate network delay

    const url = mockStorage[itemId] || null;
    console.log(`Fetched URL (mock) for ${itemId}: ${url}`);
    return url;
};

export const deleteFile = async (itemId: string): Promise<void> => {
    console.log(`Simulating deletion of file for item: ${itemId}`);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY / 2)); // Simulate network delay

    if (mockStorage[itemId]) {
        delete mockStorage[itemId];
        console.log(`File ${itemId} deleted (mock).`);
    } else {
        console.warn(`File ${itemId} not found in mock storage for deletion.`);
    }
};
