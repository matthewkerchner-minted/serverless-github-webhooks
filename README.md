# Serverless Github Webhook Listener

## Overview

This project is meant as an example to show how we can use the Serverless Framework to deploy lambdas which watch for Github Webhooks and dispatch API calls to appropriate services.

## Setup

Clone the repo and `npm install`.

If you take a look at the `serverless.yml` file, you'll notice several environment variables. For now, you'll need to set those env variables locally before deployment.

TODO: Use AWS SSM for secret management.

- GITHUB_WEBHOOK_SECRET
    - **required**
    - The webhook secret associated with your github repo that is dispatching events. Github will use this to sign request bodies, and the main handler in `handlers/github/index.js` will use this to verify those signatures.

- GH_TOKEN
    - A valid github personal access token. The `githubUtils.js` utility uses this token to authenticate calls to the Github API.

- JIRA_USER
    - A valid Minted Jira username. The `jiraUtils.js` utility uses this username to authenticate API calls to jira.mntd.net
- JIRA_PASS
    - The password for the above JIRA_USER. We will use this in conjunction with the username to authenticate API calls.
    - TODO: Authenticate via OAUTH.


## Serverless setup

Follow the [setup](https://serverless.com/framework/docs/providers/aws/guide/credentials/) instructions for Serverless with AWS. This repo by default will attempt to deploy our code as AWS lambdas to the us-east-1 region. This can be configured in the `serverless.yml` file.

Finally, run `serverless deploy`

## Github Webhook Setup

- Navigate to https://github/{username}/{repo}/settings/hooks and click "Add Webhook. The URL is the API Gateway endpoint that Serverless generated for you. You can view your endpoints by running `serverless info`.

- For now, use urlencoded requests. Static JSON requests are finnicky with the code to verify payload signatures.

- The secret can be anything, but it needs to match your `GITHUB_WEBHOOK_SECRET` that you defined in your local env.

- Select any events that you'd like to listen for. By default, the handler in this repo is only interested in push events.

## Test

This repo includes a sample github pull request in `test/urlEncodedRequest.json` which can be used to test the webhook listener lambda locally. For now, this is merely to show the shape of github webhook requests, and will likely fail at verifying the webhook signature. Replace the json with your own sample github webhook payload to test your own repos.

Local test:
`npm run ghlocaltest`

Live test:
`npm run ghlivetest`

Logs:
`npm run logs`



