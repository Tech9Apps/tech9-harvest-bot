const Harvest = require("harvest-v2");
const axios = require('axios');

const {
    HARVEST_ACCOUNT_ID,
    HARVEST_PERSONAL_TOKEN,
} = process.env;

class HarvestApi {
    _harvest;
    _axiosInstance;

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
                "Harvest-Account-Id": HARVEST_ACCOUNT_ID,
                "User-Agent": "Tech9 Harvest Bot",
            }

        })
    }

    async getAllActiveUsers() {
        // get the list of time-entries for the week/month
        let users = [];
        let page = 1;
        do {
            const res = await this._harvest.users.listBy({page, is_active: true });
            if ((res.users || []).length) {
                users = [...users, ...res.users]
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

    async getTimeEntries(start, end) {
        // get the list of time-entries for the week/month
        let results = [];
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

module.exports = { HarvestApi };