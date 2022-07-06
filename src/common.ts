import {WebClient} from "@slack/web-api";
import {getPendingUsersDetailsMessage} from "./message";
import {SLACKBOT_DISPLAY_NAME} from "./constants";

const {
  MANAGERS,
} = process.env;

export const updateManagers = async (pendingUsers: Array<string>, slackUsers: any, web: WebClient) => {
  if (MANAGERS) {
    const managers = MANAGERS?.split(",");
    const message = getPendingUsersDetailsMessage(pendingUsers)
    const managerNotificationPromises = [];
    const slackUser = slackUsers
      ?.find((u: any) => managers?.includes(u.profile.email.toLowerCase()) && u.name !== SLACKBOT_DISPLAY_NAME);
    if (slackUser) {
      let channelId = slackUser.id!;
      managerNotificationPromises.push(web.chat.postMessage({channel: channelId, text: message}));
    }

    if (managerNotificationPromises.length) {
      console.log("Sending Messages to the managers");
      await Promise.all(managerNotificationPromises);
    }
  }
};