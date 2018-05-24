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

const handleLateMerge = (pullRequestBody) => {

}

// change status for a commit or pull request
// pull request statuses can be referenced by the branch head commit SHA
const changeStatus = async (headSHA, statusObj) => {

}

module.exports = {
    handleLateMerge,
    matchJiraIssue,
    changeStatus
}