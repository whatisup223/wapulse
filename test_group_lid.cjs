
const axios = require('axios');

const url = 'https://api.n8nmarketation.online';
const apiKey = '429683C4C977415CAAFCCE10F7D57E11';
const instance = 'رقم ويب هوك ';

async function run() {
    const groupId = "120363335281971900@g.us";

    try {
        console.log(`Trying GET group/findGroupInfos/${encodeURIComponent(instance)}?groupJid=${groupId}...`);
        const res = await axios.get(`${url}/group/findGroupInfos/${encodeURIComponent(instance)}?groupJid=${groupId}`, {
            headers: { 'apikey': apiKey }
        });

        console.log('✅ Group Info found!');
        const participants = res.data?.participants || [];
        for (const p of participants) {
            if (p.lid || p.id?.includes('@lid')) {
                console.log(`LINK FOUND IN GROUP: ${p.id} -> ${p.lid || 'no lid field'}`);
                console.log(JSON.stringify(p, null, 2));
            }
        }
    } catch (e) {
        console.log('❌ Failed:', e.message);
    }
}

run();
