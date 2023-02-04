import 'source-map-support/register';
import 'reflect-metadata';
import {getFormattedWeekInfo} from "./date";
import {HarvestApi} from "./harvest";
import {WebClient} from "@slack/web-api";
import getUsers from "./users";
import {SLACKBOT_DISPLAY_NAME, WEEKLY_HOURS} from "./constants";
import {getMessageFormat} from "./message";
import {updateManagers} from "./common";
import roundTo from "./round";

const {
  SLACK_BOT_TOKEN,
} = process.env;


const handler = async () => {
  const web = new WebClient(SLACK_BOT_TOKEN);
  const harvestApi = new HarvestApi();

  const {slackUsers, filterUsers} = await getUsers({slackClient: web, harvestApi});

  // get time entries
  const {startOfWeek, endOfWeek, start, end} = getFormattedWeekInfo(new Date());
  const entries = await harvestApi.getTimeEntries(startOfWeek, endOfWeek);

  const slackNotificationPromises = [];

  const pendingUsers: Array<string> = [];

  const channels: Array<string> = [];
  for (const user of filterUsers) {
    const entry = entries.find((e: any) => e.user_id === user.id);
    const totalHoursSpent = entry?.total_hours! || 0;
    if (!entry || totalHoursSpent < WEEKLY_HOURS) {
      const message = getMessageFormat(start, end, WEEKLY_HOURS, roundTo(totalHoursSpent, 2))
      // send Slack notification
      const slackUser = slackUsers
        ?.find((u: any) => u.profile.email.toLowerCase() === user.email.toLowerCase() && u.name !== SLACKBOT_DISPLAY_NAME);
      if (slackUser) {
        let channelId = slackUser.id!;
        if (!channels.includes(channelId)) {
          console.log(slackUser?.real_name!);
          pendingUsers.push(slackUser?.real_name!);
          slackNotificationPromises.push(web.chat.postMessage({channel: channelId, text: message}));
          channels.push(channelId)
        }
      }
    }
  }

  // send the notifications
  if (slackNotificationPromises.length) {
    console.log("Sending Messages to the users");
    await Promise.all(slackNotificationPromises);
  }

  await updateManagers(pendingUsers, slackUsers, web);
}

exports.weekly = handler;



