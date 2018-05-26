const ghToken = process.env.GH_TOKEN;
const axios = require('axios');
const jiraUtils = require('./jiraUtils');

const decodeURI = (encodedString) => {
    let decodedString = decodeURIComponent(encodedString);

    // strip 'payload=' from the front of the object
    if (decodedString.slice(0, 20).includes('=')) {
        decodedString = decodedString.replace('payload=', '');
    }

    return JSON.parse(decodedString);
}

const includesJiraIssueCheck = async (pullRequestBody) => {
    const url = pullRequestBody.statuses_url;
    const jiraKey = jiraUtils.matchJiraIssue(pullRequestBody.body);
    const jiraIssue = jiraKey ? await jiraUtils.getIssue(jiraKey) : null;

    if (!jiraKey) {
        await postStatus(
            url,
            'Jira Issue Key Check',
            'error',
            'We couldn\'t find any Jira Issue Keys in your pull request.',
        );

        return null;
    }

    console.log(`Found Jira Issue ${jiraKey}!`);

    if (!jiraIssue) {
        await postStatus(
            url,
            'Jira Issue Key Check',
            'error',
            'Your Jira Issue Key seems to be invalid.',
        );

        return null;
    } else {
        await postStatus(
            url,
            'Jira Issue Key Check',
            'success',
            'We found a matching Jira Issue Key!',
        );

        return jiraIssue;
    }
}

const lateMergeCheck = async (pullRequestBody, jiraIssue) => {
    const url = pullRequestBody.statuses_url;

    if (!jiraIssue) {
        return postStatus(
            url,
            'Late Merge Check',
            'error',
            'We need a Jira Issue Key to check for late merge approval',
        );
    } else if (jiraIssue.fields.labels.includes('late_merge_approved')) {
        return postStatus(
            url,
            'Late Merge Check',
            'success',
            'Your late merge has been approved!',
        );
    } else if (jiraIssue.fields.labels.includes('late_merge_request')) {
        return postStatus(
            url,
            'Late Merge Check',
            'error',
            'Your late merge has not yet been approved on JIRA.',
        );
    } else {
        // TODO: Should we add a status at all if it's not a late request? 
        // I don't want to pollute our github output.
        return postStatus(
            url,
            'Late Merge Check',
            'success',
            'This doesn\'t look like a late merge to us.',
        );
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
    console.log('Successfully created status!');
  }).catch(err => {
      console.log(err);
  });
};

module.exports = {
    postStatus,
    lateMergeCheck,
    includesJiraIssueCheck,
    decodeURI
}