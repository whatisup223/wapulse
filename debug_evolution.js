
const fs = require('fs');

async function test() {
    const EVOLUTION_URL = 'http://api.n8nmarketation.online';
    const EVOLUTION_API_KEY = '5099307963CC43229648937989C23C22';
    const SESSION_NAME = 'default';

    console.log('Fetching chats via native fetch...');
    try {
        const response = await fetch(`${EVOLUTION_URL}/chat/findChats/${SESSION_NAME}`, {
            method: 'POST',
            headers: {
                'apikey': EVOLUTION_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        const data = await response.json();
        fs.writeFileSync('raw_chats_debug.json', JSON.stringify(data, null, 2));
        console.log('Saved to raw_chats_debug.json');

        const chats = Array.isArray(data) ? data : (data.records || []);
        console.log('Total chats:', chats.length);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
