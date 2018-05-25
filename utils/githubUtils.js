const ghToken = process.env.GH_TOKEN;
const axios = require('axios');

const matchJiraIssue = (string) => {
    const regex = /[A-Z]{2,4}-[0-9]{2,5}/g; // TODO: better matching for issue numbers
    const jiraKey = string ? string.match(regex)[0] : null;

    return jiraKey;
}

const decodeURI = (encodedString) => {
    let decodedString = decodeURIComponent(encodedString);

    // strip 'payload=' from the front of the object
    if (decodedString.slice(0, 20).includes('=')) {
        decodedString = decodedString.replace('payload=', '');
    }

    return JSON.parse(decodedString);
}

const lateMergeCheck = async (pullRequestBody, jiraIssue) => {
    const url = pullRequestBody.statuses_url;

    if (jiraIssue.fields.labels.includes('late_merge_approved')) {
        return postStatus(
            url,
            ghToken,
            'Late Merge Check',
            'success',
            'Your late merge has been approved!',
        );
    } else if (jiraIssue.fields.labels.includes('late_merge_request')) {
        return postStatus(
            url,
            ghToken,
            'Late Merge Check',
            'error',
            'Your late merge has not yet been approved on JIRA.',
        );
    } else {
        // TODO: Should we add a status at all if it's not a late request? 
        // I don't want to pollute our github output.
        return Promise.resolve(null);
    }
}

const postStatus = async (url, context, status, message) => {
  return axios.post(
    url,
    {
      state: status,
      description: message,
      context,
    },
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${ghToken}`,
      },
    },
  ).then(data => {
    console.log('Success!');
    console.log(data);
  }).catch(err => {
      console.log(err);
  });
};

module.exports = {
    postStatus,
    lateMergeCheck,
    matchJiraIssue,
    decodeURI
}