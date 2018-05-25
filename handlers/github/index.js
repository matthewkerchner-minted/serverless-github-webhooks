const crypto = require('crypto');
const ghUtils = require('../../utils/githubUtils');
const jiraUtils = require('../../utils/jiraUtils');

function signRequestBody(key, body) {
  return `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
}

module.exports.githubWebhookListener = async (event, context, callback) => {
  let errMsg;

  const token = process.env.GITHUB_WEBHOOK_SECRET;
  const calculatedSig = signRequestBody(token, event.body);
  console.log('Type of event.body', typeof event.body);
  console.log('\n-------BEGIN RAW EVENT------\n');
  console.log(event);
  console.log('\n--------END RAW EVENT------\n');
  event.body = ghUtils.decodeURI(event.body);

  console.log(event.body);
  const headers = event.headers;
  const sig = headers['X-Hub-Signature'];
  const githubEvent = headers['X-GitHub-Event'];
  const id = headers['X-GitHub-Delivery'];


  if (typeof token !== 'string') {
    errMsg = 'Must provide a \'GITHUB_WEBHOOK_SECRET\' env variable';
    return callback(null, {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    });
  }

  if (!sig) {
    errMsg = 'No X-Hub-Signature found on request';
    return callback(null, {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    });
  }

  if (!githubEvent) {
    errMsg = 'No X-Github-Event found on request';
    return callback(null, {
      statusCode: 422,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    });
  }

  if (!id) {
    errMsg = 'No X-Github-Delivery found on request';
    return callback(null, {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    });
  }

  if (sig !== calculatedSig) {
    errMsg = 'X-Hub-Signature incorrect. Github webhook token doesn\'t match';
    return callback(null, {
      statusCode: 401,
      headers: { 'Content-Type': 'text/plain' },
      body: errMsg,
    });
  }

  console.log('---------------------------------');
  console.log(`Github-Event: "${githubEvent}" with action: "${event.body.action}"`);
  console.log('---------------------------------');

  const { action } = event.body;
  const jiraKey = ghUtils.matchJiraIssue(event.body.pull_request.body);

  console.log(jiraKey);


  if (action === 'opened' || action === "reopened") {
    if (!jiraKey) {
        errMsg = "We couldn't find a valid Jira Issue ID in your pull request.";
        return callback(null, {
            statusCode: 401,
            headers: { 'Content-Type': 'text/plain' },
            body: errMsg,
          });
        
    }

    console.log(`Found Jira Issue ${jiraKey}!`);
    const jiraIssue = await jiraUtils.getIssue(jiraKey);

    if (!jiraIssue) {
        errMsg = "We couldn't find a Jira issue that matched the ID in your pull request.";
        return callback(null, {
            statusCode: 401,
            headers: { 'Content-Type': 'text/plain' },
            body: errMsg,
          });
    }

    const labels = jiraIssue.fields.labels || [];

    if (jiraIssue.fields.labels.includes('late_merge_request')) {
        if (!jiraIssue.fields.labels.includes('late_merge_approved')) {
            errMsg = "Your late merge request has not yet been approved";
            return callback(null, {
                statusCode: 200,
                headers: { 'Content-Type': 'text/plain' },
                body: errMsg,
                });
        } else {

        }
    }

    console.log(jiraIssue.fields.labels);
    const response = {
        statusCode: 200,
        headers: { 'Content-Type': 'text/json' },
        body: { 
            input: event,
            data: jiraIssue
        }
      };
    
    return callback(null, response);
  }
};
