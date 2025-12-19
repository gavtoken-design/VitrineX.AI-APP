const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const CONFIG_FILE = 'locked-files.json';

const calculateChecksum = (filePath) => {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
};

const loadConfig = () => {
    if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
    return { files: [] };
};

const saveConfig = (config) => {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
};

const command = process.argv[2];

if (command === 'lock') {
    let config = loadConfig();
    // Default files to lock if config is empty
    const defaultFiles = ['.env', 'src/constants.ts', 'vite.config.ts', 'package.json'];

    // Merge existing locked files with defaults (unique)
    const filesToLock = [...new Set([...(config.files || []).map(entry => typeof entry === 'string' ? entry : entry.path), ...defaultFiles])];

    const newFilesList = [];
    console.log('🔒 Bloqueando arquivos...');

    filesToLock.forEach(file => {
        const checksum = calculateChecksum(file);
        if (checksum) {
            newFilesList.push({ path: file, checksum });
            console.log(`  - Bloqueado: ${file}`);
        } else {
            console.warn(`  ! Aviso: Arquivo não encontrado: ${file}`);
        }
    });

    config.files = newFilesList;
    saveConfig(config);
    console.log(`✅ ${newFilesList.length} arquivos bloqueados em ${CONFIG_FILE}`);

} else if (command === 'check') {
    const config = loadConfig();
    console.log('🛡️ Verificando arquivos bloqueados...');
    let hasChanges = false;

    if (!config.files || config.files.length === 0) {
        console.log('  Nenhum arquivo bloqueado encontrado. Execute "node lock-manager.cjs lock" primeiro.');
        process.exit(0);
    }

    config.files.forEach(entry => {
        const currentChecksum = calculateChecksum(entry.path);
        if (currentChecksum !== entry.checksum) {
            console.error(`  ❌ ALTERAÇÃO DETECTADA: ${entry.path}`);
            hasChanges = true;
        } else {
            // console.log(`  OK: ${entry.path}`);
        }
    });

    if (hasChanges) {
        console.error('⚠️  CRÍTICO: Arquivos seguros foram modificados!');
        process.exit(1);
    } else {
        console.log('✅ Todos os arquivos seguros estão intactos.');
        process.exit(0);
    }

} else {
    console.log('Uso: node lock-manager.cjs [lock|check]');
}
