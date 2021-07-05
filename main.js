require('dotenv').config();

const fs = require('fs');
const config = require('./config.json');
const prefix = config.prefix;

const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

// set token to value in hidden .env file
const token = process.env.token;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity(`Type ${prefix}help`);
});

// command handler
fs.readdir('./commands/', (err, files) => {
    if (err) console.log(err);

    // collect names of all .js files in ./commands/
    const commandFiles = files.filter(file => file.endsWith('.js'));
    if (commandFiles.length <= 0) {
        // couldn't find any command files
        console.log('[LOGS] No commands found!');
    }

    // add all found command files to the bot
    for (const file of commandFiles) {
        const pull = require(`./commands/${file}`);
        client.commands.set(pull.config.name, pull);
        // assign command aliases found in the command's file
        pull.config.aliases.forEach(alias => {
            client.aliases.set(alias, pull.config.name);
        });
    }
});

client.login(token).then(() => {
    // load handlers
    fs.readdir('./handlers/', (err, files) => {
        if (err) console.log(err);

        // collect names of all .js files in ./handlers/
        const handlerFiles = files.filter(file => file.endsWith('.js'));
        if (handlerFiles.length <= 0) {
            // couldn't find any handler files
            console.log('[LOGS] No handlers found!');
        }

        // add all found handler files to the bot
        for (const file of handlerFiles) {
            const pull = require(`./handlers/${file}`);
            client.on(file.split('.')[0], pull.handler);

            // call one-time initialisation function
            if (pull.init !== undefined) {
                pull.init(client);
            }
        }
    });
});
