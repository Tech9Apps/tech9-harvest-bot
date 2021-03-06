import axios, {AxiosInstance} from "axios";
// @ts-ignore
import Harvest from "harvest-v2";
import exp = require("constants");

const {
    HARVEST_ACCOUNT_ID,
    HARVEST_PERSONAL_TOKEN,
} = process.env;

export class HarvestApi {
    private _harvest: any;
    private _axiosInstance: AxiosInstance;

    constructor() {
        this._harvest = new Harvest({
            account_ID: HARVEST_ACCOUNT_ID,
            access_token: HARVEST_PERSONAL_TOKEN,
            user_agent: 'Tech9 Harvest Bot'
        });

        this._axiosInstance = axios.create({
            baseURL: "https://api.harvestapp.com/v2/",
            headers: {
                "Authorization": `Bearer ${HARVEST_PERSONAL_TOKEN}`,
                "Harvest-Account-Id": HARVEST_ACCOUNT_ID!,
                "User-Agent": "Tech9 Harvest Bot",
            }

        })
    }

    async getAllActiveUsers() {
        // get the list of time-entries for the week/month
        let users: any = [];
        let page = 1;
        do {
            const res = await this._harvest.users.listBy({page, is_active: true });
            const harvestUsers = res?.users?.filter((u: any) => !!u.email)
            if ((harvestUsers || []).length) {
                users = [...users, ...harvestUsers]
            } else {
                break;
            }
            if (res.total_pages === res.page) {
                break;
            }
            page++;
        } while (true);
        return users;
    }

    async getTimeEntries(start: string, end: string) {
        // get the list of time-entries for the week/month
        let results: any = [];
        let page = 1;
        do {
            const res = await this._axiosInstance.get("reports/time/team", { params: { from: start, to: end, page }});
            const data = (res.data || {});
            if ((data.results || []).length) {
                results = [...results, ...data.results]
            } else {
                break;
            }
            if (data.total_pages === data.page) {
                break;
            }
            page++;
        } while (true);
        return results;
    }
}
