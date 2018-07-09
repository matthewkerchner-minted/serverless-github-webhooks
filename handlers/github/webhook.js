const crypto = require('crypto');
const ghUtils = require('../../utils/githubUtils');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));

function signRequestBody(key, body) {
  return `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
}

module.exports.githubWebhookListener = async (event, context, callback) => {
  let errMsg;
  
  const token = process.env.GITHUB_WEBHOOK_SECRET;
  const calculatedSig = signRequestBody(token, event.body);
  event.body = ghUtils.decodeURI(event.body);
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
  const pr = event.body.pull_request;
  const jiraIssue = await ghUtils.includesJiraIssueCheck(pr);
  await ghUtils.lateMergeCheck(pr, jiraIssue);

  const response = {
    statusCode: 200,
    headers: { 'Content-Type': 'text/json' },
    body: 'Success!'
  };

  return callback(null, response);
};
