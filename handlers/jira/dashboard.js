const JiraUtils = require('../../utils/jiraUtils');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));

module.exports.jiraDashboardUpdate = async (event, context, callback) => {
  const jira = new JiraUtils();
  let errMsg;
  let response;
  let updates = [
    jira.updateLateApprovedFilter(),
    jira.updateLateRequestFilter(),
    jira.updateReleaseItemFilter()
  ];

  await Promise.all(updates)
    .catch(err => {
      errMsg = err;
      console.log(err);
    });

  if (errMsg) {
    response = {
      statusCode: 500,
      headers: { 'Content-Type': 'text/json' },
      body: {
        error: errMsg
      }
    };
  } else {
    response = {
      statusCode: 200,
      headers: { 'Content-Type': 'text/json' },
      body: 'Success!'
    };
  }

  return callback(null, response);
};
