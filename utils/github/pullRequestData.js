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
    
    console.log(ghToken);
    return res.data;
}

module.exports = {
    decodeURI,
    getPullRequestFromIssue
}