const parseString = require('../modules/parseString.js');
const defaultPermissions = require('../config.json').defaultPermissions;
const responses = require('../data/responses.json');
const countryjs = require('countryjs');

module.exports.run = (message, args) => {
    // if no arguments, tell user what to do
    if (args.length === 0) {
        const err_msg = parseString.formatVariables(
            responses.country.invalidFormat, []);
        message.reply(err_msg);
        return;
    }

    let add_mode = true; // add or remove the given country?
    const user = message.member;

    // remove all country roles from user
    if (args.length === 1 && args[0] === '-r') {
        removeAllCountries(user);
        message.reply(responses.country.removedAll);
    }
    // multiple args including -r
    else if (args.includes('-r')) {
        add_mode = false;
        args = args.filter(a => a !== '-r');
        if (args.length === 0) {
            const err_msg = parseString.formatVariables(
                responses.country.invalidFormat, []);
            message.reply(err_msg);
            return;
        }
    }

    let input = args.join(' ').toUpperCase();

    // determine how the country name was entered
    let name_type = 'name';
    if (input.length === 2) {
        name_type = 'ISO2';
    }
    else if (input.length === 3) {
        name_type = 'ISO3';
    }

    // United Kingdom has a strange country code
    if (input === 'UK') {
        input = 'GB';
    }

    // determine country name and whether it exists
    const country_name = countryjs.name(input, name_type);
    if (!country_name) {
        message.reply(responses.country.invalidCountry);
        return;
    }

    const country_role = message.guild.roles.cache.find(role => role.name === country_name);

    if (add_mode) {
        // add role to user's account
        if(country_role) {
            user.roles.add(country_role);
        }
        // create the role if doesn't exist, then add it
        else {
            message.guild.roles.create({
                data: {
                    name: country_name,
                    mentionable: true,
                    permissions: defaultPermissions,
                },
            }).then(role => {
                user.roles.add(role);
            }).catch(console.error);
        }

        // tell user role is assigned
        const country_info = countryjs.altSpellings(country_name, 'name');
        let flag_code = '';
        if (country_info !== undefined) {
            flag_code = ':flag_' + country_info[0].toLowerCase() + ':';
        }
        message.reply(parseString.formatVariables(responses.country.assigned, [country_name, flag_code]));
    }
    else if (country_role) {
        user.roles.remove(country_role);
        message.reply(responses.country.removed);
    } else {
        const err_msg = responses.invite.cannotCreate + ' ' + parseString.formatVariables(
            responses.error.tagStaff, []);
        message.channel.send(err_msg);
    }
};

// remove all country roles from the user
function removeAllCountries(user) {
    const removed = [];
    user.roles.cache.forEach(function(role) {
        if (countryjs.name(role.name, 'name') !== undefined) {
            user.roles.remove(role);
            removed.push(role);
        }
    });
}
module.exports.removeAllCountries = removeAllCountries;

module.exports.config = {
    name: 'country',
    description: 'Assign a country role',
    aliases: ['homeland', 'motherland'],
};
