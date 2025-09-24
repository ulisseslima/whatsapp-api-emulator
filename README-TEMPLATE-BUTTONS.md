# WhatsApp Template Messages with Buttons - Implementation Guide

## Overview

This implementation adds support for WhatsApp template messages with interactive buttons to the mock WhatsApp server. The functionality includes:

1. **Template Repository**: JSON files storing template definitions with button components
2. **Server Processing**: Automatic conversion of button templates to WhatsApp interactive messages
3. **Web Interface**: Enhanced UI for testing and previewing templates with buttons

## Template Structure

Templates with buttons follow the Facebook WhatsApp Business API format:

```json
{
  "name": "menu_principal",
  "category": "UTILITY",
  "language": "pt_BR",
  "parameter_format": "NAMED",
  "components": [
    {
      "type": "BODY",
      "text": "🏠 *{{condominio_nome}}*\n\nComo posso ajudar hoje?",
      "example": {
        "body_text_named_params": [
          [
            {
              "param_name": "condominio_nome",
              "example": "Residencial Vista Bela"
            }
          ]
        ]
      }
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {
          "type": "QUICK_REPLY",
          "text": "📋 Minhas Ocorrências"
        },
        {
          "type": "QUICK_REPLY",
          "text": "➕ Nova Ocorrência"
        },
        {
          "type": "QUICK_REPLY",
          "text": "🏢 Trocar Unidade"
        }
      ]
    }
  ]
}
```

## How It Works

### 1. Template Processing

When a template message is received:

```javascript
// Input: Template message request
{
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
}
```

The server:
1. Loads the template from `template-repository/menu_principal.json`
2. Processes parameter substitution (`{{condominio_nome}}` → `"Residencial Vista Bela"`)
3. Converts BUTTONS component to WhatsApp interactive format
4. Creates the appropriate message structure

### 2. Interactive Message Conversion

Button templates are automatically converted to WhatsApp interactive button messages:

```javascript
// Output: WhatsApp Interactive Message
{
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": {
      "text": "🏠 *Residencial Vista Bela*\n\nComo posso ajudar hoje?"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "btn_0",
            "title": "📋 Minhas Ocorrências"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "btn_1", 
            "title": "➕ Nova Ocorrência"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "btn_2",
            "title": "🏢 Trocar Unidade"
          }
        }
      ]
    }
  }
}
```

### 3. Web Interface Features

The web interface now includes:

- **Template Selection**: Dropdown showing available templates with button indicators (🔘)
- **Template Preview**: Shows template text and lists available buttons
- **Parameter Input**: Dynamic form fields for template parameters
- **Button Display**: Renders interactive buttons in the chat interface
- **Template Info**: Visual indicators for template messages

## API Endpoints

### GET `/api/templates`
Returns list of available templates with button information:

```json
[
  {
    "filename": "menu_principal.json",
    "name": "menu_principal",
    "language": "pt_BR",
    "category": "UTILITY",
    "status": "APPROVED",
    "hasButtons": true,
    "components": [
      {
        "type": "BODY",
        "parameters": [...]
      },
      {
        "type": "BUTTONS",
        "buttons": [...]
      }
    ]
  }
]
```

### POST `/api/send-template-message`
Sends a template message with parameters:

```json
{
  "to": "5541991339702",
  "templateName": "menu_principal",
  "parameters": [
    {
      "name": "condominio_nome",
      "value": "Residencial Vista Bela"
    }
  ]
}
```

## Template Examples

### 1. Simple Button Menu
```json
{
  "name": "menu_principal",
  "components": [
    {
      "type": "BODY",
      "text": "🏠 *{{condominio_nome}}*\n\nComo posso ajudar hoje?"
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {"type": "QUICK_REPLY", "text": "📋 Minhas Ocorrências"},
        {"type": "QUICK_REPLY", "text": "➕ Nova Ocorrência"},
        {"type": "QUICK_REPLY", "text": "🏢 Trocar Unidade"}
      ]
    }
  ]
}
```

### 2. Appointment Confirmation
```json
{
  "name": "appointment_confirmation",
  "components": [
    {
      "type": "BODY",
      "text": "📅 Agendamento confirmado para {{date}} às {{time}}.\n\nDeseja fazer alguma alteração?"
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {"type": "QUICK_REPLY", "text": "✅ Confirmar"},
        {"type": "QUICK_REPLY", "text": "📝 Alterar"},
        {"type": "QUICK_REPLY", "text": "❌ Cancelar"}
      ]
    }
  ]
}
```

## Testing

To test template button functionality:

1. **Start the server**: `node mock-whatsapp.js`
2. **Open web interface**: `http://localhost:3001`
3. **Click "Send Template"** button
4. **Select a template** with buttons (indicated by 🔘)
5. **Fill parameters** if required
6. **Send the template** and see interactive buttons in chat

## Button Interaction

When users click on interactive buttons:
- Button responses are captured as regular WhatsApp button reply messages
- The `interactive.button_reply` field contains the selected button information
- Messages display the button title that was selected

This implementation provides a complete solution for testing WhatsApp template messages with interactive buttons in a development environment.