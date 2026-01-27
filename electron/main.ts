import { app, BrowserWindow, ipcMain, dialog, IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Tipos de resposta do IPC
interface SaveFileResponse {
  success: boolean;
  path?: string;
  error?: string;
}

// Configuração da janela
const WINDOW_CONFIG = {
  width: 1280,
  height: 800,
  icon: path.join(__dirname, '../public/favicon.ico')
};

const isDev = !app.isPackaged;

function createWindow(): void {
  const win = new BrowserWindow({
    ...WINDOW_CONFIG,
    autoHideMenuBar: true,
    title: "VitrineX.AI",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (isDev) {
    // Fallback para hardcoded port se env var não existir (comum em setups manuais)
    win.loadURL('http://localhost:8080').catch(() => {
      console.log('Failed to load localhost:8080. Is Vite running?');
    });
  } else {
    // Produção: Verifica se o arquivo existe antes de carregar
    const distIndex = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(distIndex)) {
      win.loadFile(distIndex);
    } else {
      // Fallback: Tentativa para estrutura de build dist-electron isolada
      const altDistIndex = path.join(__dirname, '../../dist/index.html');
      if (fs.existsSync(altDistIndex)) {
        win.loadFile(altDistIndex);
      } else {
        console.error('CRITICAL: Could not find index.html in:', distIndex, 'or', altDistIndex);
      }
    }
  }
}

/**
 * Manipulador para salvar arquivos.
 * Suporta strings normais e Base64 (data:image/...).
 */
async function handleSaveFile(event: IpcMainInvokeEvent, content: string, defaultFilename: string): Promise<SaveFileResponse> {
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

function setupIpcHandlers(): void {
  ipcMain.handle('save-file', handleSaveFile);
}

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();

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
