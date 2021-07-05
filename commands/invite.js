const config = require('../config.json');
const inviteChannelID = config.inviteChannelID;
const responses = require('../data/responses.json');
const parseString = require('../modules/parseString.js');

module.exports.run = async (message, args) => {
    console.log('Invite channel ID: ' + inviteChannelID);
    const inviteChannel = await message.guild.channels.cache.get(inviteChannelID);
    let expiration = 86400; // expiration time in seconds (24 hours = 86400 seconds)
    let uses = 20;
    let askedPolitely = false;

    if (args[0] === 'pls' || args[0] === 'please') {
        askedPolitely = true;
        expiration *= 2;
        uses *= 2;
    }

    const invite = await inviteChannel.createInvite({
        maxAge: expiration,
        unique: true,
        maxUses: uses,
    }).catch(console.error);

    if (invite) { // if successful
        let msg = parseString.formatVariables(
            responses.invite.link, [invite, uses]);
        if (askedPolitely) {
            msg += '\n' + parseString.formatVariables(
            responses.invite.askedPolitely, [expiration / 3600, uses]);
        }
        message.reply(msg);
    }
    else {
        const err_msg = responses.invite.cannotCreate + ' ' + parseString.formatVariables(
                responses.error.tagStaff, []);
        message.channel.send(err_msg);
    }
};

module.exports.config = {
    name: 'invite',
    description: 'Send server invite link in chat',
    aliases: ['i', 'inv', 'invitelink', 'link'],
};
