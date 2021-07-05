const config = require('../config.json');
const yearCommand = require('../commands/year');

module.exports.handler = (reaction, user) => {
    if (reaction.message.id !== config.reactionRoles.years.messageID
        && reaction.message.id !== config.reactionRoles.variants.messageID) {

        return;
    }

    const member = reaction.message.guild.member(user);

    if (config.reactionRoles.years.reactions.hasOwnProperty(reaction._emoji.name)) {
        // if selected role is for a year, give that year role to the user
        const year = config.reactionRoles.years.reactions[reaction._emoji.name];
        yearCommand.addYearRole(member, year);
    }
    else if (config.reactionRoles.variants.reactions.hasOwnProperty(reaction._emoji.name)) {
        // if selected role is for a variant, give that variant role to the user
        const selectedVariantName = config.reactionRoles.variants.reactions[reaction._emoji.name].toLowerCase();
        // remove variants which were not selected
        const variantNames = ['Multimedia', 'Systems', 'Data'];
        variantNames.forEach(variantName => {
            if (selectedVariantName !== variantName.toLowerCase()) {
                findOrCreateRole(variantName).then(
                    role => member.roles.remove(role));
            }
        });

        // add selected variant role
        findOrCreateRole(selectedVariantName).then(
            role => member.roles.add(role));
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

module.exports.init = client => {
    try {
        // check if channels and messages exist
        client.channels.cache.get(config.reactionRoles.years.channelID).messages.fetch(config.reactionRoles.years.messageID);
        client.channels.cache.get(config.reactionRoles.variants.channelID).messages.fetch(config.reactionRoles.variants.messageID);
    }
    catch (err) {
        console.log('[WARNING] Cannot find a channel or message for role reactions.');
    }
};
