const config = require('../config.json');
const responses = require('../data/responses.json');
const parseString = require('../modules/parseString.js');

module.exports.run = async (message, args) => {
    console.log('Invite channel ID: ' + config.inviteChannelID);
    const inviteChannel = await message.guild.channels.cache.get(config.inviteChannelID);
    let expiration = 86400; // expiration time in seconds (24 hours = 86400 seconds)
    // let uses = 20;
    let askedPolitely = false;

    if (args[0] === 'pls' || args[0] === 'please') {
        askedPolitely = true;
        expiration *= 2;
        // uses *= 2;
    }

    try {
        if (inviteChannel) { // if successful
            const invite = await inviteChannel.createInvite({
                maxAge: expiration,
                unique: true,
                // maxUses: uses,
            });

            let msg = parseString.formatVariables(
                responses.invite.link, [invite]);
            if (askedPolitely) {
                msg += '\n' + parseString.formatVariables(
                responses.invite.askedPolitely, [expiration / 3600]);
            }
            message.reply(msg);
        }
        else {
            const err_msg = responses.invite.cannotCreate + ' ' + parseString.formatVariables(
                    responses.error.tagStaff, []);
            message.channel.send(err_msg);
        }
    } catch (error) {
        console.log(error)
    }
};

module.exports.config = {
    name: 'invite',
    description: 'Send server invite link in chat',
    aliases: ['i', 'inv', 'link', 'invitelink'],
};
