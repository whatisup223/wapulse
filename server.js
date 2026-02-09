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
const defaultData = { campaigns: [], contacts: [], settings: {} };
const db = await JSONFilePreset('db.json', defaultData);

const EVOLUTION_URL = process.env.VITE_EVOLUTION_URL;
const EVOLUTION_API_KEY = process.env.VITE_EVOLUTION_API_KEY;

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
        const activeCampaign = campaigns.find(c => {
            if (c.status === 'in_progress') return true;
            if (c.status === 'scheduled') {
                const scheduledTime = new Date(c.scheduledAt);
                return scheduledTime <= now;
            }
            return false;
        });

        if (activeCampaign) {
            if (activeCampaign.status === 'scheduled') {
                activeCampaign.status = 'in_progress';
                await db.write();
            }

            const nextRecipient = activeCampaign.recipientsList.find(r => r.status === 'pending');

            if (nextRecipient) {
                // Account Rotation Logic
                let sender = activeCampaign.senderInstance;

                if (sender === 'all') {
                    // Fetch open instances
                    try {
                        const instancesRes = await axios.get(`${EVOLUTION_URL}/instance/fetchInstances`, {
                            headers: { 'apikey': EVOLUTION_API_KEY }
                        });
                        const openInstances = instancesRes.data.filter(i => i.connectionStatus === 'open' || i.state === 'open');

                        if (openInstances.length === 0) {
                            throw new Error("No online instances available for rotation");
                        }

                        // Check if we need to rotate
                        if (!activeCampaign.currentSender || (activeCampaign.sentSinceRotation || 0) >= (activeCampaign.rotationCount || 5)) {
                            // Pick a random instance from the pool
                            const randomIndex = Math.floor(Math.random() * openInstances.length);
                            activeCampaign.currentSender = openInstances[randomIndex].instanceName || openInstances[randomIndex].name;
                            activeCampaign.sentSinceRotation = 0;
                            console.log(`Rotating account for campaign ${activeCampaign.name} to: ${activeCampaign.currentSender}`);
                        }

                        sender = activeCampaign.currentSender;
                    } catch (e) {
                        console.error("Rotation Error:", e.message);
                        isProcessing = false;
                        return; // Wait for next cycle
                    }
                }

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
                    console.error(`Failed to send to ${nextRecipient.number}:`, error.message);
                    nextRecipient.status = 'failed';
                    activeCampaign.failedCount++;
                    // If instance fails, force a rotation next time
                    if (activeCampaign.senderInstance === 'all') {
                        activeCampaign.currentSender = null;
                    }
                }

                activeCampaign.current++;

                if (activeCampaign.current >= activeCampaign.total) {
                    activeCampaign.status = activeCampaign.failedCount === 0 ? 'sent' : 'partial';
                }

                await db.write();

                const waitTime = Math.floor(Math.random() * (activeCampaign.maxDelay - activeCampaign.minDelay + 1) + activeCampaign.minDelay) * 1000;
                setTimeout(() => { isProcessing = false; processQueue(); }, waitTime);
                return;
            } else {
                activeCampaign.status = activeCampaign.failedCount === 0 ? 'sent' : 'partial';
                await db.write();
            }
        }
    } catch (err) {
        console.error("Queue Processor Error:", err);
    }

    isProcessing = false;
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
