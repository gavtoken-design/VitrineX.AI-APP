import { executeTool } from './src/services/ai/tools.js';

async function testTools() {
    console.log('--- Testing executeTool Router ---');
    try {
        const result = await executeTool('get_user_business_profile', {}, { userId: 'mock-user-123' });
        console.log('Result for get_user_business_profile:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('Tool test failed:', e);
    }
}

testTools();
