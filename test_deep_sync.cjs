
const axios = require('axios');
const fs = require('fs');

const url = 'https://api.n8nmarketation.online';
const apiKey = '429683C4C977415CAAFCCE10F7D57E11';
const instance = 'user_123456';

async function test() {
    console.log(`🚀 Starting debug for instance: ${instance}`);

    const headers = { 'apikey': apiKey };

    try {
        console.log('--- Checking Instances ---');
        const instRes = await axios.get(`${url}/instance/fetchInstances`, { headers });
        console.log('Instances found:', instRes.data.map(i => i.instanceName || i.name));
        fs.writeFileSync('instances_debug.json', JSON.stringify(instRes.data, null, 2));
    } catch (e) {
        console.error('❌ Error fetching instances:', e.message);
    }

    try {
        console.log('\n--- Fetching Chats (findChats) ---');
        const chatRes = await axios.post(`${url}/chat/findChats/${instance}`, {}, { headers });
        const records = chatRes.data?.records || chatRes.data;
        fs.writeFileSync('raw_chats_debug.json', JSON.stringify(records, null, 2));
        console.log(`✅ Saved ${Array.isArray(records) ? records.length : 'object'} results to raw_chats_debug.json`);
    } catch (e) {
        console.error('❌ Error fetching chats:', e.message);
    }

    try {
        console.log('\n--- Testing Contacts Endpoints ---');
        const endpoints = [
            `contact/fetchContacts/${instance}`,
            `contact/findAll/${instance}`
        ];

        for (const ep of endpoints) {
            console.log(`Trying ${ep}...`);
            try {
                const res = await axios.get(`${url}/${ep}`, { headers });
                console.log(`✅ SUCCESS with GET ${ep}: ${Array.isArray(res.data) ? res.data.length : 'object'} results.`);
                fs.writeFileSync('raw_contacts_debug.json', JSON.stringify(res.data, null, 2));
            } catch (err) {
                try {
                    const res = await axios.post(`${url}/${ep}`, {}, { headers });
                    console.log(`✅ SUCCESS with POST ${ep}: ${Array.isArray(res.data) ? res.data.length : 'object'} results.`);
                    fs.writeFileSync('raw_contacts_debug.json', JSON.stringify(res.data, null, 2));
                } catch (err2) {
                    console.log(`❌ FAILED both GET/POST ${ep}`);
                }
            }
        }
    } catch (e) {
        console.error('❌ General Error:', e.message);
    }
}

test();
