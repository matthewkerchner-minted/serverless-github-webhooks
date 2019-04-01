const JiraUtils = require('./index.js');
const Jira = new JiraUtils();
const ALL_BUGS_FILTER_ID = 12503;
const IN_QA_FILTER_ID = 12504;
const THIS_WEEK = Jira.getDateCode();
// const LAST_WEEK = Number(THIS_WEEK) - 7;

updateInQA = async (prefix='') => {
    let jql = `status = "In QA" AND fixVersion in (release-${THIS_WEEK}) ORDER BY key DESC`;
    let name = prefix + `Weekly Release: 'IN QA'`;

    return Jira.editFilter(IN_QA_FILTER_ID, jql, name);
}   

updateAllBugs = async (prefix='') => {
    let jql = `type = Bug AND (affectedVersion in (release-${THIS_WEEK}) ` +
              `OR fixVersion in (release-${THIS_WEEK})) ORDER BY key ASC, issuetype DESC`;
    let name = prefix + `Weekly All Bugs`;

    return Jira.editFilter(ALL_BUGS_FILTER_ID, jql, name);
}

createInQA = async (prefix='') => {
    let jql = `status = "In QA" AND fixVersion in (release-${THIS_WEEK}) ORDER BY key DESC`;
    let name = prefix + `Weekly Release: 'IN QA'`;

    return Jira.createFilter(jql, name);
}   

createAllBugs = async (prefix='') => {
    let jql = `type = Bug AND (affectedVersion in (release-${THIS_WEEK}) ` +
              `OR fixVersion in (release-${THIS_WEEK})) ORDER BY key ASC, issuetype DESC`;
    let name = prefix + `Weekly All Bugs`;

    return Jira.createFilter(jql, name);
}

module.exports = {
    updateInQA,
    updateAllBugs,
    createInQA,
    createAllBugs
}