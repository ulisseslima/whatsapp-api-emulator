// Test script for template with buttons
const axios = require('axios');

const mockApiUrl = 'http://localhost:3001/v18.0/mock_phone_id/messages';

// Test template message with buttons
const templatePayload = {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "5541991339702",
    "type": "template",
    "template": {
        "name": "menu_principal",
        "language": {
            "code": "pt_BR"
        },
        "components": [
            {
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "parameter_name": "condominio_nome",
                        "text": "Residencial Vista Bela"
                    }
                ]
            }
        ]
    }
};

console.log('=== Testing Template with Buttons ===\n');
console.log('Sending template payload:');
console.log(JSON.stringify(templatePayload, null, 2));

axios.post(mockApiUrl, templatePayload)
    .then(response => {
        console.log('\n✅ Template sent successfully!');
        console.log('Response:', response.data);
    })
    .catch(error => {
        console.error('\n❌ Error sending template:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    });