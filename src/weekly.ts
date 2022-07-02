import 'source-map-support/register';
import 'reflect-metadata';
import {getFormattedWeekInfo} from "./date";
import {HarvestApi} from "./harvest";
import {WebClient} from "@slack/web-api";
import getUsers from "./users";
import {SLACKBOT_DISPLAY_NAME, WEEKLY_HOURS} from "./constants";
import {getMessageFormat} from "./message";

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

  const channels: Array<string> = [];
  for (const user of filterUsers) {
    const entry = entries.find((e: any) => e.user_id === user.id);
    if (!entry || entry.total_hours < WEEKLY_HOURS) {
      const message = getMessageFormat(start, end, WEEKLY_HOURS, entry.total_hours)
      // send Slack notification
      const slackUser = slackUsers
        ?.find((u: any) => u.profile.email.toLowerCase() === user.email.toLowerCase() && u.name !== SLACKBOT_DISPLAY_NAME);
      if (slackUser) {
        let channelId = slackUser.id!;
        if (!channels.includes(channelId)) {
          console.log(slackUser?.profile?.first_name, slackUser?.profile?.email)
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
}

exports.weekly = handler;



