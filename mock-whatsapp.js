require("dotenv").config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const PORT = process.env.MOCK_PORT || 3001;

app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 16 * 1024 * 1024 // 16MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images, videos, audio files, and documents
        const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mp3|wav|ogg|m4a|aac|flac|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || 
                        file.mimetype.startsWith('image/') || 
                        file.mimetype.startsWith('video/') ||
                        file.mimetype.startsWith('audio/') ||
                        file.mimetype === 'application/pdf' ||
                        file.mimetype.includes('document') ||
                        file.mimetype.includes('text');
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, videos, audio files, and documents are allowed!'));
        }
    }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Serve template files (for web interface preview)
app.use('/template-repository', express.static(path.join(__dirname, 'template-repository')));

// In-memory storage for messages
let messages = [];
let messageId = 1;

// Function to load and process template
function loadAndProcessTemplate(templateName, parameters) {
    try {
        const templatePath = path.join(__dirname, 'template-repository', `${templateName}.json`);
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found: ${templateName}`);
        }
        
        const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
        
        // Find the BODY component
        const bodyComponent = templateData.components.find(comp => comp.type === 'BODY');
        
        if (!bodyComponent) {
            throw new Error(`Template ${templateName} has no BODY component`);
        }
        
        let processedText = bodyComponent.text;
        
        // Replace parameters
        if (parameters && parameters.length > 0) {
            parameters.forEach(param => {
                if (param.type === 'text' && param.parameter_name) {
                    // Replace {{parameter_name}} with the actual value
                    const placeholder = `{{${param.parameter_name}}}`;
                    processedText = processedText.replace(new RegExp(placeholder, 'g'), param.text);
                }
            });
        }
        
        return {
            success: true,
            text: processedText,
            templateData: templateData
        };
    } catch (error) {
        console.error('Template processing error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Mock WhatsApp API endpoint
app.post('/:version/:phoneNumberId/messages', (req, res) => {
    const { phoneNumberId } = req.params;
    const { messaging_product, to, text, type, interactive, status, template } = req.body;

    console.log('<--- Mock called:', JSON.stringify(req.body, null, 2));

    let messageBody = text?.body || interactive?.body?.text || `n/a (${type}/${status})`;
    let processedTemplate = null;

    // Handle template messages
    if (type === 'template' && template) {
        const templateResult = loadAndProcessTemplate(
            template.name,
            template.components?.[0]?.parameters
        );
        
        if (templateResult.success) {
            messageBody = templateResult.text;
            processedTemplate = {
                name: template.name,
                originalTemplate: template,
                processedText: templateResult.text,
                templateData: templateResult.templateData
            };
            console.log('---> Template processed successfully:', template.name);
        } else {
            messageBody = `Template Error: ${templateResult.error}`;
            console.error('---> Template processing failed:', templateResult.error);
        }
    }

    // Create message object
    const message = {
        id: `mock_msg_${messageId++}`,
        from: phoneNumberId,
        to: to,
        timestamp: Date.now(),
        type: type || 'text',
        messaging_product,
        body: messageBody,
        interactive: interactive || null,
        template: processedTemplate,
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

// API to send user messages with file attachments
app.post('/api/send-file-message', upload.single('file'), (req, res) => {
    const { from, caption, messageType } = req.body;
    const file = req.file;
    
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const mediaUrl = `http://localhost:${PORT}/uploads/${file.filename}`;
    
    // Create incoming message with file
    const incomingMessage = {
        id: `emulated_msg_${messageId++}`,
        from: from,
        to: process.env.PHONE_NUMBER_ID || 'mock_bot',
        timestamp: Date.now(),
        type: messageType || 'document',
        body: caption || file.originalname,
        caption: caption,
        mediaUrl: mediaUrl,
        fileName: file.originalname,
        fileSize: formatFileSize(file.size),
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
                        type: messageType || 'document',
                        id: incomingMessage.id,
                        image: messageType === 'image' ? { 
                            id: 'mock_media_id',
                            caption: caption,
                            url: mediaUrl
                        } : undefined,
                        video: messageType === 'video' ? {
                            id: 'mock_media_id',
                            caption: caption,
                            url: mediaUrl
                        } : undefined,
                        document: (messageType === 'document') ? {
                            id: 'mock_media_id',
                            caption: caption,
                            filename: file.originalname,
                            url: mediaUrl
                        } : undefined,
                        audio: messageType === 'audio' ? {
                            id: 'mock_media_id',
                            url: mediaUrl
                        } : undefined
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
            console.log('---> File webhook sent successfully to bot', JSON.stringify(webhookPayload, null, 2));
        })
        .catch(error => {
            console.error('Error sending file webhook to bot:', error.message);
        });
    
    res.json({ success: true, message: incomingMessage, mediaUrl: mediaUrl });
});

// API to send contact messages
app.post('/api/send-contact-message', (req, res) => {
    const { from, contact } = req.body;
    
    if (!contact || !contact.name || !contact.phones || contact.phones.length === 0) {
        return res.status(400).json({ error: 'Invalid contact data' });
    }
    
    // Create incoming message with contact
    const incomingMessage = {
        id: `emulated_msg_${messageId++}`,
        from: from,
        to: process.env.PHONE_NUMBER_ID || 'mock_bot',
        timestamp: Date.now(),
        type: 'contacts',
        body: `Contact: ${contact.name}`,
        contact: contact,
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
                        type: 'contacts',
                        id: incomingMessage.id,
                        contacts: [contact]
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
            console.log('---> Contact webhook sent successfully to bot', JSON.stringify(webhookPayload, null, 2));
        })
        .catch(error => {
            console.error('Error sending contact webhook to bot:', error.message);
        });
    
    res.json({ success: true, message: incomingMessage });
});

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        id: `emulated_msg_${messageId++}`,
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

// API to get available templates
app.get('/api/templates', (req, res) => {
    try {
        const templateDir = path.join(__dirname, 'template-repository');
        
        if (!fs.existsSync(templateDir)) {
            return res.json([]);
        }
        
        const templateFiles = fs.readdirSync(templateDir).filter(file => file.endsWith('.json'));
        const templates = [];
        
        templateFiles.forEach(file => {
            try {
                const templatePath = path.join(templateDir, file);
                const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
                
                templates.push({
                    filename: file,
                    name: templateData.name,
                    language: templateData.language,
                    category: templateData.category,
                    status: templateData.status,
                    components: templateData.components.map(comp => ({
                        type: comp.type,
                        parameters: comp.example?.body_text_named_params || []
                    }))
                });
            } catch (error) {
                console.error(`Error reading template ${file}:`, error.message);
            }
        });
        
        res.json(templates);
    } catch (error) {
        console.error('Error listing templates:', error.message);
        res.status(500).json({ error: 'Failed to list templates' });
    }
});

// API to send template message (for testing from web interface)
app.post('/api/send-template-message', (req, res) => {
    const { to, templateName, parameters } = req.body;
    
    if (!templateName) {
        return res.status(400).json({ error: 'Template name is required' });
    }
    
    // Create template message payload
    const templatePayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: "pt_BR"
            }
        }
    };
    
    // Add parameters if provided
    if (parameters && parameters.length > 0) {
        templatePayload.template.components = [
            {
                type: "body",
                parameters: parameters.map(param => ({
                    type: "text",
                    parameter_name: param.name,
                    text: param.value
                }))
            }
        ];
    }
    
    // Send to the messages endpoint (simulate bot sending template)
    const axios = require('axios');
    const mockApiUrl = `http://localhost:${PORT}/v18.0/mock_phone_id/messages`;
    
    axios.post(mockApiUrl, templatePayload)
        .then(response => {
            res.json({ success: true, response: response.data });
        })
        .catch(error => {
            console.error('Error sending template message:', error.message);
            res.status(500).json({ error: 'Failed to send template message' });
        });
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
