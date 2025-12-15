import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (imageUrl: string, fileName: string) => 
    ipcRenderer.invoke('save-file', imageUrl, fileName)
});
