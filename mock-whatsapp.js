require("dotenv").config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.MOCK_PORT || 3001;

app.use(express.json());
app.use(express.static('public'));

// In-memory storage for messages
let messages = [];
let messageId = 1;

// Mock WhatsApp API endpoint
app.post('/:version/:phoneNumberId/messages', (req, res) => {
    const { phoneNumberId } = req.params;
    const { messaging_product, to, text, type, interactive } = req.body;

    console.log('<--- Mock called:', JSON.stringify(req.body, null, 2));

    // Create message object
    const message = {
        id: `mock_msg_${messageId++}`,
        from: phoneNumberId,
        to: to,
        timestamp: Date.now(),
        type: type || 'text',
        messaging_product,
        body: text?.body || interactive?.body?.text || 'n/a',
        interactive: interactive || null,
        direction: 'outgoing'
    };
    
    messages.push(message);
    
    // Broadcast to connected clients via SSE
    broadcastMessage(message);
    
    // Return mock WhatsApp API response
    res.json({
        messaging_product: "whatsapp",
        contacts: [
            {
                input: to,
                wa_id: to
            }
        ],
        messages: [
            {
                id: message.id
            }
        ]
    });
});

// SSE endpoint for real-time updates
app.get('/events', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    // Send current messages
    res.write(`data: ${JSON.stringify({ type: 'initial', messages })}\n\n`);

    // Keep connection alive
    const keepAlive = setInterval(() => {
        res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
    }, 30000);

    req.on('close', () => {
        clearInterval(keepAlive);
    });

    // Store connection for broadcasting
    req.on('close', () => {
        const index = sseClients.indexOf(res);
        if (index !== -1) {
            sseClients.splice(index, 1);
        }
    });
    
    sseClients.push(res);
});

// Store SSE clients
const sseClients = [];

function broadcastMessage(message) {
    const data = JSON.stringify({ type: 'message', message });
    sseClients.forEach(client => {
        try {
            client.write(`data: ${data}\n\n`);
        } catch (err) {
            console.error('Error broadcasting message:', err);
        }
    });
}

// API to send user messages (simulate receiving from user)
app.post('/api/send-user-message', (req, res) => {
    const { from, message, messageType = 'text', buttonId, listRowId } = req.body;
    
    let msgBody = message;
    let interactive = null;
    
    if (buttonId) {
        interactive = {
            button_reply: {
                id: buttonId,
                title: message
            }
        };
        msgBody = buttonId;
    } else if (listRowId) {
        interactive = {
            list_reply: {
                id: listRowId,
                title: message
            }
        };
        msgBody = listRowId;
    }
    
    // Create incoming message
    const incomingMessage = {
        id: `user_msg_${messageId++}`,
        from: from,
        to: process.env.PHONE_NUMBER_ID || 'mock_bot',
        timestamp: Date.now(),
        type: messageType,
        body: msgBody,
        interactive: interactive,
        direction: 'incoming'
    };
    
    messages.push(incomingMessage);
    broadcastMessage(incomingMessage);
    
    // Send webhook to your bot
    const webhookPayload = {
        entry: [{
            changes: [{
                value: {
                    messages: [{
                        from: from,
                        timestamp: Math.floor(Date.now() / 1000),
                        text: messageType === 'text' ? { body: message } : undefined,
                        interactive: interactive,
                        image: messageType === 'image' ? { id: 'mock_image_id' } : undefined,
                        type: messageType,
                        id: incomingMessage.id
                    }]
                }
            }]
        }]
    };
    
    // Send to your bot's webhook
    const axios = require('axios');
    const botWebhookUrl = process.env.BOT_WEBHOOK_URL || `http://localhost:3000/webhook`;

    axios.post(botWebhookUrl, webhookPayload)
        .then(response => {
            console.log('---> Webhook sent successfully to bot', JSON.stringify(webhookPayload, null, 2));
        })
        .catch(error => {
            console.error('Error sending webhook to bot:', error.message);
        });
    
    res.json({ success: true, message: incomingMessage });
});

// Get all messages
app.get('/api/messages', (req, res) => {
    res.json(messages);
});

// Clear messages
app.delete('/api/messages', (req, res) => {
    messages = [];
    messageId = 1;
    broadcastMessage({ type: 'clear' });
    res.json({ success: true });
});

// Serve the web interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Mock WhatsApp server running on http://localhost:${PORT}`);
    console.log(`Mock API endpoint: http://localhost:${PORT}/v18.0/{phoneNumberId}/messages`);
    console.log(`Web interface: http://localhost:${PORT}`);
});
