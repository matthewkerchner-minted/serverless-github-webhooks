const axios = require('axios');

const client;

function authorizeClient() {
    client = axios.create({
        baseURL: 'https://jira.mntd.net/rest/api/2/issue/',
        auth: {
            username: process.env.JIRA_USER,
            password: process.env.JIRA_PASS
        }
      });
}

exports.isLateMergeApproved = async (key) => {
    if (!key) {
        console.log('No valid key provided!');
        return false;
    }

    if (!client) {
        authorizeClient();
    }

    let issue = await getIssue(key);
    let labels = issue.fields.labels;

    if (labels.includes('late_merge_approved')) {
        console.log(`Late merge for key ${key} has been approved.`);
        return true;
    } else {
        console.log(`Late merge for key ${key} has not yet been approved.`);
        return false;
    }
}

exports.getIssue = async (key) => {
    if (!client) {
        authorizeClient();
    }

    if (typeof token !== 'string') {
        errMsg = 'Must provide a \'GITHUB_WEBHOOK_SECRET\' env variable'; 
        return {
          statusCode: 401,
          headers: { 'Content-Type': 'text/plain' },
          body: errMsg,
        };
      }

    let response = await client.get(key)
    console.log(response.data);
    return response.data;
}