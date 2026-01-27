
// src/lib/mediaUtils.ts

/**
 * Converte uma URL (ou Base64) em um objeto Blob
 */
export async function urlToBlob(imageUrl: string): Promise<Blob> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return blob;
}

/**
 * Helper to convert Blob to Base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Força o download de um Blob/URL no navegador ou salva nativamente se no Electron
 */
export async function downloadImage(imageUrl: string, fileName: string) {
  try {
    // Garante extensão
    let finalFileName = fileName;
    if (!/\.[^/.]+$/.test(finalFileName)) {
      finalFileName = `${finalFileName}.png`;
    }

    // 1. Verificação Electron (Salvar Nativo)
    if (window.electronAPI) {
      // Para Electron, precisamos enviar os dados.
      // Se for URL remota ou blob, convertemos para base64 data string
      const blob = await urlToBlob(imageUrl);
      const base64Data = await blobToBase64(blob);

      const result = await window.electronAPI.saveFile(base64Data, finalFileName);
      if (!result.success) {
        throw new Error(result.error || 'Cancelado pelo usuário');
      }
      return true;
    }

    // 2. Fallback Web (Download via Browser)
    const blob = await urlToBlob(imageUrl);
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = finalFileName || 'download.png';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpeza de memória Zen
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (error) {
    console.error('Erro no download:', error);
    return false;
  }
}

/**
 * Aciona o menu de compartilhamento nativo do dispositivo (Mobile/Mac)
 */
export async function shareImage(imageUrl: string, title: string, text: string) {
  try {
    const blob = await urlToBlob(imageUrl);

    // O Web Share API exige um objeto File, não apenas Blob
    const file = new File([blob], 'image.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: title,
        text: text,
        files: [file],
      });
      return true;
    } else {
      console.warn('Compartilhamento de arquivos não suportado neste navegador.');
      return false; // Fallback pode ser feito chamando downloadImage
    }
  } catch (error) {
    console.error('Erro ao compartilhar:', error);
    return false;
  }
}
