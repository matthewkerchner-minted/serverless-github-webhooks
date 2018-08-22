const ghUtils = require('../../utils/githubUtils');
const JiraUtils = require('../../utils/jiraUtils');

module.exports.releaseBranches = async (event, context, callback) => {
    jiraUtils = new JiraUtils();
    let dateCode = jiraUtils.getDateCode();
    let appRendererBranch = 'app_renderer_release-' + dateCode;
    let monoBranch = 'release-' + dateCode;
    let puppetBranch = 'puppetrelease-' + dateCode;



    const response = {
        statusCode: 200,
        headers: { 'Content-Type': 'text/json' },
        body: 'Success!'
    };

    return callback(null, response);
};

jiraUtils = new JiraUtils();
let dateCode = jiraUtils.getDateCode();
let appRendererBranch = 'app_renderer_release-' + dateCode;
let monoBranch = 'release-' + dateCode;
let puppetBranch = 'puppetrelease-' + dateCode;
console.log(dateCode, appRendererBranch, monoBranch, puppetBranch);