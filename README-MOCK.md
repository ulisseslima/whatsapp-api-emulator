# WhatsApp Bot Mock Interface

This project includes a mock WhatsApp interface for testing the bot locally without needing the actual WhatsApp Business API.

## Quick Start

1. Copy `.env.example` to `.env` and configure your environment variables
2. Install dependencies: `npm install`
3. Start both the bot and mock interface: `npm run dev:with-mock`

## Available Scripts

- `npm start` - Start the bot in production mode
- `npm run dev` - Start the bot in development mode with nodemon
- `npm run mock` - Start only the mock WhatsApp server
- `npm run mock:dev` - Start the mock server with nodemon
- `npm run dev:with-mock` - Start both the bot and mock server simultaneously

## Mock Interface

The mock interface runs on `http://localhost:3001` by default and provides:

1. **Mock WhatsApp API**: Endpoint at `/v18.0/{phoneNumberId}/messages` that mimics the real WhatsApp API
2. **Web Interface**: A WhatsApp-like chat interface where you can:
   - Enter a phone number
   - Send messages to the bot
   - See bot responses in real-time
   - Click interactive buttons
   - Clear the chat history

## How It Works

1. The mock server provides a WhatsApp-like API endpoint
2. Your bot sends messages to the mock API instead of the real WhatsApp API (when `NODE_ENV` is not `production`)
3. The web interface displays these messages and allows you to respond
4. User responses are sent as webhooks to your bot, just like real WhatsApp would do

## Environment Variables

```bash
# Set to development to use mock API
NODE_ENV=development

# Mock server configuration
MOCK_WHATSAPP_URL=http://localhost:3001/v18.0
MOCK_PORT=3001
BOT_WEBHOOK_URL=http://localhost:3000/webhook

# Your regular WhatsApp API config
PHONE_NUMBER_ID=your_phone_number_id
ACCESS_TOKEN=your_access_token
WABA_API_VERSION=v18.0
```

## Usage

1. Start the servers: `npm run dev:with-mock`
2. Open `http://localhost:3001` in your browser
3. Enter a phone number (e.g., `5511999999999`)
4. Click "Start Chat" or type a message and hit Enter
5. Interact with your bot through the web interface

The interface supports:
- Text messages
- Interactive buttons
- Real-time message updates
- Message timestamps
- WhatsApp-like styling
