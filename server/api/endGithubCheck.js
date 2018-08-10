const axios = require("axios");

// Need owner of repo and the repo name

// When we receive the webhook for the check_suite, pull out the HEAD SHA attribute and then POST to the github check runs api with the owner and the repo name.

// Payload is {"name" : (name), "head_sha": head_sha, "status": "in-progress", "started_at": (TIME)}.
// Then we run our checks and then report back to GitHub on the status?
// Use the PATCH /repos/:owner/:repo/check-runs/:check_run_id with the check_run_id and change status to completed? {"conclusion": ("success"|"failure"), "completed_at": (TIME)}

// https://developer.github.com/v3/checks/runs/
// https://developer.github.com/v3/checks/suites/

module.exports = async function endGithubCheck(
  checkRunId,
  fullName,
  didPass,
  checkRun
) {
  const baseUrl = "https://api.github.com";
  const patchPath = `${baseUrl}/repos/${fullName}/check-runs/${checkRunId}`;
  const updateNow = new Date();
  return await axios.patch(patchPath, {
    name: checkRun.name,
    started_at: checkRun.started_at,
    status: "completed",
    completed_at: updateNow.toISOString(),
    output: {
      title: "menrva report",
      summary: "There are 0 failures, 2 warnings, and 1 notices.",
      text: "There are some visual changes that need to be approved",
      annotations: [],
      images: [
        // {
        // "alt": "Super bananas",
        // "image_url": "http://example.com/images/42"
        // }
      ],
    },
  });
};
