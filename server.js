import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { JSONFilePreset } from 'lowdb/node';
import cron from 'node-cron';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database Initialization
const defaultData = {
    campaigns: [],
    contacts: [],
    settings: {},
    users: [
        {
            id: 'admin_1',
            email: 'admin@marketation.sa',
            password: 'password123',
            name: 'A. Mansour',
            role: 'Administrator'
        }
    ]
};
const db = await JSONFilePreset('db.json', defaultData);

// Ensure users and settings exist if loading an old db.json
await db.read();
db.data = db.data || defaultData;
if (!db.data.users) db.data.users = defaultData.users;
if (!db.data.settings) db.data.settings = defaultData.settings;
await db.write();

const EVOLUTION_URL = process.env.VITE_EVOLUTION_URL;
const EVOLUTION_API_KEY = process.env.VITE_EVOLUTION_API_KEY;

// Helper: Normalize JID (Remove device suffix and standardize)
const normalizeJid = (jid) => {
    if (!jid || typeof jid !== 'string') return '';
    const clean = jid.toLowerCase().trim();
    if (clean.includes('@broadcast') || clean.includes('@status')) return '';

    const [idPart, domain] = clean.split('@');
    const cleanId = idPart.split(':')[0]; // remove :1, :2 etc
    return domain ? `${cleanId}@${domain}` : cleanId;
};

// Helper: Get User ID from Headers
const getUserId = (req) => {
    return req.headers['x-user-id'] || req.header('X-User-Id');
};

// ---------------------------------------------------------
// Auth & User Logic
// ---------------------------------------------------------

app.post('/api/auth/login', async (req, res) => {
    try {
        await db.read();
        const { email, password } = req.body;
        console.log('--- LOGIN ATTEMPT ---');
        console.log('Email:', email);

        if (!db.data) {
            console.error('CRITICAL: db.data is null or undefined!');
            return res.status(500).json({ success: false, message: 'خطأ في تهيئة قاعدة البيانات' });
        }

        const users = db.data.users || [];
        console.log('Available usersCount:', users.length);

        const user = users.find(u =>
            u.email && u.password &&
            u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
            u.password === password
        );

        if (user) {
            console.log('LOGIN SUCCESS for:', email);
            const { password: _, ...userInfo } = user;
            res.json({ success: true, user: userInfo });
        } else {
            console.log('LOGIN FAILED: No match for', email);
            res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
        }
    } catch (err) {
        console.error('INTERNAL SERVER ERROR DURING LOGIN:', err);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ داخلي في الخادم',
            error: err.message
        });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        await db.read();
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'يرجى إكمال جميع الحقول' });
        }

        // Check if user exists
        const exists = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
            return res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل بالفعل' });
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name,
            email,
            password,
            role: 'User'
        };

        db.data.users.push(newUser);
        await db.write();

        const { password: _, ...userInfo } = newUser;
        res.status(201).json({ success: true, user: userInfo });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
    }
});

app.post('/api/auth/change-password', async (req, res) => {
    try {
        await db.read();
        const { userId, currentPassword, newPassword } = req.body;

        const user = db.data.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        }

        if (user.password !== currentPassword) {
            return res.status(401).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
        }

        user.password = newPassword;
        await db.write();

        res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (err) {
        console.error('Password Change Error:', err);
        res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
    }
});


app.post('/api/settings/profile', async (req, res) => {
    await db.read();
    const { name, email, userId } = req.body;

    const user = db.data.users.find(u => u.id === userId);
    if (user) {
        user.name = name;
        user.email = email;
        await db.write();
        res.json({ success: true, user });
    } else {
        res.status(404).json({ success: false });
    }
});

// ---------------------------------------------------------
// Evolution API Webhook Receiver
// ---------------------------------------------------------

app.post('/api/webhooks/evolution', async (req, res) => {
    try {
        const { event, instance, data } = req.body;

        console.log('='.repeat(60));
        console.log('📩 Evolution Webhook Received');
        console.log('Event:', event);
        console.log('Instance:', instance);
        console.log('Data:', JSON.stringify(data, null, 2));
        console.log('='.repeat(60));

        // Handle different events
        const instanceName = instance; // Evolution inconsistent naming sometimes

        // Ensure collections exist
        db.data = db.data || {};
        if (!db.data.chats) db.data.chats = [];
        if (!db.data.messages) db.data.messages = [];
        if (!db.data.contacts) db.data.contacts = [];

        // Helper: Find index
        const findChatIndex = (remoteJid) => db.data.chats.findIndex(c => c.id === remoteJid && c.instanceName === instanceName);

        switch (event) {
            case 'messages.upsert':
                console.log('✉️ Processing Incoming Message...');
                const msgData = data.data || data;
                const message = msgData.message || msgData;

                if (!message) break;

                const rawRemoteJid = message.key?.remoteJid || message.remoteJid;
                const remoteJid = normalizeJid(rawRemoteJid);

                if (!remoteJid) {
                    console.log('🚫 Skipping message for status/broadcast');
                    break;
                }

                const msgId = message.key?.id || message.id;
                const msgBody = message.message?.conversation || message.message?.extendedTextMessage?.text || message.body || '';
                const timestamp = message.messageTimestamp || message.timestamp || Math.floor(Date.now() / 1000);
                const fromMe = message.key?.fromMe || message.fromMe || false;

                // 1. Deduplicate Message
                const existingMsg = db.data.messages.find(m => m.id === msgId);
                if (!existingMsg) {
                    db.data.messages.push({
                        id: msgId,
                        instanceName,
                        chatId: remoteJid,
                        body: msgBody,
                        fromMe,
                        timestamp,
                        rawData: message,
                        status: 'received'
                    });
                    console.log(`✅ Message stored: ${msgId} for ${remoteJid}`);
                }

                // 2. Update Chat (Last Message & Unread)
                const chatIdx = db.data.chats.findIndex(c => c.id === remoteJid && c.instanceName === instanceName);
                if (chatIdx > -1) {
                    const chat = db.data.chats[chatIdx];
                    chat.lastMessage = msgBody;
                    chat.timestamp = timestamp;
                    if (!fromMe) chat.unreadCount = (chat.unreadCount || 0) + 1;

                    // Move to top
                    db.data.chats.splice(chatIdx, 1);
                    db.data.chats.unshift(chat);
                } else {
                    // New Chat Placeholder
                    db.data.chats.unshift({
                        id: remoteJid,
                        instanceName,
                        name: message.pushName || remoteJid.split('@')[0],
                        unreadCount: fromMe ? 0 : 1,
                        timestamp,
                        lastMessage: msgBody,
                        profilePicUrl: null
                    });
                }
                await db.write();
                break;

            case 'messages.update':
                console.log('📝 Message status updated');
                // Update message status (read/delivered) logic here if needed
                break;

            case 'chats.upsert':
            case 'chats.update':
                console.log('💬 Updating Chat Data...');
                const chatData = Array.isArray(data) ? data : [data];

                for (const c of chatData) {
                    const pc = transformChat(c, instanceName);
                    if (!pc) continue;

                    const cx = db.data.chats.findIndex(x => x.id === pc.id && x.instanceName === instanceName);
                    if (cx > -1) {
                        db.data.chats[cx] = { ...db.data.chats[cx], ...pc };
                    } else {
                        db.data.chats.push(pc);
                    }
                }
                await db.write();
                break;

            case 'contacts.upsert':
            case 'contacts.update':
                console.log('👤 Updating Contacts...');
                const contactData = Array.isArray(data) ? data : [data];

                for (const c of contactData) {
                    const cId = c.id || c.remoteJid;
                    const existingC = db.data.contacts.find(x => x.id === cId && x.instanceName === instanceName);

                    if (existingC) {
                        existingC.name = c.name || c.pushName || existingC.name;
                        existingC.profilePicUrl = c.profilePictureUrl || existingC.profilePicUrl;
                    } else {
                        db.data.contacts.push({
                            id: cId,
                            instanceName,
                            name: c.name || c.pushName || cId.split('@')[0],
                            profilePicUrl: c.profilePictureUrl || null
                        });
                    }
                }
                await db.write();
                break;

            case 'connection.update':
                console.log('🔌 Connection status changed:', data.state);
                // Can update instance status here
                break;

            default:
                console.log('ℹ️ Unhandled event:', event);
        }

        // Always respond with 200 to acknowledge receipt
        res.status(200).json({ success: true, received: true });

    } catch (error) {
        console.error('❌ Webhook Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


// ---------------------------------------------------------
// Background Worker Logic
// ---------------------------------------------------------

let isProcessing = false;

async function processQueue() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        await db.read();
        const campaigns = db.data.campaigns || [];
        const now = new Date();

        // 1. Promote due scheduled campaigns to in_progress
        const dueCampaigns = campaigns.filter(c =>
            c.status === 'scheduled' &&
            c.scheduledAt &&
            new Date(c.scheduledAt) <= now
        );

        if (dueCampaigns.length > 0) {
            console.log(`[Queue] Promoting ${dueCampaigns.length} campaigns to in_progress`);
            dueCampaigns.forEach(c => {
                c.status = 'in_progress';
            });
            await db.write();
        }

        // 2. Pick the first in_progress campaign to process
        // We only process ONE recipient from ONE campaign at a time to respect delays
        const activeCampaign = campaigns.find(c => c.status === 'in_progress');

        if (!activeCampaign) {
            isProcessing = false;
            return;
        }

        // Find the next recipient that is actually 'pending'
        const nextRecipient = activeCampaign.recipientsList.find(r => r.status === 'pending');

        if (nextRecipient) {
            // LOCK: Mark as processing immediately before any async calls
            nextRecipient.status = 'processing';
            await db.write(); // Small write to lock the recipient

            let sender = activeCampaign.senderInstance;

            // Rotation Logic
            if (sender === 'all') {
                try {
                    const instancesRes = await axios.get(`${EVOLUTION_URL}/instance/fetchInstances`, {
                        headers: { 'apikey': EVOLUTION_API_KEY }
                    });
                    const openInstances = (instancesRes.data || []).filter(i => i.connectionStatus === 'open' || i.state === 'open');

                    if (openInstances.length === 0) {
                        throw new Error("No online instances available for rotation");
                    }

                    if (!activeCampaign.currentSender || (activeCampaign.sentSinceRotation || 0) >= (activeCampaign.rotationCount || 5)) {
                        const randomIndex = Math.floor(Math.random() * openInstances.length);
                        activeCampaign.currentSender = openInstances[randomIndex].instanceName || openInstances[randomIndex].name;
                        activeCampaign.sentSinceRotation = 0;
                        console.log(`[Queue] Rotating sender to: ${activeCampaign.currentSender}`);
                    }
                    sender = activeCampaign.currentSender;
                } catch (e) {
                    console.error("[Queue] Rotation Error:", e.message);
                    nextRecipient.status = 'pending'; // Unlock
                    await db.write();
                    isProcessing = false;
                    return;
                }
            }

            // Sending
            try {
                const encodedSender = encodeURIComponent(sender);
                console.log(`[Queue] Sending "${activeCampaign.name}" to ${nextRecipient.number} via ${sender}...`);

                const response = await axios.post(`${EVOLUTION_URL}/message/sendText/${encodedSender}`, {
                    number: nextRecipient.number,
                    text: activeCampaign.message,
                    linkPreview: true
                }, {
                    headers: { 'apikey': EVOLUTION_API_KEY }
                });

                if (response.status === 200 || response.status === 201) {
                    nextRecipient.status = 'sent';
                    activeCampaign.sentCount++;
                    if (activeCampaign.senderInstance === 'all') {
                        activeCampaign.sentSinceRotation = (activeCampaign.sentSinceRotation || 0) + 1;
                    }
                    console.log(`[Queue] ✅ Sent successfully to ${nextRecipient.number}`);
                } else {
                    nextRecipient.status = 'failed';
                    activeCampaign.failedCount++;
                    console.error(`[Queue] ❌ Failed to send to ${nextRecipient.number}: HTTP ${response.status}`);
                }
            } catch (error) {
                console.error(`[Queue] ❌ Send failure to ${nextRecipient.number}:`, error.message);
                nextRecipient.status = 'failed';
                activeCampaign.failedCount++;
                if (activeCampaign.senderInstance === 'all') activeCampaign.currentSender = null;
            }

            // Update Progress
            activeCampaign.current = activeCampaign.recipientsList.filter(r => r.status === 'sent' || r.status === 'failed').length;

            // Check if Finished
            const stillPending = activeCampaign.recipientsList.some(r => r.status === 'pending' || r.status === 'processing');
            if (!stillPending) {
                console.log(`[Queue] 🎉 Campaign "${activeCampaign.name}" finished.`);
                activeCampaign.status = activeCampaign.failedCount === 0 ? 'sent' : 'partial';
            }

            await db.write();

            // Intelligent delay before next message
            const min = activeCampaign.minDelay || 2;
            const max = activeCampaign.maxDelay || 5;
            const waitTime = Math.floor(Math.random() * (max - min + 1) + min) * 1000;

            setTimeout(() => {
                isProcessing = false;
                processQueue();
            }, waitTime);

        } else {
            // No recipients pending but status was in_progress? Close it.
            console.log(`[Queue] Campaign "${activeCampaign.name}" has no pending recipients left. Closing.`);
            const hasSent = activeCampaign.recipientsList.some(r => r.status === 'sent');
            const hasFailed = activeCampaign.recipientsList.some(r => r.status === 'failed');

            if (!hasSent && !hasFailed) activeCampaign.status = 'failed';
            else activeCampaign.status = activeCampaign.failedCount === 0 ? 'sent' : 'partial';

            await db.write();
            isProcessing = false;
            // Immediate check for next campaign
            processQueue();
        }
    } catch (err) {
        console.error("[Queue] Fatal Error:", err);
        isProcessing = false;
    }
}

// Run queue processor every 5 seconds to check for work
cron.schedule('*/5 * * * * *', () => {
    processQueue();
});

// ---------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------

// ---------------------------------------------------------
// Inbox API Endpoints (Local Cached)
// ---------------------------------------------------------

// Helper: Transform Evolution Chat to Local Format
const transformChat = (c, instanceName) => {
    const rawId = c.id || c.remoteJid || '';
    const fullJid = normalizeJid(rawId);
    if (!fullJid) return null;

    const [idPart] = fullJid.split('@');

    // Improved Name Logic: detect if it's a numeric ID and format as phone
    const digits = idPart.replace(/\D/g, '');
    let finalName = c.name || c.pushName || c.pushname || idPart;

    // If name is just numbers, or LID prefix, try to clean it
    if (/^\d+$/.test(finalName) || finalName.startsWith('lid_')) {
        if (digits.length >= 7) finalName = `+${digits}`;
    }

    return {
        id: fullJid,
        instanceName,
        name: finalName,
        unreadCount: c.unreadCount || 0,
        timestamp: Math.max(c.conversationTimestamp || 0, c.timestamp || 0, c.lastMessage?.messageTimestamp || 0),
        profilePicUrl: c.profilePictureUrl || c.profilePicUrl || null,
        lastMessage: typeof c.lastMessage === 'string' ? c.lastMessage : (c.lastMessage?.message?.conversation || c.lastMessage?.body || '')
    };
};

/* GET /api/chats/:instanceName
   - Returns cached chats
   - If cache empty, fetches from Evolution (Sync)
   - Query param ?force=true forces a re-sync from Evolution
*/
app.get('/api/chats/:instanceName', async (req, res) => {
    const { instanceName } = req.params;
    const forceSync = req.query.force === 'true';

    await db.read();

    // Ensure collections
    db.data = db.data || {};
    if (!db.data.chats) db.data.chats = [];

    // 1. Try Cache (if not forcing)
    let cachedChats = db.data.chats.filter(c => c.instanceName === instanceName);

    // 2. If Cache Empty OR Force Sync, Sync from Evolution
    if (cachedChats.length === 0 || forceSync) {
        console.log(`Layer 2 Sync: Fetching chats for ${instanceName} (Force: ${forceSync})`);

        try {
            // Encode instance name to handle Arabic characters and spaces safely
            const encodedInstanceName = encodeURIComponent(instanceName);
            const response = await axios.post(`${EVOLUTION_URL}/chat/findChats/${encodedInstanceName}`, {}, {
                headers: { 'apikey': EVOLUTION_API_KEY, 'Content-Type': 'application/json' }
            });

            // Robust Data Extraction
            let rawChats = [];
            if (Array.isArray(response.data)) {
                rawChats = response.data;
            } else if (response.data && Array.isArray(response.data.records)) {
                rawChats = response.data.records;
            } else if (response.data && Array.isArray(response.data.data)) {
                rawChats = response.data.data;
            }

            console.log(`Evolution returned ${rawChats.length} chats.`);

            const processed = rawChats.map(c => transformChat(c, instanceName)).filter(c => c !== null);

            // Upsert into DB
            let upsertCount = 0;
            for (const pc of processed) {
                const existingIdx = db.data.chats.findIndex(c => c.id === pc.id && c.instanceName === instanceName);
                if (existingIdx > -1) {
                    db.data.chats[existingIdx] = { ...db.data.chats[existingIdx], ...pc };
                } else {
                    db.data.chats.push(pc);
                }
                upsertCount++;
            }

            if (upsertCount > 0) await db.write();

            // Refresh local variable after update
            cachedChats = db.data.chats.filter(c => c.instanceName === instanceName);

        } catch (e) {
            console.error('Sync Error:', e.message);
            if (e.response) {
                console.error('Evolution Error Data:', JSON.stringify(e.response.data));
            }
        }
    }

    // Sort by timestamp desc
    cachedChats.sort((a, b) => b.timestamp - a.timestamp);
    res.json(cachedChats);
});

/* GET /api/messages/:instanceName/:chatId
   - Returns cached messages
   - Optionally fetches history if requested or cache miss (Hybrid)
*/
app.get('/api/messages/:instanceName/:chatId', async (req, res) => {
    const { instanceName, chatId } = req.params;
    await db.read();

    if (!db.data.messages) db.data.messages = [];

    // Normalize Chat ID (remove potential URL encoding issues)
    const targetId = normalizeJid(decodeURIComponent(chatId));

    if (!targetId) return res.json([]);

    // 1. Get from Cache
    let cachedMsgs = db.data.messages.filter(m => m.instanceName === instanceName && m.chatId === targetId);

    // 2. If very few messages, try to fetch history (Auto-backfill)
    if (cachedMsgs.length < 10) {
        console.log(`Low cache for ${targetId}. Backfilling...`);
        try {
            // Encode instance name
            const encodedInstanceName = encodeURIComponent(instanceName);
            const response = await axios.post(`${EVOLUTION_URL}/chat/findMessages/${encodedInstanceName}`, {
                where: { remoteJid: targetId },
                limit: 50 // Fetch last 50
            }, {
                headers: { 'apikey': EVOLUTION_API_KEY, 'Content-Type': 'application/json' }
            });

            const rawMsgs = response.data?.messages || response.data?.records || response.data || [];
            if (Array.isArray(rawMsgs)) {
                let newCount = 0;
                for (const m of rawMsgs) {
                    const mId = m.key?.id || m.id;
                    if (!db.data.messages.find(ex => ex.id === mId)) {
                        db.data.messages.push({
                            id: mId,
                            instanceName,
                            chatId: targetId,
                            body: m.message?.conversation || m.message?.extendedTextMessage?.text || m.body || '',
                            fromMe: m.key?.fromMe || m.fromMe || false,
                            timestamp: m.messageTimestamp || m.timestamp || 0,
                            status: 'history_sync'
                        });
                        newCount++;
                    }
                }
                if (newCount > 0) await db.write();
            }
        } catch (e) {
            console.error('History Sync Error:', e.message);
        }
    }

    // Re-read cache
    cachedMsgs = db.data.messages.filter(m => m.instanceName === instanceName && m.chatId === targetId);
    cachedMsgs.sort((a, b) => a.timestamp - b.timestamp);

    res.json(cachedMsgs);
});

// ---------------------------------------------------------
// Original API Endpoints Structure continued...
// ---------------------------------------------------------

// Link Instance to User
app.post('/api/instances/link', async (req, res) => {
    await db.read();
    const { instanceName, userId } = req.body;

    if (!instanceName || !userId) {
        return res.status(400).json({ success: false, message: 'Missing instanceName or userId' });
    }

    if (!db.data.userInstances) {
        db.data.userInstances = [];
    }

    // Check if already linked
    const existing = db.data.userInstances.find(i => i.instanceName === instanceName);
    if (!existing) {
        db.data.userInstances.push({ instanceName, userId, createdAt: new Date().toISOString() });
        await db.write();
    } else if (existing.userId !== userId) {
        // Optional: Decide if an instance can be engaged by multiple users. For now, strict ownership.
        return res.status(403).json({ success: false, message: 'Instance already owned by another user' });
    }

    res.json({ success: true });
});

// Proxy: Fetch Instances (User Isolated)
app.get('/api/instances', async (req, res) => {
    const userId = getUserId(req);

    // In strict mode, admin check would be here. For now, if no userId, return empty to be safe
    if (!userId) {
        return res.json([]);
    }

    try {
        await db.read();
        const userInstances = db.data.userInstances || [];
        // Get names of instances owned by this user
        const myInstanceNames = userInstances.filter(i => i.userId === userId).map(i => i.instanceName);

        if (myInstanceNames.length === 0) {
            return res.json([]);
        }

        // Fetch ALL from Evolution (Backend knows about all, but filters for User)
        const response = await axios.get(`${EVOLUTION_URL}/instance/fetchInstances`, {
            headers: { 'apikey': EVOLUTION_API_KEY }
        });

        const allInstances = response.data || [];

        // Filter: Only show instances that belong to this user
        const myInstances = allInstances.filter(inst => myInstanceNames.includes(inst.instanceName || inst.name));

        res.json(myInstances);

    } catch (error) {
        console.error('Error fetching instances proxy:', error.message);
        res.status(500).json([]);
    }
});

// Get campaigns (User Specific)
app.get('/api/campaigns', async (req, res) => {
    await db.read();
    const userId = getUserId(req);

    // If no user ID provided, return all (Backward Compatibility / Admin)
    // In strict production, this should likely be restricted.
    if (!userId) {
        return res.json(db.data.campaigns);
    }

    // Filter campaigns by User ID
    const userCampaigns = db.data.campaigns.filter(c => c.userId === userId);
    res.json(userCampaigns);
});

// Create new campaign
app.post('/api/campaigns', async (req, res) => {
    const { name, message, recipients, senderInstance, minDelay, maxDelay, scheduledAt, rotationCount, type } = req.body;
    const userId = getUserId(req);

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User ID is required' });
    }

    const newCampaign = {
        id: Date.now().toString(),
        userId: userId, // Bind to User
        name,
        message,
        senderInstance, // This is the instance name. User isolation for using ONLY their instances should be handled in Frontend selection or Backend validation
        rotationCount: parseInt(rotationCount) || 5,
        sentSinceRotation: 0,
        currentSender: null,
        status: scheduledAt ? 'scheduled' : 'in_progress',
        scheduledAt: scheduledAt || null,
        type: type || 'Marketing',
        current: 0,
        total: recipients.length,
        sentCount: 0,
        failedCount: 0,
        date: new Date().toISOString(),
        recipientsList: recipients.map(num => ({ number: num, status: 'pending' }))
    };

    db.data.campaigns.unshift(newCampaign);
    await db.write();

    res.status(201).json(newCampaign);
});

// Settings Endpoints (User Specific)
app.get('/api/settings', async (req, res) => {
    await db.read();
    const userId = getUserId(req);

    if (!userId) {
        // Fallback to global settings if no user specific (Old behavior)
        return res.json(db.data.settings || {});
    }

    // Initialize userSettings array if not exists
    if (!db.data.userSettings) {
        db.data.userSettings = {};
    }

    // Get settings for specific user, or empty object
    const userSettings = db.data.userSettings[userId] || {};

    // Merge with global defaults if needed, or just return user settings
    res.json(userSettings);
});

app.post('/api/settings', async (req, res) => {
    await db.read();
    const userId = getUserId(req);
    const newSettings = req.body;

    if (!userId) {
        // Fallback to global settings (Old behavior)
        db.data.settings = { ...db.data.settings, ...newSettings };
        await db.write();
        return res.json({ success: true, settings: db.data.settings });
    }

    if (!db.data.userSettings) {
        db.data.userSettings = {};
    }

    // Update specific user settings
    db.data.userSettings[userId] = {
        ...(db.data.userSettings[userId] || {}),
        ...newSettings
    };

    await db.write();
    res.json({ success: true, settings: db.data.userSettings[userId] });
});

// Delete campaign (Secure)
app.delete('/api/campaigns/:id', async (req, res) => {
    await db.read();
    const { id } = req.params;
    const userId = getUserId(req);

    const campaign = db.data.campaigns.find(c => c.id === id);

    if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Check ownership
    if (userId && campaign.userId && campaign.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    db.data.campaigns = db.data.campaigns.filter(c => c.id !== id);
    await db.write();
    res.json({ success: true });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    // Serve static files with explicit configuration
    app.use(express.static(path.join(__dirname, 'dist')));

    // Explicitly handle assets requests to debug and ensure MIME types
    app.use('/assets', (req, res, next) => {
        const filePath = path.join(__dirname, 'dist', 'assets', req.path);
        console.log(`📂 Asset request: ${req.path}`);
        if (req.path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (req.path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
        next();
    }, express.static(path.join(__dirname, 'dist', 'assets')));

    // Redirect all other requests to index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
