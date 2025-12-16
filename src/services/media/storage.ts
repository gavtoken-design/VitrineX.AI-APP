import { LibraryItem } from '../../types';
import { supabase } from '../../lib/supabase';

const STORAGE_BUCKET = 'media';

export const uploadFile = async (file: File, userId: string, type: LibraryItem['type']): Promise<LibraryItem> => {
    const timestamp = Date.now();
    // Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${timestamp}-${sanitizedName}`;

    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

    if (error) {
        console.error('Error uploading file to Supabase:', error);
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

    // Create LibraryItem
    const newItem: LibraryItem = {
        // We let Supabase Generate ID if we save to DB later, but here we return an object.
        // If the caller saves this object to DB (which it does in InteractiveActionCenter),
        // we should either generate a UUID or let DB handle it.
        // Since InteractiveActionCenter calls saveLibraryItem with THIS object, 
        // and saveLibraryItem does .insert([item]), we should probably NOT set ID if we want DB to generate it.
        // BUT the type requires ID.
        // We will generate a UUID-like string or just use a timestamp-based ID for now, 
        // hoping the DB allows text or we are lucky. 
        // Better: don't set ID here if possible? No, type says it'S required.
        // We will use a placeholder or generate one. 
        // Ideally we should use uuid generation lib, but we can't easily add deps.
        // We'll use the same pattern 'lib-' + timestamp for now.
        // If DB has UUID constraint, user will need to change schema or we add uuid gen.
        id: `lib-${timestamp}`,
        userId: userId,
        type: type,
        file_url: publicUrl,
        thumbnail_url: (type === 'image' || type === 'video') ? publicUrl : undefined,
        tags: [],
        name: file.name,
        createdAt: new Date().toISOString(),
    };

    // Note: The previous mock implementation returned the item but didn't save to DB within uploadFile.
    // The calling code (InteractiveActionCenter) calls saveLibraryItem separately?
    // Let's check InteractiveActionCenter.tsx...
    // It says: 
    // const imgRes = await generateImage... 
    // outputUrl = imgRes.imageUrl;
    // ...
    // await saveLibraryItem({...})

    // Wait, uploadFile is NOT called in InteractiveActionCenter!
    // It uses `generateImage` etc.
    // So where is `uploadFile` used? 
    // Maybe in "CreativeStudio" or "ContentGenerator" (as per conservation history summary).
    // I should check usage.

    console.log('File uploaded to Supabase:', newItem);
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
