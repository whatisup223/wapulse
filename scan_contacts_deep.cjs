
const fs = require('fs');
const contacts = JSON.parse(fs.readFileSync('contacts_dump.json', 'utf8'));

let count = 0;
for (const c of contacts) {
    if (c.lid || c.jid || c.remoteJidAlt || c.alt) {
        console.log('Found structured contact:', JSON.stringify(c, null, 2));
        count++;
        if (count > 5) break;
    }
}
console.log('Total structured contacts checked:', contacts.length);
