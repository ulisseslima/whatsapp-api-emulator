require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { createMachine, createActor, assign } = require("xstate");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// In-memory storage for user data and state machines
const userStateMachines = new Map(); // Stores XState interpreters for each user
const users = new Map(); // in-memory user database
const occurrences = new Map(); // in-memory occurrences database
let occurrenceCounter = 1;

const USER_STATUS = {
    TERMS_NOT_ACCEPTED: 'terms_not_accepted',
    PRE_REGISTERED: 'pre_registered',
    REGISTRATION_PENDING: 'registration_pending',
    APPROVAL_PENDING: 'approval_pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

const OCCURRENCE_STATUS = {
    IN_PROGRESS: 'in_progress',
    WAITING_RESPONSE: 'waiting_response',
    RESOLVED: 'resolved',
    CANCELLED: 'cancelled'
};

// XState machine definition for conversation flow
const conversationMachine = createMachine({
    id: 'whatsappBot',
    initial: 'checkingTerms',
    context: {
        phone: null,
        userName: '',
        userEmail: '',
        userBlock: '',
        userUnit: '',
        occurrenceData: {},
        feedbackData: {}
    },
    states: {
        checkingTerms: {
            on: {
                TERMS_NEEDED: 'waitingTermsAcceptance',
                TERMS_ACCEPTED: 'checkingUserStatus',
                USER_EXISTS: 'checkingUserStatus'
            }
        },
        waitingTermsAcceptance: {
            on: {
                ACCEPT_TERMS: 'checkingUserStatus',
                REJECT_TERMS: 'termsRejected'
            }
        },
        termsRejected: {
            type: 'final'
        },
        checkingUserStatus: {
            on: {
                PRE_REGISTERED: 'waitingDataConfirmation',
                NEW_USER: { 
                    target: 'waitingName', actions: assign({
                        userName: ({ event }) => event.data
                    })
                },
                APPROVED: 'mainMenu',
                PENDING: 'registrationPending',
                REJECTED: 'registrationRejected'
            }
        },
        waitingName: {
            on: {
                PROVIDE_NAME: {
                    target: 'waitingEmail',
                    actions: assign({
                        userName: ({ event }) => event.data
                    })
                }
            }
        },
        waitingEmail: {
            on: {
                PROVIDE_EMAIL: {
                    target: 'waitingBlock',
                    actions: assign({
                        userEmail: ({ event }) => event.data
                    })
                }
            }
        },
        waitingBlock: {
            on: {
                PROVIDE_BLOCK: {
                    target: 'waitingUnit',
                    actions: assign({
                        userBlock: ({ event }) => event.data
                    })
                }
            }
        },
        waitingUnit: {
            on: {
                PROVIDE_UNIT: {
                    target: 'waitingDataConfirmation',
                    actions: assign({
                        userUnit: ({ event }) => event.data
                    })
                }
            }
        },
        waitingDataConfirmation: {
            on: {
                CONFIRM_DATA: 'mainMenu',
                EDIT_DATA: 'waitingName',
                SUBMIT_REGISTRATION: 'registrationPending'
            }
        },
        registrationPending: {
            on: {
                APPROVE_USER: 'mainMenu',
                REJECT_USER: 'registrationRejected'
            }
        },
        registrationRejected: {
            type: 'final'
        },
        mainMenu: {
            on: {
                START_OCCURRENCE: { 
                    target: 'waitingOccurrenceDescription', 
                    actions: assign({
                        occurrenceData: ({ event }) => event.data
                    })
                },
                VIEW_OCCURRENCES: 'viewingOccurrences',
                OCCURRENCE_RESOLVED: 'waitingFeedback'
            }
        },
        waitingOccurrenceDescription: {
            on: {
                PROVIDE_DESCRIPTION: {
                    target: 'waitingOccurrenceMedia',
                    actions: assign({
                        occurrenceData: {
                            description: ({ event }) => event.data
                        }
                    })
                }
            }
        },
        waitingOccurrenceMedia: {
            on: {
                PROVIDE_MEDIA: {
                    target: 'mainMenu',
                    actions: assign({
                        occurrenceData: ({ event }) => event.data
                    })
                },
                NO_MEDIA: {
                    target: 'mainMenu',
                    actions: assign({
                        occurrenceData: ({ event }) => event.data
                    })
                }
            }
        },
        viewingOccurrences: {
            on: {
                BACK_TO_MENU: 'mainMenu'
            }
        },
        waitingFeedback: {
            on: {
                PROVIDE_FEEDBACK: {
                    target: 'waitingFeedbackComment',
                    actions: 'storeFeedback'
                }
            }
        },
        waitingFeedbackComment: {
            on: {
                PROVIDE_COMMENT: 'mainMenu',
                SKIP_COMMENT: 'mainMenu'
            }
        }
    }
}, {
    actions: {
        storeUser: (context, event) => {
            context.userData = event.data;
        },
        storeOccurrence: (context, event) => {
            context.occurrenceData = event.data;
        },
        storeName: (context, event) => {
            context.userData.name = event.data;
        },
        storeEmail: (context, event) => {
            context.userData.email = event.data;
        },
        storeBlock: (context, event) => {
            context.userData.block = event.data;
        },
        storeUnit: (context, event) => {
            context.userData.unit = event.data;
        },
        storeDescription: (context, event) => {
            context.occurrenceData.description = event.data;
        },
        createOccurrence: (context, event) => {
            context.occurrenceData.mediaUrl = event.data || null;
        },
        storeFeedback: (context, event) => {
            context.feedbackData.rating = event.data;
        }
    }
});

// Sample pre-registered users
users.set('5511999999999', {
    phone: '5511999999999',
    name: 'João Silvan',
    email: 'joao@email.com',
    block: 'A',
    unit: '101',
    status: USER_STATUS.PRE_REGISTERED,
    termsAccepted: false,
    termsVersion: null,
    termsAcceptedAt: null
});

// Helper function to generate occurrence protocol
function generateProtocol() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const id = String(occurrenceCounter++).padStart(3, '0');
    
    return `${year}${month}${day}-${hour}${minute}${second}-${id}`;
}

// Helper function to send WhatsApp message
async function sendWhatsAppMessage(to, message) {
    // Use mock API in development
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://graph.facebook.com/${process.env.WABA_API_VERSION}`
        : process.env.MOCK_WHATSAPP_URL || `http://localhost:3001/${process.env.WABA_API_VERSION}`;
    try {
        
        await axios.post(
            `${baseUrl}/${process.env.PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                text: { body: message }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log(`Message sent to ${to}: ${message}`);
    } catch (error) {
        console.error(`[${baseUrl}] Error sending message to ${to}:`, error.response?.data || error.message);
    }
}

// Helper function to send WhatsApp message with buttons
async function sendWhatsAppInteractiveMessage(to, text, buttons) {
    // Use mock API in development
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://graph.facebook.com/${process.env.WABA_API_VERSION}`
        : process.env.MOCK_WHATSAPP_URL || `http://localhost:3001/${process.env.WABA_API_VERSION}`;
    try {
        
        await axios.post(
            `${baseUrl}/${process.env.PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                type: "interactive",
                interactive: {
                    type: "button",
                    body: { text: text },
                    action: {
                        buttons: buttons
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log(`Interactive message sent to ${to}`);
    } catch (error) {
        console.error(`[${baseUrl}] Error sending interactive message to ${to}:`, error.response?.data || error.message);
    }
}

// Helper function to send WhatsApp list message
async function sendWhatsAppListMessage(to, text, buttonText, sections, header = null, footer = null) {
    // Use mock API in development
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://graph.facebook.com/${process.env.WABA_API_VERSION}`
        : process.env.MOCK_WHATSAPP_URL || `http://localhost:3001/${process.env.WABA_API_VERSION}`;
    
    try {
        const interactive = {
            type: "list",
            body: { text: text },
            action: {
                button: buttonText,
                sections: sections
            }
        };

        if (header) {
            interactive.header = { type: "text", text: header };
        }

        if (footer) {
            interactive.footer = { text: footer };
        }
        
        await axios.post(
            `${baseUrl}/${process.env.PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                type: "interactive",
                interactive: interactive
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log(`List message sent to ${to}`);
    } catch (error) {
        console.error(`[${baseUrl}] Error sending list message to ${to}:`, error.response?.data || error.message);
    }
}

// Snippet A: Emergency Alert
const EMERGENCY_ALERT = `⚠️ **ATENÇÃO: EM CASO DE EMERGÊNCIA, NÃO USE ESTE CANAL.**
Para situações como vazamentos de gás, incêndios, problemas graves de segurança ou emergências médicas, LIGUE IMEDIATAMENTE para [Número de Emergência do Condomínio].
* * *`;

// Snippet B: App Download Invitation
const APP_INVITATION = `✨ DICA: Quer uma experiência completa? Baixe o app da **Zind**!
Pelo aplicativo, além das ocorrências, você pode reservar áreas comuns, ver os avisos do síndico e muito mais.
📲 Baixe agora:
• Android: [Link para a Google Play Store]
• iPhone: [Link para a Apple App Store]`;

// Get or create state machine for user
function getOrCreateStateMachine(phone) {
    if (!userStateMachines.has(phone)) {
        // interpret() deprecated
        const service = createActor(conversationMachine);
        
        service.start();
        userStateMachines.set(phone, service);
    }
    return userStateMachines.get(phone);
}

// Get current state for user
function getCurrentState(phone) {
    const service = getOrCreateStateMachine(phone);
    return service.getSnapshot().value;
}

// Send event to state machine
function sendEvent(phone, name, data = null) {
    const actor = getOrCreateStateMachine(phone);
    let event = { type: name };
    if (data) {
        event.data = data;
    }
    actor.send(event);
    
    console.log(`-> Event sent to ${phone}: ${name}`, data);
    return actor.getSnapshot().value;
}

// Clear state machine for user
function clearStateMachine(phone) {
    const service = userStateMachines.get(phone);
    if (service) {
        service.stop();
        userStateMachines.delete(phone);
    }
}

// Get context data from state machine
function getContextData(phone) {
    const service = getOrCreateStateMachine(phone);
    return service.getSnapshot().context;
}

// Check if user needs to accept terms
function needsTermsAcceptance(user) {
    return !user || !user.termsAccepted;
}

function waitingRegistration(currentState) {
    return currentState === 'waitingName' || currentState === 'waitingEmail' ||
           currentState === 'waitingBlock' || currentState === 'waitingUnit';
}

// Handle terms acceptance flow
async function handleTermsAcceptance(phone, message) {
    const user = users.get(phone) || {};
    const currentState = getCurrentState(phone);

    console.log(`Handling terms acceptance for ${phone}, current state: ${currentState}, message: ${message}`);
    
    if (currentState === 'checkingTerms') {
        // First interaction - show terms
        const welcomeMessage = `Olá${user.name ? `, ${user.name}` : ''}! Sou a assistente virtual do Condomínio [Nome do Condomínio]. Que bom te ver por aqui! Para começarmos e garantirmos a transparência e a segurança das suas informações, você precisa ler e aceitar nossos Termos de Uso e nossa Política de Privacidade.

Você pode consultá-los aqui:
🔗 Termos de Uso: (link)
🔒 Política de Privacidade: (link)

Ao aceitar, você também declara ser maior de 18 anos. Para confirmar e ativar seu acesso, por favor.`;

        await sendWhatsAppInteractiveMessage(phone, welcomeMessage, [
            { type: "reply", reply: { id: "accept_terms", title: "Aceito" } },
            { type: "reply", reply: { id: "reject_terms", title: "Não aceito" } }
        ]);
        
        sendEvent(phone, 'TERMS_NEEDED');
        return;
    }

    // Handle terms response
    if (message === "accept_terms") {
        // Accept terms
        if (!user.phone) {
            console.log(`Creating new user for phone ${phone}`);
            user.phone = phone;
            users.set(phone, user);
        }

        user.status = USER_STATUS.REGISTRATION_PENDING;
        user.termsAccepted = true;
        user.termsAcceptedAt = new Date();
        user.termsVersion = "1.0";
        
        await sendWhatsAppMessage(phone, "Ótimo, obrigado por confirmar!\nSeus termos foram aceitos com sucesso. ✅");
        
        sendEvent(phone, 'ACCEPT_TERMS');
        
        // Check if user is pre-registered or new
        if (user && user.status === USER_STATUS.PRE_REGISTERED) {
            sendEvent(phone, 'PRE_REGISTERED');
            await handlePreRegisteredUser(phone);
        } else if (user && user.status === USER_STATUS.APPROVED) {
            sendEvent(phone, 'APPROVED');
            await showMainMenu(phone);
        } else {
            sendEvent(phone, 'NEW_USER', user);
            await handleNewUserRegistration(phone);
        }
    } else if (message === "reject_terms" ) {
        // Reject terms
        const rejectMessage = `Entendido.
Para garantir a segurança de todos e a conformidade com a Lei Geral de Proteção de Dados (LGPD), o aceite dos termos é um passo necessário para podermos processar suas solicitações por este canal.
Como os termos não foram aceitos, não posso dar continuidade ao seu atendimento.
Se você mudar de ideia no futuro, basta me enviar um "Olá" novamente para recomeçar o processo. Tenha um ótimo dia!`;
        
        await sendWhatsAppMessage(phone, rejectMessage);
        sendEvent(phone, 'REJECT_TERMS');
        clearStateMachine(phone);
    } else {
        // Invalid response
        await sendWhatsAppMessage(phone, `[${message}] Desculpe, não entendi sua resposta. Por favor, responda com 'Aceito' ou 'Não aceito' para continuar.`);
        return;
    }
}

// Handle pre-registered user confirmation
async function handlePreRegisteredUser(phone) {
    const user = users.get(phone);
    console.log(`Handling pre-registered user confirmation for ${phone}`, user);

    const confirmationMessage = `Olá!
Identifiquei que a administração do Condomínio [Nome do Condomínio] iniciou seu cadastro em nosso canal de ocorrências. Seja bem-vindo(a)!

Para ativarmos seu acesso, por favor, confirme se os dados abaixo estão corretos:
• Nome: ${user.name}
• E-mail: ${user.email}
• Bloco ${user.block}
• Unidade: ${user.unit}

As informações estão corretas?`;

    await sendWhatsAppInteractiveMessage(phone, confirmationMessage, [
        { type: "reply", reply: { id: "data_correct", title: "1️⃣ Sim, estão corretas" } },
        { type: "reply", reply: { id: "data_incorrect", title: "2️⃣ Não, quero corrigir" } }
    ]);
}

// Handle new user registration
async function handleNewUserRegistration(phone) {
    console.log(`Handling new user registration for ${phone}`);

    const welcomeMessage = `Olá! Bem-vindo(a) ao canal oficial do Condomínio [Nome do Condomínio].

${EMERGENCY_ALERT}

Vejo que este é seu primeiro acesso. Para solicitar seu cadastro, preciso de algumas informações. Primeiro, seu Nome Completo, por favor.`;

    await sendWhatsAppMessage(phone, welcomeMessage);
}

// Handle registration flow
async function handleRegistrationFlow(phone, message) {
    const currentState = getCurrentState(phone);
    const context = getContextData(phone);
    const user = users.get(phone) || {};

    console.log(`Handling registration flow for ${phone}, current state: ${currentState}, message: ${message}`, context);
    
    switch (currentState) {
        case 'waitingName':
            sendEvent(phone, 'PROVIDE_NAME', message);
            user.name = message;

            await sendWhatsAppMessage(phone, `Obrigado, ${message}. Agora, seu melhor e-mail.`);
            break;
            
        case 'waitingEmail':
            sendEvent(phone, 'PROVIDE_EMAIL', message);
            user.email = message;

            await sendWhatsAppMessage(phone, "Perfeito. Agora, vamos à sua unidade. Por favor, informe o bloco. (Ex: A, B, Villa, etc.)");
            break;
            
        case 'waitingBlock':
            sendEvent(phone, 'PROVIDE_BLOCK', message);
            user.block = message;

            await sendWhatsAppMessage(phone, "Ótimo. Agora, por favor, digite o número do seu apartamento ou casa ou unidade (Ex: 502, 104, etc.)");
            break;
            
        case 'waitingUnit':
            sendEvent(phone, 'PROVIDE_UNIT', message);
            user.unit = message;

            const confirmationMessage = `Ótimo. Só para confirmar as informações:
• Nome: ${user.name}
• E-mail: ${user.email}
• Bloco: ${user.block}
• Unidade ${user.unit}

Está tudo correto?`;

            await sendWhatsAppInteractiveMessage(phone, confirmationMessage, [
                { type: "reply", reply: { id: "confirm_registration", title: "Confirmar" } },
                { type: "reply", reply: { id: "edit_data", title: "Refazer" } }
            ]);
            break;
    }
}

// Handle main menu
async function showMainMenu(phone) {
    const menuMessage = `Como posso ajudar hoje?`;
    
    await sendWhatsAppInteractiveMessage(phone, menuMessage, [
        { type: "reply", reply: { id: "new_occurrence", title: "1️⃣ 🆕 Registrar Nova Ocorrência" } },
        { type: "reply", reply: { id: "view_occurrences", title: "2️⃣ 🔎 Consultar Minhas Ocorrências" } }
    ]);
}

// Handle occurrence registration
async function handleOccurrenceRegistration(phone, message, messageType = 'text') {
    const currentState = getCurrentState(phone);
    const context = getContextData(phone);

    console.log(`Handling occurrence registration for ${phone}, current state: ${currentState}, message: ${message}`);

    if (currentState === 'mainMenu' && message === "new_occurrence") {
        await sendWhatsAppMessage(phone, "Entendido. Para iniciar o registro, por favor, descreva em detalhes o que aconteceu. Tente incluir o local exato, se possível.\n\n*Ex: O elevador social do Bloco A não está funcionando.*");
        context.occurrenceData = {};
        sendEvent(phone, 'START_OCCURRENCE', context.occurrenceData);
    } else if (currentState === 'waitingOccurrenceDescription') {
        sendEvent(phone, 'PROVIDE_DESCRIPTION', message);
        
        const mediaMessage = `Ótimo, obrigado pela descrição. Se tiver uma foto, vídeo, áudio, documento ou contato que ajude a ilustrar o problema, pode me enviar agora. Caso não tenha, é só selecionar "não tenho".`;
        
        await sendWhatsAppInteractiveMessage(phone, mediaMessage, [
            { type: "reply", reply: { id: "no_media", title: "Não tenho" } }
        ]);
    } else if (currentState === 'waitingOccurrenceMedia') {
        let mediaUrl = null;
        
        if ((messageType === 'image' || messageType === 'video' || messageType === 'document' || messageType === 'audio' || messageType === 'contacts') && message !== "no_media") {
            mediaUrl = message; // In real implementation, this would be the media URL
            const mediaTypeText = messageType === 'image' ? 'imagem' : 
                                 messageType === 'video' ? 'vídeo' : 
                                 messageType === 'audio' ? 'áudio' : 
                                 messageType === 'contacts' ? 'contato' : 'arquivo';
            await sendWhatsAppMessage(phone, `Perfeito, ${mediaTypeText} recebido!`);
            sendEvent(phone, 'PROVIDE_MEDIA', mediaUrl);
        } else if (message === "no_media") {
            sendEvent(phone, 'NO_MEDIA');
        } else {
            // If it's a text message while waiting for media, treat it as "no media" and use the text as additional description
            await sendWhatsAppMessage(phone, "Entendi. Informação adicional registrada.");
            sendEvent(phone, 'NO_MEDIA', message);
        }
        
        // Create occurrence
        const protocol = generateProtocol();
        const user = users.get(phone);
        console.log(`Creating occurrence for user ${phone} with protocol ${protocol}`, user);
        const context = getContextData(phone);
        const occurrence = {
            protocol,
            description: context.occurrenceData.description,
            mediaUrl: context.occurrenceData.mediaUrl,
            status: OCCURRENCE_STATUS.IN_PROGRESS,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: phone,
            userName: user.name,
            comments: []
        };
        
        occurrences.set(protocol, occurrence);
        
        const successMessage = `Sua ocorrência foi registrada com sucesso. A equipe de gestão já foi acionada.

✅ #${protocol}

**Você será notificado por aqui sobre cada andamento.**

${APP_INVITATION}`;
        
        await sendWhatsAppMessage(phone, successMessage);
        
        // Return to main menu
        setTimeout(() => showMainMenu(phone), 2000);
    } else {
        console.log(`!!! ${currentState} - Unhandled state in occurrence registration for ${phone}:`, message);
    }
}

// Handle occurrence viewing
async function handleOccurrenceViewing(phone) {
    const userOccurrences = Array.from(occurrences.values()).filter(occ => occ.userId === phone);
    console.log(`Handling occurrence viewing for ${phone}, found ${userOccurrences.length} occurrences`);
    
    if (userOccurrences.length === 0) {
        await sendWhatsAppMessage(phone, "Boas notícias! Verifiquei aqui e você não possui nenhuma ocorrência em aberto no momento. 😊");
        setTimeout(() => showMainMenu(phone), 2000);
        return;
    }
    
    let message = "Verifiquei aqui e você possui as seguintes ocorrências:\n\n";
    
    userOccurrences.forEach((occ, index) => {
        const statusEmoji = occ.status === OCCURRENCE_STATUS.IN_PROGRESS ? '⚙️' : 
                           occ.status === OCCURRENCE_STATUS.WAITING_RESPONSE ? '❓' : 
                           occ.status === OCCURRENCE_STATUS.RESOLVED ? '✅' : '❌';
        
        const statusText = occ.status === OCCURRENCE_STATUS.IN_PROGRESS ? 'EM ANDAMENTO' :
                          occ.status === OCCURRENCE_STATUS.WAITING_RESPONSE ? 'AGUARDANDO RESPOSTA' :
                          occ.status === OCCURRENCE_STATUS.RESOLVED ? 'RESOLVIDA' : 'CANCELADA';
        
        message += `${statusEmoji} **${statusText}**\n`;
        message += `**Protocolo: #${occ.protocol}**\n`;
        message += `**Data de Abertura:** ${occ.createdAt.toLocaleDateString('pt-BR')} ${occ.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
        message += `**Última Atualização:** ${occ.updatedAt.toLocaleDateString('pt-BR')} ${occ.updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`;
        message += `**Descrição:** ${occ.description.substring(0, 50)}${occ.description.length > 50 ? '...' : ''}\n`;
        
        if (occ.comments.length > 0) {
            message += "**Comentários**\n";
            occ.comments.forEach(comment => {
                message += `**${comment.date}:** ${comment.author}: ${comment.text}\n`;
            });
        }
        
        if (index < userOccurrences.length - 1) {
            message += "\n---\n\n";
        }
    });
    
    message += "\n\nSe desejar registrar uma nova ocorrência, digite 1.";
    
    await sendWhatsAppMessage(phone, message);
    sendEvent(phone, 'VIEW_OCCURRENCES');
    
    setTimeout(() => {
        sendEvent(phone, 'BACK_TO_MENU');
        showMainMenu(phone);
    }, 3000);
}

// Verification endpoint (GET)
app.get("/webhook", (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified");
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Main message processing function
async function processMessage(phone, message, messageType = 'text') {
    const user = users.get(phone);
    const currentState = getCurrentState(phone);
    const context = getContextData(phone);
    if (user) {
        context.userData = user;
    }
    
    console.log('----------------------------------------------------------------');
    console.log(`Processing message from ${phone}: ${message} (type: ${messageType})`);
    console.log(`User status: ${user ? user.status : 'not found'}, Terms accepted: ${user ? user.termsAccepted : false}`);
    console.log(`Current XState: ${currentState}`);
    
    // Check if user needs to accept terms first
    if (needsTermsAcceptance(user)) {
        await handleTermsAcceptance(phone, message);
        return;
    }
    
    console.log('// Check if user is approved', user);
    if (!waitingRegistration(currentState) && currentState !== 'waitingDataConfirmation' && user && user.status !== USER_STATUS.APPROVED) {
        console.log(`waiting registration approval. user status: ${user.status}`, user);
        if (user.status === USER_STATUS.REGISTRATION_PENDING) {
            await sendWhatsAppMessage(phone, "Sua solicitação de cadastro está sendo analisada pela administração. Você receberá uma notificação assim que for aprovada. Obrigado pela paciência!");
            sendEvent(phone, 'PENDING');
        } else if (user.status === USER_STATUS.REJECTED) {
            await sendWhatsAppMessage(phone, "Sua solicitação de cadastro foi rejeitada pela administração. Por favor, entre em contato diretamente com a administração para esclarecer a situação.");
            sendEvent(phone, 'REJECTED');
        } else {
            console.log(`User ${phone} is ${user.status} (unhandled). Current state: ${currentState}`);
        }
        return;
    }
    
    console.log('// Handle conversation flows based on current state', currentState);
    if (currentState === 'checkingUserStatus') {
        // User is approved and no active conversation - show main menu
        sendEvent(phone, 'APPROVED');
        await showMainMenu(phone);
        return;
    }
    
    switch (currentState) {
        case 'waitingDataConfirmation':
            if (message === "data_correct" || message === "sim, estão corretas") {
                // Data confirmed - approve user
                user.status = USER_STATUS.APPROVED;
                sendEvent(phone, 'CONFIRM_DATA');
                await showMainMenu(phone);
            } else if (message === "edit_data" || message === "não, quero corrigir") {
                // User wants to edit data - start registration flow
                sendEvent(phone, 'EDIT_DATA');
                await handleNewUserRegistration(phone);
            } else if (message === "confirm_registration") {
                // New user registration confirmed
                const user = context.userData;
                user.status = USER_STATUS.APPROVAL_PENDING;
                
                // Create new user with pending status
                console.log(`Creating new user with phone: ${phone}, data:`, user);
                users.set(phone, user);
                
                await sendWhatsAppMessage(phone, "Perfeito! ✅\nSua solicitação de cadastro foi enviada com sucesso para a administração do condomínio. Você receberá uma nova mensagem por aqui assim que seu acesso for aprovado. Geralmente, isso leva algumas horas. Agradecemos a sua paciência!");
                sendEvent(phone, 'SUBMIT_REGISTRATION');
            } else {
                console.log(`User ${phone} (waitingDataConfirmation) - unhandled message: ${message}`);
            }
            break;
            
        case 'waitingName':
        case 'waitingEmail':
        case 'waitingBlock':
        case 'waitingUnit':
            await handleRegistrationFlow(phone, message);
            break;
            
        case 'mainMenu':
            if (message === "new_occurrence" || message === "1") {
                await handleOccurrenceRegistration(phone, message);
            } else if (message === "view_occurrences" || message === "2") {
                await handleOccurrenceViewing(phone);
            } else {
                await sendWhatsAppMessage(phone, "Desculpe, não entendi essa opção. Por favor, escolha um dos itens do menu digitando o número correspondente.");
                setTimeout(() => showMainMenu(phone), 2000);
            }
            break;
            
        case 'waitingOccurrenceDescription':
        case 'waitingOccurrenceMedia':
            await handleOccurrenceRegistration(phone, message, messageType);
            break;
            
        case 'waitingFeedback':
            // Handle feedback response
            const feedbackMap = {
                "1": "Excelente",
                "2": "Bom", 
                "3": "Regular",
                "4": "Ruim",
                "5": "Péssimo",
                "feedback_excellent": "Excelente",
                "feedback_good": "Bom",
                "feedback_regular": "Regular", 
                "feedback_bad": "Ruim",
                "feedback_terrible": "Péssimo"
            };
            
            const feedbackValue = feedbackMap[message];
            if (feedbackValue) {
                await sendWhatsAppMessage(phone, `Muito obrigado pelo seu feedback: ${feedbackValue}!\n\nSe desejar fazer um comentário adicional, pode enviá-lo agora. Caso contrário, digite "menu" para voltar ao menu principal.`);
                sendEvent(phone, 'PROVIDE_FEEDBACK', feedbackValue);
            }
            break;
            
        case 'waitingFeedbackComment':
            if (message.toLowerCase() === "menu") {
                await sendWhatsAppMessage(phone, "Obrigado pelo seu tempo!");
                sendEvent(phone, 'SKIP_COMMENT');
                setTimeout(() => showMainMenu(phone), 1000);
            } else {
                await sendWhatsAppMessage(phone, "Muito obrigado pelo seu comentário!\n\nSeu feedback é muito importante para nós.");
                sendEvent(phone, 'PROVIDE_COMMENT', message);
                setTimeout(() => showMainMenu(phone), 2000);
            }
            break;
            
        default:
            // Handle error/unknown commands for approved users
            await sendWhatsAppMessage(phone, `Desculpe, não entendi essa opção. Por favor, escolha um dos itens do menu digitando o número correspondente.`);

            // // Unknown state - reset to main menu for approved users
            // if (user && user.status === USER_STATUS.APPROVED) {
            //     sendEvent(phone, 'APPROVED');
            //     await showMainMenu(phone);
            // }
            break;
    }
}

// Message handler (POST)
app.post("/webhook", async (req, res) => {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    console.log("Received webhook event:", JSON.stringify(req.body, null, 2));

    if (message) {
        const from = message.from;
        let msgBody = null;
        let messageType = 'text';
        
        // Handle different message types
        if (message.text) {
            msgBody = message.text.body;
            messageType = 'text';
        } else if (message.image) {
            msgBody = message.image.caption || 'Image';
            messageType = 'image';
            console.log(`Received image from ${from}: ${message.image.id}`);
        } else if (message.video) {
            msgBody = message.video.caption || 'Video';
            messageType = 'video';
            console.log(`Received video from ${from}: ${message.video.id}`);
        } else if (message.document) {
            msgBody = message.document.caption || message.document.filename || 'Document';
            messageType = 'document';
            console.log(`Received document from ${from}: ${message.document.id}`);
        } else if (message.audio) {
            msgBody = 'Audio message';
            messageType = 'audio';
            console.log(`Received audio from ${from}: ${message.audio.id}`);
        } else if (message.contacts) {
            msgBody = `Contact: ${message.contacts[0]?.name?.formatted_name || 'Unknown'}`;
            messageType = 'contacts';
            console.log(`Received contact from ${from}: ${message.contacts[0]?.name?.formatted_name}`);
        } else if (message.image) {
            msgBody = message.image.id; // In real implementation, download and process the image
            messageType = 'image';
        } else if (message.interactive) {
            // Handle button responses
            if (message.interactive.button_reply) {
                const buttonId = message.interactive.button_reply.id;
                msgBody = buttonId;
            } else if (message.interactive.list_reply) {
                const listRowId = message.interactive.list_reply.id;
                msgBody = listRowId;
            } else {
                console.log(`!!! Unhandled interactive message from ${from}:`, message.interactive);
            }
        } else {
            console.log(`!!! Unhandled message type from ${from}:`, message);
        }

        if (msgBody) {
            console.log(`Received message: ${msgBody} from ${from} (type: ${messageType})`);
            await processMessage(from, msgBody, messageType);
        }
    }

    res.sendStatus(200);
});

// Session cleanup - remove inactive sessions every 30 minutes
setInterval(() => {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    for (const [phone, service] of userStateMachines.entries()) {
        // Check if service is still running and get last activity
        if (service.getSnapshot) {
            const snapshot = service.getSnapshot();
            // In a real implementation, you'd track lastActivity in context
            // For now, we'll clean up machines that are in final states
            if (snapshot.done || snapshot.value === 'termsRejected' || snapshot.value === 'registrationRejected') {
                console.log(`Cleaning up completed session for ${phone}`);
                service.stop();
                userStateMachines.delete(phone);
            }
        }
    }
}, 30 * 60 * 1000); // Run every 30 minutes

// API endpoints for external systems to trigger notifications
app.post("/api/users/approve", async (req, res) => {
    const { phone } = req.body;
    const user = users.get(phone);
    
    if (user) {
        user.status = USER_STATUS.APPROVED;
        
        const approvalMessage = `Ótimas notícias, ${user.name}!

🎉 Seu cadastro para a unidade ${user.block} ${user.unit} foi APROVADO pela administração.

A partir de agora, você já pode registrar e acompanhar ocorrências por aqui.

Seja muito bem-vindo(a)!

Como posso ajudar hoje?`;

        await sendWhatsAppInteractiveMessage(phone, approvalMessage, [
            { type: "reply", reply: { id: "new_occurrence", title: "1️⃣ 🆕 Nova Ocorrência" } },
            { type: "reply", reply: { id: "view_occurrences", title: "2️⃣ 🔎 Ver Ocorrências" } }
        ]);
        
        // Send approval event to state machine
        sendEvent(phone, 'APPROVE_USER', user);
        
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

app.post("/api/users/reject", async (req, res) => {
    const { phone } = req.body;
    const user = users.get(phone);
    
    if (user) {
        user.status = USER_STATUS.REJECTED;
        
        const rejectionMessage = `Olá, ${user.name}.

A administração analisou sua solicitação de cadastro para a unidade ${user.block} ${user.unit} e não pôde aprová-la no momento.

Por favor, entre em contato diretamente com a administração para esclarecer a situação.`;

        await sendWhatsAppMessage(phone, rejectionMessage);
        
        // Send rejection event to state machine
        sendEvent(phone, 'REJECT_USER');
        
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

app.post("/api/occurrences/update", async (req, res) => {
    const { protocol, status, comment } = req.body;
    const occurrence = occurrences.get(protocol);
    
    if (occurrence) {
        occurrence.status = status;
        occurrence.updatedAt = new Date();
        
        if (comment) {
            occurrence.comments.push({
                date: new Date().toLocaleDateString('pt-BR'),
                author: "Gestão",
                text: comment
            });
        }
        
        const user = users.get(occurrence.userId);
        let statusText = status === OCCURRENCE_STATUS.RESOLVED ? "✅ RESOLVIDA" :
                        status === OCCURRENCE_STATUS.IN_PROGRESS ? "⚙️ EM ANDAMENTO" :
                        status === OCCURRENCE_STATUS.WAITING_RESPONSE ? "❓ AGUARDANDO RESPOSTA" :
                        "❌ CANCELADA";
        
        const updateMessage = `Olá, ${user.name}.

Tenho uma atualização sobre sua ocorrência! Referente a:

**Protocolo: #${protocol}**
"${occurrence.description.substring(0, 50)}${occurrence.description.length > 50 ? '...' : ''}"

**Novo Status:** ${statusText}

${comment ? `**Comentário da gestão:** "${comment}"` : ''}`;

        await sendWhatsAppMessage(occurrence.userId, updateMessage);
        
        // If resolved, ask for feedback
        if (status === OCCURRENCE_STATUS.RESOLVED) {
            setTimeout(async () => {
                const feedbackMessage = `Sua ocorrência [Protocolo: #${protocol}] foi resolvida!

Gostaríamos de saber sua opinião:`;

                await sendWhatsAppInteractiveMessage(occurrence.userId, feedbackMessage, [
                    { type: "reply", reply: { id: "feedback_excellent", title: "1️⃣ Excelente" } },
                    { type: "reply", reply: { id: "feedback_good", title: "2️⃣ Bom" } },
                    { type: "reply", reply: { id: "feedback_regular", title: "3️⃣ Regular" } },
                    { type: "reply", reply: { id: "feedback_bad", title: "4️⃣ Ruim" } },
                    { type: "reply", reply: { id: "feedback_terrible", title: "5️⃣ Péssimo" } }
                ]);
                
                // Transition to feedback state
                const service = getOrCreateStateMachine(occurrence.userId);
                service.send({ type: 'OCCURRENCE_RESOLVED', data: { protocol } });
            }, 2000);
        }
        
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Occurrence not found" });
    }
});

// Testing endpoints
app.get("/api/users", (req, res) => {
    const userList = Array.from(users.entries()).map(([phone, user]) => ({
        phone,
        ...user
    }));
    res.json(userList);
});

// Test list message endpoint
app.post("/api/test-list", async (req, res) => {
    const { phone } = req.body;
    
    if (!phone) {
        return res.status(400).json({ error: "Phone number required" });
    }

    // Example list message
    const sections = [
        {
            title: "Main Options",
            rows: [
                {
                    id: "new_occurrence",
                    title: "🆕 Nova Ocorrência",
                    description: "Registrar uma nova ocorrência no condomínio"
                },
                {
                    id: "view_occurrences", 
                    title: "🔎 Ver Ocorrências",
                    description: "Consultar suas ocorrências registradas"
                }
            ]
        },
        {
            title: "Other Options",
            rows: [
                {
                    id: "contact_admin",
                    title: "📞 Contatar Administração",
                    description: "Falar diretamente com a administração"
                },
                {
                    id: "help",
                    title: "❓ Ajuda",
                    description: "Como usar este sistema"
                }
            ]
        }
    ];

    await sendWhatsAppListMessage(
        phone,
        "Escolha uma das opções abaixo:",
        "Ver opções",
        sections,
        "Menu Principal",
        "Selecione a opção desejada"
    );

    res.json({ success: true, message: "List message sent" });
});

app.get("/api/occurrences", (req, res) => {
    const occurrenceList = Array.from(occurrences.entries()).map(([protocol, occurrence]) => ({
        protocol,
        ...occurrence
    }));
    res.json(occurrenceList);
});

app.get("/api/conversations", (req, res) => {
    const conversationList = Array.from(userStateMachines.entries()).map(([phone, service]) => {
        const snapshot = service.getSnapshot();
        return {
            phone,
            currentState: snapshot.value,
            context: snapshot.context,
            done: snapshot.done
        };
    });
    res.json(conversationList);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log("WhatsApp Bot with XState is ready to receive messages!");
    console.log(`\nAPI Endpoints available:`);
    console.log(`POST /api/users/approve - Approve user registration`);
    console.log(`POST /api/users/reject - Reject user registration`);
    console.log(`POST /api/occurrences/update - Update occurrence status`);
    console.log(`GET /api/users - List all users`);
    console.log(`GET /api/occurrences - List all occurrences`);
    console.log(`GET /api/conversations - List active XState machines`);
});
