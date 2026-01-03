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
  icon: path.join(__dirname, '../public/icon.png')
};

const isDev = !app.isPackaged;

function createWindow(): void {
  const win = new BrowserWindow({
    ...WINDOW_CONFIG,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    const devUrl = 'http://localhost:8080';
    win.loadURL(devUrl).catch((err: unknown) => {
      console.log('Erro ao carregar URL de dev:', err);
    });
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html')).catch((err: unknown) => {
      console.log('Erro ao carregar arquivo local:', err);
    });
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
