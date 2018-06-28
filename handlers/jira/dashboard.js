const JiraUtils = require('../../utils/jiraUtils');

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
