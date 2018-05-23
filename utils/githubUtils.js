const octokit = require('@octokit/rest')();

octokit.authenticate({
    type: 'token',
    token: process.env.GH_TOKEN
  });

async function paginate (method) {
    let response = await method({per_page: 100});
    let {data} = response;
    while (octokit.hasNextPage(response)) {
        response = await octokit.getNextPage(response);
        data = data.concat(response.data);
    }
    return data;
}

module.exports.matchJiraIssue = function (string) {
    const regex = /[A-Z]{2,4}-[0-9]{2,5}/g; // TODO: better matching for issue numbers
    const pullRequest = payload.pull_request;
    const jiraKey = pullRequest.body ? pullRequest.body.match(regex)[0] : null;
}