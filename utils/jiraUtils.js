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

let isLateMergeApproved = async (key) => {
    if (!key) {
        console.log('No valid key provided!');
        return false;
    }

    if (!client) {
        client = authorizeClient();
    }
    
    try {
        let issue = await getIssue(key);
    } catch (err) {
        console.log(err);
        return false;
    }
    
    let labels = issue.fields.labels;

    if (labels.includes('late_merge_approved')) {
        console.log(`Late merge for key ${key} has been approved.`);
        return true;
    } else {
        console.log(`Late merge for key ${key} has not yet been approved.`);
        return false;
    }
}

let getIssue = async (key) => {
    if (!client) {
        client = authorizeClient();
    }

    if (typeof key !== 'string') {
        console.log(key);
        return {
          statusCode: 401,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Must provide a Jira issue key (XXX-###)'
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
            headers: { 'Content-Type': 'text/plain' },
            body: 'An error occurred while trying to get your issue data'
        };
    }
}

module.exports = {
    getIssue,
    isLateMergeApproved
}