const config = require('../config.json');
const prefix = config.prefix;
const responses = require('../data/responses.json');
const courseList = require('./course.js').courseList;
const parseString = require('../modules/parseString.js');

module.exports.run = (message, args) => {
    const pre = '▬▬▬ **BOT HELP** ▬▬▬';

    const summary = 'For details about a command, see **`' + prefix + 'help <command name>`**'
        + '\n'
        + '\n> **`' + prefix + 'year <number>`**  —  choose your year to access related channels'
        + '\n> \tAlias: `' + prefix + 'y`'
        + '\n> '
        + '\n> **`' + prefix + 'course <name|code>`**  —  choose which individual course channels to show'
        + '\n> \tAlias: `' + prefix + 'c`'
        + '\n> '
        + '\n> **`' + prefix + 'variant <name>`**  —  choose your set of variant courses for year 2'
        + '\n> \tAlias: `' + prefix + 'v`'
        + '\n> '
        + '\n> **`' + prefix + 'honours`**  —  get access to the channel for the honours programme'
        + '\n> '
        + '\n> **`' + prefix + 'country <name>`**  —  choose your home country to have the role shown on your account'
        + '\n> '
        + '\n> **`' + prefix + 'invite`**  —  get a temporary invite link to the server'
        + '\n> \tAliases: `' + prefix + 'i`, `' + prefix + 'link`'
        + '\n> '
        + '\n> **`' + prefix + 'ta`**  —  get the TA role'
        + '\n> '
        + '\n> **`' + prefix + 'help`**  —  show this message'
        + '\n> \tAliases: `' + prefix + 'h`, `' + prefix + '?`'
        + '\n'
        + '\nAdding **`-r`** to role commands will remove selected role(s).'
        + '\n'
        + '\nFor more details about a command, see **`' + prefix + 'help <command name>`**, '
        + 'or **`' + prefix + 'help all`** for all info at once.';

    const commandsHelp = {
        help:
        '**General**'
        + '\n'
        + '\n> **`' + prefix + 'help <command name>`** or **`' + prefix + 'h <command name>`**  —  shows details and examples for the given command.'
        + '\n> '
        + '\n> **`' + prefix + 'help courselist`** or **`' + prefix + 'help cl`**  —  lists all the available course names, codes and acronyms.'
        + '\n> Giving it a number, e.g. **`' + prefix + 'help cl 2`**, will give you courses only for that year.',
        year:
        '**Year**'
        + '\n'
        + '\n> **`' + prefix + 'year <number>`** or **`' + prefix + 'y <number>`**  —  gives you a role for your year and access to channels for active courses.'
        + '\n> As time goes on, you will automatically see channels for new courses.'
        + '\n> '
        + '\n> Option `-r`: removes the year from your account.'
        + '\n> '
        + '\n> Examples:'
        + '\n> · `' + prefix + 'y 1`'
        + '\n> · `' + prefix + 'y 2 -r`',
        course:
        '**Course**'
        + '\n'
        + '\n> **`' + prefix + 'course <name|code>`** or **`' + prefix + 'c <name|code>`**  —  gives you access to the channel for the chosen course.'
        + '\n> '
        + '\n> Option `-r`: removes the course from your account.'
        + '\n> '
        + '\n> **`' + prefix + 'help courselist`** or **`' + prefix + 'help cl`**  —  lists all the available course names, codes and acronyms.'
        + '\n> Giving it a number, e.g. **`' + prefix + 'help cl 2`**, will give you courses only for that year.'
        + '\n> '
        + '\n> Examples:'
        + '\n> · `' + prefix + 'course oop`'
        + '\n> · `' + prefix + 'course oop -r`  —  hides the OOP channel'
        + '\n> · `' + prefix + 'c ads`'
        + '\n> · `' + prefix + 'c Linear Algebra`  —  you can also use full names'
        + '\n> · `' + prefix + 'c cse1205`  —  you can use course codes too'
        + '\n> · `' + prefix + 'c calc -r`  —  hides the calculus channel',
        variant:
        '**Variant**'
        + '\n'
        + '\n> **`' + prefix + 'variant <name>`** or **`' + prefix + 'v <name>`**  —  gives you access to channels for the chosen variant in year 2.'
        + '\n> '
        + '\n> Available variants:'
        + '\n> · `Multimedia` or `mm`'
        + '\n> · `Systems` or `sys`'
        + '\n> · `Data`'
        + '\n> '
        + '\n> Option `-r`: removes access to variants.'
        + '\n> '
        + '\n> **`' + prefix + 'variant all`**  —  gives you access to all channels for all variant courses (it doesn\'t mess with your chosen variant role).'
        + '\n> **`' + prefix + 'variant all -r`**  —  removes the role which lets you see all variant course channels, but doesn\'t remove individual variant roles.'
        + '\n> '
        + '\n> **`' + prefix + 'variant none`** or **`' + prefix + 'variant -r`**  —  removes access to all variant course channels.'
        + '\n> '
        + '\n> Examples:'
        + '\n> · `' + prefix + 'v data`'
        + '\n> · `' + prefix + 'v sys`'
        + '\n> · `' + prefix + 'v all`'
        + '\n> · `' + prefix + 'v -r`',
        honours:
        '**Honours**'
        + '\n> **`' + prefix + 'honours`**  —  gives you access to the channel for the honours programme.'
        + '\n> '
        + '\n> Option `-r`: removes access.',
        country:
        '**Country**'
        + '\n> **`' + prefix + 'country <name|code>`**  —  gives you a role for the chosen country.'
        + '\n> '
        + '\n> Option `-r`: removes the specified country from your account, or all countries if none is specified.'
        + '\n> '
        + '\n> Examples:'
        + '\n> · `' + prefix + 'country Netherlands`'
        + '\n> · `' + prefix + 'country Nederland`'
        + '\n> · `' + prefix + 'country NL`'
        + '\n> · `' + prefix + 'country NL -r`'
        + '\n> · `' + prefix + 'country -r`',
        invite:
        '**Invite**'
        + '\n'
        + '\n> **`' + prefix + 'invite`**  —  gives you a temporary invite link to the server.',
        ta:
        '**TA**'
        + '\n'
        + '\n> **`' + prefix + 'ta`**  —  gives you a TA role to let others know you\'re a TA and to let you access the TA channel.'
        + '\n> '
        + '\n> Option `-r`: removes the TA role.',
    };

    const misc = {
        contribute:
        '**Contribute**'
        + '\n> This bot is open source and you can contribute by making a PR here:'
        + '\n> <' + config.repoURL + '>',
    };


    if (!args[0]) {
        message.channel.send(pre + '\n\n' + summary + '\n\n' + misc['contribute']);
        return;
    }

    const option = args[0].toLowerCase();
    if (option === 'all') {
        const message1 = [commandsHelp['help'], commandsHelp['year'], commandsHelp['course'], commandsHelp['variant']];
        const message2 = [commandsHelp['honours'], commandsHelp['country'], commandsHelp['invite'], commandsHelp['ta'], misc['contribute']];
        message.channel.send(pre + '\n\n' + message1.join('\n\n'));
        message.channel.send('\u200B\n' + message2.join('\n\n'));
    }
    // show info about a specific command
    else if (option in commandsHelp) {
        message.channel.send('**Command Help:** ' + commandsHelp[option]);
    }
    else if (option in misc) {
        message.channel.send(misc[option]);
    }
    // show a list of courses
    else if (option.match(/^(courselist|courses|cl)$/)) {
        courseList().then(list => {
            // if the data is valid
            if (list && list[3]) {
                // show all years
                if (!args[1]) {
                    const msg1 = list[0] + list[1];
                    const msg2 = list[2];
                    const msg3 = list[3];

                    message.channel.send(msg1);
                    message.channel.send(msg2);
                    message.channel.send(msg3);
                }
                else if (args[1].match(/^[1-3]$/)) {
                    const msg = list[0] + list[args[1]];
                    message.channel.send(msg);
                }
                else {
                    const err_msg = parseString.formatVariables(
                        responses.help.invalidFormat, []);
                    message.reply(err_msg);
                }
            }
            else {
                const err_msg = responses.error.generic + ' ' + parseString.formatVariables(
                    responses.error.tagStaff, []);
                message.channel.send(err_msg);
            }
        });
    }
    else {
        const err_msg = parseString.formatVariables(
            responses.help.noInfo, []);
        message.reply(err_msg);
    }
};

module.exports.config = {
    name: 'help',
    aliases: ['h', '?', 'bothelp'],
};
