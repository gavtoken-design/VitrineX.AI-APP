import { useState } from 'react';
import { downloadImage, shareImage } from '../lib/mediaUtils';
import { useToast } from '../contexts/ToastContext';
import { uploadFileToDrive } from '../services/integrations/googleDrive';

export const useMediaActions = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  const handleDownload = async (url: string, filename: string) => {
    if (!url) return;
    setIsProcessing(true);
    addToast({ type: 'info', message: 'Iniciando download...' });
    const success = await downloadImage(url, filename);
    setIsProcessing(false);

    if (!success) {
      addToast({ type: 'error', message: 'Falha no download.' });
    }
  };

  const handleShare = async (url: string, title: string, text: string) => {
    if (!url) return;
    setIsProcessing(true);
    const success = await shareImage(url, title, text);

    if (!success) {
      addToast({
        type: 'info',
        title: 'Compartilhamento Indisponível',
        message: 'Iniciando download como alternativa.',
      });
      await handleDownload(url, title); // Fallback para download
    }
    setIsProcessing(false);
  };

  const handleSaveToDrive = async (url: string, filename: string) => {
    if (!url) return;
    setIsProcessing(true);
    try {
      addToast({ type: 'info', message: 'Enviando para o Google Drive...' });
      const response = await fetch(url);
      const blob = await response.blob();
      await uploadFileToDrive(blob, filename, blob.type);
      addToast({ type: 'success', title: 'Sucesso', message: 'Arquivo salvo no seu Google Drive!' });
    } catch (error: any) {
      console.error('Drive Save error:', error);
      addToast({
        type: 'error',
        title: 'Erro no Google Drive',
        message: error.message || 'Falha ao salvar arquivo.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return { handleDownload, handleShare, handleSaveToDrive, isProcessing };
};
