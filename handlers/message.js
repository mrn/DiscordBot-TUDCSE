const config = require('../config.json');
const prefix = config.prefix;
const responses = require('../data/responses.json');
const parseString = require('../modules/parseString.js');

// whenever a message is sent
module.exports.handler = (message) => {
    const client = message.client;
    // if message is too long, stop to avoid comparing long strings
    // there are some long counntry names
    if (message.content.length > 100) return;
    // if message does not start with the prefix or is from a bot, then stop
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // replace multiple whitespaces with single space
    const whitespace = new RegExp('\\s+?(?=[^\\s])', 'g');
    const input = message.content.replace(whitespace, ' ');
    // split the message into a command and arguments
    const args = input.slice(prefix.length).toLowerCase().trim().split(' ');
    const command = args.shift().toLowerCase();
    console.log('[COMMAND] ' + message.author.username + ': ' + message.content);

    // stop if this is neither a global command nor should the bot work in this channel
    // De Morgan's: continue if it's a global channel or if the bot is allowed to work in this channel
    if (!config.globalCommands.includes(command) && !config.channels.includes(message.channel.name)) return;

    // if the given command name matches an existing command or alias, then execute the command
    const commandFile = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    if (commandFile) {
        try {
            commandFile.run(message, args, client);
        }
        catch (err) {
            console.error(err);
            const err_msg = parseString.formatVariables(
                responses.error.confused, []);
            message.reply(err_msg);
        }
    }
};
