const { Client, GatewayIntentBits, Partials } = require('discord.js');
console.log('Loading close command module...');
const { closeCommand } = require('./commands/close');
require('dotenv').config();

// Log process information and directory details
console.log(`Bot process started with PID: ${process.pid}`);
console.log('Current directory:', __dirname);
console.log('Current file:', __filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers  // Added for better user mention handling
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]  // Added User partial for DM handling
});

const PREFIX = '$';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Create a Set to store processed message IDs
const processedMessages = new Set();

client.on('messageCreate', async (message) => {
    // Ignore messages from bots and messages that don't start with prefix
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    // Check if we've already processed this message
    if (processedMessages.has(message.id)) {
        console.log(`Skipping duplicate message processing for ID: ${message.id}`);
        return;
    }

    // Add message ID to processed set
    processedMessages.add(message.id);
    console.log(`Processing message ID: ${message.id} on PID: ${process.pid}`);

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        if (command === 'close') {
            await closeCommand(message, args);
        }
    } catch (error) {
        console.error('Error executing command:', error);
        await message.reply('An error occurred while executing the command.');
    }

    // Remove the message ID from processed set after 1 minute
    setTimeout(() => {
        processedMessages.delete(message.id);
    }, 60000);
});

// Error handling for the client
client.on('error', error => {
    console.error('Discord client error:', error);
});

// Login with token from environment variables
client.login(process.env.DISCORD_TOKEN);
