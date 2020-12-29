import * as core from "@actions/core";
import * as github from "@actions/github";
import fs from 'fs';

type DeploymentState =
  | "error"
  | "failure"
  | "inactive"
  | "in_progress"
  | "queued"
  | "pending"
  | "success";

async function run() {
  try {
    const context = github.context;
    const defaultUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/commit/${context.sha}/checks`;
console.log(context)
    const payloadStr = JSON.stringify(context.payload, undefined, 2)
    const payload = JSON.parse(payloadStr)

    const token = fs.readFileSync('/home/runner/.gittoken','utf8').replace("\n", "");
    const url = core.getInput("target_url", { required: false }) || defaultUrl;
    const description = core.getInput("description", { required: false }) || "";
    const environmentUrl =
      core.getInput("environment_url", { required: false }) || "";
    const state = core.getInput("state") as DeploymentState;

    const client = new github.GitHub(token, { previews: ["flash", "ant-man"] });

    await client.repos.createDeploymentStatus({
      ...context.repo,
      deployment_id: parseInt(payload.deployment.id),
      state,
      log_url: defaultUrl,
      target_url: url,
      description,
      environment_url: environmentUrl,
    });
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
