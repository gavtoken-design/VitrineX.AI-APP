import * as pkg from '@google/genai';
try {
    console.log('Type of default:', typeof pkg.default);
    if (typeof pkg.default === 'function') console.log('Default name:', pkg.default.name);
    console.log('pkg keys string:', JSON.stringify(Object.keys(pkg)));
} catch (e) { console.error(e); }
