import {WebClient} from "@slack/web-api";
import {HarvestApi} from "./harvest";

const {
  PILOT_USERS,
  IGNORE_USERS,
} = process.env;

// pilot users
const emails: Array<string> | undefined = PILOT_USERS?.split(",");
const ignoreUsers: Array<string> | undefined = IGNORE_USERS?.split(",");

const getUsers = async ({slackClient, harvestApi}: { slackClient: WebClient, harvestApi: HarvestApi }) => {
  // get the list of all slack users
  const slackResponse = await slackClient.users.list();
  const slackUsers = slackResponse.members?.filter(u => !!u?.profile?.email);
  const users = await harvestApi.getAllActiveUsers();

  // get whitelist users
  const filterUsers = (emails || []).length > 0 ? users.filter((u: any) => emails?.includes(u.email)) : users;
  const filterIgnoreUsers = (ignoreUsers || []).length > 0 ? filterUsers?.filter((u: any) => !ignoreUsers?.includes(u.email)) : filterUsers;
  return {slackUsers, filterUsers: filterIgnoreUsers};
};

export default getUsers;