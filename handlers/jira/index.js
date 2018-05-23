const utils = require('../../utils/jiraUtils.js');

module.exports.getIssue = async (event, context, callback) => {
    // how should the event payload be structured?
    if (typeof event === 'string') {
        console.log(event);
        event = JSON.parse(event);
    }

    const key = event.body.key;
    const issue = await utils.getIssue(key);
    const data = {
        statusCode: 200,
        body: issue
    }

    return data;
}