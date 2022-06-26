const {WebClient} = require("@slack/web-api");
const {format} = require('date-fns');
const {getFormattedWeekInfo} = require('./date');
const {HarvestApi} = require('./harvest');

const {
    SLACK_BOT_TOKEN,
    PILOT_USERS
} = process.env;

// pilot users
const emails = PILOT_USERS.split(",");

const handler = async () => {
    // get the list of all slack users
    const web = new WebClient(SLACK_BOT_TOKEN);
    const slackResponse = await web.users.list();
    const slackUsers = slackResponse.members;

    // get all harvest users
    const harvestApi = new HarvestApi();
    const users = await harvestApi.getAllActiveUsers();

    // get whitelist users
    const filterUsers = (emails || []).length > 0 ? users.filter(u => emails.includes(u.email)) : users;

    // get time entries
    const {startOfWeek, endOfWeek, start, end} = getFormattedWeekInfo(new Date());
    const entries = await harvestApi.getTimeEntries(startOfWeek, endOfWeek);

    const slackNotificationPromises = [];

    const message = `You have not logged 40 Hrs for the week: *${format(start, "do MMM")} to ${format(end, "do MMM")}*. \nPlease update the Harvest`

    for (const user of filterUsers) {
        const entry = entries.find(e => e.user_id === user.id);
        if (!entry || entry.total_hours < 40) {
            // send Slack notification
            const slackUser = slackUsers.find(u => u.profile.email === user.email);
            if (slackUser) {
                slackNotificationPromises.push(web.chat.postMessage({channel: slackUser.id, text: message}));
            }
        }
    }

    // send the notifications
    if (slackNotificationPromises.length) {
        await Promise.all(slackNotificationPromises);
    }
}

exports.handler = handler;
