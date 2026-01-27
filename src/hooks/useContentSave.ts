import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';

export interface Content {
    id?: string;
    title: string;
    content: string;
    user_id?: string;
    type?: string;
    platform?: string;
    metadata?: Record<string, any>;
    tags?: string[];
}

export const useContentSave = () => {
    const { addToast } = useToast();

    const saveContent = async (content: Content) => {
        try {
            const { data, error } = await supabase
                .from('contents')
                .insert(content)
                .select()
                .single();

            if (error) {
                addToast({
                    type: 'error',
                    message: `Erro ao salvar: ${error.message}`
                });
                throw error;
            }

            addToast({
                type: 'success',
                message: 'Conteúdo salvo com sucesso!'
            });

            return data;
        } catch (error) {
            console.error('Error saving content:', error);
            throw error;
        }
    };

    const updateContent = async (id: string, updates: Partial<Content>) => {
        try {
            const { data, error } = await supabase
                .from('contents')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                addToast({
                    type: 'error',
                    message: `Erro ao atualizar: ${error.message}`
                });
                throw error;
            }

            addToast({
                type: 'success',
                message: 'Conteúdo atualizado!'
            });

            return data;
        } catch (error) {
            console.error('Error updating content:', error);
            throw error;
        }
    };

    const deleteContent = async (id: string) => {
        try {
            const { error } = await supabase
                .from('contents')
                .delete()
                .eq('id', id);

            if (error) {
                addToast({
                    type: 'error',
                    message: `Erro ao deletar: ${error.message}`
                });
                throw error;
            }

            addToast({
                type: 'success',
                message: 'Conteúdo deletado!'
            });
        } catch (error) {
            console.error('Error deleting content:', error);
            throw error;
        }
    };

    return {
        saveContent,
        updateContent,
        deleteContent
    };
};
