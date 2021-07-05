const config = require('../config.json');
const responses = require('../data/responses.json');
const parseString = require('../modules/parseString.js');

module.exports.run = (message, args) => {
    if (args[0] && args[0].match(/^[123]$/)) {
        const year = args[0];

        if (args[1] === undefined) { // no options - add year role
            addYearRole(message.member, year);
            const msg = parseString.formatVariables(
                responses.year.added, [year]);
            message.reply(msg);
            return;
        }
        else if (args[1] === '-r') { // remove year role
            removeYearRole(message.member, year);
            const msg = parseString.formatVariables(
                responses.year.removed, [year]);
            message.reply(msg);
            return;
        }
    }

    // wrong command format
    const err_msg = parseString.formatVariables(
        responses.year.invalidFormat, []);
    message.reply(err_msg);
};

async function addYearRole(member, year) {
    // remove lower year roles
    // for (y = 1; y < year; y++) {
    //     removeYearRole(member, y);
    // }

    // find year role
    let year_role = await member.guild.roles.cache.find(role => role.name.toLowerCase() === 'year ' + year);
    // if the selected year role exists, assign it to the user
    if (year_role) {
        member.roles.add(year_role);
    }
    else { // if it doesn't exist, create it and then assign it
        year_role = await member.guild.roles.create({
            data: {
                name: 'year ' + year,
                permissions: config.defaultPermissions,
            },
        });

        member.roles.add(year_role);
    }
}
module.exports.addYearRole = addYearRole;

function removeYearRole(member, year) {
    const year_role = member.guild.roles.cache.find(role => role.name.toLowerCase() === 'year ' + year);
    // if the selected year role exists, remove it from the user
    if (year_role) {
        member.roles.remove(year_role);
    }
}
module.exports.removeYearRole = removeYearRole;

// array of ints representing the user's year roles
function getUserYearRoles(member) {
    const userYearRoles = [];
    // find all user's year roles
    for (let y = 1; y <= 3; y++) {
        if (member.roles.cache.find(role => role.name.toLowerCase() === 'year ' + y)) {
            userYearRoles.push(y);
        }
    }
    return userYearRoles;
}
module.exports.getUserYearRoles = getUserYearRoles;

module.exports.config = {
    name: 'year',
    aliases: ['y', 'yr'],
};
