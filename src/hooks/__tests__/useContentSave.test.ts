import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useContentSave } from '../useContentSave';

// Mock do Supabase
vi.mock('../../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({
                        data: { id: '123', title: 'Test', content: 'Test content' },
                        error: null
                    }))
                }))
            })),
            update: vi.fn(() => ({
                eq: vi.fn(() => ({
                    select: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({
                            data: { id: '123', title: 'Updated' },
                            error: null
                        }))
                    }))
                }))
            })),
            delete: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ error: null }))
            }))
        }))
    }
}));

// Mock do Toast Context
vi.mock('../../contexts/ToastContext', () => ({
    useToast: () => ({
        addToast: vi.fn()
    })
}));

describe('useContentSave', () => {
    it('should save content successfully', async () => {
        const { result } = renderHook(() => useContentSave());

        const content = {
            title: 'Test Title',
            content: 'Test Content',
            user_id: 'user123'
        };

        const savedContent = await result.current.saveContent(content);

        expect(savedContent).toBeDefined();
        expect(savedContent.id).toBe('123');
    });

    it('should update content successfully', async () => {
        const { result } = renderHook(() => useContentSave());

        const updates = {
            title: 'Updated Title'
        };

        const updatedContent = await result.current.updateContent('123', updates);

        expect(updatedContent).toBeDefined();
        expect(updatedContent.title).toBe('Updated');
    });

    it('should delete content successfully', async () => {
        const { result } = renderHook(() => useContentSave());

        await expect(result.current.deleteContent('123')).resolves.not.toThrow();
    });
});
