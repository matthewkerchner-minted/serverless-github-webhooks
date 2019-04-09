const { pendingChecks, postStatus } = require('./postStatus');

const lateMergeCheck = async (pullRequestBody, jiraIssues) => {
    const url = pullRequestBody.statuses_url;

    if (!pullRequestBody.base.label.includes('release')) {
        return null;
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
            let unapproved_keys = unapproved.map(issue => issue.key);
            return postStatus(
                url,
                'Late Merge Check',
                'error',
                `${unapproved.length} issues have not yet been approved for late merge. ${unapproved_keys}`,
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
        'error',
        'Please add the late_merge_request tag to your JIRA ticket.',
    );
}

module.exports = {
    lateMergeCheck,
}