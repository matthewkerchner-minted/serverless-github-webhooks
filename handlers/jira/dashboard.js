const release = require('../../utils/jira/release.js');
const qa = require('../../utils/jira/qa.js');
const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));

module.exports.jiraDashboardUpdate = async (event, context, callback) => {
  let errMsg;
  let response;
  let updates = [
    release.updateLateApprovedFilter(),
    release.updateLateRequestFilter(),
    release.updateReleaseItemFilter(),
    qa.updateAllBugs(),
    qa.updateInQA()
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
