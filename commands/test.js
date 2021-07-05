module.exports.run = (message, args, client) => {
    message.channel.send('Yes, I can hear you');
};

module.exports.config = {
    name: 'test',
    aliases: [],
};
