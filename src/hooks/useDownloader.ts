
import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';

/**
 * Hook Universal para iniciar downloads.
 * Detecta automaticamente se está rodando no Electron ou em um navegador
 * e usa o método de download apropriado.
 */
export const useDownloader = () => {
  const { addToast } = useToast();

  const download = useCallback(async (
    content: string, 
    filename: string, 
    mimeType: string = 'application/octet-stream'
  ) => {
    
    // DETECÇÃO DE AMBIENTE:
    if (window.electronAPI && window.electronAPI.saveFile) {
      // --- MODO DESKTOP (ELECTRON) ---
      addToast({ type: 'info', message: 'Abrindo diálogo para salvar...' });
      
      const result = await window.electronAPI.saveFile(content, filename);

      if (result.success) {
        addToast({ type: 'success', message: `Arquivo salvo em: ${result.path}` });
      } else if (result.error && result.error !== 'Save canceled') {
        // Só mostra erro se não for um cancelamento do usuário
        addToast({ type: 'error', message: `Falha ao salvar: ${result.error}` });
      }

    } else {
      // --- MODO WEB (NAVEGADOR / PWA) ---
      try {
        addToast({ type: 'info', message: 'Gerando arquivo para download...' });

        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = filename || 'download';
        document.body.appendChild(a);
        a.click();
        
        // Limpeza
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        addToast({ type: 'success', message: `Download de '${filename}' iniciado!` });
      } catch (error) {
        console.error("Erro no download web:", error);
        addToast({ type: 'error', message: 'Falha ao gerar arquivo.' });
      }
    }
  }, [addToast]);

  return { download };
};
