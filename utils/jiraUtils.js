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
        console.log(data);
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

module.exports = {
    getIssue
}