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
    const managerNotificationPromises = slackUsers
      ?.filter((u: any) => managers?.includes(u.profile.email.toLowerCase()) && u.name !== SLACKBOT_DISPLAY_NAME)
      ?.map((u: any) => {
        return web.chat.postMessage({channel: u.id!, text: message});
      });

    if (managerNotificationPromises.length) {
      console.log("Sending Messages to the managers");
      await Promise.all(managerNotificationPromises);
    }
  }
};