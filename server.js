import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { JSONFilePreset } from 'lowdb/node';
import cron from 'node-cron';
import axios from 'axios';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
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
    jidLinks: [], // { instanceName, jid, lid }
    chats: [],
    messages: [],
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
if (!db.data.jidLinks) db.data.jidLinks = [];
if (!db.data.chats) db.data.chats = [];
if (!db.data.messages) db.data.messages = [];
if (!db.data.contacts) db.data.contacts = [];
await db.write();

const EVOLUTION_URL = process.env.VITE_EVOLUTION_URL;
const EVOLUTION_API_KEY = process.env.VITE_EVOLUTION_API_KEY;

// Helper: Normalize JID (Remove device suffix and standardize)
const normalizeJid = (jid) => {
    if (!jid || typeof jid !== 'string') return '';
    let clean = jid.toLowerCase().trim();

    // Remove :1, :2 etc device suffixes safely (BEFORE splitting domains)
    clean = clean.split(':')[0];

    // Handle cases where ID is just digits without domain
    if (!clean.includes('@')) {
        if (/^\d{10,14}$/.test(clean)) clean += '@s.whatsapp.net';
        else if (/^\d{15,}$/.test(clean)) clean += '@lid'; // Very long digits are usually LIDs
        else return clean;
    }

    const [userId, domain] = clean.split('@');

    // Map evolution/whatsapp domain variants
    let finalDomain = domain;
    if (domain === 'newsletter.net') finalDomain = 'newsletter';
    if (domain === 'c.us') finalDomain = 's.whatsapp.net';

    if (finalDomain === 'broadcast' || finalDomain === 'status') return '';
    return `${userId}@${finalDomain}`;
};

// Helper: Fetch Profile Info from Evolution (Name, JID, LID)
const fetchProfile = async (instanceName, chatId) => {
    try {
        const response = await axios.post(`${EVOLUTION_URL}/contact/profile/${encodeURIComponent(instanceName)}`, {
            number: chatId
        }, { headers: { 'apikey': EVOLUTION_API_KEY } });

        const data = response.data;
        if (!data) return null;

        return {
            name: data.pushName || data.name || data.verifiedName || null,
            jid: normalizeJid(data.jid),
            lid: normalizeJid(data.lid),
            profilePicUrl: data.profilePicUrl || data.profilePictureUrl || null
        };
    } catch (e) {
        return null;
    }
};

// Helper: Get Linked IDs (find if JID has a LID or vice versa)
const getLinkedIds = (id, instanceName) => {
    const links = db.data.jidLinks || [];
    const related = links.filter(l => l.instanceName === instanceName && (l.jid === id || l.lid === id));
    const ids = new Set([id]);
    related.forEach(l => {
        ids.add(l.jid);
        ids.add(l.lid);
    });
    return Array.from(ids).filter(x => !!x);
};

// Helper: Update JID/LID mapping
const updateJidLink = async (instanceName, jid, lid) => {
    if (!jid || !lid || jid === lid) return;
    if (!db.data.jidLinks) db.data.jidLinks = [];

    const exists = db.data.jidLinks.find(l => l.instanceName === instanceName && l.jid === jid && l.lid === lid);
    if (!exists) {
        console.log(`🔗 Linking JID: ${jid} with LID: ${lid}`);
        db.data.jidLinks.push({ instanceName, jid, lid, updatedAt: new Date().toISOString() });
        await db.write();
    }
};

// Helper: Fetch Contacts and Link JID/LID
const fetchAndLinkContacts = async (instanceName) => {
    try {
        console.log(`🔄 Starting Contact Sync for ${instanceName}...`);

        // 1. Check Connection Status First
        try {
            const statusRes = await axios.get(`${EVOLUTION_URL}/instance/connectionState/${encodeURIComponent(instanceName)}`, {
                headers: { 'apikey': EVOLUTION_API_KEY }
            });
            const state = statusRes.data?.instance?.state || statusRes.data?.state;
            if (state !== 'open') {
                console.log(`⚠️ Instance ${instanceName} is not open (State: ${state}). Skipping sync.`);
                return;
            }
        } catch (e) {
            console.log(`⚠️ Could not verify connection state for ${instanceName}, proceeding anyway...`);
        }

        console.log(`📇 Fetching contacts from Evolution for ${instanceName}...`);
        const response = await axios.post(`${EVOLUTION_URL}/chat/findContacts/${encodeURIComponent(instanceName)}`, {}, {
            headers: { 'apikey': EVOLUTION_API_KEY }
        });

        const contacts = response.data || [];
        let linkCount = 0;
        let updateCount = 0;

        for (const c of contacts) {
            const rawId = c.id || c.remoteJid || c.jid;
            const jid = normalizeJid(rawId);

            // Extract potential LID and Phone JID
            // Evolution sometimes returns 'id' as LID and 'remoteJid' as phone JID or vice versa depending on version
            let potentialLid = null;
            let potentialJid = null;

            if (jid.includes('@lid')) potentialLid = jid;
            else if (jid.includes('@s.whatsapp.net')) potentialJid = jid;

            // Check specific fields if available
            if (c.lid) potentialLid = normalizeJid(c.lid);
            if (c.user_jid || c.userJid) potentialJid = normalizeJid(c.user_jid || c.userJid);

            // Link Mapping
            if (potentialLid && potentialJid) {
                updateJidLink(instanceName, potentialJid, potentialLid);
                linkCount++;
            }

            // Determine Primary ID (Phone Number based JID is preferred for storage)
            const primaryId = potentialJid || potentialLid || jid;

            if (!primaryId) continue;

            // Name Resolution
            const name = c.name || c.pushName || c.pushname || c.verifiedName || c.notify;
            const pic = c.profilePictureUrl || c.profilePicUrl || null;

            // Only update if we have a valid name or if contact doesn't exist
            if (primaryId) {
                const existing = db.data.contacts.find(x => x.id === primaryId && x.instanceName === instanceName);

                // Don't overwrite a good name with a phone number or ID
                const isNameValid = name && !name.includes('@') && !/^\d+$/.test(name);

                if (existing) {
                    if (isNameValid) existing.name = name;
                    if (pic) existing.profilePicUrl = pic;
                } else {
                    db.data.contacts.push({
                        id: primaryId,
                        instanceName,
                        name: isNameValid ? name : (primaryId.includes('@s.whatsapp.net') ? '+' + primaryId.split('@')[0] : primaryId),
                        profilePicUrl: pic
                    });
                    updateCount++;
                }
            }
        }

        console.log(`✅ Sync Complete: ${updateCount} contacts added/updated, ${linkCount} JID/LID links created.`);
        await db.write();

    } catch (e) {
        console.error('❌ Contact Sync Error:', e.message);
    }
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

                // Linking Logic: If message contains both JID and LID info
                const messageJid = normalizeJid(message.key?.remoteJid);
                const participant = normalizeJid(message.participant);
                if (messageJid && participant && messageJid !== participant) {
                    if (messageJid.includes('@s.whatsapp.net') && participant.includes('@lid')) updateJidLink(instanceName, messageJid, participant);
                    else if (messageJid.includes('@lid') && participant.includes('@s.whatsapp.net')) updateJidLink(instanceName, participant, messageJid);
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
                    const pc = transformChat({
                        id: remoteJid,
                        pushName: message.pushName,
                        lastMessage: { message: { conversation: msgBody }, messageTimestamp: timestamp }
                    }, instanceName);

                    db.data.chats.unshift(pc || {
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
                    const cId = normalizeJid(c.id || c.remoteJid);
                    if (!cId) continue;

                    // Try to link if alternative ID exists
                    const altId = normalizeJid(c.remoteJid || c.jid);
                    if (altId && altId !== cId) {
                        if (cId.includes('@lid') && altId.includes('@s.whatsapp.net')) updateJidLink(instanceName, altId, cId);
                        else if (cId.includes('@s.whatsapp.net') && altId.includes('@lid')) updateJidLink(instanceName, cId, altId);
                    }

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
    // Prioritize remoteJid (WhatsApp ID) over c.id (Internal Evolution ID)
    const rawId = c.remoteJid || c.id || '';
    const fullJid = normalizeJid(rawId);
    if (!fullJid) return null;

    // Direct extraction of JID/LID from record if available
    const jid = normalizeJid(c.jid);
    const lid = normalizeJid(c.lid);
    if (jid && lid && jid !== lid) {
        updateJidLink(instanceName, jid, lid);
    }

    // Deep Discovery: Check lastMessage metadata for linked IDs (Evolution exposes this in remoteJidAlt)
    const altJid = normalizeJid(c.lastMessage?.key?.remoteJidAlt);
    if (altJid && fullJid && altJid !== fullJid) {
        if (fullJid.includes('@lid') && altJid.includes('@s.whatsapp.net')) {
            updateJidLink(instanceName, altJid, fullJid);
        } else if (fullJid.includes('@s.whatsapp.net') && altJid.includes('@lid')) {
            updateJidLink(instanceName, fullJid, altJid);
        }
    }

    const [idPart, domain] = fullJid.split('@');

    // Name Resolution Logic
    // IMPORTANT: Ignore owner's name/Você from lastMessage.pushName if it's fromMe
    const isFromMe = c.lastMessage?.key?.fromMe || c.lastMessage?.fromMe || false;
    let pushName = (c.pushName || c.pushname || c.verifiedName);
    if (!pushName && !isFromMe) pushName = c.lastMessage?.pushName;

    let finalName = c.name || pushName;

    // Check contacts cache if name missing (Enhanced with Linked IDs)
    if (!finalName || finalName === idPart || /^[a-zA-Z0-9_-]{15,}$/.test(finalName)) {
        let searchIds = [fullJid];

        // If LID, look for linked phone JID
        const linked = getLinkedIds(fullJid, instanceName);
        if (linked && linked.length > 0) searchIds = [...searchIds, ...linked];

        for (const pid of searchIds) {
            const contact = db.data.contacts.find(x => x.id === pid && x.instanceName === instanceName);
            if (contact && contact.name && !contact.name.includes('@') && !/^\d+$/.test(contact.name)) {
                finalName = contact.name;
                // Update the profile pic while we are at it
                if (!c.profilePictureUrl && !c.profilePicUrl && contact.profilePicUrl) {
                    c.profilePicUrl = contact.profilePicUrl;
                }
                break;
            }
        }
    }

    // Advanced Formatting for IDs acting as names
    if (!finalName || finalName === idPart || finalName.startsWith('lid_') || /^[a-zA-Z0-9_-]{15,}$/.test(finalName)) {
        if (domain === 's.whatsapp.net') {
            // Always format as phone number for regular WhatsApp IDs
            const digits = idPart.replace(/\D/g, '');
            if (digits.length >= 7) finalName = `+${digits}`;
            else finalName = idPart;
        } else if (domain === 'lid') {
            // Check if we have a linked JID name OR a pushName
            const linkedIds = getLinkedIds(fullJid, instanceName);
            const realJid = linkedIds.find(id => id.includes('@s.whatsapp.net'));

            if (realJid) {
                finalName = `+${realJid.split('@')[0]}`;
            } else {
                finalName = `User (${idPart.substring(0, 4)}..${idPart.substring(idPart.length - 4)})`;
            }
        } else if (domain === 'newsletter') {
            finalName = `Channel: ${idPart.substring(0, 8)}...`;
        } else {
            finalName = idPart;
        }
    }

    // Unified ID Logic: Always prefer Phone JID over LID for the Chat ID
    let finalId = fullJid;
    if (fullJid.includes('@lid')) {
        const linked = getLinkedIds(fullJid, instanceName);
        const real = linked.find(x => x.includes('@s.whatsapp.net'));
        if (real) finalId = real;
    }

    return {
        id: finalId, // Use the unified ID
        instanceName,
        name: finalName,
        unreadCount: c.unreadCount || 0,
        timestamp: Math.max(c.conversationTimestamp || 0, c.timestamp || 0, c.lastMessage?.messageTimestamp || 0),
        profilePicUrl: c.profilePictureUrl || c.profilePicUrl || null,
        lastMessage: typeof c.lastMessage === 'string' ? c.lastMessage : (c.lastMessage?.message?.conversation || c.lastMessage?.body || '')
    };
};

/* GET /api/debug/reset/:instanceName
   - Clears all cached data for this instance
   - Force fresh start
*/
app.get('/api/debug/reset/:instanceName', async (req, res) => {
    const { instanceName } = req.params;
    await db.read();

    // Filter OUT everything from this instance
    db.data.chats = db.data.chats.filter(c => c.instanceName !== instanceName);
    db.data.messages = db.data.messages.filter(m => m.instanceName !== instanceName);
    db.data.contacts = db.data.contacts.filter(c => c.instanceName !== instanceName);
    db.data.jidLinks = db.data.jidLinks.filter(l => l.instanceName !== instanceName);

    await db.write();
    console.log(`🧹 RESET COMPLETE for ${instanceName}`);
    res.json({ success: true, message: `Cache cleared for ${instanceName}` });
});

/* GET /api/chats/:instanceName
   - Returns cached chats
   - If cache empty, fetches from Evolution (Sync)
   - Query param ?force=true forces a re-sync from Evolution
*/
app.get('/api/chats/:instanceName', async (req, res) => {
    const { instanceName } = req.params;
    const forceSync = req.query.force === 'true';
    const cleanCache = req.query.clean === 'true';

    await db.read();
    db.data = db.data || {};
    if (!db.data.chats) db.data.chats = [];
    if (!db.data.messages) db.data.messages = [];

    // 1. Fetch from Evolution if needed
    if (db.data.chats.filter(c => c.instanceName === instanceName).length === 0 || forceSync) {
        if (cleanCache || forceSync) {
            console.log(`🧹 Cleaning local cache for ${instanceName}`);
            db.data.chats = db.data.chats.filter(c => c.instanceName !== instanceName);
            db.data.messages = db.data.messages.filter(m => m.instanceName !== instanceName);
            // On force sync, always rebuild the identity map
            await fetchAndLinkContacts(instanceName);
        }
        try {
            const encodedInstanceName = encodeURIComponent(instanceName);
            const response = await axios.post(`${EVOLUTION_URL}/chat/findChats/${encodedInstanceName}`, {}, {
                headers: { 'apikey': EVOLUTION_API_KEY, 'Content-Type': 'application/json' }
            });

            const rawChats = response.data?.records || response.data?.data || (Array.isArray(response.data) ? response.data : []);
            const processed = rawChats.map(c => transformChat(c, instanceName)).filter(c => c !== null);

            for (const pc of processed) {
                const idx = db.data.chats.findIndex(c => c.id === pc.id && c.instanceName === instanceName);
                if (idx > -1) db.data.chats[idx] = { ...db.data.chats[idx], ...pc };
                else db.data.chats.push(pc);
            }
            await db.write();
        } catch (e) {
            console.error('Chat Sync Error:', e.message);
        }
    }

    // 2. Local Deduplication Logic (JID & LID merging)
    const chats = db.data.chats.filter(c => c.instanceName === instanceName);
    const unifiedChats = [];
    const seenIdentities = new Set();

    // Sort by timestamp to process newest first
    const sorted = [...chats].sort((a, b) => b.timestamp - a.timestamp);

    for (const chat of sorted) {
        const linkedIds = getLinkedIds(chat.id, instanceName);
        const identity = linkedIds.sort().join('|'); // Canonical cluster ID

        if (!seenIdentities.has(identity)) {
            const cluster = chats.filter(c => linkedIds.includes(c.id));

            // Priority 1: Real JID Chat Record
            // Priority 2: LID Chat Record but forcefully updated with associated JID info
            let bestChat = cluster.find(c => c.id.includes('@s.whatsapp.net')) || cluster[0];

            const realJid = linkedIds.find(id => id.includes('@s.whatsapp.net'));
            if (realJid && bestChat.id.includes('@lid')) {
                // FORCE: We have an LID chat but we know it belongs to this JID
                const jidIdPart = realJid.split('@')[0];
                bestChat = {
                    ...bestChat,
                    id: realJid, // Swap LID with JID
                    name: bestChat.name.startsWith('+') ? `+${jidIdPart}` : bestChat.name // Try to use phone number
                };
            }

            // Final Name Polish: Ensure names don't stay as long IDs if we have a real JID
            if (bestChat.name.length > 20 && realJid) {
                bestChat.name = `+${realJid.split('@')[0]}`;
            }

            // Background Resolution for missing names
            if (bestChat.name === bestChat.id.split('@')[0] || bestChat.name.startsWith('+')) {
                fetchProfile(instanceName, bestChat.id).then(async (prof) => {
                    if (prof) {
                        const idx = db.data.chats.findIndex(x => x.id === bestChat.id && x.instanceName === instanceName);
                        if (idx > -1) {
                            if (prof.name) db.data.chats[idx].name = prof.name;
                            if (prof.profilePicUrl) db.data.chats[idx].profilePicUrl = prof.profilePicUrl;
                            if (prof.jid && prof.lid) updateJidLink(instanceName, prof.jid, prof.lid);
                            await db.write();
                        }
                    }
                }).catch(() => { });
            }

            unifiedChats.push({
                ...bestChat,
                unreadCount: cluster.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
                timestamp: Math.max(...cluster.map(c => c.timestamp || 0)),
                lastMessage: cluster.sort((a, b) => b.timestamp - a.timestamp)[0].lastMessage
            });
            seenIdentities.add(identity);
        }
    }

    res.json(unifiedChats);
});

/* GET /api/messages/:instanceName/:chatId
   - Returns cached messages
   - Optionally fetches history if requested or cache miss (Hybrid)
*/
app.get('/api/messages/:instanceName/:chatId', async (req, res) => {
    const { instanceName, chatId } = req.params;
    await db.read();

    const targetId = normalizeJid(decodeURIComponent(chatId));
    if (!targetId) return res.json([]);

    console.log(`🔍 Fetching messages for ${targetId} on ${instanceName}...`);

    // 1. Identify all linked IDs (JID + LID)
    let allLinkedIds = getLinkedIds(targetId, instanceName);

    // 2. Discovery: If history is low and only one ID known, try to find the other
    let currentCount = db.data.messages.filter(m => m.instanceName === instanceName && allLinkedIds.includes(m.chatId)).length;

    if (currentCount < 5) {
        console.log(`🕵️ Discovery mode for ${targetId}`);
        const prof = await fetchProfile(instanceName, targetId);
        if (prof && prof.jid && prof.lid) {
            await updateJidLink(instanceName, prof.jid, prof.lid);
            allLinkedIds = getLinkedIds(targetId, instanceName);
        }
    }

    // 3. Unified Background Sync for all discovered IDs
    if (db.data.messages.filter(m => m.instanceName === instanceName && allLinkedIds.includes(m.chatId)).length < 15) {
        console.log(`📦 Background history sync for IDs: ${allLinkedIds.join(', ')}`);
        for (const idToSync of allLinkedIds) {
            try {
                const response = await axios.post(`${EVOLUTION_URL}/chat/findMessages/${encodeURIComponent(instanceName)}`, {
                    where: { remoteJid: idToSync },
                    limit: 100 // Increased limit for better history
                }, { headers: { 'apikey': EVOLUTION_API_KEY } });

                const rawMsgs = response.data?.messages || response.data?.records || (Array.isArray(response.data) ? response.data : []);
                if (Array.isArray(rawMsgs)) {
                    for (const m of rawMsgs) {
                        const mId = m.key?.id || m.id;
                        if (!db.data.messages.find(ex => ex.id === mId)) {
                            db.data.messages.push({
                                id: mId,
                                instanceName,
                                chatId: idToSync,
                                body: m.message?.conversation || m.message?.extendedTextMessage?.text || m.body || '',
                                fromMe: m.key?.fromMe || m.fromMe || false,
                                timestamp: m.messageTimestamp || m.timestamp || 0,
                                status: 'history_sync'
                            });
                        }
                    }
                }
            } catch (e) {
                console.error(`❌ Sync error for ${idToSync}:`, e.message);
            }
        }
        await db.write();
    }

    // 4. Return merged results from all linked IDs
    const finalMsgs = db.data.messages.filter(m => m.instanceName === instanceName && allLinkedIds.includes(m.chatId));
    finalMsgs.sort((a, b) => a.timestamp - b.timestamp);

    console.log(`✅ Returning ${finalMsgs.length} messages for ${targetId}`);
    res.json(finalMsgs);
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

        // Fetch ALL from Evolution
        const response = await axios.get(`${EVOLUTION_URL}/instance/fetchInstances`, {
            headers: { 'apikey': EVOLUTION_API_KEY }
        });

        const allInstances = response.data || [];

        // Filter: Only show instances that belong to this user
        let myInstances = allInstances.filter(inst => myInstanceNames.includes(inst.instanceName || inst.name));

        // FALLBACK FOR DEBUGGING: If user has NO instances linked locally, 
        // but there are active instances on the server, show them (Temporary fix to see connections)
        if (myInstances.length === 0 && allInstances.length > 0) {
            console.log(`⚠️ User ${userId} has no linked instances, showing all available server instances for debugging.`);
            // Auto-link found open instances content to this user to fix the "No numbers connected" issue
            const openInstances = allInstances.filter(i => i.connectionStatus === 'open' || i.state === 'open');
            if (openInstances.length > 0) {
                for (const inst of openInstances) {
                    const iName = inst.instanceName || inst.name;
                    // Link it!
                    if (!userInstances.find(ui => ui.instanceName === iName)) {
                        db.data.userInstances.push({ instanceName: iName, userId, createdAt: new Date().toISOString() });
                    }
                }
                await db.write();
                myInstances = openInstances;
            }
        }

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

// ==================== ADMIN PANEL APIs ====================

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Admin Authentication Middleware
const adminAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'غير مصرح' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.adminId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'رمز غير صالح' });
    }
};

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    await db.read();
    const { email, password } = req.body;

    // Find user in database
    // In production, use bcrypt here (e.g., await bcrypt.compare(password, user.passwordHash))
    const user = db.data.users?.find(u => u.email === email && u.password === password);

    if (user && (user.role === 'Administrator' || user.role === 'admin')) {
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, message: 'تم تسجيل الدخول بنجاح', user: { name: user.name, email: user.email } });
    } else {
        res.status(401).json({ message: 'بيانات الدخول غير صحيحة أو ليس لديك صلاحيات المسؤول' });
    }
});

// Get Admin Stats
app.get('/api/admin/stats', adminAuth, async (req, res) => {
    await db.read();

    const stats = {
        totalUsers: db.data.users?.length || 0,
        activeUsers: db.data.users?.filter(u => u.status === 'active').length || 0,
        totalRevenue: 12450, // Mock data
        totalCampaigns: db.data.campaigns?.length || 0,
    };

    res.json(stats);
});

// ==================== USER MANAGEMENT ====================

// Get All Users
app.get('/api/admin/users', adminAuth, async (req, res) => {
    await db.read();
    const users = db.data.users || [];
    res.json(users);
});

// Create User
app.post('/api/admin/users', adminAuth, async (req, res) => {
    await db.read();

    const newUser = {
        id: `user_${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        status: 'active'
    };

    db.data.users = db.data.users || [];
    db.data.users.push(newUser);
    await db.write();

    res.json({ message: 'تم إضافة المستخدم بنجاح', user: newUser });
});

// Update User
app.put('/api/admin/users/:id', adminAuth, async (req, res) => {
    await db.read();

    const userIndex = db.data.users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) {
        return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    db.data.users[userIndex] = { ...db.data.users[userIndex], ...req.body };
    await db.write();

    res.json({ message: 'تم تحديث المستخدم بنجاح', user: db.data.users[userIndex] });
});

// Delete User
app.delete('/api/admin/users/:id', adminAuth, async (req, res) => {
    await db.read();

    db.data.users = db.data.users.filter(u => u.id !== req.params.id);
    await db.write();

    res.json({ message: 'تم حذف المستخدم بنجاح' });
});

// Toggle User Status
app.patch('/api/admin/users/:id/toggle-status', adminAuth, async (req, res) => {
    await db.read();

    const user = db.data.users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    user.status = req.body.status;
    await db.write();

    res.json({ message: 'تم تحديث الحالة بنجاح', user });
});

// ==================== BRANDING SETTINGS ====================

// Get Branding Settings
app.get('/api/admin/branding', adminAuth, async (req, res) => {
    await db.read();
    const branding = db.data.settings?.branding || {};
    res.json(branding);
});

// Update Branding Settings
app.post('/api/admin/branding', adminAuth, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
]), async (req, res) => {
    await db.read();

    const branding = {
        siteName: req.body.siteName,
        siteDescription: req.body.siteDescription,
        primaryColor: req.body.primaryColor,
        secondaryColor: req.body.secondaryColor,
        accentColor: req.body.accentColor,
        logo: req.files?.logo?.[0]?.path || db.data.settings?.branding?.logo,
        favicon: req.files?.favicon?.[0]?.path || db.data.settings?.branding?.favicon,
    };

    db.data.settings = db.data.settings || {};
    db.data.settings.branding = branding;
    await db.write();

    res.json({ message: 'تم حفظ الإعدادات بنجاح', branding });
});

// ==================== CONTENT MANAGEMENT ====================

// Get Content
app.get('/api/admin/content', adminAuth, async (req, res) => {
    await db.read();
    const content = db.data.settings?.content || {};
    res.json(content);
});

// Update Content
app.post('/api/admin/content', adminAuth, async (req, res) => {
    await db.read();

    db.data.settings = db.data.settings || {};
    db.data.settings.content = req.body;
    await db.write();

    res.json({ message: 'تم حفظ المحتوى بنجاح' });
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
