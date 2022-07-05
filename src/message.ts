import {format} from "date-fns";

export const getMessageFormat =
  (start: Date, end: Date, expectedHour: number, totalHoursSpent: number) =>
    `You have not logged  *${expectedHour} Hrs* for the week: *${format(start, "do MMM")} to ${format(end, "do MMM")}*.`
    + `\nTotal Hours Logged:  *${totalHoursSpent} Hrs*`
    + `\nRemaining Hours:      *${expectedHour - totalHoursSpent} Hrs* `
    + `\nPlease update the <https://tech91.harvestapp.com/time|Harvest> ASAP! :tech9love: `
    + `\n<https://tech91.harvestapp.com/time|Click here to open Harvest>`;


export const getPendingUsersDetailsMessage =
  (pendingUsers: Array<string>) =>
    `Following users need to update the Harvest for the last week (Total Count - *${pendingUsers?.length!}*)\n`
    + pendingUsers.join("\n");
``