import 'source-map-support/register';
import 'reflect-metadata';
import {getFormattedMonthInfo} from "./date";
import {HarvestApi} from "./harvest";
import {WebClient} from "@slack/web-api";
import getUsers from "./users";
import {DAY_WORKING_HOUR, SLACKBOT_DISPLAY_NAME, WEEKLY_HOURS} from "./constants";
import {getMessageFormat} from "./message";
import {updateManagers} from "./common";

const {
  SLACK_BOT_TOKEN,
} = process.env;

const handler = async () => {
  const web = new WebClient(SLACK_BOT_TOKEN);
  const harvestApi = new HarvestApi();

  const {slackUsers, filterUsers} = await getUsers({slackClient: web, harvestApi});

  // get time entries
  const {startOfMonth, endOfMonth, start, end, numberOfWorkingDays} = getFormattedMonthInfo(new Date());
  const entries = await harvestApi.getTimeEntries(startOfMonth, endOfMonth);

  const slackNotificationPromises = [];

  const totalHours = numberOfWorkingDays * DAY_WORKING_HOUR;
  const pendingUsers: Array<string> = [];

  const channels: Array<string> = [];
  for (const user of filterUsers) {
    const entry = entries.find((e: any) => e.user_id === user.id);
    const totalHoursSpent = entry?.total_hours!;
    if (!entry || totalHoursSpent < totalHours) {
      const message = getMessageFormat(start, end, totalHours, totalHoursSpent)
      // send Slack notification
      const slackUser = slackUsers
        ?.find((u: any) => u.profile.email.toLowerCase() === user.email.toLowerCase() && u.name !== SLACKBOT_DISPLAY_NAME);
      if (slackUser) {
        let channelId = slackUser.id!;
        if (!channels.includes(channelId)) {
          pendingUsers.push(slackUser?.real_name!);
          slackNotificationPromises.push(web.chat.postMessage({channel: channelId, text: message}));
          channels.push(channelId)
        }
      }
    }
  }

  // send the notifications
  if (slackNotificationPromises.length) {
    await Promise.all(slackNotificationPromises);
  }

  await updateManagers(pendingUsers, slackUsers, web);

}

exports.monthly = handler;



