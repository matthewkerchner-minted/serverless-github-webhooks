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

const getIssue = async (key) => {
    if (!client) {
        client = authorizeClient();
    }

    if (typeof key !== 'string') {
        console.log(key);
        return {
          statusCode: 401,
          errMsg: 'Must provide a Jira issue key (XXX-###)'
        };
      }

    try {
        let response = await client.get(`issue/${key}`);
        let data = response.data
        console.log(data);
        return data;
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            errMsg: 'An error occurred while trying to get your issue data'
        };
    }
}

module.exports = {
    getIssue
}