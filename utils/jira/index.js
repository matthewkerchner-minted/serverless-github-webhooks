const axios = require('axios');
const moment = require('moment');
const AxiosLogger = require('axios-logger');

class JiraUtils {
    constructor(email = process.env.JIRA_EMAIL, token = process.env.JIRA_TOKEN) {
        this.RE_DASHBOARD_ID = 11136;

        this.client = axios.create({
            baseURL: 'https://minted.atlassian.net/rest/api/2/',
            auth: {
                username: email,
                password: token
              },
        });
        this.client.interceptors.request.use(AxiosLogger.requestLogger, AxiosLogger.errorLogger);
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

        return res ? res.data : null;
    }

    matchJiraIssues(string) {
        const regex = /\[(\w+-\d+)\]\(.*(minted\.atlassian\.net\/browse\/\w+-\d+)\)/g;
        const urlMatcher = 'minted.atlassian.net/browse/'
        let jiraIssues;
    
        try {
            jiraIssues = string.match(regex);
            if (jiraIssues) {
                jiraIssues = jiraIssues.map(issue => issue.slice(issue.indexOf(urlMatcher), -1));
            }
        } catch (err) {
            console.log(err);
            return null;
        }
        
        

        console.log('Matched Jira Issue Links in Github Commit: ' + jiraIssues);

        return [...new Set(jiraIssues)]; // filter out duplicate issues
    }
    
    // attempt to fetch a Jira issue by a minted.atlassian.net/browse
    // or by a minted.atlassian.net/rest/api/2 url

    async getIssueByURL(url) {
        let key = url.substr(url.lastIndexOf('/') + 1);
        return this.getIssueByKey(key);
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