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

async function changePRStatus (id) {
    
}

module.exports.matchJiraIssue = function (string) {
    const regex = /[A-Z]{2,4}-[0-9]{2,5}/g; // TODO: better matching for issue numbers
    const jiraKey = string ? string.match(regex)[0] : null;

    return jiraKey;
}