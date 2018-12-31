const ghToken = process.env.GH_TOKEN;
const JiraUtils = require('./jira/index.js');
const axios = require('axios');
const jira = new JiraUtils();

// TODO: refactoring badly needed

const decodeURI = (encodedString) => {
    let decodedString = decodeURIComponent(encodedString);

    // strip 'payload=' from the front of the object
    // this step is required in order to correctly match
    // the url-encoded github webhook payload
    if (/payload=/.test(decodedString)) {
        decodedString = decodedString.replace('payload=', '');
    }

    return JSON.parse(decodedString);
}

const getPullRequestFromIssue = async (issue) => {
    const { url } = issue.pull_request;
    const res = await axios.get(
        url,
        { 
            headers: {
                Accept: 'application/vnd.github.v3+json',
                Authorization: `token ${ghToken}`,
            },
        }
    );

    return res.data;
}

const includesJiraIssueCheck = async (pullRequestBody) => {
    const url = pullRequestBody.statuses_url;
    await pendingChecks(url, 'Jira Issue Link Check');

    
    const jiraKeys = jira.matchJiraIssues(pullRequestBody.body);
    let jiraIssues;

    if (jiraKeys && jiraKeys.length > 0) {
        jiraIssues = await Promise.all(jiraKeys.map(key => jira.getIssueByURL(key)));
    } else {
        await postStatus(
            url,
            'Jira Issue Link Check',
            'error',
            'We couldn\'t find any Jira Issue Links in your pull request.',
        );

        return null;
    }

    console.log(`Found Jira Issues: ${jiraKeys}`);

    // bad requests return null, filter out nulls
    // jiraIssues = jiraIssues.filter(issue => issue !== null);

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
            `Found ${jiraIssues.length} matching Jira issue(s).`,
        );

        return jiraIssues;
    }
}

const lateMergeCheck = async (pullRequestBody, jiraIssues) => {
    const url = pullRequestBody.statuses_url;
    
    /*
        If the pull request is not targeting a release branch, we don't need to
        check for late merge tags and approvals.

        07/13/18: removed status check for non-release branches
                  to avoid clutter on GitHub
    */
    if (!pullRequestBody.base.label.includes('release')) {
        return null;
        // return postStatus(
            //     url,
            //     'Late Merge Check',
            //     'Not a release branch, ignoring late merge tags.',
        //     'success',
        // );
    }

    await pendingChecks(url, 'Late Merge Check');

    if (!jiraIssues) {
        return postStatus(
            url,
            'Late Merge Check',
            'error',
            'We need a valid Jira Issue Link to check for late merge approval',
        );
    } 
    
    // If we find any late merge tags in the included Jira issues, check to make sure
    // that all of them have been approved.
    if (jiraIssues.some(issue => issue.fields.labels.includes('late_merge_request'))) {
        let lateMerges = jiraIssues.filter(issue => issue.fields.labels.includes('late_merge_request'));
        let unapproved = lateMerges.filter(issue => !issue.fields.labels.includes('late_merge_approved'));

        if (unapproved.length > 0) {
            return postStatus(
                url,
                'Late Merge Check',
                'error',
                `${unapproved.length} issues have not yet been approved for late merge.`,
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

    // If the PR is targeting the release branch, includes Jira issue links, and
    // does NOT have any late merge tags associated, we need to block the issue and ask
    // the dev to associate it with a late merge tag.
    return postStatus(
        url,
        'Late Merge Check',
        'error',
        'Please add the late_merge_request tag to your JIRA ticket.',
    );
}

const pendingChecks = async (url, context) => {
    // Post 'in progress' status to github. Should be overwritten almost immediately by success/failure status checks.
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
    console.log('Successfully created status!', {status, message, context});
  }).catch(err => {
      console.log(err);
  });
};

module.exports = {
    decodeURI,
    postStatus,
    lateMergeCheck,
    includesJiraIssueCheck,
    getPullRequestFromIssue
}