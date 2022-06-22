const config = require('../config.json');
const responses = require('../data/responses.json');
const parseString = require('../modules/parseString.js');

module.exports.run = async (message, args) => {
    const gradRole = await findOrCreateRole('bsc graduate');

    if (gradRole) {
        if (!args[0]) {
            message.member.roles.add(gradRole);
            message.reply(responses.graduate.added);
        }
        else if (args[0] === '-r') {
            message.member.roles.remove(gradRole);
            message.reply(responses.graduate.removed);
        }
    }
    else {
        const err_msg = responses.error.generic + ' ' + parseString.formatVariables(
            responses.error.tagStaff, []);
        message.channel.send(err_msg);
    }

    async function findOrCreateRole(target) {
        let target_role = await message.guild.roles.cache.find(role => role.name.toLowerCase() === target.toLowerCase());
        // if role exists, assign it
        if (target_role) {
            return target_role;
        }
        else { // if it doesn't exist, create it and then assign it
            target_role = await message.guild.roles.create({
                data: {
                    name: target,
                    permissions: config.defaultPermissions,
                },
            });

            return target_role;
        }
    }
};

module.exports.config = {
    name: 'bsc graduate',
    aliases: ['graduate', 'grad'],
};
