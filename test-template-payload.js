// Test script for Facebook-style template with payload support
const axios = require('axios');

// Test Facebook-style template message with button payload
async function testFacebookTemplateWithPayload() {
    console.log('=== Testing Facebook Template Format with Payload ===\n');
    
    const facebookTemplatePayload = {
        "to": "5541991339702",
        "recipient_type": "individual",
        "type": "template",
        "template": {
            "name": "menu_principal",
            "language": {
                "code": "pt_BR",
                "policy": "deterministic"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": "Residencial Vista Bela"
                        }
                    ]
                },
                {
                    "type": "button",
                    "sub_type": "quick_reply",
                    "index": 0,
                    "parameters": [
                        {
                            "type": "payload",
                            "payload": "view_my_occurrences_payload"
                        }
                    ]
                },
                {
                    "type": "button",
                    "sub_type": "quick_reply", 
                    "index": 1,
                    "parameters": [
                        {
                            "type": "payload",
                            "payload": "new_occurrence_payload"
                        }
                    ]
                },
                {
                    "type": "button",
                    "sub_type": "quick_reply",
                    "index": 2, 
                    "parameters": [
                        {
                            "type": "payload",
                            "payload": "change_unit_payload"
                        }
                    ]
                }
            ]
        }
    };
    
    console.log('Sending Facebook-style template payload:');
    console.log(JSON.stringify(facebookTemplatePayload, null, 2));
    console.log('\n');
    
    try {
        const response = await axios.post('http://localhost:3001/v18.0/mock_phone_id/messages', facebookTemplatePayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Template sent successfully!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error sending template:', error.response?.data || error.message);
    }
}

// Test traditional template format (current format)
async function testTraditionalTemplate() {
    console.log('\n=== Testing Traditional Template Format ===\n');
    
    const traditionalPayload = {
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
    
    console.log('Sending traditional template payload:');
    console.log(JSON.stringify(traditionalPayload, null, 2));
    console.log('\n');
    
    try {
        const response = await axios.post('http://localhost:3001/v18.0/mock_phone_id/messages', traditionalPayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Template sent successfully!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error sending template:', error.response?.data || error.message);
    }
}

// Run tests
async function runTests() {
    await testFacebookTemplateWithPayload();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await testTraditionalTemplate();
}

runTests();