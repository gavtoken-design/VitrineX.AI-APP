import { GoogleGenAI } from '@google/genai';
const client = new GoogleGenAI({ apiKey: 'fake' });
console.log('client.models exists:', !!client.models);
