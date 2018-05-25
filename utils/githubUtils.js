const octokit = require('@octokit/rest')();

octokit.authenticate({
    type: 'token',
    token: process.env.GH_TOKEN
  });

// GH responses are paginated (100 max per page)
// if necessary, get each page and concat all
const paginate = async (method) => {
    let response = await method({per_page: 100});
    let {data} = response;
    while (octokit.hasNextPage(response)) {
        response = await octokit.getNextPage(response);
        data = data.concat(response.data);
    }
    return data;
}
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

const handleLateMerge = async (pullRequestBody, jiraIssue) => {
    const newState = {
        state: null,
        description: null,
        target_url: jiraIssue.self,
        context: "continuous-integration/jenkins"
    }

    if (jiraIssue.fields.labels.includes('late_merge_approved')) {
        newState.state = 'success';
        newState.description = 'Your late merge request was approved!';
    } else if (jiraIssue.fields.labels.includes('late_merge_request')) {
        newState.state = 'error';
        newState.description = 'Your late merge request has not yet been approved.';
    } else {
        // TODO: Should we add a status at all? Don't want to pollute our github output.
    }

    const options = {
        owner: pullRequestBody.repository.owner.login,
        repo: pullRequestBody.repository.name,
        sha: pullRequestBody.pull_request.head.sha,
        state: newState
    }

    return await octokit.createStatus(options)
        .then(() => {
            console.log('Status successfully changed!');
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports = {
    handleLateMerge,
    matchJiraIssue,
    decodeURI
}