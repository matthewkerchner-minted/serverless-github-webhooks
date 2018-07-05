const axios = require('axios');
const moment = require('moment');

class JiraUtils {
    constructor(user = process.env.JIRA_USER, pass = process.env.JIRA_PASS) {
        this.APPROVALS_FILTER_ID = 12338;
        this.REQUESTS_FILTER_ID = 12337;
        this.ALL_ITEMS_FILTER_ID = 12339;
        this.RE_DASHBOARD_ID = 11136;

        this.client = axios.create({
            baseURL: 'https://jira.mntd.net/rest/api/2/',
            auth: {
                username: user,
                password: pass
            }
        });
    }

    getDateCode() {
        let dayNum;

        if (moment().day() < 5) {
            dayNum = 4 // Thursday (4th day of the week)
        } else {
            dayNum = 11 // Next Thursday (4th day of the week + 7)
        }

        return moment().day(dayNum).format('YYYYMMDD')
    }

    getDateMMDD(dateCode = this.getDateCode()) {
        return moment(dateCode).format('MM[/]DD')
    }
    
    async getDashboard(id = RE_DASHBOARD_ID) {
        try {
            let response = await this.client.get(`dashboard/${id}`);
            let data = response.data
            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async getFilter(id) {
        try {
            let response = await this.client.get(`filter/${id}`);
            let data = response.data
            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async getFavFilters() {
        return await this.client.get('filter/favourite');
    }

    async isDuplicateFilter(name) {
        let favFilters = await this.getFavFilters();
        favFilters = favFilters.data.map(filter => filter.name);
        console.log(favFilters);
        return favFilters.includes(name);
    }

    async createFilter(filterJQL, filterName) {
        let data = {
            name: filterName,
            jql: filterJQL
        }

        let res = await this.client
            .post('filter', data)
            .catch(err => {
                console.log(err);
            });
        
        console.log(res.data);

        return res ? res.data : null;
    }

    async editFilter(filterID, filterJQL, filterName) {
        let data = {
            name: filterName,
            jql: filterJQL
        }

        let res = await this.client
            .put(`filter/${filterID}`, data)
            .catch(err => {
                console.log(err);
            });
        
        console.log(res.data);

        return res ? res.data : null;
    }
    
    async updateLateRequestFilter(prefix='') {
        let jql = `fixVersion in (release-${this.getDateCode()}) AND labels in (late_merge_request)`;
        let name = prefix + `Late Merge Requests for Release ${this.getDateMMDD()}`;

        return this.editFilter(this.REQUESTS_FILTER_ID, jql, name);
    }   

    async updateLateApprovedFilter(prefix='') {
        let jql = `fixVersion in (release-${this.getDateCode()}) AND labels in (late_merge_approved)`;
        let name = prefix + `Late Merge Approvals for Release ${this.getDateMMDD()}`;

        return this.editFilter(this.APPROVALS_FILTER_ID, jql, name)
    }

    async updateReleaseItemFilter(prefix='') {
        let jql = `fixVersion in (release-${this.getDateCode()})`;
        let name = prefix + `Issues in Release ${this.getDateMMDD()}`;

        return this.editFilter(this.ALL_ITEMS_FILTER_ID, jql, name)
    }

    async createLateRequestFilter(prefix='') {
        let jql = `fixVersion in (release-${this.getDateCode()}) AND labels in (late_merge_request)`;
        let name = prefix + `Late Merge Requests for Release ${this.getDateMMDD()}`;

        return this.createFilter(jql, name)
    }   

    async createLateApprovedFilter(prefix='') {
        let jql = `fixVersion in (release-${this.getDateCode()}) AND labels in (late_merge_approved)`;
        let name = prefix + `Late Merge Approvals for Release ${this.getDateMMDD()}`;

        return this.createFilter(jql, name)
    }

    async createReleaseItemFilter(prefix='') {
        let jql = `fixVersion in (release-${this.getDateCode()}) AND labels in (late_merge_request)`;
        let name = prefix + `Issues in Release ${this.getDateMMDD()}`;

        return this.createFilter(jql, name)
    }

    matchJiraIssues(string) {
        const regex = /(jira\.mntd\.net\/browse\/\w+-\d+)/g;
        let jiraIssues;
    
        try {
            jiraIssues = string.match(regex);
        } catch (err) {
            console.log(err);
            return null;
        }
        
        console.log('Matched Jira Issue Links in Github Commit: ' + jiraIssues);

        return jiraIssues;
    }
    
    // attempt to fetch a Jira issue by a jira.mntd.net/browse
    // or by a jira.mntd.net/rest/api/2 url

    async getIssueByURL(url) {
        let key = url.substr(id.lastIndexOf('/') + 1);

        return await this.getIssueByKey(key);
    }

    // Jira Issue ID takes the form AAA-###
    async getIssueByKey(key) {
        if (typeof key !== 'string') {
            console.log('Invalid Jira Issue Key: ' + key);
            return null;
        }
    
        try {
            let response = await this.client.get(`issue/${key}`);
            let data = response.data
            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

}

module.exports = JiraUtils;