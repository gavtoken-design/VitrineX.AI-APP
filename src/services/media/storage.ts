import { LibraryItem } from '../../types';
import { supabase } from '../../lib/supabase';

const STORAGE_BUCKET = 'media';

// Helper to convert File to Base64
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const uploadFile = async (file: File, userId: string, type: LibraryItem['type']): Promise<LibraryItem> => {
    const timestamp = Date.now();
    // Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${timestamp}-${sanitizedName}`;

    let publicUrl = '';

    try {
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filePath);

        publicUrl = urlData.publicUrl;

    } catch (error) {
        console.warn('Supabase storage upload failed, falling back to Base64:', error);
        // Fallback: Convert file to Base64 Data URL
        try {
            publicUrl = await fileToDataUrl(file);
        } catch (readError) {
            console.error('Failed to read file as DataURL:', readError);
            throw error; // If we can't even read the file, fail.
        }
    }

    // Create LibraryItem
    const newItem: LibraryItem = {
        id: `lib-${timestamp}`,
        userId: userId,
        type: type,
        file_url: publicUrl,
        thumbnail_url: (type === 'image' || type === 'video') ? publicUrl : undefined,
        tags: [],
        name: file.name,
        createdAt: new Date().toISOString(),
    };

    console.log('File processed (Upload/Base64):', newItem.id);
    return newItem;
};

export const getFileUrl = async (itemId: string): Promise<string | null> => {
    // This function originally acted on ID mapping to mock storage. 
    // With Supabase, we usually store the public URL directly in the DB.
    // So getting the URL for an item ID would imply fetching the item from DB.
    // But `storage.ts` seems file-centric.
    // If the usage is "give me URL for file ID", it assumes we have a map.
    // Realistically, we should look up the LibraryItem by ID in DB and get file_url.
    // BUT since we just refactored DB, maybe this function is redundant or needs DB access?
    // Let's implement it by querying the DB library_items table.

    const { data, error } = await supabase
        .from('library_items')
        .select('file_url')
        .eq('id', itemId)
        .single();

    if (error || !data) {
        return null;
    }
    return data.file_url;
};

export const deleteFile = async (itemId: string): Promise<void> => {
    // To delete a file, we need its path. 
    // If we only have itemId (library item ID), we first get the item to find the path?
    // Or if itemId IS the path? No, itemId is 'lib-...'.
    // We need to fetch the item, extract the path from file_url, and delete.

    // 1. Get item
    const { data: item, error: fetchError } = await supabase
        .from('library_items')
        .select('file_url, userId')
        .eq('id', itemId)
        .single();

    if (fetchError || !item) {
        console.warn('Item not found for deletion:', itemId);
        return;
    }

    // 2. Extract path from URL. 
    // URL: https://project.supabase.co/storage/v1/object/public/media/userId/filename
    // We need 'userId/filename'.
    const publicUrl = item.file_url;
    const urlParts = publicUrl.split(`${STORAGE_BUCKET}/`);
    if (urlParts.length < 2) {
        console.warn('Could not parse file path from URL:', publicUrl);
        return;
    }
    const filePath = urlParts[1]; // "userId/filename..."

    // 3. Delete from Storage
    const { error: deleteStorageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

    if (deleteStorageError) {
        console.error('Error deleting file from storage:', deleteStorageError);
        // We might still want to delete the DB record?
    }

    // 4. We should probably NOT delete the DB record here if this function is strictly "deleteFile".
    // usages might handle DB deletion separately. 
    // `db.ts` has `deleteLibraryItem`. 
    // If the caller calls both, fine. 
};
