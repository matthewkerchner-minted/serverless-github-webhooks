const axios = require('axios');

let client;

let authorizeClient = () => {
    return axios.create({
        baseURL: 'https://jira.mntd.net/rest/api/2/',
        auth: {
            username: process.env.JIRA_USER,
            password: process.env.JIRA_PASS
        }
    });
}

const matchJiraIssue = (string) => {
    const regex = /[A-Z]{1,4}-[0-9]{1,5}/g; // TODO: better matching for issue numbers
    let jiraKey;

    try {
        jiraKey = string.match(regex)[0];
    } catch (err) {
        console.log(err);
        return null;
    }

    return jiraKey;
}

// Jira Issue ID takes the form AAA-###
const getIssue = async (key) => {
    if (!client) {
        client = authorizeClient();
    }

    if (typeof key !== 'string') {
        console.log('Invalid Jira Issue Key: ' + key);
        return null;
    }

    try {
        let response = await client.get(`issue/${key}`);
        let data = response.data
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

module.exports = {
    getIssue,
    matchJiraIssue
}