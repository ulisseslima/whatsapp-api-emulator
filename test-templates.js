// Test script for template functionality
const fs = require('fs');
const path = require('path');

// Function to load and process template (same as in mock-whatsapp.js)
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

// Test the templates
console.log('=== Testing Template Processing ===\n');

// Test 1: onboarding_novos_moradores
console.log('1. Testing onboarding_novos_moradores template:');
const result1 = loadAndProcessTemplate('onboarding_novos_moradores', [
    {
        type: 'text',
        parameter_name: 'nome_morador',
        text: 'Amir'
    }
]);

if (result1.success) {
    console.log('✅ Template processed successfully!');
    console.log('Original template name:', result1.templateData.name);
    console.log('Processed text:');
    console.log(result1.text);
} else {
    console.log('❌ Error:', result1.error);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 2: appointment_reminder
console.log('2. Testing appointment_reminder template:');
const result2 = loadAndProcessTemplate('appointment_reminder', [
    {
        type: 'text',
        parameter_name: 'client_name',
        text: 'João Silva'
    },
    {
        type: 'text',
        parameter_name: 'appointment_date',
        text: '15 de setembro'
    },
    {
        type: 'text',
        parameter_name: 'appointment_time',
        text: '14:30'
    },
    {
        type: 'text',
        parameter_name: 'location',
        text: 'Sala 201'
    }
]);

if (result2.success) {
    console.log('✅ Template processed successfully!');
    console.log('Original template name:', result2.templateData.name);
    console.log('Processed text:');
    console.log(result2.text);
} else {
    console.log('❌ Error:', result2.error);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 3: List available templates
console.log('3. Listing available templates:');
try {
    const templateDir = path.join(__dirname, 'template-repository');
    const templateFiles = fs.readdirSync(templateDir).filter(file => file.endsWith('.json'));
    
    console.log(`Found ${templateFiles.length} templates:`);
    templateFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file.replace('.json', '')}`);
    });
} catch (error) {
    console.log('❌ Error listing templates:', error.message);
}
