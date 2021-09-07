module.exports.run = async (message, args) => {
    const responses = require('../data/responses.json');
    const parseString = require('../modules/parseString.js');
    const arg = args.join(' ');

    // return if user tagged the role
    if (arg.includes('<@')) {
        message.channel.send(responses.users.doNotTag);
        return;
    }

    // look for a role with the closest name
    const roles = [];
    message.guild.roles.cache.forEach(function(role) {
            roles.push(role.name);
        },
    );
    const string_similarity = require('string-similarity');
    const similar_addresses = string_similarity.findBestMatch(arg, roles);
    if (similar_addresses.bestMatch.rating < 0.5) {
        message.channel.send(responses.users.invalidRole);
        return;
    }
    const role_name = similar_addresses.bestMatch.target;
    const selected_role = message.guild.roles.cache.find(role => role.name === role_name);

    // get all users with said role
    const users_with_role = [];
    selected_role.members.forEach(user => {
        users_with_role.push(user.user.tag);
        console.log(user);
    });
    users_with_role.sort();

    // amount of users
    const amount = users_with_role.length;
    if (amount === 0) {
        message.channel.send(parseString.formatVariables(responses.users.noUser, [role_name]));
        return;
    }
    let reply = parseString.formatVariables(responses.users.list, [role_name, users_with_role.join('`, `')]);
    reply = parseString.splitUserList(reply);
    reply.forEach(function(reply_msg) {
        message.channel.send(reply_msg);
    });
};

module.exports.config = {
    name: 'users',
    description: 'Get a list of users with a specific role.',
    aliases: ['u'],
};
