const config = require('../config.json');
const parseString = require('../modules/parseString.js');
const responses = require('../data/responses.json');

module.exports.run = async (message, args) => {
    if (args.length === 0) {
        const err_msg = parseString.formatVariables(
            responses.error.seehelp, ['variant']);
        message.channel.send(err_msg);
        return;
    }
    const option = args[0].toLowerCase();

    const roleMultimedia = await findOrCreateRole('multimedia');
    const roleSystems = await findOrCreateRole('systems');
    const roleData = await findOrCreateRole('data');
    const roleAll = await findOrCreateRole('all variants access');

    const multimediaNames = ['multimedia', 'mm'];
    const systemsNames = ['systems', 'sys'];
    const dataNames = ['data'];

    if (args.includes('-r')) {
        // if no variant specified, remove all
        if (args.length === 1) {
            removeAll();
            return;
        }

        args = args.filter(a => a !== '-r');
        if (args.length >= 1) {
            const to_remove = args[0].toLowerCase();

            if (multimediaNames.includes(to_remove)) {
                message.member.roles.remove(roleMultimedia);
                const msg = parseString.formatVariables(responses.variant.removed, [multimediaNames[0]]);
                message.reply(msg);
            }
            else if (systemsNames.includes(to_remove)) {
                message.member.roles.remove(roleSystems);
                const msg = parseString.formatVariables(responses.variant.removed, [systemsNames[0]]);
                message.reply(msg);
            }
            else if (dataNames.includes(to_remove)) {
                message.member.roles.remove(roleData);
                const msg = parseString.formatVariables(responses.variant.removed, [dataNames[0]]);
                message.reply(msg);
            }
            else if (to_remove === 'all') {
                message.member.roles.remove(roleAll);
                message.reply(responses.variant.removedAllAccess);
            }
            else {
                const err_msg = parseString.formatVariables(
                    responses.error.seehelp, ['variant']);
                message.channel.send(err_msg);
            }
            return;
        }
    }

    if (multimediaNames.includes(option)) {
        message.member.roles.add(roleMultimedia);
        const msg = parseString.formatVariables(responses.variant.added, [multimediaNames[0]]);
        message.reply(msg);
    }
    else if (systemsNames.includes(option)) {
        message.member.roles.add(roleSystems);
        const msg = parseString.formatVariables(responses.variant.added, [systemsNames[0]]);
        message.reply(msg);
    }
    else if (dataNames.includes(option)) {
        message.member.roles.add(roleData);
        const msg = parseString.formatVariables(responses.variant.added, [dataNames[0]]);
        message.reply(msg);
    }
    else if (option == 'all') {
        message.member.roles.add(roleAll);
        message.channel.send(responses.variant.addedAll);
    }
    else if (option == 'none') {
        removeAll();
    }
    else {
        const err_msg = parseString.formatVariables(
            responses.error.seehelp, ['variant']);
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

    function removeAll() {
        message.member.roles.remove(roleMultimedia);
        message.member.roles.remove(roleSystems);
        message.member.roles.remove(roleData);
        message.member.roles.remove(roleAll);
        message.reply(responses.variant.removedAll);
    }
};

module.exports.config = {
    name: 'variant',
    aliases: ['v', 'var'],
};
