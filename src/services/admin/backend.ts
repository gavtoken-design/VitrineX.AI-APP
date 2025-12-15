
/**
 * ============================================================================
 * INSTRUÇÕES PARA CONFIGURAÇÃO DO BACKEND (Google Apps Script)
 * ============================================================================
 * 
 * 1. Crie uma nova Planilha Google "VitrineX-DB"
 * 2. Renomeie a 'Página1' para 'Clientes' e crie os cabeçalhos (Linha 1):
 *    [ID, Email, Name, Plan, Status, BusinessJSON, ContactJSON]
 * 3. Crie outras abas: "Auditoria" (Timestamp, Level, Module, Message, UserId), "Config" (Key, Value, Type)
 * 4. Vá em Extensões > Apps Script e cole TUDO abaixo:
 * 
 * ------------------- COPIE DAQUI PARA BAIXO -------------------
 * const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
 * 
 * function getSheet(name) {
 *   var ss = SpreadsheetApp.openById(SHEET_ID);
 *   var sheet = ss.getSheetByName(name);
 *   if (!sheet) sheet = ss.insertSheet(name);
 *   return sheet;
 * }
 * 
 * function responseJSON(data) {
 *   return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * function doGet(e) {
 *   const action = e.parameter.action;
 *   if (action === 'getUsers') return getUsers();
 *   if (action === 'getLogs') return getLogs();
 *   if (action === 'getConfig') return getConfig();
 *   return responseJSON({error: 'Invalid Action'});
 * }
 * 
 * function doPost(e) {
 *   try {
 *     const data = JSON.parse(e.postData.contents);
 *     const action = data.action || e.parameter.action;
 *     if (action === 'authenticate') return authenticate(data.pin);
 *     if (action === 'blockUser') return toggleStatus(data.userId, 'blocked');
 *     if (action === 'unblockUser') return toggleStatus(data.userId, 'active');
 *     if (action === 'disconnectUser') return logAction('WARN', 'Auth', `Force disconnect: ${data.userId}`);
 *     if (action === 'updateConfig') return updateConfig(data.modules);
 *     return responseJSON({error: 'Invalid POST Action'});
 *   } catch (err) { return responseJSON({error: err.toString()}); }
 * }
 * 
 * function getUsers() {
 *   const sheet = getSheet('Clientes');
 *   const rows = sheet.getDataRange().getValues();
 *   if (rows.length <= 1) return responseJSON([]);
 *   // Clientes Colunas: 0=ID, 1=Email, 2=Name, 3=Plan, 4=Status
 *   const users = rows.slice(1).map(r => ({ id: r[0], email: r[1], name: r[2], plan: r[3], status: r[4] }));
 *   return responseJSON(users);
 * }
 * 
 * function getLogs() {
 *   const sheet = getSheet('Auditoria');
 *   const rows = sheet.getDataRange().getValues();
 *   if (rows.length <= 1) return responseJSON([]);
 *   // Retorna os últimos 50 logs (assumindo novos no fim)
 *   const logs = rows.slice(Math.max(rows.length - 51, 1)).reverse().map((r, i) => ({
 *     id: i.toString(), timestamp: r[0], level: r[1], module: r[2], message: r[3], userId: r[4]
 *   }));
 *   return responseJSON(logs);
 * }
 * 
 * function getConfig() {
 *   const sheet = getSheet('Config'); // Colunas: [Key, Value, Type]
 *   const rows = sheet.getDataRange().getValues();
 *   const config = { modules: {}, system: {} };
 *   rows.slice(1).forEach(r => {
 *     if (r[2] === 'module') config.modules[r[0]] = (String(r[1]) === 'true');
 *     if (r[2] === 'system') config.system[r[0]] = r[1];
 *   });
 *   return responseJSON(config);
 * }
 * 
 * function updateConfig(modules) {
 *   const sheet = getSheet('Config');
 *   const rows = sheet.getDataRange().getValues();
 *   // Atualização simplificada para módulos
 *   for (let i = 1; i < rows.length; i++) {
 *     if (rows[i][2] === 'module' && modules[rows[i][0]] !== undefined) {
 *       sheet.getRange(i + 1, 2).setValue(modules[rows[i][0]]);
 *     }
 *   }
 *   return responseJSON({success: true});
 * }
 * 
 * function authenticate(pin) {
 *   return responseJSON({ valid: pin === '1984' });
 * }
 * 
 * function toggleStatus(userId, status) {
 *   const sheet = getSheet('Clientes');
 *   const data = sheet.getDataRange().getValues();
 *   for (let i = 1; i < data.length; i++) {
 *     if (String(data[i][0]) === String(userId)) {
 *       sheet.getRange(i + 1, 5).setValue(status);
 *       logAction('INFO', 'UserMgmt', `User ${userId} status changed to ${status}`);
 *       return responseJSON({success: true});
 *     }
 *   }
 *   return responseJSON({error: 'User not found'});
 * }
 * 
 * function logAction(level, module, message) {
 *   const sheet = getSheet('Auditoria');
 *   sheet.appendRow([new Date().toISOString(), level, module, message, 'admin']);
 *   return responseJSON({logged: true});
 * }
 * ----------------------------------------------------------------------------
 * 
 * 5. Publique como "App da Web" (Executar como: Eu, Acesso: Qualquer pessoa)
 * 6. Copie a URL gerada e configure abaixo na const APPS_SCRIPT_URL.
 */

import { AdminLog, UserProfile, AdminConfig } from '../../types';

// TODO: Coloque a URL do seu Web App aqui após o deploy
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwmmTmzP1KRMdqCfAgCmwX6y5066eyTOAtwkMRwvcXW1-npFa0DPeOvJhicnEdz_QJ6/exec';

export const remoteAdminService = {
    isEnabled: () => !!APPS_SCRIPT_URL,

    authenticate: async (pin: string): Promise<boolean> => {
        try {
            const res = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'authenticate', pin }) // Apps Script requires string body even for JSON
                // Note: Apps Script POST requests often need 'no-cors' mode depending on setup, 
                // but 'no-cors' makes response opaque. 
                // Standard setup with 'text/plain' content type avoids preflight and works best.
            });
            const data = await res.json();
            return data.valid;
        } catch (e) {
            console.error('Remote Auth Failed', e);
            return false;
        }
    },

    getUsers: async (): Promise<UserProfile[]> => {
        const res = await fetch(`${APPS_SCRIPT_URL}?action=getUsers`);
        const data = await res.json();
        // Validate/Transform data if necessary
        return data;
    },

    getLogs: async (): Promise<AdminLog[]> => {
        const res = await fetch(`${APPS_SCRIPT_URL}?action=getLogs`);
        return await res.json();
    },

    getConfig: async (): Promise<AdminConfig> => {
        const res = await fetch(`${APPS_SCRIPT_URL}?action=getConfig`);
        return await res.json();
    },

    updateConfig: async (newConfig: Partial<AdminConfig>): Promise<AdminConfig> => {
        const modules = newConfig.modules || {};
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'updateConfig', modules: modules })
        });
        return { modules: {}, system: {} } as AdminConfig; // Should refetch or return merged
    },

    blockUser: async (userId: string): Promise<void> => {
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'blockUser', userId })
        });
    },

    disconnectUser: async (userId: string): Promise<void> => {
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'disconnectUser', userId })
        });
    },

    createBackup: async (): Promise<string> => {
        return 'remote_backup_pending';
    }
};
