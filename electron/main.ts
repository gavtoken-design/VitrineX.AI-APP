import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Função para detectar se estamos em desenvolvimento
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true, // Importante para segurança
    },
    icon: path.join(__dirname, '../public/favicon.ico') // Tenta carregar ícone se existir
  });

  if (isDev) {
    // Em desenvolvimento: carrega do servidor Vite
    const devUrl = 'http://localhost:8080'; // Verifique se esta é a porta correta do seu vite
    win.loadURL(devUrl).catch((err: any) => {
      console.log('Erro ao carregar URL de dev:', err);
    });
    win.webContents.openDevTools(); // Abre ferramenta de dev
  } else {
    // Em produção: carrega o index.html da pasta dist
    // O electron-builder geralmente empacota o app de forma que 'dist/index.html' fique acessível
    // Ajuste o caminho '../dist/index.html' conforme a estrutura final da sua build
    win.loadFile(path.join(__dirname, '../dist/index.html')).catch((err: any) => {
      console.log('Erro ao carregar arquivo local:', err);
    });
  }
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

// Manipulador para salvar arquivos nativamente (Bridge seguro)
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
    // Se o conteúdo for uma string Base64 de imagem (data:image/...)
    if (typeof content === 'string' && content.startsWith('data:')) {
      const base64Data = content.split(';base64,').pop();
      if (base64Data) {
        fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
      } else {
        // Fallback estranho, mas tenta salvar string direta se falhar o split
        fs.writeFileSync(filePath, content);
      }
    } else {
      // Conteúdo texto puro (HTML, TXT, JSON)
      fs.writeFileSync(filePath, content);
    }
    return { success: true, path: filePath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
