const config = require('../config.json');
const yearCommand = require('../commands/year');

module.exports.handler = (reaction, user) => {
    if (reaction.message.id !== config.reactionRoles.years.messageID
        && reaction.message.id !== config.reactionRoles.variants.messageID
        && reaction.message.id !== config.reactionRoles.other.messageID) {
            return;
    }

    const member = reaction.message.guild.member(user);

    if (config.reactionRoles.years.reactions.hasOwnProperty(reaction._emoji.name)) {
        // if selected role is for a year, remove that year role from the user
        const selectedYear = config.reactionRoles.years.reactions[reaction._emoji.name];
        yearCommand.removeYearRole(member, selectedYear);
    }
    else if (config.reactionRoles.variants.reactions.hasOwnProperty(reaction._emoji.name)) {
        // if selected role is for a variant, remove that variant role from the user
        const selectedVariantName = config.reactionRoles.variants.reactions[reaction._emoji.name].toLowerCase();
        findOrCreateRole(selectedVariantName).then(
            role => member.roles.remove(role));
    }

    async function findOrCreateRole(target) {
        let target_role = await reaction.message.guild.roles.cache.find(role => role.name.toLowerCase() === target.toLowerCase());
        // if role exists, assign it
        if (target_role) {
            return target_role;
        }
        else { // if it doesn't exist, create it and then assign it
            target_role = await reaction.message.guild.roles.create({
                data: {
                    name: target,
                    permissions: config.defaultPermissions,
                },
            });

            return target_role;
        }
    }
};
