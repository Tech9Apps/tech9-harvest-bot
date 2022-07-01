import {WebClient} from "@slack/web-api";
import HarvestApi from "./harvest";

const {
  PILOT_USERS
} = process.env;

// pilot users
const emails = PILOT_USERS?.split(",");

const getUsers = async ({ slackClient, harvestApi  }: { slackClient: WebClient, harvestApi: HarvestApi  }) => {
  // get the list of all slack users
  const slackResponse = await slackClient.users.list();
  const slackUsers = slackResponse.members;
  const users = await harvestApi.getAllActiveUsers();

  // get whitelist users
  const filterUsers = (emails || []).length > 0 ? users.filter((u: any) => emails?.includes(u.email)) : users;
  return { slackUsers, filterUsers };
};

export default getUsers;