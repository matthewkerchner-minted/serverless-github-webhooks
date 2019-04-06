const axios = require('axios');
const ghToken = process.env.GH_TOKEN;

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
    pendingChecks,
    postStatus
}