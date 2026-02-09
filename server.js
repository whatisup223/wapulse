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

app.post('/api/webhooks/evolution', (req, res) => {
    try {
        const { event, instance, data } = req.body;

        console.log('='.repeat(60));
        console.log('📩 Evolution Webhook Received');
        console.log('Event:', event);
        console.log('Instance:', instance);
        console.log('Data:', JSON.stringify(data, null, 2));
        console.log('='.repeat(60));

        // Handle different events
        switch (event) {
            case 'messages.upsert':
                console.log('✉️ New message received');
                // TODO: Send to WebSocket clients or update database
                break;

            case 'messages.update':
                console.log('📝 Message updated');
                break;

            case 'chats.upsert':
                console.log('💬 New chat created');
                break;

            case 'chats.update':
                console.log('💬 Chat updated');
                break;

            case 'contacts.upsert':
                console.log('👤 New contact added');
                break;

            case 'connection.update':
                console.log('🔌 Connection status changed');
                break;

            default:
                console.log('ℹ️ Other event:', event);
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
        const campaigns = db.data.campaigns;

        const now = new Date();
        // Priority 1: Current active campaigns
        // Priority 2: Scheduled campaigns that reached their time
        const activeCampaign = campaigns.find(c => {
            if (c.status === 'in_progress') return true;
            if (c.status === 'scheduled' && c.scheduledAt) {
                const scheduledTime = new Date(c.scheduledAt);
                return scheduledTime <= now;
            }
            return false;
        });

        if (!activeCampaign) {
            isProcessing = false;
            return;
        }

        // Auto-start scheduled campaign
        if (activeCampaign.status === 'scheduled') {
            console.log(`Starting scheduled campaign: ${activeCampaign.name}`);
            activeCampaign.status = 'in_progress';
            await db.write();
        }

        const nextRecipient = activeCampaign.recipientsList.find(r => r.status === 'pending');

        if (nextRecipient) {
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
                        console.log(`Rotating sender to: ${activeCampaign.currentSender}`);
                    }
                    sender = activeCampaign.currentSender;
                } catch (e) {
                    console.error("Rotation Error:", e.message);
                    isProcessing = false;
                    return;
                }
            }

            // Sending
            try {
                const response = await axios.post(`${EVOLUTION_URL}/message/sendText/${sender}`, {
                    number: nextRecipient.number,
                    text: activeCampaign.message
                }, {
                    headers: { 'apikey': EVOLUTION_API_KEY }
                });

                if (response.status === 200 || response.status === 201) {
                    nextRecipient.status = 'sent';
                    activeCampaign.sentCount++;
                    if (activeCampaign.senderInstance === 'all') {
                        activeCampaign.sentSinceRotation = (activeCampaign.sentSinceRotation || 0) + 1;
                    }
                } else {
                    nextRecipient.status = 'failed';
                    activeCampaign.failedCount++;
                }
            } catch (error) {
                console.error(`Send failure to ${nextRecipient.number}:`, error.message);
                nextRecipient.status = 'failed';
                activeCampaign.failedCount++;
                if (activeCampaign.senderInstance === 'all') activeCampaign.currentSender = null;
            }

            activeCampaign.current = activeCampaign.recipientsList.filter(r => r.status !== 'pending').length;

            // Final Status Check - Based on actual pending list, not just counter
            const stillPending = activeCampaign.recipientsList.some(r => r.status === 'pending');
            if (!stillPending) {
                console.log(`Campaign ${activeCampaign.name} finished.`);
                activeCampaign.status = activeCampaign.failedCount === 0 ? 'sent' : 'partial';
            }

            await db.write();

            // Intelligent delay before next message in THIS process
            const waitTime = Math.floor(Math.random() * (activeCampaign.maxDelay - activeCampaign.minDelay + 1) + activeCampaign.minDelay) * 1000;
            setTimeout(() => {
                isProcessing = false;
                processQueue();
            }, waitTime);

        } else {
            // No recipients left but status was in_progress
            activeCampaign.status = activeCampaign.failedCount === 0 ? 'sent' : 'partial';
            await db.write();
            isProcessing = false;
        }
    } catch (err) {
        console.error("Queue Processor Fatal Error:", err);
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

// Get all campaigns
app.get('/api/campaigns', async (req, res) => {
    await db.read();
    res.json(db.data.campaigns);
});

// Create new campaign
app.post('/api/campaigns', async (req, res) => {
    const { name, message, recipients, senderInstance, minDelay, maxDelay, scheduledAt, rotationCount, type } = req.body;

    const newCampaign = {
        id: Date.now().toString(),
        name,
        message,
        senderInstance,
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

// Settings Endpoints
app.get('/api/settings', async (req, res) => {
    await db.read();
    res.json(db.data.settings || {});
});

app.post('/api/settings', async (req, res) => {
    const newSettings = req.body;
    db.data.settings = { ...db.data.settings, ...newSettings };
    await db.write();
    res.json({ success: true, settings: db.data.settings });
});

// Delete campaign
app.delete('/api/campaigns/:id', async (req, res) => {
    const { id } = req.params;
    db.data.campaigns = db.data.campaigns.filter(c => c.id !== id);
    await db.write();
    res.json({ success: true });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
