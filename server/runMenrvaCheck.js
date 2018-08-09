// Need owner of repo and the repo name

// When we receive the webhook for the check_suite, pull out the HEAD SHA attribute and then POST to the github check runs api with the owner and the repo name.

// Payload is {"name" : (name), "head_sha": head_sha, "status": "in-progress", "started_at": (TIME)}.
// Then we run our checks and then report back to GitHub on the status?
// Use the PATCH /repos/:owner/:repo/check-runs/:check_run_id with the check_run_id and change status to completed? {"conclusion": ("success"|"failure"), "completed_at": (TIME)}

// https://developer.github.com/v3/checks/runs/
// https://developer.github.com/v3/checks/suites/

module.exports = async function runMenrvaCheck(checkSuite) {
  const axios = require("axios");
  const baseURL = "https://api.github.com";
  //  To access the API during the preview period, you must provide a custom media type in the Accept header:
  //   const mediaType = 'application/vnd.github.antiope-preview+json'

  // Webhook containing check suite is received
  const headSha = checkSuite.head_sha;
  const fullName = checkSuite.full_name;
  const postPath = baseURL + "/repos/" + fullName + "/check-runs";
  const now = new Date();

  // Send a post request to github API to say a check is running
  const response = await axios.post(
    postPath,
    {
      name: "Menrva Check",
      head_sha: headSha, //Need the head_sha from the webhook of check_suite
      status: "in-progress",
      started_at: now.toISOString(),
    },
    {
      headers: {
        mediaType: "application/vnd.github.antiope-preview+json",
      },
    }
  );
  // Call the Menrva code check: const menResp = await Menrva function
  // menResp.then(PATCH) TODO: ask Billy how to wait for the response
  const checkRunID = response.id;
  const patchPath = postPath + checkRunID;
  const updateNow = new Date();
  await axios.patch(patchPath, {
    conclusion: "success", // or failure, depending on the test results
    completed_at: updateNow.toISOString(),
  });
};
