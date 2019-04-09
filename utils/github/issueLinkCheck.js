const { pendingChecks, postStatus } = require('./postStatus');
const JiraUtils = require('../jira/index.js');
const jira = new JiraUtils();

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
            'We couldn\'t find any Jira Issue Links in your pull request. Example: [SRE-123](minted.atlassian.net/browse/SRE-123)',
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

module.exports = {
    includesJiraIssueCheck,
}