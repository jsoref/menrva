const axios = require("axios");

// Need owner of repo and the repo name

// When we receive the webhook for the check_suite, pull out the HEAD SHA attribute and then POST to the github check runs api with the owner and the repo name.

// Payload is {"name" : (name), "head_sha": head_sha, "status": "in-progress", "started_at": (TIME)}.
// Then we run our checks and then report back to GitHub on the status?
// Use the PATCH /repos/:owner/:repo/check-runs/:check_run_id with the check_run_id and change status to completed? {"conclusion": ("success"|"failure"), "completed_at": (TIME)}

// https://developer.github.com/v3/checks/runs/
// https://developer.github.com/v3/checks/suites/

module.exports = async function endGithubCHeck(checkRunId, fullName, didPass) {
  const baseUrl = "https://api.github.com";
  const patchPath = `${baseUrl}/repos/${fullName}/check-runs/${checkRunId}`;
  const updateNow = new Date();
  return await axios.patch(patchPath, {
    conclusion: didPass ? "success" : "failure",
    completed_at: updateNow.toISOString(),
  });
};
