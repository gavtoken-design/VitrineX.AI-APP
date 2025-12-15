import { useState } from 'react';
import { downloadImage, shareImage } from '../utils/mediaUtils';
import { useToast } from '../contexts/ToastContext';

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

  return { handleDownload, handleShare, isProcessing };
};
