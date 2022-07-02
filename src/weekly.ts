import 'source-map-support/register';
import 'reflect-metadata';
import {format} from "date-fns";
import {getFormattedWeekInfo} from "./date";
import HarvestApi from "./harvest";
import {WebClient} from "@slack/web-api";
import {chunk} from 'chunk-arr';
import getUsers from "./users";
import {CHUNK_SIZE, SLACKBOT_DISPLAY_NAME} from "./constants";

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

  const message = `You have not logged 40 Hrs for the week: *${format(start, "do MMM")} to ${format(end, "do MMM")}*. \nPlease update the Harvest ASAP!`

  let counter = 0;
  for (const user of filterUsers) {
    const entry = entries.find((e: any) => e.user_id === user.id);
    if (!entry || entry.total_hours < 40) {
      // send Slack notification
      const slackUser = slackUsers
        ?.find((u: any) => u.profile?.email?.toLowerCase() === user?.emai?.toLowerCase() && u?.profile?.display_name !== SLACKBOT_DISPLAY_NAME);
      if (slackUser) {
        console.log(counter, slackUser?.profile);
        await web.chat.postMessage({channel: slackUser.id!, text: message});
        counter++;
        // slackNotificationPromises.push(web.chat.postMessage({channel: slackUser.id!, text: message}));
      }
    }
  }

  // send the notifications
  // if (slackNotificationPromises.length) {
  //   const promisesChunk = chunk(slackNotificationPromises, CHUNK_SIZE);
  //   for (const promisesChunkElement of promisesChunk) {
  //     await Promise.all(slackNotificationPromises);
  //   }
  // }
}

exports.handler = handler;



