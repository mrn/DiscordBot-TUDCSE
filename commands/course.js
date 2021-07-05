const config = require('../config.json');
const fs = require('fs');
const responses = require('../data/responses.json');
const parseString = require('../modules/parseString.js');

module.exports.run = (message, args) => {
    let add_mode = true;

    // wrong command format
    if (args.length === 0) {
        const err_msg = parseString.formatVariables(
            responses.course.invalidFormat, []);
        message.reply(err_msg);
        return;
    }

    // give role for all courses
    if (args[0] === 'all') {
        allCoursesAccess(args[1]);
        return;
    }

    // check if an argument is the remove option
    if (args.includes('-r')) {
        if (args.length === 1) {
            const err_msg = parseString.formatVariables(
                responses.course.invalidRemoveFormat, []);
            message.reply(err_msg);
            return;
        }
        add_mode = false;
        args = args.filter(a => a !== '-r');

        if (args.length === 0) {
            const err_msg = parseString.formatVariables(
                responses.course.invalidFormat, []);
            message.reply(err_msg);
            return;
        }
    }

    // check if user has too many roles
    if (add_mode
        && message.member.roles.cache.size > config.maxRoles) {

        message.reply(responses.error.roleLimit);
        return;
    }

    let input = args.join(' ');

    // course code number without 'CSE'
    if (input.match(/^[0-9]{4}$/)) {
        input = 'CSE' + input;
    }

    input = input.toLowerCase();

    // find and give course roles to user
    fs.readFile('./data/courses.json', (err, json) => {
        if (err) console.error(err);
        const data = JSON.parse(json);
        // find courses matching user input
        const matching_course_names = searchCourses(data, input);
        if (!matching_course_names) {
            return;
        }
        // no matches for input
        else if (matching_course_names.length === 0) {
            const err_msg = parseString.formatVariables(
                responses.course.noMatches, [input]);
            message.reply(err_msg);
            return;
        }

        findRoles(matching_course_names).then(roles => {
            // no matches found
            if (roles.size === 0 || !roles) {
                const err_msg = parseString.formatVariables(
                    responses.error.seehelp, ['course']);
                message.reply(err_msg);
                return;
            }

            // make string with list of roles
            let role_list = '';
            roles.forEach(r => {
                role_list += '`' + r.name + '`\n';
                message.member.roles.add(r);
            });
            // prepare notification
            let plural = '';
            if (roles.length > 1) {
                plural = 's';
                role_list = '\n' + role_list;
            }

            // add/remove role(s) and create message to send
            let msg = '';
            if (add_mode) {
                roles.forEach(r => {
                    message.member.roles.add(r);
                });

                msg = parseString.formatVariables(
                    responses.course.added, [plural, role_list]);
            }
            else {
                roles.forEach(r => {
                    message.member.roles.remove(r);
                });

                msg = parseString.formatVariables(
                    responses.course.removed, [plural, role_list]);
            }

            message.reply(msg);
        });
    });

    // check each course's details to find courses which match the user's input (target)
    function searchCourses(data, target) {
        const matches = [];
        const matches_codes = [];
        const matches_courses = [];

        for (const year in data) {
            for (const quarter in data[year]) {
                for (const course in data[year][quarter]['courses']) {
                    const course_data = data[year][quarter]['courses'][course];
                    let match_is_course = false;

                    // check if any property of the course matches target
                    if (course_data.name.toLowerCase() === target
                        || (course_data.code && course_data.code.toLowerCase() === target)
                        || (course_data.aliases && course_data.aliases.includes(target))) {

                        match_is_course = true;
                        // store course names in one array and course codes in another,
                        // such that entries at the same index correspond to the same course
                        matches.push(course_data.name);
                        if (course_data.code) {
                            matches_codes.push(course_data.code.toLowerCase());
                        }
                        else {
                            matches_codes.push('');
                        }
                        matches_courses.push(course_data.name);
                    }

                    // if the course has modules, check if they match target
                    if (course_data.modules) {
                        for (const mod in course_data['modules']) {
                            const module_data = course_data['modules'][mod];

                            // when removing, also select all modules of a matching course
                            if (!add_mode && match_is_course) {
                                matches.push(module_data.name);
                                matches_codes.push('');
                                // remember if the match belongs to a separate
                                if (!matches_courses.includes(course_data.name)) {
                                    matches_courses.push(course_data.name);
                                }
                            }
                            // when adding, only select modules which match the target
                            else if (module_data.name === target
                                || (module_data.aliases && module_data.aliases.includes(target))) {

                                // modules do not have a code, so store an empty string
                                // to keep entries at the same index correspond to the same course/module
                                matches.push(module_data.name);
                                matches_codes.push('');
                                // remember if the match belongs to a separate
                                if (!matches_courses.includes(course_data.name)) {
                                    matches_courses.push(course_data.name);
                                }
                            }
                        }
                    }
                }
            }
        }

        // no matches or one match
        if (matches.length <= 1) {
            return matches;
        }
        // if there are multiple matches
        // and all belong to the same course
        else if (matches_courses.length === 1) {
                return matches;
        }
        // otherwise, if matches belong to different courses,
        else {
            // show details about each match and ask for more specific input
            let str_matches_details = '';
            for (let i = 0; i < matches.length; i++) {
                str_matches_details += '• `' + matches[i] + '`';
                if (matches_codes[i] !== '') {
                    str_matches_details += '  |  `' + matches_codes[i] + '`';
                }
                str_matches_details += '\n';
            }

            const err_msg = parseString.formatVariables(
                responses.course.multipleMatches, [input, str_matches_details]);
            message.reply(err_msg);
            return;
        }
    }

    // find roles for the given array of names
    // if a role does not exist, create it
    async function findRoles(names) {
        const roles = [];

        return new Promise((resolve) => {
            for (let i = 0; i < names.length; i++) {
                const name = names[i];

                findOrCreateRole(name).then(
                    role => {
                        roles.push(role);
                        if (i === names.length - 1) {
                            resolve(roles);
                        }
                    });
            }
        });
    }

    function allCoursesAccess(option) {
        findOrCreateRole('All Courses Access').then(role => {
            if (role) {
                if (!option) {
                    message.member.roles.add(role);
                    message.channel.send(responses.course.allCoursesAccessAdded);
                }
                else if (option == '-r') {
                    message.member.roles.remove(role);
                    message.reply(responses.course.allCoursesAccessRemoved);
                }
                else {
                    const err_msg = parseString.formatVariables(
                        responses.error.seehelp, ['course']);
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

// creates an array of strings representing available courses and their details.
// the first element is a header and each following element represents a year.
// existence of year elements is not guaranteed (the JSON data may be invalid)
async function courseList() {
    const header = '▬▬▬ **List of Courses** ▬▬▬\n'
        + '> course code  |  name  |  some acronyms\n';

    const strings_array = await new Promise((resolve) => {
        fs.readFile('./data/courses.json', (err, json) => {
            if (err) {
                console.error(err);
                return;
            }

            const temp_list = [];

            try {
                const data = JSON.parse(json);

                if (data) {
                    for (const year in data) {
                        let year_str = '\u200b\n__**' + year.toUpperCase() + '**__\n';

                        for (const quarter in data[year]) {
                            year_str += '\n> **' + quarter + '**\n';

                            for (const course in data[year][quarter]['courses']) {
                                const course_data = data[year][quarter]['courses'][course];
                                year_str += '> \t**·**  ';

                                if (course_data.code) {
                                    year_str += '`' + course_data.code + '`    |    ';
                                }
                                year_str += '`' + course_data.name + '`';
                                year_str += aliases(course_data) + '\n';

                                if (course_data.modules) {
                                    year_str += '> \t└─ Modules:\n';
                                    for (const mod in course_data['modules']) {
                                        const module_data = course_data['modules'][mod];
                                        year_str += '> \t\t\t· ';
                                        year_str += '`' + module_data.name + '`';
                                        year_str += aliases(module_data);
                                        year_str += '\n';
                                    }
                                }
                            }
                        }

                        temp_list.push(year_str);
                    }
                }
            }
            catch (err) {
                console.error(err);
                return;
            }

            resolve(temp_list);

            // concatenate up to 3 first aliases, if they exist
            function aliases(obj) {
                if (!obj.aliases) return;

                let str = '';

                if (obj.aliases[0]) {
                    str += '    |    `' + obj.aliases[0] + '`';
                    if (obj.aliases[1]) {
                        str += ',  `' + obj.aliases[1] + '`';
                        if (obj.aliases[2]) {
                            str += ',  `' + obj.aliases[2] + '`';
                        }
                    }
                }

                return str;
            }
        });
    });

    // add the header to the front of the array of strings
    strings_array.unshift(header);
    return strings_array;
}
module.exports.courseList = courseList;

module.exports.config = {
    name: 'course',
    aliases: ['c', 'courses'],
};
