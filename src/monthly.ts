import 'source-map-support/register';
import 'reflect-metadata';
import {format} from "date-fns";
import {getFormattedMonthInfo} from "./date";
import {HarvestApi} from "./harvest";
import {WebClient} from "@slack/web-api";
import getUsers from "./users";
import {DAY_WORKING_HOUR, SLACKBOT_DISPLAY_NAME, WEEKLY_HOURS} from "./constants";
import {getMessageFormat} from "./message";

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

  const channels: Array<string> = [];
  for (const user of filterUsers) {
    const entry = entries.find((e: any) => e.user_id === user.id);
    if (!entry || entry.total_hours < totalHours) {
      const message = getMessageFormat(start, end, totalHours, entry.total_hours)
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

exports.monthly = handler;



