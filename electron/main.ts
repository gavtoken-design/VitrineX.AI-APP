// FIX: Add manual type declarations for Node.js globals to resolve compilation errors
// when @types/node is not available. This is a workaround for a project setup issue.
declare const __dirname: string;
declare const process: {
  platform: string;
};

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Em desenvolvimento, carrega do localhost. Em produção, carregaria o arquivo buildado.
  // Ajuste a porta 5173 conforme necessário (padrão Vite)
  const devUrl = 'http://localhost:5173';
  
  win.loadURL(devUrl).catch(() => {
      // Fallback se o servidor de dev não estiver rodando (apenas exemplo)
      console.log('Aguardando servidor de desenvolvimento...');
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manipulador para salvar arquivos nativamente
ipcMain.handle('save-file', async (event, content: string, defaultFilename: string) => {
  const window = BrowserWindow.getFocusedWindow();
  if (!window) return { success: false, error: 'No focused window' };

  const { canceled, filePath } = await dialog.showSaveDialog(window, {
    title: 'Salvar arquivo',
    defaultPath: defaultFilename,
    buttonLabel: 'Salvar',
  });

  if (canceled || !filePath) {
    return { success: false, error: 'Save canceled' };
  }

  try {
    // Se o conteúdo for uma string Base64 de imagem (data:image/...), removemos o cabeçalho e salvamos como buffer
    if (typeof content === 'string' && content.startsWith('data:')) {
        const base64Data = content.split(';base64,').pop();
        if (base64Data) {
            fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
        } else {
            fs.writeFileSync(filePath, content);
        }
    } else {
        fs.writeFileSync(filePath, content);
    }
    return { success: true, path: filePath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
