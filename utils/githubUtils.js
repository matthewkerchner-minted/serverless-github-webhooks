const ghToken = process.env.GH_TOKEN;
const axios = require('axios');
const JiraUtils = require('./jiraUtils');

const jira = new JiraUtils();

const decodeURI = (encodedString) => {
    console.log(encodedString);
    let decodedString = decodeURIComponent(encodedString);

    // strip 'payload=' from the front of the object
    // this step is required in order to correctly match
    // the url-encoded github webhook payload
    if (decodedString.slice(0, 20).includes('=')) {
        decodedString = decodedString.replace('payload=', '');
    }

    return JSON.parse(decodedString);
}

const includesJiraIssueCheck = async (pullRequestBody) => {
    const url = pullRequestBody.statuses_url;
    await pendingChecks(url, 'Jira Issue Link Check');

    
    const jiraKeys = jira.matchJiraIssues(pullRequestBody.body);
    let jiraIssues;

    if (jiraKeys && jiraKeys.length > 0) {
        jiraIssues = await Promise.all(jiraKeys.map(jira.getIssueByURL));
    } else {
        await postStatus(
            url,
            'Jira Issue Link Check',
            'error',
            'We couldn\'t find any Jira Issue Links in your pull request.',
        );

        return null;
    }

    console.log(`Found Jira Issue ${jiraKey}!`);

    if (jiraIssues.length === 0) {
        await postStatus(
            url,
            'Jira Issue Link Check',
            'error',
            'Your Jira Issue Link seems to be invalid.',
        );

        return null;
    } else {
        await postStatus(
            url,
            'Jira Issue Link Check',
            'success',
            'Found matching Jira issue(s).',
        );

        return jiraIssues;
    }
}

const lateMergeCheck = async (pullRequestBody, jiraIssues) => {
    const url = pullRequestBody.statuses_url;
    
    await pendingChecks(url, 'Late Merge Check');

    if (!jiraIssues) {
        return postStatus(
            url,
            'Late Merge Check',
            'error',
            'We need a valid Jira Issue Link to check for late merge approval',
        );
    } 
    
    if (jiraIssues.any(issue => issue.fields.labels.includes('late_merge_request'))) {
        let lateMerges = jiraIssues.filter(issue => issue.fields.labels.includes('late_merge_request'));
        let unapproved = lateMerges.filter(issue => !issue.fields.labels.includes('late_merge_approved'));

        if (unapproved.length > 0) {
            return postStatus(
                url,
                'Late Merge Check',
                'error',
                `${lateMerges.length} issues have not yet been approved for late merge.`,
            );
        } else {
            return postStatus(
                url,
                'Late Merge Check',
                'success',
                'Your late merges have been approved!',
            );
        }
    }

    return postStatus(
        url,
        'Late Merge Check',
        'success',
        'Not a late merge.',
    );
}

const pendingChecks = async (url, context) => {
    return postStatus(url, context, 'pending', 'Hang on while we check your commit!');
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
    console.log('Successfully created status!', {status, message});
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