const JiraUtils = require('./index.js');

const Jira = new JiraUtils();
const APPROVALS_FILTER_ID = 12338;
const REQUESTS_FILTER_ID = 12337;
const ALL_ITEMS_FILTER_ID = 12339;
const IN_PROGRESS_FILTER_ID = 12623;

updateLateRequestFilter = async (prefix='') => {
    let jql = `fixVersion in (release-${Jira.getDateCode()}) AND labels in (late_merge_request) AND labels NOT in (late_merge_approved)`;
    let name = prefix + `Late Merge Requests for Release ${Jira.getDateMMDD()}`;
    console.log('-------');
    console.log('Filter ID: ' + REQUESTS_FILTER_ID);
    console.log('Filter name: ' + name);
    console.log('Filter JQL: ' + jql);
    console.log('-------');
    return Jira.editFilter(REQUESTS_FILTER_ID, jql, name);
}   

updateLateApprovedFilter = async (prefix='') => {
    let jql = `fixVersion in (release-${Jira.getDateCode()}) AND labels in (late_merge_approved)`;
    let name = prefix + `Late Merge Approvals for Release ${Jira.getDateMMDD()}`;
    console.log('-------');
    console.log('Filter ID: ' + APPROVALS_FILTER_ID);
    console.log('Filter name: ' + name);
    console.log('Filter JQL: ' + jql);
    console.log('-------');
    return Jira.editFilter(APPROVALS_FILTER_ID, jql, name);
}

updateReleaseItemFilter = async (prefix='') => {
    let jql = `fixVersion in (release-${Jira.getDateCode()})`;
    let name = prefix + `Issues in Release ${Jira.getDateMMDD()}`;
    console.log('-------');
    console.log('Filter ID: ' + ALL_ITEMS_FILTER_ID);
    console.log('Filter name: ' + name);
    console.log('Filter JQL: ' + jql);
    console.log('-------');
    return Jira.editFilter(ALL_ITEMS_FILTER_ID, jql, name);
}

updateInProgressFilter = async (prefix='') => {
    let jql = `fixVersion in (release-${Jira.getDateCode()}) AND labels in (late_merge_approved) AND status in (open, Reopened, "In Progress", "In Code Review")`;
    let name = prefix + `Late Merges In Progress ${Jira.getDateMMDD()}`;
    console.log('-------');
    console.log('Filter ID: ' + IN_PROGRESS_FILTER_ID);
    console.log('Filter name: ' + name);
    console.log('Filter JQL: ' + jql);
    console.log('-------');
    return Jira.editFilter(IN_PROGRESS_FILTER_ID, jql, name);
}

module.exports = {
    updateLateApprovedFilter,
    updateLateRequestFilter,
    updateReleaseItemFilter,
    updateInProgressFilter
};
