const JiraUtils = require('./index.js');

const Jira = new JiraUtils();
const APPROVALS_FILTER_ID = 12338;
const REQUESTS_FILTER_ID = 12337;
const ALL_ITEMS_FILTER_ID = 12339;

updateLateRequestFilter = async (prefix='') => {
    let jql = `fixVersion in (release-${Jira.getDateCode()}) AND labels in (late_merge_request) AND labels NOT in (late_merge_approved)`;
    let name = prefix + `Late Merge Requests for Release ${Jira.getDateMMDD()}`;

    return Jira.editFilter(REQUESTS_FILTER_ID, jql, name);
}   

updateLateApprovedFilter = async (prefix='') => {
    let jql = `fixVersion in (release-${Jira.getDateCode()}) AND labels in (late_merge_approved)`;
    let name = prefix + `Late Merge Approvals for Release ${Jira.getDateMMDD()}`;

    return Jira.editFilter(APPROVALS_FILTER_ID, jql, name);
}

updateReleaseItemFilter = async (prefix='') => {
    let jql = `fixVersion in (release-${Jira.getDateCode()})`;
    let name = prefix + `Issues in Release ${Jira.getDateMMDD()}`;

    return Jira.editFilter(ALL_ITEMS_FILTER_ID, jql, name);
}

createLateRequestFilter = async (prefix='') => {
    let jql = `fixVersion in (release-${Jira.getDateCode()}) AND labels in (late_merge_request) AND labels NOT in (late_merge_approved)`;
    let name = prefix + `Late Merge Requests for Release ${Jira.getDateMMDD()}`;

    return Jira.createFilter(jql, name);
}   

createLateApprovedFilter = async (prefix='') => {
    let jql = `fixVersion in (release-${Jira.getDateCode()}) AND labels in (late_merge_approved)`;
    let name = prefix + `Late Merge Approvals for Release ${Jira.getDateMMDD()}`;

    return Jira.createFilter(jql, name);
}

createReleaseItemFilter = async (prefix='') => {
    let jql = `fixVersion in (release-${Jira.getDateCode()}) AND labels in (late_merge_request)`;
    let name = prefix + `Issues in Release ${Jira.getDateMMDD()}`;

    return Jira.createFilter(jql, name);
}

module.exports = {
    updateLateApprovedFilter,
    updateLateRequestFilter,
    updateReleaseItemFilter,
    createLateApprovedFilter,
    createLateRequestFilter,
    createReleaseItemFilter
};
