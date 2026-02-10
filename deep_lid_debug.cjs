
const axios = require('axios');
const fs = require('fs');

const url = 'https://api.n8nmarketation.online';
const apiKey = '429683C4C977415CAAFCCE10F7D57E11';

async function run() {
    try {
        const instRes = await axios.get(`${url}/instance/fetchInstances`, { headers: { 'apikey': apiKey } });
        const targetInstance = instRes.data.find(i => i.name.includes("الارقام")) || instRes.data[0];
        const instance = targetInstance.name;
        console.log(`Using instance: ${instance}`);

        const response = await axios.post(`${url}/chat/findChats/${encodeURIComponent(instance)}`, {}, {
            headers: { 'apikey': apiKey, 'Content-Type': 'application/json' }
        });

        const chats = response.data?.records || response.data || [];
        const targetLid = "58089634033684@lid";
        const chat = chats.find(c => c.id === targetLid || c.remoteJid === targetLid);

        console.log('--- RAW LID CHAT DATA ---');
        console.log(JSON.stringify(chat, null, 2));

        console.log('\n--- FETCHING MESSAGES FOR LID ---');
        const msgRes = await axios.get(`${url}/chat/fetchMessages/${encodeURIComponent(instance)}?number=${targetLid}&page=1`, {
            headers: { 'apikey': apiKey }
        });
        const messages = msgRes.data?.records || msgRes.data || [];
        console.log(JSON.stringify(messages.slice(0, 5), null, 2));

    } catch (e) {
        console.log('Error:', e.response?.data || e.message);
    }
}

run();
